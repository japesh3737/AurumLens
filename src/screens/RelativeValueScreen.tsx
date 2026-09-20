import React, { useState, useEffect } from 'react';
import { DailySnapshot } from '../types';
import { SpreadChart } from '../viz/SpreadChart';
import { GateStrip } from '../viz/GateStrip';
import { HedgeCard } from '../viz/HedgeCard';
import { formatINR, formatBps, formatNumber } from '../lib/format';
import { fetchSeries } from '../lib/api';
import { ArrowRight, Gauge, HelpCircle, Layers, Play } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { ScreenId } from '../app/Navbar';

interface RelativeValueProps {
  snapshot: DailySnapshot | null;
  selectedPair: string;
  onSelectPair: (pair: string) => void;
  onNavigate?: (screen: ScreenId) => void;
}

const ALL_PAIRS = [
  'GOLDTEN-GOLDPETAL',
  'GOLDGUINEA-GOLDPETAL',
  'GOLDTEN-GOLDGUINEA',
  'GOLDM-GOLDTEN',
  'GOLDM-GOLDGUINEA',
  'GOLDM-GOLDPETAL',
];

export function RelativeValueScreen({ snapshot, selectedPair, onSelectPair, onNavigate }: RelativeValueProps) {
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const { setAssumptionsOpen } = useSettingsStore();

  const pairData = snapshot?.pairs?.[selectedPair];
  const [symA, symB] = selectedPair.split('-');

  useEffect(() => {
    let mounted = true;
    fetchSeries(selectedPair).then((res) => {
      if (mounted && res && res.points) {
        setSeriesData(res.points);
      }
    });
    return () => {
      mounted = false;
    };
  }, [selectedPair, snapshot?.date]);

  if (!snapshot || !pairData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-ink-muted dark:text-silver font-mono text-sm">
        Loading relative-value intelligence for {selectedPair}...
      </div>
    );
  }

  const sp = (pairData.spread || {}) as any;
  const costs = (pairData.costs || {}) as any;
  const hedge = (pairData.hedge || {}) as any;
  const z = pairData.z_score;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-ivory dark:bg-charcoal text-ink dark:text-ivory transition-colors duration-150">
      {/* Screen Header & 6-Pair Segmented Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hair dark:border-hair/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gold font-bold px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
              Relative-Value Intelligence
            </span>
            <span className="text-xs font-mono text-ink-muted dark:text-silver">
              Session Date: <strong className="text-ink dark:text-ivory">{snapshot.date}</strong>
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-ivory mt-1">
            {symA} <span className="text-gold font-sans font-light">↔</span> {symB}
          </h1>
        </div>

        {/* Right Action Block: Segmented Pair Selector & Backtest CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-ivory dark:bg-gunmetal p-1 rounded-lg border border-hair dark:border-hair/50 flex-wrap">
            {ALL_PAIRS.map((p) => (
              <button
                key={p}
                onClick={() => onSelectPair(p)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                  selectedPair === p
                    ? 'bg-gold text-charcoal font-bold shadow-sm'
                    : 'text-ink-muted dark:text-silver hover:text-ink dark:hover:text-ivory hover:bg-hair/50 dark:hover:bg-charcoal'
                }`}
              >
                {p.replace(/GOLD/g, 'G.')}
              </button>
            ))}
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('backtest')}
              className="btn-gold flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold cursor-pointer shrink-0 shadow-sm"
              title="Test this pair directly in the Walk-Forward Backtest Engine"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              BACKTEST PAIR →
            </button>
          )}
        </div>
      </div>

      {/* 8 Primary KPI Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Normalized Spread */}
        <div className="terminal-card p-3 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
          <span className="text-[9px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Norm Diff</span>
          <div className="text-base font-mono font-bold text-ink dark:text-ivory mt-1">
            {formatINR(sp.norm_diff)}
          </div>
          <span className="text-[9px] font-mono text-ink-faint dark:text-silver/60">per 10g 999</span>
        </div>

        {/* 2. Curve-Adjusted Spread */}
        <div className="terminal-card p-3 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
          <span className="text-[9px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Curve-Adj Spread</span>
          <div className="text-base font-mono font-bold text-gold mt-1">
            {formatBps(sp.curve_adj_spread_bps)}
          </div>
          <span className="text-[9px] font-mono text-ink-faint dark:text-silver/60">basis points</span>
        </div>

        {/* 3. Robust Z-Score */}
        <div className="terminal-card p-3 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
          <span className="text-[9px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Robust Z-Score</span>
          <div className={`text-base font-mono font-bold mt-1 ${
            Math.abs(z || 0) >= 2.0 ? 'text-copper' : 'text-ink dark:text-ivory'
          }`}>
            {z != null ? (z >= 0 ? `+${z.toFixed(2)}` : z.toFixed(2)) : '—'}
          </div>
          <span className="text-[9px] font-mono text-ink-faint dark:text-silver/60">MAD Normalized</span>
        </div>

        {/* 4. Expiry Gap */}
        <div className="terminal-card p-3 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
          <span className="text-[9px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Expiry Gap</span>
          <div className="text-base font-mono font-bold text-ink dark:text-ivory mt-1">
            {sp.expiry_gap_days || 0}d
          </div>
          <span className="text-[9px] font-mono text-ink-faint dark:text-silver/60">Tenor delta</span>
        </div>

        {/* 5. Pure Gold Mismatch */}
        <div className="terminal-card p-3 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
          <span className="text-[9px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Hedge Mismatch</span>
          <div className="text-base font-mono font-bold text-ink dark:text-ivory mt-1">
            {hedge.mismatch_pct != null ? `${hedge.mismatch_pct.toFixed(2)}%` : '—'}
          </div>
          <span className="text-[9px] font-mono text-ink-faint dark:text-silver/60">Physical delta</span>
        </div>

        {/* 6. Est Friction Cost */}
        <div className="terminal-card p-3 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
          <span className="text-[9px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Round-Trip Cost</span>
          <div className="text-base font-mono font-bold text-termred mt-1">
            {formatINR(costs.total_cost_inr)}
          </div>
          <span className="text-[9px] font-mono text-ink-faint dark:text-silver/60">{costs.total_cost_bps?.toFixed(1) || 0} bps</span>
        </div>

        {/* 7. Gross Edge */}
        <div className="terminal-card p-3 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
          <span className="text-[9px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Gross Edge</span>
          <div className="text-base font-mono font-bold text-ink dark:text-ivory mt-1">
            {formatINR(pairData.gross_edge_inr)}
          </div>
          <span className="text-[9px] font-mono text-ink-faint dark:text-silver/60">Before friction</span>
        </div>

        {/* 8. Net Edge */}
        <div className="terminal-card p-3 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
          <span className="text-[9px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Net Surviving Edge</span>
          <div className={`text-base font-mono font-bold mt-1 ${
            (pairData.net_edge_inr || 0) > 0 ? 'text-termgreen' : 'text-ink-muted dark:text-silver'
          }`}>
            {formatINR(pairData.net_edge_inr)}
          </div>
          <span className="text-[9px] font-mono text-ink-faint dark:text-silver/60">Net Alpha</span>
        </div>
      </div>

      {/* 9-Gate Sequential Filter Strip */}
      <GateStrip
        gates={pairData.gates || []}
        verdict={pairData.verdict}
        headlineReason={pairData.headline_reason}
        animateSequential={true}
      />

      {/* Active Traded Legs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leg A Card */}
        {sp.leg_a && (
          <div className="terminal-card p-4 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card border-t-2 border-t-gold">
            <div className="flex items-center justify-between pb-2 border-b border-hair dark:border-hair/40 mb-3">
              <span className="text-xs font-mono font-bold text-gold uppercase">Leg A · Long/Short Candidate</span>
              <span className="text-[10px] font-mono text-ink-muted dark:text-silver">{sp.leg_a.contract_id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div>
                <span className="text-[10px] text-ink-muted dark:text-silver block">Settlement</span>
                <span className="font-bold text-ink dark:text-ivory">{formatINR(sp.leg_a.raw_price)}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted dark:text-silver block">Normalized</span>
                <span className="font-bold text-gold">{formatINR(sp.leg_a.norm_price)}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted dark:text-silver block">Expiry / DTE</span>
                <span className="font-bold text-ink dark:text-ivory">{sp.leg_a.expiry_date} ({sp.leg_a.dte}d)</span>
              </div>
            </div>
          </div>
        )}

        {/* Leg B Card */}
        {sp.leg_b && (
          <div className="terminal-card p-4 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card border-t-2 border-t-copper">
            <div className="flex items-center justify-between pb-2 border-b border-hair dark:border-hair/40 mb-3">
              <span className="text-xs font-mono font-bold text-copper uppercase">Leg B · Hedge Counterpart</span>
              <span className="text-[10px] font-mono text-ink-muted dark:text-silver">{sp.leg_b.contract_id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div>
                <span className="text-[10px] text-ink-muted dark:text-silver block">Settlement</span>
                <span className="font-bold text-ink dark:text-ivory">{formatINR(sp.leg_b.raw_price)}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted dark:text-silver block">Normalized</span>
                <span className="font-bold text-gold">{formatINR(sp.leg_b.norm_price)}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted dark:text-silver block">Expiry / DTE</span>
                <span className="font-bold text-ink dark:text-ivory">{sp.leg_b.expiry_date} ({sp.leg_b.dte}d)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Middle Row: Historical Spread Series Chart & Hedge Exposure Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SpreadChart
            data={seriesData}
            pairName={selectedPair}
            currentZ={z}
            currentSpreadBps={sp.curve_adj_spread_bps}
          />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <HedgeCard
            symA={symA}
            symB={symB}
            lotsA={hedge.lots_a || 1}
            lotsB={hedge.lots_b || 1}
            goldAGrams={hedge.pure_gold_a_g || 0}
            goldBGrams={hedge.pure_gold_b_g || 0}
            mismatchPct={hedge.mismatch_pct || 0}
            ratioStr={hedge.ratio_str || '1 : 1'}
          />

          {/* Friction & Cost Stress Assumptions Card */}
          <div className="terminal-card p-4 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-hair dark:border-hair/40 mb-3">
              <span className="text-xs uppercase tracking-widest text-gold font-semibold">
                Friction Hurdle Model
              </span>
              <button
                onClick={() => setAssumptionsOpen(true)}
                className="text-[10px] text-ink-muted dark:text-silver hover:text-gold flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" /> Adjust
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted dark:text-silver">Exchange Turnover:</span>
                <span className="text-ink dark:text-ivory">0.0021%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted dark:text-silver">Commodity Transaction Tax (CTT):</span>
                <span className="text-ink dark:text-ivory">0.01% (Sell leg)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted dark:text-silver">Brokerage Assumption:</span>
                <span className="text-ink dark:text-ivory">{costs.brokerage_bps || 1.0} bps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted dark:text-silver">Liquidity Stress Slippage:</span>
                <span className="text-ink dark:text-ivory">{costs.slippage_bps || 1.0} bps</span>
              </div>
              <div className="pt-2 border-t border-hair/60 dark:border-hair/40 flex justify-between font-bold text-copper">
                <span>Estimated Round-Trip Drag:</span>
                <span>{costs.total_cost_bps?.toFixed(1) || 0} bps ({formatINR(costs.total_cost_inr)})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RelativeValueScreen;
