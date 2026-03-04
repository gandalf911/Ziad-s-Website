import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function WireframeSphere({ scale = 1, opacity = 0.25 }: { scale?: number; opacity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.08;
      ref.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });
  return (
    <mesh ref={ref} scale={scale}>
      <icosahedronGeometry args={[2.2, 3]} />
      <meshBasicMaterial color="#85c9bd" wireframe transparent opacity={opacity} />
    </mesh>
  );
}

interface Hero3DSceneProps {
  className?: string;
  sphereScale?: number;
  sphereOpacity?: number;
}

const Hero3DScene = ({ className, sphereScale = 1, sphereOpacity = 0.25 }: Hero3DSceneProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      className={className}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <WireframeSphere scale={sphereScale} opacity={sphereOpacity} />
    </Canvas>
  );
};

export default Hero3DScene;
