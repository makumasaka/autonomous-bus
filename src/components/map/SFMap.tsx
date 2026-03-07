import * as React from "react";
import Map, { Layer, Marker, NavigationControl, Source, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Depot, Route, StuckEvent, Vehicle } from "@/types/ops";
import { SF_CENTER } from "@/data/mockOps";
import { cn } from "@/components/ui/utils";
import robobusDarkStyle from "@/mapstyles/robobus-dark.json";
import { mockCityOverlays } from "@/data/mockOverlays";

const DARK_STYLE = robobusDarkStyle as any;

/** Full Fleet View: 2D operational zoom over SF (pan and zoom enabled) */
const FULL_VIEW = {
  longitude: SF_CENTER.lng,
  latitude: SF_CENTER.lat,
  zoom: 12.6,
  pitch: 0,
  bearing: 0,
} as const;

/** Minimap: zoomed out so all of SF is visible in the small card (380×232px) */
const MINIMAP_VIEW = {
  longitude: SF_CENTER.lng,
  latitude: SF_CENTER.lat,
  zoom: 10.0,
  pitch: 0,
  bearing: 0,
} as const;

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

  // Minimap: controlled view so we can keep view fixed. Full map: uncontrolled so pan/zoom are not overwritten by re-renders.
  const [viewState, setViewState] = useState(() =>
    compact ? { ...MINIMAP_VIEW } : { ...FULL_VIEW }
  );

  useEffect(() => {
    if (compact) setViewState((prev) => ({ ...prev, ...MINIMAP_VIEW }));
  }, [compact]);

  // Force minimap camera when switching to compact (reused map may not apply controlled viewState).
  useEffect(() => {
    if (!compact) return;
    const m = mapRef.current?.getMap?.();
    if (!m) return;
    const t = window.setTimeout(() => {
      m.jumpTo({
        center: [MINIMAP_VIEW.longitude, MINIMAP_VIEW.latitude],
        zoom: MINIMAP_VIEW.zoom,
        pitch: MINIMAP_VIEW.pitch,
        bearing: MINIMAP_VIEW.bearing,
      });
    }, 0);
    return () => window.clearTimeout(t);
  }, [compact]);

  const onMove = useCallback((ev: { viewState: typeof viewState }) => {
    setViewState(ev.viewState);
  }, []);

  useEffect(() => {
    const m = mapRef.current?.getMap?.();
    if (!m) return;
    const t = window.setTimeout(() => m.resize(), 0);
    return () => window.clearTimeout(t);
  }, [compact]);

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

  const vehiclesFc = useMemo<GeoJSON.FeatureCollection>(() => {
    return {
      type: "FeatureCollection",
      features: vehicles.map((v) => ({
        type: "Feature" as const,
        properties: {
          id: v.id,
          fleetId: v.fleetId,
          status: v.status,
          color: vehicleColor(v.status),
        },
        geometry: { type: "Point", coordinates: [v.location.lng, v.location.lat] },
      })),
    };
  }, [vehicles]);

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

  return (
    <div className={cn("size-full", compact ? "rounded-2xl overflow-hidden" : "")}>
      <Map
        key={compact ? "minimap" : "full"}
        ref={mapRef}
        mapLib={maplibregl}
        reuseMaps={compact}
        style={{ width: "100%", height: "100%" }}
        {...(compact
          ? { ...viewState, onMove }
          : { initialViewState: FULL_VIEW })}
        maxPitch={compact ? 75 : 0}
        minZoom={10}
        maxZoom={18}
        dragPan={interactive}
        scrollZoom={interactive}
        doubleClickZoom={interactive}
        dragRotate={false}
        touchZoomRotate={interactive}
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

        {/* Vehicles (circle layer for performance with hundreds of buses) */}
        <Source id="vehicles" type="geojson" data={vehiclesFc as any}>
          <Layer
            id="vehicle-dots"
            type="circle"
            paint={{
              "circle-radius": compact ? 3 : 4,
              "circle-color": ["get", "color"],
              "circle-stroke-width": 1,
              "circle-stroke-color": "rgba(255,255,255,0.5)",
            }}
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

