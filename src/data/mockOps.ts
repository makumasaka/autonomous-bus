import type { Depot, FleetStatus, Route, StuckEvent, Vehicle } from "../types/ops";

const now = Date.now();

export const SF_CENTER = { lng: -122.4194, lat: 37.7749 };

/** Interpolate a point along a LineString at fraction t in [0, 1]. */
function pointAlongLine(
  coords: [number, number][],
  t: number
): { lng: number; lat: number } {
  if (coords.length < 2) return { lng: coords[0][0], lat: coords[0][1] };
  const n = coords.length - 1;
  const total = n;
  const i = Math.min(Math.floor(t * total), n - 1);
  const local = (t * total) % 1;
  const [lng0, lat0] = coords[i];
  const [lng1, lat1] = coords[i + 1];
  return {
    lng: lng0 + (lng1 - lng0) * local,
    lat: lat0 + (lat1 - lat0) * local,
  };
}

/** Approximate heading (degrees) along segment from point i to i+1. */
function headingAlongLine(coords: [number, number][], segmentIndex: number): number {
  const i = Math.min(segmentIndex, coords.length - 2);
  const [lng0, lat0] = coords[i];
  const [lng1, lat1] = coords[i + 1];
  const dLng = (lng1 - lng0) * 111320 * Math.cos((lat0 * Math.PI) / 180);
  const dLat = (lat1 - lat0) * 110540;
  return (Math.atan2(dLng, dLat) * 180) / Math.PI;
}

export const mockRoutes: Route[] = [
  {
    id: "route-22",
    name: "R-22 • Mission Connector",
    color: "#22c1b5",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4313, 37.7693],
        [-122.4206, 37.7648],
        [-122.4132, 37.7586],
        [-122.4092, 37.7516],
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
        [-122.4075, 37.7859],
        [-122.3997, 37.7923],
        [-122.3931, 37.8006],
        [-122.4016, 37.8069],
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
        [-122.5107, 37.7715],
        [-122.4849, 37.7702],
        [-122.4548, 37.7694],
        [-122.4302, 37.7701],
      ],
    },
  },
  {
    id: "route-1",
    name: "R-01 • California",
    color: "#a78bfa",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.5092, 37.7842],
        [-122.4698, 37.7848],
        [-122.4342, 37.7862],
        [-122.4021, 37.7912],
      ],
    },
  },
  {
    id: "route-5",
    name: "R-05 • Fulton",
    color: "#34d399",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4532, 37.7762],
        [-122.4382, 37.7758],
        [-122.4232, 37.7742],
        [-122.4022, 37.7692],
        [-122.4932, 37.7722],
      ],
    },
  },
  {
    id: "route-14",
    name: "R-14 • Mission",
    color: "#fbbf24",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.3932, 37.7895],
        [-122.4194, 37.7749],
        [-122.4312, 37.7642],
        [-122.4422, 37.7522],
        [-122.4522, 37.7382],
      ],
    },
  },
  {
    id: "route-28",
    name: "R-28 • 19th Avenue",
    color: "#f87171",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4752, 37.7082],
        [-122.4692, 37.7242],
        [-122.4622, 37.7442],
        [-122.4542, 37.7622],
        [-122.4382, 37.7822],
        [-122.4232, 37.7982],
      ],
    },
  },
  {
    id: "route-8",
    name: "R-08 • Bayshore",
    color: "#60a5fa",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4522, 37.7322],
        [-122.4222, 37.7482],
        [-122.4022, 37.7622],
        [-122.3922, 37.7982],
      ],
    },
  },
  {
    id: "route-19",
    name: "R-19 • Polk",
    color: "#c084fc",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.3922, 37.7382],
        [-122.4122, 37.7582],
        [-122.4222, 37.7782],
        [-122.4016, 37.8069],
      ],
    },
  },
  {
    id: "route-38",
    name: "R-38 • Geary",
    color: "#2dd4bf",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.5082, 37.7802],
        [-122.4682, 37.7812],
        [-122.4382, 37.7822],
        [-122.4082, 37.7862],
      ],
    },
  },
  {
    id: "route-24",
    name: "R-24 • Divisadero",
    color: "#fb923c",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4482, 37.7722],
        [-122.4382, 37.7762],
        [-122.4282, 37.7792],
        [-122.4182, 37.7812],
      ],
    },
  },
  {
    id: "route-49",
    name: "R-49 • Van Ness",
    color: "#4ade80",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4242, 37.7982],
        [-122.4192, 37.7842],
        [-122.4182, 37.7682],
        [-122.4172, 37.7522],
      ],
    },
  },
  {
    id: "route-9",
    name: "R-09 • San Bruno",
    color: "#a3e635",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4022, 37.7692],
        [-122.4122, 37.7582],
        [-122.4222, 37.7422],
        [-122.4322, 37.7282],
      ],
    },
  },
  {
    id: "route-12",
    name: "R-12 • Folsom",
    color: "#e879f9",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4082, 37.7922],
        [-122.4152, 37.7782],
        [-122.4222, 37.7622],
        [-122.4322, 37.7482],
      ],
    },
  },
  {
    id: "route-2",
    name: "R-02 • Sutter",
    color: "#f472b6",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4582, 37.7862],
        [-122.4382, 37.7872],
        [-122.4182, 37.7882],
        [-122.3982, 37.7892],
      ],
    },
  },
  {
    id: "route-31",
    name: "R-31 • Balboa",
    color: "#94a3b8",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.5022, 37.7762],
        [-122.4822, 37.7742],
        [-122.4622, 37.7722],
        [-122.4422, 37.7702],
      ],
    },
  },
  {
    id: "route-43",
    name: "R-43 • Masonic",
    color: "#fcd34d",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4482, 37.7822],
        [-122.4382, 37.7782],
        [-122.4282, 37.7742],
        [-122.4182, 37.7682],
      ],
    },
  },
  {
    id: "route-21",
    name: "R-21 • Hayes",
    color: "#67e8f9",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4522, 37.7762],
        [-122.4322, 37.7752],
        [-122.4122, 37.7742],
        [-122.3952, 37.7732],
      ],
    },
  },
];

