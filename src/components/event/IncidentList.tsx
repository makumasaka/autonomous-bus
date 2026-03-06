import { TriangleAlert } from "lucide-react";
import { mockRoutes, mockStuckEvents, mockVehicles } from "@/data/mockOps";
import { useOpsStore } from "@/state/useOpsStore";
import { cn } from "@/components/ui/utils";
import { formatDurationShort, titleCaseReason } from "@/lib/format";

function severityDot(severity: (typeof mockStuckEvents)[number]["severity"]) {
  switch (severity) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-amber-400";
    case "low":
    default:
      return "bg-robobus-teal";
  }
}

export function IncidentList({ className }: { className?: string }) {
  const selectedEventId = useOpsStore((s) => s.selectedEventId);
  const selectEvent = useOpsStore((s) => s.selectEvent);

  const counts = {
    critical: mockStuckEvents.filter((e) => e.severity === "critical").length,
    high: mockStuckEvents.filter((e) => e.severity === "high").length,
    medium: mockStuckEvents.filter((e) => e.severity === "medium").length,
    low: mockStuckEvents.filter((e) => e.severity === "low").length,
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-4 text-orange-300" />
          <div className="text-sm font-medium text-slate-100">Active incidents</div>
        </div>
        <div className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300 ring-1 ring-white/10">
          {mockStuckEvents.length}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["critical", counts.critical, "bg-red-500/10 text-red-100 ring-red-500/20"],
            ["high", counts.high, "bg-orange-500/10 text-orange-100 ring-orange-500/20"],
            ["medium", counts.medium, "bg-amber-500/10 text-amber-100 ring-amber-500/20"],
            ["low", counts.low, "bg-robobus-teal/10 text-slate-100 ring-robobus-teal/20"],
          ] as const
        ).map(([label, count, cls]) => (
          <div
            key={label}
            className={cn("rounded-full px-2.5 py-1 text-[11px] ring-1", cls)}
          >
            <span className="font-medium">{label}</span>
            <span className="text-white/70"> · </span>
            <span className="font-semibold">{count}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {mockStuckEvents.map((e) => {
          const v = mockVehicles.find((x) => x.id === e.vehicleId);
          const r = mockRoutes.find((x) => x.id === e.routeId);
          const isSelected = selectedEventId === e.id;

          return (
            <button
              key={e.id}
              type="button"
              onClick={() => selectEvent(e.id)}
              className={cn(
                "group w-full rounded-xl border px-3 py-3 text-left transition-all will-change-transform",
                isSelected
                  ? "border-robobus-teal/45 bg-robobus-teal/10 shadow-[0_0_0_1px_rgba(34,193,181,0.10)]"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:-translate-y-[1px]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={cn("mt-0.5 size-2 rounded-full", severityDot(e.severity))} />
                    <div className="truncate text-[13px] font-semibold text-slate-50">
                      {v?.fleetId ?? e.vehicleId} • {r?.name ?? e.routeId}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-300">
                    {titleCaseReason(e.reason)} • {formatDurationShort(e.durationSec)}
                  </div>
                </div>

                <div
                  className={cn(
                    "rounded-full px-2 py-1 text-[11px] font-medium ring-1 transition-colors",
                    e.severity === "high" || e.severity === "critical"
                      ? "bg-orange-500/10 text-orange-200 ring-orange-500/20"
                      : "bg-white/5 text-slate-300 ring-white/10",
                  )}
                >
                  {e.severity}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

