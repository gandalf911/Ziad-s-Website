import { useEffect, useRef, useState, useCallback } from 'react';
import anime from 'animejs';

const SLIDES = [
  {
    num: '01',
    title: 'Custom Web Apps',
    headline: 'Apps',
    subtitle: 'Architecture & Code',
    description: 'Full-stack applications engineered from the ground up. React, Node, cloud-native — built to scale.',
    tags: ['React', 'TypeScript', 'Cloud'],
    accent: '#85c9bd',
  },
  {
    num: '02',
    title: 'Intelligent Automations',
    headline: 'Automations',
    subtitle: 'n8n · APIs · Workflows',
    description: 'End-to-end automation pipelines that eliminate manual work and connect your entire stack.',
    tags: ['n8n', 'Webhooks', 'REST'],
    accent: '#F97316',
  },
  {
    num: '03',
    title: 'CRM Expertise',
    headline: 'CRMs',
    subtitle: 'HubSpot · Data Flows',
    description: 'Deep CRM integrations, migration, and optimization. Your data, structured and actionable.',
    tags: ['HubSpot', 'Pipelines', 'Analytics'],
    accent: '#8B5CF6',
  },
  {
    num: '04',
    title: 'Stunning Websites',
    headline: 'Websites',
    subtitle: 'Pixel-Perfect Design',
    description: 'Interfaces that feel alive. Motion, typography, and interaction design with obsessive attention to detail.',
    tags: ['Figma', 'Motion', 'Design Systems'],
    accent: '#EC4899',
  },
];

