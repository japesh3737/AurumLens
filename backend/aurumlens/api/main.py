import os
import json
import yaml
import pandas as pd
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from aurumlens.data.store import load_processed_data, load_integrity_audit
from aurumlens.core.contracts import SPECS, normalize
from aurumlens.core.lifecycle import compute_contract_lifecycles
from aurumlens.core.curve import fit_curve, leave_one_out_residuals
from aurumlens.engine.signal import process_day_signals, PAIRS, pair_name
from aurumlens.engine.spreads import select_pair_legs, compute_pair_spread
from aurumlens.backtest.walkforward import run_walkforward_backtest
from aurumlens.replay.audit import run_lookahead_audit
from aurumlens.api.schemas import BacktestRequest

app = FastAPI(
    title="AurumLens API",
    description="Relative-Value Market Intelligence Terminal for MCX Gold Futures",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
BUNDLE_DIR = os.path.join(ROOT_DIR, "data", "bundle")

def get_bundle_json(filename: str):
    path = os.path.join(BUNDLE_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "AurumLens Backend API",
        "timestamp": pd.Timestamp.utcnow().isoformat() + "Z"
    }

@app.get("/api/meta")
def meta():
    manifest = get_bundle_json("manifest.json")
    if manifest:
        return manifest
    df = load_processed_data()
    if df.empty:
        return {"mode": "uninitialized", "status": "No data loaded"}
    dates = sorted(df["date"].unique())
    return {
        "engine_version": "1.0.0",
        "date_range": {
            "start": pd.Timestamp(dates[0]).strftime("%Y-%m-%d"),
            "end": pd.Timestamp(dates[-1]).strftime("%Y-%m-%d")
        },
        "total_trading_dates": len(dates),
        "total_rows": len(df),
        "mode": "live"
    }

@app.get("/api/snapshot")
def get_snapshot(date: str = Query(..., description="Date in YYYY-MM-DD format")):
    # First check precomputed bundle
    bundle_snaps = get_bundle_json("snapshots.json")
    if bundle_snaps and "snapshots" in bundle_snaps and date in bundle_snaps["snapshots"]:
        return bundle_snaps["snapshots"][date]

    df = load_processed_data()
    if df.empty:
        raise HTTPException(status_code=404, detail="Processed dataset not found")

    df["norm"] = df.apply(lambda r: normalize(r["close"], SPECS.get(r["symbol"], SPECS["GOLDM"])), axis=1)

    target_dt = pd.Timestamp(date)
    today_data = df[df["date"] == target_dt].copy()
    if today_data.empty:
        raise HTTPException(status_code=404, detail=f"No market data recorded for {date}")

    past_data = df[df["date"] < target_dt].copy()
    snap = process_day_signals(today_data, past_data)

    # Build contract cards
    cards = []
    for sym in ["GOLDM", "GOLDTEN", "GOLDGUINEA", "GOLDPETAL"]:
        sub = today_data[today_data["symbol"] == sym]
        if not sub.empty:
            valid_active = sub[sub["traded"] & (sub["dte"] >= 5)]
            chosen = valid_active.sort_values(by="dte").iloc[0] if not valid_active.empty else sub.iloc[0]
            cid = chosen["contract_id"]
            cards.append({
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
    snap["contracts"] = cards
    return snap

@app.get("/api/series")
def get_series(pair: str = Query("GOLDTEN-GOLDPETAL"), start: str = None, end: str = None):
    df = load_processed_data()
    if df.empty:
        raise HTTPException(status_code=404, detail="Data not loaded")

    df["norm"] = df.apply(lambda r: normalize(r["close"], SPECS.get(r["symbol"], SPECS["GOLDM"])), axis=1)

    sym_a, sym_b = pair.split("-")
    dates = sorted(df["date"].unique())
    series = []
    prev_leg_a = None
    prev_leg_b = None

    for t in dates:
        t_str = pd.Timestamp(t).strftime("%Y-%m-%d")
        if start and t_str < start:
            continue
        if end and t_str > end:
            continue

        today_data = df[df["date"] == t]
        leg_a, leg_b = select_pair_legs(today_data, sym_a, sym_b)
        if leg_a and leg_b:
            sp = compute_pair_spread(leg_a, leg_b, None)
            roll_a = prev_leg_a is not None and leg_a["contract_id"] != prev_leg_a
            roll_b = prev_leg_b is not None and leg_b["contract_id"] != prev_leg_b

            series.append({
                "date": t_str,
                "norm_a": sp["norm_a"],
                "norm_b": sp["norm_b"],
                "norm_diff": sp["norm_diff"],
                "pct_spread": sp["pct_spread"],
                "curve_adj_spread": sp["curve_adj_spread"],
                "leg_a_cid": leg_a["contract_id"],
                "leg_b_cid": leg_b["contract_id"],
                "leg_roll": roll_a or roll_b,
                "roll_note": f"Roll to {leg_a['contract_id'] if roll_a else ''} {leg_b['contract_id'] if roll_b else ''}".strip()
            })
            prev_leg_a = leg_a["contract_id"]
            prev_leg_b = leg_b["contract_id"]

    return {"pair": pair, "points": series}

@app.get("/api/curve")
def get_curve(date: str = Query(...)):
    df = load_processed_data()
    if df.empty:
        raise HTTPException(status_code=404, detail="Data not loaded")

    df["norm"] = df.apply(lambda r: normalize(r["close"], SPECS.get(r["symbol"], SPECS["GOLDM"])), axis=1)
    target_dt = pd.Timestamp(date)
    today_data = df[df["date"] == target_dt].copy()

    if today_data.empty:
        raise HTTPException(status_code=404, detail=f"No data for date {date}")

    fit = fit_curve(today_data)
    residuals = leave_one_out_residuals(today_data)
    today_data["residual"] = residuals

    points = []
    for _, r in today_data.iterrows():
        exp_price = float(fit.predict_norm(r["dte"])) if fit and fit.quality in ("ok", "narrow-tenor") else r["norm"]
        res_val = r["residual"]
        points.append({
            "symbol": r["symbol"],
            "contract_id": r["contract_id"],
            "expiry_date": r["expiry_date"].strftime("%d%b%Y").upper(),
            "dte": int(r["dte"]),
            "raw_close": float(r["close"]),
            "norm_close": round(float(r["norm"]), 2),
            "expected_curve_norm": round(exp_price, 2),
            "residual_inr": round(float(r["norm"] - exp_price), 2),
            "residual_bps": round(float(res_val * 10000.0), 1) if pd.notna(res_val) else 0.0,
            "volume": int(r["volume"]),
            "open_interest": int(r["open_interest"]),
            "traded": bool(r["traded"])
        })

    return {
        "date": date,
        "fit": fit.to_dict() if fit else None,
        "points": points
    }

@app.get("/api/contracts")
def get_contracts():
    cached = get_bundle_json("contracts.json")
    if cached:
        return cached
    df = load_processed_data()
    if df.empty:
        return []
    lifecycles = compute_contract_lifecycles(df).to_dict(orient="records")
    return lifecycles

@app.get("/api/integrity")
def get_integrity():
    cached = get_bundle_json("integrity.json")
    if cached:
        return cached
    return load_integrity_audit()

@app.get("/api/audit/lookahead")
def get_lookahead_audit():
    cached = get_bundle_json("lookahead_audit.json")
    if cached:
        return cached
    df = load_processed_data()
    return run_lookahead_audit(df)

@app.get("/api/bookmarks")
def get_bookmarks():
    cached = get_bundle_json("bookmarks.json")
    if cached:
        return cached
    return []

@app.get("/api/assumptions")
def get_assumptions():
    cfg_path = os.path.join(ROOT_DIR, "config", "engine.yaml")
    if not os.path.exists(cfg_path):
        cfg_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "config", "engine.yaml")
    if not os.path.exists(cfg_path):
        cfg_path = "config/engine.yaml"
    with open(cfg_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    return cfg

@app.post("/api/backtest")
def run_backtest(req: BacktestRequest):
    df = load_processed_data()
    if df.empty:
        raise HTTPException(status_code=404, detail="Data not available")

    df["norm"] = df.apply(lambda r: normalize(r["close"], SPECS.get(r["symbol"], SPECS["GOLDM"])), axis=1)
    results = run_walkforward_backtest(df, pair=req.pair, params=req.model_dump())
    return results

# ---------------------------------------------------------------------------
# Static Frontend Serving & Single Page App (SPA) Routing
# ---------------------------------------------------------------------------
POSSIBLE_DIST_DIRS = [
    os.path.join(ROOT_DIR, "dist"),
    os.path.join(ROOT_DIR, "backend", "dist"),
    os.path.join(ROOT_DIR, "web", "dist"),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "dist")),
]

FOUND_DIST_DIR = None
for d in POSSIBLE_DIST_DIRS:
    if os.path.exists(d) and os.path.isdir(d):
        FOUND_DIST_DIR = os.path.abspath(d)
        break

if FOUND_DIST_DIR:
    assets_path = os.path.join(FOUND_DIST_DIR, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

@app.get("/")
def serve_root():
    if FOUND_DIST_DIR:
        index_file = os.path.join(FOUND_DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
    return RedirectResponse(url="/docs")

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    if full_path.startswith("api/") or full_path in ("docs", "openapi.json", "redoc"):
        raise HTTPException(status_code=404, detail="Not Found")

    if FOUND_DIST_DIR:
        target_file = os.path.join(FOUND_DIST_DIR, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)

        index_file = os.path.join(FOUND_DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)

    return RedirectResponse(url="/docs")

