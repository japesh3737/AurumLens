from math import floor, ceil
from aurumlens.core.contracts import SPECS, pure_gold_g

def compute_hedge_ratio(sym_a: str, sym_b: str, max_a: int = 20, max_b: int = 250) -> dict:
    """
    Finds integer lot combinations (lots_a, lots_b) that minimize pure gold exposure mismatch.
    Tie-breaks on fewest total lots.
    """
    ga = pure_gold_g(SPECS[sym_a])
    gb = pure_gold_g(SPECS[sym_b])

    best = None
    for qa in range(1, max_a + 1):
        target_b = qa * ga / gb
        candidates = {floor(target_b), ceil(target_b)}
        for qb in candidates:
            if not (1 <= qb <= max_b):
                continue
            gold_a = qa * ga
            gold_b = qb * gb
            mismatch_frac = abs(gold_a - gold_b) / gold_a
            # key: prefer low mismatch, then fewest lots
            key = (round(mismatch_frac, 2), qa + qb)
            if best is None or key < best[0]:
                best = (key, {
                    "symbol_a": sym_a,
                    "symbol_b": sym_b,
                    "lots_a": int(qa),
                    "lots_b": int(qb),
                    "gold_a_g": round(gold_a, 2),
                    "gold_b_g": round(gold_b, 2),
                    "mismatch_pct": round(mismatch_frac * 100.0, 3),
                    "ratio_str": f"{qa} {sym_a} : {qb} {sym_b}",
                    "pure_gold_per_lot_a": round(ga, 3),
                    "pure_gold_per_lot_b": round(gb, 3),
                })

    return best[1] if best else {}
