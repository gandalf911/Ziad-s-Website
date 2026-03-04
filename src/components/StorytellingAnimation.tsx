import { useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';

/* ─── Node definitions ─── */
const nodes = [
  { id: 'webhook', title: 'Webhook', subtitle: 'Trigger', color: '#22C55E', icon: '⚡', x: 60, y: 195 },
  { id: 'router', title: 'Switch', subtitle: 'Route by type', color: '#8B5CF6', icon: '⑂', x: 340, y: 195 },
  { id: 'hubspot', title: 'HubSpot', subtitle: 'Create Contact', color: '#F97316', icon: '🔶', x: 620, y: 100 },
  { id: 'slack', title: 'Slack', subtitle: 'Send Message', color: '#3B82F6', icon: '💬', x: 620, y: 290 },
];

/* ─── Swarm bubble texts ─── */
const swarmTexts = [
  'Make it pop!', 'Can we add AI?', 'Change it back', 'My nephew codes',
  'ASAP!!!', 'Make the logo bigger', 'What if it was blue?', 'Undo that',
  'Just one more thing...', 'Can we add a portal?', 'Make it more modern',
  'Actually, I liked v1', 'Can it be more like Apple?', 'Add blockchain',
  'We need it yesterday', 'Let\'s pivot', 'More whitespace', 'Less whitespace',
  'Can we use Comic Sans?', 'My wife says...',
];

/* ─── Pre-compute random swarm positions ─── */
const swarmBubbles = swarmTexts.map((text, i) => ({
  text,
  left: 5 + Math.random() * 80,
  top: 5 + Math.random() * 80,
  scale: 0.6 + Math.random() * 0.7,
  rotate: -15 + Math.random() * 30,
  z: 25 + Math.floor(Math.random() * 10),
}));

/* ─── Geometry ─── */
const NODE_W = 220;
const NODE_H = 72;
const HANDLE_R = 7;

const outX = (n: typeof nodes[0]) => n.x + NODE_W;
const outY = (n: typeof nodes[0]) => n.y + NODE_H / 2;
const inX = (n: typeof nodes[0]) => n.x;
const inY = (n: typeof nodes[0]) => n.y + NODE_H / 2;

const wirePath = (from: typeof nodes[0], to: typeof nodes[0]) => {
  const sx = outX(from), sy = outY(from), ex = inX(to), ey = inY(to);
  const dx = (ex - sx) * 0.5;
  return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${ex - dx} ${ey}, ${ex} ${ey}`;
};

const wires = [
  { from: 'webhook', to: 'router' },
  { from: 'router', to: 'hubspot' },
  { from: 'router', to: 'slack' },
];

const StorytellingAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getNode = useCallback((id: string) => nodes.find((n) => n.id === id)!, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const runAnimation = () => {
      const allBubbles = el.querySelectorAll('.swarm-bubble');
      const nodeDivs = el.querySelectorAll('.n8n-node');
      const wirePaths = el.querySelectorAll('.wire-path');
      const dots = el.querySelectorAll('.travel-dot');
      const trustText = el.querySelector('.trust-text');
      const canvasOverlay = el.querySelector('.canvas-dim');

      // Reset
      anime.set(allBubbles, { opacity: 0, scale: 0 });
      anime.set(nodeDivs, { translateX: 0, translateY: 0, scale: 1, opacity: 1 });
      anime.set(dots, { opacity: 0 });
      anime.set(trustText, { opacity: 0, scale: 0.8 });
      anime.set(canvasOverlay, { opacity: 0 });

      wirePaths.forEach((path, i) => {
        const wire = wires[i];
        path.setAttribute('d', wirePath(getNode(wire.from), getNode(wire.to)));
        (path as SVGPathElement).style.stroke = '#4B5563';
      });

      nodeDivs.forEach((div) => {
        const node = nodes.find((n) => n.id === (div as HTMLElement).dataset.nodeId);
        if (node) (div as HTMLElement).style.borderLeftColor = node.color;
      });

      const tl = anime.timeline({
        easing: 'easeOutExpo',
        complete: () => {
          timeoutRef.current = setTimeout(runAnimation, 4000);
        },
      });

      // ── Beats 1-4: The Escalation (bubbles swarm in waves) ──

      // Wave 1 (5 bubbles, moderate pace)
      tl.add({
        targets: Array.from(allBubbles).slice(0, 5),
        opacity: [0, 1],
        scale: (el: HTMLElement) => [0, parseFloat(el.dataset.targetScale || '1')],
        duration: 500,
        easing: 'easeOutElastic(1, .5)',
        delay: anime.stagger(180),
      });

      // Nodes start jittering lightly
      tl.add({
        targets: nodeDivs,
        translateX: () => anime.random(-8, 8),
        translateY: () => anime.random(-6, 6),
        duration: 400,
        easing: 'easeOutQuad',
      }, '-=600');

      // Wave 2 (5 more, faster)
      tl.add({
        targets: Array.from(allBubbles).slice(5, 10),
        opacity: [0, 1],
        scale: (el: HTMLElement) => [0, parseFloat(el.dataset.targetScale || '1')],
        duration: 400,
        easing: 'easeOutElastic(1, .5)',
        delay: anime.stagger(120),
      }, '+=100');

      // Wires go orange, nodes jitter more
      tl.add({
        targets: wirePaths,
        stroke: '#F97316',
        duration: 300,
        easing: 'linear',
      }, '-=400');

      tl.add({
        targets: nodeDivs,
        translateX: () => anime.random(-15, 15),
        translateY: () => anime.random(-12, 12),
        duration: 300,
        easing: 'easeOutQuad',
      }, '-=300');

      // Wave 3 (5 more, even faster)
      tl.add({
        targets: Array.from(allBubbles).slice(10, 15),
        opacity: [0, 1],
        scale: (el: HTMLElement) => [0, parseFloat(el.dataset.targetScale || '1')],
        duration: 300,
        easing: 'easeOutElastic(1, .6)',
        delay: anime.stagger(80),
      }, '+=50');

      // Wires go red, violent shaking
      tl.add({
        targets: wirePaths,
        stroke: '#EF4444',
        duration: 200,
        easing: 'linear',
      }, '-=300');

      tl.add({
        targets: nodeDivs,
        translateX: () => anime.random(-22, 22),
        translateY: () => anime.random(-18, 18),
        duration: 250,
        easing: 'easeOutQuad',
      }, '-=250');

      // Wave 4 (remaining, rapid fire — total chaos)
      tl.add({
        targets: Array.from(allBubbles).slice(15),
        opacity: [0, 1],
        scale: (el: HTMLElement) => [0, parseFloat(el.dataset.targetScale || '1')],
        duration: 250,
        easing: 'easeOutElastic(1, .7)',
        delay: anime.stagger(50),
      }, '+=0');

      // Maximum chaos vibration
      tl.add({
        targets: nodeDivs,
        translateX: [-5, 5],
        translateY: [-4, 4],
        direction: 'alternate',
        loop: 6,
        duration: 50,
        easing: 'linear',
      }, '-=200');

      // Wire flashing
      tl.add({
        targets: wirePaths,
        stroke: [
          { value: '#EF4444', duration: 60 },
          { value: '#F97316', duration: 60 },
          { value: '#EF4444', duration: 60 },
          { value: '#F97316', duration: 60 },
          { value: '#EF4444', duration: 60 },
        ],
        easing: 'linear',
      }, '-=300');

      // ── Beat 5: The Snap ──
      tl.add({
        targets: allBubbles,
        scale: 0,
        opacity: 0,
        duration: 200,
        easing: 'easeInQuad',
      }, '+=200');

      // Nodes freeze in place, dim everything
      tl.add({
        targets: nodeDivs,
        translateX: 0,
        translateY: 0,
        opacity: 0.3,
        duration: 300,
        easing: 'easeOutQuad',
      }, '-=100');

      tl.add({
        targets: canvasOverlay,
        opacity: [0, 0.6],
        duration: 300,
        easing: 'easeOutQuad',
      }, '-=200');

      tl.add({
        targets: wirePaths,
        stroke: '#2a2b35',
        duration: 200,
        easing: 'linear',
      }, '-=200');

      // ── Beat 6: TRUST US. ──
      tl.add({
        targets: trustText,
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 800,
        easing: 'easeOutElastic(1, .4)',
      }, '+=200');

      // Hold for 1.5s then fade out
      tl.add({
        targets: trustText,
        opacity: [1, 0],
        scale: [1, 1.1],
        duration: 600,
        easing: 'easeInOutQuad',
      }, '+=1500');

      // ── Beat 7: The Magic Execution ──
      // Dim overlay fades
      tl.add({
        targets: canvasOverlay,
        opacity: [0.6, 0],
        duration: 600,
        easing: 'easeOutQuad',
      }, '-=400');

      // Nodes return to perfect positions
      tl.add({
        targets: nodeDivs,
        translateX: 0,
        translateY: 0,
        scale: 1,
        opacity: 1,
        duration: 1000,
        easing: 'easeOutExpo',
      }, '-=500');

      // Restore node border colors
      tl.add({
        targets: Array.from(nodeDivs),
        borderLeftColor: (el: HTMLElement) => {
          const node = nodes.find((n) => n.id === el.dataset.nodeId);
          return node?.color || '#85c9bd';
        },
        duration: 600,
        easing: 'linear',
      }, '-=800');

      // Wires snap to perfect paths and turn green
      tl.add({
        targets: wirePaths,
        stroke: '#85c9bd',
        duration: 800,
        easing: 'easeOutExpo',
      }, '-=800');

      // ── Beat 8: The Flow (dots travel along paths) ──
      const beat8Offset = '+=200';

      wires.forEach((wire, i) => {
        const pathEl = el.querySelectorAll('.wire-path')[i] as SVGPathElement;
        const dot = el.querySelectorAll('.travel-dot')[i];
        if (!pathEl || !dot) return;

        const pathObj = anime.path(pathEl);

        tl.add({
          targets: dot,
          translateX: pathObj('x'),
          translateY: pathObj('y'),
          opacity: [
            { value: 1, duration: 50 },
            { value: 1, duration: 1100 },
            { value: 0, duration: 150 },
          ],
          easing: 'linear',
          duration: 1300,
        }, i === 0 ? beat8Offset : `-=1100`);
      });
    };

    runAnimation();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      anime.remove(el.querySelectorAll('*'));
    };
  }, [getNode]);

  return (
    <section className="py-24 sm:py-32 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <p className="text-primary text-xs tracking-[0.3em] uppercase mb-4 text-center">
          Why Us
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight text-foreground">
          From Chaos to Clarity
        </h2>

        {/* ─── Canvas ─── */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-xl border border-border"
          style={{
            background: '#1A1B23',
            backgroundImage: 'radial-gradient(circle, #2a2b35 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            aspectRatio: '16 / 9',
          }}
        >
          {/* Dim overlay */}
          <div
            className="canvas-dim absolute inset-0 bg-black opacity-0 pointer-events-none"
            style={{ zIndex: 35 }}
          />

          {/* ─── TRUST US. text ─── */}
          <div
            className="trust-text absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none"
            style={{ zIndex: 40, transform: 'scale(0.8)' }}
          >
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight select-none"
              style={{
                color: '#E5E7EB',
                textShadow: '0 0 40px rgba(133,201,189,0.4), 0 0 80px rgba(133,201,189,0.2)',
              }}
            >
              TRUST US.
            </h1>
          </div>

          {/* ─── Swarm bubbles ─── */}
          {swarmBubbles.map((b, i) => (
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
                className="bg-[#252836] border border-[#3a3b48] rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-xl whitespace-nowrap"
                style={{ transform: `rotate(${b.rotate}deg)` }}
              >
                <p className="text-[#E5E7EB] text-[10px] sm:text-xs font-medium">
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
            style={{ zIndex: 0 }}
          >
            {wires.map((wire, i) => (
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
            {wires.map((_, i) => (
              <circle
                key={`dot-${i}`}
                className="travel-dot"
                r="5"
                fill="#85c9bd"
                opacity="0"
                style={{ filter: 'drop-shadow(0 0 8px #85c9bd)' }}
              />
            ))}
          </svg>

          {/* ─── HTML Nodes ─── */}
          <div className="absolute inset-0" style={{ zIndex: 10 }}>
            <div className="relative w-full h-full">
              <div className="absolute inset-0 origin-top-left" style={{ width: '900px', height: '500px' }}>
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
                      <p className="text-[#E5E7EB] text-sm font-semibold truncate">{node.title}</p>
                      <p className="text-[#6B7280] text-[11px] truncate">{node.subtitle}</p>
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

/* ─── Responsive scaling ─── */
const ScaleSync = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) => {
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
