import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
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
  const [priceMode, setPriceMode] = useState<'norm' | 'raw'>('norm');

  if (!snapshot) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-ink-muted dark:text-silver font-mono text-sm">
        Connecting to real MCX market data feed...
      </div>
    );
  }

  const contracts = snapshot.contracts || [];
  const verdictWord = snapshot.active_signals_count > 0 ? 'SIGNAL ACTIVE' : 'NO SIGNAL';

  const handleContractClick = (symbol: string) => {
    if (symbol === 'GOLDM') {
      onSelectPair('GOLDM-GOLDTEN');
    } else if (symbol === 'GOLDTEN') {
      onSelectPair('GOLDTEN-GOLDPETAL');
    } else if (symbol === 'GOLDGUINEA') {
      onSelectPair('GOLDGUINEA-GOLDPETAL');
    } else {
      onSelectPair('GOLDTEN-GOLDPETAL');
    }
    onNavigate('relative-value');
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-ivory dark:bg-charcoal text-ink dark:text-ivory transition-colors duration-150">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hair dark:border-hair/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gold-text dark:text-gold font-bold px-2 py-0.5 rounded bg-gold/15 border border-gold/40">
              Terminal Overview
            </span>
            <span className="text-xs font-mono text-ink-muted dark:text-silver">
              Session Date: <strong className="text-ink dark:text-ivory font-bold">{snapshot.date}</strong>
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-ivory mt-1">
            MCX Gold Futures · Institutional Cross-Section
          </h1>
        </div>

        {/* Action Controls Group: Normalize Stage Toggle & Price Mode Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Price Basis Toggle Button */}
          <div className="flex items-center bg-hair/40 dark:bg-gunmetal p-1 rounded-lg border border-hair dark:border-hair/50 font-mono text-xs">
            <button
              onClick={() => setPriceMode('norm')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                priceMode === 'norm'
                  ? 'bg-gold text-charcoal font-bold shadow-sm'
                  : 'text-ink-muted dark:text-silver hover:text-ink dark:hover:text-ivory'
              }`}
              title="Normalized to ₹ per 10g 999 fineness"
            >
              ₹/10g Normalized
            </button>
            <button
              onClick={() => setPriceMode('raw')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                priceMode === 'raw'
                  ? 'bg-gold text-charcoal font-bold shadow-sm'
                  : 'text-ink-muted dark:text-silver hover:text-ink dark:hover:text-ivory'
              }`}
              title="Raw quoted contract price from MCX Bhavcopy"
            >
              Quoted Price
            </button>
          </div>

          {/* Hero Normalize CTA Button */}
          <button
            onClick={() => setShowNormalizationStage(!showNormalizationStage)}
            className="btn-gold flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{showNormalizationStage ? 'HIDE STAGE' : 'NORMALIZE CONTRACTS'}</span>
          </button>
        </div>
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
          <span className="text-xs uppercase tracking-widest font-mono text-ink dark:text-ivory font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold inline-block" />
            Active MCX Futures Contracts
          </span>
          <span className="text-[11px] font-mono text-ink-muted dark:text-silver">
            {priceMode === 'norm' ? 'Purity & Lot Normalized to ₹ / 10 g / 999' : 'Official MCX Quoted Settle Price'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contracts.map((c) => {
            const metalAccentClass =
              c.symbol === 'GOLDGUINEA'
                ? 'border-t-[3px] border-t-copper'
                : c.symbol === 'GOLDPETAL'
                ? 'border-t-[3px] border-t-silver'
                : 'border-t-[3px] border-t-gold';

            const metalTag =
              c.symbol === 'GOLDGUINEA'
                ? 'COPPER 8G'
                : c.symbol === 'GOLDPETAL'
                ? 'SILVER 1G'
                : 'GOLD LOT';

            const displayPrice = priceMode === 'norm' ? c.norm_price : c.raw_price;
            const priceSuffix = priceMode === 'norm' ? '/ 10g' : `per ${c.spec?.quote_g || 10}g`;

            return (
              <div
                key={c.contract_id}
                onClick={() => handleContractClick(c.symbol)}
                className={`terminal-card p-4 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal flex flex-col justify-between shadow-card hover:shadow-card-hover hover:border-gold/60 cursor-pointer transition-all group ${metalAccentClass}`}
                title={`Click to analyze ${c.symbol} relative value spreads`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm text-ink dark:text-ivory group-hover:text-gold-text dark:group-hover:text-gold transition-colors">
                        {c.symbol}
                      </span>
                      <span className="text-[9px] font-mono font-semibold text-ink-muted dark:text-silver px-1.5 py-0.5 rounded bg-hair/30 dark:bg-charcoal border border-hair dark:border-hair/40">
                        {metalTag}
                      </span>
                    </div>

                    {/* Crisp High-Contrast Liquidity Tier Badge */}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-hair/40 dark:bg-charcoal text-ink dark:text-ivory border border-hair-strong flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-termgreen inline-block" />
                      <span>{c.liquidity_tier}</span>
                    </span>
                  </div>

                  <div className="text-xs text-ink-muted dark:text-silver mt-0.5">{c.name}</div>
                  <div className="text-[10px] font-mono text-ink-faint dark:text-silver/70 mt-1">
                    Exp: <strong className="text-ink dark:text-ivory">{c.expiry_date}</strong> ({c.dte}d DTE)
                  </div>
                </div>

                {/* Price Presentation - High contrast pitch-black on light, warm ivory on dark */}
                <div className="my-3 pt-3 border-t border-hair dark:border-hair/50">
                  <div className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider">
                    {priceMode === 'norm' ? 'Normalized Price (₹/10g)' : 'Quoted Settlement Price'}
                  </div>
                  <div className="text-2xl font-mono font-bold text-ink dark:text-ivory tracking-tight mt-0.5 flex items-baseline">
                    <span>{formatINR(displayPrice)}</span>
                    <span className="text-xs text-ink-muted dark:text-silver font-normal ml-1.5">{priceSuffix}</span>
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted dark:text-silver mt-1.5 flex justify-between">
                    <span>{priceMode === 'norm' ? `Quoted: ${formatINR(c.raw_price)}` : `Norm: ${formatINR(c.norm_price)}`}</span>
                    <span>Purity: {c.spec?.purity || 999}‰</span>
                  </div>
                </div>

                {/* Card Footer with Volumes and Interactive Action Link */}
                <div className="pt-2.5 border-t border-hair/70 dark:border-hair/40">
                  <div className="flex justify-between items-center text-[10px] font-mono text-ink-muted dark:text-silver">
                    <span>Vol: <strong>{formatNumber(c.volume)}</strong></span>
                    <span>OI: <strong>{formatNumber(c.open_interest)}</strong></span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-hair/40 flex items-center justify-between text-[10px] font-mono text-gold-text dark:text-gold font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect Spreads & Hedge</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
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
                <span className="text-xs uppercase tracking-widest font-mono text-ink dark:text-ivory font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold inline-block" />
                  Signal Engine Verdict
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-hair/40 dark:bg-charcoal border border-hair dark:border-hair/50 text-ink dark:text-ivory">
                  {snapshot.active_signals_count} Active Signal{snapshot.active_signals_count !== 1 ? 's' : ''}
                </span>
              </div>

              {/* SplitFlap Headline Banner */}
              <div className="py-1 mb-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-muted dark:text-silver mb-1.5">
                  System State & Verification Status
                </div>
                <div className="overflow-x-auto py-1">
                  <SplitFlapText
                    words={[verdictWord, '9-GATE AUDIT', 'NO LOOKAHEAD']}
                    fontSize={22}
                    tileRadius={3}
                    gap={3}
                    cycleDelay={3000}
                    tileColor="#17191C"
                    textColor="#D4AF37"
                    padTo={13}
                  />
                </div>
              </div>

              {snapshot.active_signals_count === 0 ? (
                <div className="p-4 rounded-lg bg-hair/20 dark:bg-charcoal border border-hair dark:border-hair/50 my-auto">
                  <div className="text-sm font-display text-ink dark:text-ivory font-semibold">
                    No Signals Triggered — And That's a Valid, Rigorous Outcome.
                  </div>
                  <p className="text-xs text-ink-muted dark:text-silver leading-relaxed mt-1.5">
                    AurumLens is intentionally designed to eliminate false opportunities. On this trading date, cross-contract price differences are either explained by normal futures-curve carry or do not survive realistic transaction friction.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-gold-text dark:text-gold font-medium">
                    <ShieldCheck className="w-4 h-4 text-termgreen" />
                    <span>"We optimize for signal quality, not signal frequency."</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(snapshot.pairs || {})
                    .filter(([_, p]) => p.verdict === 'SIGNAL')
                    .map(([pName, p]) => (
                      <button
                        key={pName}
                        onClick={() => {
                          onSelectPair(pName);
                          onNavigate('relative-value');
                        }}
                        className="w-full p-3.5 rounded-lg border border-gold/40 hover:border-gold bg-hair/20 dark:bg-charcoal hover:bg-hair/40 dark:hover:bg-[#20242B] cursor-pointer flex items-center justify-between transition-all text-left group"
                        title={`Analyze ${pName} relative value and 9 gates`}
                      >
                        <div>
                          <div className="flex items-center gap-2 font-mono font-bold text-xs text-ink dark:text-ivory">
                            <span className="text-gold-text dark:text-gold text-sm">{pName}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-termgreen/15 text-termgreen border border-termgreen/30">
                              PASS (9/9 GATES)
                            </span>
                          </div>
                          <div className="text-xs text-ink-muted dark:text-silver mt-1">
                            {p.headline_reason}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-mono text-gold-text dark:text-gold font-bold group-hover:translate-x-1 transition-transform">
                          <span>Trade Plan</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Futures Curve Summary Sub-strip */}
            <div className="mt-4 pt-3 border-t border-hair dark:border-hair/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">
                  Futures Curve Regime
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-sm text-gold-text dark:text-gold">
                    {snapshot.curve?.classification || 'FLAT / MIXED'}
                  </span>
                  <span className="text-xs font-mono text-ink-muted dark:text-silver">
                    Carry: <strong>{((snapshot.curve?.annualized_carry || 0) * 100).toFixed(2)}%/yr</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('curve')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-hair/40 dark:bg-charcoal hover:bg-hair dark:hover:bg-gunmetal border border-hair dark:border-hair/60 text-xs font-mono font-bold text-gold-text dark:text-gold cursor-pointer transition-colors self-start sm:self-auto"
              >
                <span>Inspect Curve</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
