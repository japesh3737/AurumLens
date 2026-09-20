import numpy as np
import pandas as pd
import statsmodels.api as sm

class CurveFitResult:
    def __init__(self, coefs: list[float], degree: int, quality: str, r2: float, status_msg: str = ""):
        self.c = coefs
        self.deg = degree
        self.quality = quality
        self.r2 = float(r2)
        self.status_msg = status_msg

    def predict_log(self, dte: float | np.ndarray) -> np.ndarray:
        x = np.asarray(dte, dtype=float) / 365.0
        return sum(self.c[i] * (x ** i) for i in range(self.deg + 1))

    def predict_norm(self, dte: float | np.ndarray) -> np.ndarray:
        return np.exp(self.predict_log(dte))

    @property
    def annualized_carry(self) -> float:
        """Annualized carry slope = d ln(P) / d(year)"""
        return float(self.c[1]) if self.deg >= 1 else 0.0

    def to_dict(self) -> dict:
        return {
            "coefficients": [float(x) for x in self.c],
            "degree": self.deg,
            "quality": self.quality,
            "r2": round(self.r2, 4),
            "annualized_carry": round(self.annualized_carry, 6),
            "classification": classify_curve(self.annualized_carry, self.r2, self.quality),
            "status_msg": self.status_msg
        }

def _design(x: np.ndarray, deg: int) -> np.ndarray:
    return np.column_stack([x ** i for i in range(deg + 1)])

def fit_curve(day_df: pd.DataFrame, min_points: int = 4) -> CurveFitResult | None:
    """
    Fits robust fair-value curve of ln(norm) vs DTE/365 across all traded contracts on that date.
    Uses Huber M-estimator (RLM) to prevent outlier contracts from skewing the curve.
    """
    # Only contracts that actually traded today
    traded = day_df[day_df["traded"] & (day_df["dte"] >= 0) & (day_df["norm"] > 0)]
    if len(traded) < min_points:
        return CurveFitResult([float(np.median(np.log(day_df["norm"]))) if not day_df.empty else 0.0],
                              0, "insufficient_points", 0.0, f"Traded contracts ({len(traded)}) < min_points ({min_points})")

    x = traded["dte"].to_numpy(dtype=float) / 365.0
    y = np.log(traded["norm"].to_numpy(dtype=float))

    ptp_x = float(np.ptp(x))
    if ptp_x < (3.0 / 365.0):
        # Ill-conditioned slope; tenors are too close
        median_y = float(np.median(y))
        return CurveFitResult([median_y, 0.0], 1, "narrow-tenor", 0.0,
                              f"DTE spread is too narrow ({ptp_x*365:.1f} days); slope ill-conditioned")

    deg = 2 if len(traded) >= 7 else 1
    X = _design(x, deg)

    try:
        res = sm.RLM(y, X, M=sm.robust.norms.HuberT()).fit()
        yhat = X @ res.params
        ss_res = float(np.sum((y - yhat) ** 2))
        ss_tot = float(np.sum((y - np.mean(y)) ** 2))
        r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0
        return CurveFitResult(list(res.params), deg, "ok", max(0.0, r2), "Fit converged successfully")
    except Exception as e:
        median_y = float(np.median(y))
        return CurveFitResult([median_y, 0.0], 1, "fit_failed", 0.0, f"Optimization error: {str(e)}")

def leave_one_out_residuals(day_df: pd.DataFrame, min_points: int = 4) -> pd.Series:
    """
    Computes Leave-One-Out (LOO) residual for each contract so no contract defines its own fair value.
    Residual = ln(norm) - fit(day.drop(contract)).predict_log(dte)
    """
    residuals = {}
    for idx in day_df.index:
        row = day_df.loc[idx]
        if not row["traded"] or row["norm"] <= 0:
            residuals[idx] = np.nan
            continue

        subset = day_df.drop(idx)
        fit = fit_curve(subset, min_points=max(3, min_points - 1))
        if fit is None or fit.quality in ("insufficient_points", "fit_failed"):
            residuals[idx] = np.nan
        else:
            expected_log = fit.predict_log(row["dte"])
            residuals[idx] = float(np.log(row["norm"]) - expected_log)

    return pd.Series(residuals)

def classify_curve(annualized_carry: float, r2: float, quality: str, flat_band: float = 0.005) -> str:
    """
    Contango / Backwardation / Flat-Mixed.
    flat_band = 0.005 (0.5% annualized carry).
    """
    if quality != "ok" or r2 < 0.25 or abs(annualized_carry) < flat_band:
        return "FLAT / MIXED"
    return "CONTANGO" if annualized_carry > 0 else "BACKWARDATION"
