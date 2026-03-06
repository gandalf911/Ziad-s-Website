import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════
   Fluid Dynamics Particle Core
   3,000 fibonacci-distributed particles with organic breathing,
   smooth Gaussian mouse wake (ONLY when pointer is over canvas),
   and non-oscillatory return
   ═══════════════════════════════════════════════════════════ */

const PARTICLE_COUNT = 3000;
const SPHERE_RADIUS = 2;
const WAKE_STRENGTH = 0.08;
const WAKE_FALLOFF = 0.35;
const RETURN_SPEED = 0.04;
const VELOCITY_DAMPING = 0.84;
const MAX_DISPLACEMENT = 2.0;

/* ── Fibonacci Sphere ── */
function generateFibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const golden = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / count);
    const phi = (2 * Math.PI * i) / golden;
    positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = radius * Math.cos(theta);
  }
  return positions;
}

/* ═══════════════════════════════════════════════════════════ */
function FluidCore({ scale = 1, opacity = 0.8 }: { scale?: number; opacity?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera, raycaster, pointer, gl } = useThree();

  // Track whether the mouse is ACTUALLY over the canvas
  const pointerOver = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;
    const onEnter = () => { pointerOver.current = true; };
    const onLeave = () => { pointerOver.current = false; };
    canvas.addEventListener('pointerenter', onEnter);
    canvas.addEventListener('pointerleave', onLeave);
    return () => {
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [gl]);

  // Stable physics arrays
  const basePositions = useMemo(() => generateFibonacciSphere(PARTICLE_COUNT, SPHERE_RADIUS), []);
  const positions = useMemo(() => new Float32Array(basePositions), [basePositions]);
  const velocities = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  // Pre-allocated vectors
  const _mouse3D = useMemo(() => new THREE.Vector3(), []);
  const _particleWorld = useMemo(() => new THREE.Vector3(), []);
  const _dir = useMemo(() => new THREE.Vector3(), []);
  const _plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const _invMatrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const time = clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;

    // Slow rotation
    pointsRef.current.rotation.y = time * 0.03;
    pointsRef.current.rotation.x = time * 0.015;

    // Only raycast when pointer is actually over the canvas
    let hasHit = false;
    if (pointerOver.current) {
      raycaster.setFromCamera(pointer, camera);
      hasHit = raycaster.ray.intersectPlane(_plane, _mouse3D) !== null;
      _invMatrix.copy(pointsRef.current.matrixWorld).invert();
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      const baseX = basePositions[i3];
      const baseY = basePositions[i3 + 1];
      const baseZ = basePositions[i3 + 2];

      // ── 1. Breathing target ──
      const breath = Math.sin(time * 0.6 + baseY * 0.8) * 0.04;
      const targetX = baseX * (1 + breath);
      const targetY = baseY * (1 + breath);
      const targetZ = baseZ * (1 + breath);

      // ── 2. Mouse wake (Gaussian, ONLY when pointer is over canvas) ──
      if (hasHit) {
        _particleWorld.set(pos[i3], pos[i3 + 1], pos[i3 + 2]);
        pointsRef.current.localToWorld(_particleWorld);

        const dx = _particleWorld.x - _mouse3D.x;
        const dy = _particleWorld.y - _mouse3D.y;
        const dz = _particleWorld.z - _mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        const influence = Math.exp(-distSq * WAKE_FALLOFF) * WAKE_STRENGTH;

        if (influence > 0.001) {
          const dist = Math.sqrt(distSq);
          _dir.set(dx / dist, dy / dist, dz / dist).multiplyScalar(influence);
          _dir.transformDirection(_invMatrix);

          velocities[i3] += _dir.x;
          velocities[i3 + 1] += _dir.y;
          velocities[i3 + 2] += _dir.z;
        }
      }

      // ── 3. Heavy viscous damping ──
      velocities[i3] *= VELOCITY_DAMPING;
      velocities[i3 + 1] *= VELOCITY_DAMPING;
      velocities[i3 + 2] *= VELOCITY_DAMPING;

      // ── 4. Smooth lerp toward breathing target ──
      const diffX = targetX - pos[i3];
      const diffY = targetY - pos[i3 + 1];
      const diffZ = targetZ - pos[i3 + 2];

      const displacement = Math.sqrt(diffX * diffX + diffY * diffY + diffZ * diffZ);
      const pull = RETURN_SPEED + Math.max(0, displacement - MAX_DISPLACEMENT) * 0.15;

      pos[i3] += diffX * pull;
      pos[i3 + 1] += diffY * pull;
      pos[i3 + 2] += diffZ * pull;

      // ── 5. Integrate velocity ──
      pos[i3] += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} scale={scale}>
      <pointsMaterial
        size={0.06}
        color="#ffffff"
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════
   Canvas wrapper
   ═══════════════════════════════════════════════════════════ */
interface Hero3DSceneProps {
  className?: string;
  sphereScale?: number;
  sphereOpacity?: number;
}

const Hero3DScene = ({
  className,
  sphereScale = 1,
  sphereOpacity = 0.8,
}: Hero3DSceneProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
      gl={{ antialias: true, alpha: true }}
    >
      <FluidCore scale={sphereScale} opacity={sphereOpacity} />
    </Canvas>
  );
};

export default Hero3DScene;
