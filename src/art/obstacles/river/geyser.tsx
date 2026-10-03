import { ink, tint } from '../../style';
import { clamp01, easeOut, fallen, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { WATER, FOAM, ROCK } from './kit';
import { GEYSER } from './layout';

// ---------- Level 21: geyser launch ----------
// rumble (the springs boil) → blast (the geyser under his rock shoots him up) → land.

function Geyser({ x, dt, h }: { x: number; dt: number; h: number }) {
  if (!(dt >= 0 && dt < 2200)) return null;
  const rise = easeOut(clamp01(dt / 250)) * (1 - clamp01((dt - 1500) / 700));
  const top = -h * rise;
  const w = 34;
  return (
    <g>
      <path
        d={`M${x - w} 10 Q${x - w * 0.6} ${top * 0.5} ${x - w * 0.8} ${top} Q${x} ${top - 40} ${x + w * 0.8} ${top} Q${x + w * 0.6} ${top * 0.5} ${x + w} 10 Z`}
        fill={tint(WATER, 0.4)}
        {...ink(3)}
      />
      <path d={`M${x - 8} 0 V${top + 20}`} stroke={FOAM} strokeWidth={10} strokeLinecap="round" />
      <g fill={FOAM} {...ink(2)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={x + (i - 2) * 22 + 6 * Math.sin(dt / 60 + i)}
            cy={top - 10 + 10 * Math.sin(dt / 80 + i * 2)}
            r={14 + noise(i) * 8}
          />
        ))}
      </g>
    </g>
  );
}

export function GeyserBack(p: ObstacleProps) {
  const [a, b] = GEYSER.pool;
  const rumble = since(p, 'rumble');
  const blast = since(p, 'blast');
  const [v1] = GEYSER.vents;
  // His rock lid rides up with him, then drops back onto the vent.
  const blastAt = eventTime(p.events, 'blast');
  const release = blastAt + 500;
  const lid =
    p.t < blastAt
      ? 30
      : p.t < release
        ? p.heroLift
        : Math.max(30, p.heroAt(release).lift - fallen(p.t - release, 0.003));
  return (
    <g>
      <path
        d={`M${a} 2 Q${(a + b) / 2} 16 ${b} 2 L${b - 20} 60 L${a + 20} 60 Z`}
        fill="#6ec8d8"
        {...ink(3)}
      />
      {/* Steam and bubbles as the springs boil. */}
      {rumble >= 0 &&
        Array.from({ length: 8 }, (_, i) => {
          const cycle = (rumble + i * 190) % 1200;
          return (
            <circle
              key={i}
              cx={a + 40 + i * ((b - a - 80) / 7) + 10 * Math.sin(cycle / 200)}
              cy={-cycle * 0.12}
              r={10 + cycle * 0.03}
              fill="#ffffff"
              opacity={0.5 * (1 - cycle / 1200)}
            />
          );
        })}
      {GEYSER.vents.map((x, i) => (
        <Geyser key={x} x={x} dt={blast - i * 350} h={i === 0 ? 420 : 300} />
      ))}
      <g transform={`translate(${v1} ${-lid + 16})`}>
        <path d="M-56 4 Q-50 -14 0 -16 Q50 -14 56 4 L44 22 L-44 22 Z" fill={ROCK} {...ink(3)} />
        <path d="M-44 -8 Q0 -16 44 -8" stroke={tint(ROCK, 0.4)} strokeWidth={5} fill="none" />
      </g>
    </g>
  );
}
