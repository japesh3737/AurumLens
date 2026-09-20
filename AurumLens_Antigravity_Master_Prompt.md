# AURUMLENS — ANTIGRAVITY MASTER BUILD PROMPT
### HACK IN HILLS '26 · Relative-Value Intelligence for MCX Gold Futures

> **How to use this file**
> 1. Save it in your repo root as `AURUMLENS_MASTER_PROMPT.md`.
> 2. Paste the **KICKOFF MESSAGE** (Section 0) into Antigravity's Manager view.
> 3. Antigravity will read this file as its single source of truth. Everything from **PART A** onward is the actual spec.
> 4. Recommended: run 4 parallel agents (Workstreams A–D in Section 5) with the file ownership listed there.

---

## 0. KICKOFF MESSAGE (paste this first)

```
You are the lead engineer + product designer for "AurumLens", a hackathon-winning
relative-value intelligence terminal for MCX gold futures.

Read AURUMLENS_MASTER_PROMPT.md fully before doing anything. It is the single source
of truth. Then:
1. Produce an Implementation Plan artifact and a Task List artifact (map to Section 5).
2. Start Workstream A (data) FIRST — real MCX data access is the critical-path risk.
   Stop and ask me ONLY at Gate G0 (data access) and Gate G3 (final demo sign-off).
3. Use your browser subagent to visually verify every screen against Section 9 and
   Section 10, and attach screenshots + a recorded walkthrough as artifacts.
4. Never fabricate market data or backtest results. Ever. See Section 2.
```

---

# PART A — THE MASTER PROMPT

## 1. MISSION

Build **AurumLens**, a fully functional, premium, institutional-grade web application (financial research terminal aesthetic) that:

1. Loads **real historical MCX Daily Bhavcopy data** for gold futures (GOLDM, GOLDTEN, GOLDGUINEA, GOLDPETAL).
2. **Normalizes** every contract to a common basis: **₹ per 10 g of 999-purity-equivalent gold**.
3. Builds and analyzes the **futures curve** (term structure / carry) from normalized prices.
4. Computes **cross-contract relative-value** metrics for all 6 pairs, adjusting for expiry/curve effects.
5. Runs a **gated Signal Engine** that produces `SIGNAL` or `NO SIGNAL` with a plain-language reason for every rejection.
6. Provides a **Replay Lab** ("Historical Time Machine") that replays history day by day with **no look-ahead**, and a **provable look-ahead audit**.
7. Runs **walk-forward backtests** with realistic costs, exposure-matched hedge ratios, contract-lifecycle constraints, and **performance attribution** (relative-value vs directional gold vs costs).
8. Proves trustworthiness via a **Data Integrity** screen (requested-vs-returned date validation, cleaning stats, traceability).
9. Ships with a **rehearsed 4–5 minute judge demo flow** (guided Story Mode) and **demo-day reliability** measures (offline bundle, preflight checks, fallback plans).

**Philosophy (must be visible in product copy and behavior):**
- *"We optimize for signal quality, not signal frequency."*
- *"AurumLens is designed to eliminate false opportunities before highlighting real ones."*
- A `NO SIGNAL` result is a **first-class, valid, beautifully presented outcome**. A rigorous demonstration that no persistent edge survives costs is a successful outcome for this hackathon.

**Positioning (use exactly in the app header/about panel):**
*"A relative-value market intelligence and validation platform for commodity futures."* — Never describe it as "an arbitrage bot".

**Final one-liner (show on Overview footer and about modal):**
*"AurumLens transforms raw MCX gold futures data into normalized, expiry-aware and cost-aware relative-value intelligence, helping users distinguish genuine pricing anomalies from ordinary contract mechanics and market noise."*

---

## 2. NON-NEGOTIABLE RULES (violations = build failure)

1. **NO FAKE DATA.** No synthetic prices, no random-walk generators, no "sample data" shown as if real, no hardcoded profitable results. Unit-test fixtures are allowed **only inside `/tests`** and must never be importable by the app runtime. If real data is missing, the app boots into a **"Data Required" screen** with import instructions — it never falls back to invented numbers.
2. **NO LOOK-AHEAD.** Every statistic at date *t* may use only data with date ≤ *t* (baseline statistics for the z-score use data strictly **before** *t*). This must be enforced by a **truncation-invariance test** (see Reference Code §B7) and surfaced in the UI as a "Look-ahead audit: PASS" indicator.
3. **NO CONTINUOUS NEAR-MONTH SERIES.** Contracts are identified by **`(symbol, expiry_date)`** and followed through their own lifecycle. Never splice contracts.
4. **NEVER claim** settlement prices were executable fills, that volume equals depth, or that arbitrage is guaranteed. The UI must show: **"EOD settlement data · liquidity is a volume/OI proxy — not order-book depth."**
5. **NEVER FORCE A SIGNAL.** Default state is `NO SIGNAL`. Signals are rare.
6. **ALWAYS SHOW ASSUMPTIONS** (an always-reachable "Assumptions" drawer) and **ALWAYS EXPLAIN** accept/reject decisions ("Why this signal?" panel).
7. **Cost figures are configurable assumptions**, clearly labeled as such. Never invent historical bid/ask spreads. If you model slippage, label it as a *stress assumption*, not observed data.
8. **Zero-volume contract settlements are not traded prices.** Flag them, exclude them from statistics and curve fitting, and show them as hollow markers.
9. **Backtest results are whatever the data says.** The UI must render all three outcomes with equal polish: (a) no edge survives costs, (b) a marginal edge, (c) a positive edge. Do not tune parameters to manufacture a good-looking result. If you run parameter sweeps, show the sweep honestly (including the bad regions).
10. **Robust to outages.** The demo must run fully offline from a pre-built local bundle (Section 11).

---

## 3. TECH STACK (decided — do not bikeshed)

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Vite + React 18 + TypeScript** | Fast HMR, simple static build |
| Styling | **Tailwind CSS** + CSS variables (design tokens, §8) | Speed + consistency |
| Motion | **Framer Motion** (layout/spring/choreography) + **D3** (scales, paths, interpolation) | Bespoke analytics animations |
| Charts | **Apache ECharts** for time-series/attribution/heatmaps; **custom D3+SVG** for Futures Curve, Normalization, Lifecycle timeline, Gates | ECharts = polish + speed; custom = "wow" |
| State | **Zustand** | Simple, global replay clock |
| Fonts | **@fontsource** (bundled locally): `IBM Plex Sans`, `IBM Plex Mono` (tabular numerals), `Cormorant Garamond` (brand/display only) | No CDN dependency at demo time |
| Backend | **Python 3.11 + FastAPI + pandas + numpy + statsmodels + pyarrow** | Data engineering + robust stats |
| Storage | Raw JSON per date (`data/raw/`), cleaned **Parquet** (`data/processed/`), **pre-computed walk-forward snapshots** (`data/bundle/*.json`) | Reproducible + offline |
| Tests | `pytest` (engine), `vitest` (UI utils), **Playwright** (full demo rehearsal + screenshots + video) | Demo reliability |
| Startup | Single command: `make demo` (or `npm run demo`) → starts API + web, waits for health, opens browser | Zero-friction demo day |

Frontend must work in **two modes**: `API mode` (live backtests with custom parameters) and `Bundle mode` (static, pre-computed JSON — used automatically if the API is unreachable). A badge shows which mode is active.

---

## 4. REPOSITORY LAYOUT

