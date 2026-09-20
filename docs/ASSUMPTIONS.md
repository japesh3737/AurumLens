# AurumLens — Model Assumptions & Parameters

> **Audit Notice**: In accordance with Rule 6 of the AurumLens Master Prompt, all friction, liquidity, and statistical parameters are explicitly categorized as configurable analytical assumptions. AurumLens never represents hypothetical slippage or settlement proxy fills as observed exchange order-book depth.

---

## 1. Physical Normalization Assumptions
- **Linear Purity Scaling**: Quoted contract prices are scaled to 999 fineness via `price × (999 / purity)`. Real-world physical delivery premia, GST differences upon physical conversion, and refinery stamp differences are not modeled.
- **Reference Basis**: Standardized to **₹ per 10 grams of 999 pure gold equivalent**.

---

## 2. Friction & Transaction Cost Schedule (Round-Trip)
| Component | Assumption (bps) | Basis / Frequency | Notes |
|---|---|---|---|
| **Brokerage** | 1.0 bps | Per leg turn (4.0 bps RT) | Placeholder schedule |
| **Exchange Turnover Fees** | 0.25 bps | Per leg turn (1.0 bps RT) | MCX headline turnover rate |
| **GST on Charges** | 18.0% | On brokerage + exchange | Standard statutory rate |
| **CTT (Commodity Tax)** | 1.0 bps | Sell-side only (2.0 bps RT) | Applied to sell turnover |
| **Base Slippage Stress** | 1.0 bps | Per leg turn (4.0 bps RT) | Scaled by liquidity tier multiplier |

### Liquidity Tier Slippage Multipliers
- **HIGH Tier**: `1.0×` (Base stress)
- **MEDIUM Tier**: `1.5×` (+50% slippage stress)
- **LOW Tier**: `3.0×` (Tripled slippage buffer)
- **VERY_LOW Tier**: `10.0×` / Automatic Gate 6 Rejection

---

## 3. Signal Engine Thresholds
- **Entry Significance**: $|z| \ge 2.50\sigma$
- **Exit Convergence**: $|z| \le 0.50\sigma$
- **Baseline Window**: 45 trading days rolling lookback
- **Minimum History Floor**: 20 observations (10 observations allowed for GOLDTEN due to 2025 listing)
- **Convergence Capture Haircut**: **50%** (conservative assumption: only half of the theoretical statistical deviation back to the median is captured in practice)

---

## 4. Lifecycle & Delivery Constraints
- **Restricted Entry Window**: Entry is disallowed when $\text{DTE} \le 10$ calendar days prior to contract expiry.
- **Forced Exit Window**: Mandatory closing of open positions when $\text{DTE} \le 5$ calendar days prior to contract expiry (avoiding physical delivery tender liability).
- **Maximum Trade Holding Duration**: 20 trading days.

---

## 5. Execution Model
- **Default Fill Execution**: **Lag = 1** (decision made at Close of Day $t$, filled at official settlement of Day $t+1$).
- Same-day fills ($\text{Lag} = 0$) are strictly flagged as optimistic approximations.