export const mockDepots: Depot[] = [
  { id: "depot-1", name: "Potrero Ops Yard", location: { lng: -122.4008, lat: 37.7613 } },
  { id: "depot-2", name: "Presidio Staging Hub", location: { lng: -122.4662, lat: 37.7986 } },
  { id: "depot-3", name: "Kirkwood Yard", location: { lng: -122.4282, lat: 37.7322 } },
  { id: "depot-4", name: "Division Street Hub", location: { lng: -122.4122, lat: 37.7682 } },
];

/** Deterministic pseudo-random in [0,1] from seed. */
function seeded(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/** Generate a large fleet of vehicles placed along routes. Keeps fixed demo vehicles (e.g. veh-021, veh-014) for incidents. */
function generateFleet(): Vehicle[] {
  const fleetSize = 320;
  const fixed: Record<string, Vehicle> = {
    "veh-021": {
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
    "veh-014": {
      id: "veh-014",
      fleetId: "RB-014",
      routeId: "route-30",
      status: "delayed",
      autonomyHealth: "degraded",
      location: { lng: -122.3998, lat: 37.792 },
      headingDeg: 38,
      speedMps: 5.2,
      lastUpdateTs: now - 7_000,
    },
    "veh-033": {
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
    "veh-008": {
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
  };

  const statusWeights: Array<Vehicle["status"]> = [
    "normal",
    "normal",
    "normal",
    "normal",
    "normal",
    "normal",
    "normal",
    "delayed",
    "delayed",
    "offline",
  ];
  const vehicles: Vehicle[] = [];
  const routeIds = mockRoutes.map((r) => r.id);

  for (let i = 1; i <= fleetSize; i++) {
    const sid = String(i).padStart(3, "0");
    const id = `veh-${sid}`;
    if (fixed[id]) {
      vehicles.push(fixed[id]);
      continue;
    }
    const routeIdx = Math.floor(seeded(i * 7) * routeIds.length);
    const routeId = routeIds[routeIdx];
    const route = mockRoutes[routeIdx];
    const coords = route.geometry.coordinates;
    const t = seeded(i * 13);
    const location = pointAlongLine(coords, t);
    const segIdx = Math.min(Math.floor(t * (coords.length - 1)), coords.length - 2);
    const headingDeg = Math.round(headingAlongLine(coords, segIdx));
    const statusIdx = Math.floor(seeded(i * 19) * statusWeights.length);
    const status = statusWeights[statusIdx];
    const autonomyHealth: Vehicle["autonomyHealth"] =
      status === "stuck" ? "limited" : status === "delayed" ? "degraded" : "healthy";
    vehicles.push({
      id,
      fleetId: `RB-${sid}`,
      routeId,
      status,
      autonomyHealth,
      location,
      headingDeg,
      speedMps: status === "stuck" ? 0 : 3 + seeded(i * 23) * 8,
      lastUpdateTs: now - Math.floor(seeded(i * 31) * 60_000),
    });
  }

  return vehicles;
}

export const mockVehicles: Vehicle[] = generateFleet();

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
