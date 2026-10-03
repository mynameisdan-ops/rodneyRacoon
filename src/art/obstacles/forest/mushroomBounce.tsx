import { memo, useId } from 'react';
import { ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { PAINTED_FOREST } from '../../worlds/forestPalette';
import { bump, clamp01, easeOut, lerp, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { MUSHROOMS } from './layout';

// ---------- Level 14: mushroom bounce ----------
// bubble (the path turns to bubbling mud) → b1..b3 (he bounces off each mushroom).

const P = PAINTED_FOREST;

const MUD = '#7a5434';
const CAPS = ['#e0503c', '#e8743b', '#c04a8a'] as const;

/** A mushroom's cap: spots, a shine, its gills underneath (memoized per color). */
const MushroomCap = memo(function MushroomCap({ color }: { color: string }) {
  return (
    <g>
      <path
        d="M-80 16 Q-78 -58 0 -62 Q78 -58 80 16 Q0 4 -80 16 Z"
        fill={color}
        {...ink(OUT + 0.4)}
      />
      <path d="M-80 16 Q-78 -58 -8 -61.5 Q-56 -42 -58 12 Z" fill={shade(color, 0.28)} />
      <path d="M-78 15 Q0 4 78 15 Q0 26 -78 15 Z" fill="#f3e0c4" {...ink(IN)} />
      <path
        d="M-50 13 L-46 19 M-25 10 L-23 18 M0 9 V18 M25 10 L23 18 M50 13 L46 19"
        stroke={shade('#f3e0c4', 0.35)}
        strokeWidth={1.2}
      />
      <g fill="#fff6e0" {...ink(IN)}>
        <circle cx={-40} cy={-24} r={11} />
        <circle cx={0} cy={-42} r={9} />
        <circle cx={36} cy={-18} r={10} />
        <circle cx={62} cy={-2} r={5} />
      </g>
      <path
        d="M22 -54 Q50 -50 64 -32"
        stroke={tint(color, 0.55)}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

/** A mushroom's stem, from the cap down into the mud (memoized: it never moves). */
const MushroomStem = memo(function MushroomStem({ x, top }: { x: number; top: number }) {
  return (
    <g>
      <path
        d={`M${x - 16} 20 L${x - 12} ${top} L${x + 12} ${top} L${x + 16} 20 Z`}
        fill="#f3e6cf"
        {...ink(OUT)}
      />
      <path
        d={`M${x - 16} 20 L${x - 12} ${top} L${x - 4} ${top} L${x - 6} 20 Z`}
        fill={shade('#f3e6cf', 0.2)}
      />
      <path
        d={`M${x + 9} ${top + 6} L${x + 12} 14`}
        stroke="#fffaf0"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </g>
  );
});

export function MushroomBounceBack(p: ObstacleProps) {
  const id = useId();
  const [a, b] = MUSHROOMS.bog;
  const bubble = since(p, 'bubble');
  const rise = bubble < 0 ? 0 : easeOut(clamp01(bubble / 700));
  const s = -10 * rise;
  const mid = (a + b) / 2;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint(MUD, 0.15)} />
          <stop offset="1" stopColor={shade(MUD, 0.45)} />
        </linearGradient>
      </defs>
      {/* The bog (painted): the path darkens into a pool of glossy mud as it starts to bubble,
          with a wet rim, a lighter skin, reflections and grass leaning over its banks. */}
      <g opacity={0.35 + 0.65 * rise}>
        <path
          d={`M${a - 16} 0 Q${a - 6} ${s - 6} ${a + 70} ${s - 4} L${b - 70} ${s - 4} Q${b + 6} ${s - 6} ${b + 16} 0 Q${b + 2} 26 ${b - 96} 30 Q${mid + 110} 40 ${mid} 36 Q${mid - 170} 32 ${a + 96} 32 Q${a - 4} 26 ${a - 16} 0 Z`}
          fill={shade(P.groundDark, 0.15)}
        />
        <path
          d={`M${a} -2 Q${a + 30} ${s * 1.2} ${a + 80} ${s} L${b - 80} ${s} Q${b - 30} ${s * 1.2} ${b} -2 Q${b - 10} 18 ${b - 90} 22 Q${mid + 110} 31 ${mid} 28 Q${mid - 160} 24 ${a + 90} 24 Q${a + 8} 18 ${a} -2 Z`}
          fill={`url(#${id})`}
        />
      </g>
      <path
        d={`M${a + 60} ${s + 3} H${b - 60}`}
        stroke={tint(MUD, 0.35)}
        strokeWidth={4}
        opacity={0.8 * rise}
      />
      <g stroke="#fff3dc" strokeWidth={2.2} strokeLinecap="round" opacity={0.45 * rise}>
        <path d={`M${a + 130} ${s + 10} h40 M${a + 360} ${s + 14} h28 M${b - 260} ${s + 9} h46`} />
      </g>
      {[a, b].map((x, side) => (
        <g key={side} fill={side ? P.fernLight : P.fern}>
          <path
            d={`M${x - 10} 0 l${side ? -6 : 6} -16 l4 14 Z M${x + 2} 0 l${side ? -3 : 3} -12 l4 11 Z`}
          />
        </g>
      ))}
      <g fill={P.fern}>
        {[0.2, 0.45, 0.7].map((f) => (
          <path key={f} d={`M${lerp(a, b, f)} 30 l-4 -12 l5 10 l3 -14 l3 15 Z`} />
        ))}
      </g>
      {bubble >= 0 &&
        Array.from({ length: 7 }, (_, i) => {
          const cycle = (bubble + i * 170) % 900;
          const x = a + 80 + i * ((b - a - 160) / 6);
          const r = 6 + cycle * 0.012;
          if (cycle >= 700) {
            // A ring where it popped.
            const k = (cycle - 700) / 200;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={s}
                rx={r + 14 * k}
                ry={(r + 14 * k) * 0.3}
                fill="none"
                stroke={tint(MUD, 0.4)}
                strokeWidth={2}
                opacity={1 - k}
              />
            );
          }
          return (
            <g key={i}>
              <circle cx={x} cy={s - r * 0.6} r={r} fill={tint(MUD, 0.28)} />
              <path
                d={`M${x - r * 0.5} ${s - r * 1.1} A${r * 0.7} ${r * 0.7} 0 0 1 ${x + r * 0.3} ${s - r * 1.3}`}
                stroke="#fff3dc"
                strokeWidth={1.8}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      {MUSHROOMS.caps.map((x, i) => {
        const dt = since(p, `b${i + 1}`);
        const squash = bump(dt, 300);
        const top = -MUSHROOMS.capTop + 16 * squash;
        return (
          <g key={x}>
            <MushroomStem x={x} top={-MUSHROOMS.capTop + 6} />
            <g
              transform={`translate(${x} ${top}) scale(${1 + 0.18 * squash} ${1 - 0.18 * squash})`}
            >
              <MushroomCap color={CAPS[i]!} />
            </g>
            {dt >= 0 && dt < 700 && (
              <g fill="#fff6c8" opacity={1 - dt / 700}>
                {[0, 1, 2, 3, 4].map((j) => (
                  <circle
                    key={j}
                    cx={x + (j - 2) * 30 + (j - 2) * dt * 0.05}
                    cy={top - 70 - dt * 0.08 * (1 + noise(j + i))}
                    r={4}
                  />
                ))}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
