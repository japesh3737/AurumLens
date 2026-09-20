import os
import hashlib
from datetime import datetime
import pandas as pd
import numpy as np

GOLD_SYMBOLS = {"GOLDM", "GOLDTEN", "GOLDGUINEA", "GOLDPETAL"}

def parse_returned_date(s: str) -> pd.Timestamp:
    """
    Explicitly parses MM/DD/YYYY from MCX JSON response.
    Never lets a library guess.
    """
    cleaned = str(s).strip().split(" ")[0]
    return pd.Timestamp(datetime.strptime(cleaned, "%m/%d/%Y"))

def parse_expiry(s: str) -> pd.Timestamp:
    """
    Explicitly parses DDMMMYYYY (e.g. 31JAN2024 or 04SEP2026).
    """
    cleaned = str(s).strip().upper()
    return pd.Timestamp(datetime.strptime(cleaned, "%d%b%Y"))

def clean_bhavcopy_payload(raw_json: dict, source_file: str = "") -> tuple[pd.DataFrame, dict]:
    """
    Clean and validate a raw bhavcopy JSON dictionary.
    Returns (cleaned_df, stats_dict).
    """
    req_date_str = raw_json.get("requested_date")
    requested_dt = None
    if req_date_str:
        try:
            requested_dt = pd.Timestamp(datetime.strptime(req_date_str, "%d/%m/%Y"))
        except Exception:
            pass

    items = raw_json.get("payload", {}).get("Data") or []
    stats = {
        "requested_date": requested_dt.strftime("%Y-%m-%d") if requested_dt else None,
        "returned_date": None,
        "date_mismatch": False,
        "mismatch_cause": None,
        "rows_downloaded": len(items),
        "gold_rows_found": 0,
        "valid_rows": 0,
        "rejected_rows": 0,
        "rejection_reasons": {},
        "symbols_cleaned": 0,
        "expiry_parsed": 0,
        "duplicates": 0,
        "zero_volume": 0,
        "source_file": source_file,
    }

    def record_rejection(reason: str):
        stats["rejected_rows"] += 1
        stats["rejection_reasons"][reason] = stats["rejection_reasons"].get(reason, 0) + 1

    if not items:
        stats["date_mismatch"] = True
        stats["mismatch_cause"] = "empty_response_or_weekend"
        return pd.DataFrame(), stats

    valid_records = []

    for item in items:
        # Instrument type filter: only Futures (FUTCOM)
        inst = str(item.get("InstrumentName", "")).strip().upper()
        if inst and inst not in ("FUTCOM", ""):
            continue

        raw_sym = str(item.get("Symbol", ""))
        sym = raw_sym.strip().upper()
        if sym != raw_sym:
            stats["symbols_cleaned"] += 1

        if sym not in GOLD_SYMBOLS:
            continue

        stats["gold_rows_found"] += 1

        try:
            dt = parse_returned_date(item["Date"])
            exp = parse_expiry(item["ExpiryDate"])
            stats["expiry_parsed"] += 1
        except Exception as e:
            record_rejection("date_or_expiry_parse_error")
            continue

        try:
            o = float(item.get("Open", 0.0) or 0.0)
            h = float(item.get("High", 0.0) or 0.0)
            l = float(item.get("Low", 0.0) or 0.0)
            c = float(item.get("Close", 0.0) or 0.0)
            prev_c = float(item.get("PreviousClose", 0.0) or 0.0)
            vol = float(item.get("Volume", 0.0) or 0.0)
            oi = float(item.get("OpenInterest", 0.0) or 0.0)
        except Exception:
            record_rejection("numeric_coercion_error")
            continue

        if c <= 0.0 and prev_c <= 0.0:
            record_rejection("non_positive_price")
            continue

        # If close is 0 but volume is 0, settlement price is previous close
        settlement_price = c if c > 0 else prev_c

        flags = []
        is_traded = vol > 0
        if not is_traded:
            flags.append("zero_volume")
            stats["zero_volume"] += 1

        if h > 0 and l > 0 and not (l <= settlement_price <= h) and is_traded:
            flags.append("close_outside_hl")

        dte = int((exp - dt).days)
        if dte < 0:
            flags.append("expired_contract")

        contract_id = f"{sym}|{exp.strftime('%Y-%m-%d')}"

        # Row hash for provenance
        hash_input = f"{contract_id}|{dt.strftime('%Y-%m-%d')}|{settlement_price}|{vol}|{oi}"
        row_hash = hashlib.sha256(hash_input.encode("utf-8")).hexdigest()[:16]

        rec = {
            "date": dt,
            "symbol": sym,
            "expiry_date": exp,
            "contract_id": contract_id,
            "dte": dte,
            "open": o,
            "high": h,
            "low": l,
            "close": settlement_price,
            "previous_close": prev_c,
            "volume": vol,
            "open_interest": oi,
            "traded": is_traded,
            "validation_flags": ",".join(flags) if flags else "clean",
            "row_hash": row_hash,
            "source_file": os.path.basename(source_file),
        }
        valid_records.append(rec)

    if not valid_records:
        return pd.DataFrame(), stats

    df = pd.DataFrame(valid_records)

    # De-duplicate on date, symbol, expiry_date
    init_count = len(df)
    df = df.drop_duplicates(subset=["date", "symbol", "expiry_date"], keep="first")
    stats["duplicates"] = init_count - len(df)
    stats["valid_rows"] = len(df)

    returned_dt = df["date"].iloc[0]
    stats["returned_date"] = returned_dt.strftime("%Y-%m-%d")

    if requested_dt and returned_dt != requested_dt:
        stats["date_mismatch"] = True
        # Classify mismatch cause
        if requested_dt.weekday() in (5, 6):
            stats["mismatch_cause"] = "weekend_fallback"
        else:
            stats["mismatch_cause"] = "exchange_holiday"
    else:
        stats["date_mismatch"] = False

    return df, stats
