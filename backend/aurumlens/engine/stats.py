import numpy as np

def robust_z(x_t: float, past: np.ndarray, mad_floor: float = 1e-4, min_obs: int = 20) -> tuple[float | None, float | None, float | None, int]:
    """
    Computes robust z-score:
        z = (x_t - median(past)) / max(1.4826 * MAD(past), mad_floor)
    CRITICAL: 'past' must contain observations strictly BEFORE date t.
    Never includes x_t itself in the baseline calculation (no look-ahead).
    Returns (z_score, median, mad, valid_obs_count).
    """
    if x_t is None or np.isnan(x_t):
        return None, None, None, 0

    past = np.asarray(past, dtype=float)
    clean_past = past[~np.isnan(past)]

    if len(clean_past) < min_obs:
        return None, None, None, len(clean_past)

    med = float(np.median(clean_past))
    mad = float(1.4826 * np.median(np.abs(clean_past - med)))
    scale = max(mad, mad_floor)

    z = float((x_t - med) / scale)
    return z, med, mad, len(clean_past)
