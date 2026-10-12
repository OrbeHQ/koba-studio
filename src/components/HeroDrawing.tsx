// Hero blueprint: the Orbe construction drawing, traced live like a CNC
// plotter. Strokes draw on in sequence (grid → dimensions → construction
// circles → ghost mark → final mark), then the registration dots pop in.
// Pure SVG + CSS, no WebGL, plays once on mount.

const GRID_D =
  'M0 100V0H100M40 0V100M80 0V100M0 40H100M0 80H100';

const GHOST_DS = [
  'M100 0H87.4915V16.9396C77.9935 6.16979 64.3259 0 49.9661 0V12.5085C70.6908 12.5085 87.4915 29.3093 87.4915 50.0341H100V0Z',
  'M100 49.9502H87.4915V66.8898C77.9935 56.12 64.3259 49.9502 49.9661 49.9502V62.4587C70.6908 62.4587 87.4915 79.2595 87.4915 99.9843H100V49.9502Z',
  'M0 0H12.5085V16.9396C22.0065 6.16979 35.6741 0 50.0339 0V12.5085C29.3092 12.5085 12.5085 29.3093 12.5085 50.0341H0V0Z',
  'M0 49.9502H12.5085V66.8898C22.0065 56.12 35.6741 49.9502 50.0339 49.9502V62.4587C29.3092 62.4587 12.5085 79.2595 12.5085 99.9843H0V49.9502Z',
];

const DIMS_D =
  'M0 50H100M0 16H100M0 12H100M0 66H100M0 62H100M50 0V100M88 0V100M12 0V100M0 0H100V100H0V0Z';

const MARK_D =
  'M50 0C64.3 0 78 6.2 87.5 16.9V0H100V50M50 0V12.5M50 0C35.7 0 22 6.2 12.5 16.9V0H0V50M50 12.5C70.7 12.5 87.5 29.3 87.5 50M50 12.5C29.3 12.5 12.5 29.3 12.5 50M87.5 50H100M87.5 50V66.9C78 56.1 64.3 50 50 50M100 50V100H87.5C87.5 79.3 70.7 62.5 50 62.5M50 50V62.5M50 50C35.7 50 22 56.1 12.5 66.9V50M50 62.5C29.3 62.5 12.5 79.3 12.5 100H0V50M12.5 50H0';

const CIRCLES_D =
  'M99.9998 50.1C99.9998 77.8 77.5998 100.2 49.8998 100.2C22.1998 100.2 -0.200195 77.8 -0.200195 50.1C-0.200195 22.4 22.1998 0 49.8998 0C77.5998 0 99.9998 22.4 99.9998 50.1ZM99.9998 100C99.9998 127.7 77.5998 150.2 49.8998 150.2C22.1998 150.2 -0.200195 127.7 -0.200195 100C-0.200195 72.4 22.1998 49.9 49.8998 49.9C77.5998 49.9 99.9998 72.4 99.9998 100.8ZM88.2998 50.9C88.2998 72 71.0998 89.2 49.9998 89.2C28.7998 89.2 11.5998 72 11.5998 50.9C11.5998 29.7 28.7998 12.5 49.9998 12.5C71.0998 12.5 88.2998 29.7 88.2998 50.9ZM88.2998 100.8C88.2998 122 71.0998 139.2 49.9998 139.2C28.7998 139.2 11.5998 122 11.5998 100.8C11.5998 79.6 28.7998 62.5 49.9998 62.5C71.0998 62.5 88.2998 79.6 88.2998 100.8Z';

const DOTS: Array<[number, number]> = [
  [0, 0],
  [0, 100],
  [100, 0],
  [100, 100],
];

function drawStyle(delay: number, duration: number): React.CSSProperties {
  return { animationDuration: `${duration}s`, animationDelay: `${delay}s` };
}

export default function HeroDrawing({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const dark = theme === 'dark';
  const grid = dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.15)';
  const ghost = dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.15)';
  const dims = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.25)';
  const mark = dark ? '#C9C9C9' : '#666666';
  const circles = dark ? 'rgba(201,201,201,0.35)' : 'rgba(102,102,102,0.3)';
  const dot = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full block"
      fill="none"
      role="img"
      aria-label="Orbe mark construction drawing"
    >
      {/* faint layout grid */}
      <path
        d={GRID_D}
        stroke={grid}
        strokeWidth="0.5"
        pathLength={100}
        className="cnc-draw"
        style={drawStyle(0, 0.45)}
      />
      {/* dimension lines */}
      <path
        d={DIMS_D}
        stroke={dims}
        strokeWidth="0.5"
        pathLength={100}
        className="cnc-draw"
        style={drawStyle(0.3, 0.45)}
      />
      {/* construction circles */}
      <path
        d={CIRCLES_D}
        stroke={circles}
        strokeWidth="0.75"
        pathLength={100}
        className="cnc-draw"
        style={drawStyle(0.6, 0.8)}
      />
      {/* ghost mark outlines */}
      {GHOST_DS.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={ghost}
          strokeWidth="0.75"
          pathLength={100}
          className="cnc-draw"
          style={drawStyle(0.9 + i * 0.12, 0.6)}
        />
      ))}
      {/* final mark strokes */}
      <path
        d={MARK_D}
        stroke={mark}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        className="cnc-draw"
        style={drawStyle(1.4, 1.2)}
      />
      {/* registration dots */}
      {DOTS.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="2"
          fill={dot}
          className="cnc-pop"
          style={{ animationDelay: `${2.4 + i * 0.08}s` }}
        />
      ))}
    </svg>
  );
}
