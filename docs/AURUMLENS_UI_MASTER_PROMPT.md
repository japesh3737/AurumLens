# AurumLens UI Master Design System & Reengineering Specification

> **Institutional Precision · Dual-Mode Ivory/Charcoal · Physical Gold Parity**  
> *Author: Google Deepmind Antigravity System*  
> *Target Architecture: React 18 + TypeScript + Tailwind CSS v3 + Vite*

---

## 1. Executive Summary & Design Vision

AurumLens is an institutional relative-value trading workstation for MCX Gold futures. Unlike conventional crypto or retail fintech dashboards bathed in aggressive neon gradients or unreadable dark-only schemes, AurumLens adheres to **financial workstation restraint**:
- **Warm Ivory Light Mode** is the primary default, evoking high-end editorial and physical bullion certificate elegance.
- **Deep Charcoal Dark Mode** provides low-fatigue nighttime monitoring via instantaneous CSS variable inversion.
- **Gold Restraint Rule**: Gold (`#C9A227`) is reserved strictly for high-conviction visual anchors — active tabs, CTA buttons, primary price series, and verified signal verdicts. It is never used as large background fills.
- **Micro-tactile feedback**: Physical trading operations (replay tape scrubbing, contract normalization, gate sequencing) leverage customized mechanical interactions (`SplitFlapText`, `RetroButton`, `CursorGrid`, `HalideTopoHero`, `IntegrationCard`).

---

## 2. Color Tokens & Theme Inversion

All color styling is managed via design tokens declared in `web/src/index.css` under `:root` and `.dark` scopes. **Never hardcode raw hex values in JSX or Tailwind utility classes.**

### Token Palette Definition

| Token | CSS Variable | Light Mode (Default) | Dark Mode (.dark) | Semantic Purpose |
|---|---|---|---|---|
| `--gold` | `var(--gold)` | `#C9A227` | `#C9A227` | Primary brand anchor, CTA buttons, active state, hero lines |
| `--gold-deep` | `var(--gold-deep)` | `#A9840F` | `#A9840F` | Gold hover / active pressed states |
| `--charcoal` | `var(--charcoal)` | `#17191C` | `#17191C` | App framing (Navbar, Sidebar, Footer); dark-mode root canvas |
| `--gunmetal` | `var(--gunmetal)` | `#25282D` | `#25282D` | Nested panels in charcoal frames; dark-mode card background |
| `--ivory` | `var(--ivory)` | `#F7F4EC` | `#17191C` (swaps) | Main content workspace background |
| `--ivory-card` | `var(--ivory-card)` | `#FFFDF7` | `#25282D` (swaps) | Card, panel, and modal foreground surface |
| `--silver` | `var(--silver)` | `#B8BCC2` | `#B8BCC2` | Secondary contract accent (`GOLDPETAL`), neutral benchmark |
| `--copper` | `var(--copper)` | `#B87333` | `#B87333` | Tertiary contract accent (`GOLDGUINEA`), opportunity alerts |
| `--platinum` | `var(--platinum)` | `#8A9BA8` | `#8A9BA8` | Structural / reference indicators |
| `--ink` | `var(--ink)` | `#202124` | `#F7F4EC` (swaps) | Primary body and numerical typography |
| `--ink-muted` | `var(--ink-muted)` | `#5F6368` | `#B8BCC2` (swaps) | Subheads, secondary metric descriptions |
| `--ink-faint` | `var(--ink-faint)` | `#80868B` | `#80868B` | Table column headers, timestamps, hairline labels |
| `--hair` | `var(--hair)` | `#E6E0D0` | `#33383F` (swaps) | Structural dividing borders and card hairlines |
| `--hair-strong` | `var(--hair-strong)` | `#D5CEBC` | `#454C55` (swaps) | Emphasized card boundaries |
| `--green` | `var(--green)` | `#2E8B57` | `#2E8B57` | Positive PnL / Alpha / Passed Gate |
| `--green-tint` | `var(--green-tint)` | `rgba(46,139,87,0.11)` | `rgba(46,139,87,0.18)` | Soft badge / background cell tint |
| `--red` | `var(--red)` | `#C94C4C` | `#C94C4C` | Negative PnL / Friction Cost / Gate Rejection |
| `--red-tint` | `var(--red-tint)` | `rgba(201,76,76,0.11)` | `rgba(201,76,76,0.18)` | Soft badge / background cell tint |

