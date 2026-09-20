import os
import glob
import logging
import pandas as pd
from datetime import datetime
from aurumlens.data.clean import clean_bhavcopy_payload

logger = logging.getLogger("aurumlens.data.import_csv")
IMPORT_DIR = "data/import"

def import_dropped_files(import_dir: str = IMPORT_DIR) -> list[dict]:
    """
    Parses CSV/XLSX Bhavcopy files dropped into data/import/ and converts them
    to standard raw JSON structure in data/raw/ for processing.
    """
    os.makedirs(import_dir, exist_ok=True)
    files = glob.glob(os.path.join(import_dir, "*.*"))
    imported = []

    for fpath in files:
        ext = os.path.splitext(fpath)[1].lower()
        if ext not in (".csv", ".xlsx", ".xls"):
            continue
        try:
            if ext == ".csv":
                df = pd.read_csv(fpath)
            else:
                df = pd.read_excel(fpath)

            records = df.to_dict(orient="records")
            # Discover date from file or records
            first_date = str(records[0].get("Date", "")).split()[0]
            # Convert to raw format
            wrapper = {
                "requested_date": first_date,
                "requested_iso": datetime.now().strftime("%Y-%m-%d"),
                "fetched_at": datetime.utcnow().isoformat() + "Z",
                "status_code": 200,
                "payload": {"Data": records},
                "source": "manual_import"
            }
            imported.append(wrapper)
            logger.info(f"Imported {len(records)} rows from {fpath}")
        except Exception as e:
            logger.error(f"Error importing {fpath}: {e}")

    return imported
