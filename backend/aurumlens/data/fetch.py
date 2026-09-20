import os
import json
import time
import random
import logging
from datetime import datetime, timedelta
import primp

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("aurumlens.data.fetch")

BASE_URL = "https://www.mcxindia.com/market-data/bhavcopy/GetDateWiseBhavCopy"
HEADERS = {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Referer": "https://www.mcxindia.com/market-data/bhavcopy",
    "X-Requested-With": "XMLHttpRequest",
}

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

class BhavcopyFetcher:
    def __init__(self, raw_dir: str = None, delay_range: tuple = (0.8, 1.5)):
        self.raw_dir = raw_dir if raw_dir is not None else os.path.join(ROOT_DIR, "data", "raw")
        self.delay_range = delay_range
        os.makedirs(self.raw_dir, exist_ok=True)
        self.client = primp.Client(impersonate="random")

    def fetch_date(self, target_date: datetime, max_retries: int = 3) -> dict:
        """
        Fetch bhavcopy for target_date.
        MCX param expects DD/MM/YYYY.
        Saves raw JSON to data/raw/YYYY-MM-DD.json.
        """
        iso_date = target_date.strftime("%Y-%m-%d")
        cache_path = os.path.join(self.raw_dir, f"{iso_date}.json")

        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Error reading cache {cache_path}: {e}. Re-fetching.")

        req_date_str = target_date.strftime("%d/%m/%Y")
        url = f"{BASE_URL}?InstrumentName=ALL&fromDate={req_date_str}"

        for attempt in range(1, max_retries + 1):
            try:
                # Polite rate limiting jitter
                sleep_sec = random.uniform(*self.delay_range)
                time.sleep(sleep_sec)

                resp = self.client.get(url, headers=HEADERS)
                if resp.status_code == 200:
                    payload = resp.json()
                    wrapper = {
                        "requested_date": req_date_str,
                        "requested_iso": iso_date,
                        "fetched_at": datetime.utcnow().isoformat() + "Z",
                        "status_code": resp.status_code,
                        "payload": payload,
                    }
                    with open(cache_path, "w", encoding="utf-8") as f:
                        json.dump(wrapper, f)
                    data_items = payload.get("Data") or []
                    logger.info(f"Successfully fetched & cached {iso_date} ({len(data_items)} rows)")
                    return wrapper
                elif resp.status_code in (403, 429):
                    logger.warning(f"Rate limited (status {resp.status_code}) on {iso_date}, backoff...")
                    time.sleep(attempt * 3.0)
                else:
                    logger.warning(f"HTTP {resp.status_code} for {iso_date}, attempt {attempt}")
            except Exception as e:
                logger.error(f"Fetch error on {iso_date}, attempt {attempt}: {e}")
                time.sleep(attempt * 2.0)

        # Fallback record on persistent failure
        fail_wrapper = {
            "requested_date": req_date_str,
            "requested_iso": iso_date,
            "fetched_at": datetime.utcnow().isoformat() + "Z",
            "status_code": 500,
            "payload": {"Data": []},
            "error": "Max retries exceeded"
        }
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(fail_wrapper, f)
        return fail_wrapper

    def backfill_range(self, start_date: datetime, end_date: datetime) -> list[str]:
        """Fetch all calendar days in range."""
        curr = start_date
        fetched_files = []
        while curr <= end_date:
            self.fetch_date(curr)
            iso = curr.strftime("%Y-%m-%d")
            fetched_files.append(os.path.join(self.raw_dir, f"{iso}.json"))
            curr += timedelta(days=1)
        return fetched_files

if __name__ == "__main__":
    fetcher = BhavcopyFetcher()
    # Test fetch a recent date
    test_dt = datetime(2025, 1, 10)
    res = fetcher.fetch_date(test_dt)
    print("Done. Rows:", len(res.get("payload", {}).get("Data", [])))
