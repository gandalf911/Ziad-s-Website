import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════
   Kinetic Repulsion Field — Particle Core
   3,000 fibonacci-distributed particles with raycasted
   mouse repulsion and elastic spring return
   ═══════════════════════════════════════════════════════════ */

const PARTICLE_COUNT = 3000;
const SPHERE_RADIUS = 2.2;
const INTERACTION_RADIUS = 1.5;
const REPULSION_STRENGTH = 0.6;
const SPRING_CONSTANT = 0.015;
const DAMPING = 0.92;
const ROTATION_SPEED = 0.06;

/* ── GLSL Shaders ── */
const vertexShader = /* glsl */ `
  attribute float aOpacity;
  varying float vOpacity;

  void main() {
    vOpacity = aOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 2.2 * (280.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGlobalOpacity;
  varying float vOpacity;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
    alpha *= vOpacity * uGlobalOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

/* ── Fibonacci Sphere Generator ── */
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

/* ═══════════════════════════════════════════════════════════
   Core particle system — all physics in useFrame,
   no React state, direct buffer manipulation
   ═══════════════════════════════════════════════════════════ */
function ParticleCore({ scale = 1, opacity = 0.25 }: { scale?: number; opacity?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera, raycaster, pointer } = useThree();

  // Stable refs for physics arrays — never reallocated
  const basePositions = useMemo(() => generateFibonacciSphere(PARTICLE_COUNT, SPHERE_RADIUS), []);
  const velocities = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const opacities = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT);
    arr.fill(1);
    return arr;
  }, []);

  // Geometry with position + custom opacity attribute
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // Clone base positions so we can mutate current positions independently
    const currentPositions = new Float32Array(basePositions);
    geo.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
    return geo;
  }, [basePositions, opacities]);

  // Shader material
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color('#85c9bd') },
          uGlobalOpacity: { value: opacity },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [opacity]
  );

  // Reusable vector to avoid GC pressure in the hot loop
  const _mouse3D = useMemo(() => new THREE.Vector3(), []);
  const _particlePos = useMemo(() => new THREE.Vector3(), []);
  const _repulse = useMemo(() => new THREE.Vector3(), []);
  const _plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

  // Track if pointer is over the canvas
  const pointerActive = useRef(false);

  useEffect(() => {
    const canvas = pointsRef.current?.parent?.parent;
    if (!canvas) return;
    // We detect hover via the pointer values — if they're within [-1, 1] range
    // the pointer is over the canvas (R3F sets pointer to last known position)
  }, []);

  /* ── Physics loop — runs every frame ── */
  useFrame(() => {
    if (!pointsRef.current) return;

    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const opAttr = pointsRef.current.geometry.getAttribute('aOpacity') as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;

    // Slow global rotation
    pointsRef.current.rotation.y += ROTATION_SPEED * 0.016;

    // Raycast mouse into 3D space (intersect with z=0 plane)
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.ray.intersectPlane(_plane, _mouse3D);
    const hasMouseTarget = hit !== null;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // ── 1. Mouse repulsion ──
      if (hasMouseTarget) {
        _particlePos.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);

        // Transform particle to world space (account for rotation)
        pointsRef.current.localToWorld(_particlePos);

        const dx = _particlePos.x - _mouse3D.x;
        const dy = _particlePos.y - _mouse3D.y;
        const dz = _particlePos.z - _mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const interactionRadiusSq = INTERACTION_RADIUS * INTERACTION_RADIUS;

        if (distSq < interactionRadiusSq && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / INTERACTION_RADIUS) * REPULSION_STRENGTH;

          // Repulse direction (world space) — convert back to local
          _repulse.set(dx / dist, dy / dist, dz / dist).multiplyScalar(force);

          // Inverse-transform the repulsion vector to local space
          const invMatrix = pointsRef.current.matrixWorld.clone().invert();
          _repulse.transformDirection(invMatrix);

          velocities[i3] += _repulse.x;
          velocities[i3 + 1] += _repulse.y;
          velocities[i3 + 2] += _repulse.z;
        }
      }

      // ── 2. Elastic spring return to base position ──
      const springX = (basePositions[i3] - positions[i3]) * SPRING_CONSTANT;
      const springY = (basePositions[i3 + 1] - positions[i3 + 1]) * SPRING_CONSTANT;
      const springZ = (basePositions[i3 + 2] - positions[i3 + 2]) * SPRING_CONSTANT;

      velocities[i3] = (velocities[i3] + springX) * DAMPING;
      velocities[i3 + 1] = (velocities[i3 + 1] + springY) * DAMPING;
      velocities[i3 + 2] = (velocities[i3 + 2] + springZ) * DAMPING;

      // ── 3. Integrate velocity ──
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // ── 4. Per-particle opacity: dim when displaced ──
      const displaceX = positions[i3] - basePositions[i3];
      const displaceY = positions[i3 + 1] - basePositions[i3 + 1];
      const displaceZ = positions[i3 + 2] - basePositions[i3 + 2];
      const displace = Math.sqrt(displaceX * displaceX + displaceY * displaceY + displaceZ * displaceZ);
      opacities[i] = Math.max(0.15, 1 - displace * 0.8);
    }

    posAttr.needsUpdate = true;
    opAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} scale={scale} />
  );
}

/* ═══════════════════════════════════════════════════════════
   Canvas wrapper — same API as before
   ═══════════════════════════════════════════════════════════ */
interface Hero3DSceneProps {
  className?: string;
  sphereScale?: number;
  sphereOpacity?: number;
}

const Hero3DScene = ({
  className,
  sphereScale = 1,
  sphereOpacity = 0.25,
}: Hero3DSceneProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      className={className}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ParticleCore scale={sphereScale} opacity={sphereOpacity} />
    </Canvas>
  );
};

export default Hero3DScene;
