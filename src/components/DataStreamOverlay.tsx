import { useEffect, useRef } from 'react';
import anime from 'animejs';

const DataStreamOverlay = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const columns = 12;

    for (let i = 0; i < columns; i++) {
      const col = document.createElement('div');
      col.className = 'data-column';
      col.style.cssText = `
        position: absolute;
        left: ${(i / columns) * 100}%;
        top: -100%;
        font-family: 'Inter', monospace;
        font-size: 10px;
        color: hsl(168 30% 65% / 0.07);
        writing-mode: vertical-rl;
        white-space: nowrap;
        pointer-events: none;
        user-select: none;
        letter-spacing: 3px;
      `;
      const chars = Array.from({ length: 80 }, () =>
        Math.random() > 0.5 ? String(Math.round(Math.random())) : String.fromCharCode(65 + Math.floor(Math.random() * 26))
      ).join(' ');
      col.textContent = chars;
      container.appendChild(col);

      anime({
        targets: col,
        translateY: ['0%', '200%'],
        duration: 18000 + Math.random() * 12000,
        delay: Math.random() * 8000,
        easing: 'linear',
        loop: true,
      });
    }

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
    />
  );
};

export default DataStreamOverlay;
