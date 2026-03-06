import * as React from "react";
import Map, { Layer, Marker, NavigationControl, Source, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import type { Depot, Route, StuckEvent, Vehicle } from "@/types/ops";
import { SF_CENTER } from "@/data/mockOps";
import { cn } from "@/components/ui/utils";
import robobusDarkStyle from "@/mapstyles/robobus-dark.json";
import { mockCityOverlays } from "@/data/mockOverlays";

const DARK_STYLE = robobusDarkStyle as any;

function severityColor(sev: StuckEvent["severity"]) {
  switch (sev) {
    case "critical":
      return "#ef4444";
    case "high":
      return "#f97316";
    case "medium":
      return "#f59e0b";
    case "low":
    default:
      return "#22c1b5";
  }
}

function vehicleColor(status: Vehicle["status"]) {
  switch (status) {
    case "stuck":
      return "#f97316";
    case "delayed":
      return "#f59e0b";
    case "offline":
      return "#64748b";
    case "normal":
    default:
      return "#22c1b5";
  }
}

export function SFMap({
  vehicles,
  routes,
  depots,
  events,
  selectedEventId,
  showCityOverlay = false,
  interactive = true,
  compact = false,
  onSelectEvent,
}: {
  vehicles: Vehicle[];
  routes: Route[];
  depots: Depot[];
  events: StuckEvent[];
  selectedEventId: string | null;
  showCityOverlay?: boolean;
  interactive?: boolean;
  compact?: boolean;
  onSelectEvent?: (eventId: string) => void;
}) {
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    // Ensure MapLibre resizes correctly when container animates.
  }, []);

  const routesFc = useMemo<GeoJSON.FeatureCollection>(() => {
    return {
      type: "FeatureCollection",
      features: routes.map((r) => ({
        type: "Feature" as const,
        properties: { id: r.id, color: r.color, name: r.name },
        geometry: r.geometry,
      })),
    };
  }, [routes]);

  const incidentsFc = useMemo<GeoJSON.FeatureCollection>(() => {
    return {
      type: "FeatureCollection",
      features: events.map((e) => ({
        type: "Feature" as const,
        properties: {
          id: e.id,
          severity: e.severity,
          selected: e.id === selectedEventId ? 1 : 0,
          color: severityColor(e.severity),
        },
        geometry: { type: "Point", coordinates: [e.location.lng, e.location.lat] },
      })),
    };
  }, [events, selectedEventId]);

  const overlaysFc = useMemo<GeoJSON.FeatureCollection>(() => {
    return {
      type: "FeatureCollection",
      features: mockCityOverlays.map((z) => ({
        type: "Feature" as const,
        properties: {
          id: z.id,
          name: z.name,
          kind: z.kind,
          severity: z.severity,
        },
        geometry: z.geometry,
      })),
    };
  }, []);

  // Make sure the map resizes when container animates.
  useEffect(() => {
    const m = mapRef.current?.getMap?.();
    if (!m) return;
    const t = window.setTimeout(() => m.resize(), 0);
    return () => window.clearTimeout(t);
  });

  return (
    <div className={cn("size-full", compact ? "rounded-2xl overflow-hidden" : "")}>
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        reuseMaps
        style={{ width: "100%", height: "100%" }}
        initialViewState={{
          longitude: SF_CENTER.lng,
          latitude: SF_CENTER.lat,
          zoom: compact ? 12.3 : 12.6,
          pitch: compact ? 0 : 45,
          bearing: -18,
        }}
        maxPitch={75}
        minZoom={10}
        maxZoom={18}
        dragPan={interactive}
        scrollZoom={interactive}
        doubleClickZoom={interactive}
        dragRotate={interactive && !compact}
        touchZoomRotate={interactive && !compact}
        attributionControl={false}
        mapStyle={DARK_STYLE}
      >
        {!compact ? <NavigationControl position="bottom-left" showCompass={false} /> : null}

        {/* City overlays (geofences / construction) */}
        {showCityOverlay ? (
          <Source id="city-overlays" type="geojson" data={overlaysFc as any}>
            <Layer
              id="overlay-fill"
              type="fill"
              filter={["==", ["geometry-type"], "Polygon"]}
              paint={{
                "fill-color": [
                  "match",
                  ["get", "kind"],
                  "construction",
                  "rgba(249, 115, 22, 0.18)",
                  "slow_zone",
                  "rgba(34, 193, 181, 0.10)",
                  "rgba(34, 193, 181, 0.08)"
                ],
                "fill-outline-color": "rgba(226,232,240,0.18)"
              }}
            />
            <Layer
              id="overlay-line"
              type="line"
              paint={{
                "line-color": [
                  "match",
                  ["get", "kind"],
                  "construction",
                  "rgba(249, 115, 22, 0.85)",
                  "slow_zone",
                  "rgba(34, 193, 181, 0.75)",
                  "rgba(34, 193, 181, 0.7)"
                ],
                "line-width": compact ? 2 : 3,
                "line-dasharray": ["case", ["==", ["get", "kind"], "construction"], ["literal", [1.2, 1.2]], ["literal", [1, 0]]]
              }}
            />
          </Source>
        ) : null}

        {/* Routes */}
        <Source id="routes" type="geojson" data={routesFc as any}>
          <Layer
            id="route-lines"
            type="line"
            paint={{
              "line-color": ["get", "color"],
              "line-width": compact ? 2 : 3,
              "line-opacity": 0.75,
            }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
        </Source>

        {/* Incidents as a subtle glow + core */}
        <Source id="incidents" type="geojson" data={incidentsFc as any}>
          <Layer
            id="incident-glow"
            type="circle"
            paint={{
              "circle-color": ["get", "color"],
              "circle-radius": ["case", ["==", ["get", "selected"], 1], 18, 12],
              "circle-opacity": 0.22,
              "circle-blur": 0.9,
            }}
          />
          <Layer
            id="incident-core"
            type="circle"
            paint={{
              "circle-color": ["get", "color"],
              "circle-radius": ["case", ["==", ["get", "selected"], 1], 6, 5],
              "circle-stroke-width": ["case", ["==", ["get", "selected"], 1], 2, 1],
              "circle-stroke-color": "rgba(255,255,255,0.8)",
            }}
          />
        </Source>

        {/* Vehicles */}
        {vehicles.map((v) => (
          <Marker
            key={v.id}
            longitude={v.location.lng}
            latitude={v.location.lat}
            anchor="center"
          >
            <div className="group relative grid size-7 place-items-center" title={`${v.fleetId} • ${v.status}`}>
              <div className="absolute size-7 rounded-full bg-black/20 ring-1 ring-white/10" />
              <div
                className="size-3.5 rounded-full ring-1 ring-white/40 shadow-[0_0_0_2px_rgba(0,0,0,0.35)]"
                style={{ backgroundColor: vehicleColor(v.status) }}
              />
              <div className="pointer-events-none absolute -bottom-7 hidden whitespace-nowrap rounded-md bg-black/60 px-2 py-1 text-[11px] text-white ring-1 ring-white/10 backdrop-blur-sm group-hover:block">
                {v.fleetId}
              </div>
            </div>
          </Marker>
        ))}

        {/* Depots */}
        {!compact
          ? depots.map((d) => (
              <Marker
                key={d.id}
                longitude={d.location.lng}
                latitude={d.location.lat}
                anchor="bottom"
              >
                <div className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-slate-200 ring-1 ring-white/10 backdrop-blur-sm">
                  {d.name}
                </div>
              </Marker>
            ))
          : null}

        {/* Clickable incident hit targets */}
        {events.map((e) => (
          <Marker
            key={`${e.id}-hit`}
            longitude={e.location.lng}
            latitude={e.location.lat}
            anchor="center"
          >
            <button
              type="button"
              aria-label="Open incident"
              className="size-10 rounded-full bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-robobus-teal/60"
              onClick={() => onSelectEvent?.(e.id)}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
}

