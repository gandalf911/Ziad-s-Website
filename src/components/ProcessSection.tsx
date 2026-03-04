import { useEffect, useRef } from 'react';
import anime from 'animejs';
import Hero3DScene from './Hero3DScene';

const steps = [
  {
    number: '01',
    title: 'Discovery & Audit',
    description: 'We map your current workflows, identify bottlenecks, and define the highest-impact automation opportunities.',
  },
  {
    number: '02',
    title: 'Architecture & Design',
    description: 'A clear technical blueprint — from database schema to API integrations — before a single line of code is written.',
  },
  {
    number: '03',
    title: 'Build & Integrate',
    description: 'Rapid development sprints with continuous deployment. Every system connects to your existing stack seamlessly.',
  },
  {
    number: '04',
    title: 'Launch & Optimize',
    description: 'Go live with monitoring, analytics, and iterative improvement baked in from day one.',
  },
];

const ProcessSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated.current) {
            animated.current = true;
            anime({
              targets: sectionRef.current?.querySelectorAll('.process-label'),
              translateY: [30, 0],
              opacity: [0, 1],
              duration: 1200,
              easing: 'easeOutExpo',
            });
            anime({
              targets: sectionRef.current?.querySelectorAll('.process-step'),
              translateX: [-40, 0],
              opacity: [0, 1],
              delay: anime.stagger(200),
              duration: 1200,
              easing: 'easeOutExpo',
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="process" ref={sectionRef} className="py-32 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
        {/* Timeline */}
        <div>
          <p className="process-label opacity-0 text-primary text-xs tracking-[0.3em] uppercase mb-4">
            How We Work
          </p>
          <h2 className="process-label opacity-0 text-3xl sm:text-4xl md:text-5xl font-bold mb-16 tracking-tight">
            Process
          </h2>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-12">
              {steps.map((step, i) => (
                <div key={i} className="process-step opacity-0 flex gap-6 items-start">
                  <div className="relative z-10 w-6 h-6 rounded-full border border-primary bg-background flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <span className="text-primary text-xs tracking-[0.2em] uppercase font-medium">
                      {step.number}
                    </span>
                    <h3 className="text-xl font-semibold text-foreground mt-1 mb-2 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Sphere (reused component) */}
        <div className="relative h-[500px] hidden lg:block sticky top-32">
          <Hero3DScene sphereScale={0.9} sphereOpacity={0.15} />
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
