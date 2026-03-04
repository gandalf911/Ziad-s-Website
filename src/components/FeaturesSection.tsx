import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { Code, Database, Zap } from 'lucide-react';

const services = [
  {
    icon: Code,
    title: 'Custom App Development',
    description: 'Tailored web and mobile applications built with modern frameworks, designed for performance and scalability.',
  },
  {
    icon: Database,
    title: 'CRM Expertise',
    description: 'Deep integrations with HubSpot, n8n, and custom CRM pipelines that unify your data and automate outreach.',
  },
  {
    icon: Zap,
    title: 'Intelligent Automations',
    description: 'End-to-end workflow automation that eliminates manual tasks and accelerates your operations.',
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);
  const [pulsedIndex, setPulsedIndex] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated.current) {
            animated.current = true;
            anime({
              targets: sectionRef.current?.querySelector('.section-label'),
              translateY: [30, 0],
              opacity: [0, 1],
              duration: 1200,
              easing: 'easeOutExpo',
            });
            anime({
              targets: sectionRef.current?.querySelectorAll('.service-card'),
              translateY: [60, 0],
              opacity: [0, 1],
              delay: anime.stagger(150),
              duration: 1200,
              easing: 'easeOutExpo',
            });
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCardClick = (clickedIndex: number) => {
    setPulsedIndex(clickedIndex);

    // Pulse all cards from the clicked one outward
    const cards = sectionRef.current?.querySelectorAll('.service-card');
    if (cards) {
      cards.forEach((card, i) => {
        const delay = Math.abs(i - clickedIndex) * 120;
        anime({
          targets: card,
          scale: [1, 1.03, 1],
          borderColor: ['hsl(0 0% 12%)', 'hsl(168 30% 65%)', 'hsl(0 0% 12%)'],
          duration: 600,
          delay,
          easing: 'easeOutExpo',
        });
        // Pulse the icon
        const icon = card.querySelector('.card-icon');
        if (icon) {
          anime({
            targets: icon,
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
            duration: 600,
            delay,
            easing: 'easeOutExpo',
          });
        }
      });
    }

    setTimeout(() => setPulsedIndex(null), 1000);
  };

  return (
    <section id="services" ref={sectionRef} className="py-32 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <p className="section-label opacity-0 text-primary text-xs tracking-[0.3em] uppercase mb-4 text-center">
          What We Do
        </p>
        <h2 className="section-label opacity-0 text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-20 tracking-tight">
          Services
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div
              key={i}
              onClick={() => handleCardClick(i)}
              className="service-card opacity-0 border border-border bg-card p-8 cursor-pointer group transition-colors hover:border-primary/30"
            >
              <service.icon className="card-icon w-6 h-6 text-primary opacity-60 mb-6" />
              <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
