import pandas as pd
from datetime import datetime
from aurumlens.core.contracts import SPECS, ContractSpec

def compute_contract_lifecycles(data: pd.DataFrame, specs: dict[str, ContractSpec] = SPECS) -> pd.DataFrame:
    """
    Computes lifecycle milestones for every contract_id present in the dataset.
    """
    if data.empty:
        return pd.DataFrame()

    records = []
    for cid, group in data.groupby("contract_id"):
        sym = group["symbol"].iloc[0]
        spec = specs.get(sym, SPECS.get(sym))

        first_seen = group["date"].min()
        last_seen = group["date"].max()
        expiry_date = group["expiry_date"].iloc[0]

        traded_group = group[group["traded"]]
        first_traded_date = traded_group["date"].min() if not traded_group.empty else None

        # Peak OI date
        peak_oi_idx = group["open_interest"].idxmax()
        peak_oi_date = group.loc[peak_oi_idx, "date"] if pd.notna(peak_oi_idx) else None
        peak_oi = float(group["open_interest"].max())

        # Restricted & tender periods (calendar days before expiry)
        restricted_days = spec.restricted_window_days if spec else 10
        forced_exit_days = spec.forced_exit_days if spec else 5

        tender_start = expiry_date - pd.Timedelta(days=restricted_days)
        forced_exit_date = expiry_date - pd.Timedelta(days=forced_exit_days)

        records.append({
            "contract_id": cid,
            "symbol": sym,
            "first_seen": first_seen,
            "last_seen": last_seen,
            "expiry_date": expiry_date,
            "first_traded_date": first_traded_date,
            "peak_oi_date": peak_oi_date,
            "peak_oi": peak_oi,
            "tender_start": tender_start,
            "forced_exit_date": forced_exit_date,
            "restricted_days": restricted_days,
            "forced_exit_days": forced_exit_days,
            "total_observed_days": len(group),
            "traded_days_count": len(traded_group),
        })

    return pd.DataFrame(records).sort_values(by=["symbol", "expiry_date"]).reset_index(drop=True)

def is_safe_lifecycle(contract_id: str, current_date: pd.Timestamp, expiry_date: pd.Timestamp,
                      action: str = "entry", restricted_days: int = 10, forced_exit_days: int = 5) -> tuple[bool, str]:
    """
    Evaluates lifecycle validity for entry or exit.
    Entry: must have dte > restricted_days.
    Exit: if dte <= forced_exit_days, forced exit must happen.
    """
    dte = int((expiry_date - current_date).days)
    if dte <= 0:
        return False, f"Contract {contract_id} is expired (DTE = {dte})"

    if action == "entry":
        if dte <= restricted_days:
            return False, f"Inside restricted tender window: DTE {dte} <= {restricted_days} days"
        return True, f"Safe for entry (DTE {dte} > {restricted_days})"
    elif action == "exit":
        if dte <= forced_exit_days:
            return True, f"Forced exit triggered (DTE {dte} <= {forced_exit_days})"
        return False, f"Holding permitted (DTE {dte} > {forced_exit_days})"

    return True, "OK"
