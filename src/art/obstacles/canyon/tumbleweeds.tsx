import { memo } from 'react';
import { INK, PROP_IN as IN, PROP_OUT as OUT } from '../../style';
import { Saguaro } from '../../worlds/canyon';
import { clamp01, noise, rollAngle, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { SAND, SAND_SHADE } from './kit';
import { TUMBLEWEEDS } from './layout';
import { SandBurst, SandStreaks } from './parts';

// ---------- Level 36: tumbleweeds ----------
// wind (a gale gets up and giant tumbleweeds come bouncing) → j1..j3 (each rolls under him at
// the top of his jump; the third is the biggest of all).

const TWIG = '#a8783e';
const TWIG_LIGHT = '#d8ac68';
const TWIG_DARK = '#6a4628';

/** A tumbleweed of radius r (lined): a ball of curly twigs, darker inside, lit on its top. */
const Tumbleweed = memo(function Tumbleweed({ r }: { r: number }) {
  // A twiggy outline: bumps and spikes all the way round.
  const n = 26;
  let edge = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m = r * (1 + (i % 2 ? 0.07 : -0.03) + 0.05 * (noise(i, 3) - 0.5));
    edge += `${i ? 'L' : 'M'}${(Math.cos(a) * m).toFixed(1)} ${(Math.sin(a) * m).toFixed(1)}`;
  }
  const curls = Array.from({ length: 16 }, (_, i) => {
    const a = noise(i, 5) * Math.PI * 2;
    const d = r * (0.2 + 0.6 * noise(i, 7));
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    const s = r * (0.25 + 0.25 * noise(i, 9));
    return `M${(x - s).toFixed(1)} ${y.toFixed(1)} q${s.toFixed(1)} ${(-s).toFixed(1)} ${(2 * s).toFixed(1)} 0 q${(-s * 0.4).toFixed(1)} ${(s * 0.6).toFixed(1)} ${(-s).toFixed(1)} ${(s * 0.3).toFixed(1)}`;
  });
  return (
    <g>
      <path d={edge} fill={TWIG_DARK} opacity={0.35} />
      <path
        d={curls.join('')}
        stroke={TWIG_DARK}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={curls.slice(0, 10).join('')}
        stroke={TWIG}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
        transform={`translate(${r * 0.06} ${-r * 0.06})`}
      />
      <path d={edge} fill="none" stroke={TWIG} strokeWidth={5} />
      <path d={edge} fill="none" stroke={INK} strokeWidth={OUT} opacity={0.9} />
      <path
        d={curls.slice(10).join('')}
        stroke={TWIG_LIGHT}
        strokeWidth={IN + 1}
        fill="none"
        strokeLinecap="round"
        transform={`translate(${r * 0.1} ${-r * 0.3})`}
      />
    </g>
  );
});

/** How long each jump takes (the scripts' jumps), to find its top. */
const JUMP_MS = [550, 550, 700];

export function TumbleweedsBack(p: ObstacleProps) {
  const wind = since(p, 'wind');
  return (
    <g>
      <Saguaro x={1180} y={-14} h={120} />
      <Saguaro x={-240} y={-14} h={90} flip />
      <SandStreaks t={p.t} strength={clamp01(wind / 600)} dir={-1} />
    </g>
  );
}

export function TumbleweedsFront(p: ObstacleProps) {
  if (since(p, 'wind') < 0) return null;
  return (
    <g>
      {TUMBLEWEEDS.radii.map((r, i) => {
        const jumpAt = eventTime(p.events, `j${i + 1}`);
        // It rolls in from the right and is right under him at the top of his jump.
        const apex = jumpAt + JUMP_MS[i]! / 2;
        const at = p.heroAt(apex).x;
        const x = at + TUMBLEWEEDS.speed * (apex - p.t);
        if (x > 2400 || x < -900) return null;
        // On the ground at the top of his jump, so he clears it.
        const phase = (p.t - apex) / 190;
        const bounce = 34 * Math.abs(Math.sin(phase));
        // A puff of sand each time it hits the ground.
        const hitAgo = ((((phase % Math.PI) + Math.PI) % Math.PI) / Math.PI) * 190 * Math.PI;
        return (
          <g key={i}>
            <ellipse
              cx={x}
              cy={2}
              rx={r * (0.9 - bounce / 200)}
              ry={6}
              fill={SAND_SHADE}
              opacity={0.5}
            />
            <SandBurst x={x} y={-2} dt={hitAgo} size={0.25 + r / 400} ms={300} fill={SAND} />
            <g
              transform={`translate(${x.toFixed(1)} ${(-r - bounce).toFixed(1)}) rotate(${(-rollAngle(apex - p.t, r) * TUMBLEWEEDS.speed).toFixed(1)})`}
            >
              <Tumbleweed r={r} />
            </g>
          </g>
        );
      })}
    </g>
  );
}
