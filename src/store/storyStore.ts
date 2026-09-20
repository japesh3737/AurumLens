import { create } from 'zustand';
import { StoryStep } from '../types';

export const STORY_STEPS: StoryStep[] = [
  {
    id: 0,
    title: "Market Overview",
    screen: "overview",
    duration_s: 20,
    narration: "MCX lists gold four ways: GOLDM, GOLDTEN, GOLDGUINEA, and GOLDPETAL. These four prices look completely different — but every one of them is gold."
  },
  {
    id: 1,
    title: "Basis Normalization",
    screen: "overview",
    duration_s: 35,
    action: "trigger_normalize",
    narration: "Different size, quote unit, and purity. We convert all four to one common institutional basis — ₹ per 10 g of 999 gold. Now they're comparable."
  },
  {
    id: 2,
    title: "Term Structure & Carry Adjustment",
    screen: "curve",
    duration_s: 35,
    narration: "Even normalized prices shouldn't match identically — contracts expire on different dates. We fit the futures curve and separate carry from what's left over: the residual."
  },
  {
    id: 3,
    title: "Cross-Contract Relative Value",
    screen: "relative-value",
    duration_s: 45,
    narration: "Here's today's unexplained difference versus its own history. It looks unusual. Most tools would shout 'arbitrage'."
  },
  {
    id: 4,
    title: "The 9-Gate Signal Filter",
    screen: "relative-value",
    duration_s: 40,
    action: "run_gates",
    narration: "AurumLens asks nine questions before it speaks: data quality, normalization, curve, statistical deviation, history, liquidity, lifecycle, costs, exposure. We optimize for signal quality, not signal frequency."
  },
  {
    id: 5,
    title: "Replay Lab (No Look-Ahead Audit)",
    screen: "replay",
    duration_s: 45,
    action: "play_replay",
    narration: "At every step, the model only sees what was knowable that day. We prove it: recomputing any day with the future deleted gives bit-identical output — audit PASS."
  },
  {
    id: 6,
    title: "Walk-Forward Backtest & Attribution",
    screen: "backtest",
    duration_s: 40,
    narration: "Walk-forward, after costs, using the contracts actually held. And we separate relative-value P&L from just being long gold."
  },
  {
    id: 7,
    title: "Data Integrity & Traceability",
    screen: "integrity",
    duration_s: 20,
    narration: "Every number traces to the exchange file — including holiday days where MCX returned a different date. Not an arbitrage bot: a validation platform. When there's nothing real to say, AurumLens stays quiet."
  }
];

interface StoryState {
  active: boolean;
  currentStepIndex: number;
  startStory: () => void;
  exitStory: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  active: false,
  currentStepIndex: 0,
  startStory: () => set({ active: true, currentStepIndex: 0 }),
  exitStory: () => set({ active: false }),
  nextStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex < STORY_STEPS.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ active: false });
    }
  },
  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },
  goToStep: (index) => {
    if (index >= 0 && index < STORY_STEPS.length) {
      set({ currentStepIndex: index });
    }
  }
}));
