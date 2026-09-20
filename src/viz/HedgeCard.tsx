import React from 'react';
import { Scale } from 'lucide-react';

interface HedgeCardProps {
  symA: string;
  symB: string;
  lotsA: number;
  lotsB: number;
  goldAGrams: number;
  goldBGrams: number;
  mismatchPct: number;
  ratioStr: string;
}

export function HedgeCard({
  symA,
  symB,
  lotsA,
  lotsB,
  goldAGrams,
  goldBGrams,
  mismatchPct,
  ratioStr,
}: HedgeCardProps) {
  const isMinimal = mismatchPct <= 0.5;

  return (
    <div className="terminal-card p-4 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-hair dark:border-hair/50 mb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs uppercase tracking-widest font-mono text-ink dark:text-ivory font-semibold">
            Integer Exposure Matching
          </span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
          isMinimal ? 'bg-termgreen-tint text-termgreen border border-termgreen/40' : 'bg-gold/15 text-gold border border-gold/30'
        }`}>
          Mismatch: {mismatchPct.toFixed(2)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Leg A */}
        <div className="p-2.5 rounded bg-ivory dark:bg-charcoal border border-hair dark:border-hair/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase">Leg A</span>
            <span className="text-xs font-mono font-bold text-gold">{symA}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-mono font-bold text-ink dark:text-ivory">{lotsA} <span className="text-xs text-ink-muted dark:text-silver font-normal">lots</span></span>
            <span className="text-xs font-mono text-ink-muted dark:text-silver">{goldAGrams.toFixed(1)}g pure</span>
          </div>
        </div>

        {/* Leg B */}
        <div className="p-2.5 rounded bg-ivory dark:bg-charcoal border border-hair dark:border-hair/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase">Leg B</span>
            <span className="text-xs font-mono font-bold text-ink dark:text-ivory">{symB}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-mono font-bold text-ink dark:text-ivory">{lotsB} <span className="text-xs text-ink-muted dark:text-silver font-normal">lots</span></span>
            <span className="text-xs font-mono text-ink-muted dark:text-silver">{goldBGrams.toFixed(1)}g pure</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-hair/60 dark:border-hair/40 flex items-center justify-between text-[11px] font-mono">
        <span className="text-ink-muted dark:text-silver">Physical Lot Ratio:</span>
        <span className="font-bold text-gold">{ratioStr}</span>
      </div>
    </div>
  );
}

export default HedgeCard;
