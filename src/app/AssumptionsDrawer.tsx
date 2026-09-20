import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, RotateCcw, Check } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export function AssumptionsDrawer() {
  const { assumptionsOpen, setAssumptionsOpen } = useSettingsStore();

  const [brokerageBps, setBrokerageBps] = useState(1.0);
  const [slippageBps, setSlippageBps] = useState(1.0);
  const [cttApplied, setCttApplied] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  if (!assumptionsOpen) return null;

  const handleReset = () => {
    setBrokerageBps(1.0);
    setSlippageBps(1.0);
    setCttApplied(true);
  };

  const handleApply = () => {
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      setAssumptionsOpen(false);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => { if (e.target === e.currentTarget) setAssumptionsOpen(false); }}
        className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm select-none"
      >
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-text dark:text-gold font-bold">
                  Model Assumptions Drawer
                </span>
                <h3 className="font-display text-xl text-ink dark:text-ivory font-semibold mt-0.5">
                  Parameters & Friction Schedule
                </h3>
              </div>
              <button
                onClick={() => setAssumptionsOpen(false)}
                className="p-1.5 rounded hover:bg-hair/50 dark:hover:bg-gunmetal text-ink-muted dark:text-silver hover:text-ink dark:hover:text-ivory cursor-pointer"
                title="Close Drawer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-gold/15 border border-gold/30 text-xs text-ink dark:text-ivory leading-relaxed mb-6 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-gold-text dark:text-gold mt-0.5 shrink-0" />
              <span>
                All cost, slippage, and convergence parameters are configurable analytical assumptions. Adjust parameters below to stress-test your strategy.
              </span>
            </div>

            <div className="space-y-5 text-xs font-mono">
              {/* Cost Assumptions */}
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-hair dark:border-hair/50">
                  <h4 className="text-[11px] font-bold text-ink dark:text-ivory uppercase tracking-wider">
                    1. Round-Trip Friction Schedule
                  </h4>
                  <button
                    onClick={handleReset}
                    className="text-[10px] text-gold-text dark:text-gold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  <div>
                    <div className="flex justify-between text-ink dark:text-ivory mb-1">
                      <span>Brokerage (per leg):</span>
                      <span className="font-bold text-gold-text dark:text-gold">{brokerageBps.toFixed(1)} bps</span>
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
                    <div className="flex justify-between text-ink dark:text-ivory mb-1">
                      <span>Liquidity Stress Slippage:</span>
                      <span className="font-bold text-copper">{slippageBps.toFixed(1)} bps</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={5.0}
                      step={0.2}
                      value={slippageBps}
                      onChange={(e) => setSlippageBps(parseFloat(e.target.value))}
                      className="w-full accent-gold bg-hair dark:bg-charcoal h-1.5 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span>Commodity Transaction Tax (CTT 0.01%):</span>
                    <button
                      onClick={() => setCttApplied(!cttApplied)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        cttApplied ? 'bg-gold text-charcoal' : 'bg-hair dark:bg-charcoal text-ink-muted'
                      }`}
                    >
                      {cttApplied ? 'INCLUDED' : 'EXCLUDED'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistical Calibration */}
              <div>
                <h4 className="text-[11px] font-bold text-ink dark:text-ivory uppercase tracking-wider pb-1.5 border-b border-hair dark:border-hair/50">
                  2. Statistical Gate Thresholds
                </h4>
                <div className="mt-2.5 space-y-2 text-ink-muted dark:text-silver">
                  <div className="flex justify-between">
                    <span>Z-Score Entry Hurdle:</span>
                    <span className="text-ink dark:text-ivory font-semibold">|Z| ≥ 2.0 (Robust MAD)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Z-Score Exit / Mean-Revert:</span>
                    <span className="text-ink dark:text-ivory font-semibold">|Z| ≤ 0.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lookback Estimation Window:</span>
                    <span className="text-ink dark:text-ivory font-semibold">60 Trading Sessions</span>
                  </div>
                </div>
              </div>

              {/* Delivery & Lifecycle Rules */}
              <div>
                <h4 className="text-[11px] font-bold text-ink dark:text-ivory uppercase tracking-wider pb-1.5 border-b border-hair dark:border-hair/50">
                  3. MCX Lifecycle Constraints
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

          <div className="pt-5 border-t border-hair dark:border-hair/50 flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-3 py-2.5 rounded bg-hair/50 dark:bg-gunmetal hover:bg-hair text-xs font-mono font-bold text-ink dark:text-ivory cursor-pointer"
            >
              DEFAULTS
            </button>
            <button
              onClick={handleApply}
              className="flex-1 btn-gold py-2.5 text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {savedToast ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>PARAMETERS SAVED!</span>
                </>
              ) : (
                <span>APPLY & CLOSE ASSUMPTIONS</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AssumptionsDrawer;
