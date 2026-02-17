import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { CityScene } from '../scene/CityScene';
import { useOperatorStore } from '../store/useOperatorStore';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';

export function SceneCanvas() {
  const cameraMode = useOperatorStore((state) => state.cameraMode);
  const controlsRef = useRef<OrbitControlsType>(null);

  const getCameraPosition = (): [number, number, number] => {
    switch (cameraMode) {
      case 'overhead':
        return [0, 50, 0.1];
      case 'street':
        return [5, 2, 15];
      case 'follow':
        return [0, 8, -15];
      case 'free':
      default:
        return [25, 35, 25];
    }
  };

  // Update camera target for overhead view
  useEffect(() => {
    if (controlsRef.current && cameraMode === 'overhead') {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [cameraMode]);

  return (
    <Canvas shadows className="w-full h-full">
      <color attach="background" args={['#87CEEB']} />
      
      <PerspectiveCamera
        makeDefault
        position={getCameraPosition()}
        fov={50}
      />
      
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2}
        enabled={cameraMode !== 'follow'}
      />
      
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[30, 50, 30]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <hemisphereLight args={['#87CEEB', '#9BC53D', 0.3]} />
      
      <CityScene />
    </Canvas>
  );
}
