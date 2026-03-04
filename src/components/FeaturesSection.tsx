import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { Layers, Zap, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: '3D Experiences',
    description: 'Immersive three-dimensional interfaces that transform how users interact with your digital products.',
  },
  {
    icon: Zap,
    title: 'Fluid Motion',
    description: 'Buttery smooth animations and transitions that bring every interaction to life with purpose.',
  },
  {
    icon: Sparkles,
    title: 'Visual Craft',
    description: 'Pixel-perfect design systems with meticulous attention to detail, color, and typography.',
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated.current) {
            animated.current = true;
            anime({
              targets: sectionRef.current?.querySelectorAll('.feature-card'),
              translateY: [60, 0],
              opacity: [0, 1],
              delay: anime.stagger(150),
              duration: 800,
              easing: 'easeOutCubic',
            });
            anime({
              targets: sectionRef.current?.querySelector('.section-title'),
              translateY: [40, 0],
              opacity: [0, 1],
              duration: 800,
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
    <section id="features" ref={sectionRef} className="py-32 px-4 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <h2 className="section-title font-display text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-20 opacity-0">
          What We <span className="gradient-text">Create</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-card glass rounded-2xl p-8 opacity-0 group hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
