import { useRef, useEffect } from 'react';
import anime from 'animejs';

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
              targets: sectionRef.current?.querySelectorAll('.about-el'),
              translateY: [40, 0],
              opacity: [0, 1],
              delay: anime.stagger(150),
              duration: 1200,
              easing: 'easeOutExpo',
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
    <section ref={sectionRef} className="py-32 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <p className="about-el opacity-0 text-primary text-xs tracking-[0.3em] uppercase mb-4">About</p>
        <h2 className="about-el opacity-0 text-3xl sm:text-4xl font-bold mb-8 tracking-tight">
          Systems that run themselves.
        </h2>
        <p className="about-el opacity-0 text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
          We're a small, focused team of developers and automation architects. We build the infrastructure that lets businesses scale — custom apps, CRM integrations, and intelligent workflows that eliminate busywork.
        </p>
        <p className="about-el opacity-0 text-muted-foreground text-base sm:text-lg leading-relaxed">
          No templates. No bloat. Just precise systems engineered for your operations.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
