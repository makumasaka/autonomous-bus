import React, { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';

const ROAD_LENGTH = 1000;
const ROAD_WIDTH = 14;
const SIDEWALK_WIDTH = 3;
const GROUND_SIZE = 1000;

function RoadGroup({ onPointerDown }: { onPointerDown?: (event: ThreeEvent<PointerEvent>) => void }) {
  const laneMarkings = useMemo(() => {
    const markings: { key: string; position: [number, number, number] }[] = [];
    const numMarkings = Math.round(ROAD_LENGTH / 3);
    
    for (let i = 0; i < numMarkings; i++) {
      markings.push({
        key: `marking-${i}`,
        position: [0, 0.165, -ROAD_LENGTH / 2 + (i * ROAD_LENGTH) / numMarkings] as [number, number, number],
      });
    }
    return markings;
  }, []);

  const sidewalks = useMemo(() => {
    const sidewalkList: { position: [number, number, number]; width: number; length: number }[] = [
      { position: [(ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), 0.05, 0], width: SIDEWALK_WIDTH, length: ROAD_LENGTH },
      { position: [-(ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), 0.05, 0], width: SIDEWALK_WIDTH, length: ROAD_LENGTH },
    ];
    return sidewalkList;
  }, []);

  return (
    <group onPointerDown={onPointerDown}>
      {/* Main road - 4 lanes */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[ROAD_WIDTH, ROAD_LENGTH, 0.3]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>

      {/* Center line (yellow) */}
      <mesh position={[0, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, ROAD_LENGTH]} />
        <meshStandardMaterial color="#F1C40F" />
      </mesh>

      {/* Lane markings (white dashed) */}
      {laneMarkings.map(({ key, position }) => (
        <group key={key}>
          <mesh position={[3.5, position[1], position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, 2]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-3.5, position[1], position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, 2]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}

      {/* Road edges (white solid) */}
      <mesh position={[ROAD_WIDTH / 2, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, ROAD_LENGTH]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-ROAD_WIDTH / 2, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, ROAD_LENGTH]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Sidewalks */}
      {sidewalks.map((sidewalk, i) => (
        <mesh
          key={`sidewalk-${i}`}
          receiveShadow
          position={sidewalk.position as [number, number, number]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <boxGeometry args={[sidewalk.width, sidewalk.length, 0.2]} />
          <meshStandardMaterial color="#95A5A6" />
        </mesh>
      ))}
    </group>
  );
}

export function RoadNetwork({ onPointerDown }: { onPointerDown?: (event: ThreeEvent<PointerEvent>) => void }) {
  return (
    <group onPointerDown={onPointerDown}>
      {/* Ground plane */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color="#9BC53D" />
      </mesh>

      {/* First road group */}
      <RoadGroup onPointerDown={onPointerDown} />

      {/* Second road group - translated by 50 on y-axis (vertically) and rotated 90 degrees on y-axis */}
      <group position={[0, 7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <RoadGroup onPointerDown={onPointerDown} />
      </group>
    </group>
  );
}
