import { ArrowRight, Bus, Clock, MapPin, Timer } from "lucide-react";
import { mockRoutes, mockStuckEvents, mockVehicles } from "@/data/mockOps";
import { useOpsStore } from "@/state/useOpsStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAgoShort, formatClockTime, formatDurationShort, titleCaseReason } from "@/lib/format";

export function EventInspector() {
  const selectedEventId = useOpsStore((s) => s.selectedEventId);
  const openRemoteAssist = useOpsStore((s) => s.openRemoteAssist);

  const event = mockStuckEvents.find((e) => e.id === selectedEventId) ?? null;
  const vehicle = event ? mockVehicles.find((v) => v.id === event.vehicleId) : null;
  const route = event ? mockRoutes.find((r) => r.id === event.routeId) : null;

  if (!event) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-surface">
        <CardHeader>
          <CardTitle className="text-sm text-slate-100">Inspector</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300">
          Select an incident to see details.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-surface">
      <CardHeader>
        <CardTitle className="text-sm text-slate-100">Event details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[13px] text-slate-100">
            <Bus className="size-4 text-robobus-teal" />
            <span className="font-semibold">{vehicle?.fleetId ?? event.vehicleId}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">{route?.name ?? event.routeId}</span>
          </div>

          <div className="grid grid-cols-1 gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Severity</span>
              <span className="font-medium text-slate-100">{event.severity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Reason</span>
              <span className="font-medium text-slate-100">{titleCaseReason(event.reason)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <Timer className="size-4" />
                Duration
              </span>
              <span className="font-medium text-slate-100">
                {formatDurationShort(event.durationSec)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <Clock className="size-4" />
                Detected
              </span>
              <span className="font-medium text-slate-100">
                {formatClockTime(event.startedAtTs)}{" "}
                <span className="text-slate-400">({formatAgoShort(event.startedAtTs)})</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <MapPin className="size-4" />
                Location
              </span>
              <span className="font-mono text-xs text-slate-200">
                {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Recommended action
          </div>
          <div className="mt-2 text-sm text-slate-200">{event.recommendedAction}</div>
          {event.notes ? (
            <div className="mt-2 text-xs text-slate-400">{event.notes}</div>
          ) : null}
        </div>

        <Button
          className="w-full bg-robobus-teal text-slate-950 hover:bg-robobus-teal2"
          onClick={openRemoteAssist}
        >
          Enter Remote Assist
          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

