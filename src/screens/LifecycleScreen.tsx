import React, { useState, useEffect } from 'react';
import { fetchContracts } from '../lib/api';
import { formatNumber } from '../lib/format';
import { CalendarRange, Info } from 'lucide-react';

export function LifecycleScreen({ currentDate = '2025-01-10' }: { currentDate?: string }) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);

  useEffect(() => {
    fetchContracts().then((c) => {
      if (c) {
        setContracts(c);
        if (c.length > 0) setSelectedContract(c[0]);
      }
    });
  }, []);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-ivory dark:bg-charcoal text-ink dark:text-ivory transition-colors duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hair dark:border-hair/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gold font-bold px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
              Contract Lifecycle Engine
            </span>
            <span className="text-xs font-mono text-ink-muted dark:text-silver">
              Session Date: <strong className="text-ink dark:text-ivory">{currentDate}</strong>
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-ivory mt-1">
            MCX Futures Lifecycle & Tender Windows
          </h1>
        </div>
      </div>

      {/* Contract Milestones & Gantt Timeline */}
      <div className="terminal-card p-5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hair dark:border-hair/50">
          <span className="text-xs uppercase tracking-widest font-mono text-gold font-semibold">
            Tracked Contracts Lifecycle
          </span>
          <span className="text-[10px] font-mono text-ink-muted dark:text-silver">
            Legend: Listed → Active Trading → Tender/Restricted Window → Delivery
          </span>
        </div>

        <div className="space-y-3">
          {contracts.map((c) => {
            const isSelected = selectedContract?.contract_id === c.contract_id;
            const metalColor =
              c.symbol === 'GOLDGUINEA'
                ? 'text-copper'
                : c.symbol === 'GOLDPETAL'
                ? 'text-silver'
                : 'text-gold';

            return (
              <div
                key={c.contract_id}
                onClick={() => setSelectedContract(c)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-gold bg-ivory dark:bg-charcoal shadow-sm'
                    : 'border-hair dark:border-hair/40 bg-ivory/60 dark:bg-charcoal/40 hover:border-gold/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between font-mono text-xs gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${metalColor}`}>{c.contract_id}</span>
                    <span className="text-ink-muted dark:text-silver text-[10px]">{c.symbol}</span>
                  </div>
                  <div className="text-ink-muted dark:text-silver text-[11px]">
                    Expiry: <strong className="text-ink dark:text-ivory">{c.expiry_date}</strong> · Peak OI: {formatNumber(c.peak_oi)}
                  </div>
                </div>

                {/* Simulated Gantt Segmented Bar */}
                <div className="h-3 w-full rounded bg-hair/60 dark:bg-charcoal overflow-hidden flex">
                  {/* Listed / Ramp */}
                  <div className="h-full bg-silver/50 w-[20%]" title="Listing & Liquidity Ramp" />
                  {/* Active Trading */}
                  <div className="h-full bg-termgreen/70 w-[55%]" title="Active Tradable Window" />
                  {/* Restricted Tender Period */}
                  <div className="h-full bg-gold/80 w-[15%]" title="Restricted Window (No New Entries)" />
                  {/* Final Delivery Window */}
                  <div className="h-full bg-termred/80 w-[10%]" title="Forced Exit / Delivery Window" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Contract Milestones Detail Card */}
      {selectedContract && (
        <div className="terminal-card p-5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-hair dark:border-hair/50 mb-3">
            <span className="text-xs uppercase tracking-widest text-gold font-semibold">
              Milestone Audit · {selectedContract.contract_id}
            </span>
            <span className="text-[10px] text-ink-muted dark:text-silver">Exchange Specifications</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-ivory dark:bg-charcoal border border-hair dark:border-hair/40">
              <span className="text-ink-muted dark:text-silver text-[10px] uppercase block">First Observed</span>
              <span className="font-bold text-ink dark:text-ivory mt-0.5 block">{selectedContract.first_seen}</span>
            </div>
            <div className="p-3 rounded-lg bg-ivory dark:bg-charcoal border border-hair dark:border-hair/40">
              <span className="text-ink-muted dark:text-silver text-[10px] uppercase block">Expiry Date</span>
              <span className="font-bold text-gold mt-0.5 block">{selectedContract.expiry_date}</span>
            </div>
            <div className="p-3 rounded-lg bg-ivory dark:bg-charcoal border border-hair dark:border-hair/40">
              <span className="text-ink-muted dark:text-silver text-[10px] uppercase block">Restricted Entry Cutoff</span>
              <span className="font-bold text-copper mt-0.5 block">{selectedContract.tender_start_date || '—'}</span>
            </div>
            <div className="p-3 rounded-lg bg-ivory dark:bg-charcoal border border-hair dark:border-hair/40">
              <span className="text-ink-muted dark:text-silver text-[10px] uppercase block">Forced Liquidation Exit</span>
              <span className="font-bold text-termred mt-0.5 block">{selectedContract.last_usable_date || '—'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LifecycleScreen;
