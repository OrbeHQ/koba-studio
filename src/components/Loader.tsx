import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface LoaderProps {
  onComplete: () => void;
  onFadeOutStart: () => void;
  theme: 'light' | 'dark';
}

export default function Loader({ onComplete, onFadeOutStart, theme }: LoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Lock scroll while loading
    document.body.style.overflow = 'hidden';

    // Simulated progress loading since shaders need time to compile
    const progressObj = { value: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        onComplete();
      }
    });

    // Animate progress 0 to 100
    tl.to(progressObj, {
      value: 100,
      duration: 0.85,
      ease: "power3.inOut",
      onUpdate: () => {
        setProgress(Math.round(progressObj.value));
      }
    });

    // Exit animation: text fades up, then overlay sweeps violently up
    tl.to(textRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in"
    });

    tl.to(containerRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: "expo.inOut",
      onStart: () => {
        onFadeOutStart();
      }
    }, "-=0.1");

    return () => {
      tl.kill();
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0A0A0A] text-[#EBEBEB]' : 'bg-[#EBEBEB] text-[#1A1A1A]'
        }`}
    >
      <div ref={textRef} className="flex flex-col items-center gap-4">
        {/* Identity */}
        <div className="font-mono text-xs tracking-[0.25em] uppercase opacity-40">
          | ORBE LABS |
        </div>

        {/* Massive Percentage */}
        <div className="font-editorial italic text-7xl sm:text-8xl tabular-nums">
          {progress}%
        </div>
      </div>
    </div>
  );
}
