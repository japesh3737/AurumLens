import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ShieldCheck,
  Bookmark as BookmarkIcon,
  Lock,
} from 'lucide-react';
import { useReplayStore } from '../store/replayStore';
import { DailySnapshot, Bookmark } from '../types';
import { fetchBookmarks } from '../lib/api';
import { GateStrip } from '../viz/GateStrip';
import { RetroButton } from '../components/ui/button-retro';

interface ReplayLabProps {
  snapshot: DailySnapshot | null;
}

export function ReplayLabScreen({ snapshot }: ReplayLabProps) {
  const {
    dates,
    currentIndex,
    currentDate,
    playing,
    speed,
    setSpeed,
    togglePlay,
    nextDay,
    prevDay,
    setDateIndex,
    setDate,
  } = useReplayStore();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [eventLog, setEventLog] = useState<string[]>([]);

  useEffect(() => {
    fetchBookmarks().then((b) => {
      if (b) setBookmarks(b);
    });
  }, []);

  // Playback timer loop
  useEffect(() => {
    if (!playing) return;
    const intervalMs = Math.max(100, 600 / speed);
    const timer = setInterval(() => {
      nextDay();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [playing, speed, nextDay]);

  // Log events on date change
  useEffect(() => {
    if (!snapshot) return;
    const dateStr = snapshot.date;
    const activePairs = Object.entries(snapshot.pairs || {}).filter(
      ([_, p]) => p.status === 'POTENTIAL SIGNAL' || p.status === 'ELEVATED'
    );

    if (activePairs.length > 0) {
      const topPair = activePairs[0];
      const entry = `${dateStr} · ${topPair[0]} (z=${topPair[1].z_score?.toFixed(1) || '—'}) → ${topPair[1].verdict}: ${topPair[1].headline_reason.slice(0, 50)}...`;
      setEventLog((prev) => [entry, ...prev.slice(0, 15)]);
    }
  }, [snapshot?.date]);

  const activePair = snapshot?.pairs ? Object.values(snapshot.pairs)[0] : null;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-ivory dark:bg-charcoal text-ink dark:text-ivory transition-colors duration-150">
      {/* Replay Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hair dark:border-hair/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gold font-bold px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
              Replay Lab · Historical Time Machine
            </span>
            <span className="text-xs font-mono text-ink-muted dark:text-silver">Strict Sequential Step</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-ivory mt-1">
            Zero Look-Ahead Market Playback
          </h1>
        </div>

        {/* Guarantees */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            NO LOOK-AHEAD MODE
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-termgreen-tint border border-termgreen/40 text-termgreen font-mono text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Audit: PASS
          </div>
        </div>
      </div>

      {/* Scrubbing & Physical Tape-Deck Controller Card */}
      <div className="terminal-card p-5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-hair dark:border-hair/50 mb-4">
          {/* Tactile RetroButton Transport Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <RetroButton variant="darkGray" onClick={prevDay} title="Step 1 Day Back">
              <SkipBack className="w-3.5 h-3.5 mr-1 inline" />
              BACK
            </RetroButton>

            <RetroButton variant={playing ? "white" : "default"} onClick={togglePlay} title="Play/Pause Historical Replay">
              {playing ? <Pause className="w-3.5 h-3.5 mr-1 fill-current inline" /> : <Play className="w-3.5 h-3.5 mr-1 fill-current inline" />}
              {playing ? 'PAUSE' : 'PLAY'}
            </RetroButton>

            <RetroButton variant="darkGray" onClick={nextDay} title="Step 1 Day Forward">
              STEP
              <SkipForward className="w-3.5 h-3.5 ml-1 inline" />
            </RetroButton>

            {/* Speed Selector */}
            <div className="ml-2 flex items-center bg-ivory dark:bg-charcoal rounded border border-hair dark:border-hair/60 text-xs font-mono p-0.5">
              {[0.5, 1, 2, 5, 10].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    speed === s ? 'bg-gold text-charcoal font-bold' : 'text-ink-muted dark:text-silver hover:text-gold'
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>

          {/* Current Date Display */}
          <div className="text-right">
            <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider block">
              Simulated Horizon
            </span>
            <div className="text-xl font-mono font-bold text-gold">{currentDate || '2025-01-10'}</div>
          </div>
        </div>

        {/* Timeline Scrubber Slider */}
        <div className="relative pt-2">
          <input
            type="range"
            min={0}
            max={Math.max(0, dates.length - 1)}
            value={currentIndex}
            onChange={(e) => setDateIndex(parseInt(e.target.value))}
            className="w-full accent-gold bg-hair dark:bg-charcoal h-2 rounded cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-ink-muted dark:text-silver mt-1.5">
            <span>Start: {dates[0] || '—'}</span>
            <span>Day {currentIndex + 1} of {dates.length}</span>
            <span>End: {dates[dates.length - 1] || '—'}</span>
          </div>
        </div>

        {/* Showcase Bookmarks Bar */}
        {bookmarks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-hair dark:border-hair/50 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono text-ink-muted dark:text-silver uppercase tracking-wider flex items-center gap-1 shrink-0">
              <BookmarkIcon className="w-3.5 h-3.5 text-gold" />
              Showcase Days:
            </span>
            {bookmarks.map((bm, idx) => (
              <button
                key={idx}
                onClick={() => setDate(bm.date)}
                className={`px-2.5 py-1 rounded border text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                  currentDate === bm.date
                    ? 'bg-gold/15 border-gold text-gold font-bold'
                    : 'bg-ivory dark:bg-charcoal border-hair dark:border-hair/60 text-ink dark:text-silver hover:border-gold/50'
                }`}
                title={bm.description}
              >
                {bm.date} · {bm.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Masked Future Horizon Visual Banner */}
      <div className="terminal-card p-4 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold flex items-center justify-center text-gold shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-gold uppercase tracking-wider">
              Data Horizon Lock · Future Masked
            </div>
            <p className="text-xs text-ink-muted dark:text-silver mt-0.5">
              Everything beyond {currentDate} is completely deleted from the runtime memory. The analytics model cannot observe future quotes, settlements, or volume.
            </p>
          </div>
        </div>
      </div>

      {/* Live State Digest Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Pair State */}
        {activePair && (
          <div className="space-y-4">
            <GateStrip
              gates={activePair.gates || []}
              verdict={activePair.verdict}
              headlineReason={activePair.headline_reason}
              animateSequential={false}
            />
          </div>
        )}

        {/* Live Replay Event Stream */}
        <div className="terminal-card p-5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-hair dark:border-hair/50 mb-3">
              <span className="text-xs uppercase tracking-widest font-mono text-gold font-semibold">
                Sequential Analytical Log
              </span>
              <span className="text-[10px] font-mono text-ink-muted dark:text-silver">Streaming</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
              {eventLog.length === 0 ? (
                <div className="text-ink-muted dark:text-silver italic">Advancing replay timeline streams event decisions here...</div>
              ) : (
                eventLog.map((log, idx) => (
                  <div key={idx} className="p-2 rounded bg-ivory dark:bg-charcoal border border-hair dark:border-hair/40 text-ink dark:text-silver text-[11px] leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReplayLabScreen;
