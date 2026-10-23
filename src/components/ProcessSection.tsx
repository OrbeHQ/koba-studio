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
    desc: 'We map your sitemap to business goals and user journeys, so visitors find what they need without friction.',
  },
  {
    title: 'Content strategy',
    desc: "We write content-first copy that speaks your visitor's language and guides every scroll toward conversion.",
  },
  {
    title: 'Design',
    desc: 'We design interfaces with custom illustration and motion that guide people to their goals.',
  },
  {
    title: 'Development',
    desc: 'We ship with accessibility, SEO, analytics, and lead capture built in — ready to measure from day one.',
  },
  {
    title: 'Continued growth',
    desc: 'We run ongoing experiments on your site, turning more traffic into signups and demos over time.',
  },
];

// One logo color per segment, clockwise from the top — the mark's top-right,
// bottom-right, bottom-left and top-left quadrants, plus a fifth accent.
const SEG_COLORS = ['#2864DC', '#BFD7EA', '#F15A24', '#F6C945', '#E6317A'];

const CX = 200;
const CY = 200;
const R = 172;
const SEG = 360 / STEPS.length;

// Angle in degrees, 0 = top, increasing clockwise.
function polar(angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + R * Math.sin(rad), CY - R * Math.cos(rad)];
}

// Segments meet end-to-end with butt caps, so the junctions are invisible
// and the ring reads as one clean circle that changes color as it fills.
function segmentPath(i: number): string {
  const start = i * SEG;
  const end = (i + 1) * SEG;
  const [sx, sy] = polar(start);
  const [ex, ey] = polar(end);
  return `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${R} ${R} 0 0 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

const SEG_D = STEPS.map((_, i) => segmentPath(i));

function StepContent({ index }: { index: number }) {
  const step = STEPS[index];
  return (
    <>
      <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center text-[13px] font-sans mb-4 text-black dark:text-white">
        {index + 1}
      </div>
      <h3 className="font-sans font-medium text-[22px] sm:text-[24px] leading-[1.1] tracking-[-0.02em] text-black dark:text-white mb-3">
        {step.title}
      </h3>
      <p className="font-sans text-[13px] sm:text-[14px] leading-[1.6] tracking-[-0.005em] text-black/60 dark:text-white/60">
        {step.desc}
      </p>
    </>
  );
}

export default function ProcessSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<Array<SVGPathElement | null>>([]);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const segs = segRefs.current;
    if (!section || segs.some((s) => !s)) return;

    gsap.set(segs, { strokeDasharray: 100, strokeDashoffset: 100 });

    // Font loading shifts layout — recalc pin positions once fonts are ready.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    let lastIdx = -1;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const idx = Math.min(
              STEPS.length - 1,
              Math.floor(self.progress * STEPS.length + 1e-6)
            );
            if (idx !== lastIdx) {
              lastIdx = idx;
              setActive(idx);
            }
          },
        },
      });
      STEPS.forEach((_, i) => {
        // Reveal segment i across its fifth of the scroll.
        tl.fromTo(
          segs[i],
          { strokeDashoffset: 100 },
          { strokeDashoffset: 0, ease: 'none', duration: 1 },
          i
        );
      });
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
      <div className="relative w-[min(110vw,400px)] aspect-square select-none">
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-0 w-full h-full"
          fill="none"
          aria-hidden="true"
        >
          {/* base track */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            stroke="currentColor"
            strokeWidth="1.25"
            className="text-black/10 dark:text-white/10"
          />
          {/* progress segments — revealed one fifth of scroll each */}
          {SEG_D.map((d, i) => (
            <path
              key={i}
              ref={(el) => {
                segRefs.current[i] = el;
              }}
              d={d}
              pathLength={100}
              stroke={SEG_COLORS[i]}
              strokeWidth="3.5"
              strokeLinecap="butt"
            />
          ))}
        </svg>

        {/* Centered step content.
            The tallest step renders invisibly to lock the box height, so
            switching steps never shifts layout — only a soft crossfade. */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[min(72vw,250px)] relative">
            <div className="invisible flex flex-col items-center text-center" aria-hidden="true">
              <StepContent index={0} />
            </div>
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                aria-hidden={active !== i}
                className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  active === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <StepContent index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
