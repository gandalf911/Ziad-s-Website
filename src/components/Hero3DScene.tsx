import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════
   Breathing Particle Sphere
   3,000 fibonacci-distributed points with sine-wave breathing
   and a Fresnel edge-fade via custom ShaderMaterial
   ═══════════════════════════════════════════════════════════ */
const PARTICLE_COUNT = 3000;
const SPHERE_RADIUS = 2.2;

const vertexShader = /* glsl */ `
  uniform float uTime;

  varying float vFresnel;

  void main() {
    vec3 dir = normalize(position);

    // Sine-wave breathing: displaces each particle along its normal
    float breath = sin(uTime * 0.6 + length(position) * 1.8) * 0.08
                 + sin(uTime * 0.3 + position.y * 2.5) * 0.04;
    vec3 pos = position + dir * breath;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Fresnel: dot product of view direction and outward normal
    vec3 viewDir = normalize(-mvPosition.xyz);
    vec3 worldNormal = normalize(normalMatrix * dir);
    vFresnel = dot(viewDir, worldNormal);

    gl_PointSize = 2.0 * (280.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vFresnel;

  void main() {
    // Circular point shape
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Soft circle edge
    float alpha = 1.0 - smoothstep(0.25, 0.5, dist);

    // Fresnel fade: edges of the sphere become transparent
    alpha *= smoothstep(0.0, 0.55, vFresnel);
    alpha *= uOpacity;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function ParticleSphere({
  scale = 1,
  opacity = 0.25,
}: {
  scale?: number;
  opacity?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  // Fibonacci sphere: even distribution of points on sphere surface
  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.acos(1 - (2 * (i + 0.5)) / PARTICLE_COUNT);
      const phi = (2 * Math.PI * i) / goldenRatio;

      positions[i * 3] = SPHERE_RADIUS * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = SPHERE_RADIUS * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = SPHERE_RADIUS * Math.cos(theta);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // Custom shader material with Fresnel edge fade + additive blending
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#85c9bd') },
          uOpacity: { value: opacity },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [opacity]
  );

  // Rotate sphere + update time uniform for breathing
  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    pointsRef.current.rotation.y = t * 0.08;
    pointsRef.current.rotation.x = t * 0.04;
    (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
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
      <ParticleSphere scale={sphereScale} opacity={sphereOpacity} />
    </Canvas>
  );
};

export default Hero3DScene;
