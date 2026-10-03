import { Dust } from '../../fx';
import { ink, shade } from '../../style';
import { fallen, lerp, noise, rollAngle, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { STONE, SNOW } from './kit';
import { ROCK_SLIDE } from './layout';

// ---------- Level 25: rock slide ----------
// rumble → slide (rocks bounce down the mountain; he dives under the overhang) → clear.

const DARK = '#5e5a66';

/** A chunky mountain rock with a snowy top, `s` px across, resting at (0, 0). */
function Boulder({ s, snow = true }: { s: number; snow?: boolean }) {
  const k = s / 60;
  return (
    <g transform={`scale(${k})`}>
      <path d="M-30 0 L-26 -30 L-6 -44 L20 -38 L30 -12 L28 0 Z" fill={STONE} {...ink(3 / k)} />
      <path d="M20 -38 L30 -12 L28 0 L8 0 Z" fill={shade(STONE, 0.3)} />
      {snow && <path d="M-26 -30 L-6 -44 L20 -38 L12 -32 L-4 -36 L-18 -26 Z" fill={SNOW} />}
    </g>
  );
}

const SLIDE_ROCKS = Array.from({ length: 9 }, (_, i) => ({
  delay: i * 170,
  size: 36 + noise(i, 3) * 40,
  hop: 2 + (i % 3),
}));

export function RockSlideBack(p: ObstacleProps) {
  const [o0, o1] = ROCK_SLIDE.overhang;
  const rumble = since(p, 'rumble');
  const slide = since(p, 'slide');
  return (
    <g>
      {/* The overhang: a shelf of rock jutting out from the mountainside behind the path. */}
      <path
        d={`M${o0 - 40} ${-ROCK_SLIDE.roof - 10} Q${o0} ${-ROCK_SLIDE.roof - 40} ${(o0 + o1) / 2} ${-ROCK_SLIDE.roof - 30} Q${o1 + 20} ${-ROCK_SLIDE.roof - 60} ${o1 + 120} ${-ROCK_SLIDE.roof - 140} L${o1 + 160} 4 L${o1 + 60} 4 Q${o1 + 20} ${-ROCK_SLIDE.clear} ${o1 - 30} ${-ROCK_SLIDE.clear} L${o0} ${-ROCK_SLIDE.clear} Q${o0 - 50} ${-ROCK_SLIDE.clear - 20} ${o0 - 40} ${-ROCK_SLIDE.roof - 10} Z`}
        fill={DARK}
        {...ink(3.5)}
      />
      <path
        d={`M${o0 - 30} ${-ROCK_SLIDE.roof - 16} Q${o0 + 20} ${-ROCK_SLIDE.roof - 44} ${(o0 + o1) / 2} ${-ROCK_SLIDE.roof - 34} Q${o1} ${-ROCK_SLIDE.roof - 56} ${o1 + 100} ${-ROCK_SLIDE.roof - 130} L${o1 + 80} ${-ROCK_SLIDE.roof - 100} Q${o1} ${-ROCK_SLIDE.roof - 36} ${(o0 + o1) / 2} ${-ROCK_SLIDE.roof - 18} Z`}
        fill={SNOW}
      />
      <path
        d={`M${o0 + 10} ${-ROCK_SLIDE.clear - 12} H${o1 - 40}`}
        stroke={shade(DARK, 0.4)}
        strokeWidth={6}
      />
      {/* Pebbles trickle down in the rumble. */}
      {rumble >= 0 &&
        slide < 0 &&
        [0, 1, 2, 3, 4].map((i) => {
          const dt = (rumble + i * 160) % 700;
          return (
            <circle
              key={i}
              cx={900 + i * 60 - dt * 0.3}
              cy={-600 + fallen(dt, 0.002)}
              r={6}
              fill={STONE}
              {...ink(2)}
            />
          );
        })}
      <Dust
        x={(o0 + o1) / 2}
        y={-4}
        dt={since(p, 'clear') - 100}
        ms={900}
        size={1.5}
        color="#cfc8d8"
      />
    </g>
  );
}

export function RockSlideFront(p: ObstacleProps) {
  const slide = since(p, 'slide');
  if (slide < 0) return null;
  return (
    <g>
      {SLIDE_ROCKS.map((r, i) => {
        const dt = slide - r.delay;
        if (dt < 0) return null;
        // Along a slope from the upper right to the lower left, hopping as it goes.
        const u = dt / 2000;
        if (u > 1) return null;
        const x = lerp(1500, -700, u);
        const base = lerp(-700, -20, u);
        const y = base - 140 * Math.abs(Math.sin(Math.PI * u * r.hop));
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${-rollAngle(1500 - x, r.size / 2)})`}>
            <Boulder s={r.size} snow={i % 2 === 0} />
          </g>
        );
      })}
    </g>
  );
}
