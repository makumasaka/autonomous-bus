import { Layers, SlidersHorizontal } from "lucide-react";
import { mockFleetStatus } from "@/data/mockOps";
import { useOpsStore } from "@/state/useOpsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function FleetSidebar() {
  const layerSettings = useOpsStore((s) => s.layerSettings);
  const toggleLayer = useOpsStore((s) => s.toggleLayer);

  return (
    <div className="space-y-3">
      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-surface">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
            <SlidersHorizontal className="size-4 text-robobus-teal" />
            Fleet summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-slate-400">Normal</div>
            <div className="mt-1 text-lg font-semibold text-slate-50">
              {mockFleetStatus.normal}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-slate-400">Delayed</div>
            <div className="mt-1 text-lg font-semibold text-slate-50">
              {mockFleetStatus.delayed}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-slate-400">Stuck</div>
            <div className="mt-1 text-lg font-semibold text-orange-200">
              {mockFleetStatus.stuck}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-slate-400">Offline</div>
            <div className="mt-1 text-lg font-semibold text-slate-200">
              {mockFleetStatus.offline}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-surface">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
            <Layers className="size-4 text-robobus-teal" />
            Map layers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {(
            [
              ["vehicles", "Vehicles"],
              ["routes", "Routes"],
              ["incidents", "Incidents"],
              ["depots", "Depots"],
              ["cityOverlay", "City overlay"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 transition-colors hover:bg-white/5"
            >
              <span className="text-slate-200">{label}</span>
              <Switch
                checked={layerSettings[key]}
                onCheckedChange={() => toggleLayer(key)}
              />
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

