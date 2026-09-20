import os
import json
import hashlib
import logging
import pandas as pd
from datetime import datetime
from aurumlens.core.contracts import SPECS, normalize, pure_gold_g
from aurumlens.core.lifecycle import compute_contract_lifecycles
from aurumlens.data.store import load_processed_data, load_integrity_audit
from aurumlens.engine.signal import process_day_signals, PAIRS, pair_name
from aurumlens.engine.spreads import select_pair_legs
from aurumlens.backtest.walkforward import run_walkforward_backtest
from aurumlens.replay.audit import run_lookahead_audit

logger = logging.getLogger("aurumlens.replay.snapshots")
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
BUNDLE_DIR = os.path.join(ROOT_DIR, "data", "bundle")

def generate_bundle(parquet_path: str = None) -> dict:
    """
    Builds the complete offline bundle:
    - snapshots.json: day-by-day sequential states with contract cards and pairs
    - bookmarks.json: real showcase dates tagged by rule
    - backtest_defaults.json: precomputed backtests for all pairs
    - contracts.json: complete lifecycle metadata
    - lookahead_audit.json: mathematical proof of zero look-ahead
    - integrity.json: requested vs returned audit summary
    - manifest.json: bundle validation hash and metadata
    """
    os.makedirs(BUNDLE_DIR, exist_ok=True)
    df = load_processed_data() if parquet_path is None else pd.read_parquet(parquet_path)

    if df.empty:
        raise ValueError("Processed Parquet data is empty. Run backfill first.")

    # Calculate normalized price for every row
    df["norm"] = df.apply(lambda r: normalize(r["close"], SPECS.get(r["symbol"], SPECS["GOLDM"])), axis=1)

    trading_dates = sorted(df["date"].unique())
    logger.info(f"Generating snapshots for {len(trading_dates)} trading dates...")

    snapshots = {}
    snapshots_list = []
    bookmarks = []

    # Track largest |z| and other interesting events for bookmarks
    max_z_info = {"z": 0.0, "date": None, "pair": None}
    elevated_cost_rejected = None
    curve_contango_date = None
    curve_backwardation_date = None
    signal_passed_date = None

    for i, t in enumerate(trading_dates):
        t_str = pd.Timestamp(t).strftime("%Y-%m-%d")
        today_data = df[df["date"] == t].copy()
        past_data = df[df["date"] < t].copy()

        snap = process_day_signals(today_data, past_data)

        # Build contract cards array for Overview & Replay
        contracts_cards = []
        for sym in ["GOLDM", "GOLDTEN", "GOLDGUINEA", "GOLDPETAL"]:
            sub = today_data[today_data["symbol"] == sym]
            if not sub.empty:
                # Prefer traded contract with lowest DTE >= 5
                valid_active = sub[sub["traded"] & (sub["dte"] >= 5)]
                chosen = valid_active.sort_values(by="dte").iloc[0] if not valid_active.empty else sub.iloc[0]

                cid = chosen["contract_id"]
                contracts_cards.append({
                    "symbol": sym,
                    "contract_id": cid,
                    "name": SPECS[sym].name,
                    "raw_price": float(chosen["close"]),
                    "norm_price": round(float(chosen["norm"]), 2),
                    "expiry_date": chosen["expiry_date"].strftime("%d%b%Y").upper(),
                    "dte": int(chosen["dte"]),
                    "volume": int(chosen["volume"]),
                    "open_interest": int(chosen["open_interest"]),
                    "traded": bool(chosen["traded"]),
                    "liquidity_tier": snap["contract_liquidity"].get(cid, {}).get("tier", "VERY_LOW"),
                    "spec": {
                        "unit_g": SPECS[sym].unit_g,
                        "quote_g": SPECS[sym].quote_g,
                        "purity": SPECS[sym].purity,
                        "expiry_window": SPECS[sym].expiry_window,
                    }
                })

        snap["contracts"] = contracts_cards
        snapshots[t_str] = snap
        snapshots_list.append(snap)

        # Showcase rule scanning
        for p_name, p_res in snap["pairs"].items():
            z_val = p_res.get("z_score")
            if z_val is not None:
                if abs(z_val) > max_z_info["z"]:
                    max_z_info = {"z": abs(z_val), "date": t_str, "pair": p_name}

                # Elevated z (|z| >= 2.5) but rejected by costs
                if abs(z_val) >= 2.5 and p_res.get("verdict") == "NO SIGNAL":
                    failing_gate = next((g["name"] for g in p_res.get("gates", []) if g["status"] == "FAIL"), "")
                    if "Costs" in failing_gate and elevated_cost_rejected is None:
                        elevated_cost_rejected = {
                            "date": t_str,
                            "type": "COST_REJECTION",
                            "title": "Elevated Spread Filtered by Costs",
                            "pair": p_name,
                            "description": f"{p_name} exhibited |z|={abs(z_val):.2f}, but expected edge did not survive friction."
                        }

                if p_res.get("verdict") == "SIGNAL" and signal_passed_date is None:
                    signal_passed_date = {
                        "date": t_str,
                        "type": "SIGNAL_PASSED",
                        "title": "All 9 Gates Satisfied",
                        "pair": p_name,
                        "description": f"{p_name} successfully passed all statistical, liquidity, and cost gates."
                    }

        curve_class = snap["curve"].get("classification")
        if curve_class == "CONTANGO" and curve_contango_date is None:
            curve_contango_date = {
                "date": t_str,
                "type": "CURVE_CONTANGO",
                "title": "Term Structure in Contango",
                "pair": "All",
                "description": "Upward-sloping futures curve reflecting positive holding carry."
            }
        elif curve_class == "BACKWARDATION" and curve_backwardation_date is None:
            curve_backwardation_date = {
                "date": t_str,
                "type": "CURVE_BACKWARDATION",
                "title": "Term Structure in Backwardation",
                "pair": "All",
                "description": "Downward-sloping futures curve signaling prompt demand premium."
            }

    # Add discovered bookmarks
    if elevated_cost_rejected:
        bookmarks.append(elevated_cost_rejected)
    if max_z_info["date"]:
        bookmarks.append({
            "date": max_z_info["date"],
            "type": "LARGEST_DEVIATION",
            "title": f"Period Peak Deviation ({max_z_info['pair']})",
            "pair": max_z_info["pair"],
            "description": f"Highest statistical z-score ({max_z_info['z']:.2f}) observed in historical sample."
        })
    if curve_contango_date:
        bookmarks.append(curve_contango_date)
    if curve_backwardation_date:
        bookmarks.append(curve_backwardation_date)
    if signal_passed_date:
        bookmarks.append(signal_passed_date)

    # 2. Precompute default backtests for all 6 pairs
    logger.info("Precomputing default backtests for all 6 pairs...")
    backtest_defaults = {}
    for sym_a, sym_b in PAIRS:
        p_str = pair_name(sym_a, sym_b)
        res = run_walkforward_backtest(df, pair=p_str)
        backtest_defaults[p_str] = res

    # 3. Complete Lifecycles
    logger.info("Computing contract lifecycles...")
    lifecycles = compute_contract_lifecycles(df).to_dict(orient="records")

    # 4. Truncation Invariance Audit
    logger.info("Executing Truncation Invariance (No Look-Ahead) audit...")
    audit_proof = run_lookahead_audit(df, sample_size=min(20, len(trading_dates)))

    # 5. Integrity Audit
    integrity_data = load_integrity_audit()

    # Write files into bundle
    with open(os.path.join(BUNDLE_DIR, "snapshots.json"), "w", encoding="utf-8") as f:
        json.dump({"dates": [pd.Timestamp(d).strftime("%Y-%m-%d") for d in trading_dates], "snapshots": snapshots}, f, default=str)

    with open(os.path.join(BUNDLE_DIR, "bookmarks.json"), "w", encoding="utf-8") as f:
        json.dump(bookmarks, f, indent=2, default=str)

    with open(os.path.join(BUNDLE_DIR, "backtest_defaults.json"), "w", encoding="utf-8") as f:
        json.dump(backtest_defaults, f, default=str)

    with open(os.path.join(BUNDLE_DIR, "contracts.json"), "w", encoding="utf-8") as f:
        json.dump(lifecycles, f, default=str, indent=2)

    with open(os.path.join(BUNDLE_DIR, "lookahead_audit.json"), "w", encoding="utf-8") as f:
        json.dump(audit_proof, f, indent=2)

    with open(os.path.join(BUNDLE_DIR, "integrity.json"), "w", encoding="utf-8") as f:
        json.dump(integrity_data, f, indent=2)

    # Build manifest
    manifest_content = f"{len(snapshots)}|{audit_proof['status']}|{trading_dates[0]}|{trading_dates[-1]}"
    manifest_hash = hashlib.sha256(manifest_content.encode("utf-8")).hexdigest()[:16]
    manifest = {
        "engine_version": "1.0.0",
        "date_range": {
            "start": pd.Timestamp(trading_dates[0]).strftime("%Y-%m-%d"),
            "end": pd.Timestamp(trading_dates[-1]).strftime("%Y-%m-%d")
        },
        "total_trading_dates": len(trading_dates),
        "total_contracts": len(lifecycles),
        "lookahead_audit_status": audit_proof["status"],
        "manifest_hash": manifest_hash,
        "default_showcase_date": bookmarks[0]["date"] if bookmarks else pd.Timestamp(trading_dates[-1]).strftime("%Y-%m-%d"),
        "generated_at": datetime.utcnow().isoformat() + "Z"
    }

    with open(os.path.join(BUNDLE_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    # Sync to web app public & dist folders if present
    import shutil
    for target in [os.path.join(ROOT_DIR, "web", "public", "data", "bundle"), os.path.join(ROOT_DIR, "web", "dist", "data", "bundle")]:
        os.makedirs(target, exist_ok=True)
        for fname in os.listdir(BUNDLE_DIR):
            s_file = os.path.join(BUNDLE_DIR, fname)
            if os.path.isfile(s_file):
                shutil.copy2(s_file, os.path.join(target, fname))

    logger.info(f"Offline bundle successfully created and synced to web! Manifest: {manifest_hash}")
    return manifest

if __name__ == "__main__":
    generate_bundle()
