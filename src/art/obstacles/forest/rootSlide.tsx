import { Dust, Glow } from '../../fx';
import { INK, ink, tint } from '../../style';
import { clamp01, fallen, lerp, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { ROOT } from './kit';
import { ROOT_SLIDE } from './layout';
import { LeafBurst, Hollow } from './parts';

// ---------- Level 11: root slide ----------
// crack (the leafy ground gives way) → he slides through the root chute → out.

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

export function RootSlideBack(p: ObstacleProps) {
  const [a, b] = ROOT_SLIDE.hole;
  const crack = since(p, 'crack');
  const open = crack >= 0;
  const chute = ROOT_SLIDE.chute.map(([x, l]) => `${x} ${-l}`).join(' L');
  return (
    <g>
      {open && (
        <g>
          <Hollow a={a} b={b} depth={ROOT_SLIDE.depth} />
          {/* Glowing mushrooms down in the hollow. */}
          {[300, 520, 740].map((x, i) => (
            <g key={x}>
              <Glow x={x} y={chuteY(x) + 40} r={70} color={i % 2 ? '#8af0ff' : '#c8ff8a'} />
              <path
                d={`M${x - 12} ${chuteY(x) + 44} Q${x} ${chuteY(x) + 26} ${x + 12} ${chuteY(x) + 44} Z`}
                fill={i % 2 ? '#8af0ff' : '#c8ff8a'}
                {...ink(2)}
              />
            </g>
          ))}
          {/* The chute: a thick smooth root he slides along. */}
          <path
            d={`M${chute}`}
            stroke={INK}
            strokeWidth={30}
            fill="none"
            strokeLinejoin="round"
            transform="translate(0 15)"
          />
          <path
            d={`M${chute}`}
            stroke={ROOT}
            strokeWidth={24}
            fill="none"
            strokeLinejoin="round"
            transform="translate(0 15)"
          />
          <path
            d={`M${chute}`}
            stroke={tint(ROOT, 0.3)}
            strokeWidth={5}
            fill="none"
            transform="translate(0 8)"
          />
        </g>
      )}
      {/* The leafy ground over the hollow, which falls in when it cracks. */}
      {COVER.map((c, i) => {
        const dt = crack - c.delay;
        const y = fallen(dt, 0.003);
        if (y > 300) return null;
        return (
          <g key={i} transform={`translate(${c.x} ${y}) rotate(${dt > 0 ? c.spin * dt : 0})`}>
            <path d="M-46 -4 L46 -4 L40 14 L-40 14 Z" fill="#4a7a34" {...ink(2.5)} />
            <path
              d="M-40 -4 Q-30 -12 -20 -4 M10 -4 Q20 -14 30 -4"
              stroke="#5e8f45"
              strokeWidth={4}
              fill="none"
            />
          </g>
        );
      })}
      <Dust x={(a + b) / 2 - 200} y={-4} dt={crack} ms={800} color="#8a7050" />
      <LeafBurst x={b} y={-20} dt={since(p, 'out')} count={14} />
    </g>
  );
}
