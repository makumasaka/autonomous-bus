import { useEffect, useState } from 'react';
import { SceneCanvas } from './components/SceneCanvas';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { Header } from './components/Header';
import { useOperatorStore } from './store/useOperatorStore';
import { telemetryService } from './services/telemetryService';

export default function App() {
  const setHeroBus = useOperatorStore((state) => state.setHeroBus);
  const loadStuckScenario = useOperatorStore((state) => state.loadStuckScenario);
  const [isMeasureTooltipVisible, setIsMeasureTooltipVisible] = useState(false);

  // Initialize telemetry service and load demo scenario on mount
  useEffect(() => {
    // Load stuck scenario on startup
    loadStuckScenario();

    // Start telemetry service
    telemetryService.start(2000);

    // Subscribe to telemetry updates
    const unsubscribe = telemetryService.subscribe((update) => {
      // Update hero bus state with telemetry data
      const updates: any = {
        timestamp: update.timestamp,
      };
      
      if (update.position) {
        updates.position = update.position;
      }
      if (update.rotation !== undefined) {
        updates.rotation = update.rotation;
      }
      if (update.velocity !== undefined) {
        updates.velocity = update.velocity;
    }
      if (update.autonomyState) {
        updates.autonomyState = update.autonomyState;
      }
      if (update.stuckReason !== undefined) {
        updates.stuckReason = update.stuckReason;
      }
      if (update.batteryLevel !== undefined) {
        updates.batteryLevel = update.batteryLevel;
      }
      
      setHeroBus(updates);
    });

    return () => {
      telemetryService.stop();
      unsubscribe();
    };
  }, [setHeroBus, loadStuckScenario]);

  useEffect(() => {
    const isMKey = (event: KeyboardEvent) =>
      event.code === 'KeyM' || event.key.toLowerCase() === 'm';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isMKey(event)) return;
      setIsMeasureTooltipVisible(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isMKey(event)) return;
      setIsMeasureTooltipVisible(false);
    };

    const handleWindowBlur = () => {
      setIsMeasureTooltipVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      <Header />
      
      <div className="flex-1 flex relative overflow-hidden">
        <LeftPanel />
        
        <div className="flex-1 relative">
          <SceneCanvas />
          {isMeasureTooltipVisible && (
            <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-md bg-gray-900/90 px-3 py-2 text-xs text-gray-100 shadow-lg ring-1 ring-white/10">
              Hold <span className="font-semibold">M</span> to view measurement tips
            </div>
          )}
        </div>
        
        <RightPanel />
      </div>
    </div>
  );
}
