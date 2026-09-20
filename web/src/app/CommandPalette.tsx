import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  GitCompare,
  TrendingUp,
  History,
  FlaskConical,
  CalendarRange,
  ShieldAlert,
  Cpu,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useReplayStore } from '../store/replayStore';
import { ScreenId } from './Navbar';

interface CommandPaletteProps {
  onNavigate: (screen: ScreenId) => void;
}

export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setAssumptionsOpen,
    darkMode,
    setDarkMode,
    setHeroLandingOpen
  } = useSettingsStore();
  const { mode, setMode } = useReplayStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const actions = [
    { label: 'Overview Screen', icon: <LayoutDashboard className="w-4 h-4" />, action: () => onNavigate('overview') },
    { label: 'Relative Value Intelligence', icon: <GitCompare className="w-4 h-4" />, action: () => onNavigate('relative-value') },
    { label: 'Futures Curve & Term Structure', icon: <TrendingUp className="w-4 h-4" />, action: () => onNavigate('curve') },
    { label: 'Replay Lab (Historical Time Machine)', icon: <History className="w-4 h-4" />, action: () => onNavigate('replay') },
    { label: 'Walk-Forward Backtest', icon: <FlaskConical className="w-4 h-4" />, action: () => onNavigate('backtest') },
    { label: 'Contract Lifecycle Gantt', icon: <CalendarRange className="w-4 h-4" />, action: () => onNavigate('lifecycle') },
    { label: 'Data Integrity Audit', icon: <ShieldAlert className="w-4 h-4" />, action: () => onNavigate('integrity') },
    { label: 'Open Cinematic Showcase Hero', icon: <Sparkles className="w-4 h-4 text-gold" />, action: () => setHeroLandingOpen(true) },
    { label: `Toggle Theme (${darkMode ? 'Dark' : 'Light'})`, icon: darkMode ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-silver" />, action: () => setDarkMode(!darkMode) },
    { label: 'Open Model Assumptions Drawer', icon: <Search className="w-4 h-4" />, action: () => setAssumptionsOpen(true) },
    { label: `Toggle Engine Mode (${mode})`, icon: <Cpu className="w-4 h-4" />, action: () => setMode(mode === 'API' ? 'BUNDLE' : 'API') },
  ];

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-ivory-card dark:bg-charcoal border border-hair dark:border-hair/50 rounded-xl shadow-2xl overflow-hidden text-ink dark:text-ivory"
        >
          <div className="p-3 border-b border-hair dark:border-hair/50 flex items-center gap-3">
            <Search className="w-4 h-4 text-gold shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or jump to screen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-mono focus:outline-none text-ink dark:text-ivory placeholder:text-ink-muted dark:placeholder:text-silver"
            />
            <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider px-1.5 py-0.5 rounded bg-ivory dark:bg-gunmetal border border-hair dark:border-hair/50">
              ESC
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto p-2 space-y-1 font-mono text-xs">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-ink-muted dark:text-silver">No commands matched.</div>
            ) : (
              filtered.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-ivory dark:hover:bg-gunmetal hover:text-gold text-left transition-colors cursor-pointer"
                >
                  <span className="text-gold">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CommandPalette;
