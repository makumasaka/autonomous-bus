import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { Group } from 'three';
import { useOperatorStore } from '../store/useOperatorStore';
import * as THREE from 'three';

const busModelUrl = new URL('../models/Bus01.glb', import.meta.url).href;

export function HeroBus() {
  const busRef = useRef<Group>(null);
  const { scene } = useGLTF(busModelUrl);
  const heroBus = useOperatorStore((state) => state.heroBus);
  const cameraMode = useOperatorStore((state) => state.cameraMode);
  const targetPosition = useRef(new THREE.Vector3());
  const targetRotation = useRef(0);
  const clonedScene = useRef<THREE.Group | null>(null);

  if (!clonedScene.current) {
    clonedScene.current = scene.clone();
  }

  // Update target position and rotation from store
  useEffect(() => {
    targetPosition.current.set(
      heroBus.position.x,
      heroBus.position.y,
      heroBus.position.z
    );
    targetRotation.current = heroBus.rotation;
  }, [heroBus.position, heroBus.rotation]);

  // Smoothly interpolate to target position and rotation
  useFrame(() => {
    if (busRef.current) {
      // Smooth position interpolation
      busRef.current.position.lerp(targetPosition.current, 0.1);

      // Smooth rotation interpolation
      const currentRotation = busRef.current.rotation.y;
      let targetRot = targetRotation.current;

      // Handle rotation wrapping
      while (targetRot - currentRotation > Math.PI) targetRot -= Math.PI * 2;
      while (targetRot - currentRotation < -Math.PI) targetRot += Math.PI * 2;

      busRef.current.rotation.y += (targetRot - currentRotation) * 0.1;
    }
  });

  // Optional: Smooth camera follow in follow mode
  useFrame(({ camera }) => {
    if (cameraMode === 'follow' && busRef.current) {
      const targetX = busRef.current.position.x;
      const targetZ = busRef.current.position.z - 15;
      const targetY = 8;

      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.position.z += (targetZ - camera.position.z) * 0.05;

      camera.lookAt(busRef.current.position);
    }
  });

  return (
    <group ref={busRef}>
      <primitive object={clonedScene.current} castShadow receiveShadow />
      {/* Status indicator light on top */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={heroBus.autonomyState === 'stuck' ? '#E74C3C' : '#27AE60'}
          emissive={heroBus.autonomyState === 'stuck' ? '#E74C3C' : '#27AE60'}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

