import React, { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';

// Match RoadNetwork: road + sidewalks extent (X and Z)
const ROAD_HALF_WIDTH = 7 + 3; // road half + sidewalk
const ROAD_HALF_LENGTH = 500;

function buildingIntersectsRoad(
  x: number,
  z: number,
  halfWidth: number,
  halfDepth: number
): boolean {
  return !(
    x - halfWidth > ROAD_HALF_WIDTH ||
    x + halfWidth < -ROAD_HALF_WIDTH ||
    z - halfDepth > ROAD_HALF_LENGTH ||
    z + halfDepth < -ROAD_HALF_LENGTH
  );
}

export function Buildings({ onPointerDown }: { onPointerDown?: (event: ThreeEvent<PointerEvent>) => void }) {
  const buildings = useMemo(() => {
    const buildingList: {
      id: number;
      position: [number, number, number];
      width: number;
      height: number;
      depth: number;
      color: string;
    }[] = [];
    const numBuildings = 16;
    const radius = 25;
    const maxAttempts = 200;
    let placed = 0;
    let attempts = 0;

    while (placed < numBuildings && attempts < maxAttempts) {
      attempts++;
      const angle = (placed / numBuildings) * Math.PI * 2 + Math.random() * 0.5;
      const r = radius + Math.random() * 15;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const width = 4 + Math.random() * 3;
      const depth = 4 + Math.random() * 3;

      if (buildingIntersectsRoad(x, z, width / 2, depth / 2)) continue;

      buildingList.push({
        id: placed,
        position: [x, 0, z] as [number, number, number],
        width,
        height: 8 + Math.random() * 15,
        depth,
        color: placed % 3 === 0 ? '#5B9BD5' : placed % 3 === 1 ? '#70AD47' : '#ED7D31',
      });
      placed++;
    }

    return buildingList;
  }, []);

  return (
    <group onPointerDown={onPointerDown}>
      {buildings.map((building) => (
        <mesh
          key={building.id}
          position={[building.position[0], building.height / 2, building.position[2]]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[building.width, building.height, building.depth]} />
          <meshStandardMaterial color={building.color} />
        </mesh>
      ))}
    </group>
  );
}

