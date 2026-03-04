import { useEffect, useRef } from 'react';
import anime from 'animejs';

const bubbles = [
  { text: 'Can we add a portal?', position: 'top-4 left-4 sm:top-8 sm:left-8' },
  { text: 'Make it pop more!', position: 'top-4 right-4 sm:top-8 sm:right-8' },
  { text: 'Actually, undo that.', position: 'bottom-16 left-4 sm:bottom-20 sm:left-8' },
  { text: 'Wait, what if we...', position: 'bottom-16 right-4 sm:bottom-20 sm:right-8' },
];

const StorytellingAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<anime.AnimeTimelineInstance | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const runAnimation = () => {
      // Reset all elements
      const allBubbles = el.querySelectorAll('.speech-bubble');
      const blueprint = el.querySelector('.blueprint-container');
      const finalProduct = el.querySelector('.final-product');
      const nodeLogic = el.querySelectorAll('.node-logic');
      const nodeAction = el.querySelectorAll('.node-action');
      const nodeTrigger = el.querySelector('.node-trigger');
      const blueprintLines = el.querySelectorAll('.line-path');
      const allRects = el.querySelectorAll('.blueprint-nodes rect');

      // Reset state
      anime.set(allBubbles, { opacity: 0, scale: 0, translateY: 0 });
      anime.set(finalProduct, { opacity: 0, scale: 0.9 });
      anime.set(blueprint, { opacity: 1, scale: 1, translateX: 0, scaleX: 1 });
      anime.set(nodeLogic, { translateY: 0, scale: 1 });
      anime.set(nodeAction, { translateY: 0, scale: 1 });
      anime.set(nodeTrigger, { translateY: 0, scale: 1 });
      anime.set(blueprintLines, { stroke: '#4B5563', strokeDasharray: '6 6' });
      anime.set(allRects, { stroke: '' }); // reset to original

      // Restore original strokes
      el.querySelectorAll('.node-logic rect').forEach(r => {
        (r as SVGElement).style.stroke = '#6B7280';
        (r as SVGElement).style.strokeDasharray = '4 4';
      });
      el.querySelectorAll('.node-action rect').forEach(r => {
        (r as SVGElement).style.stroke = '#6B7280';
        (r as SVGElement).style.strokeDasharray = '0';
      });
      (el.querySelector('.node-trigger rect') as SVGElement | null)?.style.setProperty('stroke', '#85c9bd');

      const tl = anime.timeline({
        easing: 'easeOutExpo',
        complete: () => {
          setTimeout(runAnimation, 3000);
        },
      });

      // Beat 1: Bubble 1 + nodes shift
      tl.add({
        targets: allBubbles[0],
        opacity: [0, 1],
        scale: [0, 1],
        duration: 600,
        easing: 'easeOutElastic(1, .5)',
      })
        .add({
          targets: nodeLogic[0],
          translateY: [0, -15],
          scale: [1, 1.05],
          duration: 400,
          easing: 'easeOutQuad',
        }, '-=400')
        .add({
          targets: nodeAction[1],
          translateY: [0, 20],
          scale: [1, 0.95],
          duration: 400,
          easing: 'easeOutQuad',
        }, '-=400')

        // Beat 2: Bubble 2 + stretch + orange borders
        .add({
          targets: allBubbles[1],
          opacity: [0, 1],
          scale: [0, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .5)',
        }, '+=300')
        .add({
          targets: blueprint,
          scaleX: [1, 1.05],
          duration: 500,
          easing: 'easeOutQuad',
        }, '-=400')
        .add({
          targets: el.querySelectorAll('.node-logic rect, .node-action rect'),
          stroke: '#F97316',
          strokeDasharray: '8 4',
          duration: 400,
          easing: 'linear',
        }, '-=300')

        // Beat 3: Bubble 3 + layout flip + red borders
        .add({
          targets: allBubbles[2],
          opacity: [0, 1],
          scale: [0, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .5)',
        }, '+=300')
        .add({
          targets: nodeLogic,
          translateY: () => anime.random(-30, 30),
          scale: () => anime.random(85, 115) / 100,
          duration: 500,
          easing: 'easeOutQuad',
        }, '-=400')
        .add({
          targets: nodeAction,
          translateY: () => anime.random(-25, 25),
          scale: () => anime.random(90, 110) / 100,
          duration: 500,
          easing: 'easeOutQuad',
        }, '-=400')
        .add({
          targets: el.querySelectorAll('.node-logic rect, .node-action rect'),
          stroke: '#EF4444',
          duration: 300,
          easing: 'linear',
        }, '-=300')

        // Beat 4: Bubble 4 + vibration + flashing lines
        .add({
          targets: allBubbles[3],
          opacity: [0, 1],
          scale: [0, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .5)',
        }, '+=200')
        .add({
          targets: blueprint,
          translateX: [-5, 5],
          direction: 'alternate',
          loop: 10,
          duration: 50,
          easing: 'linear',
        }, '-=200')
        .add({
          targets: blueprintLines,
          stroke: [
            { value: '#EF4444', duration: 80 },
            { value: '#6B7280', duration: 80 },
            { value: '#EF4444', duration: 80 },
            { value: '#6B7280', duration: 80 },
            { value: '#EF4444', duration: 80 },
          ],
          easing: 'linear',
        }, '-=500')

        // Beat 5: Reject all bubbles + dim blueprint
        .add({
          targets: allBubbles,
          translateY: [0, 200],
          opacity: [1, 0],
          duration: 400,
          easing: 'easeInQuad',
          delay: anime.stagger(50),
        }, '+=200')
        .add({
          targets: blueprint,
          scale: [1, 0.92],
          opacity: [1, 0.4],
          translateX: 0,
          duration: 600,
          easing: 'easeOutQuad',
        }, '-=200')

        // Beat 6: Resolution — blueprint fades, final product appears
        .add({
          targets: blueprint,
          opacity: [0.4, 0],
          duration: 800,
          easing: 'easeOutQuad',
        }, '+=400')
        .add({
          targets: finalProduct,
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 2000,
          easing: 'easeOutExpo',
        }, '-=600');

      timelineRef.current = tl;
    };

    runAnimation();

    return () => {
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
      anime.remove(el.querySelectorAll('*'));
    };
  }, []);

  return (
    <section className="py-24 sm:py-32 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <p className="text-primary text-xs tracking-[0.3em] uppercase mb-4 text-center">
          Why Us
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight text-foreground">
          From Chaos to Clarity
        </h2>

        <div
          ref={containerRef}
          className="relative w-full aspect-[17/10] max-h-[560px] mx-auto"
        >
          {/* Speech Bubbles */}
          {bubbles.map((bubble, i) => (
            <div
              key={i}
              className={`speech-bubble absolute ${bubble.position} z-20 opacity-0`}
              style={{ transform: 'scale(0)' }}
            >
              <div className="bg-card border border-border rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg max-w-[160px] sm:max-w-[200px]">
                <p className="text-foreground text-xs sm:text-sm font-medium leading-snug">
                  {bubble.text}
                </p>
                <div
                  className={`absolute w-3 h-3 bg-card border-border rotate-45 ${
                    i < 2
                      ? 'bottom-[-7px] left-6 border-b border-r'
                      : 'top-[-7px] left-6 border-t border-l'
                  }`}
                />
              </div>
            </div>
          ))}

          {/* Blueprint (SVG) */}
          <div className="blueprint-container absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 850 500"
              className="w-full h-full"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
                </marker>
              </defs>

              <g
                className="blueprint-lines"
                fill="none"
                stroke="#4B5563"
                strokeWidth="2"
                strokeDasharray="6 6"
                markerEnd="url(#arrowhead)"
              >
                <path className="line-path" d="M 200 250 C 300 250, 300 150, 400 150" />
                <path className="line-path" d="M 200 250 C 300 250, 300 350, 400 350" />
                <path className="line-path" d="M 550 150 L 650 150" />
                <path className="line-path" d="M 550 350 L 650 350" />
              </g>

              <g className="blueprint-nodes">
                <g className="node-trigger" transform="translate(50, 210)">
                  <rect width="150" height="80" rx="8" fill="#111827" stroke="#85c9bd" strokeWidth="2" />
                  <circle cx="25" cy="40" r="6" fill="#85c9bd" />
                  <text x="45" y="45" fill="#E5E7EB" fontFamily="sans-serif" fontWeight="600" fontSize="14">
                    Webhook Event
                  </text>
                </g>

                <g className="node-logic" transform="translate(400, 110)">
                  <rect width="150" height="80" rx="8" fill="#111827" stroke="#6B7280" strokeWidth="2" strokeDasharray="4 4" />
                  <polygon points="25,35 35,25 45,35 35,45" fill="#9CA3AF" />
                  <text x="55" y="45" fill="#9CA3AF" fontFamily="sans-serif" fontSize="14">
                    Filter: Lead
                  </text>
                </g>

                <g className="node-logic" transform="translate(400, 310)">
                  <rect width="150" height="80" rx="8" fill="#111827" stroke="#6B7280" strokeWidth="2" strokeDasharray="4 4" />
                  <polygon points="25,35 35,25 45,35 35,45" fill="#9CA3AF" />
                  <text x="55" y="45" fill="#9CA3AF" fontFamily="sans-serif" fontSize="14">
                    Filter: Agent
                  </text>
                </g>

                <g className="node-action" transform="translate(650, 110)">
                  <rect width="150" height="80" rx="8" fill="#111827" stroke="#6B7280" strokeWidth="2" />
                  <rect x="20" y="32" width="16" height="16" rx="3" fill="#9CA3AF" />
                  <text x="45" y="45" fill="#E5E7EB" fontFamily="sans-serif" fontSize="14">
                    Sync CRM
                  </text>
                </g>

                <g className="node-action" transform="translate(650, 310)">
                  <rect width="150" height="80" rx="8" fill="#111827" stroke="#6B7280" strokeWidth="2" />
                  <rect x="20" y="32" width="16" height="16" rx="3" fill="#9CA3AF" />
                  <text x="45" y="45" fill="#E5E7EB" fontFamily="sans-serif" fontSize="14">
                    Update Portal
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* Final Product Overlay */}
          <div
            className="final-product absolute inset-0 flex items-center justify-center opacity-0"
            style={{ transform: 'scale(0.9)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 850 500"
              className="w-full h-full"
            >
              <defs>
                <marker
                  id="arrowhead-final"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#85c9bd" />
                </marker>
                <filter id="glow-final" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Solid connection lines */}
              <g
                fill="none"
                stroke="#85c9bd"
                strokeWidth="2"
                strokeDasharray="0"
                markerEnd="url(#arrowhead-final)"
                opacity="0.7"
              >
                <path d="M 200 250 C 300 250, 300 150, 400 150" />
                <path d="M 200 250 C 300 250, 300 350, 400 350" />
                <path d="M 550 150 L 650 150" />
                <path d="M 550 350 L 650 350" />
              </g>

              {/* Nodes — polished */}
              <g filter="url(#glow-final)">
                <g transform="translate(50, 210)">
                  <rect width="150" height="80" rx="8" fill="#0a0f1a" stroke="#85c9bd" strokeWidth="2" />
                  <circle cx="25" cy="40" r="6" fill="#85c9bd" />
                  <text x="45" y="45" fill="#E5E7EB" fontFamily="sans-serif" fontWeight="600" fontSize="14">
                    Webhook Event
                  </text>
                </g>

                <g transform="translate(400, 110)">
                  <rect width="150" height="80" rx="8" fill="#0a0f1a" stroke="#85c9bd" strokeWidth="2" />
                  <polygon points="25,35 35,25 45,35 35,45" fill="#85c9bd" />
                  <text x="55" y="45" fill="#E5E7EB" fontFamily="sans-serif" fontWeight="600" fontSize="14">
                    Filter: Lead
                  </text>
                </g>

                <g transform="translate(400, 310)">
                  <rect width="150" height="80" rx="8" fill="#0a0f1a" stroke="#85c9bd" strokeWidth="2" />
                  <polygon points="25,35 35,25 45,35 35,45" fill="#85c9bd" />
                  <text x="55" y="45" fill="#E5E7EB" fontFamily="sans-serif" fontWeight="600" fontSize="14">
                    Filter: Agent
                  </text>
                </g>

                <g transform="translate(650, 110)">
                  <rect width="150" height="80" rx="8" fill="#0a0f1a" stroke="#85c9bd" strokeWidth="2" />
                  <rect x="20" y="32" width="16" height="16" rx="3" fill="#85c9bd" />
                  <text x="45" y="45" fill="#E5E7EB" fontFamily="sans-serif" fontWeight="600" fontSize="14">
                    Sync CRM
                  </text>
                </g>

                <g transform="translate(650, 310)">
                  <rect width="150" height="80" rx="8" fill="#0a0f1a" stroke="#85c9bd" strokeWidth="2" />
                  <rect x="20" y="32" width="16" height="16" rx="3" fill="#85c9bd" />
                  <text x="45" y="45" fill="#E5E7EB" fontFamily="sans-serif" fontWeight="600" fontSize="14">
                    Update Portal
                  </text>
                </g>
              </g>

              {/* Status badge */}
              <g transform="translate(325, 440)">
                <rect width="200" height="36" rx="18" fill="#85c9bd" fillOpacity="0.15" stroke="#85c9bd" strokeWidth="1" />
                <circle cx="24" cy="18" r="5" fill="#85c9bd" />
                <text x="40" y="23" fill="#85c9bd" fontFamily="sans-serif" fontWeight="600" fontSize="13">
                  All Systems Online
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorytellingAnimation;
