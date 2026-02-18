import React, { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';

function RoadGroup({ onPointerDown }: { onPointerDown?: (event: ThreeEvent<PointerEvent>) => void }) {
  // Create road markings
  const laneMarkings = useMemo(() => {
    const markings: { key: string; position: [number, number, number] }[] = [];
    const roadLength = 200;
    const numMarkings = 66;
    
    for (let i = 0; i < numMarkings; i++) {
      markings.push({
        key: `marking-${i}`,
        position: [0, 0.165, -roadLength / 2 + (i * roadLength) / numMarkings] as [number, number, number],
      });
    }
    return markings;
  }, []);

  const sidewalks = useMemo(() => {
    const roadWidth = 14;
    const sidewalkWidth = 3;
    const roadLength = 200;
    
    const sidewalkList: { position: [number, number, number]; width: number; length: number }[] = [
      { position: [(roadWidth / 2 + sidewalkWidth / 2), 0.05, 0], width: sidewalkWidth, length: roadLength },
      { position: [-(roadWidth / 2 + sidewalkWidth / 2), 0.05, 0], width: sidewalkWidth, length: roadLength },
    ];
    return sidewalkList;
  }, []);

  return (
    <group onPointerDown={onPointerDown}>
      {/* Main road - 4 lanes */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[14, 200, 0.3]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>

      {/* Center line (yellow) */}
      <mesh position={[0, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 200]} />
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
      <mesh position={[7, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 200]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-7, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 200]} />
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
        <planeGeometry args={[200, 200]} />
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
