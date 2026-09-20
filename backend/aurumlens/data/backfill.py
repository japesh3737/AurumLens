import os
import sys
import logging
from datetime import datetime, timedelta
from aurumlens.data.fetch import BhavcopyFetcher
from aurumlens.data.store import process_raw_cache

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("aurumlens.data.backfill")

def run_backfill(start_dt: datetime, end_dt: datetime):
    fetcher = BhavcopyFetcher()
    curr = start_dt
    logger.info(f"Starting backfill from {start_dt.strftime('%Y-%m-%d')} to {end_dt.strftime('%Y-%m-%d')}")

    count = 0
    while curr <= end_dt:
        # We query calendar days to discover holidays vs trading days
        fetcher.fetch_date(curr)
        curr += timedelta(days=1)
        count += 1
        if count % 10 == 0:
            logger.info(f"Fetched {count} calendar days...")

    logger.info("Backfill complete. Now processing raw cache into Parquet & audit report...")
    df, audit = process_raw_cache()
    logger.info(f"Processed Parquet contains {len(df)} records across {audit['aggregate']['total_valid_rows']} valid contract observations.")
    logger.info(f"Integrity status: {audit['status']}")

if __name__ == "__main__":
    # Backfill range: e.g. 60 days of history from Dec 2024 to Feb 2025
    s = datetime(2024, 12, 1)
    e = datetime(2025, 2, 10)
    run_backfill(s, e)
