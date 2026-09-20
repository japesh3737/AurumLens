# Cost model with realistic friction assumptions
# NOTE: All figures are configurable assumptions.

def compute_roundtrip_costs(
    gross_edge_bps: float,
    pair_tier: str = "MEDIUM",
    brokerage_bps: float = 1.0,
    exchange_bps: float = 0.25,
    ctt_sell_side_bps: float = 1.0,
    gst_pct: float = 18.0,
    base_slippage_bps: float = 1.0,
    convergence_capture: float = 0.5
) -> dict:
    """
    Computes total roundtrip friction across both legs (4 transactions total: 2 entries, 2 exits).
    Includes tier-scaled slippage stress.
    Returns breakdown and net_edge_bps.
    """
    tier_multipliers = {
        "HIGH": 1.0,
        "MEDIUM": 1.5,
        "LOW": 3.0,
        "VERY_LOW": 10.0
    }
    multiplier = tier_multipliers.get(pair_tier, 2.0)

    # 2 legs * 2 turns = 4 leg-turns
    # Brokerage per leg-turn
    total_brokerage = brokerage_bps * 4.0

    # Exchange fees per leg-turn
    total_exchange = exchange_bps * 4.0

    # GST on charges (brokerage + exchange)
    total_gst = (total_brokerage + total_exchange) * (gst_pct / 100.0)

    # CTT applies on sell-side transactions (2 sell legs)
    total_ctt = ctt_sell_side_bps * 2.0

    # Slippage stress assumption scaled by liquidity tier
    total_slippage = base_slippage_bps * 4.0 * multiplier

    total_costs_bps = total_brokerage + total_exchange + total_gst + total_ctt + total_slippage

    # Conservative haircut on capturing theoretical gross edge
    haircut_edge = gross_edge_bps * convergence_capture
    net_edge_bps = haircut_edge - total_costs_bps

    return {
        "gross_edge_bps": round(gross_edge_bps, 2),
        "haircut_edge_bps": round(haircut_edge, 2),
        "brokerage_bps": round(total_brokerage, 2),
        "exchange_bps": round(total_exchange, 2),
        "gst_bps": round(total_gst, 2),
        "ctt_bps": round(total_ctt, 2),
        "slippage_bps": round(total_slippage, 2),
        "total_costs_bps": round(total_costs_bps, 2),
        "net_edge_bps": round(net_edge_bps, 2),
        "pair_tier": pair_tier,
        "tier_multiplier": multiplier,
        "convergence_capture": convergence_capture,
        "disclaimer": "Friction figures are configurable assumptions. Slippage is a stress test, not observed depth."
    }
