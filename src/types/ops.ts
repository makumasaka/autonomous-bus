export type OpsMode = "situational" | "remote_assist";

export type Severity = "low" | "medium" | "high" | "critical";

export type VehicleStatus = "normal" | "delayed" | "stuck" | "offline";

export type AutonomyHealth = "healthy" | "degraded" | "limited";

export type LngLat = { lng: number; lat: number };

export interface Vehicle {
  id: string; // internal id
  fleetId: string; // displayed id (e.g. RB-021)
  routeId: string;
  status: VehicleStatus;
  autonomyHealth: AutonomyHealth;
  location: LngLat;
  headingDeg: number;
  speedMps: number;
  lastUpdateTs: number;
}

export interface Route {
  id: string;
  name: string;
  color: string;
  geometry: GeoJSON.LineString;
}

export interface Depot {
  id: string;
  name: string;
  location: LngLat;
}

export type StuckReason =
  // legacy/demo
  | "blocked_lane"
  | "construction"
  | "accident"
  | "unknown_obstacle"
  // ops-realistic
  | "lane_blockage"
  | "work_zone"
  | "traffic_control"
  | "pedestrian_yield"
  | "localization_degraded"
  | "perception_uncertain"
  | "sensor_degraded"
  | "teleop_required";

export interface StuckEvent {
  id: string;
  vehicleId: string;
  routeId: string;
  location: LngLat;
  severity: Severity;
  reason: StuckReason;
  startedAtTs: number;
  durationSec: number;
  recommendedAction: string;
  notes?: string;
}

export interface FleetStatus {
  total: number;
  normal: number;
  delayed: number;
  stuck: number;
  offline: number;
  networkHealth: "healthy" | "degraded" | "incident";
  systemStatus: "operational" | "degraded" | "maintenance";
}

export interface MapLayerSettings {
  vehicles: boolean;
  routes: boolean;
  incidents: boolean;
  depots: boolean;
  cityOverlay: boolean;
}

