import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Layers, Download } from 'lucide-react';
import { AttributionChart } from '../viz/AttributionChart';
import { CursorGrid } from '../components/ui/cursor-grid';
import { runBacktestApi } from '../lib/api';
import { formatINR, formatNumber } from '../lib/format';
import ReactECharts from 'echarts-for-react';

const PAIRS = [
  'GOLDTEN-GOLDPETAL',
  'GOLDGUINEA-GOLDPETAL',
  'GOLDTEN-GOLDGUINEA',
  'GOLDM-GOLDTEN',
  'GOLDM-GOLDGUINEA',
  'GOLDM-GOLDPETAL',
];

export function BacktestScreen({ defaultPair = 'GOLDTEN-GOLDPETAL' }: { defaultPair?: string }) {
  const [selectedPair, setSelectedPair] = useState(defaultPair);
  const [entryZ, setEntryZ] = useState(2.5);
  const [exitZ, setExitZ] = useState(0.5);
  const [maxHolding, setMaxHolding] = useState(20);
  const [executionLag, setExecutionLag] = useState(1);
  const [brokerageBps, setBrokerageBps] = useState(1.0);
  const [slippageBps, setSlippageBps] = useState(1.0);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const executeBacktest = () => {
    setLoading(true);
    runBacktestApi({
      pair: selectedPair,
      entry_z: entryZ,
      exit_z: exitZ,
      max_holding_days: maxHolding,
      execution_lag: executionLag,
      brokerage_bps: brokerageBps,
      base_slippage_bps: slippageBps,
    }).then((res) => {
      setResults(res);
      setLoading(false);
    });
  };

  const resetParams = () => {
    setEntryZ(2.5);
    setExitZ(0.5);
    setMaxHolding(20);
    setExecutionLag(1);
    setBrokerageBps(1.0);
    setSlippageBps(1.0);
  };

  const exportCsv = () => {
    if (!equityData || equityData.length === 0) return;
    const header = 'Date,Day_Index,Net_Cumulative_PnL_INR\n';
    const rows = equityData.map((e: any, idx: number) => 
      `${e.date || ''},${idx + 1},${Math.round(e.cum_net || 0)}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aurumlens_${selectedPair}_backtest.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    executeBacktest();
  }, [selectedPair]);

  const equityData = results?.equity_curve || [];
  const funnel = results?.funnel || {};

  // ECharts equity curve option with gold accent
  const equityOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#17191C',
      borderColor: '#D4AF37',
      textStyle: { color: '#F7F4EC', fontFamily: 'IBM Plex Mono', fontSize: 11 },
      formatter: (params: any) => {
        const item = params[0];
        return `${item.axisValue}<br/>Net Cumulative P&L: <strong>₹${Math.round(item.data).toLocaleString('en-IN')}</strong>`;
      },
    },
    grid: { left: '70px', right: '25px', top: '25px', bottom: '25px' },
    xAxis: {
      type: 'category',
      data: equityData.map((e: any) => e.date),
      axisLine: { lineStyle: { color: '#D5CEBD' } },
      axisLabel: { color: '#5F6368', fontFamily: 'IBM Plex Mono', fontSize: 9 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(212,175,55,0.12)' } },
      axisLabel: {
        color: '#5F6368',
        fontFamily: 'IBM Plex Mono',
        fontSize: 10,
        formatter: (v: number) => `₹${Math.round(v)}`,
      },
    },
    series: [
      {
        name: 'Cumulative Net P&L',
        type: 'line',
        data: equityData.map((e: any) => e.cum_net),
        lineStyle: { color: '#D4AF37', width: 2.2 },
        showSymbol: false,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(212,175,55,0.20)' },
              { offset: 1, color: 'rgba(212,175,55,0.0)' },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-ivory dark:bg-charcoal text-ink dark:text-ivory relative transition-colors duration-150">
      {/* Background CursorGrid for ambient market lattice in empty / loading state */}
      {(loading || !results) && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <CursorGrid
            cellSize={64}
            color="#D4AF37"
            radius={120}
            falloff="smooth"
            holdTime={500}
            fadeDuration={900}
            lineWidth={1.4}
            maxOpacity={0.55}
            fillOpacity={0.05}
            gridOpacity={0.06}
            clickPulse={false}
          />
        </div>
      )}

      {/* Screen Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hair dark:border-hair/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gold font-bold px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
              Walk-Forward Engine
            </span>
            <span className="text-xs font-mono text-ink-muted dark:text-silver">Strict Lag-1 Execution</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-ivory mt-1">
            Realistic Walk-Forward Backtest & PnL Attribution
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={exportCsv}
            disabled={!equityData || equityData.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ivory-card dark:bg-gunmetal hover:bg-hair/50 dark:hover:bg-charcoal border border-hair dark:border-hair/60 text-xs font-mono font-semibold text-ink dark:text-ivory transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
            title="Download full walk-forward equity series as CSV"
          >
            <Download className="w-3.5 h-3.5 text-gold" />
            EXPORT TRADES (CSV)
          </button>
          <button
            onClick={executeBacktest}
            disabled={loading}
            className="btn-gold flex items-center gap-2 px-5 py-2 text-xs font-mono font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {loading ? 'CALCULATING...' : 'RUN BACKTEST'}
          </button>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (4 Cols) */}
        <div className="lg:col-span-4 terminal-card p-5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card space-y-5">
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-gold font-semibold block mb-2">
              Select Pair
            </span>
            <div className="grid grid-cols-1 gap-1.5 font-mono text-xs">
              {PAIRS.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPair(p)}
                  className={`px-3 py-2 rounded text-left transition-all cursor-pointer ${
                    selectedPair === p
                      ? 'bg-gold/15 text-gold font-bold border border-gold'
                      : 'bg-ivory dark:bg-charcoal border border-hair dark:border-hair/50 text-ink dark:text-silver hover:border-gold/40'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-4 border-t border-hair dark:border-hair/50 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-ink-muted dark:text-silver">Entry Threshold:</span>
                <span className="text-gold font-bold">|z| ≥ {entryZ.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={1.5}
                max={4.0}
                step={0.1}
                value={entryZ}
                onChange={(e) => setEntryZ(parseFloat(e.target.value))}
                className="w-full accent-gold bg-hair dark:bg-charcoal h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-ink-muted dark:text-silver">Exit Threshold:</span>
                <span className="text-gold font-bold">|z| ≤ {exitZ.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={1.5}
                step={0.1}
                value={exitZ}
                onChange={(e) => setExitZ(parseFloat(e.target.value))}
                className="w-full accent-gold bg-hair dark:bg-charcoal h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-ink-muted dark:text-silver">Max Holding Period:</span>
                <span className="text-ink dark:text-ivory font-bold">{maxHolding} days</span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                step={1}
                value={maxHolding}
                onChange={(e) => setMaxHolding(parseInt(e.target.value))}
                className="w-full accent-gold bg-hair dark:bg-charcoal h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-ink-muted dark:text-silver">Brokerage Fee:</span>
                <span className="text-ink dark:text-ivory">{brokerageBps.toFixed(1)} bps</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={3.0}
                step={0.1}
                value={brokerageBps}
                onChange={(e) => setBrokerageBps(parseFloat(e.target.value))}
                className="w-full accent-gold bg-hair dark:bg-charcoal h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-ink-muted dark:text-silver">Base Slippage Stress:</span>
                <span className="text-ink dark:text-ivory">{slippageBps.toFixed(1)} bps</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.5}
                value={slippageBps}
                onChange={(e) => setSlippageBps(parseFloat(e.target.value))}
                className="w-full accent-gold bg-hair dark:bg-charcoal h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Execution Lag Toggle */}
          <div className="pt-3 border-t border-hair dark:border-hair/50 font-mono text-xs">
            <label className="text-ink-muted dark:text-silver block mb-1.5">Execution Lag Policy</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExecutionLag(1)}
                className={`py-1.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  executionLag === 1
                    ? 'bg-gold text-charcoal'
                    : 'bg-ivory dark:bg-charcoal border border-hair dark:border-hair/50 text-ink-muted dark:text-silver hover:text-gold'
                }`}
              >
                Lag = 1 (Conservative)
              </button>
              <button
                onClick={() => setExecutionLag(0)}
                className={`py-1.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  executionLag === 0
                    ? 'bg-gold text-charcoal'
                    : 'bg-ivory dark:bg-charcoal border border-hair dark:border-hair/50 text-ink-muted dark:text-silver hover:text-gold'
                }`}
              >
                Lag = 0 (Optimistic)
              </button>
            </div>
            {executionLag === 0 && (
              <div className="mt-2 text-[10px] text-copper italic">
                * Warning: Same-day settlement fill is an optimistic assumption.
              </div>
            )}
          </div>

          {/* Reset Parameters Button */}
          <div className="pt-3 border-t border-hair dark:border-hair/50 flex items-center justify-between font-mono text-xs">
            <span className="text-[10px] text-ink-muted dark:text-silver">Model Parameters</span>
            <button
              onClick={resetParams}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-ivory dark:bg-charcoal hover:bg-hair/50 dark:hover:bg-gunmetal border border-hair dark:border-hair/60 text-[11px] font-bold text-gold cursor-pointer transition-colors"
              title="Reset all backtest inputs to institutional baseline"
            >
              <RotateCcw className="w-3 h-3" />
              RESET PARAMETERS
            </button>
          </div>
        </div>

        {/* Results Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* KPI Tiles Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="terminal-card p-3.5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
              <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Net Result</span>
              <div className={`text-lg font-mono font-bold mt-1 ${
                (results?.total_net_inr || 0) >= 0 ? 'text-termgreen' : 'text-termred'
              }`}>
                {formatINR(results?.total_net_inr)}
              </div>
              <span className="text-[9px] font-mono text-ink-muted dark:text-silver">All costs deducted</span>
            </div>

            <div className="terminal-card p-3.5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
              <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Trades / Hit Rate</span>
              <div className="text-lg font-mono font-bold text-ink dark:text-ivory mt-1">
                {results?.trade_count || 0} <span className="text-xs font-normal text-ink-muted dark:text-silver font-mono">({results?.hit_rate_pct || 0}%)</span>
              </div>
              <span className="text-[9px] font-mono text-ink-muted dark:text-silver">{results?.winning_trades || 0} winners</span>
            </div>

            <div className="terminal-card p-3.5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
              <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Total Friction</span>
              <div className="text-lg font-mono font-bold text-termred mt-1">
                −{formatINR(results?.total_costs_inr)}
              </div>
              <span className="text-[9px] font-mono text-ink-muted dark:text-silver">Brokerage, tax, slippage</span>
            </div>

            <div className="terminal-card p-3.5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
              <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">Max Drawdown</span>
              <div className="text-lg font-mono font-bold text-ink dark:text-ivory mt-1">
                −{formatINR(results?.max_drawdown_inr)}
              </div>
              <span className="text-[9px] font-mono text-ink-muted dark:text-silver">Peak-to-trough</span>
            </div>
          </div>

          {/* Equity Curve */}
          <div className="terminal-card p-4 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
            <div className="flex items-center justify-between pb-2 border-b border-hair dark:border-hair/50 mb-2">
              <span className="text-xs uppercase tracking-widest font-mono text-gold font-semibold">
                Net Cumulative Equity Curve
              </span>
              <span className="text-[10px] font-mono text-ink-muted dark:text-silver">Walk-Forward Series</span>
            </div>
            <ReactECharts option={equityOption} style={{ height: '220px', width: '100%' }} />
          </div>

          {/* Attribution Chart */}
          <AttributionChart data={equityData} />

          {/* Rejection Funnel Histogram */}
          <div className="terminal-card p-4 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-hair dark:border-hair/50 mb-3">
              <span className="text-xs uppercase tracking-widest text-gold font-semibold">
                Signal Engine Funnel & Filter Breakdown
              </span>
              <span className="text-[10px] text-ink-muted dark:text-silver">{funnel.candidates || 0} Evaluated Days</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-hair/60 dark:border-hair/40">
                <span className="text-ink-muted dark:text-silver">Gate 1–3: Data & Liquidity Passed</span>
                <span className="text-gold font-bold">{funnel.liquidity_pass || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-hair/60 dark:border-hair/40">
                <span className="text-ink-muted dark:text-silver">Gate 4–5: Statistical Z-Score Threshold Passed</span>
                <span className="text-gold font-bold">{funnel.z_pass || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-hair/60 dark:border-hair/40">
                <span className="text-ink-muted dark:text-silver">Gate 7: Friction & Cost Hurdle Passed</span>
                <span className="text-gold font-bold">{funnel.cost_pass || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink dark:text-ivory font-semibold">Final Signals Generated</span>
                <span className="text-termgreen font-bold">{results?.trade_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BacktestScreen;
