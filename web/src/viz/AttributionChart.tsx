import React from 'react';
import ReactECharts from 'echarts-for-react';
import { formatINR } from '../lib/format';

interface AttributionPoint {
  date: string;
  cum_gross: number;
  cum_net: number;
  cum_directional: number;
  cum_rv: number;
  cum_costs: number;
}

export function AttributionChart({ data }: { data: AttributionPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="terminal-card p-6 h-64 flex items-center justify-center text-ink-muted dark:text-silver font-mono text-xs border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal">
        No attribution data generated yet. Run walk-forward backtest.
      </div>
    );
  }

  const dates = data.map((d) => d.date);
  const rv = data.map((d) => d.cum_rv);
  const directional = data.map((d) => d.cum_directional);
  const costs = data.map((d) => -d.cum_costs); // negative
  const net = data.map((d) => d.cum_net);

  const lastPoint = data[data.length - 1];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#17191C',
      borderColor: '#C9A227',
      textStyle: { color: '#F7F4EC', fontFamily: 'IBM Plex Mono', fontSize: 11 },
      valueFormatter: (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`,
    },
    legend: {
      data: ['Relative Value Alpha', 'Directional Gold Drift', 'Friction Costs', 'Net Cumulative P&L'],
      textStyle: { color: '#5F6368', fontFamily: 'IBM Plex Mono', fontSize: 10 },
      top: 0,
      right: 10,
    },
    grid: {
      left: '70px',
      right: '25px',
      top: '40px',
      bottom: '30px',
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#D5CEBD' } },
      axisLabel: { color: '#5F6368', fontFamily: 'IBM Plex Mono', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(201, 162, 39, 0.10)' } },
      axisLabel: {
        color: '#5F6368',
        fontFamily: 'IBM Plex Mono',
        fontSize: 10,
        formatter: (v: number) => `₹${(v / 1000).toFixed(0)}k`,
      },
    },
    series: [
      {
        name: 'Relative Value Alpha',
        type: 'bar',
        stack: 'attribution',
        data: rv,
        itemStyle: { color: '#2E8B57' },
      },
      {
        name: 'Directional Gold Drift',
        type: 'bar',
        stack: 'attribution',
        data: directional,
        itemStyle: { color: '#B8BCC2' },
      },
      {
        name: 'Friction Costs',
        type: 'bar',
        stack: 'attribution',
        data: costs,
        itemStyle: { color: '#C94C4C' },
      },
      {
        name: 'Net Cumulative P&L',
        type: 'line',
        data: net,
        itemStyle: { color: '#C9A227' },
        lineStyle: { width: 2.5, color: '#C9A227' },
        showSymbol: false,
      },
    ],
  };

  return (
    <div className="terminal-card p-4 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
      <div className="flex items-center justify-between pb-2 border-b border-hair dark:border-hair/50 mb-2">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-gold font-semibold">
            P&L Attribution · Relative Value vs Gold Drift
          </span>
          <div className="text-[11px] font-mono text-ink-muted dark:text-silver mt-0.5">
            RV + Directional − Costs = Net Cumulative
          </div>
        </div>

        {lastPoint && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-ink-muted dark:text-silver text-[10px] block">Net P&L</span>
              <span className={`font-bold ${lastPoint.cum_net >= 0 ? 'text-termgreen' : 'text-termred'}`}>
                {formatINR(lastPoint.cum_net)}
              </span>
            </div>
            <div>
              <span className="text-ink-muted dark:text-silver text-[10px] block">Relative-Value</span>
              <span className="text-ink dark:text-ivory">{formatINR(lastPoint.cum_rv)}</span>
            </div>
            <div>
              <span className="text-ink-muted dark:text-silver text-[10px] block">Costs</span>
              <span className="text-termred">−{formatINR(lastPoint.cum_costs)}</span>
            </div>
          </div>
        )}
      </div>

      <ReactECharts option={option} style={{ height: '260px', width: '100%' }} />
    </div>
  );
}

export default AttributionChart;
