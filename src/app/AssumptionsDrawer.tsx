import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export function AssumptionsDrawer() {
  const { assumptionsOpen, setAssumptionsOpen } = useSettingsStore();

  if (!assumptionsOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-ivory-card dark:bg-charcoal border-l border-hair dark:border-hair/50 p-6 flex flex-col justify-between overflow-y-auto h-full shadow-2xl text-ink dark:text-ivory"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-hair dark:border-hair/50 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold">
                  Model Assumptions Drawer
                </span>
                <h3 className="font-display text-xl text-ink dark:text-ivory font-semibold mt-0.5">Parameters & Friction Schedule</h3>
              </div>
              <button
                onClick={() => setAssumptionsOpen(false)}
                className="p-1.5 rounded hover:bg-hair/50 dark:hover:bg-gunmetal text-ink-muted dark:text-silver hover:text-gold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-gold/15 border border-gold/30 text-xs text-gold leading-relaxed mb-6 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                All cost, slippage, and convergence parameters are configurable analytical assumptions. Slippage is modeled as an empirical stress test rather than observed order-book depth.
              </span>
            </div>

            <div className="space-y-5 text-xs font-mono">
              {/* Cost Assumptions */}
              <div>
                <h4 className="text-[11px] font-bold text-ink dark:text-ivory uppercase tracking-wider pb-1.5 border-b border-hair dark:border-hair/50">
                  1. Round-Trip Friction (Configurable)
                </h4>
                <div className="mt-2.5 space-y-2 text-ink-muted dark:text-silver">
                  <div className="flex justify-between">
                    <span>Brokerage:</span>
                    <span className="text-ink dark:text-ivory font-semibold">1.0 bps / leg-turn (4.0 bps RT)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exchange Turnover:</span>
                    <span className="text-ink dark:text-ivory font-semibold">0.25 bps / leg-turn (1.0 bps RT)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST on Charges:</span>
                    <span className="text-ink dark:text-ivory font-semibold">18% of brokerage + turnover</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commodity Transaction Tax:</span>
                    <span className="text-ink dark:text-ivory font-semibold">0.01% on sell value</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stamp Duty:</span>
                    <span className="text-ink dark:text-ivory font-semibold">0.002% on buy value</span>
                  </div>
                </div>
              </div>

              {/* Statistical & Gating Thresholds */}
              <div>
                <h4 className="text-[11px] font-bold text-ink dark:text-ivory uppercase tracking-wider pb-1.5 border-b border-hair dark:border-hair/50">
                  2. Statistical & Gating Policy
                </h4>
                <div className="mt-2.5 space-y-2 text-ink-muted dark:text-silver">
                  <div className="flex justify-between">
                    <span>Z-Score Threshold:</span>
                    <span className="text-gold font-bold">|z| ≥ 2.5 (Entry) / |z| ≤ 0.5 (Exit)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Baseline Lookback:</span>
                    <span className="text-ink dark:text-ivory font-semibold">30 trading days strictly prior to t</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MAD Floor:</span>
                    <span className="text-ink dark:text-ivory font-semibold">1e-4 (prevents exploding z)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hedge Mismatch Cap:</span>
                    <span className="text-ink dark:text-ivory font-semibold">&lt; 2.0% pure gold equivalent</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum Observations:</span>
                    <span className="text-ink dark:text-ivory font-semibold">30 trading days</span>
                  </div>
                </div>
              </div>

              {/* Lifecycle & Delivery Fences */}
              <div>
                <h4 className="text-[11px] font-bold text-ink dark:text-ivory uppercase tracking-wider pb-1.5 border-b border-hair dark:border-hair/50">
                  3. Delivery & Expiry Fences
                </h4>
                <div className="mt-2.5 space-y-2 text-ink-muted dark:text-silver">
                  <div className="flex justify-between">
                    <span>Tender Restriction Window:</span>
                    <span className="text-copper font-semibold">No entry within 10 days of expiry</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Forced Exit Liquidation:</span>
                    <span className="text-termred font-semibold">Exit by 5 trading days before expiry</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Mode:</span>
                    <span className="text-ink dark:text-ivory font-semibold">Compulsory delivery (Cash-neutralized)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-hair dark:border-hair/50">
            <button
              onClick={() => setAssumptionsOpen(false)}
              className="w-full btn-gold py-2.5 text-xs font-mono font-bold tracking-wider cursor-pointer"
            >
              APPLY & CLOSE ASSUMPTIONS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AssumptionsDrawer;