---

## 3. Typography Architecture

Three distinct type families govern the hierarchy:

1. **Display Serif (`Fraunces`)**:
   - Usage: App Title, Screen Headings (`h1`, `h2`), Topographic Hero headlines, Major Verdict announcements.
   - Tailwind class: `font-display`
   - Weight: `600` (SemiBold) or `700` (Bold).

2. **Workstation Grotesk (`Inter`)**:
   - Usage: Body copy, navigation links, explanations, tooltips, descriptions.
   - Tailwind class: `font-sans`
   - Weight: `400` (Regular) and `500` (Medium).

3. **Monospace Tabular (`IBM Plex Mono`)**:
   - Usage: Contract tickers (`GOLDM-25FEB`), dates (`28FEB2025`), prices (`₹78,450`), basis points (`+14.2 bps`), gate IDs (`G1..G9`), and data tables.
   - CSS property: `font-feature-settings: "tnum" 1; font-variant-numeric: tabular-nums;`
   - Tailwind class: `font-mono`

---

## 4. Application Rules & Component Contracts

### Rule 1: Dual-Frame App Shell
- The application header (`StatusBar.tsx`) and navigation bar (`Navbar.tsx`) are permanently anchored on `--charcoal` (`#17191C`) with nested subpanels in `--gunmetal` (`#25282D`).
- The main content area dynamically renders `--ivory` (`#F7F4EC`) in light mode and `--charcoal` (`#17191C`) in dark mode.

### Rule 2: Surfaces & Card Construction
- Never use `#FFFFFF` as a background surface. Use `bg-ivory-card` (`#FFFDF7`).
- All cards inherit `.terminal-card` styling with a 1px `--hair` border and soft box shadow:
  ```html
  <div className="terminal-card bg-ivory-card dark:bg-gunmetal border border-hair dark:border-hair/50 p-5 rounded-lg shadow-card">
    ...
  </div>
  ```

### Rule 3: Contract Identity & Top-Border Hairlines
Every contract card or relative-value leg card must feature an unmistakable 2px top accent line matching its metal commodity tier:
- `GOLD` & `GOLDM` (100g / 1kg standard): `border-t-2 border-t-gold`
- `GOLDGUINEA` (8g retail coin): `border-t-2 border-t-copper`
- `GOLDPETAL` (1g micro contract): `border-t-2 border-t-silver`
- Standard metric / neutral cards: `border-t-2 border-t-hair` or hairline border.

### Rule 4: Number & Delta Coloring (The 11% Rule)
- Positive deltas (+INR or +bps) render with `text-termgreen` (`#2E8B57`) and an optional soft background tint `bg-termgreen-tint` (`rgba(46,139,87, 0.11)`).
- Negative deltas (-INR or -bps) render with `text-termred` (`#C94C4C`) and an optional soft background tint `bg-termred-tint` (`rgba(201,76,76, 0.11)`).
- Neutral metrics render in `text-ink` (`#202124`) with `font-mono tabular-nums`.

### Rule 5: Buttons & Interactive Elements
- **Primary CTA (`.btn-gold`)**:
  ```html
  <button className="btn-gold px-4 py-2 rounded-lg font-mono font-bold text-xs">
    EXECUTE REPLAY
  </button>
  ```
  Background: `#C9A227`, Text: `#17191C`, Hover: `#A9840F`.
