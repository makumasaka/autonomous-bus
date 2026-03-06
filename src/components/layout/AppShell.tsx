import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { lazy, Suspense, useMemo } from "react";
import { mockDepots, mockRoutes, mockStuckEvents, mockVehicles } from "@/data/mockOps";
import { useOpsStore } from "@/state/useOpsStore";
import { cn } from "@/components/ui/utils";
import { TopNav } from "@/components/layout/TopNav";
import { SFMap } from "@/components/map/SFMap";
import { FleetSidebar } from "@/components/map/FleetSidebar";
import { MapLegend } from "@/components/map/MapLegend";
import { IncidentList } from "@/components/event/IncidentList";
import { EventInspector } from "@/components/event/EventInspector";

const RemoteAssistWorkspace = lazy(() =>
  import("@/components/scene/RemoteAssistWorkspace").then((m) => ({
    default: m.RemoteAssistWorkspace,
  })),
);

export function AppShell() {
  const mode = useOpsStore((s) => s.mode);
  const selectedEventId = useOpsStore((s) => s.selectedEventId);
  const selectEvent = useOpsStore((s) => s.selectEvent);
  const openSituational = useOpsStore((s) => s.openSituational);
  const layerSettings = useOpsStore((s) => s.layerSettings);

  const mapData = useMemo(() => {
    return {
      vehicles: layerSettings.vehicles ? mockVehicles : [],
      routes: layerSettings.routes ? mockRoutes : [],
      depots: layerSettings.depots ? mockDepots : [],
      events: layerSettings.incidents ? mockStuckEvents : [],
    };
  }, [layerSettings]);

  return (
    <div className="flex h-screen w-screen flex-col bg-robobus-bg text-slate-100">
      <TopNav />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <LayoutGroup id="robobus-shell">
          {/* Persistent map surface: animates between full and minimap card */}
          <motion.div
            layout
            layoutId="robobus-map"
            className={cn(
              "absolute z-0 overflow-hidden",
              mode === "situational"
                ? "inset-0"
                : "top-4 right-[calc(1rem+20rem)] z-30 h-[232px] w-[380px] rounded-2xl border border-white/12 bg-black/30 shadow-surface ring-1 ring-white/8 backdrop-blur-md",
            )}
            transition={{ type: "spring", stiffness: 240, damping: 26, mass: 0.65 }}
          >
            <div className={cn("absolute inset-0", mode === "remote_assist" ? "opacity-[0.94]" : "")}>
              <SFMap
                vehicles={mapData.vehicles}
                routes={mapData.routes}
                depots={mapData.depots}
                events={mapData.events}
                selectedEventId={selectedEventId}
                showCityOverlay={layerSettings.cityOverlay}
                compact={mode === "remote_assist"}
                interactive
                onSelectEvent={selectEvent}
              />
            </div>

            {/* Map chrome */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

            {mode === "situational" ? (
              <div className="absolute bottom-4 right-4 z-20">
                <MapLegend />
              </div>
            ) : null}

            {mode === "remote_assist" ? (
              <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-slate-100 ring-1 ring-white/10 backdrop-blur-sm">
                <span className="pointer-events-none">SF minimap</span>
                <button
                  type="button"
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-50 hover:bg-white/15"
                  onClick={openSituational}
                >
                  Expand
                </button>
              </div>
            ) : null}
          </motion.div>

          {/* Remote assist surface */}
          <AnimatePresence initial={false}>
            {mode === "remote_assist" ? (
              <motion.div
                key="remote-assist"
                className="absolute inset-0 z-10"
                initial={{ opacity: 0, filter: "blur(2px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(2px)" }}
                transition={{ duration: 0.22 }}
              >
                <Suspense
                  fallback={
                    <div className="absolute inset-0 grid place-items-center bg-robobus-bg">
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                        Loading Remote Assist…
                      </div>
                    </div>
                  }
                >
                  <RemoteAssistWorkspace />
                </Suspense>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Situational overlays */}
          <AnimatePresence initial={false}>
            {mode === "situational" ? (
              <motion.div
                key="situational-overlays"
                className="pointer-events-none absolute inset-0 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="pointer-events-auto absolute left-4 top-4 w-[360px]">
                  <FleetSidebar />
                </div>

                <div className="pointer-events-auto absolute right-4 top-4 w-[400px] space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md shadow-surface">
                    <IncidentList />
                  </div>
                  <EventInspector />
                </div>

                {/* Neutral vignette for hierarchy (avoid “teal spotlight” effect) */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_18%,rgba(255,255,255,0.05),transparent_58%)]" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </div>
  );
}

