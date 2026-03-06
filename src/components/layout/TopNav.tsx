import type * as React from "react";
import { Activity, ArrowLeft, ChevronRight, Radio, ShieldCheck, TriangleAlert, Wifi } from "lucide-react";
import { useOpsStore } from "@/state/useOpsStore";
import { mockFleetStatus, mockRoutes, mockStuckEvents, mockVehicles } from "@/data/mockOps";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { useOperatorStore } from "@/store/useOperatorStore";
import { titleCaseReason } from "@/lib/format";

function StatusPill({
  label,
  value,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn" | "bad";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const toneClasses =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/20"
      : tone === "warn"
        ? "bg-orange-500/10 text-orange-200 ring-orange-500/20"
        : tone === "bad"
          ? "bg-red-500/10 text-red-200 ring-red-500/20"
          : "bg-slate-500/10 text-slate-200 ring-white/10";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1",
        toneClasses,
      )}
    >
      {Icon ? <Icon className="size-3.5 opacity-90" /> : null}
      <span className="text-slate-300/90">{label}</span>
      <span className="font-medium text-slate-50">{value}</span>
    </div>
  );
}

export function TopNav() {
  const mode = useOpsStore((s) => s.mode);
  const openSituational = useOpsStore((s) => s.openSituational);
  const selectedEventId = useOpsStore((s) => s.selectedEventId);
  const heroBus = useOperatorStore((s) => s.heroBus);

  const netTone =
    mockFleetStatus.networkHealth === "healthy"
      ? "good"
      : mockFleetStatus.networkHealth === "degraded"
        ? "warn"
        : "bad";

  const sysTone =
    mockFleetStatus.systemStatus === "operational"
      ? "good"
      : mockFleetStatus.systemStatus === "degraded"
        ? "warn"
        : "neutral";

  const activeEvent = selectedEventId
    ? mockStuckEvents.find((e) => e.id === selectedEventId) ?? null
    : null;
  const activeVehicle = activeEvent
    ? mockVehicles.find((v) => v.id === activeEvent.vehicleId) ?? null
    : null;
  const activeRoute = activeEvent
    ? mockRoutes.find((r) => r.id === activeEvent.routeId) ?? null
    : null;

  return (
    <header className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.00))]">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-robobus-teal/15 ring-1 ring-robobus-teal/30">
              <Activity className="size-4 text-robobus-teal" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide text-slate-50">
                Robobus
              </div>
              <div className="text-[11px] text-slate-400">Fleet Operations • SF</div>
            </div>
          </div>

          <div className="ml-3 hidden items-center gap-2 lg:flex">
            <StatusPill
              label="System"
              value={mockFleetStatus.systemStatus}
              tone={sysTone}
              icon={ShieldCheck}
            />
            <StatusPill
              label="Network"
              value={mockFleetStatus.networkHealth}
              tone={netTone}
              icon={Wifi}
            />
            <StatusPill
              label="Fleet"
              value={`${mockFleetStatus.total} active • ${mockFleetStatus.normal} normal • ${mockFleetStatus.delayed} delayed`}
              tone="neutral"
              icon={Radio}
            />
            <StatusPill
              label="Incidents"
              value={`${mockFleetStatus.stuck} stuck`}
              tone={mockFleetStatus.stuck > 0 ? "warn" : "good"}
              icon={TriangleAlert}
            />
            {mode === "remote_assist" ? (
              <StatusPill
                label="Autonomy"
                value={heroBus.autonomyState}
                tone={
                  heroBus.autonomyState === "stuck"
                    ? "warn"
                    : heroBus.autonomyState === "awaiting_guidance"
                      ? "warn"
                      : "good"
                }
              />
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 ring-1 ring-white/10 md:flex">
            <span className={cn("font-medium", mode === "situational" ? "text-slate-50" : "text-slate-300")}>
              Fleet View
            </span>
            <ChevronRight className="size-3.5 text-slate-500" />
            <span className={cn("font-medium", mode === "remote_assist" ? "text-slate-50" : "text-slate-300")}>
              Remote Assist
            </span>
          </div>

          {mode === "remote_assist" && activeEvent ? (
            <div className="hidden max-w-[340px] truncate rounded-full bg-black/30 px-3 py-1.5 text-xs text-slate-200 ring-1 ring-white/10 md:block">
              <span className="font-semibold text-slate-50">
                {activeVehicle?.fleetId ?? activeEvent.vehicleId}
              </span>{" "}
              <span className="text-slate-400">•</span>{" "}
              <span className="text-slate-200">{activeRoute?.name ?? activeEvent.routeId}</span>{" "}
              <span className="text-slate-400">•</span>{" "}
              <span className="text-slate-300">{titleCaseReason(activeEvent.reason)}</span>
            </div>
          ) : null}

          {mode === "remote_assist" ? (
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
              onClick={openSituational}
            >
              <ArrowLeft className="size-4" />
              Return to Fleet View
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

