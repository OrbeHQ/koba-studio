import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Use quickTo for high-performance following with lag
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

    // Internal state tracking
    let isMetaPressed = false;
    let isHoveringHideZone = false;
    let hasMoved = false;

    const updateVisibility = () => {
      const shouldHide = isMetaPressed || isHoveringHideZone;
      gsap.to(cursor, {
        opacity: shouldHide ? 0 : 1,
        scale: shouldHide ? 0.5 : 1,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const moveCursor = (e: MouseEvent) => {
      // Smart detection: Hide if hovering over an element with data-hide-cursor="true"
      const target = e.target as HTMLElement;
      const zones = !!target.closest('[data-hide-cursor="true"]');

      if (!hasMoved) {
        hasMoved = true;
        // Snap directly for the first frame to avoid gliding from (0,0)
        gsap.set(cursor, { x: e.clientX - 5, y: e.clientY - 5 });
        isHoveringHideZone = zones;
        updateVisibility();
      }

      // Offset by half the width/height to center the 10x10 square (5px offset)
      xTo(e.clientX - 5);
      yTo(e.clientY - 5);

      if (zones !== isHoveringHideZone) {
        isHoveringHideZone = zones;
        updateVisibility();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta') {
        isMetaPressed = true;
        updateVisibility();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Meta') {
        isMetaPressed = false;
        updateVisibility();
      }
    };

    const handleMouseEnter = () => {
      // We don't force it visible here, just update state if needed
      updateVisibility();
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { opacity: 0, duration: 0.3 });
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Initial state: Start invisible and only show on first move to prevent "flicker"
    gsap.set(cursor, { opacity: 0, scale: 0.5 });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      id="custom-cursor"
      ref={cursorRef}
      className="fixed top-0 left-0 w-2.5 h-2.5 bg-black dark:bg-[#F5F5F5] rounded-[2px] pointer-events-none z-[2147483647] shadow-sm"
      style={{
        willChange: 'transform',
        zIndex: 2147483647 // Browser maximum z-index
      }}
    />
  );
}
