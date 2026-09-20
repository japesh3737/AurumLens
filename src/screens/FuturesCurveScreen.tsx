import React, { useState, useEffect } from 'react';
import { DailySnapshot, CurvePoint } from '../types';
import { CurveChart } from '../viz/CurveChart';
import { fetchCurve } from '../lib/api';
import { formatINR, formatNumber } from '../lib/format';

interface CurveScreenProps {
  snapshot: DailySnapshot | null;
}

export function FuturesCurveScreen({ snapshot }: CurveScreenProps) {
  const [curveData, setCurveData] = useState<{ points: CurvePoint[]; fit: any } | null>(null);

  useEffect(() => {
    let active = true;
    if (snapshot?.date) {
      fetchCurve(snapshot.date).then((res) => {
        if (active && res) {
          setCurveData({ points: res.points || [], fit: res.fit });
        }
      });
    }
    return () => {
      active = false;
    };
  }, [snapshot?.date]);

  if (!snapshot) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-ink-muted dark:text-silver font-mono text-sm">
        Loading futures curve analytics...
      </div>
    );
  }

  const points = curveData?.points || [];
  const fit = curveData?.fit || snapshot.curve;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-ivory dark:bg-charcoal text-ink dark:text-ivory transition-colors duration-150">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hair dark:border-hair/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gold font-bold px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
              Term Structure Engine
            </span>
            <span className="text-xs font-mono text-ink-muted dark:text-silver">
              Session Date: <strong className="text-ink dark:text-ivory">{snapshot.date}</strong>
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-ivory mt-1">
            MCX Gold Futures Curve & Leave-One-Out Residuals
          </h1>
        </div>

        {fit && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ivory-card dark:bg-gunmetal border border-hair dark:border-hair/50 text-xs font-mono shadow-sm shrink-0">
            <span className="text-ink-muted dark:text-silver uppercase text-[10px]">Classification:</span>
            <span className="font-bold text-gold">{fit.classification}</span>
          </div>
        )}
      </div>

      {/* Main Curve Chart */}
      <CurveChart points={points} fit={fit} date={snapshot.date} />

      {/* Table of Contracts with Leave-One-Out Residuals */}
      <div className="terminal-card p-5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hair dark:border-hair/50 mb-3">
          <span className="text-xs uppercase tracking-widest font-mono text-gold font-semibold">
            Traded Contract Cross-Section & Fair-Curve Residuals
          </span>
          <span className="text-[10px] font-mono text-ink-muted dark:text-silver">
            Leave-one-out fitting: no contract defines its own benchmark
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-hair dark:border-hair/50 text-[10px] text-ink-muted dark:text-silver uppercase tracking-wider">
                <th className="pb-2">Contract ID</th>
                <th className="pb-2">Symbol</th>
                <th className="pb-2">Expiry</th>
                <th className="pb-2 text-right">DTE</th>
                <th className="pb-2 text-right">Quoted Close</th>
                <th className="pb-2 text-right">Normalized (₹/10g)</th>
                <th className="pb-2 text-right">Curve Fair Value</th>
                <th className="pb-2 text-right">LOO Residual</th>
                <th className="pb-2 text-right">Volume</th>
                <th className="pb-2 text-right">Open Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair/60 dark:divide-hair/30 text-ink dark:text-ivory">
              {points.map((p) => {
                const metalColor =
                  p.symbol === 'GOLDGUINEA'
                    ? 'text-copper'
                    : p.symbol === 'GOLDPETAL'
                    ? 'text-silver'
                    : 'text-gold';

                return (
                  <tr key={p.contract_id} className="hover:bg-ivory dark:hover:bg-charcoal/60 transition-colors">
                    <td className={`py-2.5 font-bold ${metalColor}`}>{p.contract_id}</td>
                    <td className="py-2.5">{p.symbol}</td>
                    <td className="py-2.5 text-ink-muted dark:text-silver">{p.expiry_date}</td>
                    <td className="py-2.5 text-right">{p.dte}d</td>
                    <td className="py-2.5 text-right">{formatINR(p.raw_close)}</td>
                    <td className="py-2.5 text-right font-bold text-ink dark:text-ivory">{formatINR(p.norm_price)}</td>
                    <td className="py-2.5 text-right text-ink-muted dark:text-silver">{formatINR(p.curve_price)}</td>
                    <td className={`py-2.5 text-right font-bold ${
                      (p.loo_residual || 0) >= 0 ? 'text-termgreen' : 'text-termred'
                    }`}>
                      {(p.loo_residual || 0) >= 0 ? '+' : ''}{((p.loo_residual || 0) * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 text-right text-ink-muted dark:text-silver">{formatNumber(p.volume)}</td>
                    <td className="py-2.5 text-right text-ink-muted dark:text-silver">{formatNumber(p.open_interest)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FuturesCurveScreen;
