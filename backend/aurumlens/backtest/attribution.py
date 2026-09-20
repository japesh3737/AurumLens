import pandas as pd
import numpy as np

def compute_daily_attribution(
    open_positions: list[dict],
    today_data: pd.DataFrame,
    yesterday_data: pd.DataFrame
) -> dict:
    """
    Decomposes position P&L into Relative Value vs Directional Gold Drift:
      total_pnl = Σ q_i * lot_factor_i * (P_i,t - P_i,t-1)
      directional_pnl = net_pure_gold_grams * Δ(reference_gold_price_per_gram)
      relative_value_pnl = total_pnl - directional_pnl
    """
    total_gross = 0.0
    total_directional = 0.0

    # Calculate average normalized gold price as the market benchmark reference
    ref_today = today_data["norm"].mean() / 10.0 if not today_data.empty else 0.0
    ref_yesterday = yesterday_data["norm"].mean() / 10.0 if not yesterday_data.empty else ref_today
    d_ref_gold = ref_today - ref_yesterday

    for pos in open_positions:
        # Leg A
        cid_a = pos["cid_a"]
        q_a = pos["lots_a"] * pos["dir_a"]  # signed lots (+1 long, -1 short)
        factor_a = pos["lot_factor_a"]
        gold_g_a = pos["pure_gold_g_a"] * pos["dir_a"]

        row_a_today = today_data[today_data["contract_id"] == cid_a]
        row_a_yest = yesterday_data[yesterday_data["contract_id"] == cid_a]

        # Leg B
        cid_b = pos["cid_b"]
        q_b = pos["lots_b"] * pos["dir_b"]
        factor_b = pos["lot_factor_b"]
        gold_g_b = pos["pure_gold_g_b"] * pos["dir_b"]

        row_b_today = today_data[today_data["contract_id"] == cid_b]
        row_b_yest = yesterday_data[yesterday_data["contract_id"] == cid_b]

        if not row_a_today.empty and not row_a_yest.empty and not row_b_today.empty and not row_b_yest.empty:
            dp_a = float(row_a_today["close"].iloc[0] - row_a_yest["close"].iloc[0])
            dp_b = float(row_b_today["close"].iloc[0] - row_b_yest["close"].iloc[0])

            pnl_a = q_a * factor_a * dp_a
            pnl_b = q_b * factor_b * dp_b
            pos_gross = pnl_a + pnl_b
            total_gross += pos_gross

            net_gold_g = gold_g_a + gold_g_b
            dir_pnl = net_gold_g * d_ref_gold
            total_directional += dir_pnl

    relative_val = total_gross - total_directional

    return {
        "gross_pnl": round(total_gross, 2),
        "directional_pnl": round(total_directional, 2),
        "relative_value_pnl": round(relative_val, 2),
        "ref_gold_per_g": round(ref_today, 2),
        "d_ref_gold_per_g": round(d_ref_gold, 2),
    }
