import type { LngLat } from "@/types/ops";

export interface CityOverlayZone {
  id: string;
  name: string;
  kind: "geofence" | "construction" | "slow_zone";
  severity: "info" | "warn";
  geometry: GeoJSON.Polygon | GeoJSON.LineString;
  centroid: LngLat;
}

export const mockCityOverlays: CityOverlayZone[] = [
  {
    id: "zone-geofence-embarcadero",
    name: "Geofence • Embarcadero Waterfront",
    kind: "geofence",
    severity: "info",
    centroid: { lng: -122.3977, lat: 37.7958 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-122.4052, 37.8023],
          [-122.3921, 37.8030],
          [-122.3897, 37.7910],
          [-122.4027, 37.7898],
          [-122.4052, 37.8023]
        ]
      ]
    }
  },
  {
    id: "zone-construction-market",
    name: "Construction • Market St (lane shifts)",
    kind: "construction",
    severity: "warn",
    centroid: { lng: -122.4098, lat: 37.7846 },
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4188, 37.7767],
        [-122.4137, 37.7808],
        [-122.4075, 37.7859],
        [-122.4015, 37.7909]
      ]
    }
  },
  {
    id: "zone-slow-gg-park",
    name: "Slow zone • Golden Gate Park edge",
    kind: "slow_zone",
    severity: "info",
    centroid: { lng: -122.4655, lat: 37.7709 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-122.4782, 37.7739],
          [-122.4520, 37.7739],
          [-122.4520, 37.7676],
          [-122.4782, 37.7676],
          [-122.4782, 37.7739]
        ]
      ]
    }
  }
];

