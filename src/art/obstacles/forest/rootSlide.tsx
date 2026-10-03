import { memo, useId } from 'react';
import { Dust } from '../../fx';
import { INK, ink, shade, tint } from '../../style';
import { PAINTED_FOREST } from '../../worlds/forestPalette';
import { clamp01, fallen, lerp, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { ROOT_SLIDE } from './layout';
import { LeafBurst } from './parts';

// ---------- Level 11: root slide ----------
// crack (the path gives way) → he slides through the root chute → out.

const P = PAINTED_FOREST;

const ROOT = '#6e4630';

const EARTH_TOP = '#6a4630';

const EARTH_DEEP = '#1d120b';

/** A dark cutaway hollow in the earth from a to b, `depth` px deep (painted). */
function Hollow({ a, b, depth }: { a: number; b: number; depth: number }) {
  const id = useId();
  const mid = (a + b) / 2;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={EARTH_TOP} />
          <stop offset="1" stopColor={EARTH_DEEP} />
        </linearGradient>
      </defs>
      <path
        d={`M${a - 10} -2 L${a + 10} ${depth + 50} Q${mid} ${depth + 90} ${b - 10} ${depth + 50} L${b + 10} -2 Z`}
        fill={`url(#${id})`}
      />
      {/* The far wall catches the light; strata run across the earth; roots hang over the edges. */}
      <path
        d={`M${b + 10} -2 L${b - 10} ${depth + 50} L${b - 36} ${depth + 56} L${b - 16} -2 Z`}
        fill={tint(EARTH_TOP, 0.18)}
        opacity={0.6}
      />
      <g
        stroke={shade(EARTH_TOP, 0.35)}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.55}
        fill="none"
      >
        <path d={`M${a + 16} 30 Q${mid} 46 ${b - 16} 30`} />
        <path
          d={`M${a + 24} ${depth * 0.75} Q${mid} ${depth * 0.75 + 18} ${b - 24} ${depth * 0.75}`}
        />
      </g>
      <g stroke="#4a2f1e" strokeWidth={3.5} fill="none" strokeLinecap="round">
        <path d={`M${a - 2} 2 q 10 26 2 50`} />
        <path d={`M${a + 12} 2 q -6 18 6 32`} />
        <path d={`M${b + 2} 2 q -12 28 -2 54`} />
        <path d={`M${mid - 120} 2 q 6 20 -4 36`} />
      </g>
    </g>
  );
}

const COVER = Array.from({ length: 8 }, (_, i) => ({
  x: ROOT_SLIDE.hole[0] + 40 + i * 90,
  delay: Math.abs(i - 1) * 60,
  spin: (noise(i, 7) - 0.5) * 0.5,
}));

function chuteY(x: number) {
  const pts = ROOT_SLIDE.chute;
  for (let i = 1; i < pts.length; i++) {
    const [x0, l0] = pts[i - 1]!;
    const [x1, l1] = pts[i]!;
    if (x <= x1) return -lerp(l0, l1, clamp01((x - x0) / (x1 - x0)));
  }
  return 0;
}

/** The open hollow: the earth, glowing mushrooms and the thick root he slides along. */
const OpenHollow = memo(function OpenHollow() {
  const id = useId();
  const [a, b] = ROOT_SLIDE.hole;
  const chute = ROOT_SLIDE.chute.map(([x, l]) => `${x} ${-l}`).join(' L');
  const glows = ['#8af0ff', '#c8ff8a', '#8af0ff'];
  return (
    <g>
      <defs>
        {glows.map((c, i) => (
          <radialGradient key={i} id={`${id}g${i}`}>
            <stop offset="0" stopColor={c} stopOpacity={0.6} />
            <stop offset="0.45" stopColor={c} stopOpacity={0.2} />
            <stop offset="1" stopColor={c} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      <Hollow a={a} b={b} depth={ROOT_SLIDE.depth} />
      {/* Glowing mushrooms down in the hollow (painted: they glow, he never touches them). */}
      {[300, 520, 740].map((x, i) => {
        const y = chuteY(x) + 44;
        const c = glows[i]!;
        return (
          <g key={x}>
            <ellipse cx={x} cy={y - 8} rx={70} ry={50} fill={`url(#${id}g${i})`} />
            <path
              d={`M${x - 2} ${y} Q${x - 3} ${y - 8} ${x - 1} ${y - 12} L${x + 2} ${y - 12} Q${x + 3} ${y - 6} ${x + 2} ${y} Z`}
              fill="#f4fff0"
            />
            <path
              d={`M${x - 13} ${y - 10} Q${x} ${y - 30} ${x + 13} ${y - 10} Q${x} ${y - 14} ${x - 13} ${y - 10} Z`}
              fill={c}
            />
            <ellipse cx={x + 3} cy={y - 21} rx={4} ry={2} fill="#ffffff" opacity={0.8} />
          </g>
        );
      })}
      {/* The chute: a thick smooth root he slides along, lined like his props. */}
      <g transform="translate(0 15)" fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={`M${chute}`} stroke={INK} strokeWidth={30} />
        <path d={`M${chute}`} stroke={ROOT} strokeWidth={23} />
        <path
          d={`M${chute}`}
          transform="translate(0 6)"
          stroke={shade(ROOT, 0.35)}
          strokeWidth={8}
        />
        <path
          d={`M${chute}`}
          transform="translate(0 -7)"
          stroke={tint(ROOT, 0.4)}
          strokeWidth={4}
        />
      </g>
      {[260, 470, 600, 800].map((x) => (
        <ellipse
          key={x}
          cx={x}
          cy={chuteY(x) + 15}
          rx={9}
          ry={4}
          fill={shade(ROOT, 0.3)}
          {...ink(1.2)}
        />
      ))}
    </g>
  );
});

export function RootSlideBack(p: ObstacleProps) {
  const [a, b] = ROOT_SLIDE.hole;
  const crack = since(p, 'crack');
  return (
    <g>
      {crack >= 0 && <OpenHollow />}
      {/* The path over the hollow, painted like the path, breaking up and falling in. */}
      {COVER.map((c, i) => {
        const dt = crack - c.delay;
        const y = fallen(dt, 0.003);
        if (y > 300) return null;
        return (
          <g key={i} transform={`translate(${c.x} ${y}) rotate(${dt > 0 ? c.spin * dt : 0})`}>
            <path d="M-46 -4 L46 -4 L40 16 L-40 16 Z" fill={EARTH_TOP} />
            <path d="M-46 -4 L46 -4 L45 4 L-45 4 Z" fill={P.path} />
            <path d="M-44 -4 H44" stroke={P.pathLight} strokeWidth={2} />
            <path d="M-30 -4 l3 -8 l3 8 M24 -4 l2 -7 l3 7" fill={P.fernLight} />
          </g>
        );
      })}
      {/* Cracks shooting across the path the moment it gives way. */}
      {crack >= 0 && crack < 300 && (
        <path
          d={`M${a + 40} -2 l40 4 l30 -5 l50 6 l40 -4 l60 5 l50 -6 l70 4`}
          stroke={EARTH_DEEP}
          strokeWidth={3}
          fill="none"
          opacity={1 - crack / 300}
        />
      )}
      <Dust x={(a + b) / 2 - 200} y={-4} dt={crack} ms={800} color="#8a7050" />
      <LeafBurst x={b} y={-20} dt={since(p, 'out')} count={14} />
    </g>
  );
}
