import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/* ═══════════════════════════════════════════════════════════
   Global Smooth Scroll — Lenis
   Wraps the entire app in physics-based kinetic scrolling.
   lerp: 0.05 gives a heavy, fluid feel that matches
   the WebGL particle dynamics.
   ═══════════════════════════════════════════════════════════ */
const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.05,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
