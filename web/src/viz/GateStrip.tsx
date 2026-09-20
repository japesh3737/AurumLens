import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { GateResult } from '../types';

export function GateStrip({
  gates,
  verdict,
  headlineReason,
  animateSequential = true,
}: {
  gates: GateResult[];
  verdict: 'SIGNAL' | 'NO SIGNAL';
  headlineReason: string;
  animateSequential?: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(animateSequential ? 0 : gates.length);
  const [selectedGate, setSelectedGate] = useState<GateResult | null>(null);

  useEffect(() => {
    if (!animateSequential) {
      setVisibleCount(gates.length);
      return;
    }
    setVisibleCount(0);
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < gates.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [gates, animateSequential]);

  const isSignal = verdict === 'SIGNAL';

  return (
    <div className="terminal-card p-5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
      {/* Header and Final Outcome Stamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hair dark:border-hair/50 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span className="text-xs uppercase tracking-widest font-mono text-ink dark:text-ivory font-semibold">
            Signal Validation Engine · 9 Sequential Gates
          </span>
        </div>

        {/* Final Stamp */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded border font-mono text-xs font-bold tracking-wide transition-all self-start sm:self-auto ${
            isSignal
              ? 'bg-termgreen-tint border-termgreen/50 text-termgreen shadow-sm'
              : 'bg-ivory dark:bg-charcoal border-hair dark:border-hair/50 text-ink dark:text-silver'
          }`}
        >
          {isSignal ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-termgreen" />
              <span>SIGNAL CONFIRMED</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-copper" />
              <span>NO SIGNAL</span>
            </>
          )}
        </div>
      </div>

      {/* Headline Rejection / Acceptance Reason */}
      <div className="mb-4 p-3 rounded-lg bg-ivory dark:bg-charcoal border border-hair dark:border-hair/40 font-mono text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gold font-bold">Decision:</span>
          <span className="text-ink dark:text-ivory">{headlineReason}</span>
        </div>
        <span className="text-[10px] text-ink-muted dark:text-silver shrink-0">Click any gate for details</span>
      </div>

      {/* 9 Gates Horizontal Responsive Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {gates.map((g, idx) => {
          const isVisible = idx < visibleCount;
          const passed = g.passed;

          return (
            <motion.div
              key={g.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : { opacity: 0.3 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedGate(g)}
              className={`p-2.5 rounded-lg border flex flex-col justify-between cursor-pointer transition-all ${
                !isVisible
                  ? 'border-hair dark:border-hair/30 bg-ivory/50 dark:bg-charcoal/50 text-ink-muted dark:text-silver'
                  : passed
                  ? 'border-termgreen/40 bg-termgreen-tint hover:bg-termgreen/20 text-termgreen'
                  : 'border-termred/40 bg-termred-tint hover:bg-termred/20 text-termred'
              } ${selectedGate?.id === g.id ? 'ring-2 ring-gold' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-[10px]">G{g.gate_number}</span>
                {isVisible ? (
                  passed ? (
                    <Check className="w-3.5 h-3.5 text-termgreen" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-termred" />
                  )
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-hair-strong dark:bg-gunmetal" />
                )}
              </div>
              <div className="font-mono text-[10px] truncate font-medium text-ink dark:text-ivory" title={g.name}>
                {g.name}
              </div>
              <div className="text-[9px] font-mono mt-1 truncate text-ink-muted dark:text-silver">
                {g.metric_name}: <strong>{String(g.actual_value).slice(0, 7)}</strong>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Gate Detail Modal / Callout */}
      {selectedGate && (
        <div className="mt-4 p-3.5 rounded-lg bg-ivory dark:bg-charcoal border border-hair dark:border-hair/50 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gold">Gate {selectedGate.gate_number}: {selectedGate.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedGate.passed
                  ? 'bg-termgreen-tint text-termgreen'
                  : 'bg-termred-tint text-termred'
              }`}>
                {selectedGate.passed ? 'PASSED' : 'REJECTED'}
              </span>
            </div>
            <p className="text-ink dark:text-silver text-xs mt-1">{selectedGate.detail}</p>
          </div>
          <button
            onClick={() => setSelectedGate(null)}
            className="text-xs text-ink-muted dark:text-silver hover:text-gold cursor-pointer shrink-0 self-start sm:self-auto"
          >
            Dismiss [✕]
          </button>
        </div>
      )}
    </div>
  );
}

export default GateStrip;
