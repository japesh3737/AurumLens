import React from 'react';
import {
  LayoutDashboard,
  GitCompare,
  TrendingUp,
  History,
  FlaskConical,
  CalendarRange,
  ShieldAlert,
} from 'lucide-react';

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
    <nav className="w-56 bg-charcoal border-r border-gunmetal/80 flex flex-col justify-between py-4 select-none shrink-0">
      <div className="px-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-silver/60 font-semibold">
          Terminal Screens
        </div>
        {items.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-mono transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-gunmetal text-gold font-bold border border-gold/40 shadow-sm'
                  : 'text-silver hover:text-ivory hover:bg-gunmetal/50'
              }`}
            >
              <span className={isActive ? 'text-gold' : 'text-silver/70'}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Terminal Footer Panel (Exchange Feed Status) */}
      <div className="mx-3 p-3 rounded-lg bg-gunmetal/90 border border-hair/20 shadow-sm antialiased">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-silver uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-termgreen inline-block animate-pulse" />
          <span>Exchange Feed</span>
        </div>
        <div className="text-xs font-sans font-bold text-ivory tracking-wide mt-1">
          MCX Gold Futures
        </div>
        <div className="text-[10px] font-mono text-silver/90 mt-1 leading-snug">
          GOLDM · GOLDTEN · GOLDGUINEA · GOLDPETAL
        </div>
      </div>
    </nav>
  );
}
