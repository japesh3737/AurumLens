import React from 'react';
import ReactECharts from 'echarts-for-react';

interface SpreadChartProps {
  data?: any[];
  pairName?: string;
  currentZ?: number | null;
  currentSpreadBps?: number;
  series?: any[];
  symA?: string;
  symB?: string;
}

export function SpreadChart({
  data,
  pairName = 'GOLDTEN-GOLDPETAL',
  series,
  symA: propSymA,
  symB: propSymB,
}: SpreadChartProps) {
  const points = data || series || [];
  const [derivedA, derivedB] = pairName.split('-');
  const symA = propSymA || derivedA || 'GOLDTEN';
  const symB = propSymB || derivedB || 'GOLDPETAL';

  if (!points || points.length === 0) {
    return (
      <div className="terminal-card p-6 h-72 flex items-center justify-center text-ink-muted dark:text-silver font-mono text-xs border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
        Historical series data building across trading days...
      </div>
    );
  }

  const dates = points.map((s) => s.date);
  const normA = points.map((s) => s.norm_a);
  const normB = points.map((s) => s.norm_b);
  const curveSpread = points.map((s) => (s.curve_adj_spread || 0) * 10000); // bps

  const legBColor = symB.includes('GUINEA') ? '#C26828' : symB.includes('PETAL') ? '#8A929E' : '#D4AF37';

  // Mark lines for roll events
  const rollMarks = points
    .filter((s) => s.leg_roll)
    .map((s) => ({
      xAxis: s.date,
      label: { formatter: 'Roll', position: 'top', color: '#D4AF37', fontSize: 9 },
      lineStyle: { color: '#B3820B', type: 'dashed', width: 1 },
    }));

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#17191C',
      borderColor: '#D4AF37',
      textStyle: { color: '#F7F4EC', fontFamily: 'IBM Plex Mono', fontSize: 11 },
      axisPointer: { type: 'cross', lineStyle: { color: '#D4AF37', width: 1, type: 'dashed' } },
    },
    grid: [
      { left: '60px', right: '30px', top: '35px', height: '40%' },
      { left: '60px', right: '30px', top: '55%', height: '35%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        gridIndex: 0,
        axisLine: { lineStyle: { color: '#D5CEBD' } },
        axisLabel: { show: false },
      },
      {
        type: 'category',
        data: dates,
        gridIndex: 1,
        axisLine: { lineStyle: { color: '#D5CEBD' } },
        axisLabel: { color: '#5F6368', fontFamily: 'IBM Plex Mono', fontSize: 9 },
      },
    ],
    yAxis: [
      {
        gridIndex: 0,
        type: 'value',
        scale: true,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(212, 175, 55, 0.12)' } },
        axisLabel: {
          color: '#5F6368',
          fontFamily: 'IBM Plex Mono',
          fontSize: 10,
          formatter: (v: number) => `₹${Math.round(v)}`,
        },
      },
      {
        gridIndex: 1,
        type: 'value',
        scale: true,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(212, 175, 55, 0.12)' } },
        axisLabel: {
          color: '#5F6368',
          fontFamily: 'IBM Plex Mono',
          fontSize: 10,
          formatter: (v: number) => `${v.toFixed(0)} bps`,
        },
      },
    ],
    series: [
      {
        name: `${symA} (₹/10g)`,
        type: 'line',
        data: normA,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#D4AF37', width: 2 },
        markLine: { data: rollMarks, symbol: 'none' },
      },
      {
        name: `${symB} (₹/10g)`,
        type: 'line',
        data: normB,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: legBColor, width: 1.8, type: 'dashed' },
      },
      {
        name: 'Curve-Adj Spread (bps)',
        type: 'line',
        data: curveSpread,
        xAxisIndex: 1,
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#D4AF37', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(212, 175, 55, 0.20)' },
              { offset: 1, color: 'rgba(212, 175, 55, 0.0)' },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="terminal-card p-4 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-hair dark:border-hair/50 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-mono text-gold font-semibold">
            Relative Value Spread & Normalized Leg Prices
          </span>
          <span className="text-[10px] font-mono text-ink-muted dark:text-silver">Synchronized Crosshair</span>
        </div>
        <div className="text-[11px] font-mono text-ink-muted dark:text-silver flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-gold" /> {symA}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5" style={{ backgroundColor: legBColor }} /> {symB}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1.5 bg-gold/20 border border-gold" /> Spread (bps)
          </span>
        </div>
      </div>
      <ReactECharts option={chartOption} style={{ height: '320px', width: '100%' }} />
    </div>
  );
}

export default SpreadChart;
