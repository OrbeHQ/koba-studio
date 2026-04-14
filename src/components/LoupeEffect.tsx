import React, { useEffect, useRef } from 'react';
import { toCanvas } from 'html-to-image';

// Loupe Physical Layout constraints
const LOUPE_W = 280;
const LOUPE_H = Math.round(LOUPE_W * (884 / 899));
const LENS_CX = Math.round(449 * (LOUPE_W / 899));
const LENS_CY = Math.round(437 * (LOUPE_W / 899));
const LENS_R_PX = Math.round(341 * (LOUPE_W / 899));

export default function LoupeEffect({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const diameter = LENS_R_PX * 2;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = diameter * dpr;
    canvas.height = diameter * dpr;
    canvas.style.width = `${diameter}px`;
    canvas.style.height = `${diameter}px`;

    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    let active = false;
    let mx = 0, my = 0;
    let rafId = 0;
    let sourceCanvas: HTMLCanvasElement | null = null;
    let capturing = false;

    const ZOOM = 2.0;
    const BARREL_K = 0.20; // Increased for a healthy lens bulge
    const CHROMA_K = 0.05; // Visible RGB fringe

    // Capture at a higher resolution (super-sampling) so that zooming doesn't look pixelated
    const captureDpr = dpr * 1.5;

    // Capture page to a canvas using html-to-image
    async function capturePage() {
      if (capturing) return;
      capturing = true;

      try {
        // Capture the entire body to ensure fixed/absolute elements like the navbar are included
        const appBody = document.body;
        if (!appBody) return;

        // First, snapshot any WebGL canvases (html-to-image can miss them)
        const webglCanvases = Array.from(appBody.querySelectorAll('canvas'));
        const snapshots: { el: HTMLCanvasElement; url: string; rect: DOMRect }[] = [];
        for (const c of webglCanvases) {
          // Skip the loupe's own canvas and the custom cursor
          if (c.closest('#loupe-container') || c.id === 'custom-cursor') continue;
          try {
            snapshots.push({ el: c, url: c.toDataURL(), rect: c.getBoundingClientRect() });
          } catch { }
        }

        // Capture DOM with a transparent background so we can layer WebGL underneath
        const captured = await toCanvas(appBody, {
          cacheBust: false,
          pixelRatio: captureDpr,
          backgroundColor: 'transparent',
          filter: (node: Node) => {
            if (node instanceof HTMLElement && (node.id === 'loupe-container' || node.id === 'custom-cursor')) return false;
            return true;
          },
        });

        // Create a composite canvas to handle layering
        const composite = document.createElement('canvas');
        composite.width = captured.width;
        composite.height = captured.height;
        const compositeCtx = composite.getContext('2d');
        if (!compositeCtx) return;

        // Layer 1: Draw WebGL background snapshots first
        for (const snap of snapshots) {
          const img = new Image();
          img.src = snap.url;
          await new Promise<void>(resolve => {
            img.onload = () => {
              compositeCtx.drawImage(
                img,
                snap.rect.left * captureDpr,
                (snap.rect.top + window.scrollY) * captureDpr,
                snap.rect.width * captureDpr,
                snap.rect.height * captureDpr
              );
              resolve();
            };
            img.onerror = () => resolve();
          });
        }

        // Layer 2: Draw the DOM on top
        compositeCtx.drawImage(captured, 0, 0);

        sourceCanvas = composite;
      } catch (e) {
        console.error('Loupe capture failed:', e);
      } finally {
        capturing = false;
      }
    }

    // Draw the lens content with barrel distortion, chroma, and realistic glass shading
    function drawLens() {
      if (!sourceCanvas) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = cx;

      // Calculate how many source pixels correspond to the lens radius
      const viewR = maxR * (captureDpr / dpr) / ZOOM;

      // Where on the source are we looking?
      const srcX = (mx + window.scrollX) * captureDpr;
      const srcY = (my + window.scrollY) * captureDpr;

      // Read a padded chunk from the source canvas to allow aggressive outward distortion bleeding
      const pad = 2.4; // Massive padding to safely contain the extreme edge stretch
      const padPix = viewR * pad;
      const srcLeft = Math.floor(srcX - padPix);
      const srcTop = Math.floor(srcY - padPix);
      const srcDiam = Math.ceil(padPix * 2);

      const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
      if (!srcCtx) return;

      // Extract raw image data directly from the zoomed sourceCanvas slice
      const srcData = srcCtx.getImageData(srcLeft, srcTop, srcDiam, srcDiam);
      const src = srcData.data;

      const out = ctx.createImageData(w, h);
      const dst = out.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = (x - cx) / maxR;
          const ny = (y - cy) / maxR;
          const r2 = nx * nx + ny * ny;
          const dstIdx = (y * w + x) * 4;

          if (r2 > 1.0) {
            dst[dstIdx + 3] = 0;
            continue;
          }

          // Use a 4th-power mathematical curve (r^4)
          // This keeps the center 50% of the lens flat, and then begins smoothly
          // bending outwards, giving a thicker realism to the glass
          const edgeCurve = r2 * r2;

          // Stretch begins around 50% and peaks at the rim
          const bd = 1.0 + (0.7 * edgeCurve);
          const bx = nx * bd;
          const by = ny * bd;

          // Chromatic aberration (Prism effect)
          // Massively increased strength (15%) so the RGB separation is extremely visible
          const ch = 0.15 * edgeCurve;

          // Red: outward, Green: center, Blue: inward
          const rx = bx * (1.0 + ch);
          const ry = by * (1.0 + ch);
          const gx = bx;
          const gy = by;
          const bxc = bx * (1.0 - ch);
          const byc = by * (1.0 - ch);

          // Bilinear pixel sampling for smooth, high-fidelity zoom
          const sample = (snx: number, sny: number, c: number): number => {
            const pxX = (srcX - srcLeft) + snx * viewR;
            const pxY = (srcY - srcTop) + sny * viewR;
            const x0 = Math.floor(pxX);
            const y0 = Math.floor(pxY);
            if (x0 < 0 || x0 >= srcDiam - 1 || y0 < 0 || y0 >= srcDiam - 1) return 0;

            const dx = pxX - x0;
            const dy = pxY - y0;

            const p1 = src[(y0 * srcDiam + x0) * 4 + c];
            const p2 = src[(y0 * srcDiam + (x0 + 1)) * 4 + c];
            const p3 = src[((y0 + 1) * srcDiam + x0) * 4 + c];
            const p4 = src[((y0 + 1) * srcDiam + (x0 + 1)) * 4 + c];

            const top = p1 * (1 - dx) + p2 * dx;
            const bot = p3 * (1 - dx) + p4 * dx;
            return top * (1 - dy) + bot * dy;
          };

          dst[dstIdx] = sample(rx, ry, 0);
          dst[dstIdx + 1] = sample(gx, gy, 1);
          dst[dstIdx + 2] = sample(bxc, byc, 2);
          dst[dstIdx + 3] = 255;
        }
      }

      ctx.putImageData(out, 0, 0);

      // --- Realistic Glass Rendering Overlays ---
      ctx.globalCompositeOperation = 'source-over';
      const isDark = document.documentElement.classList.contains('dark');

      // 1. Inner directional shadow (depth)
      const shadowGrad = ctx.createRadialGradient(cx + maxR * 0.2, cy + maxR * 0.2, maxR * 0.4, cx, cy, maxR);
      shadowGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
      shadowGrad.addColorStop(1, isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fill();

      // 2. Glossy Specular Highlight (reflection spot on top left)
      const glareGrad = ctx.createRadialGradient(cx - maxR * 0.35, cy - maxR * 0.35, maxR * 0.02, cx - maxR * 0.35, cy - maxR * 0.35, maxR * 0.35);
      glareGrad.addColorStop(0, isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)');
      glareGrad.addColorStop(0.2, isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.2)');
      glareGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glareGrad;
      ctx.fill();

      // 3. Ambient rim light 
      const rimGrad = ctx.createRadialGradient(cx, cy, maxR * 0.9, cx, cy, maxR);
      rimGrad.addColorStop(0, 'rgba(255,255,255,0)');
      rimGrad.addColorStop(1, isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.15)');
      ctx.fillStyle = rimGrad;
      ctx.fill();
    }

    function update() {
      rafId = 0;
      if (!active) return;
      root.style.transform = `translate3d(${mx - LENS_CX}px, ${my - LENS_CY}px, 0)`;
      drawLens();
      rafId = requestAnimationFrame(update);
    }

    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
      if (active && !rafId) rafId = requestAnimationFrame(update);
    }

    async function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Meta' && !active) {
        active = true;
        document.body.style.cursor = 'none';
        root.style.opacity = '1';
        await capturePage();
        if (active && !rafId) rafId = requestAnimationFrame(update);
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'Meta') {
        active = false;
        document.body.style.cursor = '';
        root.style.opacity = '0';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sourceCanvas = null;
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('keyup', onKeyUp, { capture: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('keyup', onKeyUp, { capture: true });
      document.body.style.cursor = '';
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const diameter = LENS_R_PX * 2;

  return (
    <div
      id="loupe-container"
      ref={rootRef}
      className="fixed top-0 left-0 pointer-events-none z-100"
      style={{ width: LOUPE_W, height: LOUPE_H, opacity: 0, willChange: 'transform' }}
    >
      <div
        style={{
          position: 'absolute',
          top: `${LENS_CY - LENS_R_PX}px`,
          left: `${LENS_CX - LENS_R_PX}px`,
          width: `${diameter}px`,
          height: `${diameter}px`,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', borderRadius: '50%' }}
        />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)',
          pointerEvents: 'none',
        }} />
      </div>

      <img
        src="/loupe.svg"
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full select-none"
        style={{ filter: theme === 'dark' ? 'brightness(0.9) contrast(1.1)' : 'none' }}
      />
    </div>
  );
}
