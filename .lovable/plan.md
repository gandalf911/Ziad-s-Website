

## Plan: Top-Tier 3D Animated Website

### Dependencies to Install
- `three` (3D engine)
- `@react-three/fiber@^8.18` (React renderer for Three.js)
- `@react-three/drei@^9.122.0` (helpers for R3F)
- `animejs@^3.2.2` (animation library)

### Website Structure

**Hero Section** — Full-screen 3D scene with floating geometric shapes (torus, icosahedron, octahedron) slowly rotating and orbiting. Gradient background. Bold headline with anime.js text reveal animation. A CTA button with hover glow effect.

**Features Section** — Three cards with icons that animate in on scroll using anime.js stagger animations. Glass-morphism card style.

**About Section** — Split layout with a smaller 3D scene (spinning wireframe sphere) on one side and text content on the other, with fade-in animations.

**Footer** — Minimal footer with links and subtle gradient border top.

### Technical Approach
- `Index.tsx` — Main page composing all sections
- `src/components/Hero3DScene.tsx` — R3F Canvas with animated meshes
- `src/components/HeroSection.tsx` — Hero layout with text animations
- `src/components/FeaturesSection.tsx` — Animated feature cards
- `src/components/AboutSection.tsx` — About with mini 3D scene
- `src/components/Footer.tsx` — Footer component

### Visual Style
- Dark theme with purple/blue gradient accents
- Glass-morphism cards
- Smooth scroll behavior
- Responsive design