```
aurumlens/
├─ AURUMLENS_MASTER_PROMPT.md
├─ Makefile                      # make data | make engine | make bundle | make demo | make test | make rehearse
├─ config/
│  ├─ contracts.yaml             # specs: unit_g, quote_g, purity, expiry window, tender/restricted config (+ source URL)
│  ├─ engine.yaml                # lookbacks, thresholds, gates, liquidity tiers, cost model (ALL flagged as assumptions)
│  └─ presenter.yaml             # story-mode steps, showcase-date rules
├─ backend/
│  ├─ aurumlens/
│  │  ├─ data/                   # fetch.py, clean.py, validate.py, store.py, import_csv.py
│  │  ├─ core/                   # contracts.py, normalize.py, lifecycle.py, curve.py, liquidity.py
│  │  ├─ engine/                 # spreads.py, stats.py, gates.py, signal.py, hedge.py
│  │  ├─ backtest/               # walkforward.py, attribution.py, costs.py, placebo.py, sweep.py
│  │  ├─ replay/                 # snapshots.py (sequential, no-look-ahead), audit.py
│  │  └─ api/                    # main.py (FastAPI), schemas.py
│  └─ tests/
├─ data/
│  ├─ raw/  processed/  bundle/
├─ web/
│  ├─ src/
│  │  ├─ app/ (routes, layout, command palette, presenter mode)
│  │  ├─ screens/ (Overview, RelativeValue, FuturesCurve, ReplayLab, Backtest, Lifecycle, DataIntegrity)
│  │  ├─ viz/ (NormalizationStage, CurveChart, GateStrip, SpreadChart, AttributionChart, LifecycleTimeline, Radar, HedgeCard)
│  │  ├─ store/ (replayStore.ts, settingsStore.ts, storyStore.ts)
│  │  ├─ lib/ (api.ts, bundle.ts, format.ts, motion.ts, tokens.ts)
│  │  └─ styles/
│  └─ e2e/ (Playwright demo rehearsal)
└─ docs/ (ASSUMPTIONS.md, METHODOLOGY.md, DEMO_SCRIPT.md, QA_REPORT.md)
```

---

## 5. WORKSTREAMS, GATES & BUILD ORDER

Run these as parallel agents. **File ownership prevents merge conflicts.**

| WS | Owner scope | Deliverable |
|---|---|---|
| **A — Data** | `backend/aurumlens/data`, `config/contracts.yaml`, `data/` | Real cleaned Parquet dataset + integrity report |
| **B — Engine** | `backend/aurumlens/core`, `engine`, `backtest`, `replay`, `api` | Tested analytics, snapshots, backtests, API |
| **C — Design system & shell** | `web/src/app`, `styles`, `lib`, `store` | Tokens, layout, nav, transitions, command palette, presenter mode |
| **D — Screens & visualizations** | `web/src/screens`, `viz` | 7 screens + signature animations |

**Gates**
- **G0 — Data access** (end of first phase of WS-A): Ask the user only if the app cannot obtain real data automatically (see §6.2).
- **G1 — Engine truth**: all `pytest` green, including look-ahead truncation test and hedge-ratio tests.
- **G2 — Full flow works** end-to-end in Bundle mode and API mode.
- **G3 — Demo sign-off**: Playwright rehearsal passes; screenshots + video attached; user approves.

**Priority tiers (if time runs short, cut from the bottom — but never cut P0):**
- **P0:** real data + cleaning + integrity page; normalization engine + signature animation; curve fit + curve screen; pair metrics + signal gates + Why-panel; Replay Lab with NO LOOK-AHEAD badge; walk-forward backtest with costs + attribution; Overview; Story Mode; offline bundle.
- **P1:** lifecycle timeline screen; hedge-ratio card; liquidity tiers; look-ahead audit indicator; showcase-day bookmarks; cost-sensitivity/break-even chart; command palette.
- **P2:** randomized-entry placebo test; parameter-sweep heatmap; sound-free micro-interactions polish; PDF/PNG export of a "Signal Report".

---

## 6. DATA ENGINEERING (Workstream A) — critical path

### 6.1 Sources
- **Primary:** MCX Daily Bhavcopy — https://www.mcxindia.com/market-data/bhavcopy (public, no API key).
- **Contract specs:** https://www.mcxindia.com/products/bullion/gold

Bhavcopy fields: `Symbol, Date, ExpiryDate, Open, High, Low, Close, Volume, OpenInterest` (plus possibly instrument/option fields — restrict to **futures** of the four gold symbols; drop options rows if present).

### 6.2 Getting the data (do NOT assume — discover)
I have **not** verified the MCX endpoint. Use this procedure:

1. **Use the browser subagent** to open the Bhavcopy page, pick a date, and **inspect the network request** the page makes (URL, method, headers, payload, response schema). Record findings in `docs/METHODOLOGY.md`. (Community libs such as `mcxlib` expose a `get_bhav_copy(trade_date='YYYYMMDD', instrument='ALL')` style call — treat that only as a hint; verify against what the site actually does.)
2. Implement `fetch.py` with: polite rate limiting (≥1 s/request, jitter), retries with backoff, realistic headers/session cookies as the site requires, per-date **raw response caching** (`data/raw/YYYY-MM-DD.json`) so re-runs are free, and resumability.
3. Backfill **as much history as is available** (target ≥ 12–18 months; GOLDTEN only exists from its **2025 listing** — shorter history for any pair involving it must be handled gracefully, see gate G-history).
4. **If MCX blocks automated access or the sandbox has no network:** implement `import_csv.py` so the user can drop manually downloaded Bhavcopy files (CSV/XLSX per date, or a bulk export) into `data/import/`; the same cleaning + validation pipeline runs on them. **Raise Gate G0** with clear instructions. Do NOT proceed with fake data.
5. Iterate over **calendar dates**, not assumed trading days — weekends/holidays will return "latest available day" (see 6.3), and that is the mechanism by which the true trading calendar is discovered.

### 6.3 Validation rules (the "Data Integrity" story — this must be airtight)
For every request:
- Send **`DD/MM/YYYY`** (verify actual request format on the site).
- Parse response `Date` explicitly as **`MM/DD/YYYY`** (may include a time part — handle it). **Never** let a library guess day/month order.
- Compare **Requested Date vs Returned Date**. If different → record `DATA DATE MISMATCH`, **do not silently accept**. Mismatched responses are stored under the *returned* date only if that date wasn't already fetched, and are flagged `holiday/invalid/future/malformed` (classify the cause). Persist a `date_audit` table: `requested, returned, status, cause, rows_downloaded`.
- `ExpiryDate` like `04SEP2026` → parse with `%d%b%Y` (uppercase month; set a locale-independent parser).
- `Symbol` values may be space-padded → `.strip().upper()`; count "symbols cleaned".
- Numeric coercion for OHLC/Volume/OI; count rejected rows by reason (`bad_number`, `bad_expiry`, `non_positive_price`, `unknown_symbol`, `option_row`, …).
- Detect **duplicates** on `(date, symbol, expiry)`.
- Detect **zero-volume** contracts (settlement not a traded price) and **missing contracts** (an expected active contract absent).
- Sanity: for each row check `Low ≤ Close ≤ High` when H/L are non-zero; flag otherwise.
- Persist an **integrity report** per date and aggregate (feeds the Data Integrity screen, §9.7).

### 6.4 Processed schema (Parquet)
`date, symbol, expiry_date, open, high, low, close, volume, open_interest, dte, traded(bool), source_file, row_hash, validation_flags`

Contract identity key: **`contract_id = f"{symbol}|{expiry_date:%Y-%m-%d}"`**.

### 6.5 Contract lifecycle tracking
For each `contract_id` derive: `first_seen`, `expiry`, `last_seen`, first date with volume>0, date volume crosses liquidity thresholds ("liquidity builds"), peak OI date, and configured **restricted / tender period** and **last-usable date**.
- Read tender/restricted-period and expiry-window rules from the MCX spec page and encode in `config/contracts.yaml` **with source URL and a "verified: true/false" flag**. Where the spec is not confirmable, use a conservative, clearly labeled default: *no new entries within `M` trading days of expiry, forced exit by `N` trading days before expiry* (config: `M=10`, `N=5`, marked ASSUMPTION).
- Contract mechanics (from the problem statement; encode in `contracts.yaml`):

| Contract | Trading Unit | Quoted Per | Purity | Expiry Window |
|---|---|---|---|---|
| GOLDM | 100 g | 10 g | 995 | 3rd–5th |
| GOLDTEN | 10 g | 10 g | 999 | 27th–31st |
| GOLDGUINEA | 8 g | 8 g | 999 | 27th–31st |
| GOLDPETAL | 1 g | 1 g | 999 | 27th–31st |

---

## 7. ANALYTICS ENGINE (Workstream B)

### 7.1 Normalization (target: ₹ / 10 g / 999-equivalent)
`norm = price × (10 / quote_g) × (999 / purity)`

