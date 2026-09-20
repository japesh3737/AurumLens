import React, { useState } from 'react';
import {
  LayoutDashboard,
  GitCompare,
  TrendingUp,
  History,
  FlaskConical,
  CalendarRange,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { DataFeedModal } from './DataFeedModal';

export type ScreenId =
  | 'overview'
  | 'relative-value'
  | 'curve'
  | 'replay'
  | 'backtest'
  | 'lifecycle'
  | 'integrity';

interface NavbarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}

export function Navbar({ currentScreen, onSelectScreen }: NavbarProps) {
  const [feedModalOpen, setFeedModalOpen] = useState(false);

  const items: Array<{ id: ScreenId; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'relative-value', label: 'Relative Value', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'curve', label: 'Futures Curve', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'replay', label: 'Replay Lab', icon: <History className="w-4 h-4" /> },
    { id: 'backtest', label: 'Backtest', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'lifecycle', label: 'Lifecycle', icon: <CalendarRange className="w-4 h-4" /> },
    { id: 'integrity', label: 'Data Integrity', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <>
      <nav className="w-56 bg-[#111315] border-r border-[#23262B] flex flex-col justify-between py-4 select-none shrink-0 h-full">
        <div className="px-3 space-y-1.5">
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-[#8A929E] font-bold">
            Terminal Screens
          </div>
          {items.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#23262B] text-[#F1C442] font-bold border-2 border-[#F1C442] shadow-[0_0_12px_rgba(241,196,66,0.25)]'
                    : 'text-[#D0D4DC] hover:text-[#FFFFFF] hover:bg-[#1E2127]'
                }`}
              >
                <span className={isActive ? 'text-[#F1C442]' : 'text-[#8A929E]'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Terminal Footer Panel (Interactive Exchange Feed Status) */}
        <button
          onClick={() => setFeedModalOpen(true)}
          className="mx-3 p-3 rounded-lg bg-[#1A1D22] hover:bg-[#23262B] border border-[#2C3038] hover:border-[#F1C442]/60 shadow-sm transition-all text-left cursor-pointer group"
          title="Click to view real-time Bhavcopy specs & feed health"
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#A6ACB5] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block animate-pulse" />
              <span>Exchange Feed</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#8A929E] group-hover:text-[#F1C442] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-xs font-sans font-bold text-[#F7F4EC] tracking-wide mt-1 group-hover:text-[#F1C442] transition-colors">
            MCX Gold Futures
          </div>
          <div className="text-[10px] font-mono text-[#A6ACB5] mt-1 leading-snug font-medium">
            GOLDM · GOLDTEN · GOLDGUINEA · GOLDPETAL
          </div>
        </button>
      </nav>

      {/* Feed Diagnostics Modal */}
      <DataFeedModal
        isOpen={feedModalOpen}
        onClose={() => setFeedModalOpen(false)}
        onNavigateScreen={onSelectScreen}
      />
    </>
  );
}

export default Navbar;
