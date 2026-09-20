import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Sparkles, Volume2 } from 'lucide-react';
import { useStoryStore, STORY_STEPS } from '../store/storyStore';
import { ScreenId } from './Navbar';

interface PresenterProps {
  onNavigateScreen: (screen: ScreenId) => void;
}

export function PresenterMode({ onNavigateScreen }: PresenterProps) {
  const { active, currentStepIndex, nextStep, prevStep, exitStory } = useStoryStore();

  if (!active) return null;

  const currentStep = STORY_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < STORY_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const targetScreen = STORY_STEPS[nextIdx].screen as ScreenId;
      onNavigateScreen(targetScreen);
      nextStep();
    } else {
      exitStory();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      const targetScreen = STORY_STEPS[prevIdx].screen as ScreenId;
      onNavigateScreen(targetScreen);
      prevStep();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-[580px] bg-charcoal/95 border border-gold/40 rounded-xl p-5 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(201,162,39,0.25)] backdrop-blur-md text-ivory"
      >
        {/* Step Indicator & Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gunmetal mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
            <span className="text-xs font-mono font-bold text-gold uppercase tracking-widest">
              Judge Story Mode · Step {currentStepIndex + 1} of {STORY_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-silver">~{currentStep.duration_s}s</span>
            <button
              onClick={exitStory}
              className="p-1 rounded text-silver hover:text-ivory hover:bg-gunmetal transition-colors cursor-pointer"
              title="Exit Story Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Title & Script */}
        <div className="space-y-2">
          <h3 className="font-display text-xl text-ivory font-semibold">
            {currentStep.title}
          </h3>

          <div className="p-3 rounded-lg bg-gunmetal border border-gunmetal/80 text-xs font-mono text-silver flex items-start gap-2.5">
            <Volume2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <p className="leading-relaxed">{currentStep.script}</p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-gold pt-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demonstrating: {currentStep.highlight_element}</span>
          </div>
        </div>

        {/* Stepper Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-gunmetal mt-4">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gunmetal hover:bg-[#2F343C] border border-gunmetal/90 text-xs font-mono text-silver disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-1">
            {STORY_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-6 bg-gold'
                    : idx < currentStepIndex
                    ? 'bg-gold/40'
                    : 'bg-gunmetal'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="btn-gold flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold cursor-pointer"
          >
            {currentStepIndex === STORY_STEPS.length - 1 ? 'Finish' : 'Next Step'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PresenterMode;
