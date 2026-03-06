import type { LngLat } from "@/types/ops";
import { SF_CENTER } from "@/data/mockOps";

// Lightweight local projection: equirectangular approximation around SF.
// Returns meters east/north from SF_CENTER.
export function lngLatToLocalMeters(
  lngLat: LngLat,
  origin: LngLat = SF_CENTER,
) {
  const latRad = (origin.lat * Math.PI) / 180;
  const metersPerDegLat = 110_540;
  const metersPerDegLng = 111_320 * Math.cos(latRad);

  const eastM = (lngLat.lng - origin.lng) * metersPerDegLng;
  const northM = (lngLat.lat - origin.lat) * metersPerDegLat;
  return { eastM, northM };
}

// Maps SF meters into 3D scene coordinates.
// We keep this conservative so events land inside the visible city sandbox.
export function lngLatToSceneXZ(lngLat: LngLat) {
  const { eastM, northM } = lngLatToLocalMeters(lngLat);
  const scale = 0.01; // 1m => 0.01 scene units (≈ 1 unit = 100m)
  const x = eastM * scale;
  const z = -northM * scale;

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  return {
    x: clamp(x, -80, 80),
    z: clamp(z, -120, 120),
  };
}

