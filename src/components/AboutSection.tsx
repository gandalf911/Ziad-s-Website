import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import anime from 'animejs';
import * as THREE from 'three';

function WireframeSphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.15;
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[2, 2]} />
      <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.3} />
    </mesh>
  );
}

function InnerGlow() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime) * 0.05);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshBasicMaterial color="#6d28d9" transparent opacity={0.08} />
    </mesh>
  );
}

const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated.current) {
            animated.current = true;
            anime({
              targets: sectionRef.current?.querySelectorAll('.about-animate'),
              translateY: [50, 0],
              opacity: [0, 1],
              delay: anime.stagger(200),
              duration: 1000,
              easing: 'easeOutCubic',
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* 3D Scene */}
        <div className="about-animate opacity-0 relative h-[400px] lg:h-[500px]">
          <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-[80px]" />
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[3, 3, 3]} intensity={0.8} color="#8b5cf6" />
            <WireframeSphere />
            <InnerGlow />
          </Canvas>
        </div>

        {/* Text Content */}
        <div>
          <h2 className="about-animate opacity-0 font-display text-4xl sm:text-5xl font-bold mb-8 leading-tight">
            Pushing the <span className="gradient-text">Edge</span> of Digital
          </h2>
          <p className="about-animate opacity-0 text-muted-foreground text-lg leading-relaxed mb-6">
            We believe the web is an art form. Every pixel, every frame, every interaction 
            is an opportunity to create something that resonates deeply with people.
          </p>
          <p className="about-animate opacity-0 text-muted-foreground text-lg leading-relaxed mb-10">
            Our approach fuses engineering precision with creative audacity — building 
            experiences that don't just work, but inspire.
          </p>

          {/* Stats */}
          <div className="about-animate opacity-0 grid grid-cols-3 gap-6">
            {[
              { value: '50+', label: 'Projects' },
              { value: '99%', label: 'Satisfaction' },
              { value: '24/7', label: 'Support' },
            ].map((stat, i) => (
              <div key={i} className="text-center lg:text-left">
                <div className="font-display text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