- **Secondary CTA (`.btn-secondary`)**:
  Background: `bg-ivory-card dark:bg-gunmetal`, border: `border-hair dark:border-hair/50`, text: `text-ink dark:text-ivory`. Hover: `hover:bg-hair/30`.
- **Transport Controls**: Use 3D mechanical `RetroButton`.

---

## 5. Five Specialized UI Components & Workflow Placement

The 5 custom components have strict, purposeful placement across the application:

### 1. `SplitFlapText`
- **Location 1**: `web/src/app/StatusBar.tsx` (Top right pill). Displays rotating operational status: `MCX BHAVCOPY: PASS`, `FEED SYNCED`, `NO LOOK-AHEAD`.
- **Location 2**: `web/src/screens/OverviewScreen.tsx` (Signal Engine Verdict banner). Displays high-impact institutional state: `SIGNAL LIVE` or `NO SIGNAL`.
- **Theme**: Charcoal tile background (`#17191C`) with gold lettering (`#C9A227`) and split flap horizontal seam.

### 2. `RetroButton`
- **Location**: `web/src/screens/ReplayLabScreen.tsx` (Tape deck transport bar).
- **Function**: Provides tactile spring-loaded 3D clicks for `BACK (1D)`, `PLAY / PAUSE REPLAY`, and `STEP (1D)`.
- **Variants**: `gold` for Play/Pause, `gunmetal` for Step controls, `neutral` for Reset.

### 3. `CursorGrid`
- **Location 1**: `web/src/screens/BacktestScreen.tsx` (Ambient background canvas). Simulates market matrix lines that react to cursor coordinates.
- **Location 2**: Empty / loading states across screens.
- **Theme**: Subtle gold coordinates (`rgba(201, 162, 39, 0.15)`) with radial cursor proximity glow, auto-disabled if `prefers-reduced-motion` is detected.

### 4. `HalideTopoHero`
- **Location**: Modal showcase launched from "SHOWCASE HERO" button in `StatusBar.tsx` or Command Palette (`Ctrl+K`).
- **Function**: 3D interactive topographic contour visualization symbolizing physical gold price discovery and institutional leave-one-out surface reconstruction.
- **Interaction**: Parallax mouse tilt with grain filter overlay and gold foil serif headings.

### 5. `IntegrationCard`
- **Location**: `web/src/screens/DataIntegrityScreen.tsx` (Multi-Feed Convergence section).
- **Function**: Visualizes live data pipelines converging from **MCX Bhavcopy**, **NSE Comdex**, **RBI Reference**, **IBJA Benchmark**, **LBMA London Gold**, and **WGC Physical Stocks** into the central AurumLens Analytics Engine.
- **Visuals**: Animated pulsating SVG conduits and status indicators.

---

## 6. Implementation Template for Future Agents

When modifying existing screens or adding new analytics modules, adhere to this boilerplate structure:

```tsx
import React from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { formatINR, formatBps } from '../lib/format';

export function AnalyticsModule() {
  const { darkMode } = useSettingsStore();

  return (
    <div className="p-6 space-y-6 bg-ivory dark:bg-charcoal text-ink dark:text-ivory transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-hair dark:border-hair/50">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-mono text-gold font-bold px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
            Module Badge
          </span>
          <h1 className="font-display text-2xl font-semibold mt-1">
            Section Title
          </h1>
        </div>
      </div>

      {/* Grid of Cards with Metal Accents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gold Leg Card */}
        <div className="terminal-card border-t-2 border-t-gold border-hair dark:border-hair/50 p-4 bg-ivory-card dark:bg-gunmetal shadow-card">
          <span className="text-xs font-mono text-ink-muted dark:text-silver">GOLDM 25FEB</span>
          <div className="text-xl font-mono font-bold text-ink dark:text-ivory mt-1">
            {formatINR(78420)}
          </div>
          <span className="inline-block mt-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-termgreen-tint text-termgreen">
            +14.2 bps
          </span>
        </div>
      </div>
    </div>
  );
}
```
