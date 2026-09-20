import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Settings2,
  Play,
  Command,
  Database,
  Sun,
  Moon,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useReplayStore } from '../store/replayStore';
import { useSettingsStore } from '../store/settingsStore';
import { useStoryStore } from '../store/storyStore';
import { SplitFlapText } from '../components/ui/split-flap-text';
import { ScreenId } from './Navbar';
import { ApiModal } from './ApiModal';
import { DataFeedModal } from './DataFeedModal';
import { DatePickerModal } from './DatePickerModal';

interface StatusBarProps {
  currentScreen?: ScreenId;
  onNavigateScreen?: (screen: ScreenId) => void;
}

export function StatusBar({ currentScreen = 'overview', onNavigateScreen }: StatusBarProps) {
  const { currentDate, nextDay, prevDay } = useReplayStore();
  const {
    assumptionsOpen,
    setAssumptionsOpen,
    setCommandPaletteOpen,
    darkMode,
    setDarkMode,
    setHeroLandingOpen
  } = useSettingsStore();
  const { startStory, active: storyActive } = useStoryStore();

  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [dataFeedModalOpen, setDataFeedModalOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const navigate = (screen: ScreenId) => {
    if (onNavigateScreen) onNavigateScreen(screen);
  };

  return (
    <>
      <header className="h-12 border-b border-gunmetal/80 bg-charcoal text-ivory px-4 flex items-center justify-between z-30 select-none">
        {/* Left Group: App Brand & Date Scrubber */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Brand - Clickable to Overview */}
          <button
            onClick={() => navigate('overview')}
            className="flex items-center gap-2 pr-3 border-r border-gunmetal hover:opacity-90 transition-opacity cursor-pointer text-left"
            title="Go to Terminal Overview"
          >
            <div className="w-5 h-5 rounded bg-gold/15 border border-gold flex items-center justify-center text-xs font-mono font-bold text-gold">
              A
            </div>
            <span className="font-display text-lg font-normal text-ivory tracking-wide">
              The Aurum<span className="text-gold font-semibold">Lens</span>
            </span>
            <span className="text-[10px] font-mono text-silver/70 uppercase tracking-widest pl-1 hidden sm:inline">Terminal</span>
          </button>

          {/* Date Selector - Steppers + Clickable Date for Popover Picker */}
          <div className="flex items-center gap-1 bg-gunmetal px-1.5 py-1 rounded border border-gunmetal/80">
            <button
              onClick={prevDay}
              className="p-1 rounded text-silver hover:text-gold transition-colors cursor-pointer"
              title="Previous Trading Day (Left Arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDatePickerOpen(true)}
              className="font-mono text-xs text-gold font-bold px-2 py-0.5 rounded hover:bg-charcoal/80 transition-colors flex items-center gap-1 cursor-pointer"
              title="Click to pick any trading session date"
            >
              <Calendar className="w-3 h-3 text-gold/70" />
              <span>{currentDate || '2025-01-10'}</span>
            </button>
            <button
              onClick={nextDay}
              className="p-1 rounded text-silver hover:text-gold transition-colors cursor-pointer"
              title="Next Trading Day (Right Arrow)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Source Badge - Clickable to DataFeedModal */}
          <button
            onClick={() => setDataFeedModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-silver/80 hover:text-gold hover:bg-gunmetal px-2 py-1 rounded transition-colors cursor-pointer"
            title="Inspect Official MCX Bhavcopy EOD Source Feed"
          >
            <Database className="w-3.5 h-3.5 text-gold" />
            <span>MCX Daily Bhavcopy</span>
          </button>
        </div>

        {/* Center Group: Live Split-Flap Status Board & Guarantees */}
        <div className="flex items-center gap-3">
          {/* SplitFlapText Ticker - Clickable to Data Integrity */}
          <button
            onClick={() => navigate('integrity')}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-gunmetal border border-gold/30 shadow-inner hover:border-gold/60 transition-colors cursor-pointer"
            title="Inspect Zero Look-Ahead Audit Certificate"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shrink-0" />
            <SplitFlapText
              words={['AUDIT: PASS', 'FEED SYNCED', 'NO LOOK-AHEAD']}
              flipDuration={0.12}
              stagger={0.06}
              cycleDelay={2800}
              fontSize={11}
              tileRadius={3}
              gap={2}
              padTo={14}
              tileColor="#121417"
              textColor="#D4AF37"
            />
          </button>

          {/* Guarantee Badge - Clickable to Data Integrity */}
          <button
            onClick={() => navigate('integrity')}
            className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded bg-termgreen/15 border border-termgreen/40 hover:bg-termgreen/25 text-termgreen text-[10px] font-mono font-bold transition-colors cursor-pointer"
            title="View Zero Look-Ahead Mathematical Invariance Proof"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Look-Ahead Proof</span>
          </button>
        </div>

        {/* Right Group: Showcase, Story, API, Theme, Assumptions, ⌘K */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Showcase Topo Hero Trigger */}
          <button
            onClick={() => setHeroLandingOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-silver hover:text-gold hover:bg-gunmetal transition-colors border border-transparent hover:border-gold/30 cursor-pointer"
            title="Open Cinematic 3D Gold Mining Showcase"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="hidden lg:inline">Showcase</span>
          </button>

          {/* Story Mode Hero CTA */}
          <button
            onClick={startStory}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
              storyActive
                ? 'bg-gold text-charcoal shadow-gold'
                : 'bg-gold/20 text-gold hover:bg-gold hover:text-charcoal border border-gold/40'
            }`}
            title="Launch step-by-step terminal walkthrough"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Story Mode</span>
          </button>

          {/* API Modal Trigger */}
          <button
            onClick={() => setApiModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-gunmetal hover:bg-[#2F343C] border border-gunmetal/90 text-[11px] font-mono transition-colors cursor-pointer text-silver hover:text-gold"
            title="Inspect FastAPI Backend Endpoints & Diagnostics"
          >
            <Cpu className="w-3.5 h-3.5 text-gold" />
            <span>API</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded bg-gunmetal hover:bg-[#2F343C] border border-gunmetal/90 text-silver hover:text-gold transition-colors cursor-pointer"
            title={darkMode ? "Switch to Warm Ivory Light Mode" : "Switch to Deep Charcoal Dark Mode"}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-gold" /> : <Moon className="w-3.5 h-3.5 text-silver" />}
          </button>

          {/* Assumptions Drawer Toggle */}
          <button
            onClick={() => setAssumptionsOpen(!assumptionsOpen)}
            className={`p-1.5 rounded border transition-colors cursor-pointer ${
              assumptionsOpen
                ? 'bg-gold text-charcoal border-gold'
                : 'bg-gunmetal text-silver hover:text-gold border-gunmetal/90 hover:bg-[#2F343C]'
            }`}
            title="Model Parameters, Slippage & Friction Assumptions"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-1.5 rounded bg-gunmetal hover:bg-[#2F343C] border border-gunmetal/90 text-silver hover:text-gold transition-colors cursor-pointer"
            title="Open Command Palette (Ctrl+K or ⌘K)"
          >
            <Command className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Diagnostics & Picker Modals */}
      <ApiModal isOpen={apiModalOpen} onClose={() => setApiModalOpen(false)} />
      <DataFeedModal
        isOpen={dataFeedModalOpen}
        onClose={() => setDataFeedModalOpen(false)}
        onNavigateScreen={navigate}
      />
      <DatePickerModal isOpen={datePickerOpen} onClose={() => setDatePickerOpen(false)} />
    </>
  );
}

export default StatusBar;
