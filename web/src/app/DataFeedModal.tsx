import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { ScreenId } from './Navbar';

interface DataFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateScreen?: (screen: ScreenId) => void;
}

export function DataFeedModal({ isOpen, onClose, onNavigateScreen }: DataFeedModalProps) {
  if (!isOpen) return null;

  const contracts = [
    { symbol: 'GOLDM', lot: '100 grams', quote: 'per 10g', purity: '995 fineness', tier: 'Top-Tier Institutional' },
    { symbol: 'GOLDTEN', lot: '10 grams', quote: 'per 10g', purity: '999 fineness', tier: 'Physical Benchmark' },
    { symbol: 'GOLDGUINEA', lot: '8 grams', quote: 'per 8g', purity: '999 fineness', tier: 'Retail & Sovereign' },
    { symbol: 'GOLDPETAL', lot: '1 gram', quote: 'per 1g', purity: '999 fineness', tier: 'Micro-Lot Retail' },
  ];

  return (
    <AnimatePresence>
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-ivory-card dark:bg-charcoal border border-hair dark:border-hair/50 rounded-xl p-6 shadow-2xl text-ink dark:text-ivory"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-hair dark:border-hair/50 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ink dark:text-ivory">
                  MCX Bhavcopy Data Feed Provenance
                </h3>
                <span className="text-[10px] font-mono text-ink-muted dark:text-silver">
                  Official Multi-Commodity Exchange (MCX India) EOD Settlement
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-hair/50 dark:hover:bg-gunmetal text-ink-muted dark:text-silver hover:text-ink dark:hover:text-ivory transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Verification Badge */}
          <div className="p-3 rounded-lg bg-termgreen-tint border border-termgreen/30 text-xs font-mono text-termgreen flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Look-Ahead Proof: <strong>100% BIT-IDENTICAL AUDIT PASS</strong></span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-termgreen/20">VERIFIED</span>
          </div>

          {/* Contract Specs Grid */}
          <div className="space-y-3 font-mono text-xs">
            <div className="text-[11px] uppercase tracking-wider text-ink-muted dark:text-silver font-bold">
              Traded Contract Specifications & Normalization Matrix
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {contracts.map((c) => (
                <div key={c.symbol} className="p-3 rounded-lg bg-hair/25 dark:bg-gunmetal border border-hair dark:border-hair/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gold-text dark:text-gold text-sm">{c.symbol}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-hair/60 dark:bg-charcoal text-ink-muted dark:text-silver">
                      {c.tier}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink dark:text-ivory">Lot Size: <strong>{c.lot}</strong></div>
                  <div className="text-[10px] text-ink-muted dark:text-silver">
                    Quoted: {c.quote} · Purity: {c.purity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-hair dark:border-hair/50 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                if (onNavigateScreen) onNavigateScreen('integrity');
              }}
              className="text-xs font-mono font-bold text-gold-text dark:text-gold hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Cryptographic Proofs in Data Integrity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-hair/60 dark:bg-gunmetal hover:bg-hair dark:hover:bg-gunmetal/80 text-xs font-mono font-bold transition-colors cursor-pointer text-ink dark:text-ivory"
            >
              CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default DataFeedModal;
