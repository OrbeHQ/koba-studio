import React, { useEffect, useLayoutEffect, useRef, useState, lazy, Suspense } from 'react';
import gsap from 'gsap';
import BrandList from './components/BrandList';
import BrandDotOverlay from './components/BrandDotOverlay';
import GridLine from './components/GridLine';
import OrbeLogo from './components/OrbeLogo';
import FAQSection from './components/FAQSection';
import ProcessSection from './components/ProcessSection';
import { playTapSound } from './lib/audio';
import CustomCursor from './components/CustomCursor';

// Lazy loaded high-performance components
const DotGridShader = lazy(() => import('./components/DotGridShader'));
const InteractiveCanvas = lazy(() => import('./components/InteractiveCanvas'));

// The Orbe mark, inlined as a CSS mask so the shader only renders inside the logo shape.
const ORBE_MASK_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><path d='M100 0H87.4915V16.9396C77.9935 6.16979 64.3259 0 49.9661 0V12.5085C70.6908 12.5085 87.4915 29.3093 87.4915 50.0341H100V0Z' fill='black'/><path d='M100 49.95H87.4915V66.8896C77.9935 56.1198 64.3259 49.95 49.9661 49.95V62.4585C70.6908 62.4585 87.4915 79.2593 87.4915 99.9841H100V49.95Z' fill='black'/><path d='M0 0H12.5085V16.9396C22.0065 6.16979 35.6741 0 50.0339 0V12.5085C29.3092 12.5085 12.5085 29.3093 12.5085 50.0341H0V0Z' fill='black'/><path d='M0 49.95H12.5085V66.8896C22.0065 56.1198 35.6741 49.95 50.0339 49.95V62.4585C29.3092 62.4585 12.5085 79.2593 12.5085 99.9841H0V49.95Z' fill='black'/></svg>`;
const ORBE_MASK = `url("data:image/svg+xml,${encodeURIComponent(ORBE_MASK_SVG)}")`;
const orbeMaskStyle = {
  maskImage: ORBE_MASK,
  WebkitMaskImage: ORBE_MASK,
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
} as React.CSSProperties;

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [hoveredBrandColor, setHoveredBrandColor] = useState<string | null>(null);
  const masterTl = useRef<gsap.core.Timeline | null>(null);

  const toggleTheme = () => {
    playTapSound();
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Master Entrance GSAP Timeline properly synced on Layout
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      masterTl.current = tl;

      // Initialization: These happen INSTANTLY on mount, completely preventing FOUC
      gsap.set('.pillar-line-v', { scaleY: 0, transformOrigin: "top" });
      gsap.set('.pillar-line-h', { scaleX: 0, transformOrigin: "left" });
      gsap.set('.hero-shader-container', { opacity: 0, filter: 'blur(10px)' });
      // gsap.set('.hero-text', { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', y: 30 });
      gsap.set('.animate-fade-in', { y: 20, opacity: 0 });

      tl.to('.pillar-line-v', {
        scaleY: 1,
        duration: 2.2,
        ease: 'expo.inOut',
        stagger: 0.1
      }, 0.2) // Starts precisely as the loading curtain begins lifting

        .to('.pillar-line-h', {
          scaleX: 1,
          duration: 1.8,
          ease: 'power4.inOut',
          stagger: 0.05
        }, 0.5)

        .to('.hero-shader-container', {
          opacity: 1,
          filter: 'blur(0px)',
          duration: 2.5,
          ease: 'power2.inOut'
        }, 0.6)

        /* 
        .to('.hero-text', {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          y: 0,
          duration: 2,
          ease: 'expo.out'
        }, 1.4)
        */

        .to('.animate-fade-in', {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1
        }, 2.0);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={`${theme} overflow-x-hidden relative cursor-none`}>
      <CustomCursor />

      <div
        ref={containerRef}
        className="min-h-screen bg-[#EBEBEB] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#EBEBEB] font-sans grid grid-cols-[32px_1fr_32px] sm:grid-cols-[64px_1fr_64px] md:grid-cols-[1fr_500px_1fr] lg:grid-cols-[1fr_500px_1fr] grid-rows-[auto_auto_auto_auto_auto_auto_1fr] transition-colors duration-300 relative"
      >
        {/* === GLOBAL ARCHITECTURAL PILLARS (run full height, including hero) === */}
        {/* Left Double Pillar — solid column edge, dotted companion */}
        <GridLine vertical className="pillar-line-v top-0 bottom-0 left-[32px] sm:left-[64px] md:left-[calc(50%-250px)] w-px text-gray-400 dark:text-neutral-600" dashArray="none" />
        <GridLine vertical className="pillar-line-v top-0 bottom-0 left-[20px] sm:left-[52px] md:left-[calc(50%-262px)] w-px text-gray-400 dark:text-neutral-600" dashArray="2 4" />

        {/* Right Double Pillar — solid column edge, dotted companion */}
        <GridLine vertical className="pillar-line-v top-0 bottom-0 right-[32px] sm:right-[64px] md:right-[calc(50%-250px)] w-px text-gray-400 dark:text-neutral-600" dashArray="none" />
        <GridLine vertical className="pillar-line-v top-0 bottom-0 right-[20px] sm:right-[52px] md:right-[calc(50%-262px)] w-px text-gray-400 dark:text-neutral-600" dashArray="2 4" />

        {/* STATIC HEADER — brand left, theme toggle right (scrolls with the page) */}
        <header className="col-2 relative flex items-center justify-between px-5 sm:px-8 pt-12 pb-5 sm:pt-14 sm:pb-6 border-b border-gray-400 dark:border-neutral-600 transition-colors duration-300">
          {/* dashed guide rule running the full width of the bar */}
          <GridLine className="top-5 sm:top-6 left-[-2000px] right-[-2000px] h-px text-gray-400 dark:text-neutral-600" dashArray="2 4" />
          <div className="animate-fade-in flex flex-col gap-0.5">
            <div className="font-['PP_Frama'] font-extralight tracking-wide text-[15px] leading-tight text-[#1A1A1A] dark:text-[#EBEBEB]">Orbe Labs</div>
            <div className="font-mono text-[11px] leading-tight text-black/50 dark:text-white/50">Design and development</div>
          </div>
          <button
            onClick={toggleTheme}
            className="animate-fade-in w-4 h-4 rounded-full border border-gray-400 dark:border-gray-500 hover:border-gray-900 dark:hover:border-white transition-all duration-300 hover:scale-[1.15] cursor-pointer"
            style={{ backgroundColor: theme === 'dark' ? '#EBEBEB' : 'transparent' }}
            aria-label="Toggle theme"
          />
        </header>

        {/* IMMERSIVE HERO — constrained to the middle grid column, shader lives inside the Orbe mark */}
        <div id="hero-section" className="col-2 h-[85vh] min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden border-b border-gray-400 dark:border-neutral-600 border-dashed transition-colors duration-300 px-5 sm:px-8">
          {/* Interactive dot-grid shader, masked to the silhouette of the Orbe logo (Lazy Loaded) */}
          <div
            className="hero-shader-container relative z-10 w-full max-w-[500px] aspect-square"
            style={orbeMaskStyle}
          >
            <Suspense fallback={<OrbeLogo size="100%" className="w-full h-full opacity-20" />}>
              <DotGridShader theme={theme} brandColor={hoveredBrandColor} logo />
            </Suspense>
          </div>
        </div>

        {/* Remaining Story Paragraphs */}
        <div className="col-2 py-16 px-5 sm:px-8 flex flex-col gap-6 sm:gap-8 transition-colors duration-300 relative">
          <GridLine className="pillar-line-h top-3 left-[-2000px] right-[-2000px] h-px text-gray-400 dark:text-neutral-600" dashArray="2 4" />

          <div className="animate-fade-in flex flex-col gap-8 sm:gap-10 mt-6 md:mt-10">
            <p className="font-sans text-[#111] dark:text-[#F3F3F3] leading-[1.65] font-normal tracking-[0.01em] text-[18px] sm:text-[21px] antialiased">
          Orbe Labs is an independent design and development studio for ideas with somewhere to go. We give them shape, character, and a life beyond the screen.
            </p>
            <p className="font-sans text-[#111] dark:text-[#F3F3F3] leading-[1.65] font-normal tracking-[0.01em] text-[18px] sm:text-[21px] antialiased">
              We work only with founders and teams whose vision we believe in. From day one we sit beside you so nothing gets diluted between the idea and the product that ships. Design and code move as one. We start quickly, test the edges, and refine until every detail lands exactly as you intended.
            </p>
          </div>
        </div>

        {/* Row 4: Brand List */}
        <div className="col-2 py-10 sm:py-14 transition-colors duration-300 relative">
          <GridLine className="pillar-line-h top-0 left-[-2000px] right-[-2000px] h-px text-gray-400 dark:text-neutral-600" dashArray="2 4" />
          <GridLine className="pillar-line-h bottom-0 left-[-2000px] right-[-2000px] h-px text-gray-400 dark:text-neutral-600" dashArray="2 4" />
          <div className="animate-fade-in">
            <BrandList onBrandHover={setHoveredBrandColor} />
          </div>
        </div>

        {/* Row 4b: Scroll-driven process / clover section (spans full grid width) */}
        <div className="col-span-3 relative">
          <ProcessSection />
        </div>

        {/* Row 4c: FAQ */}
        <FAQSection />

        {/* Row 5: Contact/Vision + Interactive Canvas (Lazy Loaded) */}
        <div className="col-2 py-10 sm:py-14 px-5 sm:px-8 flex flex-col gap-10 transition-colors duration-300 relative">
          <GridLine className="pillar-line-h bottom-0 left-[-2000px] right-[-2000px] h-px text-gray-400 dark:text-neutral-600" dashArray="none" />
          <div className="animate-fade-in flex flex-col gap-6 sm:gap-8 mt-4 md:mt-8">
            <p className="font-sans text-[#111] dark:text-[#F3F3F3] leading-[1.65] font-normal tracking-[0.01em] text-[18px] sm:text-[21px] antialiased">
              Got something you're excited about? Let's make it real together. <br className="hidden sm:block" />
              <a href="mailto:info@orbelabs.org" className="font-medium text-black dark:text-white underline decoration-[1.5px] underline-offset-4 hover:opacity-70 transition-opacity">info@orbelabs.org</a>
            </p>
            <p className="font-editorial text-[16px] sm:text-[18px] text-[#111] dark:text-[#F3F3F3] opacity-60 antialiased">
              Based in Ethiopia, available remotely.
            </p>
          </div>
          <div className="animate-fade-in">
            <Suspense fallback={<div className="h-[400px] flex items-center justify-center font-mono text-sm opacity-50">INITIALIZING CANVAS...</div>}>
              <InteractiveCanvas />
            </Suspense>
          </div>
        </div>

        {/* Footer */}
        <div className="col-2 py-24 px-8 flex flex-col items-center justify-center transition-colors duration-300 relative">
          <GridLine className="pillar-line-h top-3 left-[-2000px] right-[-2000px] h-px text-gray-400 dark:text-neutral-600" dashArray="2 4" />

          <div className="animate-fade-in flex flex-col items-center justify-center gap-6 text-center">
            <OrbeLogo size={40} className="mb-2 opacity-80 hover:opacity-100 transition-opacity" />

            <div className="font-mono text-xs text-black dark:text-white opacity-40 tracking-[0.25em] uppercase">| Orbe Labs |</div>
            <div className="font-mono text-[10px] text-black dark:text-white opacity-40 tracking-[0.15em] uppercase leading-relaxed max-w-md">
              DESIGN AND DEVELOPMENT<br />
              BASED IN ETHIOPIA, OPERATING GLOBALLY.
            </div>
            <div className="font-mono text-xs text-black dark:text-white opacity-40 tracking-[0.25em] mt-4">| © 2026 |</div>
          </div>
        </div>

        {/* Dithered Gradient Bottom */}
        <div className="col-span-3 h-24 w-full opacity-30 dark:opacity-20" style={{
          backgroundImage: theme === 'dark'
            ? 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 4 4%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h1v1H0zm2 0h1v1H2zm-1 1h1v1H1zm2 0h1v1H3zm-2 1h1v1H0zm2 0h1v1H2zm-1 1h1v1H1zm2 0h1v1H3z%22 fill=%22%23ffffff%22 fill-rule=%22evenodd%22/%3E%3C/svg%3E")'
            : 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 4 4%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h1v1H0zm2 0h1v1H2zm-1 1h1v1H1zm2 0h1v1H3zm-2 1h1v1H0zm2 0h1v1H2zm-1 1h1v1H1zm2 0h1v1H3z%22 fill=%22%23000000%22 fill-rule=%22evenodd%22/%3E%3C/svg%3E")',
          backgroundSize: '4px 4px',
          maskImage: 'linear-gradient(to bottom, transparent, black)'
        }}></div>

        <BrandDotOverlay color={hoveredBrandColor} theme={theme} />
      </div>
    </div>
  );
}
