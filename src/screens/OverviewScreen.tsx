import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { DailySnapshot } from '../types';
import { NormalizationStage } from '../viz/NormalizationStage';
import { RadarChart } from '../viz/RadarChart';
import { SplitFlapText } from '../components/ui/split-flap-text';
import { formatINR, formatNumber } from '../lib/format';
import { ScreenId } from '../app/Navbar';

interface OverviewProps {
  snapshot: DailySnapshot | null;
  onNavigate: (screen: ScreenId) => void;
  onSelectPair: (pair: string) => void;
}

export function OverviewScreen({ snapshot, onNavigate, onSelectPair }: OverviewProps) {
  const [showNormalizationStage, setShowNormalizationStage] = useState(false);

  if (!snapshot) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-ink-muted dark:text-silver font-mono text-sm">
        Connecting to real MCX market data feed...
      </div>
    );
  }

  const contracts = snapshot.contracts || [];
  const verdictWord = snapshot.active_signals_count > 0 ? 'SIGNAL LIVE' : 'NO SIGNAL';

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-ivory dark:bg-charcoal text-ink dark:text-ivory transition-colors duration-150">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hair dark:border-hair/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gold font-bold px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
              Terminal Overview
            </span>
            <span className="text-xs font-mono text-ink-muted dark:text-silver">
              Session Date: <strong className="text-ink dark:text-ivory font-semibold">{snapshot.date}</strong>
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-ivory mt-1">
            MCX Gold Futures · Institutional Cross-Section
          </h1>
        </div>

        {/* Hero Normalize CTA Button */}
        <button
          onClick={() => setShowNormalizationStage(!showNormalizationStage)}
          className="btn-gold flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          {showNormalizationStage ? 'HIDE STAGE' : 'NORMALIZE CONTRACTS'}
        </button>
      </div>

      {/* Hero Normalization Stage Animation */}
      {showNormalizationStage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <NormalizationStage
            contracts={contracts}
            onComplete={() => console.log('Normalization choreography complete')}
          />
        </motion.div>
      )}

      {/* 4 Contract Cards with distinct metal identity top-borders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-widest font-mono text-gold font-semibold">
            Active MCX Futures Contracts
          </span>
          <span className="text-[11px] font-mono text-ink-muted dark:text-silver">
            Purity & Unit Normalized to ₹ / 10 g / 999
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contracts.map((c) => {
            // Rule 4: Distinct metal identity top border
            const metalAccentClass =
              c.symbol === 'GOLDGUINEA'
                ? 'border-t-2 border-t-copper'
                : c.symbol === 'GOLDPETAL'
                ? 'border-t-2 border-t-silver'
                : 'border-t-2 border-t-gold'; // GOLDM & GOLDTEN

            const metalTag =
              c.symbol === 'GOLDGUINEA'
                ? 'COPPER 8G'
                : c.symbol === 'GOLDPETAL'
                ? 'SILVER 1G'
                : 'GOLD LOT';

            const tierColor =
              c.liquidity_tier === 'HIGH'
                ? 'text-termgreen border-termgreen/40 bg-termgreen-tint'
                : c.liquidity_tier === 'MEDIUM'
                ? 'text-gold border-gold/40 bg-gold/10'
                : 'text-ink-muted dark:text-silver border-hair bg-ivory dark:bg-gunmetal';

            return (
              <div
                key={c.contract_id}
                className={`terminal-card p-4 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all ${metalAccentClass}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm text-ink dark:text-ivory">{c.symbol}</span>
                      <span className="text-[9px] font-mono text-ink-muted dark:text-silver px-1 rounded bg-ivory dark:bg-charcoal border border-hair dark:border-hair/40">
                        {metalTag}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${tierColor}`}>
                      {c.liquidity_tier}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted dark:text-silver mt-0.5">{c.name}</div>
                  <div className="text-[10px] font-mono text-ink-faint dark:text-silver/70 mt-1">
                    Exp: <strong className="text-ink dark:text-ivory">{c.expiry_date}</strong> ({c.dte}d DTE)
                  </div>
                </div>

                <div className="my-4 pt-3 border-t border-hair dark:border-hair/50">
                  <div className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider">Normalized Price</div>
                  <div className="text-xl font-mono font-bold text-gold mt-0.5">
                    {formatINR(c.norm_price)}
                    <span className="text-[10px] text-ink-muted dark:text-silver font-normal ml-1">/ 10g</span>
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted dark:text-silver mt-1 flex justify-between">
                    <span>Quoted: {formatINR(c.raw_price)}</span>
                    <span>Purity: {c.spec?.purity || 999}‰</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-hair/70 dark:border-hair/40 flex justify-between items-center text-[10px] font-mono text-ink-muted dark:text-silver">
                  <span>Vol: {formatNumber(c.volume)}</span>
                  <span>OI: {formatNumber(c.open_interest)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: RV Radar + Signal Engine Split-Flap Verdict Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RV Radar (5 Cols) */}
        <div className="lg:col-span-5">
          <RadarChart
            pairs={snapshot.pairs || {}}
            onSelectPair={(p) => {
              onSelectPair(p);
              onNavigate('relative-value');
            }}
          />
        </div>

        {/* Signals & Curve Digest (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          {/* Active Signals Card with SplitFlapText Verdict Headline */}
          <div className="terminal-card p-5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-hair dark:border-hair/50 mb-3">
                <span className="text-xs uppercase tracking-widest font-mono text-gold font-semibold">
                  Signal Engine Verdict
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-ivory dark:bg-charcoal border border-hair dark:border-hair/50 text-ink-muted dark:text-silver">
                  {snapshot.active_signals_count} Active Signals
                </span>
              </div>

              {/* SplitFlap Headline Banner */}
              <div className="py-2 mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ink-muted dark:text-silver mb-1">
                    System State
                  </div>
                  <SplitFlapText
                    words={[verdictWord, '9-GATE AUDIT', 'ZERO LOOK-AHEAD']}
                    fontSize={34}
                    tileRadius={4}
                    gap={4}
                    cycleDelay={3200}
                    tileColor="#17191C"
                    textColor="#C9A227"
                    padTo={12}
                  />
                </div>
              </div>

              {snapshot.active_signals_count === 0 ? (
                <div className="p-4 rounded-lg bg-ivory dark:bg-charcoal border border-hair dark:border-hair/50 my-auto">
                  <div className="text-sm font-display text-ink dark:text-ivory font-semibold">
                    No Signals Triggered — And That's a Valid, Rigorous Outcome.
                  </div>
                  <p className="text-xs text-ink-muted dark:text-silver leading-relaxed mt-1.5">
                    AurumLens is intentionally designed to eliminate false opportunities. On this trading date, cross-contract price differences are either explained by normal futures-curve carry or do not survive realistic transaction friction.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-gold font-medium">
                    <ShieldCheck className="w-4 h-4 text-termgreen" />
                    <span>"We optimize for signal quality, not signal frequency."</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(snapshot.pairs || {})
                    .filter(([_, p]) => p.verdict === 'SIGNAL')
                    .map(([pName, p]) => (
                      <div
                        key={pName}
                        onClick={() => {
                          onSelectPair(pName);
                          onNavigate('relative-value');
                        }}
                        className="p-3 rounded-lg border border-termgreen/40 bg-termgreen-tint hover:bg-termgreen/20 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-mono font-bold text-xs text-termgreen">{pName}</div>
                          <div className="text-xs text-ink dark:text-ivory mt-0.5">{p.headline_reason}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-termgreen" />
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Futures Curve Summary Sub-strip */}
            <div className="mt-4 pt-3 border-t border-hair dark:border-hair/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">
                  Futures Curve Regime
                </span>
                <span className="font-mono font-bold text-sm text-gold">
                  {snapshot.curve?.classification || 'FLAT / MIXED'}
                </span>
                <span className="text-xs font-mono text-ink-muted dark:text-silver ml-2">
                  Carry: {((snapshot.curve?.annualized_carry || 0) * 100).toFixed(2)}%/yr
                </span>
              </div>

              <button
                onClick={() => onNavigate('curve')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ivory dark:bg-charcoal hover:bg-hair/50 dark:hover:bg-gunmetal border border-hair dark:border-hair/60 text-xs font-mono text-gold cursor-pointer transition-colors"
              >
                Inspect Curve <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Terminal Philosophy Footer */}
      <footer className="pt-4 border-t border-hair dark:border-hair/50 text-center text-xs font-mono text-ink-muted dark:text-silver">
        <p className="italic text-ink dark:text-ivory">
          "AurumLens transforms raw MCX gold futures data into normalized, expiry-aware and cost-aware relative-value intelligence, helping users distinguish genuine pricing anomalies from ordinary contract mechanics and market noise."
        </p>
        <div className="mt-1 text-[10px] text-ink-faint dark:text-silver/60">
          EOD settlement data · liquidity is a volume/OI proxy — not order-book depth · not investment advice.
        </div>
      </footer>
    </div>
  );
}

export default OverviewScreen;
