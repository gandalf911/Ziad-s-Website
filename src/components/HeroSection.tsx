import { useEffect, useRef } from 'react';
import anime from 'animejs';
import Hero3DScene from './Hero3DScene';

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = anime.timeline({ easing: 'easeOutExpo' });

    tl.add({
      targets: sectionRef.current?.querySelectorAll('.hero-word'),
      translateY: [100, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      duration: 1200,
    }).add({
      targets: sectionRef.current?.querySelector('.hero-sub'),
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 1200,
    }, '-=800').add({
      targets: sectionRef.current?.querySelector('.hero-cta'),
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 1200,
    }, '-=800');
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Hero3DScene sphereScale={1.2} sphereOpacity={0.2} />

      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background pointer-events-none" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.9] mb-8 uppercase">
          {['WE', 'BUILD', 'SYSTEMS'].map((word, i) => (
            <span key={i} className="hero-word inline-block opacity-0 mx-2 sm:mx-3">
              {word === 'SYSTEMS' ? (
                <span className="text-primary">{word}</span>
              ) : (
                <span className="text-foreground">{word}</span>
              )}
            </span>
          ))}
        </h1>

        <p className="hero-sub opacity-0 text-muted-foreground text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-12 font-light tracking-wide">
          Automation & App Development — engineered for scale.
        </p>

        <div className="hero-cta opacity-0 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#services"
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Our Services
          </a>
          <a
            href="#process"
            className="px-8 py-3 border border-border text-foreground font-medium text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
          >
            How We Work
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <a href="#services" className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-muted-foreground/30" />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
