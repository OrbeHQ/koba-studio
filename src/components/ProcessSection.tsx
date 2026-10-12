import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Step {
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  {
    title: 'Website architecture',
    desc: 'We structure your sitemap and information architecture around your business goals, user journeys, and conversion paths, so developers can find what they need without friction.',
  },
  {
    title: 'Content strategy',
    desc: 'We craft content-first copy for your site, guiding visitors toward conversion.',
  },
  {
    title: 'Design',
    desc: 'We shape an interface that guides people toward their goals, with custom illustration and motion tailored to your brand.',
  },
  {
    title: 'Development',
    desc: 'We ship your site with accessibility, SEO, analytics, and lead capture built in, ready to convert and be measured from day one.',
  },
  {
    title: 'Continued growth',
    desc: 'We run ongoing experiments on your site, turning more traffic into signups and demos over time.',
  },
];

// A 4-lobe clover = four overlapping circles in a 2x2 grid. The union outline
// walks each circle's OUTER 270° arc, joining consecutive lobes at their
// far-side intersection points (no connecting segments needed). 1000x1000 box.
const R = 320;
const CENTER = 500;
const LOBES: Array<[number, number]> = [
  [340, 340], // top-left
  [660, 340], // top-right
  [660, 660], // bottom-right
  [340, 660], // bottom-left
];

// Far-side intersection of two equal circles (the one distant from the middle).
function farIntersection(
  c1: [number, number],
  c2: [number, number]
): [number, number] {
  const [x1, y1] = c1;
  const [x2, y2] = c2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const a = dist / 2;
  const h = Math.sqrt(R * R - a * a);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const ux = -dy / dist;
  const uy = dx / dist;
  const p1: [number, number] = [mx + ux * h, my + uy * h];
  const p2: [number, number] = [mx - ux * h, my - uy * h];
  const far = (p: [number, number]) =>
    Math.hypot(p[0] - CENTER, p[1] - CENTER);
  return far(p1) > far(p2) ? p1 : p2;
}

function buildCloverPath(): string {
  // joins[i] sits between lobe i and lobe i+1.
  const joins = LOBES.map((_, i) =>
    farIntersection(LOBES[i], LOBES[(i + 1) % LOBES.length])
  );

  let d = '';
  for (let i = 0; i < LOBES.length; i++) {
    const enter = joins[(i + LOBES.length - 1) % LOBES.length];
    const exit = joins[i];
    if (i === 0) d += `M ${enter[0].toFixed(2)} ${enter[1].toFixed(2)} `;
    else d += `L ${enter[0].toFixed(2)} ${enter[1].toFixed(2)} `;
    // Outer arc is 270° → large-arc-flag 1, clockwise → sweep-flag 1.
    d += `A ${R} ${R} 0 1 1 ${exit[0].toFixed(2)} ${exit[1].toFixed(2)} `;
  }
  return d + 'Z';
}

const CLOVER_D = buildCloverPath();

export default function ProcessSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const path = pathRef.current;
    const section = sectionRef.current;
    if (!path || !section) return;

    const total = path.getTotalLength();
    gsap.set(path, { strokeDasharray: total, strokeDashoffset: total });

    // Font loading shifts layout — recalc pin positions once fonts are ready.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=320%',
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            const idx = Math.min(
              STEPS.length - 1,
              Math.floor(self.progress * STEPS.length + 1e-6)
            );
            setActive(idx);
          },
        },
      });
      tl.to(path, { strokeDashoffset: 0, ease: 'none' });
    }, section);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
    >
      {/* Clover outline + scroll-driven progress stroke */}
      <svg
        viewBox="0 0 1000 1000"
        className="w-[min(92vw,86vh)] h-[min(92vw,86vh)] select-none"
        fill="none"
        aria-hidden="true"
      >
        {/* base track */}
        <path
          d={CLOVER_D}
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-black/12 dark:text-white/12"
        />
        {/* progress fill */}
        <path
          ref={pathRef}
          d={CLOVER_D}
          stroke="#8CD46A"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>

      {/* Centered step content, cross-fading between steps */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[min(80vw,460px)] min-h-[260px]">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              aria-hidden={active !== i}
              className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-500 ${
                active === i ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="w-9 h-9 rounded-full border border-current flex items-center justify-center text-[14px] font-sans mb-6 text-black dark:text-white">
                {i + 1}
              </div>
              <h3 className="font-sans font-medium text-[30px] sm:text-[38px] leading-[1.05] tracking-[-0.02em] text-black dark:text-white mb-4">
                {step.title}
              </h3>
              <p className="font-sans text-[15px] sm:text-[16px] leading-[1.55] tracking-[-0.005em] text-black/60 dark:text-white/60 max-w-[400px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
