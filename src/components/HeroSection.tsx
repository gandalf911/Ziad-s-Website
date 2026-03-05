import { useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';
import { Code, Workflow, Database, Globe, Cpu } from 'lucide-react';

const CARDS = [
  {
    icon: Code,
    title: 'Custom Web Apps',
    subtitle: 'React · TypeScript · Cloud',
    description: 'Full-stack applications engineered from the ground up, built to scale.',
    accent: '#85c9bd',
    style: { top: '12%', left: '8%', width: 280, rotate: -3 },
  },
  {
    icon: Workflow,
    title: 'Intelligent Automations',
    subtitle: 'n8n · Webhooks · REST',
    description: 'End-to-end pipelines that eliminate manual work.',
    accent: '#F97316',
    style: { top: '18%', right: '10%', width: 260, rotate: 2.5 },
  },
  {
    icon: Database,
    title: 'CRM Expertise',
    subtitle: 'HubSpot · Pipelines',
    description: 'Deep integrations, migration, and optimization.',
    accent: '#8B5CF6',
    style: { bottom: '22%', left: '15%', width: 270, rotate: 1.5 },
  },
  {
    icon: Globe,
    title: 'Stunning Websites',
    subtitle: 'Pixel-Perfect Design',
    description: 'Motion, typography, and interaction with obsessive detail.',
    accent: '#EC4899',
    style: { bottom: '16%', right: '12%', width: 290, rotate: -2 },
  },
  {
    icon: Cpu,
    title: 'n8n Workflows',
    subtitle: 'Visual Automation',
    description: 'Complex workflow orchestration made visual and maintainable.',
    accent: '#06B6D4',
    style: { top: '45%', left: '38%', width: 250, rotate: -1 },
  },
];

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const driftAnims = useRef<anime.AnimeInstance[]>([]);
  const hoveredIdx = useRef<number | null>(null);

  // Start a drift animation for a card
  const startDrift = useCallback((el: HTMLElement, idx: number) => {
    const baseRotate = CARDS[idx].style.rotate;
    const duration = 4000 + Math.random() * 2000;
    const yRange = 10 + Math.random() * 10;
    const rotRange = 1.5 + Math.random() * 1;

    const anim = anime({
      targets: el,
      translateY: [`-${yRange}px`, `${yRange}px`],
      rotate: [baseRotate - rotRange, baseRotate + rotRange],
      duration,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
    });
    driftAnims.current[idx] = anim;
  }, []);

  // Intro + drift
  useEffect(() => {
    CARDS.forEach((_, i) => {
      const el = cardsRef.current[i];
      if (!el) return;
      // Initial hidden state
      el.style.opacity = '0';
      el.style.transform = `scale(0.7) rotate(${CARDS[i].style.rotate}deg) translateY(40px)`;
    });

    // Staggered entrance
    anime({
      targets: cardsRef.current.filter(Boolean),
      scale: [0.7, 1],
      opacity: [0, 1],
      translateY: [40, 0],
      delay: anime.stagger(120, { start: 300 }),
      duration: 1200,
      easing: 'easeOutExpo',
      complete: () => {
        CARDS.forEach((_, i) => {
          const el = cardsRef.current[i];
          if (el) startDrift(el, i);
        });
      },
    });

    // Headline entrance
    anime({
      targets: '.hero-cloud-headline',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 1200,
      delay: 200,
      easing: 'easeOutExpo',
    });
  }, [startDrift]);

  // Parallax on mouse move
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      // Shift cards opposite to cursor
      const inner = container.querySelector('.cards-cloud') as HTMLElement;
      if (inner) {
        inner.style.transform = `translate(${-cx * 20}px, ${-cy * 15}px)`;
      }
    };

    container.addEventListener('mousemove', onMove);
    return () => container.removeEventListener('mousemove', onMove);
  }, []);

  const handleHover = (idx: number) => {
    if (hoveredIdx.current === idx) return;
    hoveredIdx.current = idx;
    const el = cardsRef.current[idx];
    if (!el) return;

    // Pause drift
    driftAnims.current[idx]?.pause();

    el.style.zIndex = '50';
    anime.remove(el);
    anime({
      targets: el,
      scale: 1.15,
      rotate: 0,
      duration: 800,
      easing: 'easeOutElastic(1, .6)',
    });
  };

  const handleLeave = (idx: number) => {
    hoveredIdx.current = null;
    const el = cardsRef.current[idx];
    if (!el) return;

    anime.remove(el);
    anime({
      targets: el,
      scale: 1,
      rotate: CARDS[idx].style.rotate,
      duration: 600,
      easing: 'easeOutExpo',
      complete: () => {
        el.style.zIndex = String(10 + idx);
        startDrift(el, idx);
      },
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden select-none"
      style={{ background: '#0F1015' }}
    >
      {/* Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(133,201,189,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Headline */}
      <div className="hero-cloud-headline absolute top-[10vh] left-1/2 -translate-x-1/2 text-center z-[60] pointer-events-none opacity-0">
        <p className="text-xs sm:text-sm tracking-[0.4em] uppercase mb-3" style={{ color: '#85c9bd' }}>
          What We Build
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" style={{ color: '#E5E7EB' }}>
          Our Expertise
        </h1>
      </div>

      {/* Floating cards cloud */}
      <div className="cards-cloud absolute inset-0 transition-transform duration-300 ease-out">
        {CARDS.map((card, i) => {
          const { top, left, right, bottom, width, rotate } = card.style as any;
          return (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="absolute cursor-pointer"
              style={{
                top, left, right, bottom,
                width,
                zIndex: 10 + i,
                transform: `rotate(${rotate}deg)`,
              }}
              onMouseEnter={() => handleHover(i)}
              onMouseLeave={() => handleLeave(i)}
            >
              <div
                className="relative rounded-xl p-6 backdrop-blur-md overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {/* Accent top line */}
                <div
                  className="absolute top-0 left-4 right-4 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)` }}
                />

                <card.icon className="w-5 h-5 mb-3" style={{ color: card.accent }} />

                <h3 className="text-lg font-bold tracking-tight mb-0.5" style={{ color: '#E5E7EB' }}>
                  {card.title}
                </h3>
                <p className="text-xs font-mono mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {card.subtitle}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {card.description}
                </p>

                {/* Corner glow */}
                <div
                  className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${card.accent}15 0%, transparent 70%)` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Scroll</span>
        <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.15)' }} />
      </div>
    </section>
  );
};

export default HeroSection;
