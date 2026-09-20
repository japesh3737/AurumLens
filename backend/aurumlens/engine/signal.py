import numpy as np
import pandas as pd
from aurumlens.core.curve import fit_curve, leave_one_out_residuals
from aurumlens.core.liquidity import evaluate_contract_liquidity, pair_liquidity
from aurumlens.engine.spreads import select_pair_legs, compute_pair_spread, PAIRS, pair_name
from aurumlens.engine.stats import robust_z
from aurumlens.engine.hedge import compute_hedge_ratio
from aurumlens.engine.gates import evaluate_all_gates
from aurumlens.backtest.costs import compute_roundtrip_costs

def process_day_signals(
    day_df: pd.DataFrame,
    history_df: pd.DataFrame,
    params: dict = None
) -> dict:
    """
    Computes all analytics and signals for a single trading day t.
    STRICT NO LOOK-AHEAD:
    - day_df contains observations at date == t.
    - history_df contains observations strictly at date < t.
    """
    if params is None:
        params = {}

    entry_z = float(params.get("entry_z", 2.5))
    watch_z = float(params.get("watch_z", 1.5))
    exit_z = float(params.get("exit_z", 0.5))
    min_history = int(params.get("min_history", 20))
    min_pair_tier = params.get("min_pair_tier", "MEDIUM")
    brokerage_bps = float(params.get("brokerage_bps", 1.0))
    slippage_bps = float(params.get("slippage_bps", 1.0))

    current_date = day_df["date"].iloc[0] if not day_df.empty else None

    # 1. Fit cross-sectional futures curve on date t
    curve_fit = fit_curve(day_df)
    loo_res = leave_one_out_residuals(day_df)
    day_df = day_df.copy()
    day_df["residual"] = loo_res

    curve_info = curve_fit.to_dict() if curve_fit else {
        "coefficients": [], "degree": 0, "quality": "failed", "r2": 0.0,
        "annualized_carry": 0.0, "classification": "FLAT / MIXED", "status_msg": "Curve fit failed"
    }

    # 2. Evaluate contract-level liquidity with past history
    contract_liquidity = {}
    for idx, row in day_df.iterrows():
        cid = row["contract_id"]
        past_c = history_df[history_df["contract_id"] == cid] if not history_df.empty else pd.DataFrame()
        past_v = past_c["volume"].to_numpy() if not past_c.empty else None
        past_o = past_c["open_interest"].to_numpy() if not past_c.empty else None
        liq = evaluate_contract_liquidity(row["volume"], row["open_interest"], past_v, past_o)
        contract_liquidity[cid] = liq

    # 3. Evaluate all 6 pairs
    pair_results = {}
    active_signals_count = 0

    for sym_a, sym_b in PAIRS:
        p_name = pair_name(sym_a, sym_b)
        leg_a, leg_b = select_pair_legs(day_df, sym_a, sym_b)

        if not leg_a or not leg_b:
            pair_results[p_name] = {
                "pair": p_name,
                "status": "NORMAL",
                "radar_state": "NORMAL",
                "verdict": "NO SIGNAL",
                "headline_reason": "NO SIGNAL — Missing active or tradable contract legs",
                "gates": [],
                "spread": {},
                "z_score": None,
                "hedge": compute_hedge_ratio(sym_a, sym_b),
                "costs": {},
                "pair_liquidity": {"tier": "VERY_LOW"}
            }
            continue

        cid_a = leg_a["contract_id"]
        cid_b = leg_b["contract_id"]

        spread = compute_pair_spread(leg_a, leg_b, curve_fit)

        # Build past-only spread series for rolling z-score baseline
        # Historical spread strictly < t
        past_spreads = []
        if not history_df.empty:
            past_dates = sorted(history_df["date"].unique())
            for dt in past_dates:
                sub_day = history_df[history_df["date"] == dt]
                sub_a, sub_b = select_pair_legs(sub_day, sym_a, sym_b)
                if sub_a and sub_b and sub_a.get("norm", 0) > 0 and sub_b.get("norm", 0) > 0:
                    sp = compute_pair_spread(sub_a, sub_b, None)
                    past_spreads.append(sp.get("curve_adj_spread", 0.0))

        past_arr = np.array(past_spreads, dtype=float)
        curr_spread = spread.get("curve_adj_spread", 0.0)
        z, med, mad, obs_count = robust_z(curr_spread, past_arr, min_obs=10)

        # Theoretical gross edge in bps
        gross_edge_bps = 0.0
        if med is not None:
            # Distance back to median
            gross_edge_bps = abs(curr_spread - med) * 10000.0

        p_liq = pair_liquidity(
            contract_liquidity.get(cid_a, {"tier": "VERY_LOW"}),
            contract_liquidity.get(cid_b, {"tier": "VERY_LOW"})
        )

        costs = compute_roundtrip_costs(
            gross_edge_bps=gross_edge_bps,
            pair_tier=p_liq["tier"],
            brokerage_bps=brokerage_bps,
            base_slippage_bps=slippage_bps
        )

        hedge = compute_hedge_ratio(sym_a, sym_b)

        verdict, headline, gates = evaluate_all_gates(
            leg_a=leg_a,
            leg_b=leg_b,
            spread_data=spread,
            z_score=z,
            history_count=obs_count,
            curve_quality=curve_info["quality"],
            pair_liq=p_liq,
            cost_data=costs,
            hedge_data=hedge,
            entry_z=entry_z,
            min_history=min_history,
            min_pair_tier=min_pair_tier
        )

        # Radar status
        abs_z = abs(z) if z is not None else 0.0
        if verdict == "SIGNAL":
            radar_state = "POTENTIAL SIGNAL"
            active_signals_count += 1
        elif abs_z >= entry_z:
            radar_state = "ELEVATED"
        elif abs_z >= watch_z:
            radar_state = "WATCH"
        else:
            radar_state = "NORMAL"

        pair_results[p_name] = {
            "pair": p_name,
            "sym_a": sym_a,
            "sym_b": sym_b,
            "status": radar_state,
            "radar_state": radar_state,
            "verdict": verdict,
            "headline_reason": headline,
            "gates": gates,
            "spread": spread,
            "z_score": round(z, 2) if z is not None else None,
            "median": round(med, 6) if med is not None else None,
            "mad": round(mad, 6) if mad is not None else None,
            "obs_count": obs_count,
            "hedge": hedge,
            "costs": costs,
            "pair_liquidity": p_liq,
            "leg_a": leg_a,
            "leg_b": leg_b,
        }

    return {
        "date": current_date.strftime("%Y-%m-%d") if current_date else None,
        "curve": curve_info,
        "contract_liquidity": contract_liquidity,
        "pairs": pair_results,
        "active_signals_count": active_signals_count,
        "contracts_count": len(day_df),
        "traded_contracts_count": int(day_df["traded"].sum()) if not day_df.empty else 0
    }
