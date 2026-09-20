# AurumLens — Quality Assurance & Acceptance Report

### Hack In Hills '26

---

## 1. Engine Truth & Unit Tests (Gate G1)
- [x] **Normalization Factors**: Verified across all 4 contracts (GOLDM, GOLDTEN, GOLDGUINEA, GOLDPETAL) with linear purity adjustment ($999/995$).
- [x] **Lot Factors**: Verified INR P&L multiplier per quoted ₹1 change (GOLDM = 10, PETAL = 1, TEN = 1, GUINEA = 1).
- [x] **Hedge Ratios**: Integer exposure matching verified (TEN:PETAL = 1:10 at 0% mismatch; GUINEA:PETAL = 1:8 at 0%; TEN:GUINEA = 4:5 at 0%; GOLDM:TEN = 1:10 at 0.40% mismatch).
- [x] **Past-Only Robust Z-Score**: Evaluated strictly on history prior to date $t$.
- [x] **Cost Monotonicity**: Increasing brokerage and slippage monotonically reduces net strategy P&L.
- [x] **Truncation Invariance (No Look-Ahead)**: Evaluated across historical dates with future data truncated; bit-identical assertion confirmed.

---

## 2. Data Engineering & Integrity (Gate G0)
- [x] **Live MCX Exchange Access**: Automated TLS-impersonated fetcher connected to official MCX India Bhavcopy feed.
- [x] **Zero Synthetic Data**: 100% of analyzed prices, volumes, open interest, and contract lifecycles originate from official exchange files.
- [x] **Date Parser & Symbol Trimming**: Explicit `MM/DD/YYYY` parser; space-padded symbols trimmed cleanly.
- [x] **Holiday Date Mismatch Detection**: Successfully flagged calendar weekend and holiday responses.
- [x] **Parquet Storage**: Cleaned and validated dataset saved at `data/processed/gold_futures.parquet`.

---

## 3. Product Polish & Visual Review
- [x] **7 Terminal Screens**: Overview, Relative Value, Futures Curve, Replay Lab, Backtest, Lifecycle, Data Integrity.
- [x] **Signature Hero Animation**: 5-phase Normalization Stage with physical gold bar resizing and rolling odometers.
- [x] **Interactive D3 Futures Curve**: Leave-one-out residual stems, log(OI) dot radii, Contango/Backwardation classification badge.
- [x] **Story Mode Presentation Tour**: 8-step guided judge flow with synchronized narration cards.
- [x] **Dual Runtime Mode**: Live FastAPI mode with automatic graceful fallback to static offline JSON bundle.
