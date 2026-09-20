import numpy as np

GATE_NAMES = [
    "Data Quality",
    "Basis Normalized",
    "Curve Adjusted",
    "Statistically Unusual",
    "Sufficient History",
    "Liquidity Proxy",
    "Safe Lifecycle",
    "Survives Costs",
    "Exposure Matchable"
]

def evaluate_all_gates(
    leg_a: dict,
    leg_b: dict,
    spread_data: dict,
    z_score: float | None,
    history_count: int,
    curve_quality: str,
    pair_liq: dict,
    cost_data: dict,
    hedge_data: dict,
    entry_z: float = 2.5,
    min_history: int = 20,
    min_pair_tier: str = "MEDIUM",
    restricted_entry_dte: int = 10,
    forced_exit_dte: int = 5,
    min_net_edge_bps: float = 1.0,
    max_mismatch_pct: float = 0.5,
) -> tuple[str, str, list[dict]]:
    """
    Evaluates the 9 sequential gates.
    Returns (verdict, headline_reason, list_of_gate_results).
    verdict: "SIGNAL" or "NO SIGNAL".
    """
    gates = []

    # 1. DATA QUALITY
    g1_pass = bool(leg_a and leg_b and leg_a.get("traded", False) and leg_b.get("traded", False))
    gates.append({
        "id": 1,
        "name": "Data Quality",
        "status": "PASS" if g1_pass else "FAIL",
        "value": f"Traded: {leg_a.get('traded', False)}/{leg_b.get('traded', False)}",
        "threshold": "Both legs traded",
        "message": "Both contract legs observed with valid exchange trades" if g1_pass else "Contract leg has zero traded volume; settlement is non-executable"
    })

    # 2. BASIS NORMALIZED
    g2_pass = bool(spread_data and "norm_diff" in spread_data and spread_data["norm_a"] > 0 and spread_data["norm_b"] > 0)
    gates.append({
        "id": 2,
        "name": "Basis Normalized",
        "status": "PASS" if g2_pass else "FAIL",
        "value": f"Diff: ₹{spread_data.get('norm_diff', 0):.2f}/10g" if g2_pass else "N/A",
        "threshold": "₹ / 10 g / 999 purity basis",
        "message": "Quoted prices successfully scaled to institutional pure-gold basis" if g2_pass else "Normalization failed"
    })

    # 3. CURVE ADJUSTED
    g3_pass = curve_quality in ("ok", "narrow-tenor")
    gates.append({
        "id": 3,
        "name": "Curve Adjusted",
        "status": "PASS" if g3_pass else "FAIL",
        "value": f"Quality: {curve_quality}",
        "threshold": "Valid fair curve fit",
        "message": "Term-structure carry subtracted; residual isolates genuine relative difference" if g3_pass else "Futures curve fit ill-conditioned or insufficient points"
    })

    # 4. STATISTICALLY UNUSUAL
    abs_z = abs(z_score) if z_score is not None else 0.0
    g4_pass = bool(z_score is not None and abs_z >= entry_z)
    gates.append({
        "id": 4,
        "name": "Statistically Unusual",
        "status": "PASS" if g4_pass else "FAIL",
        "value": f"|z| = {abs_z:.2f}",
        "threshold": f"|z| >= {entry_z:.2f}",
        "message": f"Spread deviation (|z|={abs_z:.2f}) exceeds significance threshold ({entry_z:.2f})" if g4_pass else f"Deviation (|z|={abs_z:.2f}) within normal historical baseline noise"
    })

    # 5. SUFFICIENT HISTORY
    # Shorter history allowed if pair contains GOLDTEN (listed 2025)
    sym_a = leg_a.get("symbol", "") if leg_a else ""
    sym_b = leg_b.get("symbol", "") if leg_b else ""
    is_goldten = (sym_a == "GOLDTEN" or sym_b == "GOLDTEN")
    effective_min_hist = min_history // 2 if is_goldten else min_history
    g5_pass = history_count >= effective_min_hist
    gates.append({
        "id": 5,
        "name": "Sufficient History",
        "status": "PASS" if g5_pass else "FAIL",
        "value": f"{history_count} days",
        "threshold": f">= {effective_min_hist} days" + (" (GOLDTEN listed 2025)" if is_goldten else ""),
        "message": f"Historical baseline depth sufficient ({history_count} trading days)" if g5_pass else f"Insufficient historical observations ({history_count} < {effective_min_hist})" + (" - GOLDTEN newly listed" if is_goldten else "")
    })

    # 6. LIQUIDITY PROXY
    tier_order = {"VERY_LOW": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3}
    pair_tier = pair_liq.get("tier", "VERY_LOW")
    required_rank = tier_order.get(min_pair_tier, 2)
    current_rank = tier_order.get(pair_tier, 0)
    g6_pass = current_rank >= required_rank
    gates.append({
        "id": 6,
        "name": "Liquidity Proxy",
        "status": "PASS" if g6_pass else "FAIL",
        "value": f"Tier: {pair_tier}",
        "threshold": f">= {min_pair_tier}",
        "message": f"Both legs satisfy liquidity threshold ({pair_tier})" if g6_pass else f"Insufficient liquidity: weaker leg is rated {pair_tier}"
    })

    # 7. SAFE LIFECYCLE
    dte_a = leg_a.get("dte", 0) if leg_a else 0
    dte_b = leg_b.get("dte", 0) if leg_b else 0
    min_dte = min(dte_a, dte_b)
    g7_pass = min_dte > restricted_entry_dte
    gates.append({
        "id": 7,
        "name": "Safe Lifecycle",
        "status": "PASS" if g7_pass else "FAIL",
        "value": f"Min DTE: {min_dte} days",
        "threshold": f"> {restricted_entry_dte} days",
        "message": f"Ample holding window before delivery/tender period (DTE {min_dte} > {restricted_entry_dte})" if g7_pass else f"Contract too close to expiry to enter and exit safely (DTE {min_dte} <= {restricted_entry_dte})"
    })

    # 8. SURVIVES COSTS
    net_edge = cost_data.get("net_edge_bps", -999.0)
    g8_pass = net_edge >= min_net_edge_bps
    gates.append({
        "id": 8,
        "name": "Survives Costs",
        "status": "PASS" if g8_pass else "FAIL",
        "value": f"Net edge: {net_edge:.1f} bps",
        "threshold": f">= {min_net_edge_bps:.1f} bps",
        "message": f"Pricing anomaly survives estimated friction (+{net_edge:.1f} bps net)" if g8_pass else f"The apparent pricing difference does not survive estimated transaction costs (net {net_edge:.1f} bps)"
    })

    # 9. EXPOSURE MATCHABLE
    mismatch_pct = hedge_data.get("mismatch_pct", 100.0)
    g9_pass = mismatch_pct <= max_mismatch_pct
    gates.append({
        "id": 9,
        "name": "Exposure Matchable",
        "status": "PASS" if g9_pass else "FAIL",
        "value": f"Mismatch: {mismatch_pct:.3f}% ({hedge_data.get('ratio_str', '')})",
        "threshold": f"<= {max_mismatch_pct:.2f}%",
        "message": f"Integer lots achieve exposure parity within {mismatch_pct:.3f}%" if g9_pass else f"Integer lot mismatch exceeds risk tolerance ({mismatch_pct:.3f}% > {max_mismatch_pct}%)"
    })

    all_passed = all(g["status"] == "PASS" for g in gates)
    if all_passed:
        verdict = "SIGNAL"
        headline = f"SIGNAL — All 9 validation gates passed. Net expected edge: +{net_edge:.1f} bps."
    else:
        verdict = "NO SIGNAL"
        first_fail = next(g for g in gates if g["status"] == "FAIL")
        headline = f"NO SIGNAL — {first_fail['message']}"

    return verdict, headline, gates
