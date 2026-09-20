import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Search, Check } from 'lucide-react';
import { useReplayStore } from '../store/replayStore';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DatePickerModal({ isOpen, onClose }: DatePickerModalProps) {
  const { dates, currentDate, setDate } = useReplayStore();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredDates = dates.filter((d) => d.includes(searchTerm));

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
          className="w-full max-w-md bg-ivory-card dark:bg-charcoal border border-hair dark:border-hair/50 rounded-xl p-5 shadow-2xl text-ink dark:text-ivory"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-hair dark:border-hair/50 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold" />
              <h3 className="font-display text-base font-bold text-ink dark:text-ivory">
                Select Trading Session
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-hair/50 dark:hover:bg-gunmetal text-ink-muted dark:text-silver hover:text-ink dark:hover:text-ivory transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-silver pointer-events-none" />
            <input
              type="text"
              placeholder="Search date (e.g. 2025-02)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-hair/30 dark:bg-gunmetal border border-hair dark:border-hair/50 text-xs font-mono text-ink dark:text-ivory focus:outline-none focus:border-gold"
            />
          </div>

          {/* Dates Grid */}
          <div className="max-h-64 overflow-y-auto pr-1 grid grid-cols-2 gap-1.5 font-mono text-xs">
            {filteredDates.map((date) => {
              const isCurrent = date === currentDate;
              return (
                <button
                  key={date}
                  onClick={() => {
                    setDate(date);
                    onClose();
                  }}
                  className={`p-2 rounded-md flex items-center justify-between transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gold text-charcoal font-bold shadow-sm'
                      : 'bg-ivory dark:bg-gunmetal/60 hover:bg-hair/60 dark:hover:bg-gunmetal border border-hair dark:border-hair/30 text-ink dark:text-ivory'
                  }`}
                >
                  <span>{date}</span>
                  {isCurrent && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-2.5 border-t border-hair dark:border-hair/50 flex justify-between items-center text-[10px] font-mono text-ink-muted dark:text-silver">
            <span>{dates.length} total verified sessions</span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-hair/60 dark:bg-gunmetal text-ink dark:text-ivory font-bold hover:bg-hair cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default DatePickerModal;
