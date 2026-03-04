import { useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';

/* ─── Node definitions ─── */
const nodes = [
  {
    id: 'webhook',
    title: 'Webhook',
    subtitle: 'Trigger',
    color: '#22C55E',
    icon: '⚡',
    x: 60,
    y: 195,
  },
  {
    id: 'router',
    title: 'Switch',
    subtitle: 'Route by type',
    color: '#8B5CF6',
    icon: '⑂',
    x: 340,
    y: 195,
  },
  {
    id: 'hubspot',
    title: 'HubSpot',
    subtitle: 'Create Contact',
    color: '#F97316',
    icon: '🔶',
    x: 620,
    y: 100,
  },
  {
    id: 'slack',
    title: 'Slack',
    subtitle: 'Send Message',
    color: '#3B82F6',
    icon: '💬',
    x: 620,
    y: 290,
  },
];

/* ─── Bubble data ─── */
const bubbles = [
  { text: 'Can we add a portal?', pos: 'top-2 left-2 sm:top-4 sm:left-4' },
  { text: 'Make it pop more!', pos: 'top-2 right-2 sm:top-4 sm:right-4' },
  { text: 'Actually, undo that.', pos: 'bottom-12 left-2 sm:bottom-16 sm:left-4' },
  { text: 'Wait, what if we...', pos: 'bottom-12 right-2 sm:bottom-16 sm:right-4' },
];

/* ─── Geometry helpers ─── */
const NODE_W = 220;
const NODE_H = 72;
const HANDLE_R = 7;

// Output handle center (right edge, vertically centered)
const outX = (n: typeof nodes[0]) => n.x + NODE_W;
const outY = (n: typeof nodes[0]) => n.y + NODE_H / 2;

// Input handle center (left edge, vertically centered)
const inX = (n: typeof nodes[0]) => n.x;
const inY = (n: typeof nodes[0]) => n.y + NODE_H / 2;

// Smooth bezier between two handles
const wirePath = (from: typeof nodes[0], to: typeof nodes[0]) => {
  const sx = outX(from);
  const sy = outY(from);
  const ex = inX(to);
  const ey = inY(to);
  const dx = (ex - sx) * 0.5;
  return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${ex - dx} ${ey}, ${ex} ${ey}`;
};

// Distorted wire (for chaos beats)
const distortedWirePath = (from: typeof nodes[0], to: typeof nodes[0], chaos: number) => {
  const sx = outX(from);
  const sy = outY(from);
  const ex = inX(to);
  const ey = inY(to);
  const dx = (ex - sx) * 0.5;
  const rand = () => (Math.random() - 0.5) * chaos;
  return `M ${sx} ${sy} C ${sx + dx + rand()} ${sy + rand()}, ${ex - dx + rand()} ${ey + rand()}, ${ex} ${ey}`;
};

/* ─── Wires ─── */
const wires = [
  { from: 'webhook', to: 'router' },
  { from: 'router', to: 'hubspot' },
  { from: 'router', to: 'slack' },
];

const StorytellingAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getNode = useCallback((id: string) => nodes.find((n) => n.id === id)!, []);

  const cleanupAnimations = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const el = containerRef.current;
    if (el) anime.remove(el.querySelectorAll('*'));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const runAnimation = () => {
      // -- Grab DOM refs --
      const allBubbles = el.querySelectorAll('.speech-bubble');
      const nodeDivs = el.querySelectorAll('.n8n-node');
      const wirePaths = el.querySelectorAll('.wire-path');
      const dots = el.querySelectorAll('.travel-dot');
      const errorBadge = el.querySelector('.error-badge');
      const successBadge = el.querySelector('.success-badge');

      // -- Reset everything --
      anime.set(allBubbles, { opacity: 0, scale: 0, translateY: 0 });
      anime.set(nodeDivs, { translateX: 0, translateY: 0, scale: 1 });
      anime.set(dots, { opacity: 0 });
      anime.set(errorBadge, { opacity: 0, scale: 0 });
      anime.set(successBadge, { opacity: 0, scale: 0 });

      // Reset wire paths and colors
      wirePaths.forEach((path, i) => {
        const wire = wires[i];
        const from = getNode(wire.from);
        const to = getNode(wire.to);
        path.setAttribute('d', wirePath(from, to));
        (path as SVGPathElement).style.stroke = '#4B5563';
        (path as SVGPathElement).style.strokeDasharray = '0';
      });

      // Reset node border colors
      nodeDivs.forEach((div) => {
        const node = nodes.find((n) => n.id === (div as HTMLElement).dataset.nodeId);
        if (node) {
          (div as HTMLElement).style.borderLeftColor = node.color;
        }
      });

      const tl = anime.timeline({
        easing: 'easeOutExpo',
        complete: () => {
          timeoutRef.current = setTimeout(runAnimation, 3000);
        },
      });

      // ── Beat 1: Bubble 1 + nodes shift ──
      tl.add({
        targets: allBubbles[0],
        opacity: [0, 1],
        scale: [0, 1],
        duration: 600,
        easing: 'easeOutElastic(1, .5)',
      })
        .add({
          targets: nodeDivs[2], // hubspot
          translateY: [0, -18],
          translateX: [0, 12],
          duration: 500,
        }, '-=400')
        .add({
          targets: nodeDivs[3], // slack
          translateY: [0, 14],
          translateX: [0, -8],
          duration: 500,
        }, '-=400')
        .add({
          targets: wirePaths,
          strokeDasharray: ['0', '8 6'],
          duration: 300,
          easing: 'linear',
        }, '-=300')

        // ── Beat 2: Bubble 2 + more chaos + orange wires ──
        .add({
          targets: allBubbles[1],
          opacity: [0, 1],
          scale: [0, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .5)',
        }, '+=400')
        .add({
          targets: nodeDivs[1], // router
          translateY: [0, 22],
          translateX: [0, -15],
          duration: 500,
        }, '-=400')
        .add({
          targets: nodeDivs[2], // hubspot
          translateY: [-18, -30],
          translateX: [12, 25],
          duration: 500,
        }, '-=400')
        .add({
          targets: wirePaths,
          stroke: '#F97316',
          duration: 400,
          easing: 'linear',
        }, '-=300')

        // ── Beat 3: Bubble 3 + layout goes haywire + red ──
        .add({
          targets: allBubbles[2],
          opacity: [0, 1],
          scale: [0, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .5)',
        }, '+=400')
        .add({
          targets: nodeDivs[0], // webhook
          translateY: [0, 15],
          translateX: [0, 10],
          duration: 500,
        }, '-=400')
        .add({
          targets: nodeDivs[3], // slack
          translateY: [14, -20],
          translateX: [-8, 30],
          duration: 500,
        }, '-=400')
        .add({
          targets: wirePaths,
          stroke: '#EF4444',
          duration: 300,
          easing: 'linear',
        }, '-=200')
        .add({
          targets: Array.from(nodeDivs),
          borderLeftColor: '#EF4444',
          duration: 300,
          easing: 'linear',
        }, '-=200')

        // ── Beat 4: Bubble 4 + vibration + error badge ──
        .add({
          targets: allBubbles[3],
          opacity: [0, 1],
          scale: [0, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .5)',
        }, '+=200')
        .add({
          targets: nodeDivs,
          translateX: [-4, 4],
          direction: 'alternate',
          loop: 8,
          duration: 50,
          easing: 'linear',
        }, '-=200')
        .add({
          targets: errorBadge,
          opacity: [0, 1],
          scale: [0, 1],
          duration: 400,
          easing: 'easeOutElastic(1, .6)',
        }, '-=300')

        // ── Beat 5: Reject bubbles + snap back ──
        .add({
          targets: allBubbles,
          translateY: [0, 250],
          opacity: [1, 0],
          duration: 500,
          easing: 'easeInQuad',
          delay: anime.stagger(60),
        }, '+=300')
        .add({
          targets: errorBadge,
          opacity: [1, 0],
          scale: [1, 0],
          duration: 300,
        }, '-=300')
        .add({
          targets: nodeDivs,
          translateX: 0,
          translateY: 0,
          scale: 1,
          duration: 800,
          easing: 'easeOutExpo',
        }, '-=200')
        .add({
          targets: wirePaths,
          stroke: '#4B5563',
          strokeDasharray: '0',
          duration: 400,
          easing: 'linear',
        }, '-=600')

        // ── Beat 6: Resolution — green wires + travelling dots ──
        .add({
          targets: Array.from(nodeDivs),
          borderLeftColor: (el: HTMLElement) => {
            const node = nodes.find((n) => n.id === el.dataset.nodeId);
            return node?.color || '#85c9bd';
          },
          duration: 600,
          easing: 'linear',
        }, '+=200')
        .add({
          targets: wirePaths,
          stroke: '#85c9bd',
          duration: 800,
          easing: 'easeOutExpo',
        }, '-=600')
        .add({
          targets: successBadge,
          opacity: [0, 1],
          scale: [0, 1],
          duration: 500,
          easing: 'easeOutElastic(1, .6)',
        }, '-=400');

      // Animate dots along paths after timeline reaches Beat 6
      const timelineDuration = tl.duration;
      const dotDelay = timelineDuration - 1200;

      dots.forEach((dot, i) => {
        const pathEl = wirePaths[i] as SVGPathElement;
        if (!pathEl) return;

        const pathObj = anime.path(pathEl);
        anime({
          targets: dot,
          translateX: pathObj('x'),
          translateY: pathObj('y'),
          opacity: [
            { value: 1, duration: 100, delay: dotDelay },
            { value: 0, duration: 100, delay: 1200 },
          ],
          easing: 'linear',
          duration: 1400,
          delay: dotDelay + i * 200,
        });
      });
    };

    runAnimation();

    return () => {
      cleanupAnimations();
    };
  }, [getNode, cleanupAnimations]);

  return (
    <section className="py-24 sm:py-32 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <p className="text-primary text-xs tracking-[0.3em] uppercase mb-4 text-center">
          Why Us
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight text-foreground">
          From Chaos to Clarity
        </h2>

        {/* ─── Canvas Container ─── */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-xl border border-border"
          style={{
            background: '#1A1B23',
            backgroundImage:
              'radial-gradient(circle, #2a2b35 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            aspectRatio: '16 / 9',
          }}
        >
          {/* ─── Speech Bubbles (z-30) ─── */}
          {bubbles.map((b, i) => (
            <div
              key={i}
              className={`speech-bubble absolute ${b.pos} z-30 opacity-0`}
              style={{ transform: 'scale(0)' }}
            >
              <div className="bg-[#252836] border border-[#3a3b48] rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 shadow-xl max-w-[150px] sm:max-w-[190px]">
                <p className="text-[#E5E7EB] text-[11px] sm:text-xs font-medium leading-snug">
                  {b.text}
                </p>
                <div
                  className={`absolute w-2.5 h-2.5 bg-[#252836] border-[#3a3b48] rotate-45 ${
                    i < 2
                      ? 'bottom-[-6px] left-5 border-b border-r'
                      : 'top-[-6px] left-5 border-t border-l'
                  }`}
                />
              </div>
            </div>
          ))}

          {/* ─── SVG Wires (z-0) ─── */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 900 500"
            preserveAspectRatio="xMidYMid meet"
            style={{ zIndex: 0 }}
          >
            {wires.map((wire, i) => {
              const from = getNode(wire.from);
              const to = getNode(wire.to);
              return (
                <path
                  key={i}
                  className="wire-path"
                  d={wirePath(from, to)}
                  fill="none"
                  stroke="#4B5563"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Travelling dots */}
            {wires.map((_, i) => (
              <circle
                key={`dot-${i}`}
                className="travel-dot"
                r="5"
                fill="#85c9bd"
                opacity="0"
                style={{ filter: 'drop-shadow(0 0 6px #85c9bd)' }}
              />
            ))}
          </svg>

          {/* ─── Nodes (z-10) ─── */}
          <div
            className="absolute inset-0"
            style={{ zIndex: 10 }}
          >
            <div className="relative w-full h-full">
              {/* We use a viewBox-like scaling approach */}
              <div
                className="absolute inset-0 origin-top-left"
                style={{
                  /* Scale the 900x500 coordinate space to fill the container */
                  width: '900px',
                  height: '500px',
                  transform: 'scale(var(--canvas-scale, 1))',
                  transformOrigin: 'top left',
                }}
              >
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    data-node-id={node.id}
                    className="n8n-node absolute"
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      width: `${NODE_W}px`,
                      height: `${NODE_H}px`,
                      background: '#252836',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${node.color}`,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 14px',
                      gap: '12px',
                    }}
                  >
                    {/* Input handle */}
                    <div
                      className="absolute rounded-full bg-[#3a3b48] border-2 border-[#4B5563]"
                      style={{
                        width: `${HANDLE_R * 2}px`,
                        height: `${HANDLE_R * 2}px`,
                        left: `-${HANDLE_R}px`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />

                    {/* Output handle */}
                    <div
                      className="absolute rounded-full bg-[#3a3b48] border-2 border-[#4B5563]"
                      style={{
                        width: `${HANDLE_R * 2}px`,
                        height: `${HANDLE_R * 2}px`,
                        right: `-${HANDLE_R}px`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />

                    {/* Icon */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-md text-lg"
                      style={{
                        width: '36px',
                        height: '36px',
                        background: `${node.color}20`,
                        border: `1px solid ${node.color}40`,
                      }}
                    >
                      <span>{node.icon}</span>
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                      <p className="text-[#E5E7EB] text-sm font-semibold truncate">
                        {node.title}
                      </p>
                      <p className="text-[#6B7280] text-[11px] truncate">
                        {node.subtitle}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Error badge on HubSpot */}
                <div
                  className="error-badge absolute opacity-0"
                  style={{
                    left: `${nodes[2].x + NODE_W - 10}px`,
                    top: `${nodes[2].y - 10}px`,
                    transform: 'scale(0)',
                    zIndex: 20,
                  }}
                >
                  <div className="bg-[#EF4444] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
                    ERROR
                  </div>
                </div>

                {/* Success badge (centered below) */}
                <div
                  className="success-badge absolute opacity-0"
                  style={{
                    left: '50%',
                    bottom: '30px',
                    transform: 'translateX(-50%) scale(0)',
                    zIndex: 20,
                  }}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(133, 201, 189, 0.15)',
                      border: '1px solid #85c9bd',
                      color: '#85c9bd',
                    }}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: '#85c9bd' }}
                    />
                    Workflow Executed Successfully
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scale the coordinate space to fill container */}
      <style>{`
        @media (min-width: 1px) {
          [data-node-id] { will-change: transform; }
        }
      `}</style>

      {/* Responsive scaling via ResizeObserver is ideal, 
          but for simplicity we use CSS container queries with a JS approach */}
      <ScaleSync containerRef={containerRef} />
    </section>
  );
};

/* ─── Helper: keeps the 900×500 canvas scaled to the container ─── */
const ScaleSync = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) => {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const scaleX = rect.width / 900;
      const scaleY = rect.height / 500;
      const scale = Math.min(scaleX, scaleY);
      const inner = el.querySelector('.origin-top-left') as HTMLElement | null;
      if (inner) {
        inner.style.setProperty('--canvas-scale', String(scale));
        inner.style.transform = `scale(${scale})`;
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  return null;
};

export default StorytellingAnimation;
