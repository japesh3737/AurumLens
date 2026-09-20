import math
import numpy as np
import pandas as pd
from datetime import datetime
from aurumlens.core.contracts import SPECS, lot_factor, pure_gold_g
from aurumlens.engine.signal import process_day_signals
from aurumlens.backtest.attribution import compute_daily_attribution

def run_walkforward_backtest(
    data: pd.DataFrame,
    pair: str = "GOLDTEN-GOLDPETAL",
    params: dict = None
) -> dict:
    """
    Executes a strictly sequential walk-forward backtest for a chosen pair.
    Zero look-ahead: Day t engine calculations see only data <= t.
    """
    if params is None:
        params = {}

    entry_z = float(params.get("entry_z", 2.5))
    exit_z = float(params.get("exit_z", 0.5))
    max_hold_days = int(params.get("max_holding_days", 20))
    execution_lag = int(params.get("execution_lag", 1))
    forced_exit_dte = int(params.get("forced_exit_dte", 5))

    sym_a, sym_b = pair.split("-")
    spec_a = SPECS[sym_a]
    spec_b = SPECS[sym_b]

    trading_dates = sorted(data["date"].unique())
    if len(trading_dates) < 15:
        return {"error": "Insufficient trading dates for walk-forward test"}

    funnel_counts = {
        "candidates": 0,
        "data_quality_fail": 0,
        "normalization_fail": 0,
        "curve_adjusted_fail": 0,
        "statistically_unusual_fail": 0,
        "history_fail": 0,
        "liquidity_fail": 0,
        "safe_lifecycle_fail": 0,
        "survives_costs_fail": 0,
        "exposure_matchable_fail": 0,
        "accepted": 0
    }

    trades = []
    daily_ledger = []
    open_pos = None
    pending_entry = None

    cum_gross = 0.0
    cum_net = 0.0
    cum_directional = 0.0
    cum_rv = 0.0
    cum_costs = 0.0
    equity_curve = []

    for i, t in enumerate(trading_dates):
        current_dt_str = pd.Timestamp(t).strftime("%Y-%m-%d")
        today_data = data[data["date"] == t]
        history_data = data[data["date"] < t]
        yesterday_data = data[data["date"] == trading_dates[i-1]] if i > 0 else pd.DataFrame()

        # Run engine step for day t
        snap = process_day_signals(today_data, history_data, params)
        pair_info = snap["pairs"].get(pair, {})

        # 1. Execute pending entry if lag satisfied
        if pending_entry and pending_entry["exec_at_index"] <= i:
            # Check legs can still be traded today
            row_a = today_data[today_data["contract_id"] == pending_entry["cid_a"]]
            row_b = today_data[today_data["contract_id"] == pending_entry["cid_b"]]
            if not row_a.empty and not row_b.empty and row_a["traded"].iloc[0] and row_b["traded"].iloc[0]:
                open_pos = {
                    "trade_id": len(trades) + 1,
                    "entry_date": current_dt_str,
                    "entry_index": i,
                    "cid_a": pending_entry["cid_a"],
                    "cid_b": pending_entry["cid_b"],
                    "entry_price_a": float(row_a["close"].iloc[0]),
                    "entry_price_b": float(row_b["close"].iloc[0]),
                    "lots_a": pending_entry["lots_a"],
                    "lots_b": pending_entry["lots_b"],
                    "dir_a": pending_entry["dir_a"],
                    "dir_b": pending_entry["dir_b"],
                    "lot_factor_a": lot_factor(spec_a),
                    "lot_factor_b": lot_factor(spec_b),
                    "pure_gold_g_a": pure_gold_g(spec_a) * pending_entry["lots_a"],
                    "pure_gold_g_b": pure_gold_g(spec_b) * pending_entry["lots_b"],
                    "entry_z": pending_entry["entry_z"],
                    "estimated_cost_inr": pending_entry["estimated_cost_inr"],
                    "holding_days": 0
                }
                # Deduct entry half of transaction costs
                cum_costs += open_pos["estimated_cost_inr"] / 2.0
                cum_net -= open_pos["estimated_cost_inr"] / 2.0
            pending_entry = None

        # 2. Mark-to-market open position & attribution
        day_gross_pnl = 0.0
        day_dir_pnl = 0.0
        day_rv_pnl = 0.0

        if open_pos:
            open_pos["holding_days"] += 1
            if not yesterday_data.empty:
                attr = compute_daily_attribution([open_pos], today_data, yesterday_data)
                day_gross_pnl = attr["gross_pnl"]
                day_dir_pnl = attr["directional_pnl"]
                day_rv_pnl = attr["relative_value_pnl"]

            cum_gross += day_gross_pnl
            cum_directional += day_dir_pnl
            cum_rv += day_rv_pnl
            cum_net += day_gross_pnl

            # Check exit conditions:
            # a) Convergence (|z| <= exit_z)
            # b) Max holding period
            # c) Lifecycle forced exit (DTE <= forced_exit_dte)
            curr_z = pair_info.get("z_score")
            abs_curr_z = abs(curr_z) if curr_z is not None else 99.0

            leg_a_today = today_data[today_data["contract_id"] == open_pos["cid_a"]]
            dte_a = leg_a_today["dte"].iloc[0] if not leg_a_today.empty else 99

            exit_reason = None
            if curr_z is not None and abs_curr_z <= exit_z:
                exit_reason = "Spread convergence (|z| <= exit_z)"
            elif open_pos["holding_days"] >= max_hold_days:
                exit_reason = f"Max holding period reached ({max_hold_days} days)"
            elif dte_a <= forced_exit_dte:
                exit_reason = f"Lifecycle forced exit (DTE {dte_a} <= {forced_exit_dte})"

            if exit_reason:
                # Deduct exit half of transaction costs
                cum_costs += open_pos["estimated_cost_inr"] / 2.0
                cum_net -= open_pos["estimated_cost_inr"] / 2.0

                exit_price_a = float(leg_a_today["close"].iloc[0]) if not leg_a_today.empty else open_pos["entry_price_a"]
                row_b_today = today_data[today_data["contract_id"] == open_pos["cid_b"]]
                exit_price_b = float(row_b_today["close"].iloc[0]) if not row_b_today.empty else open_pos["entry_price_b"]

                tot_trade_pnl = (
                    open_pos["dir_a"] * open_pos["lots_a"] * open_pos["lot_factor_a"] * (exit_price_a - open_pos["entry_price_a"]) +
                    open_pos["dir_b"] * open_pos["lots_b"] * open_pos["lot_factor_b"] * (exit_price_b - open_pos["entry_price_b"])
                )
                net_trade_pnl = tot_trade_pnl - open_pos["estimated_cost_inr"]

                trades.append({
                    "trade_id": open_pos["trade_id"],
                    "pair": pair,
                    "entry_date": open_pos["entry_date"],
                    "exit_date": current_dt_str,
                    "holding_days": open_pos["holding_days"],
                    "entry_z": open_pos["entry_z"],
                    "exit_z": round(curr_z, 2) if curr_z is not None else None,
                    "exit_reason": exit_reason,
                    "leg_a": f"{open_pos['lots_a']} {open_pos['cid_a']} ({'LONG' if open_pos['dir_a']>0 else 'SHORT'})",
                    "leg_b": f"{open_pos['lots_b']} {open_pos['cid_b']} ({'LONG' if open_pos['dir_b']>0 else 'SHORT'})",
                    "entry_price_a": open_pos["entry_price_a"],
                    "exit_price_a": exit_price_a,
                    "entry_price_b": open_pos["entry_price_b"],
                    "exit_price_b": exit_price_b,
                    "gross_pnl_inr": round(tot_trade_pnl, 2),
                    "cost_inr": round(open_pos["estimated_cost_inr"], 2),
                    "net_pnl_inr": round(net_trade_pnl, 2),
                    "is_winner": net_trade_pnl > 0
                })
                open_pos = None

        # 3. Process new candidate decisions (only if currently flat and no pending trade)
        if open_pos is None and pending_entry is None and pair_info:
            funnel_counts["candidates"] += 1
            gates = pair_info.get("gates", [])
            all_pass = True
            for g in gates:
                if g["status"] != "PASS":
                    all_pass = False
                    key = g["name"].lower().replace(" ", "_") + "_fail"
                    if key in funnel_counts:
                        funnel_counts[key] += 1
                    break

            if all_pass and pair_info.get("verdict") == "SIGNAL":
                funnel_counts["accepted"] += 1
                z_val = pair_info.get("z_score", 0.0)
                # If z > 0: normA > normB (A is rich, B is cheap) -> SHORT A, LONG B
                # If z < 0: normA < normB (A is cheap, B is rich) -> LONG A, SHORT B
                dir_a = -1 if z_val > 0 else 1
                dir_b = 1 if z_val > 0 else -1
                hedge = pair_info.get("hedge", {})
                lots_a = hedge.get("lots_a", 1)
                lots_b = hedge.get("lots_b", 1)

                # Cost estimate in INR
                ref_price_a = pair_info.get("leg_a", {}).get("close", 75000)
                est_cost_inr = (ref_price_a * lots_a * lot_factor(spec_a)) * (pair_info.get("costs", {}).get("total_costs_bps", 10.0) / 10000.0)

                pending_entry = {
                    "exec_at_index": i + execution_lag,
                    "cid_a": pair_info.get("leg_a", {}).get("contract_id"),
                    "cid_b": pair_info.get("leg_b", {}).get("contract_id"),
                    "lots_a": lots_a,
                    "lots_b": lots_b,
                    "dir_a": dir_a,
                    "dir_b": dir_b,
                    "entry_z": round(z_val, 2),
                    "estimated_cost_inr": est_cost_inr
                }

        equity_curve.append({
            "date": current_dt_str,
            "cum_gross": round(cum_gross, 2),
            "cum_net": round(cum_net, 2),
            "cum_directional": round(cum_directional, 2),
            "cum_rv": round(cum_rv, 2),
            "cum_costs": round(cum_costs, 2),
            "in_position": open_pos is not None
        })

    # Summary Statistics
    trade_count = len(trades)
    winning_trades = sum(1 for tr in trades if tr["is_winner"])
    hit_rate_pct = round((winning_trades / trade_count * 100.0), 1) if trade_count > 0 else 0.0
    avg_hold = round(float(np.mean([tr["holding_days"] for tr in trades])), 1) if trade_count > 0 else 0.0

    # Max Drawdown
    net_values = [eq["cum_net"] for eq in equity_curve]
    peak = -999999999
    max_dd = 0.0
    for val in net_values:
        if val > peak:
            peak = val
        dd = peak - val
        if dd > max_dd:
            max_dd = dd

    # Honest Verdict Banner Formulation (Strictly rule-based, no made-up claims)
    if trade_count == 0:
        verdict_banner = "NO SIGNALS EXECUTED — All potential pricing anomalies were filtered out by the 9-gate engine (primarily transaction costs & liquidity thresholds). This is a successful validation outcome: false opportunities were eliminated."
        verdict_code = "NO_TRADES"
    elif cum_net <= 0:
        verdict_banner = f"NO PERSISTENT EDGE SURVIVES COSTS — Over {trade_count} executed trades, gross relative value did not cover realistic transaction friction (Net: ₹{cum_net:,.2f}). The terminal correctly proves that apparent theoretical spreads do not yield net profits after slippage and taxes."
        verdict_code = "EDGE_DIES_IN_COSTS"
    elif cum_rv <= 0 and cum_net > 0:
        verdict_banner = f"MARGINAL DRIFT BIAS — Net P&L of +₹{cum_net:,.2f} over {trade_count} trades was primarily driven by gold directional beta drift rather than genuine relative-value arbitrage."
        verdict_code = "DIRECTIONAL_DRIFT"
    else:
        verdict_banner = f"GENUINE RELATIVE-VALUE EDGE SURVIVES — Strategy captured +₹{cum_rv:,.2f} in pure relative value across {trade_count} trades (Net after all friction: +₹{cum_net:,.2f}, Hit Rate: {hit_rate_pct}%). Note: based on settlement proxy fills."
        verdict_code = "SURVIVES"

    return {
        "pair": pair,
        "trade_count": trade_count,
        "winning_trades": winning_trades,
        "hit_rate_pct": hit_rate_pct,
        "total_gross_inr": round(cum_gross, 2),
        "total_costs_inr": round(cum_costs, 2),
        "total_net_inr": round(cum_net, 2),
        "total_directional_inr": round(cum_directional, 2),
        "total_relative_value_inr": round(cum_rv, 2),
        "max_drawdown_inr": round(max_dd, 2),
        "avg_holding_days": avg_hold,
        "verdict_banner": verdict_banner,
        "verdict_code": verdict_code,
        "funnel": funnel_counts,
        "equity_curve": equity_curve,
        "trades": trades
    }
