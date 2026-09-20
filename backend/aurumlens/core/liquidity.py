import numpy as np
import pandas as pd

TIERS = ["VERY_LOW", "LOW", "MEDIUM", "HIGH"]

def evaluate_contract_liquidity(vol: float, oi: float, past_vols: np.ndarray = None, past_ois: np.ndarray = None) -> dict:
    """
    Evaluates liquidity confidence tier based strictly on historical observations.
    Volume == 0 => VERY_LOW immediately.
    """
    if vol <= 0:
        return {
            "tier": "VERY_LOW",
            "score": 0.0,
            "vol": float(vol),
            "oi": float(oi),
            "reason": "Zero trading volume recorded (settlement not an executable fill)"
        }

    # If past history is available, compute percentile rank
    vol_pct = 50.0
    oi_pct = 50.0
    if past_vols is not None and len(past_vols) > 5:
        valid_v = past_vols[past_vols > 0]
        if len(valid_v) > 0:
            vol_pct = float(np.mean(valid_v <= vol) * 100.0)

    if past_ois is not None and len(past_ois) > 5:
        valid_o = past_ois[past_ois > 0]
        if len(valid_o) > 0:
            oi_pct = float(np.mean(valid_o <= oi) * 100.0)

    combined_score = 0.6 * vol_pct + 0.4 * oi_pct

    if combined_score >= 65:
        tier = "HIGH"
    elif combined_score >= 35:
        tier = "MEDIUM"
    elif combined_score >= 10:
        tier = "LOW"
    else:
        tier = "VERY_LOW"

    return {
        "tier": tier,
        "score": round(combined_score, 1),
        "vol": float(vol),
        "oi": float(oi),
        "vol_percentile": round(vol_pct, 1),
        "oi_percentile": round(oi_pct, 1),
        "disclaimer": "EOD liquidity proxy — not real order-book depth."
    }

def pair_liquidity(liq_a: dict, liq_b: dict) -> dict:
    """Pair liquidity is governed by the weaker leg."""
    order = {"VERY_LOW": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3}
    tier_a = liq_a.get("tier", "VERY_LOW")
    tier_b = liq_b.get("tier", "VERY_LOW")

    weakest = tier_a if order[tier_a] <= order[tier_b] else tier_b
    return {
        "tier": weakest,
        "leg_a_tier": tier_a,
        "leg_b_tier": tier_b,
        "disclaimer": "EOD liquidity proxy — not real order-book depth."
    }
