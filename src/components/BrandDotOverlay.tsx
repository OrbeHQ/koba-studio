import { useRef, useEffect } from 'react';

// --- Noise utilities (same algo as the main DotGridShader) ---

function hash(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7 + 1.0) * 43758.5453;
  return h - Math.floor(h);
}

function valueNoise(px: number, py: number): number {
  const ix = Math.floor(px);
  const iy = Math.floor(py);
  const fx = px - ix;
  const fy = py - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/**
 * Returns the left/right boundaries of the center content column,
 * matching the App grid: 32px | 1fr | 32px → 64px | 1fr | 64px → 1fr | 500px | 1fr
 */
function getGutterBounds(w: number): { left: number; right: number } {
  // Ensure dots are strictly drawn OUTSIDE the outermost solid grid lines
  const SAFE_OFFSET = 15; 
  if (w >= 768) {
    // Outer pillar on md is at calc(50% - 262px)
    const margin = (w / 2) - 262 - SAFE_OFFSET;
    return { left: Math.max(0, margin), right: Math.min(w, w - margin) };
  } else if (w >= 640) {
    // Outer pillar on sm is at 52px
    return { left: 52 - SAFE_OFFSET, right: w - (52 - SAFE_OFFSET) };
  }
  // Outer pillar on base is at 20px
  return { left: 20 - SAFE_OFFSET, right: w - (20 - SAFE_OFFSET) };
}

// --- Component ---

interface Props {
  color: string | null;
  theme: 'light' | 'dark';
}

export default function BrandDotOverlay({ color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const state = useRef({
    active: false,
    targetR: 0,
    targetG: 0,
    targetB: 0,
    currentR: 0,
    currentG: 0,
    currentB: 0,
    opacity: 0,
    startTime: 0,
    patternSeed: 0,       // randomised on every hover to shift the noise pattern
    lastColor: null as string | null,
    w: 0,
    h: 0,
    dpr: 1,
    animId: 0,
  });

  // Update targets without re-mounting the loop
  useEffect(() => {
    const s = state.current;
    s.active = !!color;
    if (color) {
      const [r, g, b] = hexToRgb(color);
      s.targetR = r;
      s.targetG = g;
      s.targetB = b;
      // New brand or re-hover → fresh random pattern
      if (color !== s.lastColor || !s.active) {
        s.patternSeed = Math.random() * 1000;
      }
      s.lastColor = color;
    }
  }, [color]);

  // Single animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = state.current;
    s.startTime = performance.now();

    function resize() {
      s.dpr = Math.min(window.devicePixelRatio, 2);
      s.w = window.innerWidth;
      s.h = window.innerHeight;
      canvas!.width = s.w * s.dpr;
      canvas!.height = s.h * s.dpr;
      canvas!.style.width = s.w + 'px';
      canvas!.style.height = s.h + 'px';
    }

    resize();
    window.addEventListener('resize', resize);

    function draw(now: number) {
      if (s.w < 768) {
        s.animId = requestAnimationFrame(draw);
        return;
      }

      const elapsed = (now - s.startTime) / 1000;

      // Fast, smooth fade
      const opTarget = s.active ? 1 : 0;
      s.opacity += (opTarget - s.opacity) * 0.15;

      // Snappy color lerp
      s.currentR += (s.targetR - s.currentR) * 0.18;
      s.currentG += (s.targetG - s.currentG) * 0.18;
      s.currentB += (s.targetB - s.currentB) * 0.18;

      if (s.opacity < 0.003 && !s.active) {
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        s.animId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      const r = Math.round(s.currentR);
      const g = Math.round(s.currentG);
      const b = Math.round(s.currentB);

      // Dots are only in the gutters — no content interference — so we can go bold
      ctx.globalAlpha = s.opacity * 0.7;
      ctx.fillStyle = `rgb(${r},${g},${b})`;

      const spacing = 20;
      const cols = Math.ceil(s.w / spacing) + 1;
      const rows = Math.ceil(s.h / spacing) + 1;
      const t = elapsed * 0.15;
      const seed = s.patternSeed;   // shifts the entire noise field per-hover
      const aspect = s.w / s.h;
      const dpr = s.dpr;

      // Content column boundaries — only draw OUTSIDE this
      const bounds = getGutterBounds(s.w);

      ctx.beginPath();

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const vx = col * spacing;
          const vy = row * spacing;

          // ONLY draw in the left and right gutters
          if (vx >= bounds.left && vx <= bounds.right) continue;

          const px = vx * dpr;
          const py = vy * dpr;

          const nx = (col / cols) * aspect;
          const ny = row / rows;

          // FBM noise — offset by patternSeed for a fresh look each hover
          const n1 = valueNoise(nx * 1.5 + t * 0.8 + seed, ny * 1.5 + t * 0.5 + seed * 0.7);
          const n2 = valueNoise(nx * 3.5 - t * 0.5 + seed * 1.3, ny * 3.5 - t * 0.7 + seed * 0.4);
          const n3 = valueNoise(nx * 7.0 - t * 0.3 + seed * 0.9, ny * 7.0 + t * 0.4 + seed * 1.1);
          const field = n1 * 0.6 + n2 * 0.3 + n3 * 0.1;

          // Three strict size plateaus
          let size: number;
          if (field < 0.40) size = 1.2;
          else if (field < 0.55) size = 3.8;
          else size = 7.0;

          // Per-dot breathing
          const phase = hash(col * 0.3, row * 0.3) * 6.283;
          size += Math.sin(elapsed * 1.2 + phase) * 0.35;
          size = Math.max(0.5, size) * dpr;

          const half = size / 2;
          ctx.rect(px - half, py - half, size, size);
        }
      }

      ctx.fill();
      ctx.globalAlpha = 1;

      s.animId = requestAnimationFrame(draw);
    }

    s.animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(s.animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hidden md:block fixed inset-0 pointer-events-none"
      style={{ zIndex: 40 }}
    />
  );
}
