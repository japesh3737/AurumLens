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
      <header className="h-12 border-b border-[#23262B] bg-[#111315] text-[#F7F4EC] px-4 flex items-center justify-between z-30 select-none shrink-0">
        {/* Left Group: App Brand & Date Scrubber */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Brand - Clickable to Overview */}
          <button
            onClick={() => navigate('overview')}
            className="flex items-center gap-2 pr-3 border-r border-[#23262B] hover:opacity-85 transition-opacity cursor-pointer text-left"
            title="Go to Terminal Overview"
          >
            <div className="w-5 h-5 rounded bg-gold/20 border border-[#F1C442] flex items-center justify-center text-xs font-mono font-bold text-[#F1C442]">
              A
            </div>
            <span className="font-display text-lg font-normal text-[#F7F4EC] tracking-wide">
              The Aurum<span className="text-[#F1C442] font-semibold">Lens</span>
            </span>
            <span className="text-[10px] font-mono text-[#8A929E] uppercase tracking-widest pl-1 hidden sm:inline font-semibold">Terminal</span>
          </button>

          {/* Date Selector - Steppers + Clickable Date for Popover Picker */}
          <div className="flex items-center gap-1 bg-[#1A1D22] px-1.5 py-1 rounded-lg border border-[#2C3038] shadow-xs">
            <button
              onClick={prevDay}
              className="p-1 rounded text-[#A6ACB5] hover:text-[#F1C442] transition-colors cursor-pointer"
              title="Previous Trading Day (Left Arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDatePickerOpen(true)}
              className="font-mono text-xs text-[#F1C442] font-bold px-2 py-0.5 rounded hover:bg-[#23262B] transition-colors flex items-center gap-1 cursor-pointer"
              title="Click to pick any trading session date"
            >
              <Calendar className="w-3 h-3 text-[#F1C442]/80" />
              <span>{currentDate || '2025-01-10'}</span>
            </button>
            <button
              onClick={nextDay}
              className="p-1 rounded text-[#A6ACB5] hover:text-[#F1C442] transition-colors cursor-pointer"
              title="Next Trading Day (Right Arrow)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Source Badge - Clickable to DataFeedModal */}
          <button
            onClick={() => setDataFeedModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-[#A6ACB5] hover:text-[#F1C442] hover:bg-[#1A1D22] px-2.5 py-1 rounded transition-colors cursor-pointer font-medium"
            title="Inspect Official MCX Bhavcopy EOD Source Feed"
          >
            <Database className="w-3.5 h-3.5 text-[#F1C442]" />
            <span>MCX Daily Bhavcopy</span>
          </button>
        </div>

        {/* Center Group: Live Split-Flap Status Board & Guarantees */}
        <div className="flex items-center gap-3">
          {/* SplitFlapText Ticker - Clickable to Data Integrity */}
          <button
            onClick={() => navigate('integrity')}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1A1D22] border border-[#F1C442]/40 shadow-xs hover:border-[#F1C442] transition-colors cursor-pointer"
            title="Inspect Zero Look-Ahead Audit Certificate"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F1C442] animate-pulse shrink-0" />
            <SplitFlapText
              words={['AUDIT: PASS', 'FEED SYNCED', 'NO LOOK-AHEAD']}
              flipDuration={0.12}
              stagger={0.06}
              cycleDelay={2800}
              fontSize={11}
              tileRadius={3}
              gap={2}
              padTo={14}
              tileColor="#17191C"
              textColor="#F1C442"
            />
          </button>

          {/* Guarantee Badge - Clickable to Data Integrity */}
          <button
            onClick={() => navigate('integrity')}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-termgreen/20 border border-termgreen/40 hover:bg-termgreen/30 text-termgreen text-[10px] font-mono font-bold transition-colors cursor-pointer"
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-[#A6ACB5] hover:text-[#F1C442] hover:bg-[#1A1D22] transition-colors border border-transparent hover:border-[#F1C442]/40 cursor-pointer"
            title="Open Cinematic 3D Gold Mining Showcase"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F1C442]" />
            <span className="hidden lg:inline">Showcase</span>
          </button>

          {/* Story Mode Hero CTA */}
          <button
            onClick={startStory}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              storyActive
                ? 'bg-gold text-charcoal shadow-gold'
                : 'bg-gold/20 text-[#F1C442] hover:bg-gold hover:text-charcoal border border-gold/50'
            }`}
            title="Launch step-by-step terminal walkthrough"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Story Mode</span>
          </button>

          {/* API Modal Trigger */}
          <button
            onClick={() => setApiModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1D22] hover:bg-[#23262B] border border-[#2C3038] text-[11px] font-mono font-medium transition-colors cursor-pointer text-[#A6ACB5] hover:text-[#F1C442] shadow-xs"
            title="Inspect FastAPI Backend Endpoints & Diagnostics"
          >
            <Cpu className="w-3.5 h-3.5 text-[#F1C442]" />
            <span>API</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg bg-[#1A1D22] hover:bg-[#23262B] border border-[#2C3038] text-[#A6ACB5] hover:text-[#F1C442] transition-colors cursor-pointer shadow-xs"
            title={darkMode ? "Switch to Warm Ivory Light Mode" : "Switch to Deep Charcoal Dark Mode"}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-[#F1C442]" /> : <Moon className="w-3.5 h-3.5 text-[#A6ACB5]" />}
          </button>

          {/* Assumptions Drawer Toggle */}
          <button
            onClick={() => setAssumptionsOpen(!assumptionsOpen)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-xs ${
              assumptionsOpen
                ? 'bg-gold text-charcoal border-gold font-bold'
                : 'bg-[#1A1D22] text-[#A6ACB5] hover:text-[#F1C442] border-[#2C3038] hover:bg-[#23262B]'
            }`}
            title="Model Parameters, Slippage & Friction Assumptions"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-1.5 rounded-lg bg-[#1A1D22] hover:bg-[#23262B] border border-[#2C3038] text-[#A6ACB5] hover:text-[#F1C442] transition-colors cursor-pointer shadow-xs"
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
