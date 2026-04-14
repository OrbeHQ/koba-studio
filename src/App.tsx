import React, { useEffect, useLayoutEffect, useCallback, useRef, useState, lazy, Suspense } from 'react';
import gsap from 'gsap';
import BrandList from './components/BrandList';
import BrandDotOverlay from './components/BrandDotOverlay';
import GridLine from './components/GridLine';
import KobaLogo from './components/KobaLogo';
import { playTapSound } from './lib/audio';
import Loader from './components/Loader';
import SmoothScroll from './components/SmoothScroll';
import CustomCursor from './components/CustomCursor';

// Lazy loaded high-performance components
const DotGridShader = lazy(() => import('./components/DotGridShader'));
const InteractiveCanvas = lazy(() => import('./components/InteractiveCanvas'));
const LoupeEffect = lazy(() => import('./components/LoupeEffect'));

function IntersectionMarker({ className }: { className?: string }) {
  return (
    <div className={`absolute flex items-center justify-center pointer-events-none -translate-x-1/2 -translate-y-1/2 z-20 text-gray-400 dark:text-neutral-800 ${className || ''}`}>
      <div className="absolute top-1/2 left-1/2 mt-1.5 ml-1.5 grid grid-cols-2 gap-[2px]">
        <div className="w-[1.5px] h-[1.5px] bg-currentColor"></div>
        <div className="w-[1.5px] h-[1.5px] bg-currentColor"></div>
        <div className="w-[1.5px] h-[1.5px] bg-currentColor"></div>
        <div className="w-[1.5px] h-[1.5px] bg-currentColor"></div>
      </div>
    </div>
  );
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hoveredBrandColor, setHoveredBrandColor] = useState<string | null>(null);
  const [isLoaderDone, setIsLoaderDone] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const masterTl = useRef<gsap.core.Timeline | null>(null);

  const handleLoaderComplete = useCallback(() => setIsLoaderDone(true), []);
  const handleAnimationStart = useCallback(() => setAnimationStarted(true), []);

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
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      masterTl.current = tl;

      // Initialization: These happen INSTANTLY on mount, completely preventing FOUC
      gsap.set('.pillar-line-v', { scaleY: 0, transformOrigin: "top" });
      gsap.set('.pillar-line-h', { scaleX: 0, transformOrigin: "left" });
      gsap.set('.nav-container', { y: -80, opacity: 0 });
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

        .to('.nav-container', {
          y: 0,
          opacity: 1,
          duration: 1.6,
          ease: 'elastic.out(1, 0.65)'
        }, 1.2)

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

  // Trigger Master Timeline concurrently with Loader exit
  useEffect(() => {
    if (animationStarted && masterTl.current) {
      masterTl.current.play();
    }
  }, [animationStarted]);

  return (
    <div className={`${theme} overflow-x-hidden relative cursor-none`}>
      <SmoothScroll />
      <CustomCursor />
      {/* Loader acts as purely a cover layer now */}
      {!isLoaderDone && (
        <Loader
          theme={theme}
          onFadeOutStart={handleAnimationStart}
          onComplete={handleLoaderComplete}
        />
      )}

      <div
        ref={containerRef}
        className="min-h-screen bg-[#EBEBEB] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#EBEBEB] font-sans grid grid-cols-[32px_1fr_32px] sm:grid-cols-[64px_1fr_64px] md:grid-cols-[1fr_500px_1fr] lg:grid-cols-[1fr_500px_1fr] grid-rows-[auto_auto_auto_auto_auto_auto_1fr] transition-colors duration-300 relative"
      >
        {/* === GLOBAL ARCHITECTURAL PILLARS === */}
        {/* Left Double Pillar */}
        <GridLine vertical className="pillar-line-v top-[max(85vh,600px)] bottom-0 left-[32px] sm:left-[64px] md:left-[calc(50%-250px)] w-px text-gray-400 dark:text-neutral-600" dashArray="2 4" />
        <GridLine vertical className="pillar-line-v top-[max(85vh,600px)] bottom-0 left-[20px] sm:left-[52px] md:left-[calc(50%-262px)] w-px text-gray-400 dark:text-neutral-600" dashArray="none" />

        {/* Right Double Pillar */}
        <GridLine vertical className="pillar-line-v top-[max(85vh,600px)] bottom-0 right-[32px] sm:right-[64px] md:right-[calc(50%-250px)] w-px text-gray-400 dark:text-neutral-600" dashArray="2 4" />
        <GridLine vertical className="pillar-line-v top-[max(85vh,600px)] bottom-0 right-[20px] sm:right-[52px] md:right-[calc(50%-262px)] w-px text-gray-400 dark:text-neutral-600" dashArray="none" />

        {/* FLOATING NAVBAR */}
        <nav className="nav-container fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-6 py-3 bg-[#EBEBEB]/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md rounded-full border border-gray-400 dark:border-neutral-600 shadow-sm transition-colors duration-300 pointer-events-auto">
          <div className="flex flex-col">
            <div className="font-sans text-sm text-black dark:text-[#F5F0E8] font-bold">Koba Studio</div>
            <div className="font-mono text-[9px] uppercase text-black dark:text-white tracking-widest opacity-60">Design & Dev</div>
          </div>
          <div className="w-px h-6 bg-gray-400 dark:bg-neutral-600"></div>
          <button
            onClick={toggleTheme}
            className="w-4 h-4 rounded-full border border-gray-400 dark:border-gray-500 hover:border-gray-900 dark:hover:border-white transition-all duration-300 hover:scale-[1.15] cursor-pointer"
            style={{ backgroundColor: theme === 'dark' ? 'currentColor' : 'transparent' }}
            aria-label="Toggle theme"
          />
        </nav>

        {/* MASSIVE IMMERSIVE HERO */}
        <div className="col-span-3 h-[85vh] min-h-[600px] relative flex flex-col justify-center overflow-hidden border-b border-gray-400 dark:border-neutral-600 border-dashed transition-colors duration-300">
          <IntersectionMarker className="top-0 left-0" />
          <IntersectionMarker className="top-0 right-0" />
          <IntersectionMarker className="bottom-0 left-0" />
          <IntersectionMarker className="bottom-0 right-0" />

          {/* Full-bleed interactive background shader (Lazy Loaded for max performance) */}
          <div className="hero-shader-container absolute inset-0 w-full h-full z-0" id="hero-shader">
            <Suspense fallback={null}>
              <DotGridShader theme={theme} brandColor={hoveredBrandColor} />
            </Suspense>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[900px] h-[55%] bg-[#EBEBEB]/80 dark:bg-[#0A0A0A]/80 blur-[80px] pointer-events-none z-10 rounded-full" />

          {/* Massive Editorial Typography Layer */}
          {/* 
          <div className="relative z-20 w-full max-w-5xl mx-auto px-5 sm:px-8 text-center pointer-events-none pb-12 mt-12 mix-blend-normal">
            <h1 className="hero-text font-editorial italic text-4xl sm:text-6xl md:text-7xl lg:text-[85px] font-medium text-black dark:text-white tracking-tight leading-[1.05] drop-shadow-xl mt-10">
             High-Converting Digital Brands That Feel Unmistakably You. Built Side by Side by a Designer Developer Duo Obsessed with Flawless Design            </h1>
          </div>
          */}
        </div>

        {/* Remaining Story Paragraphs */}
        <div className="col-2 py-16 px-5 sm:px-8 flex flex-col gap-6 sm:gap-8 transition-colors duration-300 relative">
          <GridLine className="pillar-line-h top-3 left-[-2000px] right-[-2000px] h-px text-gray-400 dark:text-neutral-600" dashArray="2 4" />

          <div className="animate-fade-in flex flex-col gap-8 sm:gap-10 mt-6 md:mt-10">
            <p className="font-editorial text-[#111] dark:text-[#F3F3F3] leading-[1.65] font-normal tracking-[0.01em] text-[18px] sm:text-[21px] antialiased">
              Meet <span className="underline decoration-1 underline-offset-4 hover:decoration-2 transition-all">Daniel</span> & <span className="underline decoration-1 underline-offset-4 hover:decoration-2 transition-all">Ananiya</span>, the designer-developer duo behind Koba Studio. We partner only with founders and teams we truly believe in. From day one, we work side by side with you so your vision never gets lost in translation. Every detail lands exactly as you dreamed it.
            </p>
            <p className="font-editorial text-[#111] dark:text-[#F3F3F3] leading-[1.65] font-normal tracking-[0.01em] text-[18px] sm:text-[21px] antialiased">
              We’re obsessed with the magic that happens when design and code move in perfect harmony. We jump into bold ideas fast, explore every exciting possibility, and sculpt everything until it feels tight, alive, and unmistakably you.
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

        {/* Row 5: Contact/Vision + Interactive Canvas (Lazy Loaded) */}
        <div className="col-2 py-10 sm:py-14 px-5 sm:px-8 flex flex-col gap-10 transition-colors duration-300 relative">
          <GridLine className="pillar-line-h bottom-0 left-[-2000px] right-[-2000px] h-px text-gray-400 dark:text-neutral-600" dashArray="none" />
          <div className="animate-fade-in flex flex-col gap-6 sm:gap-8 mt-4 md:mt-8">
            <p className="font-editorial text-[#111] dark:text-[#F3F3F3] leading-[1.65] font-normal tracking-[0.01em] text-[18px] sm:text-[21px] antialiased">
              Got something you're excited about? Let's make it real together. <br className="hidden sm:block" />
              <a href="#" className="font-medium text-black dark:text-white underline decoration-[1.5px] underline-offset-4 hover:opacity-70 transition-opacity">hello@koba.studio</a>
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
            <KobaLogo size={40} className="mb-2 opacity-80 hover:opacity-100 transition-opacity" />

            <div className="font-mono text-xs text-black dark:text-white opacity-40 tracking-[0.25em] uppercase">| KOBA STUDIO |</div>
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

        {/* Lazy load Loupe so html-to-image doesn't freeze the boot sequence */}
        <Suspense fallback={null}>
          <LoupeEffect theme={theme} />
        </Suspense>
      </div>
    </div>
  );
}