| Contract | Factor |
|---|---|
| GOLDM | × 999/995 |
| GOLDTEN | × 1 |
| GOLDGUINEA | × 10/8 |
| GOLDPETAL | × 10 |

Keep factors **config-driven** and show a footnote: *purity scaling is a linear-purity assumption; real-world delivery premia/GST/quality differences are not modeled.*

### 7.2 Futures-curve analysis (per date, cross-section of all active traded contracts)
- Inputs per contract: normalized price, expiry, DTE (calendar days), volume, OI.
- Fit a **robust** fair-curve of `ln(norm)` vs `DTE/365` (Huber M-estimator via `statsmodels.RLM`; linear when few points, add quadratic only when ≥7 points). Weight by liquidity if configured.
- Guard rails: need ≥ `min_points` (default 4) traded contracts; if DTE spread is too narrow (< ~3 days) the slope is ill-conditioned → mark `curve_quality = "narrow-tenor"`, fall back to flat-level fit, and **say so in the UI**.
- Outputs: fitted curve, **annualized carry** (slope), classification **Contango / Backwardation / Flat-Mixed** (threshold configurable, e.g. |annualized carry| < 0.5% → Flat/Mixed, or low R²/inconsistent → Mixed), per-contract **residual** (use **leave-one-out** so a contract can't define its own fair value).
- The curve is a **same-day cross-section** (uses only date-*t* information → no look-ahead).

### 7.3 Pair spreads (all 6 pairs)
GOLDM↔GOLDTEN, GOLDM↔GOLDGUINEA, GOLDM↔GOLDPETAL, GOLDTEN↔GOLDGUINEA, GOLDTEN↔GOLDPETAL, GOLDGUINEA↔GOLDPETAL.

Leg selection each day: for symbols A and B, choose the `(symbol, expiry)` legs that (i) are tradable per lifecycle rules, (ii) have volume>0, (iii) minimize |expiry gap| and then maximize liquidity. Record `leg_roll` events when the chosen legs change (show as markers on charts so judges see no artificial jump).

Metrics per pair/day:
- `norm_diff` (₹/10g), `pct_spread`, `log_spread = ln(normA) − ln(normB)`
- `expiry_gap_days`
- `curve_adj_spread = log_spread − (f(DTE_A) − f(DTE_B))` (curve-implied part removed)
- baseline **median** and **MAD** of `curve_adj_spread` over a rolling lookback of **prior** days only
- **robust z** = `(x_t − median) / max(1.4826·MAD, mad_floor)` (floor configurable, e.g. 1 bp, to avoid exploding z on ultra-stable spreads)
- liquidity confidence (both legs), estimated cost, gross/net edge

### 7.4 Liquidity confidence (proxy only)
Per contract: score from **past-only** percentile ranks of volume and OI (rolling window), plus absolute floors → `HIGH / MEDIUM / LOW / VERY LOW`. Zero volume ⇒ `VERY LOW`. Pair liquidity = the weaker leg. Always display: **"EOD liquidity proxy — not real order-book depth."**

### 7.5 Cost model (configurable — labeled ASSUMPTION everywhere)
Round-trip cost per leg = brokerage + exchange transaction charges + CTT (sell side) + GST-on-charges + **slippage stress** (multiplied by liquidity tier: HIGH 1×, MEDIUM 1.5×, LOW 3×; VERY LOW = gate fail). Provide sensible placeholder defaults in `engine.yaml`, each with a comment *"placeholder — verify against your broker/exchange schedule"*. Expose sliders in the UI. Always show **Gross Edge → Estimated Costs → Net Edge**.
Never present slippage as observed bid/ask.

### 7.6 Signal Engine — ordered gates (each returns `PASS / FAIL / N/A` + value + threshold + message)
```
1. DATA QUALITY        (date validated, contracts traded, row valid)
2. NORMALIZED          (factors applied, legs mapped)
3. CURVE-ADJUSTED      (curve_quality acceptable, enough points)
4. STATISTICALLY UNUSUAL (|robust z| ≥ entry_z)
5. ENOUGH HISTORY      (≥ min_history observations; shorter for GOLDTEN pairs — say so)
6. LIQUIDITY           (both legs ≥ MEDIUM by default, configurable)
7. SAFE LIFECYCLE      (outside no-entry window; time-to-forced-exit ≥ expected hold)
8. SURVIVES COSTS      (net_edge ≥ min_net_edge_bps, with convergence-capture haircut)
9. EXPOSURE MATCHABLE  (hedge mismatch ≤ tolerance with integer lots)
→ SIGNAL only if ALL pass; otherwise NO SIGNAL with the FIRST failing gate as the headline reason
   (still show every gate's status so the judge sees the whole picture).
```
**Radar status** per pair: `NORMAL` (|z| < watch_z) · `WATCH` (watch_z ≤ |z| < entry_z) · `ELEVATED` (|z| ≥ entry_z but a later gate failed) · `POTENTIAL SIGNAL` (all gates pass). Suggested defaults: `watch_z=1.5`, `entry_z=2.5`, `exit_z=0.5` (config).

Expected edge = distance back to the rolling median × `convergence_capture` (default **0.5**, conservative; configurable).

Copy examples for rejection reasons (use exactly this plain style):
- *"NO SIGNAL — The apparent pricing difference does not survive estimated transaction costs."*
- *"NO SIGNAL — Insufficient liquidity: GOLDGUINEA volume proxy is VERY LOW."*
- *"NO SIGNAL — Contract too close to expiry to enter and exit safely."*
- *"NO SIGNAL — Difference is explained by normal futures-curve structure."*
- *"NO SIGNAL — Not enough history for a reliable baseline (GOLDTEN listed in 2025)."*

### 7.7 Exposure matching / hedge ratios
Pure-gold grams per lot = `unit_g × purity/1000`. Search small integer lot pairs minimizing pure-gold mismatch, tie-break on fewest lots. Expected: 1 GOLDTEN ≈ 10 GOLDPETAL; 1 GOLDGUINEA ≈ 8 GOLDPETAL; 4 GOLDTEN ≈ 5 GOLDGUINEA; 1 GOLDM ≈ 10 GOLDTEN / 100 GOLDPETAL (with ~0.4% purity-driven mismatch shown honestly). Display: Long contract · Short contract · Lots · Pure gold exposure (each leg) · **Exposure mismatch %**.

### 7.8 Walk-forward backtest
- Strictly sequential, one trading day at a time; at day *t* the model only sees data ≤ *t*.
- **Execution model:** signal from close of *t*; default fill at settlement of **t+1** (`execution_lag=1`, conservative). `lag=0` allowed only as an "Optimistic" toggle with a warning banner *"Same-day settlement is not a guaranteed fill."*
- Entry when all gates pass; exit on: |z| ≤ exit_z (convergence), **max holding period**, **lifecycle forced-exit**, or stop (optional, configurable).
- P&L computed from **the contracts actually held** (`contract_id` legs), marked daily using each leg's own settlement, in ₹ using lot factors: `pnl_per_lot = Δprice × (unit_g / quote_g)` (e.g., GOLDM: ×10, PETAL: ×1, GUINEA: ×1, TEN: ×1).
- Handle: entries/exits only on valid contract calendar days, legs whose price is a non-traded settlement, gaps in data.
- Inputs (all UI-exposed): pair, date range, lookback, entry z, exit z, cost assumptions, liquidity filter, max holding period, execution lag.
- Outputs: candidates found, accepted, rejected **with reasons histogram (Sankey/funnel)**, gross return, costs, net result, trade count, hit rate, max drawdown, average holding period, equity curve, trade blotter (each trade drill-down → legs, hedge ratio, dates, z at entry/exit, reason for exit).
- **Never hardcode or tune to a profitable outcome.**

### 7.9 Attribution — "is it relative value or just gold going up?"
Daily, for each open position:
- `total_gross_pnl_t = Σ legs q_i · lotfactor_i · (P_i,t − P_i,t−1)`
- `directional_t = net_pure_gold_grams_signed × Δ(reference_gold_price_per_gram_t)` where reference = average normalized price of the held legs (or most liquid leg; state which)
- `relative_value_t = total_gross_pnl_t − directional_t`
- `costs` booked at entry/exit
Show a **stacked attribution chart**: RELATIVE-VALUE + DIRECTIONAL GOLD − COSTS = NET, cumulative over time, plus summary numbers and daily-PnL-vs-gold-return correlation ("gold beta"). Include a **buy-and-hold gold benchmark** line for context.

### 7.10 Extra rigor (P1/P2)
- **Cost sensitivity / break-even cost chart** — net result vs cost (0–15 bps): shows exactly where the edge dies.
- **Placebo test** — same trade count/holding times at randomized entry dates (N≈500, fixed seed) vs actual result distribution.
- **Look-ahead audit** — for a sample of dates (or all), recompute the snapshot with data truncated at *t* and assert **bit-identical** output vs the full-run snapshot. Persist the result; show "Look-ahead audit: PASS · N dates verified" badge.

### 7.11 Pre-computed snapshots (for a buttery Replay Lab)
`replay/snapshots.py` runs the engine **sequentially** and writes one compact snapshot per trading date: raw + normalized prices per contract, curve params + fitted points + residuals, all 6 pair metrics + gate results + status, liquidity tiers, active signals, data-integrity summary. Ship as `data/bundle/snapshots.json` (chunk if large) + `data/bundle/manifest.json` (hashes, date range, generation time, engine version, config hash). The Replay Lab plays these from memory → zero network latency per frame.

### 7.12 Showcase-day bookmarks (real, not faked)
An offline job scans real snapshots and tags interesting dates **by rule**, e.g.:
- "Elevated z but rejected by costs" (best demo of the philosophy)
- "Largest |z| of the period"
- "Curve flips contango↔backwardation/flat"
- "Data date mismatch example (holiday)"
- "Thin-liquidity day"
- "Signal passed all gates" (only if it truly exists)
Store in `bundle/bookmarks.json` with the real reason text. The Story Mode uses these; if a category has no real example, the step adapts (see §12).

### 7.13 API (FastAPI)
```
GET  /api/health
GET  /api/meta                       → date range, symbols, config hash, engine version, mode
GET  /api/snapshot?date=YYYY-MM-DD   → snapshot (no-look-ahead)
GET  /api/series?pair=A-B&start&end  → normalized prices + spreads + z + leg_roll markers
GET  /api/curve?date=                → curve points + fit + residuals
GET  /api/contracts                  → lifecycle table
GET  /api/lifecycle?contract_id=
GET  /api/integrity                  → aggregate + per-date audit (requested vs returned)
POST /api/backtest                   → params → full results (+ attribution, funnel, blotter)
POST /api/backtest/sweep             → (P2) parameter grid
GET  /api/audit/lookahead
GET  /api/bookmarks
GET  /api/assumptions
```
Backtest responses are cached by param hash. Precompute the **default** backtest for each pair into the bundle for Bundle mode.

---

## 8. DESIGN SYSTEM (Workstream C) — "institutional research terminal"

**Mood:** Bloomberg-terminal precision × private-bank elegance. Dark, quiet, dense-but-breathable. Feels expensive.

**Tokens (implement as CSS variables + Tailwind theme):**
```css
:root {
  --bg-0:#060608;  --bg-1:#0B0B0F;  --bg-2:#111116;  --bg-3:#17171E;      /* charcoal surfaces */
  --line:rgba(226,190,110,.12); --line-strong:rgba(226,190,110,.28);    /* thin gold-tinted borders */
  --gold-300:#F1D98C; --gold-400:#E4C46B; --gold-500:#D4AF37; --gold-600:#A9861F; --gold-glow:rgba(212,175,55,.18);
  --cream:#F4EEDC; --cream-dim:#CFC8B4; --muted:#8A8574; --faint:#5C594E;
  --green:#3FB68B;  --green-bg:rgba(63,182,139,.10);   /* ONLY positive / valid / PASS */
  --red:#E5484D;    --red-bg:rgba(229,72,77,.10);      /* ONLY negative / error / FAIL */
  --radius:10px; --radius-lg:16px;
  --ease-out:cubic-bezier(.16,1,.3,1); --ease-in-out:cubic-bezier(.65,0,.35,1);
}
```
- **Status colors:** `NORMAL` = muted cream/gray · `WATCH` = gold-400 outline · `ELEVATED` = solid gold with soft glow · `POTENTIAL SIGNAL` = green ring (valid) · `NO SIGNAL` = quiet cream text with a red `✕` **only on the failing gate**. Do **not** use amber/orange/blue/purple/neon.
- **Typography:** UI = IBM Plex Sans; **all numbers = IBM Plex Mono with `font-variant-numeric: tabular-nums`**; brand/hero words = Cormorant Garamond, used sparingly. Tight, small caps section labels with letter-spacing.
- **Surfaces:** 1px hairline borders, subtle inner top highlight (`inset 0 1px 0 rgba(255,255,255,.03)`), very soft gold glow only on active/focused elements, faint film-grain/noise overlay (2–3% opacity), subtle radial vignette. Grid/axes in `--faint`, thin 1px lines, 2px for primary series.
- **Avoid:** neon, gradients-as-decoration, crypto-casino styling, stock photos, cartoon icons, generic admin-dashboard cards-with-shadows look, emoji. Icons: thin-stroke (Lucide, 1.25px stroke).
- **Layout:** left slim rail nav (7 screens) + top status bar. **Top bar always shows:** `Analysis Date` · `Data Source: MCX Daily Bhavcopy` · `NO LOOK-AHEAD MODE` badge (in Replay/Backtest) · `Data Quality: PASS/WARNING` · `Mode: API/Bundle` · `Assumptions` button · `⌘K`.
- **Global footer strip:** *"EOD settlement data · liquidity is a volume/OI proxy — not order-book depth · not investment advice."*
- Responsive down to 1280×720 (projector-safe); optimized for 1920×1080 and 16:9 screen-sharing. Provide a **Presentation scale** toggle (+15% type).
- Accessibility: keyboard nav, focus rings in gold, `prefers-reduced-motion` support (replace big motions with fades).

---

## 9. SCREENS (Workstream D)

All screens read from one **global replay clock** (`analysisDate`) so switching screens keeps context. Smooth shared-layout page transitions (fade + 8px rise, 350 ms, `--ease-out`).

### 9.1 Overview — "the whole project in 10 seconds"
- Header: Analysis Date (with prev/next), Data Source, Data Integrity chip, Active Signals count.
- **Four contract cards** (GOLDM · GOLDTEN · GOLDGUINEA · GOLDPETAL): **Raw Price · Normalized Price · Expiry · Days to Expiry · Volume · Open Interest · Liquidity Confidence** (+ tiny 30-day normalized sparkline, hollow marker if non-traded). Show the trading-unit/quote/purity as a small spec line.
- **NORMALIZE button** (hero CTA) → triggers the **Normalization Stage** animation (§10.1) in-place above the cards.
- **Relative Value Radar:** a 4-node polygon/graph with 6 edges (pairs). Edge thickness/glow = |z|; edge label = status chip. Click an edge → Relative Value screen for that pair. Hover shows z, curve-adj spread, top blocking gate.
- **Mini market curve** (contango/backwardation badge) and **Active Signals** panel ("None — and that's a valid answer" empty-state with elegant copy).
- Footer: the final one-liner and the philosophy quote.

### 9.2 Relative Value
- Pair selector (6 pairs, segmented control with the two contract names and ↔).
- **Metric tiles:** Raw Spread · Normalized Spread · Curve-Adjusted Spread · Historical Median · Robust Z-score (with a small bell-curve gauge showing where today sits) · Liquidity · Cost Estimate · Net Edge · Expiry Difference.
- **Chart 1:** normalized prices of both selected legs over time (with `leg_roll` markers, expiry markers).
- **Chart 2:** relative (curve-adjusted) spread over time with median line, ±entry_z bands (shaded), and the current point highlighted; brushable range; hover crosshair syncs both charts.
- **WHY THIS SIGNAL? panel — the gate strip:** Normalization · Curve Adjustment · Deviation · History · Liquidity · Lifecycle · Costs · Exposure. Gates light up **sequentially** (250 ms stagger). ✓ (green) / ✕ (red). Final stamp: `SIGNAL` or `NO SIGNAL` + one-sentence plain reason + the numbers that decided it.
- **Cost waterfall:** Gross Edge → Estimated Costs → Net Edge (animated bars).
- **Hedge Card:** Long contract · Short contract · Lots · Pure gold exposure · Exposure mismatch %.
- "Assumptions used" collapsible showing every parameter that produced this verdict.

### 9.3 Futures Curve
- Interactive D3 chart: **X = Expiry / DTE (toggle)**, **Y = normalized ₹/10g/999**. Dots = active contracts (size ∝ log(OI), fill = symbol tint in gold shades, hollow = non-traded). Line = **fitted fair curve** (with subtle confidence band). Vertical residual "stems" from each dot to the curve.
- Badge: **CONTANGO / BACKWARDATION / FLAT-MIXED** + annualized carry + curve quality.
- Click a dot → side panel: Symbol · Expiry · Normalized Price · Expected Curve Price · **Residual** (₹ and bps) · Volume · Open Interest · Liquidity tier.
- Date change → **dots glide and the curve morphs smoothly** (spring, 600 ms). Optional "ghost" trail of the previous 5 days' curves in faint gold.
- Draw-on animation on first load (stroke-dashoffset).

### 9.4 Replay Lab ("Historical Time Machine")
- Prominent badge: **NO LOOK-AHEAD MODE** (pulse once when replay starts) + the live **Look-ahead audit: PASS** chip.
- Date picker (calendar showing only valid trading days, with bookmark dots) + **date slider (scrubber)** with mini-timeline showing signal/elevated days as ticks.
- Controls: **⏮ Previous Day · ▶ Play · ⏸ Pause · ⏭ Next Day · Speed (0.5× 1× 2× 5× 10×)**. Keyboard: `←/→`, `Space`, `[`/`]`.
- Layout: left = 4 contract mini-cards + normalized values (counting numbers); center = **live curve** (dots moving); right = **pair radar/spread + z + gate strip**; bottom = **data horizon visual**: a timeline where everything right of "today" is dimmed & masked with a subtle lock icon and label *"Future — invisible to the model"*.
- As the date advances: numbers count smoothly, curve morphs, spread chart extends by one point, z-score needle moves, liquidity tiers update, and the **signal state chip animates between NORMAL / WATCH / ELEVATED / SIGNAL / NO SIGNAL**. A compact **event log** ("14 MAR — GOLDTEN↔GOLDPETAL z=+2.7 → NO SIGNAL: costs") streams in.
- "Jump to interesting day" menu from real bookmarks (§7.12).
- Show the **requested-vs-returned date** chip for the current day; on a mismatch day show the **DATA DATE MISMATCH** warning.

### 9.5 Backtest
- **Parameter panel** (left): Pair · Date Range · Historical Lookback · Entry Z · Exit Z · Transaction Cost (bps, with tier multipliers) · Liquidity Filter · Max Holding Period · Execution Lag (with warning at 0). A **Run Walk-Forward** button plays a **live progress animation** (day-by-day sweep across the timeline with counters incrementing: candidates → accepted → rejected).
- **Results (right):**
  - KPI row: Candidates · Accepted · Rejected · Gross Return · Estimated Costs · **Net Result** · Trades · Hit Rate · Max Drawdown · Avg Holding Period.
  - **Rejection funnel** (candidates → data → curve → z → history → liquidity → lifecycle → costs → exposure → accepted) with counts; hovering explains each.
  - **Equity curve** (net) with drawdown underlay and trade entry/exit markers; benchmark: gold buy-and-hold (scaled) as a faint dashed line.
  - **Attribution chart** (§7.9): stacked RELATIVE-VALUE + DIRECTIONAL − COSTS = NET.
  - **Cost sensitivity / break-even** chart; **Placebo distribution** (P2).
  - **Trade blotter** table (sortable) → row expands to a mini-timeline of that trade with legs, lots, entry/exit z, exit reason.
- **Verdict banner** (auto-generated honestly): e.g. *"No persistent edge survives estimated costs over this period — this is a valid analytical result."* or *"Marginal edge: net +X bps/trade over N trades; not statistically distinguishable from placebo."* etc. Auto-choose wording from the actual metrics using rule-based templates (never LLM-invented numbers, never hardcoded).
- "Reproduce" button: shows the exact params + config hash + data manifest hash.

### 9.6 Contract Lifecycle
- Timeline (Gantt-like) of all contract_ids, grouped by symbol, x = calendar. Each bar segmented into: **LISTED → LIQUIDITY BUILDS → ACTIVE TRADING → RESTRICTED / TENDER → EXPIRY** (the segment boundaries are computed from real data/config; show the source of each boundary on hover, and "ASSUMPTION" tag where config-defaulted).
- A vertical "today" cursor synced to the replay clock; highlights which contracts are usable for entry/exit **today**.
- Selecting a contract shows: first observed date, expiry, DTE, volume & OI development sparkline, tender/restricted window, last usable trading day, and **"valid entry/exit window"** shaded on the timeline.
- Overlay toggle: trades from the backtest drawn as bars inside their contract's valid window (proves every entry/exit is inside the contract calendar).

### 9.7 Data Integrity
- Big status: **DATA QUALITY: PASS / WARNING**.
- Tiles: Requested Date · Returned Date · Rows Downloaded · Valid Rows · Rejected Rows (with reason breakdown) · Symbols Cleaned · Expiry Dates Parsed · Missing Contracts · Zero-Volume Contracts · Duplicate Rows · Data Source · Last Cache Update.
- **Requested vs Returned table** for the whole backfill with mismatches highlighted (holiday / weekend / invalid) and the cause classification.
- **Traceability drawer:** click any number anywhere in the app → "Trace" panel shows contract_id, raw row(s), source file, row hash, transformation steps (strip → parse → normalize factor → curve residual). Every signal traces back to exchange data.
- **Look-ahead audit panel:** dates verified, result, method explanation (truncation invariance).
- **Assumptions & Methodology** section (mirrors `docs/ASSUMPTIONS.md`).

---

## 10. SIGNATURE ANIMATIONS (this is where it wins)

Rules: **animations must explain analytics**, never decorate. 60 fps, GPU transforms only, spring physics tuned (`stiffness 120–220, damping 20–28`), staggered, and disable-able (`prefers-reduced-motion` + a "Presentation: reduce motion" toggle).

### 10.1 NORMALIZATION STAGE — the hero moment (Overview, and inside Story Mode step 2)
Choreography (≈5 s total, replayable, pausable):
1. **RAW (0–1 s):** four raw prices sit in a row with their *spec chips* ("100 g · per 10 g · 995", "10 g · per 10 g · 999", "8 g · per 8 g · 999", "1 g · per 1 g · 999"). A horizontal "gold bar" glyph per contract is drawn at true relative size (100 g ≫ 10 g > 8 g > 1 g) to show they're physically different products. Numbers visibly disagree.
2. **UNIT (1–2.2 s):** each contract's gold bar **resizes into a common 10 g block** while a factor chip flies in (`× 10/8`, `× 10`, `× 1`, `× 1`) and the raw number **rolls (odometer)** to the unit-normalized value.
3. **PURITY (2.2–3.2 s):** GOLDM's block gets a thin gold "purity shimmer" as `× 999/995` applies; the others show `× 1`. Numbers roll again.
4. **CONVERGE (3.2–4.4 s):** the four values glide onto a shared **basis rail** with a label crossfading to **`₹ / 10 g / 999 purity`**. A subtle horizontal band shows the residual spread between them.
5. **SETTLE (4.4–5 s):** cards lock (soft gold border pulse). Caption: *"Now they're comparable."* The remaining differences are highlighted as the "explained by expiry?" question → primes the curve step.
Implementation: Framer Motion `layoutId` + `useSpring`/`animate` for odometer values, D3 interpolators for number rolling; keep a **timeline controller** (play/pause/scrub, replay button) so the presenter can restart it live.

### 10.2 ADJUST FOR TERM STRUCTURE
Button morphs the four dots from the basis rail into the **Futures Curve** (dots fly to their (DTE, price) positions), the fair curve **draws itself**, residual stems grow, badge (Contango/…) fades in.

### 10.3 Signal Gates strip
Gates activate left→right at 250 ms; each does: outline → spinner-free "scan" sweep → resolves to ✓ green or ✕ red with a tiny elastic pop; a failing gate dims all downstream gates to "not evaluated for headline" (still viewable). Final stamp (`NO SIGNAL` / `SIGNAL`) lands with a soft press + glow. Numbers in the gates count up.

### 10.4 Replay motion
Contract dots glide; curve morphs; spread chart extends with a leading "pen" dot; z needle swings with spring; date digits flip like a departure board; status chip cross-fades between NORMAL/WATCH/ELEVATED/SIGNAL/NO SIGNAL; the future region is masked with a slowly drifting shimmer.

### 10.5 Backtest run
A "scan line" moves across the timeline as days are processed; counters tick; entries/exits pop as markers; equity curve draws in progressively; attribution bars stack layer by layer (RV → directional → costs → net) on completion.

### 10.6 Global micro-interactions
Count-up numbers (tabular mono, no layout shift), hover crosshairs synced across charts, page transitions (fade+rise), tooltips with hairline borders, skeleton shimmers **only** while genuinely loading, gold focus glow. No bouncing, no confetti, no gratuitous parallax.

---

## 11. DEMO-DAY RELIABILITY (do not skip)

1. **Offline-first:** `make bundle` produces `data/bundle/` (snapshots, series, backtest defaults, bookmarks, integrity, manifest). The web app auto-falls back to Bundle mode if the API is down. **No runtime CDN/network dependencies** (fonts, icons, libs all bundled).
2. **Preflight screen** (`/preflight`, also `make preflight`): checks API health, bundle hash vs manifest, date range loaded, look-ahead audit status, fonts loaded, GPU/FPS estimate (warn <50 fps), viewport size, sample animation run. Big green **READY** or a red actionable list.
3. **One-command startup:** `make demo` (installs if needed, builds, starts API+web, waits for `/api/health`, opens Chrome in kiosk-ish mode at the Overview on the **default showcase date**).
4. **Deterministic:** all randomness (placebo) seeded; config hash + data manifest hash shown in the About modal.
5. **Presenter tools:** hidden Presenter Mode (`Shift+P`): number keys jump to story steps; `N`/`B` next/back; an on-screen small step indicator + speaker cue (visible only in a secondary "presenter notes" popup window, not on the shared screen); `R` resets to initial state; `Esc` exits.
6. **State reset:** a single **Reset Demo** action restores default date, parameters, and story position.
7. **Playwright rehearsal** (`make rehearse`): runs the complete demo flow headless+headed, asserts key elements exist at each step, saves screenshots per step and a `.webm` video → `docs/rehearsal/`. **This video is the backup plan** if the live demo fails on stage.
8. **Performance budget:** first paint < 2 s, interaction latency < 100 ms, Replay Lab ≥ 55 fps at 1080p, main bundle < 1.5 MB gz (lazy-load screens and ECharts modules).
9. **Error UX:** any failure shows a calm, branded, actionable message; never a blank page or stack trace.
10. **Time budget:** every story step must complete in the allotted time even at 2× replay speed.

---

## 12. THE 4–5 MINUTE JUDGE PRESENTATION (built into Story Mode)

Story Mode is a **guided overlay** (toggle-able; press `→` to advance) that drives the real app — no slides, no mock screens. Each step has a caption card (bottom-left, hairline border) and highlights the relevant UI. Timings total **≈ 4:30**.

| # | Time | Screen / Action | On-screen | What the presenter says |
|---|---|---|---|---|
| 0 | 0:00–0:20 | Overview (analysis date = default showcase date) | Four contract cards, radar | *"MCX lists gold four ways. These four prices look completely different — but every one of them is gold."* |
| 1 | 0:20–0:55 | Click **NORMALIZE** | Normalization Stage (§10.1) | *"Different size, quote unit, purity. We convert all four to one basis — ₹ per 10 g of 999 gold. Now they're comparable."* |
| 2 | 0:55–1:30 | Click **ADJUST FOR TERM STRUCTURE** | Futures Curve draws, Contango/… badge, residual stems | *"But normalized prices still shouldn't match — the contracts expire on different dates. We fit the futures curve and separate carry from what's left over: the residual."* |
| 3 | 1:30–2:15 | Relative Value → pick the most interesting real pair | Median, residual, robust z, charts, leg-roll markers | *"Here's today's unexplained difference versus its own history. It looks unusual. Most tools would shout 'arbitrage'."* |
| 4 | 2:15–2:55 | Gate strip runs | Sequential gates ✓✓✓✓✓ then result (real outcome) | *"AurumLens asks nine questions before it speaks: data quality, deviation, history, liquidity, lifecycle, costs, exposure… It found a difference — and [rejected it because the edge doesn't survive realistic costs / passed every gate]. We optimize for signal quality, not signal frequency."* |
| 5 | 2:55–3:40 | Replay Lab → press Play at 2× | NO LOOK-AHEAD badge, future masked, dots glide, signals flicker | *"At every step, the model only sees what was knowable that day. We prove it: recomputing any day with the future deleted gives identical output — audit PASS."* |
| 6 | 3:40–4:10 | Backtest → Run walk-forward → attribution | Funnel, equity, attribution | *"Walk-forward, after costs, using the contracts actually held. And we separate relative-value P&L from just being long gold. [Honest verdict]."* |
| 7 | 4:10–4:30 | Data Integrity (+ Lifecycle glance) | Requested vs returned, trace drawer | *"Every number traces to the exchange file — including holiday days where MCX quietly returned a different date, which we catch. Not an arbitrage bot: a validation platform. When there's nothing real to say, AurumLens stays quiet."* |

**Outcome-adaptive narration (critical):** Steps 4 and 6 have three pre-written variants selected automatically from the real results:
- **A — No edge survives costs:** *"A rigorous no-edge result is the right answer when the data says so."*
- **B — Marginal edge:** *"Small net edge, comparable to placebo — we flag it as unproven rather than sell it."*
- **C — Edge survives:** *"Net-positive after costs, and attribution shows it's relative value, not gold drift — with the caveat that settlement ≠ fill."*
Never claim more than the numbers support.

**Judge Q&A cheat-sheet** (put in `docs/DEMO_SCRIPT.md` and Presenter notes):
- *"Isn't settlement price non-executable?"* → Yes; we say so in the UI; lag-1 execution and slippage stress reduce that optimism; still an approximation.
- *"Why not just use near-month?"* → Artificial roll jumps; we track `(symbol, expiry)`.
- *"How do you know there's no look-ahead?"* → Truncation-invariance audit + baseline uses strictly prior days.
- *"Volume = liquidity?"* → No; proxy only, labeled, and it lowers signal confidence.
- *"Is the edge just gold rising?"* → Attribution separates it; gold beta reported.
- *"Why is the sample short for GOLDTEN?"* → Listed 2025; the history gate says so.
- *"Are costs real?"* → Configurable assumptions; sensitivity/break-even chart shows where the edge dies.

---

## 13. QUALITY BAR & ACCEPTANCE CHECKLIST

**Correctness (pytest):**
- [ ] Normalization factors correct for all four contracts (unit test with hand-computed values).
- [ ] Hedge ratios: TEN:PETAL = 1:10 (0% mismatch), GUINEA:PETAL = 1:8 (0%), TEN:GUINEA = 4:5 (0%), GOLDM:PETAL/TEN mismatch ≈ 0.4% reported.
- [ ] Parser: requested `DD/MM/YYYY` vs returned `MM/DD/YYYY` handled; ambiguous dates (e.g. 03/04) parsed correctly; `04SEP2026` parsed; padded symbols trimmed; duplicates and zero-volume detected; date mismatch flagged.
- [ ] Contract identity is `(symbol, expiry)`; no continuous series anywhere; roll events logged.
- [ ] **Truncation invariance** (no look-ahead) passes for sampled dates (all dates in bundle build).
- [ ] Backtest P&L reconciles: sum of daily leg P&L = trade P&L; attribution components sum to net exactly (±rounding).
- [ ] Costs monotonic: raising costs never increases net result.
- [ ] Lifecycle: no entry/exit outside valid window; forced exit works.
- [ ] Zero-volume legs never used in statistics or fills.

**Product (Playwright + browser subagent screenshots):**
- [ ] All 7 screens render at 1920×1080 and 1280×720 with no overflow.
- [ ] Normalization animation plays end-to-end, replayable, no jank.
- [ ] Curve morph on date change, dots glide.
- [ ] Gate strip sequencing + correct reasons.
- [ ] Replay: play/pause/step/slider/speed all work; badge visible; future masked.
- [ ] Backtest run works in API mode; Bundle mode shows precomputed defaults.
- [ ] Data Integrity trace drawer works from at least 5 different UI numbers.
- [ ] Assumptions drawer lists every active parameter.
- [ ] Offline test: kill API → app degrades gracefully to Bundle mode.
- [ ] Reduced-motion mode works.
- [ ] Copy audit: no phrase implies guaranteed profit/arbitrage; no fake-data text anywhere.

**Visual polish review (self-critique loop):** after each screen, capture a screenshot, critique against Section 8 (spacing, alignment, contrast, tabular numerals, restraint), and fix. Repeat until it looks like a premium research terminal, not a student dashboard.

---

## 14. FINAL DELIVERABLES

1. Running app (`make demo`) with real MCX data loaded.
2. `data/bundle/` offline bundle + manifest.
3. `docs/ASSUMPTIONS.md`, `docs/METHODOLOGY.md`, `docs/DEMO_SCRIPT.md`, `docs/QA_REPORT.md`.
4. `docs/rehearsal/` — per-step screenshots + full demo `.webm` (backup video).
5. Antigravity artifacts: Implementation Plan, Task List, screenshots, and walkthrough recording.
6. A short **README** with 3 commands: setup, data, demo.

---

# PART B — REFERENCE CODE (starting points — improve, test, don't blindly copy)

> These snippets encode the *intended semantics*. Verify every field name and format against the **actual** MCX response you discover in §6.2.

### B1. `core/contracts.py` — specs, normalization, lot factors
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class ContractSpec:
    symbol: str
    unit_g: float      # trading unit (grams)
    quote_g: float     # price quoted per (grams)
    purity: int        # e.g. 995 / 999

SPECS = {
    "GOLDM":      ContractSpec("GOLDM",      100, 10, 995),
    "GOLDTEN":    ContractSpec("GOLDTEN",     10, 10, 999),
    "GOLDGUINEA": ContractSpec("GOLDGUINEA",   8,  8, 999),
    "GOLDPETAL":  ContractSpec("GOLDPETAL",    1,  1, 999),
}
TARGET_G, TARGET_PURITY = 10, 999

def normalize(price: float, s: ContractSpec) -> float:
    """INR per 10 g of 999-equivalent gold."""
    return price * (TARGET_G / s.quote_g) * (TARGET_PURITY / s.purity)

def lot_factor(s: ContractSpec) -> float:
    """INR P&L per lot per INR 1 change in the QUOTED price."""
    return s.unit_g / s.quote_g

def pure_gold_g(s: ContractSpec) -> float:
    return s.unit_g * s.purity / 1000.0
```

### B2. `data/clean.py` — parsing & validation
```python
import pandas as pd, numpy as np
from datetime import datetime

KEEP = {"GOLDM", "GOLDTEN", "GOLDGUINEA", "GOLDPETAL"}

def parse_returned_date(s: str) -> pd.Timestamp:
    s = str(s).strip().split(" ")[0]                    # drop any time part
    return pd.Timestamp(datetime.strptime(s, "%m/%d/%Y")) # explicit MM/DD/YYYY — never let pandas guess

def parse_expiry(s: str) -> pd.Timestamp:
    return pd.Timestamp(datetime.strptime(str(s).strip().upper(), "%d%b%Y"))  # e.g. 04SEP2026

def clean_bhav(rows: list[dict], requested: pd.Timestamp):
    stats = dict(rows_downloaded=len(rows), rejected={}, symbols_cleaned=0,
                 expiry_parsed=0, duplicates=0, zero_volume=0, date_mismatch=False)
    def rej(reason): stats["rejected"][reason] = stats["rejected"].get(reason, 0) + 1
    out = []
    for r in rows:
        raw_sym = str(r.get("Symbol", ""))
        sym = raw_sym.strip().upper()
        if sym != raw_sym: stats["symbols_cleaned"] += 1
        if sym not in KEEP: rej("unknown_symbol"); continue
        try:
            d = parse_returned_date(r["Date"]); e = parse_expiry(r["ExpiryDate"])
            stats["expiry_parsed"] += 1
            o, h, l, c = (float(r[k]) for k in ("Open", "High", "Low", "Close"))
            vol, oi = float(r.get("Volume", 0) or 0), float(r.get("OpenInterest", 0) or 0)
        except Exception:
            rej("parse_error"); continue
        if c <= 0: rej("non_positive_price"); continue
        flags = []
        if vol == 0: flags.append("zero_volume"); stats["zero_volume"] += 1
        if h and l and not (l <= c <= h): flags.append("close_outside_hl")
        out.append(dict(date=d, symbol=sym, expiry_date=e, open=o, high=h, low=l,
                        close=c, volume=vol, open_interest=oi, traded=vol > 0,
                        validation_flags=",".join(flags)))
    df = pd.DataFrame(out)
    if not df.empty:
        dup = df.duplicated(["date", "symbol", "expiry_date"], keep="first")
        stats["duplicates"] = int(dup.sum()); df = df[~dup]
        returned = df["date"].iloc[0]
        stats["requested"], stats["returned"] = requested, returned
        stats["date_mismatch"] = bool(returned != requested)   # NEVER silently accept
    return df, stats
```

### B3. `core/curve.py` — robust fair curve + leave-one-out residuals
```python
import numpy as np, pandas as pd, statsmodels.api as sm

class CurveFit:
    def __init__(self, coefs, degree, quality, r2): self.c, self.deg, self.quality, self.r2 = coefs, degree, quality, r2
    def predict_log(self, dte):
        x = np.asarray(dte, float) / 365.0
        return sum(self.c[i] * x**i for i in range(self.deg + 1))
    @property
    def annualized_carry(self): return float(self.c[1]) if self.deg >= 1 else 0.0  # ~ d ln(P)/d(year)

def _design(x, deg): return np.column_stack([x**i for i in range(deg + 1)])

def fit_curve(day: pd.DataFrame, min_points=4) -> CurveFit | None:
    d = day[day["traded"]]
    if len(d) < min_points: return None
    x, y = d["dte"].to_numpy(float) / 365.0, np.log(d["norm"].to_numpy(float))
    if np.ptp(x) < 3 / 365.0:                                   # ill-conditioned slope
        return CurveFit([float(np.median(y)), 0.0], 1, "narrow-tenor", 0.0)
    deg = 2 if len(d) >= 7 else 1
    res = sm.RLM(y, _design(x, deg), M=sm.robust.norms.HuberT()).fit()
    yhat = _design(x, deg) @ res.params
    ss_res, ss_tot = np.sum((y - yhat) ** 2), np.sum((y - y.mean()) ** 2)
    return CurveFit(list(res.params), deg, "ok", float(1 - ss_res / ss_tot) if ss_tot > 0 else 0.0)

def loo_residuals(day: pd.DataFrame) -> pd.Series:
    """Residual of each contract vs a curve fitted WITHOUT that contract."""
    res = {}
    for idx in day.index:
        f = fit_curve(day.drop(idx))
        res[idx] = np.nan if f is None else float(np.log(day.at[idx, "norm"]) - f.predict_log(day.at[idx, "dte"]))
    return pd.Series(res)

def classify(carry_ann: float, r2: float, quality: str, flat_band=0.005) -> str:
    if quality != "ok" or r2 < 0.3 or abs(carry_ann) < flat_band: return "FLAT / MIXED"
    return "CONTANGO" if carry_ann > 0 else "BACKWARDATION"
```

### B4. `engine/stats.py` — robust z (past-only baseline)
```python
import numpy as np

def robust_z(x_t: float, past: np.ndarray, mad_floor: float = 1e-4, min_obs: int = 30):
    """past must contain ONLY observations strictly before t."""
    past = past[~np.isnan(past)]
    if len(past) < min_obs: return None, None, len(past)
    med = np.median(past)
    mad = 1.4826 * np.median(np.abs(past - med))
    return (x_t - med) / max(mad, mad_floor), med, len(past)
```

### B5. `engine/hedge.py` — integer exposure matching
```python
from math import floor, ceil
from aurumlens.core.contracts import SPECS, pure_gold_g

def hedge_ratio(sym_a: str, sym_b: str, max_a=20, max_b=250):
    ga, gb = pure_gold_g(SPECS[sym_a]), pure_gold_g(SPECS[sym_b])
    best = None
    for qa in range(1, max_a + 1):
        t = qa * ga / gb
        for qb in {floor(t), ceil(t)}:
            if not (1 <= qb <= max_b): continue
            mismatch = abs(qa * ga - qb * gb) / (qa * ga)
            key = (round(mismatch, 3), qa + qb)               # prefer low mismatch, then few lots
            if best is None or key < best[0]:
                best = (key, dict(lots_a=qa, lots_b=qb, gold_a_g=qa*ga, gold_b_g=qb*gb, mismatch_pct=100*mismatch))
    return best[1]
# expected: ('GOLDTEN','GOLDPETAL') -> 1:10, 0% ; ('GOLDGUINEA','GOLDPETAL') -> 1:8, 0% ; ('GOLDTEN','GOLDGUINEA') -> 4:5, 0%
```

### B6. `backtest/walkforward.py` — skeleton (semantics matter more than syntax)
```python
def run_walkforward(data, pair, params, cfg):
    days = trading_days(data)                       # from validated data, NOT an assumed calendar
    pos, trades, ledger, funnel = None, [], [], Funnel()
    pending_entry = None
    for i, t in enumerate(days):
        view = data.loc[data.date <= t]             # <-- the ONLY data the model may touch
        snap = engine_step(view, t, pair, params, cfg)   # z uses history strictly < t

        # 1) execute pending entry from yesterday's decision at today's settlement (lag=1)
        if pending_entry and legal_to_trade(pending_entry.legs, t, "entry"):
            pos = open_position(pending_entry, price_at=t, view=view, costs=cfg.costs); pending_entry = None

        # 2) mark-to-market the held contracts (their OWN settlements) + attribution
        if pos:
            pnl = mark(pos, view, t)                 # sum(q_i * lot_factor_i * dP_i)
            directional = pos.net_pure_gold_g * d_ref_gold_per_g(pos, view, t)
            ledger.append(dict(date=t, gross=pnl, directional=directional,
                               relative=pnl - directional))
            reason = exit_reason(pos, snap, t, params)  # convergence | max_hold | lifecycle | stop
            if reason: close_position(pos, t, reason, costs=cfg.costs, trades=trades, ledger=ledger); pos = None

        # 3) new decision (only if flat) — recorded for execution at t+lag
        if pos is None and pending_entry is None:
            funnel.record(snap.gates)                # every rejection reason counted
            if snap.signal == "SIGNAL":
                pending_entry = make_entry(snap, decided_on=t)
    return summarize(trades, ledger, funnel)
```

### B7. `tests/test_no_lookahead.py` — truncation invariance
```python
def test_snapshots_are_truncation_invariant(full_data, sample_dates):
    full = build_snapshots(full_data)                       # sequential run over ALL data
    for t in sample_dates:
        truncated = full_data[full_data.date <= t]          # delete the future
        snap_t = build_snapshots(truncated)[t]              # recompute using only data <= t
        assert canonical_json(snap_t) == canonical_json(full[t]), f"LOOK-AHEAD DETECTED at {t}"
```

### B8. Hedge / lot factor / cost unit tests (must exist)
```python
def test_normalization_factors():
    assert normalize(100000, SPECS["GOLDM"])       == 100000 * 999/995
    assert normalize(100000, SPECS["GOLDTEN"])     == 100000
    assert normalize(80000,  SPECS["GOLDGUINEA"])  == 80000 * 10/8
    assert normalize(10000,  SPECS["GOLDPETAL"])   == 10000 * 10

def test_lot_factors():
    assert lot_factor(SPECS["GOLDM"]) == 10 and lot_factor(SPECS["GOLDPETAL"]) == 1
```

### B9. `web/src/viz/NormalizationStage.tsx` — animation skeleton
```tsx
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

type Row = { symbol: string; raw: number; unit: number; norm: number;
             unitFactor: string; purityFactor: string; specChip: string; grams: number };

export function NormalizationStage({ rows, playKey }: { rows: Row[]; playKey: number }) {
  const [phase, setPhase] = useState<"raw"|"unit"|"purity"|"converge"|"settle">("raw");
  useEffect(() => {
    const t = [0, 1000, 2200, 3200, 4400].map((ms, i) =>
      setTimeout(() => setPhase(["raw","unit","purity","converge","settle"][i] as any), ms));
    return () => t.forEach(clearTimeout);
  }, [playKey]);
  return (
    <div className="relative grid grid-cols-4 gap-6">
      {rows.map(r => <ContractLane key={r.symbol} row={r} phase={phase} />)}
      <BasisRail visible={phase === "converge" || phase === "settle"} label="₹ / 10 g / 999 purity" />
    </div>
  );
}

function OdometerNumber({ from, to, run, ms = 900 }: { from: number; to: number; run: boolean; ms?: number }) {
  const mv = useMotionValue(from);
  const text = useTransform(mv, v => v.toLocaleString("en-IN", { maximumFractionDigits: 0 }));
  useEffect(() => { const c = animate(mv, run ? to : from, { duration: ms/1000, ease: [.16,1,.3,1] }); return c.stop; }, [run, to]);
  return <motion.span className="font-mono tabular-nums">{text}</motion.span>;
}
// ContractLane: draws a gold bar sized ∝ grams that animates to the 10 g block (layout animation),
// flies in the factor chip (unitFactor, then purityFactor), and rolls raw → norm with <OdometerNumber/>.
// BasisRail: horizontal hairline with the four values landing on it and the residual band beneath.
```

### B10. `web/src/store/replayStore.ts` — global clock
```ts
import { create } from "zustand";
export const useReplay = create<{
  dates: string[]; i: number; playing: boolean; speed: number;
  set: (p: Partial<any>) => void; next: () => void; prev: () => void; toggle: () => void;
}>((set, get) => ({
  dates: [], i: 0, playing: false, speed: 1,
  set: p => set(p),
  next: () => set(s => ({ i: Math.min(s.i + 1, s.dates.length - 1) })),
  prev: () => set(s => ({ i: Math.max(s.i - 1, 0) })),
  toggle: () => set(s => ({ playing: !s.playing })),
}));
// A single rAF-driven ticker advances `i` at (600ms / speed) while playing; screens subscribe to `dates[i]`.
// Snapshots are read from the in-memory bundle → zero network latency per frame.
```

---

# PART C — FINAL INSTRUCTIONS TO THE AGENT

1. **Start with data (Workstream A).** Without real data nothing else matters. If access fails, trigger Gate G0 with exact instructions; never substitute fake data.
2. **Build the engine test-first** (normalization, hedge, parser, truncation invariance) before wiring UI.
3. **Build the design system and the Normalization Stage early** — it's the first thing judges see and sets the quality bar.
4. **Verify visually as you go** with the browser subagent; iterate on polish until every screen looks like a premium financial research terminal.
5. **Be honest in every number and every sentence of copy.** The product's credibility *is* its honesty: real data, no look-ahead, costs included, gold-drift separated out, and `NO SIGNAL` as a respectable answer.
6. **Finish with the Playwright rehearsal + backup video**, then request G3 sign-off.

> *AurumLens does not ask "Can we find a trade today?" It asks: "Is this price difference statistically unusual, economically meaningful, liquid enough, valid within the contract lifecycle, and large enough to survive costs?" If the answer is no — AurumLens stays quiet.*
