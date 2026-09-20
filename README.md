# AurumLens — Relative-Value Intelligence Terminal for MCX Gold Futures

> *"AurumLens transforms raw MCX gold futures data into normalized, expiry-aware and cost-aware relative-value intelligence, helping users distinguish genuine pricing anomalies from ordinary contract mechanics and market noise."*

---

## Quick Start (3 Commands)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
cd web && npm install && cd ..
```

### 2. Generate Data & Offline Bundle
```bash
# Downloads real MCX Bhavcopy, processes Parquet, and builds offline bundle
python backend/aurumlens/data/backfill.py
python backend/aurumlens/replay/snapshots.py
```

### 3. Launch Demo Terminal
```bash
# Starts backend API on :8000 and frontend on :3000
python -m uvicorn aurumlens.api.main:app --port 8000 --app-dir backend
cd web && npm run dev
```

---

## Tech Stack
- **Frontend**: Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion + Apache ECharts + D3 + Zustand
- **Backend**: Python 3.12 + FastAPI + pandas + numpy + statsmodels + pyarrow + primp
- **Storage**: Cleaned Parquet (`data/processed/`) & Precomputed JSON Bundle (`data/bundle/`)
- **Testing**: pytest (unit tests & truncation invariance look-ahead audit)

---

## Key Features & Guarantees
1. **Zero Fake Data**: 100% authentic MCX Bhavcopy data.
2. **Strict Zero Look-Ahead**: Every statistic at date $t$ sees only data $\le t$. Truncation invariance verified.
3. **5-Phase Normalization Stage**: Visual physical-to-basis conversion choreography.
4. **9-Gate Sequential Filter**: Eliminates false opportunities before highlighting genuine edges.
5. **Replay Lab**: Day-by-day historical time machine with future masked.
6. **Walk-Forward Attribution**: Separates genuine Relative-Value returns from Directional Gold Beta.
7. **Offline-First Reliability**: Runs seamlessly without internet or backend connection via precomputed bundle.
