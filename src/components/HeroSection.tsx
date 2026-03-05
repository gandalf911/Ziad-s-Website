import { useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';
import { Code, Workflow, Database, Globe, Cpu } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   Card definitions — organic scatter positions for the cloud
   Pulled inward from edges to prevent overflow clipping
   ═══════════════════════════════════════════════════════════ */
const CARDS = [
  {
    icon: Code,
    title: 'Custom Web Apps',
    subtitle: 'React · TypeScript · Cloud',
    description: 'Full-stack applications engineered from the ground up, built to scale.',
    accent: '#85c9bd',
    pos: { top: '25%', left: '4%' } as React.CSSProperties,
    width: 280,
    baseRotate: -2.5,
  },
  {
    icon: Workflow,
    title: 'Intelligent Automations',
    subtitle: 'n8n · Webhooks · REST',
    description: 'End-to-end pipelines that eliminate manual work and accelerate operations.',
    accent: '#F97316',
    pos: { top: '14%', right: '12%' } as React.CSSProperties,
    width: 264,
    baseRotate: 2,
  },
  {
    icon: Database,
    title: 'CRM Expertise',
    subtitle: 'HubSpot · Pipelines · Data',
    description: 'Deep integrations, migration, and optimization for your revenue engine.',
    accent: '#8B5CF6',
    pos: { bottom: '16%', left: '8%' } as React.CSSProperties,
    width: 274,
    baseRotate: 1.5,
  },
  {
    icon: Globe,
    title: 'Stunning Websites',
    subtitle: 'Pixel-Perfect · Motion',
    description: 'Motion, typography, and interaction designed with obsessive detail.',
    accent: '#EC4899',
    pos: { bottom: '8%', right: '14%' } as React.CSSProperties,
    width: 280,
    baseRotate: -1.8,
  },
  {
    icon: Cpu,
    title: 'n8n Workflows',
    subtitle: 'Visual Automation Engine',
    description: 'Complex workflow orchestration made visual and maintainable.',
    accent: '#06B6D4',
    pos: { top: '46%', left: '33%' } as React.CSSProperties,
    width: 256,
    baseRotate: -1,
  },
];

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const driftAnims = useRef<anime.AnimeInstance[]>([]);
  const activeAnims = useRef<anime.AnimeInstance[]>([]);
  const hoveredIdx = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  /* ── Heavy, weighted drift — slower, deliberate, physical ── */
  const startDrift = useCallback((el: HTMLElement, idx: number) => {
    const card = CARDS[idx];
    const duration = 6000 + Math.random() * 3000; // Slower = heavier
    const yRange = 6 + Math.random() * 8;         // Less range = weightier
    const xRange = 1.5 + Math.random() * 3;
    const rotRange = 0.6 + Math.random() * 0.8;   // Minimal rotation = mass

    const anim = anime({
      targets: el,
      translateY: [`-${yRange}px`, `${yRange}px`],
      translateX: [`-${xRange}px`, `${xRange}px`],
      rotate: [card.baseRotate - rotRange, card.baseRotate + rotRange],
      duration,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
    });
    driftAnims.current[idx] = anim;
  }, []);

  /* ── Staggered entrance + drift start ── */
  useEffect(() => {
    const els = cardsRef.current.filter(Boolean) as HTMLElement[];

    // Initial hidden state
    els.forEach((el, i) => {
      anime.set(el, {
        opacity: 0,
        scale: 0.6,
        translateY: 70,
        rotate: CARDS[i].baseRotate,
      });
    });

    // Card entrance — heavy landing feel
    const entranceAnim = anime({
      targets: els,
      scale: [0.6, 1],
      opacity: [0, 1],
      translateY: [70, 0],
      delay: anime.stagger(160, { start: 500 }),
      duration: 1600,
      easing: 'easeOutCubic',
      complete: () => {
        els.forEach((el, i) => startDrift(el, i));
      },
    });
    activeAnims.current.push(entranceAnim);

    // Headline entrance (targets inner wrapper, no transform conflict)
    const headlineAnim = anime({
      targets: '.hero-headline-inner',
      opacity: [0, 1],
      translateY: [35, 0],
      duration: 1400,
      delay: 250,
      easing: 'easeOutExpo',
    });
    activeAnims.current.push(headlineAnim);

    // Scroll indicator
    const scrollAnim = anime({
      targets: '.scroll-hint-inner',
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 1000,
      delay: 2200,
      easing: 'easeOutExpo',
    });
    activeAnims.current.push(scrollAnim);

    // Scroll indicator pulse
    const pulseAnim = anime({
      targets: '.scroll-hint-line',
      opacity: [0.25, 0.7],
      scaleY: [1, 1.3],
      duration: 1500,
      delay: 3200,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
    });
    activeAnims.current.push(pulseAnim);

    return () => {
      activeAnims.current.forEach((a) => a.pause());
      driftAnims.current.forEach((a) => a?.pause());
      anime.remove(els);
      anime.remove('.hero-headline-inner');
      anime.remove('.scroll-hint-inner');
      anime.remove('.scroll-hint-line');
      activeAnims.current = [];
      driftAnims.current = [];
    };
  }, [startDrift]);

  /* ── Parallax: lerped via rAF — heavier inertia ── */
  useEffect(() => {
    const container = containerRef.current;
    const cloud = cloudRef.current;
    if (!container || !cloud) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = -((e.clientX - rect.left) / rect.width - 0.5) * 22;
      targetY = -((e.clientY - rect.top) / rect.height - 0.5) * 16;
    };

    const tick = () => {
      // Slow lerp = heavy, weighty feel
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;
      cloud.style.transform = `translate(${currentX}px, ${currentY}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    container.addEventListener('mousemove', onMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      container.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── Hover: interrupt drift → heavy elastic pop ── */
  const handleHover = (idx: number) => {
    if (hoveredIdx.current === idx) return;
    hoveredIdx.current = idx;
    const el = cardsRef.current[idx];
    if (!el) return;

    driftAnims.current[idx]?.pause();
    anime.remove(el);

    el.style.zIndex = '50';

    anime({
      targets: el,
      scale: 1.12,
      rotate: 0,
      translateX: 0,
      translateY: -4, // Slight lift
      duration: 900,
      easing: 'easeOutElastic(1, .6)',
    });

    // Heavy glow + shadow expansion
    const glass = el.querySelector('.card-glass') as HTMLElement;
    if (glass) {
      const accent = CARDS[idx].accent;
      glass.style.borderColor = `${accent}45`;
      glass.style.boxShadow = [
        '0 20px 60px rgba(0,0,0,0.6)',
        '0 8px 24px rgba(0,0,0,0.5)',
        `0 0 50px ${accent}15`,
        'inset 0 1px 0 rgba(255,255,255,0.1)',
      ].join(', ');
    }
  };

  /* ── Leave: weighted revert → restart drift ── */
  const handleLeave = (idx: number) => {
    hoveredIdx.current = null;
    const el = cardsRef.current[idx];
    if (!el) return;

    anime.remove(el);

    // Revert glass
    const glass = el.querySelector('.card-glass') as HTMLElement;
    if (glass) {
      glass.style.borderColor = 'rgba(255,255,255,0.07)';
      glass.style.boxShadow = [
        '0 12px 40px rgba(0,0,0,0.5)',
        '0 4px 12px rgba(0,0,0,0.4)',
        'inset 0 1px 0 rgba(255,255,255,0.04)',
      ].join(', ');
    }

    anime({
      targets: el,
      scale: 1,
      rotate: CARDS[idx].baseRotate,
      translateY: 0,
      duration: 800,
      easing: 'easeOutCubic', // Heavy settle, not bouncy
      complete: () => {
        el.style.zIndex = String(10 + idx);
        startDrift(el, idx);
      },
    });
  };

  /* ═══════════ JSX ═══════════ */
  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden select-none"
      style={{
        background: 'linear-gradient(180deg, #0F1015 0%, #131420 50%, #1A1B23 100%)',
      }}
    >
      {/* Atmospheric radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(133,201,189,0.045) 0%, transparent 70%)',
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.12,
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Headline ──
          Uses inset-x-0 for centering (no CSS transform dependency)
          so anime.js translateY doesn't break the layout */}
      <div className="absolute top-[8vh] inset-x-0 z-[60] pointer-events-none px-4">
        <div className="hero-headline-inner text-center opacity-0">
          <p
            className="text-[11px] sm:text-xs tracking-[0.5em] uppercase mb-4 font-medium"
            style={{ color: '#85c9bd' }}
          >
            What We Build
          </p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] leading-[0.95]"
            style={{ color: '#E5E7EB' }}
          >
            Our Expertise
          </h1>
          <p
            className="mt-5 text-sm sm:text-base font-light tracking-wide max-w-md mx-auto"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Systems engineered for scale. No templates. No bloat.
          </p>
        </div>
      </div>

      {/* ── Floating card cloud ── */}
      <div ref={cloudRef} className="cards-cloud absolute inset-0">
        {CARDS.map((card, i) => (
          <div
            key={i}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="absolute cursor-pointer will-change-transform"
            style={{
              ...card.pos,
              width: card.width,
              zIndex: 10 + i,
            }}
            onMouseEnter={() => handleHover(i)}
            onMouseLeave={() => handleLeave(i)}
          >
            <div
              className="card-glass relative rounded-xl p-6 backdrop-blur-lg overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: [
                  '0 12px 40px rgba(0,0,0,0.5)',
                  '0 4px 12px rgba(0,0,0,0.4)',
                  'inset 0 1px 0 rgba(255,255,255,0.04)',
                ].join(', '),
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              {/* Accent top line */}
              <div
                className="absolute top-0 left-4 right-4 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${card.accent}70, transparent)`,
                }}
              />

              {/* Subtle bottom weight — makes the card feel grounded */}
              <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'rgba(0,0,0,0.3)' }}
              />

              <card.icon
                className="w-5 h-5 mb-3"
                style={{ color: card.accent }}
                strokeWidth={1.5}
              />

              <h3
                className="text-[17px] font-bold tracking-tight mb-0.5"
                style={{ color: '#E5E7EB' }}
              >
                {card.title}
              </h3>
              <p
                className="text-[11px] font-mono mb-3 tracking-wide"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {card.subtitle}
              </p>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {card.description}
              </p>

              {/* Corner glow */}
              <div
                className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${card.accent}10 0%, transparent 70%)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Scroll indicator ──
          Same fix: outer wrapper for positioning, inner for animation */}
      <div className="absolute bottom-8 inset-x-0 z-[60] flex justify-center">
        <div className="scroll-hint-inner flex flex-col items-center gap-2 opacity-0">
          <span
            className="text-[10px] tracking-[0.35em] uppercase font-medium"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            Scroll
          </span>
          <div
            className="scroll-hint-line w-px h-8 origin-top"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0))',
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
