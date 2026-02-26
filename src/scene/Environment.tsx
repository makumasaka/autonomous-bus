import React, { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { useOperatorStore } from '../store/useOperatorStore';

// Match RoadNetwork: road + sidewalks extent; margin for tree foliage
const ROAD_HALF_WIDTH = 7 + 3;
const ROAD_HALF_LENGTH = 500;
const TREE_MARGIN = 2.5;

function treeIntersectsRoad(x: number, z: number): boolean {
  return (
    x >= -ROAD_HALF_WIDTH - TREE_MARGIN &&
    x <= ROAD_HALF_WIDTH + TREE_MARGIN &&
    z >= -ROAD_HALF_LENGTH - TREE_MARGIN &&
    z <= ROAD_HALF_LENGTH + TREE_MARGIN
  );
}

export function Environment({ onPointerDown }: { onPointerDown?: (event: ThreeEvent<PointerEvent>) => void }) {
  const sceneLayerToggles = useOperatorStore((state) => state.sceneLayerToggles);

  const trees = useMemo(() => {
    const treeList: {
      id: number;
      position: [number, number, number];
      scale: number;
      trunkHeight: number;
      foliageRadius: number;
    }[] = [];
    const numTrees = 24;
    const minRadius = 20;
    const maxRadius = 40;
    const maxAttempts = 300;
    let placed = 0;
    let attempts = 0;

    while (placed < numTrees && attempts < maxAttempts) {
      attempts++;
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (treeIntersectsRoad(x, z)) continue;

      treeList.push({
        id: placed,
        position: [x, 0, z] as [number, number, number],
        scale: 0.8 + Math.random() * 0.6,
        trunkHeight: 2 + Math.random() * 1,
        foliageRadius: 1.5 + Math.random() * 0.5,
      });
      placed++;
    }

    return treeList;
  }, []);

  if (!sceneLayerToggles.foliage) return null;

  return (
    <group onPointerDown={onPointerDown}>
      {trees.map((tree) => (
        <group key={tree.id} position={tree.position} scale={tree.scale}>
          {/* Trunk */}
          <mesh position={[0, tree.trunkHeight / 2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, tree.trunkHeight, 8]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, tree.trunkHeight + tree.foliageRadius * 0.5, 0]} castShadow>
            <sphereGeometry args={[tree.foliageRadius, 8, 8]} />
            <meshStandardMaterial color="#2E7D32" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