const STATES = [
  { scale: 1, opacity: 1, translateY: 0, zIndex: 50 },
  { scale: 0.85, opacity: 0.4, translateY: 80, zIndex: 40 },
  { scale: 0.7, opacity: 0.15, translateY: 140, zIndex: 30 },
  { scale: 0.55, opacity: 0.05, translateY: 180, zIndex: 20 },
];

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimating = useRef(false);
  const isHovering = useRef(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const getCardState = useCallback((cardIdx: number, active: number) => {
    const diff = (cardIdx - active + SLIDES.length) % SLIDES.length;
    return diff < STATES.length ? STATES[diff] : { scale: 0.4, opacity: 0, translateY: 200, zIndex: 10 };
  }, []);

  // Set initial positions
  useEffect(() => {
    SLIDES.forEach((_, i) => {
      const el = cardsRef.current[i];
      if (!el) return;
      const s = getCardState(i, 0);
      el.style.transform = `translateY(${s.translateY}px) scale(${s.scale})`;
      el.style.opacity = String(s.opacity);
      el.style.zIndex = String(s.zIndex);
    });
  }, [getCardState]);

  const animateToSlide = useCallback((nextIndex: number) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const currentActive = cardsRef.current[activeIndex];

    // Fly current card up and away
    anime({
      targets: currentActive,
      translateY: -120,
      scale: 1.15,
      opacity: 0,
      duration: 500,
      easing: 'easeInCubic',
    });

    // Move remaining cards into new positions
    SLIDES.forEach((_, i) => {
      if (i === activeIndex) return;
      const s = getCardState(i, nextIndex);
      anime({
        targets: cardsRef.current[i],
        translateY: s.translateY,
        scale: s.scale,
        opacity: s.opacity,
        duration: 800,
        easing: 'easeOutExpo',
        complete: () => {
          const el = cardsRef.current[i];
          if (el) el.style.zIndex = String(s.zIndex);
        },
      });
    });

    // After fly-out, snap current card behind the stack
    setTimeout(() => {
      const s = getCardState(activeIndex, nextIndex);
      if (currentActive) {
        currentActive.style.zIndex = String(s.zIndex);
        anime({
          targets: currentActive,
          translateY: s.translateY,
          scale: s.scale,
          opacity: s.opacity,
          duration: 600,
          easing: 'easeOutExpo',
        });
      }
    }, 400);

    // Progress bar
    anime({
      targets: progressRef.current,
      height: `${((nextIndex + 1) / SLIDES.length) * 100}%`,
      duration: 800,
      easing: 'easeOutExpo',
    });

    setActiveIndex(nextIndex);
    setTimeout(() => { isAnimating.current = false; }, 850);
  }, [activeIndex, getCardState]);

  // Wheel handler — allow scroll-through at boundaries
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let accumulated = 0;
    const THRESHOLD = 60;
    let boundaryHits = 0;
    const BOUNDARY_ESCAPE = 2; // after 2 boundary scrolls, let page scroll

    const onWheel = (e: WheelEvent) => {
      if (isAnimating.current) { e.preventDefault(); return; }

      const direction = e.deltaY > 0 ? 1 : -1;
      const atEnd = direction === 1 && activeIndex === SLIDES.length - 1;
      const atStart = direction === -1 && activeIndex === 0;

      if (atEnd || atStart) {
        boundaryHits++;
        if (boundaryHits >= BOUNDARY_ESCAPE) {
          // Allow natural scroll — don't prevent default
          return;
        }
        e.preventDefault();
        return;
      }

      boundaryHits = 0;
      e.preventDefault();
      accumulated += e.deltaY;

      if (Math.abs(accumulated) >= THRESHOLD) {
        accumulated = 0;
        const next = activeIndex + direction;
        animateToSlide(next);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeIndex, animateToSlide]);

  // Autoplay (pauses on hover)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAnimating.current || isHovering.current) return;
      const next = (activeIndex + 1) % SLIDES.length;
      animateToSlide(next);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, animateToSlide]);

  // Touch handler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      if (isAnimating.current) return;
      const diff = startY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        const next = (activeIndex + (diff > 0 ? 1 : -1) + SLIDES.length) % SLIDES.length;
        animateToSlide(next);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [activeIndex, animateToSlide]);

  // Intro animation
  useEffect(() => {
    anime({
      targets: '.hero-slide-card',
      opacity: [0, (el: HTMLElement) => {
        const idx = Number(el.dataset.idx);
        return getCardState(idx, 0).opacity;
      }],
      translateY: [300, (el: HTMLElement) => {
        const idx = Number(el.dataset.idx);
        return getCardState(idx, 0).translateY;
      }],
      scale: [(el: HTMLElement) => {
        const idx = Number(el.dataset.idx);
        return getCardState(idx, 0).scale - 0.1;
      }, (el: HTMLElement) => {
        const idx = Number(el.dataset.idx);
        return getCardState(idx, 0).scale;
      }],
      delay: anime.stagger(120),
      duration: 1200,
      easing: 'easeOutExpo',
    });

    anime({
      targets: '.hero-progress-wrap',
      opacity: [0, 1],
      translateX: [-20, 0],
      duration: 1000,
      delay: 600,
      easing: 'easeOutExpo',
    });

    anime({
      targets: '.hero-headline',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 1200,
      delay: 300,
      easing: 'easeOutExpo',
    });
  }, [getCardState]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden select-none"
      style={{ background: '#0F1015' }}
    >
      {/* Spotlight radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(133,201,189,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Headline */}
      <div className="hero-headline absolute top-[10vh] left-1/2 -translate-x-1/2 text-center z-[60] pointer-events-none opacity-0">
        <p className="text-xs sm:text-sm tracking-[0.4em] uppercase mb-3" style={{ color: '#85c9bd' }}>
          What We Build
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" style={{ color: '#E5E7EB' }}>
          {SLIDES[activeIndex].headline}
        </h1>
      </div>

      {/* Progress indicator */}
      <div className="hero-progress-wrap absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 z-[60] flex flex-col items-center gap-3 opacity-0">
        <span className="text-xs font-mono font-bold" style={{ color: '#85c9bd' }}>
          {String(activeIndex + 1).padStart(2, '0')}
        </span>
        <div className="relative w-px h-24 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            ref={progressRef}
            className="absolute top-0 left-0 w-full rounded-full transition-none"
            style={{ background: '#85c9bd', height: `${(1 / SLIDES.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {String(SLIDES.length).padStart(2, '0')}
        </span>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Scroll</span>
        <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.15)' }} />
      </div>

      {/* Cards Stack */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onMouseEnter={() => { isHovering.current = true; }}
        onMouseLeave={() => { isHovering.current = false; }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            ref={(el) => { cardsRef.current[i] = el; }}
            data-idx={i}
            className="hero-slide-card absolute w-[85vw] max-w-[520px]"
            style={{ zIndex: STATES[i]?.zIndex ?? 10 }}
          >
            <div
              className="relative rounded-xl p-6 sm:p-8 backdrop-blur-md overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {/* Accent top line */}
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${slide.accent}, transparent)` }}
              />

              {/* Number */}
              <span className="text-xs font-mono font-bold tracking-widest mb-4 block" style={{ color: slide.accent }}>
                {slide.num}
              </span>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1" style={{ color: '#E5E7EB' }}>
                {slide.title}
              </h2>

              {/* Subtitle */}
              <p className="text-sm font-mono mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {slide.subtitle}
              </p>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {slide.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {slide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Corner glow */}
              <div
                className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${slide.accent}15 0%, transparent 70%)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
