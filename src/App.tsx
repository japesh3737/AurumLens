import React, { useState, useEffect } from 'react';
import { StatusBar } from './app/StatusBar';
import { Navbar, ScreenId } from './app/Navbar';
import { AssumptionsDrawer } from './app/AssumptionsDrawer';
import { PresenterMode } from './app/PresenterMode';
import { CommandPalette } from './app/CommandPalette';
import { HalideTopoHero } from './components/ui/halide-topo-hero';
import { OverviewScreen } from './screens/OverviewScreen';
import { RelativeValueScreen } from './screens/RelativeValueScreen';
import { FuturesCurveScreen } from './screens/FuturesCurveScreen';
import { ReplayLabScreen } from './screens/ReplayLabScreen';
import { BacktestScreen } from './screens/BacktestScreen';
import { LifecycleScreen } from './screens/LifecycleScreen';
import { DataIntegrityScreen } from './screens/DataIntegrityScreen';
import { useReplayStore } from './store/replayStore';
import { useSettingsStore } from './store/settingsStore';
import { fetchMeta, fetchSnapshot } from './lib/api';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('overview');
  const { setDates, currentDate, setDate, snapshot, setSnapshot, setLoading } = useReplayStore();
  const {
    selectedPair,
    setSelectedPair,
    presentationScale,
    heroLandingOpen,
    setHeroLandingOpen
  } = useSettingsStore();

  // Load initial manifest & dates
  useEffect(() => {
    fetchMeta().then((meta) => {
      if (meta) {
        if (meta.dates) {
          setDates(meta.dates);
        } else if (meta.default_showcase_date) {
          setDate(meta.default_showcase_date);
        }
      }
    });
  }, [setDates, setDate]);

  // Load snapshot when currentDate changes
  useEffect(() => {
    if (!currentDate) return;
    setLoading(true);
    fetchSnapshot(currentDate)
      .then((data) => {
        setSnapshot(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch snapshot:', err);
        setLoading(false);
      });
  }, [currentDate, setSnapshot, setLoading]);

  return (
    <div
      className={`h-screen w-screen flex flex-col bg-ivory dark:bg-charcoal text-ink dark:text-ivory overflow-hidden transition-colors duration-150 ${
        presentationScale ? 'text-base' : 'text-sm'
      }`}
    >
      {/* Top Status Bar (Charcoal shell) */}
      <StatusBar currentScreen={currentScreen} onNavigateScreen={setCurrentScreen} />

      {/* Main Terminal Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Rail (Charcoal shell) */}
        <Navbar currentScreen={currentScreen} onSelectScreen={setCurrentScreen} />

        {/* Dynamic Screen Viewport (Warm Ivory in light mode, deep charcoal in dark mode) */}
        <main className="flex-1 flex flex-col overflow-hidden bg-ivory dark:bg-charcoal transition-colors duration-150">
          {currentScreen === 'overview' && (
            <OverviewScreen
              snapshot={snapshot}
              onNavigate={setCurrentScreen}
              onSelectPair={setSelectedPair}
            />
          )}
          {currentScreen === 'relative-value' && (
            <RelativeValueScreen
              snapshot={snapshot}
              selectedPair={selectedPair}
              onSelectPair={setSelectedPair}
              onNavigate={setCurrentScreen}
            />
          )}
          {currentScreen === 'curve' && <FuturesCurveScreen snapshot={snapshot} />}
          {currentScreen === 'replay' && <ReplayLabScreen snapshot={snapshot} />}
          {currentScreen === 'backtest' && <BacktestScreen defaultPair={selectedPair} />}
          {currentScreen === 'lifecycle' && <LifecycleScreen currentDate={currentDate} />}
          {currentScreen === 'integrity' && <DataIntegrityScreen />}
        </main>
      </div>

      {/* Presentation Tools & Drawers */}
      <AssumptionsDrawer />
      <PresenterMode onNavigateScreen={setCurrentScreen} />
      <CommandPalette onNavigate={setCurrentScreen} />

      {/* Optional Cinematic Showcase Hero Modal */}
      {heroLandingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <HalideTopoHero
            showCloseButton
            onClose={() => setHeroLandingOpen(false)}
            onEnterTerminal={() => setHeroLandingOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default App;
