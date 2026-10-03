import { ink, shade, tint } from '../../style';
import { bump, clamp01, easeOut, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { MUSHROOMS } from './layout';

// ---------- Level 14: mushroom bounce ----------
// bubble (the path turns to bubbling mud) → b1..b3 (he bounces off each mushroom).

export function MushroomBounceBack(p: ObstacleProps) {
  const [a, b] = MUSHROOMS.bog;
  const bubble = since(p, 'bubble');
  const mud = '#6b4a2e';
  const rise = bubble < 0 ? 0 : easeOut(clamp01(bubble / 700));
  return (
    <g>
      <path
        d={`M${a} -2 Q${a + 30} ${-12 * rise} ${a + 80} ${-10 * rise} L${b - 80} ${-10 * rise} Q${b - 30} ${-12 * rise} ${b} -2 L${b} 40 L${a} 40 Z`}
        fill={mud}
        {...ink(3)}
      />
      <path d={`M${a + 60} ${4 - 10 * rise} H${b - 60}`} stroke={tint(mud, 0.25)} strokeWidth={4} />
      {bubble >= 0 &&
        Array.from({ length: 7 }, (_, i) => {
          const cycle = (bubble + i * 170) % 900;
          const x = a + 80 + i * ((b - a - 160) / 6);
          const r = 6 + cycle * 0.012;
          return cycle < 700 ? (
            <circle
              key={i}
              cx={x}
              cy={-10 * rise - r * 0.6}
              r={r}
              fill={tint(mud, 0.3)}
              {...ink(2)}
            />
          ) : null;
        })}
      {MUSHROOMS.caps.map((x, i) => {
        const dt = since(p, `b${i + 1}`);
        const squash = bump(dt, 300);
        const top = -MUSHROOMS.capTop + 16 * squash;
        const color = ['#e0503c', '#e8743b', '#c04a8a'][i]!;
        return (
          <g key={x}>
            <path
              d={`M${x - 16} 20 L${x - 12} ${top + 6} L${x + 12} ${top + 6} L${x + 16} 20 Z`}
              fill="#f3e6cf"
              {...ink(3)}
            />
            <g
              transform={`translate(${x} ${top}) scale(${1 + 0.18 * squash} ${1 - 0.18 * squash})`}
            >
              <path
                d="M-80 16 Q-78 -58 0 -62 Q78 -58 80 16 Q0 4 -80 16 Z"
                fill={color}
                {...ink(3.5)}
              />
              <path d="M20 -58 Q72 -50 80 16 Q50 8 30 8 Z" fill={shade(color, 0.3)} />
              <g fill="#fff6e0" {...ink(1.5)}>
                <circle cx={-40} cy={-24} r={11} />
                <circle cx={0} cy={-42} r={9} />
                <circle cx={36} cy={-18} r={10} />
              </g>
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
