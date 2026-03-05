import { useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';

/* ═══════════════════════════════════════════════════════════
   Node definitions — positioned in an n8n-style canvas
   ═══════════════════════════════════════════════════════════ */
const NODES = [
  { id: 'webhook', title: 'Webhook', subtitle: 'Trigger', color: '#22C55E', icon: '⚡', x: 60, y: 195 },
  { id: 'router', title: 'Switch', subtitle: 'Route by type', color: '#8B5CF6', icon: '⑂', x: 340, y: 195 },
  { id: 'hubspot', title: 'HubSpot', subtitle: 'Create Contact', color: '#F97316', icon: '🔶', x: 620, y: 100 },
  { id: 'slack', title: 'Slack', subtitle: 'Send Message', color: '#3B82F6', icon: '💬', x: 620, y: 290 },
];

/* ═══════════════════════════════════════════════════════════
   Swarm bubble texts — annoying client demands
   ═══════════════════════════════════════════════════════════ */
const SWARM_TEXTS = [
  'Make it pop!', 'Can we add AI?', 'Change it back', 'My nephew codes',
  'ASAP!!!', 'Make the logo bigger', 'What if it was blue?', 'Undo that',
  'Just one more thing...', 'Can we add a portal?', 'Make it more modern',
  'Actually, I liked v1', 'Can it be more like Apple?', 'Add blockchain',
  'We need it yesterday', 'Let\'s pivot', 'More whitespace', 'Less whitespace',
  'Can we use Comic Sans?', 'My wife says...',
];

/* Pre-compute random positions for bubbles */
const SWARM_BUBBLES = SWARM_TEXTS.map((text) => ({
  text,
  left: 5 + Math.random() * 80,
  top: 5 + Math.random() * 80,
  scale: 0.65 + Math.random() * 0.6,
  rotate: -15 + Math.random() * 30,
  z: 25 + Math.floor(Math.random() * 10),
}));

/* ═══════════════════════════════════════════════════════════
   Geometry helpers — node sizing & wire path generation
   ═══════════════════════════════════════════════════════════ */
const NODE_W = 220;
const NODE_H = 72;
const HANDLE_R = 7;

type NodeDef = (typeof NODES)[0];

const outX = (n: NodeDef) => n.x + NODE_W;
const outY = (n: NodeDef) => n.y + NODE_H / 2;
const inX = (n: NodeDef) => n.x;
const inY = (n: NodeDef) => n.y + NODE_H / 2;

/** Generate a cubic bezier path between two nodes */
const wirePath = (from: NodeDef, to: NodeDef) => {
  const sx = outX(from),
    sy = outY(from),
    ex = inX(to),
    ey = inY(to);
  const dx = (ex - sx) * 0.5;
  return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${ex - dx} ${ey}, ${ex} ${ey}`;
};

/** Generate a DISTORTED bezier path with jitter */
const jitteredWirePath = (from: NodeDef, to: NodeDef, amount: number) => {
  const j = () => (Math.random() - 0.5) * amount;
  const sx = outX(from),
    sy = outY(from),
    ex = inX(to),
    ey = inY(to);
  const dx = (ex - sx) * 0.5;
  return `M ${sx} ${sy + j()} C ${sx + dx + j()} ${sy + j()}, ${ex - dx + j()} ${ey + j()}, ${ex} ${ey + j()}`;
};

const WIRES = [
  { from: 'webhook', to: 'router' },
  { from: 'router', to: 'hubspot' },
  { from: 'router', to: 'slack' },
];

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */
const StorytellingAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wireJitterRef = useRef<number | null>(null);
  const isVisibleRef = useRef(false);
  const hasPlayedRef = useRef(false);

  const getNode = useCallback((id: string) => NODES.find((n) => n.id === id)!, []);

  /* ── Wire jitter helpers ── */
  const startWireJitter = useCallback(
    (wirePaths: NodeListOf<Element>, amount: number) => {
      if (wireJitterRef.current) clearInterval(wireJitterRef.current);
      wireJitterRef.current = window.setInterval(() => {
        wirePaths.forEach((path, i) => {
          const wire = WIRES[i];
          path.setAttribute(
            'd',
            jitteredWirePath(getNode(wire.from), getNode(wire.to), amount)
          );
        });
      }, 50);
    },
    [getNode]
  );

  const stopWireJitter = useCallback(
    (wirePaths: NodeListOf<Element>) => {
      if (wireJitterRef.current) {
        clearInterval(wireJitterRef.current);
        wireJitterRef.current = null;
      }
      // Snap back to mathematically perfect paths
      wirePaths.forEach((path, i) => {
        const wire = WIRES[i];
        path.setAttribute('d', wirePath(getNode(wire.from), getNode(wire.to)));
      });
    },
    [getNode]
  );

  /* ═══════════════════════════════════════
     Main animation effect
     ═══════════════════════════════════════ */
  useEffect(() => {
    const el = containerRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;

    const runAnimation = () => {
      const allBubbles = el.querySelectorAll('.swarm-bubble');
      const nodeDivs = el.querySelectorAll('.n8n-node');
      const wirePaths = el.querySelectorAll('.wire-path');
      const dots = el.querySelectorAll('.travel-dot');
      const trustText = el.querySelector('.trust-text');
      const canvasOverlay = el.querySelector('.canvas-dim');

      /* ── Reset all elements ── */
      anime.set(allBubbles, { opacity: 0, scale: 0 });
      anime.set(nodeDivs, { translateX: 0, translateY: 0, scale: 1, opacity: 1 });
      anime.set(dots, { opacity: 0 });
      anime.set(trustText, { opacity: 0, scale: 0.7, translateY: 20 });
      anime.set(canvasOverlay, { opacity: 0 });

      wirePaths.forEach((path, i) => {
        const wire = WIRES[i];
        const svgPath = path as SVGPathElement;
        svgPath.setAttribute('d', wirePath(getNode(wire.from), getNode(wire.to)));
        svgPath.style.stroke = '#4B5563';
        svgPath.style.strokeWidth = '3';
        svgPath.style.strokeDasharray = '';
        svgPath.style.strokeDashoffset = '';
      });

      nodeDivs.forEach((div) => {
        const node = NODES.find((n) => n.id === (div as HTMLElement).dataset.nodeId);
        if (node) (div as HTMLElement).style.borderLeftColor = node.color;
      });

      /* ════════════════════════════════════════
         TIMELINE — The 6-phase narrative
         ════════════════════════════════════════ */
      const tl = anime.timeline({
        easing: 'easeOutExpo',
        complete: () => {
          if (isVisibleRef.current) {
            timeoutRef.current = setTimeout(runAnimation, 4000);
          } else {
            hasPlayedRef.current = false;
          }
        },
      });

      /* ── PHASE 1: The Swarm ──
         Rapid waves of speech bubbles, escalating in speed */

      // Wave 1 — 5 bubbles, moderate pace
      tl.add({
        targets: Array.from(allBubbles).slice(0, 5),
        opacity: [0, 1],
        scale: (_el: Element) => [0, parseFloat((_el as HTMLElement).dataset.targetScale || '1')],
        duration: 500,
        easing: 'easeOutElastic(1, .5)',
        delay: anime.stagger(180),
      });

      // Light node jitter begins
      tl.add(
        {
          targets: nodeDivs,
          translateX: () => anime.random(-6, 6),
          translateY: () => anime.random(-5, 5),
          duration: 350,
          easing: 'easeOutQuad',
        },
        '-=500'
      );

      // Wave 2 — 5 more, faster
      tl.add(
        {
          targets: Array.from(allBubbles).slice(5, 10),
          opacity: [0, 1],
          scale: (_el: Element) => [0, parseFloat((_el as HTMLElement).dataset.targetScale || '1')],
          duration: 400,
          easing: 'easeOutElastic(1, .5)',
          delay: anime.stagger(120),
        },
        '+=80'
      );

      /* ── PHASE 2: The Overload ──
         Nodes vibrate violently, wires distort & flash red */

      // Wires go orange + start mild wire distortion
      tl.add(
        {
          targets: wirePaths,
          stroke: '#F97316',
          strokeWidth: '3.5',
          duration: 300,
          easing: 'linear',
          begin: () => startWireJitter(wirePaths, 10),
        },
        '-=350'
      );

      // Medium node jitter
      tl.add(
        {
          targets: nodeDivs,
          translateX: () => anime.random(-14, 14),
          translateY: () => anime.random(-10, 10),
          duration: 280,
          easing: 'easeOutQuad',
        },
        '-=250'
      );

      // Wave 3 — 5 more, even faster
      tl.add(
        {
          targets: Array.from(allBubbles).slice(10, 15),
          opacity: [0, 1],
          scale: (_el: Element) => [0, parseFloat((_el as HTMLElement).dataset.targetScale || '1')],
          duration: 300,
          easing: 'easeOutElastic(1, .6)',
          delay: anime.stagger(80),
        },
        '+=30'
      );

      // Wires go RED + intensify distortion
      tl.add(
        {
          targets: wirePaths,
          stroke: '#EF4444',
          strokeWidth: '4',
          duration: 200,
          easing: 'linear',
          begin: () => startWireJitter(wirePaths, 22),
        },
        '-=250'
      );

      // Violent node shaking
      tl.add(
        {
          targets: nodeDivs,
          translateX: () => anime.random(-22, 22),
          translateY: () => anime.random(-18, 18),
          duration: 220,
          easing: 'easeOutQuad',
        },
        '-=200'
      );

      // Wave 4 — remaining, rapid fire (TOTAL CHAOS)
      tl.add({
        targets: Array.from(allBubbles).slice(15),
        opacity: [0, 1],
        scale: (_el: Element) => [0, parseFloat((_el as HTMLElement).dataset.targetScale || '1')],
        duration: 220,
        easing: 'easeOutElastic(1, .7)',
        delay: anime.stagger(40),
      });

      // Maximum chaos — rapid alternating vibration
      tl.add(
        {
          targets: nodeDivs,
          translateX: [-6, 6],
          translateY: [-5, 5],
          direction: 'alternate',
          loop: 8,
          duration: 40,
          easing: 'linear',
        },
        '-=200'
      );

      // Wire color flashing
      tl.add(
        {
          targets: wirePaths,
          stroke: [
            { value: '#EF4444', duration: 50 },
            { value: '#F97316', duration: 50 },
            { value: '#EF4444', duration: 50 },
            { value: '#F97316', duration: 50 },
            { value: '#EF4444', duration: 50 },
            { value: '#DC2626', duration: 50 },
          ],
          easing: 'linear',
        },
        '-=320'
      );

      // Node borders flash red
      tl.add(
        {
          targets: Array.from(nodeDivs),
          borderLeftColor: '#EF4444',
          duration: 200,
          easing: 'linear',
        },
        '-=300'
      );

      /* ── PHASE 3: The Snap ──
         Hard stop. All bubbles collapse. Everything dims. */

      tl.add(
        {
          targets: allBubbles,
          scale: 0,
          opacity: 0,
          duration: 180,
          easing: 'easeInQuad',
          begin: () => stopWireJitter(wirePaths),
        },
        '+=150'
      );

      // Nodes freeze in place, dim
      tl.add(
        {
          targets: nodeDivs,
          translateX: 0,
          translateY: 0,
          opacity: 0.25,
          duration: 250,
          easing: 'easeOutQuad',
        },
        '-=80'
      );

      // Dark overlay
      tl.add(
        {
          targets: canvasOverlay,
          opacity: [0, 0.65],
          duration: 300,
          easing: 'easeOutQuad',
        },
        '-=200'
      );

      // Wires go dark
      tl.add(
        {
          targets: wirePaths,
          stroke: '#1f2029',
          strokeWidth: '2',
          duration: 200,
          easing: 'linear',
        },
        '-=200'
      );

      /* ── PHASE 4: The Authority ──
         "TRUST US." slams into center with elastic bounce */

      tl.add(
        {
          targets: trustText,
          opacity: [0, 1],
          scale: [0.7, 1],
          translateY: [20, 0],
          duration: 900,
          easing: 'easeOutElastic(1, .4)',
        },
        '+=250'
      );

      // Hold for 1.5s, then fade
      tl.add(
        {
          targets: trustText,
          opacity: [1, 0],
          scale: [1, 1.08],
          duration: 600,
          easing: 'easeInOutQuad',
        },
        '+=1500'
      );

      /* ── PHASE 5: The Resolution ──
         Layout snaps to mathematical perfection. Wires turn #85c9bd. */

      // Overlay fades
      tl.add(
        {
          targets: canvasOverlay,
          opacity: [0.65, 0],
          duration: 700,
          easing: 'easeOutQuad',
        },
        '-=400'
      );

      // Nodes snap to perfect position
      tl.add(
        {
          targets: nodeDivs,
          translateX: 0,
          translateY: 0,
          scale: 1,
          opacity: 1,
          duration: 1000,
          easing: 'easeOutExpo',
        },
        '-=500'
      );

      // Restore node border colors
      tl.add(
        {
          targets: Array.from(nodeDivs),
          borderLeftColor: (_el: Element) => {
            const node = NODES.find((n) => n.id === (_el as HTMLElement).dataset.nodeId);
            return node?.color || '#85c9bd';
          },
          duration: 600,
          easing: 'linear',
        },
        '-=800'
      );

      // Wires: animated stroke drawing in accent color
      tl.add(
        {
          targets: wirePaths,
          stroke: '#85c9bd',
          strokeWidth: '3',
          strokeDashoffset: [anime.setDashoffset, 0],
          duration: 1000,
          easing: 'easeOutExpo',
          delay: anime.stagger(150),
          complete: () => {
            wirePaths.forEach((path) => {
              const svgPath = path as SVGPathElement;
              svgPath.style.strokeDasharray = '';
              svgPath.style.strokeDashoffset = '';
            });
          },
        },
        '-=700'
      );

      /* ── PHASE 6: The Flow ──
         Glowing dots travel along SVG paths, simulating data execution */

      WIRES.forEach((_, i) => {
        const pathEl = el.querySelectorAll('.wire-path')[i] as SVGPathElement;
        const dot = el.querySelectorAll('.travel-dot')[i];
        if (!pathEl || !dot) return;

        const pathObj = anime.path(pathEl);

        tl.add(
          {
            targets: dot,
            translateX: pathObj('x'),
            translateY: pathObj('y'),
            opacity: [
              { value: 1, duration: 60 },
              { value: 1, duration: 1050 },
              { value: 0, duration: 190 },
            ],
            easing: 'linear',
            duration: 1300,
          },
          i === 0 ? '+=300' : '-=1050'
        );
      });
    };

    /* ── Intersection Observer: trigger when visible ── */
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !hasPlayedRef.current) {
          hasPlayedRef.current = true;
          runAnimation();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (wireJitterRef.current) clearInterval(wireJitterRef.current);
      anime.remove(el.querySelectorAll('*'));
    };
  }, [getNode, startWireJitter, stopWireJitter]);

  /* ═══════════ JSX ═══════════ */
  return (
    <section ref={sectionRef} className="py-24 sm:py-32 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <p
          className="text-xs tracking-[0.3em] uppercase mb-4 text-center font-medium"
          style={{ color: '#85c9bd' }}
        >
          Why Us
        </p>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight"
          style={{ color: '#E5E7EB' }}
        >
          From Chaos to Clarity
        </h2>

        {/* ─── n8n Canvas ─── */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-xl"
          style={{
            background: '#1A1B23',
            backgroundImage: 'radial-gradient(circle, #2a2b35 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            aspectRatio: '16 / 9',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Dim overlay (used during Phase 3) */}
          <div
            className="canvas-dim absolute inset-0 bg-black opacity-0 pointer-events-none"
            style={{ zIndex: 35 }}
          />

          {/* ─── TRUST US. (Phase 4) ─── */}
          <div
            className="trust-text absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none"
            style={{ zIndex: 40 }}
          >
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] select-none"
              style={{
                color: '#E5E7EB',
                textShadow:
                  '0 0 60px rgba(133,201,189,0.5), 0 0 120px rgba(133,201,189,0.2)',
              }}
            >
              TRUST US.
            </h1>
          </div>

          {/* ─── Swarm bubbles ─── */}
          {SWARM_BUBBLES.map((b, i) => (
            <div
              key={i}
              className="swarm-bubble absolute opacity-0 pointer-events-none"
              data-target-scale={String(b.scale)}
              style={{
                left: `${b.left}%`,
                top: `${b.top}%`,
                zIndex: b.z,
                transform: 'scale(0)',
              }}
            >
              <div
                className="rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-xl whitespace-nowrap"
                style={{
                  background: '#252836',
                  border: '1px solid #3a3b48',
                  transform: `rotate(${b.rotate}deg)`,
                }}
              >
                <p className="text-[10px] sm:text-xs font-medium" style={{ color: '#E5E7EB' }}>
                  {b.text}
                </p>
              </div>
            </div>
          ))}

          {/* ─── SVG Wires ─── */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 900 500"
            preserveAspectRatio="xMidYMid meet"
            style={{ zIndex: 5 }}
          >
            <defs>
              <filter id="dot-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {WIRES.map((wire, i) => (
              <path
                key={i}
                className="wire-path"
                d={wirePath(getNode(wire.from), getNode(wire.to))}
                fill="none"
                stroke="#4B5563"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}
            {WIRES.map((_, i) => (
              <circle
                key={`dot-${i}`}
                className="travel-dot"
                r="6"
                fill="#85c9bd"
                opacity="0"
                filter="url(#dot-glow)"
              />
            ))}
          </svg>

          {/* ─── HTML Nodes (n8n-style) ─── */}
          <div className="absolute inset-0" style={{ zIndex: 10 }}>
            <div className="relative w-full h-full">
              <div
                className="absolute inset-0 origin-top-left"
                style={{ width: '900px', height: '500px' }}
              >
                {NODES.map((node) => (
                  <div
                    key={node.id}
                    data-node-id={node.id}
                    className="n8n-node absolute will-change-transform"
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      width: `${NODE_W}px`,
                      height: `${NODE_H}px`,
                      background: '#252836',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${node.color}`,
                      boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 14px',
                      gap: '12px',
                    }}
                  >
                    {/* Input handle */}
                    <div
                      className="absolute rounded-full border-2"
                      style={{
                        width: `${HANDLE_R * 2}px`,
                        height: `${HANDLE_R * 2}px`,
                        left: `-${HANDLE_R}px`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#3a3b48',
                        borderColor: '#4B5563',
                      }}
                    />
                    {/* Output handle */}
                    <div
                      className="absolute rounded-full border-2"
                      style={{
                        width: `${HANDLE_R * 2}px`,
                        height: `${HANDLE_R * 2}px`,
                        right: `-${HANDLE_R}px`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#3a3b48',
                        borderColor: '#4B5563',
                      }}
                    />
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-md text-lg"
                      style={{
                        width: '36px',
                        height: '36px',
                        background: `${node.color}18`,
                        border: `1px solid ${node.color}35`,
                      }}
                    >
                      <span>{node.icon}</span>
                    </div>
                    {/* Text */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#E5E7EB' }}>
                        {node.title}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: '#6B7280' }}>
                        {node.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScaleSync containerRef={containerRef} />
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   Responsive scaling — keeps 900×500 canvas proportional
   ═══════════════════════════════════════════════════════════ */
const ScaleSync = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const scale = Math.min(rect.width / 900, rect.height / 500);
      const inner = el.querySelector('.origin-top-left') as HTMLElement | null;
      if (inner) inner.style.transform = `scale(${scale})`;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);
  return null;
};

export default StorytellingAnimation;
