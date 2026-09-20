import { create } from 'zustand';
import { DailySnapshot } from '../types';

interface ReplayState {
  dates: string[];
  currentIndex: number;
  currentDate: string;
  playing: boolean;
  speed: number;
  snapshot: DailySnapshot | null;
  loading: boolean;
  error: string | null;
  mode: 'API' | 'BUNDLE';

  setDates: (dates: string[]) => void;
  setDateIndex: (index: number) => void;
  setDate: (date: string) => void;
  setSpeed: (speed: number) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  nextDay: () => void;
  prevDay: () => void;
  setSnapshot: (snapshot: DailySnapshot | null) => void;
  setMode: (mode: 'API' | 'BUNDLE') => void;
  setLoading: (loading: boolean) => void;
}

export const useReplayStore = create<ReplayState>((set, get) => ({
  dates: [],
  currentIndex: 0,
  currentDate: '',
  playing: false,
  speed: 1,
  snapshot: null,
  loading: false,
  error: null,
  mode: 'API',

  setDates: (dates) => {
    if (!dates.length) return;
    const curr = get().currentDate;
    const idx = curr ? dates.indexOf(curr) : dates.length - 1;
    const validIdx = idx >= 0 ? idx : dates.length - 1;
    set({
      dates,
      currentIndex: validIdx,
      currentDate: dates[validIdx]
    });
  },

  setDateIndex: (index) => {
    const { dates } = get();
    if (index >= 0 && index < dates.length) {
      set({ currentIndex: index, currentDate: dates[index] });
    }
  },

  setDate: (date) => {
    const { dates } = get();
    const idx = dates.indexOf(date);
    if (idx >= 0) {
      set({ currentIndex: idx, currentDate: date });
    } else {
      set({ currentDate: date });
    }
  },

  setSpeed: (speed) => set({ speed }),
  togglePlay: () => set((s) => ({ playing: !s.playing })),
  setPlaying: (playing) => set({ playing }),

  nextDay: () => {
    const { currentIndex, dates } = get();
    if (currentIndex < dates.length - 1) {
      const nextIdx = currentIndex + 1;
      set({ currentIndex: nextIdx, currentDate: dates[nextIdx] });
    } else {
      set({ playing: false });
    }
  },

  prevDay: () => {
    const { currentIndex, dates } = get();
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      set({ currentIndex: prevIdx, currentDate: dates[prevIdx] });
    }
  },

  setSnapshot: (snapshot) => set({ snapshot }),
  setMode: (mode) => set({ mode }),
  setLoading: (loading) => set({ loading })
}));
