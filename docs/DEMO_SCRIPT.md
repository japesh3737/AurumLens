# AurumLens — 4:30 Minute Judge Demo Script & Q&A

### Hack In Hills '26 · Relative-Value Intelligence for MCX Gold Futures

---

## The Presentation Narrative

### Step 0: Market Overview (0:00 – 0:20)
- **Screen**: Overview Screen (Showcase Date)
- **Presenter Spoken**:
  > *"MCX lists gold four ways: GOLDM, GOLDTEN, GOLDGUINEA, and GOLDPETAL. When retail traders look at these prices on a broker screen, they look completely disparate — one is ₹78,000, another is ₹8,000. But every single one of them represents pure physical gold. How do you trade relative value when the products themselves are fundamentally different?"*

### Step 1: Normalization Hero Choreography (0:20 – 0:55)
- **Action**: Click **NORMALIZE CONTRACTS**
- **Presenter Spoken**:
  > *"Watch what happens when we click Normalize. Different trading units, different quote sizes, and different purities — GOLDM is 995 fineness, while the others are 999. In five precise stages, AurumLens resizes the physical contracts to a standard 10g bar, applies purity scaling, and glides them onto one common institutional numeraire: ₹ per 10 grams of 999 gold. Now they are mathematically comparable."*

### Step 2: Term Structure & Carry Adjustment (0:55 – 1:30)
- **Action**: Click **Inspect Curve** or Navigate to **Futures Curve**
- **Presenter Spoken**:
  > *"Even after normalization, these prices still shouldn't match. Why? Because they expire on different dates. A naive model screams 'arbitrage!'. AurumLens doesn't. We fit a robust Huber fair futures curve across the same-day cross section. We separate calendar carry from what's left over: the genuine leave-one-out residual."*

### Step 3: Cross-Contract Relative Value (1:30 – 2:15)
- **Action**: Navigate to **Relative Value** screen (e.g. `GOLDTEN-GOLDPETAL`)
- **Presenter Spoken**:
  > *"Here is today's curve-adjusted spread versus its historical baseline. Retail bots would immediately flag this as an entry. But AurumLens asks nine strict questions before it ever triggers a signal."*

### Step 4: The 9-Gate Signal Filter (2:15 – 2:55)
- **Action**: Watch Gate Strip run sequentially
- **Presenter Spoken**:
  > *"Look at this 9-gate sequential filter: Data Quality, Normalization, Curve Stability, Statistical Significance, History Depth, Liquidity Proxy, Safe Lifecycle, Cost Survival, and Integer Exposure Matching. AurumLens eliminated this candidate because the spread does not survive realistic transaction friction. We optimize for signal quality, not signal frequency. In our terminal, 'NO SIGNAL' is a respectable, first-class analytical verdict."*

### Step 5: Replay Lab & No Look-Ahead Audit (2:55 – 3:40)
- **Action**: Navigate to **Replay Lab**, press **Play at 2×**
- **Presenter Spoken**:
  > *"Welcome to the Replay Lab. Notice this gold badge: NO LOOK-AHEAD MODE. Everything right of today's date is locked and masked. We prove this mathematically: if we recompute any historical day with future data deleted from disk, the outputs are bit-identical. Look-ahead audit: PASS."*

### Step 6: Walk-Forward Backtest & Attribution (3:40 – 4:10)
- **Action**: Navigate to **Backtest**, show Attribution Chart
- **Presenter Spoken**:
  > *"Our walk-forward backtest uses realistic lag-1 execution and actual held contract settlement accounting. More importantly: look at this stacked attribution chart. We decompose returns into genuine Relative Value versus simple Directional Gold Beta. We don't take credit for gold going up."*

### Step 7: Data Integrity & Closing (4:10 – 4:30)
- **Action**: Navigate to **Data Integrity** screen
- **Presenter Spoken**:
  > *"Every single number traces directly back to authentic MCX exchange files. We even caught exchange holidays where MCX returned a prior date. AurumLens is not an arbitrage bot — it is an institutional relative-value intelligence and validation platform."*

---

## Judge Q&A Cheat Sheet

- **Q: Isn't settlement price non-executable?**
  - *A: "Yes, exactly. We state prominently that EOD settlement is an approximation. That is why our backtest defaults to Lag-1 execution with slippage stress buffers."*
- **Q: Why is the history shorter for GOLDTEN?**
  - *A: "GOLDTEN was only listed on MCX in 2025. Gate 5 explicitly adjusts its history threshold and informs the user."*
- **Q: Does volume equal liquidity?**
  - *A: "No. Volume is an EOD proxy, not order-book depth. That's why low volume triggers our liquidity penalty gate."*
- **Q: How do you know there's no look-ahead bias?**
  - *A: "We run a Truncation Invariance test that recomputes snapshots with all future data deleted and verifies bit-identical equality."*
