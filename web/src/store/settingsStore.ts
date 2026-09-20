import { create } from 'zustand';

interface SettingsState {
  presentationScale: boolean;
  reduceMotion: boolean;
  selectedPair: string;
  assumptionsOpen: boolean;
  commandPaletteOpen: boolean;
  presenterNotesOpen: boolean;
  darkMode: boolean;
  heroLandingOpen: boolean;

  setPresentationScale: (val: boolean) => void;
  setReduceMotion: (val: boolean) => void;
  setSelectedPair: (pair: string) => void;
  setAssumptionsOpen: (val: boolean) => void;
  setCommandPaletteOpen: (val: boolean) => void;
  setPresenterNotesOpen: (val: boolean) => void;
  setDarkMode: (val: boolean) => void;
  setHeroLandingOpen: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  presentationScale: false,
  reduceMotion: false,
  selectedPair: 'GOLDTEN-GOLDPETAL',
  assumptionsOpen: false,
  commandPaletteOpen: false,
  presenterNotesOpen: false,
  darkMode: false, // Default to warm ivory light mode per prompt specs
  heroLandingOpen: true, // Opens with 3D Gold Mining Showcase Hero, scrolls into terminal

  setPresentationScale: (val) => set({ presentationScale: val }),
  setReduceMotion: (val) => set({ reduceMotion: val }),
  setSelectedPair: (selectedPair) => set({ selectedPair }),
  setAssumptionsOpen: (assumptionsOpen) => set({ assumptionsOpen }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setPresenterNotesOpen: (presenterNotesOpen) => set({ presenterNotesOpen }),
  setDarkMode: (darkMode) => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ darkMode });
  },
  setHeroLandingOpen: (heroLandingOpen) => set({ heroLandingOpen })
}));
