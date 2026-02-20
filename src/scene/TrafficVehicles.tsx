import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { Group } from 'three';
import { useOperatorStore } from '../store/useOperatorStore';
import * as THREE from 'three';

const TRAFFIC_MODEL_URLS = [
  new URL('../models/Car01.glb', import.meta.url).href,
  new URL('../models/Car02.glb', import.meta.url).href,
  new URL('../models/Car03.glb', import.meta.url).href,
  new URL('../models/Car04.glb', import.meta.url).href,
  new URL('../models/Truck01.glb', import.meta.url).href,
  new URL('../models/Truck02.glb', import.meta.url).href,
  new URL('../models/Truck03.glb', import.meta.url).href,
  new URL('../models/Truck04.glb', import.meta.url).href,
];

function VehicleModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const clonedScene = useRef<THREE.Object3D | null>(null);
  if (!clonedScene.current) {
    clonedScene.current = scene.clone();
  }
  return <primitive object={clonedScene.current} castShadow receiveShadow />;
}

interface Vehicle {
  id: number;
  lane: number;
  startZ: number;
  speed: number;
  direction: 1 | -1; // 1 = forward (positive Z), -1 = backward (negative Z)
  color: string;
}

export function TrafficVehicles() {
  const vehicleRefs = useRef<(Group | null)[]>([]);
  const sceneLayerToggles = useOperatorStore((state) => state.sceneLayerToggles);
  const heroBus = useOperatorStore((state) => state.heroBus);

  const vehicles = useMemo<Vehicle[]>(() => {
    const vehicleList: Vehicle[] = [];
    const numVehicles = 8;
    // Four lanes: negative X = left side (go backward), positive X = right side (go forward)
    const leftLanes = [-5.25, -1.75];  // Travel in negative Z direction (backward)
    const rightLanes = [1.75, 5.25];   // Travel in positive Z direction (forward)
    const colors = ['#3498DB', '#9B59B6', '#E67E22', '#1ABC9C', '#E74C3C', '#F39C12'];

    for (let i = 0; i < numVehicles; i++) {
      const isRightSide = i % 2 === 0;
      const lanes = isRightSide ? rightLanes : leftLanes;
      const lane = lanes[(i >> 1) % lanes.length];
      const direction = isRightSide ? 1 : -1;
      
      vehicleList.push({
        id: i,
        lane,
        startZ: direction === 1 ? ((i * -15) - 30) : ((i * 15) + 30),
        speed: 0.8 + Math.random() * 0.4,
        direction,
        color: colors[i % colors.length],
      });
    }

    return vehicleList;
  }, []);

  // Helper function to determine if a vehicle is in the same lane as the bus
  const isInSameLane = (vehicleLane: number, busX: number) => {
    // Allow 2 meter tolerance for lane matching
    return Math.abs(vehicleLane - busX) < 2;
  };

  // Helper function to check if vehicle is at risk of collision
  const isAtRiskOfCollision = (
    vehicleZ: number,
    vehicleDirection: number,
    busZ: number,
    vehicleLane: number
  ) => {
    if (!isInSameLane(vehicleLane, heroBus.position.x)) {
      return false;
    }

    const safeDistance = 8; // meters
    const distanceToBus = Math.abs(vehicleZ - busZ);

    if (vehicleDirection === 1) {
      // Vehicle going forward (positive Z direction)
      // Stop if vehicle is behind bus and within safe distance
      return vehicleZ < busZ && distanceToBus < safeDistance;
    } else {
      // Vehicle going backward (negative Z direction)
      // Stop if vehicle is ahead of bus (in its travel direction) and within safe distance
      return vehicleZ > busZ && distanceToBus < safeDistance;
    }
  };

  useFrame(() => {
    const roadLength = 120;
    vehicleRefs.current.forEach((ref, i) => {
      if (ref && vehicles[i]) {
        const vehicle = vehicles[i];
        
        // Check if this vehicle is at risk of collision with the bus
        const shouldStop = isAtRiskOfCollision(
          ref.position.z,
          vehicle.direction,
          heroBus.position.z,
          vehicle.lane
        );

        // Only move if not at risk of collision
        if (!shouldStop) {
          // Move vehicle in its direction
          ref.position.z += vehicle.speed * 0.1 * vehicle.direction;

          // Loop back when out of bounds
          if (vehicle.direction === 1) {
            // Going forward (positive Z)
            if (ref.position.z > roadLength / 2 + 10) {
              ref.position.z = -roadLength / 2 - 10;
            }
          } else {
            // Going backward (negative Z)
            if (ref.position.z < -roadLength / 2 - 10) {
              ref.position.z = roadLength / 2 + 10;
            }
          }
        }
        // If shouldStop is true, vehicle stays in place (collision avoidance)
      }
    });
  });

  if (!sceneLayerToggles.traffic) return null;

  return (
    <group>
      {vehicles.map((vehicle, i) => (
        <group
          key={vehicle.id}
          ref={(el) => {
            vehicleRefs.current[i] = el;
          }}
          position={[vehicle.lane, 0.6, vehicle.startZ]}
          rotation={[0, vehicle.direction === 1 ? 0 : Math.PI, 0]} // Rotate 180° if going backward
        >
          <VehicleModel url={TRAFFIC_MODEL_URLS[i % TRAFFIC_MODEL_URLS.length]} />
        </group>
      ))}
    </group>
  );
}

