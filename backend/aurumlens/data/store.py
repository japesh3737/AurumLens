import os
import glob
import json
import logging
import pandas as pd
from datetime import datetime
from aurumlens.data.clean import clean_bhavcopy_payload

logger = logging.getLogger("aurumlens.data.store")

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PROCESSED_DIR = os.path.join(ROOT_DIR, "data", "processed")
PARQUET_FILE = os.path.join(PROCESSED_DIR, "gold_futures.parquet")
AUDIT_FILE = os.path.join(PROCESSED_DIR, "data_integrity_audit.json")

def process_raw_cache(raw_dir: str = None) -> tuple[pd.DataFrame, dict]:
    """
    Reads all raw json files in data/raw, validates each,
    saves unified Parquet dataset and data integrity audit report.
    """
    if raw_dir is None:
        raw_dir = os.path.join(ROOT_DIR, "data", "raw")
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    raw_files = sorted(glob.glob(os.path.join(raw_dir, "*.json")))

    all_dfs = []
    audit_records = []
    aggregate_stats = {
        "total_files_processed": len(raw_files),
        "total_rows_downloaded": 0,
        "total_gold_rows_found": 0,
        "total_valid_rows": 0,
        "total_rejected_rows": 0,
        "total_symbols_cleaned": 0,
        "total_zero_volume": 0,
        "total_duplicates": 0,
        "total_date_mismatches": 0,
        "rejection_reasons": {},
        "mismatch_causes": {},
        "date_range": {"min": None, "max": None},
        "symbols": list(),
        "last_updated": datetime.utcnow().isoformat() + "Z"
    }

    seen_returned_dates = set()

    for fpath in raw_files:
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
            df, stats = clean_bhavcopy_payload(data, source_file=fpath)
            audit_records.append(stats)

            aggregate_stats["total_rows_downloaded"] += stats["rows_downloaded"]
            aggregate_stats["total_gold_rows_found"] += stats["gold_rows_found"]
            aggregate_stats["total_valid_rows"] += stats["valid_rows"]
            aggregate_stats["total_rejected_rows"] += stats["rejected_rows"]
            aggregate_stats["total_symbols_cleaned"] += stats["symbols_cleaned"]
            aggregate_stats["total_zero_volume"] += stats["zero_volume"]
            aggregate_stats["total_duplicates"] += stats["duplicates"]

            if stats["date_mismatch"]:
                aggregate_stats["total_date_mismatches"] += 1
                cause = stats["mismatch_cause"] or "unknown"
                aggregate_stats["mismatch_causes"][cause] = aggregate_stats["mismatch_causes"].get(cause, 0) + 1

            for reason, count in stats.get("rejection_reasons", {}).items():
                aggregate_stats["rejection_reasons"][reason] = aggregate_stats["rejection_reasons"].get(reason, 0) + count

            if not df.empty:
                ret_date = stats["returned_date"]
                # If date was mismatched and we already processed that returned date, don't duplicate
                if stats["date_mismatch"] and ret_date in seen_returned_dates:
                    continue
                seen_returned_dates.add(ret_date)
                all_dfs.append(df)
        except Exception as e:
            logger.error(f"Failed processing {fpath}: {e}")

    if all_dfs:
        full_df = pd.concat(all_dfs, ignore_index=True)
        # Drop duplicates across files on (date, symbol, expiry_date)
        full_df = full_df.drop_duplicates(subset=["date", "symbol", "expiry_date"]).reset_index(drop=True)
        full_df.sort_values(by=["date", "symbol", "expiry_date"], inplace=True)
        full_df.to_parquet(PARQUET_FILE, index=False)
        logger.info(f"Saved {len(full_df)} gold rows to {PARQUET_FILE}")

        aggregate_stats["date_range"]["min"] = full_df["date"].min().strftime("%Y-%m-%d")
        aggregate_stats["date_range"]["max"] = full_df["date"].max().strftime("%Y-%m-%d")
        aggregate_stats["symbols"] = sorted(full_df["symbol"].unique().tolist())
    else:
        full_df = pd.DataFrame()

    full_audit = {
        "aggregate": aggregate_stats,
        "date_audit": audit_records,
        "status": "PASS" if aggregate_stats["total_valid_rows"] > 0 else "WARNING"
    }

    with open(AUDIT_FILE, "w", encoding="utf-8") as f:
        json.dump(full_audit, f, indent=2)

    return full_df, full_audit

def load_processed_data() -> pd.DataFrame:
    if os.path.exists(PARQUET_FILE):
        return pd.read_parquet(PARQUET_FILE)
    return pd.DataFrame()

def load_integrity_audit() -> dict:
    if os.path.exists(AUDIT_FILE):
        with open(AUDIT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}
