import type { Depot, FleetStatus, Route, StuckEvent, Vehicle } from "../types/ops";

const now = Date.now();

export const SF_CENTER = { lng: -122.4194, lat: 37.7749 };

export const mockRoutes: Route[] = [
  {
    id: "route-22",
    name: "R-22 • Mission Connector",
    color: "#22c1b5",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4313, 37.7693], // Duboce / Market-ish
        [-122.4206, 37.7648], // Mission
        [-122.4132, 37.7586], // 24th
        [-122.4092, 37.7516], // near Cesar Chavez
      ],
    },
  },
  {
    id: "route-30",
    name: "R-30 • Embarcadero Loop",
    color: "#f97316",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4075, 37.7859], // Market / 4th
        [-122.3997, 37.7923], // Embarcadero
        [-122.3931, 37.8006], // Fisherman's Wharf-ish
        [-122.4016, 37.8069], // Aquatic Park-ish
      ],
    },
  },
  {
    id: "route-7",
    name: "R-07 • Sunset Crosstown",
    color: "#38bdf8",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.5107, 37.7715], // Sunset
        [-122.4849, 37.7702], // GG Park west edge
        [-122.4548, 37.7694], // GG Park east-ish
        [-122.4302, 37.7701], // Divisadero-ish
      ],
    },
  },
];

export const mockDepots: Depot[] = [
  { id: "depot-1", name: "Potrero Ops Yard", location: { lng: -122.4008, lat: 37.7613 } },
  { id: "depot-2", name: "Presidio Staging Hub", location: { lng: -122.4662, lat: 37.7986 } },
];

export const mockVehicles: Vehicle[] = [
  {
    id: "veh-021",
    fleetId: "RB-021",
    routeId: "route-22",
    status: "stuck",
    autonomyHealth: "limited",
    location: { lng: -122.4138, lat: 37.7589 },
    headingDeg: 190,
    speedMps: 0,
    lastUpdateTs: now - 4_000,
  },
  {
    id: "veh-014",
    fleetId: "RB-014",
    routeId: "route-30",
    status: "delayed",
    autonomyHealth: "degraded",
    location: { lng: -122.3998, lat: 37.7920 },
    headingDeg: 38,
    speedMps: 5.2,
    lastUpdateTs: now - 7_000,
  },
  {
    id: "veh-033",
    fleetId: "RB-033",
    routeId: "route-7",
    status: "normal",
    autonomyHealth: "healthy",
    location: { lng: -122.4847, lat: 37.7703 },
    headingDeg: 92,
    speedMps: 7.1,
    lastUpdateTs: now - 2_000,
  },
  {
    id: "veh-008",
    fleetId: "RB-008",
    routeId: "route-30",
    status: "normal",
    autonomyHealth: "healthy",
    location: { lng: -122.3936, lat: 37.8003 },
    headingDeg: 22,
    speedMps: 6.3,
    lastUpdateTs: now - 5_000,
  },
];

export const mockStuckEvents: StuckEvent[] = [
  {
    id: "inc-1007",
    vehicleId: "veh-021",
    routeId: "route-22",
    location: { lng: -122.4138, lat: 37.7589 },
    severity: "high",
    reason: "lane_blockage",
    startedAtTs: now - 12 * 60 * 1000,
    durationSec: 12 * 60,
    recommendedAction:
      "Draft a short detour around the blockage, rejoin the Mission corridor, and submit as a guidance path.",
    notes: "Field report: double-parked delivery vehicle blocking the right lane; cones visible.",
  },
  {
    id: "inc-1012",
    vehicleId: "veh-014",
    routeId: "route-30",
    location: { lng: -122.4002, lat: 37.7931 },
    severity: "medium",
    reason: "work_zone",
    startedAtTs: now - 6 * 60 * 1000,
    durationSec: 6 * 60,
    recommendedAction:
      "Proceed at reduced speed; request temporary lane change approval and maintain a wider clearance envelope.",
  },
];

export const mockFleetStatus: FleetStatus = {
  total: mockVehicles.length,
  normal: mockVehicles.filter((v) => v.status === "normal").length,
  delayed: mockVehicles.filter((v) => v.status === "delayed").length,
  stuck: mockVehicles.filter((v) => v.status === "stuck").length,
  offline: mockVehicles.filter((v) => v.status === "offline").length,
  networkHealth: "healthy",
  systemStatus: "operational",
};

