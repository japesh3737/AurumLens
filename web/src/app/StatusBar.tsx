import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { useReplayStore } from '../store/replayStore';
import { useSettingsStore } from '../store/settingsStore';
import { useStoryStore } from '../store/storyStore';
import { SplitFlapText } from '../components/ui/split-flap-text';

export function StatusBar() {
  const { currentDate, nextDay, prevDay, mode, setMode } = useReplayStore();
  const {
    assumptionsOpen,
    setAssumptionsOpen,
    setCommandPaletteOpen,
    darkMode,
    setDarkMode,
    setHeroLandingOpen
  } = useSettingsStore();
  const { startStory, active: storyActive } = useStoryStore();

  return (
    <header className="h-12 border-b border-gunmetal/80 bg-charcoal text-ivory px-4 flex items-center justify-between z-30 select-none">
      {/* Left Group: App Brand & Date Scrubber */}
      <div className="flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 pr-3 border-r border-gunmetal">
          <div className="w-5 h-5 rounded bg-gold/15 border border-gold flex items-center justify-center text-xs font-mono font-bold text-gold">
            A
          </div>
          <span className="font-display text-lg font-normal text-ivory tracking-wide">
            The Aurum<span className="text-gold font-semibold">Lens</span>
          </span>
          <span className="text-[10px] font-mono text-silver/70 uppercase tracking-widest pl-1">Terminal</span>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 bg-gunmetal px-2 py-1 rounded border border-gunmetal/80">
          <button
            onClick={prevDay}
            className="p-0.5 rounded text-silver hover:text-gold transition-colors cursor-pointer"
            title="Previous Day (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs text-gold font-semibold px-2 min-w-[90px] text-center">
            {currentDate || '2025-01-10'}
          </span>
          <button
            onClick={nextDay}
            className="p-0.5 rounded text-silver hover:text-gold transition-colors cursor-pointer"
            title="Next Day (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Source Badge */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-silver/80">
          <Database className="w-3.5 h-3.5 text-gold" />
          <span>MCX Daily Bhavcopy (Real EOD)</span>
        </div>
      </div>

      {/* Center Group: Live Split-Flap Status Board & Guarantees */}
      <div className="flex items-center gap-3">
        {/* SplitFlapText Ticker */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-gunmetal border border-gold/30 shadow-inner">
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
            textColor="#C9A227"
          />
        </div>

        {/* Guarantee Badge */}
        <div className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded bg-termgreen/10 border border-termgreen/30 text-termgreen text-[10px] font-mono font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          Zero Look-Ahead Proof
        </div>
      </div>

      {/* Right Group: Showcase, Story, Mode, Theme, Assumptions, ⌘K */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Showcase Topo Hero Trigger */}
        <button
          onClick={() => setHeroLandingOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-silver hover:text-gold hover:bg-gunmetal transition-colors border border-transparent hover:border-gold/30 cursor-pointer"
          title="Open Cinematic Showcase Hero"
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
        >
          <Play className="w-3 h-3 fill-current" />
          Story Mode
        </button>

        {/* API / Bundle Mode Badge Toggle */}
        <button
          onClick={() => setMode(mode === 'API' ? 'BUNDLE' : 'API')}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-gunmetal hover:bg-[#2F343C] border border-gunmetal/90 text-[11px] font-mono transition-colors cursor-pointer text-silver"
          title="Toggle between Live API and Precomputed Offline Bundle"
        >
          <Cpu className="w-3 h-3 text-gold" />
          <span>{mode}</span>
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
          title="Assumptions & Parameters"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-gunmetal hover:bg-[#2F343C] border border-gunmetal/90 text-[11px] font-mono text-silver hover:text-gold transition-colors cursor-pointer"
          title="Command Palette (Ctrl+K)"
        >
          <Command className="w-3 h-3" />
          <span>K</span>
        </button>
      </div>
    </header>
  );
}
