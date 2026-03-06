import { useEffect, useState } from "react";
import { LeftPanel } from "@/components/LeftPanel";
import { RightPanel } from "@/components/RightPanel";
import { SceneCanvas } from "@/components/SceneCanvas";
import { useOperatorStore } from "@/store/useOperatorStore";
import { telemetryService } from "@/services/telemetryService";
import { useOpsStore } from "@/state/useOpsStore";
import { mockStuckEvents, mockVehicles } from "@/data/mockOps";
import { lngLatToSceneXZ } from "@/lib/geo";
import type { StuckReason as SceneStuckReason } from "@/types";

export function RemoteAssistWorkspace() {
  const setHeroBus = useOperatorStore((state) => state.setHeroBus);
  const loadStuckScenario = useOperatorStore((state) => state.loadStuckScenario);
  const [isMeasureTooltipVisible, setIsMeasureTooltipVisible] = useState(false);
  const selectedEventId = useOpsStore((s) => s.selectedEventId);

  // Preserve existing Three.js page behavior: load scenario + telemetry loop
  useEffect(() => {
    loadStuckScenario();

    // Bind selected incident into the 3D scenario (position + heading + reason).
    if (selectedEventId) {
      const evt = mockStuckEvents.find((e) => e.id === selectedEventId);
      const veh = evt ? mockVehicles.find((v) => v.id === evt.vehicleId) : null;

      if (evt) {
        const { x, z } = lngLatToSceneXZ(evt.location);
        const headingDeg = veh?.headingDeg ?? 0;
        const rotation = ((headingDeg * Math.PI) / 180) * -1;

        const mapReasonToScene = (): SceneStuckReason => {
          switch (evt.reason) {
            case "blocked_lane":
            case "lane_blockage":
              return "blocked_lane";
            case "construction":
            case "work_zone":
            case "traffic_control":
              return "construction";
            case "accident":
              return evt.reason;
            case "unknown_obstacle":
            case "pedestrian_yield":
            case "localization_degraded":
            case "perception_uncertain":
            case "sensor_degraded":
            case "teleop_required":
              return "unknown_obstacle";
            default:
              return "unknown_obstacle";
          }
        };

        setHeroBus({
          position: { x, y: 0.75, z },
          rotation,
          velocity: 0,
          gear: "P",
          autonomyState: "stuck",
          stuckReason: mapReasonToScene(),
        });
      }
    }

    telemetryService.start(2000);
    const unsubscribe = telemetryService.subscribe((update) => {
      const updates: any = { timestamp: update.timestamp };
      if (update.position) updates.position = update.position;
      if (update.rotation !== undefined) updates.rotation = update.rotation;
      if (update.velocity !== undefined) updates.velocity = update.velocity;
      if (update.autonomyState) updates.autonomyState = update.autonomyState;
      if (update.stuckReason !== undefined) updates.stuckReason = update.stuckReason;
      if (update.batteryLevel !== undefined) updates.batteryLevel = update.batteryLevel;
      setHeroBus(updates);
    });

    return () => {
      telemetryService.stop();
      unsubscribe();
    };
  }, [setHeroBus, loadStuckScenario, selectedEventId]);

  useEffect(() => {
    const isMKey = (event: KeyboardEvent) =>
      event.code === "KeyM" || event.key.toLowerCase() === "m";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isMKey(event)) return;
      setIsMeasureTooltipVisible(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isMKey(event)) return;
      setIsMeasureTooltipVisible(false);
    };

    const handleWindowBlur = () => setIsMeasureTooltipVisible(false);

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex overflow-hidden">
      {isMeasureTooltipVisible ? (
        <div className="pointer-events-none fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-md bg-black/70 px-3 py-2 text-xs text-slate-100 shadow-lg ring-1 ring-white/10 backdrop-blur-sm">
          Hold <span className="font-semibold">M</span> to view measurement tips
        </div>
      ) : null}

      <LeftPanel />

      <div className="relative min-w-0 flex-1">
        <SceneCanvas />
      </div>

      <RightPanel />
    </div>
  );
}

