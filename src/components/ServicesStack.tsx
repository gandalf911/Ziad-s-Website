import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Code, Workflow, Database, Paintbrush, ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════
   Stacked Folder — each card pins with a visible "tab"
   of the previous card peeking above it
   ═══════════════════════════════════════════════════════════ */
const TAB_HEIGHT = 60; // px — visible tab strip per card

const SECTIONS = [
  {
    id: 'hero',
    bg: '#0F1015',
    label: 'SYSTEMS_',
    heading: ['WE BUILD', 'SYSTEMS'],
    description:
      'Custom apps, CRM integrations, and intelligent automations — engineered for scale.',
    accent: '#85c9bd',
  },
  {
    id: 'apps',
    bg: '#11121A',
    label: '01 — DEVELOPMENT',
    heading: ['Custom', 'Web Apps'],
    description:
      'Full-stack React & TypeScript applications built from the ground up. Pixel-perfect interfaces backed by robust APIs and cloud infrastructure.',
    accent: '#85c9bd',
    icon: Code,
    tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Cloud'],
  },
  {
    id: 'automations',
    bg: '#13141E',
    label: '02 — AUTOMATION',
    heading: ['Intelligent', 'Automations'],
    description:
      'End-to-end workflow pipelines using n8n, webhooks, and custom REST integrations. We eliminate manual work and accelerate your operations.',
    accent: '#F97316',
    icon: Workflow,
    tags: ['n8n', 'Webhooks', 'REST APIs', 'Pipelines', 'Cron'],
  },
  {
    id: 'crm',
    bg: '#15161F',
    label: '03 — CRM',
    heading: ['CRM', 'Expertise'],
    description:
      'Deep HubSpot integrations, pipeline optimization, data migration, and custom CRM architectures that unify your entire revenue engine.',
    accent: '#8B5CF6',
    icon: Database,
    tags: ['HubSpot', 'Pipelines', 'Migration', 'Analytics', 'Custom API'],
  },
  {
    id: 'design',
    bg: '#161722',
    label: '04 — DESIGN',
    heading: ['Web', 'Design'],
    description:
      'Pixel-perfect interfaces with obsessive attention to typography, motion, and interaction. We craft visual experiences that feel inevitable.',
    accent: '#EC4899',
    icon: Paintbrush,
    tags: ['UI/UX', 'Figma', 'Motion Design', 'Responsive', 'Branding'],
  },
];

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */
const ServicesStack = () => {
  const containerRef = useRef<HTMLElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useGSAP(
    () => {
      const sections = sectionsRef.current.filter(Boolean) as HTMLElement[];

      sections.forEach((section, index) => {
        // Pin each section with an offset so previous tabs remain visible
        ScrollTrigger.create({
          trigger: section,
          start: () => `top ${index * TAB_HEIGHT}px`,
          pin: true,
          pinSpacing: false,
        });

        // 3D entrance for all sections except the first
        if (index !== 0) {
          gsap.from(section, {
            yPercent: 50,
            rotateX: -30,
            transformPerspective: 1000,
            scale: 0.9,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: () => `top ${index * TAB_HEIGHT}px`,
              scrub: 1,
            },
          });
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <main ref={containerRef}>
      {SECTIONS.map((section, i) => (
        <section
          key={section.id}
          ref={(el) => {
            sectionsRef.current[i] = el;
          }}
          className="relative w-full overflow-hidden"
          style={{
            height: `calc(100vh - ${i * TAB_HEIGHT}px)`,
            background: section.bg,
            boxShadow: i > 0 ? '0 -8px 50px rgba(0,0,0,0.7)' : 'none',
            borderTop: i > 0 ? `1px solid ${section.accent}4d` : 'none',
            transformOrigin: 'center top',
          }}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.07,
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Atmospheric radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 50% at ${i === 0 ? '30%' : '70%'} 50%, ${section.accent}06 0%, transparent 70%)`,
            }}
          />

          {/* ── Tab label — pinned to top so it's visible as the tab strip ── */}
          {i > 0 && (
            <div
              className="absolute top-0 left-0 right-0 z-30 px-8 sm:px-16 lg:px-24"
              style={{ height: `${TAB_HEIGHT}px` }}
            >
              <div className="h-full flex items-center max-w-[1400px] mx-auto">
                <p
                  className="text-[10px] sm:text-[11px] tracking-[0.4em] uppercase font-medium"
                  style={{ color: section.accent }}
                >
                  {section.label}
                </p>
              </div>
            </div>
          )}

          {/* ── Content ── */}
          <div
            className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-16 lg:px-24 max-w-[1400px] mx-auto"
            style={{ paddingTop: i > 0 ? `${TAB_HEIGHT}px` : undefined }}
          >
            {i === 0 ? (
              /* ════════════════════════════════════
                 HERO — Section 1
                 ════════════════════════════════════ */
              <>
                <p
                  className="text-[11px] sm:text-xs tracking-[0.5em] uppercase mb-6 font-medium"
                  style={{ color: section.accent }}
                >
                  {section.label}
                </p>
                <h1
                  className="text-[clamp(3.5rem,10vw,9rem)] font-black tracking-[-0.04em] leading-[0.88]"
                  style={{ color: '#E5E7EB' }}
                >
                  {section.heading[0]}
                  <br />
                  <span style={{ color: section.accent }}>
                    {section.heading[1]}
                  </span>
                </h1>
                <p
                  className="mt-8 text-base sm:text-lg font-light max-w-lg leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {section.description}
                </p>

                {/* Scroll cue */}
                <div className="absolute bottom-10 left-8 sm:left-16 lg:left-24 flex items-center gap-3">
                  <ArrowDown
                    className="w-4 h-4"
                    style={{
                      color: 'rgba(255,255,255,0.2)',
                      animation: 'bounce 2s infinite',
                    }}
                  />
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase font-medium"
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                  >
                    Scroll to explore
                  </span>
                </div>
              </>
            ) : (
              /* ════════════════════════════════════
                 SERVICE SECTIONS
                 ════════════════════════════════════ */
              <div className="flex items-start gap-12 lg:gap-20 flex-col lg:flex-row">
                {/* Left column — Title & tags */}
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-[clamp(3rem,8vw,7.5rem)] font-black tracking-[-0.04em] leading-[0.88]"
                    style={{ color: '#E5E7EB' }}
                  >
                    {section.heading[0]}
                    <br />
                    {section.heading[1]}
                  </h2>

                  {/* Tags */}
                  {'tags' in section && section.tags && (
                    <div className="flex flex-wrap gap-2 mt-8">
                      {section.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 text-[11px] font-mono tracking-wide rounded-full"
                          style={{
                            background: `${section.accent}10`,
                            border: `1px solid ${section.accent}20`,
                            color: `${section.accent}cc`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right column — Icon, description, accent line */}
                <div className="lg:max-w-md lg:pt-8">
                  {'icon' in section && section.icon && (
                    <section.icon
                      className="w-8 h-8 mb-6"
                      style={{ color: section.accent }}
                      strokeWidth={1.2}
                    />
                  )}
                  <p
                    className="text-base sm:text-lg leading-relaxed font-light"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {section.description}
                  </p>
                  <div
                    className="mt-8 h-px w-16"
                    style={{ background: `${section.accent}40` }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Spacer — gives the last pinned section breathing room */}
      <div className="h-screen w-full" style={{ background: SECTIONS[SECTIONS.length - 1].bg }} />
    </main>
  );
};

export default ServicesStack;
