import numpy as np
import pandas as pd
from aurumlens.core.contracts import SPECS, normalize
from aurumlens.core.curve import CurveFitResult
from aurumlens.core.liquidity import evaluate_contract_liquidity, pair_liquidity
from aurumlens.engine.stats import robust_z
from aurumlens.engine.hedge import compute_hedge_ratio

PAIRS = [
    ("GOLDTEN", "GOLDPETAL"),
    ("GOLDGUINEA", "GOLDPETAL"),
    ("GOLDTEN", "GOLDGUINEA"),
    ("GOLDM", "GOLDTEN"),
    ("GOLDM", "GOLDGUINEA"),
    ("GOLDM", "GOLDPETAL"),
]

def pair_name(sym_a: str, sym_b: str) -> str:
    return f"{sym_a}-{sym_b}"

def select_pair_legs(day_df: pd.DataFrame, sym_a: str, sym_b: str, min_dte: int = 5) -> tuple[dict | None, dict | None]:
    """
    Selects optimal tradable leg contracts for symbols A and B on a specific date.
    Conditions:
      1. Leg has volume > 0 (actually traded)
      2. DTE >= min_dte (outside forced exit)
      3. Minimizes abs(DTE_a - DTE_b), then maximizes total volume
    """
    candidates_a = day_df[(day_df["symbol"] == sym_a) & (day_df["traded"]) & (day_df["dte"] >= min_dte)]
    candidates_b = day_df[(day_df["symbol"] == sym_b) & (day_df["traded"]) & (day_df["dte"] >= min_dte)]

    if candidates_a.empty or candidates_b.empty:
        # Fallback to any contract with dte >= 0 if traded not found, but marked untraded
        all_a = day_df[(day_df["symbol"] == sym_a) & (day_df["dte"] >= min_dte)]
        all_b = day_df[(day_df["symbol"] == sym_b) & (day_df["dte"] >= min_dte)]
        if all_a.empty or all_b.empty:
            return None, None
        leg_a = all_a.sort_values(by="volume", ascending=False).iloc[0].to_dict()
        leg_b = all_b.sort_values(by="volume", ascending=False).iloc[0].to_dict()
        return leg_a, leg_b

    best_pair = None
    min_gap = 999999
    max_vol = -1

    for _, ra in candidates_a.iterrows():
        for _, rb in candidates_b.iterrows():
            gap = abs(int(ra["dte"]) - int(rb["dte"]))
            tot_vol = float(ra["volume"]) + float(rb["volume"])
            if gap < min_gap or (gap == min_gap and tot_vol > max_vol):
                min_gap = gap
                max_vol = tot_vol
                best_pair = (ra.to_dict(), rb.to_dict())

    return best_pair

def compute_pair_spread(leg_a: dict, leg_b: dict, curve_fit: CurveFitResult | None) -> dict:
    """
    Calculates raw spread, normalized spread, log spread, and curve-adjusted spread.
    """
    if leg_a is None or leg_b is None:
        return {}

    norm_a = float(leg_a["norm"])
    norm_b = float(leg_b["norm"])
    dte_a = float(leg_a["dte"])
    dte_b = float(leg_b["dte"])

    norm_diff = norm_a - norm_b
    pct_spread = (norm_diff / norm_b) * 100.0 if norm_b > 0 else 0.0
    log_spread = np.log(norm_a) - np.log(norm_b) if norm_a > 0 and norm_b > 0 else 0.0

    curve_implied_spread = 0.0
    if curve_fit and curve_fit.quality in ("ok", "narrow-tenor"):
        pred_a = curve_fit.predict_log(dte_a)
        pred_b = curve_fit.predict_log(dte_b)
        curve_implied_spread = float(pred_a - pred_b)

    curve_adj_spread = log_spread - curve_implied_spread

    return {
        "norm_a": round(norm_a, 2),
        "norm_b": round(norm_b, 2),
        "norm_diff": round(norm_diff, 2),
        "pct_spread": round(pct_spread, 4),
        "log_spread": round(log_spread, 6),
        "curve_implied_spread": round(curve_implied_spread, 6),
        "curve_adj_spread": round(curve_adj_spread, 6),
        "expiry_gap_days": int(dte_a - dte_b),
        "leg_a_cid": leg_a["contract_id"],
        "leg_b_cid": leg_b["contract_id"],
        "leg_a_dte": int(dte_a),
        "leg_b_dte": int(dte_b),
    }
