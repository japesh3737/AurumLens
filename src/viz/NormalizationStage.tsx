import React, { useState, useEffect } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { RotateCcw, Check, Sparkles } from 'lucide-react';

interface ContractRow {
  symbol: string;
  name: string;
  raw: number;
  unit: number;
  norm: number;
  unitFactor: string;
  purityFactor: string;
  specChip: string;
  grams: number;
  purity: number;
}

function OdometerNumber({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const formatted = useTransform(mv, (v) =>
    '₹' + Math.round(v).toLocaleString('en-IN')
  );

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, mv]);

  return <motion.span className="font-mono tabular-nums text-xl font-bold">{formatted}</motion.span>;
}

export function NormalizationStage({
  contracts,
  onComplete,
}: {
  contracts: Array<{
    symbol: string;
    name: string;
    raw_price: number;
    norm_price: number;
    spec: { unit_g: number; quote_g: number; purity: number };
  }>;
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<'raw' | 'unit' | 'purity' | 'converge' | 'settle'>('raw');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const rows: ContractRow[] = contracts.map((c) => {
    const unitPrice = c.raw_price * (10 / c.spec.quote_g);
    return {
      symbol: c.symbol,
      name: c.name,
      raw: c.raw_price,
      unit: unitPrice,
      norm: c.norm_price,
      unitFactor: c.spec.quote_g === 10 ? '× 1' : c.spec.quote_g === 8 ? '× 10/8' : '× 10',
      purityFactor: c.spec.purity === 995 ? '× 999/995' : '× 1',
      specChip: `${c.spec.unit_g}g lot · quoted per ${c.spec.quote_g}g · ${c.spec.purity} fineness`,
      grams: c.spec.unit_g,
      purity: c.spec.purity,
    };
  });

  const replay = () => {
    setPhase('raw');
    setIsAutoPlaying(true);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const t1 = setTimeout(() => setPhase('unit'), 1200);
    const t2 = setTimeout(() => setPhase('purity'), 2600);
    const t3 = setTimeout(() => setPhase('converge'), 3900);
    const t4 = setTimeout(() => {
      setPhase('settle');
      setIsAutoPlaying(false);
      if (onComplete) onComplete();
    }, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isAutoPlaying, onComplete]);

  // Current display price for a contract row
  const getDisplayPrice = (r: ContractRow) => {
    if (phase === 'raw') return r.raw;
    if (phase === 'unit') return r.unit;
    return r.norm;
  };

  return (
    <div className="terminal-card p-6 bg-ivory-card dark:bg-gunmetal border border-hair dark:border-hair/50 shadow-card relative overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hair dark:border-hair/50 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gold font-bold px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
              Signature Normalization Stage
            </span>
            <span className="text-xs font-mono text-ink-muted dark:text-silver">Basis: ₹ / 10 g / 999 purity</span>
          </div>
          <h3 className="font-display text-2xl text-ink dark:text-ivory font-semibold mt-1">
            Physical Disparity → Common Institutional Basis
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Phase Indicators */}
          <div className="flex items-center gap-1.5 bg-ivory dark:bg-charcoal px-3 py-1.5 rounded-lg border border-hair dark:border-hair/50 text-xs font-mono">
            {(['raw', 'unit', 'purity', 'converge', 'settle'] as const).map((p, idx) => (
              <button
                key={p}
                onClick={() => {
                  setPhase(p);
                  setIsAutoPlaying(false);
                }}
                className={`px-2 py-0.5 rounded uppercase text-[10px] transition-colors cursor-pointer ${
                  phase === p
                    ? 'bg-gold text-charcoal font-bold shadow-sm'
                    : 'text-ink-muted dark:text-silver hover:text-gold'
                }`}
              >
                {idx + 1}. {p}
              </button>
            ))}
          </div>

          <button
            onClick={replay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ivory dark:bg-charcoal hover:bg-hair/50 dark:hover:bg-gunmetal border border-hair dark:border-hair/60 text-gold text-xs font-mono transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Replay
          </button>
        </div>
      </div>

      {/* 4 Contract Lanes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {rows.map((r) => {
          const displayVal = getDisplayPrice(r);
          const isSettled = phase === 'settle' || phase === 'converge';

          const metalAccentClass =
            r.symbol === 'GOLDGUINEA'
              ? 'border-t-2 border-t-copper'
              : r.symbol === 'GOLDPETAL'
              ? 'border-t-2 border-t-silver'
              : 'border-t-2 border-t-gold';

          return (
            <motion.div
              key={r.symbol}
              layout
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 relative ${metalAccentClass} ${
                isSettled
                  ? 'border-gold/50 shadow-sm bg-ivory dark:bg-charcoal'
                  : 'border-hair dark:border-hair/50 bg-ivory dark:bg-charcoal/60'
              }`}
            >
              {/* Contract Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-sm text-ink dark:text-ivory">{r.symbol}</span>
                  <span className="text-[10px] font-mono text-ink-muted dark:text-silver">{r.purity}‰</span>
                </div>
                <div className="text-xs text-ink-muted dark:text-silver truncate">{r.name}</div>
                <div className="text-[10px] font-mono text-ink-faint dark:text-silver/60 mt-1 truncate">{r.specChip}</div>
              </div>

              {/* Physical Gold Bar Representation */}
              <div className="my-6 h-12 flex items-center justify-center bg-hair/40 dark:bg-charcoal rounded-lg border border-hair dark:border-hair/40 px-3 relative overflow-hidden">
                <motion.div
                  layout
                  className="rounded flex items-center justify-center text-[10px] font-mono font-semibold transition-all shadow-sm"
                  style={{
                    background:
                      r.symbol === 'GOLDM' && phase === 'purity'
                        ? 'linear-gradient(90deg, #D4AF37, #F1C442, #D4AF37)'
                        : r.symbol === 'GOLDGUINEA'
                        ? 'linear-gradient(90deg, #A85A1E, #C26828)'
                        : r.symbol === 'GOLDPETAL'
                        ? 'linear-gradient(90deg, #6B7280, #8A929E)'
                        : 'linear-gradient(90deg, #B3820B, #D4AF37)',
                    height: phase === 'raw' ? (r.grams >= 100 ? '28px' : r.grams >= 10 ? '22px' : r.grams >= 8 ? '18px' : '14px') : '22px',
                    width: phase === 'raw' ? (r.grams >= 100 ? '90%' : r.grams >= 10 ? '45%' : r.grams >= 8 ? '38%' : '20%') : '50%',
                    color: '#17191C',
                  }}
                >
                  {phase === 'raw' ? `${r.grams}g` : '10g (999)'}
                </motion.div>

                {/* Shimmer on GOLDM during purity scaling */}
                {r.symbol === 'GOLDM' && phase === 'purity' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute inset-0 bg-gold/20 pointer-events-none flex items-center justify-center text-xs text-gold font-mono font-bold"
                  >
                    <Sparkles className="w-4 h-4 mr-1 animate-spin" /> 995 → 999 Purity Scaling
                  </motion.div>
                )}
              </div>

              {/* Factor Chip flying in */}
              <div className="h-7 mb-2 flex items-center justify-center">
                {phase === 'unit' && (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/30 font-semibold"
                  >
                    Unit: {r.unitFactor}
                  </motion.span>
                )}
                {(phase === 'purity' || isSettled) && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-ivory-card dark:bg-gunmetal text-ink-muted dark:text-silver border border-hair dark:border-hair/50"
                  >
                    {r.symbol === 'GOLDM' ? 'Purity: × 999/995' : 'Purity: × 1'}
                  </motion.span>
                )}
              </div>

              {/* Price Display with rolling odometer */}
              <div className="border-t border-hair dark:border-hair/50 pt-3 flex flex-col">
                <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider">
                  {phase === 'raw' ? 'Quoted Price' : phase === 'unit' ? 'Unit-Adjusted' : 'Normalized Basis'}
                </span>
                <div className="text-gold mt-0.5">
                  <OdometerNumber value={displayVal} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Shared Basis Rail (Phases: converge / settle) */}
      {(phase === 'converge' || phase === 'settle') && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-4 border-t border-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-termgreen animate-pulse" />
            <span className="text-xs font-mono text-gold font-semibold uppercase tracking-wider">
              Common Basis Established: ₹ / 10 g / 999 Equivalent Gold
            </span>
          </div>
          <div className="text-xs font-mono text-ink-muted dark:text-silver italic flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-termgreen" />
            Now directly comparable — residual spread isolates curve tenor structure.
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default NormalizationStage;
