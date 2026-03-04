import { useEffect, useRef } from 'react';
import anime from 'animejs';
import Hero3DScene from './Hero3DScene';
import { Button } from './ui/button';
import { ArrowDown } from 'lucide-react';

const HeroSection = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = anime.timeline({ easing: 'easeOutExpo' });

    tl.add({
      targets: titleRef.current?.querySelectorAll('.word'),
      translateY: [80, 0],
      opacity: [0, 1],
      delay: anime.stagger(120),
      duration: 1200,
    })
    .add({
      targets: subtitleRef.current,
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 800,
    }, '-=600')
    .add({
      targets: ctaRef.current,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 600,
    }, '-=400');
  }, []);

  const titleWords = ['Build', 'Beyond', 'Boundaries'];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <Hero3DScene />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1
          ref={titleRef}
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold leading-[0.9] tracking-tight mb-8"
        >
          {titleWords.map((word, i) => (
            <span key={i} className="word inline-block opacity-0 mx-2">
              {i === 1 ? (
                <span className="gradient-text">{word}</span>
              ) : (
                <span className="text-foreground">{word}</span>
              )}
            </span>
          ))}
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 opacity-0"
        >
          Crafting immersive digital experiences with cutting-edge 3D technology
          and fluid animations that push the web forward.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0">
          <Button
            size="lg"
            className="relative px-10 py-6 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 glow-border transition-all duration-300 hover:scale-105"
          >
            Explore Work
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-10 py-6 text-lg rounded-full gradient-border border-transparent hover:bg-muted/30 transition-all duration-300"
          >
            Learn More
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <a href="#features" className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-sm tracking-widest uppercase">Scroll</span>
            <ArrowDown className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
