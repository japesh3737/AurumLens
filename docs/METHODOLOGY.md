# AurumLens — Mathematical & Data Engineering Methodology

### Hack In Hills '26 · Institutional Relative-Value Terminal

---

## 1. Data Engineering & Exchange Feed Acquisition
- **Primary Source**: Multi Commodity Exchange of India (MCX) Daily Bhavcopy feed (`https://www.mcxindia.com/market-data/bhavcopy/GetDateWiseBhavCopy`).
- **Access Protocol**: Browser-impersonated TLS client (`primp`) mimicking Chromium HTTP/2 TLS fingerprints to bypass Akamai GHost WAF without synthetic proxies.
- **Date Handling & Integrity Audit**:
  - Request Date format: `DD/MM/YYYY`.
  - Returned Date format: `MM/DD/YYYY` (explicit parser prevents day/month ambiguity).
  - Exchange holiday detection: when MCX returns an earlier date on a weekend/holiday query, AurumLens tags it as a `DATA DATE MISMATCH` in the audit log rather than silently accepting it.
  - Zero-volume detection: settlement prices without traded volume are flagged as non-executable proxy prices and excluded from curve fitting.

---

## 2. Purity & Unit Normalization
All four gold futures contracts are converted to a common numeraire: **₹ per 10 grams of 999-equivalent gold**:
$$\text{Normalized Price} = \text{Quoted Price} \times \left(\frac{10}{\text{quote\_g}}\right) \times \left(\frac{999}{\text{purity}}\right)$$

- **GOLDM**: $\text{Price} \times (10 / 10) \times (999 / 995) = \text{Price} \times \frac{999}{995}$
- **GOLDTEN**: $\text{Price} \times (10 / 10) \times (999 / 999) = \text{Price} \times 1.0$
- **GOLDGUINEA**: $\text{Price} \times (10 / 8) \times (999 / 999) = \text{Price} \times \frac{10}{8}$
- **GOLDPETAL**: $\text{Price} \times (10 / 1) \times (999 / 999) = \text{Price} \times 10.0$

---

## 3. Futures Curve & Term Structure Carry
On each trading date $t$, the cross-section of all active traded contracts is fitted using a robust Huber M-estimator (RLM) of log normalized price versus tenor in years:
$$\ln(\text{norm}_i) = \beta_0 + \beta_1 \left(\frac{\text{DTE}_i}{365}\right) + \epsilon_i$$
- **Annualized Carry**: $\beta_1 \approx \frac{d \ln(P)}{d(\text{year})}$.
- **Leave-One-Out (LOO) Residuals**: For every contract $i$, the curve is re-fitted excluding contract $i$ to prevent self-referential bias:
$$\text{Residual}_i = \ln(\text{norm}_i) - \hat{f}_{-i}\left(\frac{\text{DTE}_i}{365}\right)$$

---

## 4. Curve-Adjusted Cross-Contract Spread
For contracts $A$ and $B$, the curve-implied calendar carry is explicitly subtracted to isolate the pure relative anomaly:
$$\text{Spread}_{\text{curve-adj}} = (\ln(\text{norm}_A) - \ln(\text{norm}_B)) - (\hat{f}(\text{DTE}_A) - \hat{f}(\text{DTE}_B))$$

---

## 5. Strict Zero Look-Ahead Baseline & Robust Z-Score
The rolling median and Median Absolute Deviation (MAD) of the spread are calculated **strictly over past days ($< t$)**:
$$z_t = \frac{\text{Spread}_t - \text{Median}(\text{Past}_{<t})}{\max\left(1.4826 \times \text{MAD}(\text{Past}_{<t}), 10^{-4}\right)}$$
Truncation Invariance test mathematically proves bit-identical outputs when future rows are deleted.

---

## 6. Integer Lot Exposure Matching
To prevent directional gold beta, integer lots $q_A, q_B$ are solved to minimize pure physical gold exposure mismatch:
$$\text{Exposure Mismatch} = \frac{|q_A \cdot g_A - q_B \cdot g_B|}{q_A \cdot g_A} \le 0.5\%$$
- 1 GOLDTEN $\approx$ 10 GOLDPETAL (0.0% mismatch)
- 1 GOLDGUINEA $\approx$ 8 GOLDPETAL (0.0% mismatch)
- 4 GOLDTEN $\approx$ 5 GOLDGUINEA (0.0% mismatch)
- 1 GOLDM $\approx$ 10 GOLDTEN (0.4% purity mismatch)

---

## 7. Performance Attribution
$$\text{Total P\&L}_t = \sum_i q_i \cdot \text{LotFactor}_i \cdot \Delta P_{i,t}$$
$$\text{Directional}_t = \text{Net Pure Gold Grams} \times \Delta(\text{Reference Gold Price per Gram})$$
$$\text{Relative-Value}_t = \text{Total P\&L}_t - \text{Directional}_t$$
$$\text{Net P\&L}_t = \text{Relative-Value}_t + \text{Directional}_t - \text{Costs}_t$$
