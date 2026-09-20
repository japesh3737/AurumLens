import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CurvePoint } from '../types';
import { formatINR, formatNumber } from '../lib/format';

interface CurveFitData {
  coefficients: number[];
  degree: number;
  quality: string;
  r2: number;
  annualized_carry: number;
  classification: 'CONTANGO' | 'BACKWARDATION' | 'FLAT / MIXED';
  status_msg: string;
}

export function CurveChart({
  points,
  fit,
  date,
}: {
  points: CurvePoint[];
  fit?: CurveFitData | null;
  date?: string;
}) {
  const [selectedPoint, setSelectedPoint] = useState<CurvePoint | null>(null);
  const [xMode, setXMode] = useState<'DTE' | 'EXPIRY'>('DTE');

  // Chart Dimensions
  const width = 640;
  const height = 340;
  const margin = { top: 30, right: 30, bottom: 45, left: 65 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Domain Calculations
  const { minDte, maxDte, minPrice, maxPrice, curvePath } = useMemo(() => {
    if (!points || points.length === 0) {
      return { minDte: 0, maxDte: 365, minPrice: 70000, maxPrice: 85000, curvePath: '' };
    }

    const dtes = points.map((p) => p.dte);
    const prices = points.map((p) => p.norm_close);

    const minD = Math.max(0, Math.min(...dtes) - 5);
    const maxD = Math.max(...dtes) + 15;
    const minP = Math.min(...prices) * 0.995;
    const maxP = Math.max(...prices) * 1.005;

    // Generate fitted curve path points
    let path = '';
    if (fit && fit.coefficients && fit.coefficients.length > 0) {
      const steps = 60;
      const pts: string[] = [];
      for (let i = 0; i <= steps; i++) {
        const d = minD + (i / steps) * (maxD - minD);
        const xYear = d / 365.0;
        let predLog = 0;
        fit.coefficients.forEach((c, deg) => {
          predLog += c * Math.pow(xYear, deg);
        });
        const predPrice = Math.exp(predLog);

        const xCoord = margin.left + ((d - minD) / (maxD - minD)) * innerWidth;
        const yCoord = margin.top + innerHeight - ((predPrice - minP) / (maxP - minP)) * innerHeight;

        pts.push(`${i === 0 ? 'M' : 'L'} ${xCoord.toFixed(1)} ${yCoord.toFixed(1)}`);
      }
      path = pts.join(' ');
    }

    return { minDte: minD, maxDte: maxD, minPrice: minP, maxPrice: maxP, curvePath: path };
  }, [points, fit, innerWidth, innerHeight, margin.left, margin.top]);

  const getX = (dte: number) => {
    return margin.left + ((dte - minDte) / (maxDte - minDte || 1)) * innerWidth;
  };

  const getY = (price: number) => {
    return margin.top + innerHeight - ((price - minPrice) / (maxPrice - minPrice || 1)) * innerHeight;
  };

  const getSymbolColor = (sym: string) => {
    switch (sym) {
      case 'GOLDM':
      case 'GOLDTEN':
        return '#C9A227'; // Gold
      case 'GOLDGUINEA':
        return '#B87333'; // Copper
      case 'GOLDPETAL':
        return '#B8BCC2'; // Silver
      default:
        return '#C9A227';
    }
  };

  const getRadius = (oi: number) => {
    return Math.max(5, Math.min(14, Math.log10(Math.max(10, oi)) * 2.8));
  };

  return (
    <div className="terminal-card p-5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hair dark:border-hair/50 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-mono text-gold font-semibold">
              Cross-Sectional Futures Curve (Same-Day)
            </span>
            <span className="text-[10px] font-mono text-ink-muted dark:text-silver">Zero Look-Ahead</span>
          </div>
          <div className="text-xs text-ink-muted dark:text-silver mt-0.5">
            Normalized price vs calendar tenor · Huber M-Estimator fit with leave-one-out residuals
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {fit && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-ivory dark:bg-charcoal border border-hair dark:border-hair/50 text-xs font-mono">
              <span
                className={`font-bold ${
                  fit.classification === 'CONTANGO'
                    ? 'text-gold'
                    : fit.classification === 'BACKWARDATION'
                    ? 'text-termgreen'
                    : 'text-ink-muted dark:text-silver'
                }`}
              >
                {fit.classification}
              </span>
              <span className="text-ink-muted dark:text-silver">·</span>
              <span className="text-ink dark:text-ivory">Carry: {(fit.annualized_carry * 100).toFixed(2)}%/yr</span>
              <span className="text-ink-muted dark:text-silver">·</span>
              <span className="text-ink-muted dark:text-silver">R²: {fit.r2.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center bg-ivory dark:bg-charcoal rounded border border-hair dark:border-hair/50 text-[11px] font-mono p-0.5">
            <button
              onClick={() => setXMode('DTE')}
              className={`px-2 py-0.5 rounded cursor-pointer ${xMode === 'DTE' ? 'bg-gold text-charcoal font-bold' : 'text-ink-muted dark:text-silver'}`}
            >
              DTE
            </button>
            <button
              onClick={() => setXMode('EXPIRY')}
              className={`px-2 py-0.5 rounded cursor-pointer ${xMode === 'EXPIRY' ? 'bg-gold text-charcoal font-bold' : 'text-ink-muted dark:text-silver'}`}
            >
              Expiry
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Background Grid */}
          <g stroke="var(--hair)" strokeDasharray="3 3" strokeWidth="0.8">
            {[0, 0.25, 0.5, 0.75, 1].map((r) => {
              const y = margin.top + innerHeight * r;
              return <line key={r} x1={margin.left} y1={y} x2={margin.left + innerWidth} y2={y} />;
            })}
            {[0, 0.25, 0.5, 0.75, 1].map((r) => {
              const x = margin.left + innerWidth * r;
              return <line key={r} x1={x} y1={margin.top} x2={x} y2={margin.top + innerHeight} />;
            })}
          </g>

          {/* Y Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => {
            const y = margin.top + innerHeight * (1 - r);
            const val = minPrice + (maxPrice - minPrice) * r;
            return (
              <text
                key={r}
                x={margin.left - 8}
                y={y + 3}
                fill="var(--ink-muted)"
                fontSize="9"
                fontFamily="IBM Plex Mono"
                textAnchor="end"
              >
                ₹{Math.round(val).toLocaleString('en-IN')}
              </text>
            );
          })}

          {/* X Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => {
            const x = margin.left + innerWidth * r;
            const d = minDte + (maxDte - minDte) * r;
            return (
              <text
                key={r}
                x={x}
                y={height - margin.bottom + 16}
                fill="var(--ink-muted)"
                fontSize="9"
                fontFamily="IBM Plex Mono"
                textAnchor="middle"
              >
                {Math.round(d)}d
              </text>
            );
          })}

          {/* Axis Labels */}
          <text
            x={margin.left + innerWidth / 2}
            y={height - 8}
            fill="var(--ink-muted)"
            fontSize="10"
            fontFamily="IBM Plex Mono"
            textAnchor="middle"
          >
            Calendar Days to Expiry (DTE)
          </text>
          <text
            transform={`rotate(-90) translate(-${margin.top + innerHeight / 2}, 16)`}
            fill="var(--ink-muted)"
            fontSize="10"
            fontFamily="IBM Plex Mono"
            textAnchor="middle"
          >
            ₹ / 10g / 999 Normalized
          </text>

          {/* Fitted Curve Line */}
          {curvePath && (
            <path
              d={curvePath}
              fill="none"
              stroke="#C9A227"
              strokeWidth="2.2"
              strokeDasharray="4 2"
              className="drop-shadow-sm"
            />
          )}

          {/* Residual Stems and Data Points */}
          {points.map((p) => {
            const cx = getX(p.dte);
            const cy = getY(p.norm_close);
            const cyFair = getY(p.curve_price || p.norm_close);
            const r = getRadius(p.open_interest);
            const color = getSymbolColor(p.symbol);
            const isZeroVol = p.volume === 0;

            return (
              <g key={p.contract_id} className="cursor-pointer" onClick={() => setSelectedPoint(p)}>
                {/* Residual Stem */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx}
                  y2={cyFair}
                  stroke={p.norm_close >= (p.curve_price || p.norm_close) ? '#2E8B57' : '#C94C4C'}
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />

                {/* Point Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={isZeroVol ? 'transparent' : color}
                  stroke={color}
                  strokeWidth={isZeroVol ? '2' : '1'}
                  strokeDasharray={isZeroVol ? '3 2' : 'none'}
                  className="transition-all hover:scale-125"
                  opacity="0.9"
                />

                {/* Symbol Label */}
                <text
                  x={cx}
                  y={cy - r - 4}
                  fill={color}
                  fontSize="9"
                  fontFamily="IBM Plex Mono"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {p.symbol.replace('GOLD', 'G.')}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Point Callout Overlay */}
        {selectedPoint && (
          <div className="absolute top-2 right-2 p-3 rounded-lg border border-hair dark:border-hair/50 bg-ivory dark:bg-charcoal shadow-card font-mono text-xs max-w-xs z-20">
            <div className="flex items-center justify-between font-bold border-b border-hair dark:border-hair/40 pb-1 mb-2">
              <span className="text-gold">{selectedPoint.contract_id}</span>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-ink-muted dark:text-silver hover:text-gold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-ink-muted dark:text-silver">Normalized:</span>
                <span className="font-bold text-ink dark:text-ivory">{formatINR(selectedPoint.norm_close)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted dark:text-silver">Curve Fair:</span>
                <span className="text-ink dark:text-ivory">{formatINR(selectedPoint.curve_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted dark:text-silver">Residual:</span>
                <span
                  className={`font-bold ${
                    (selectedPoint.loo_residual || 0) >= 0 ? 'text-termgreen' : 'text-termred'
                  }`}
                >
                  {(selectedPoint.loo_residual || 0) >= 0 ? '+' : ''}
                  {((selectedPoint.loo_residual || 0) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted dark:text-silver">DTE / Volume:</span>
                <span className="text-ink dark:text-ivory">
                  {selectedPoint.dte}d · {formatNumber(selectedPoint.volume)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurveChart;
