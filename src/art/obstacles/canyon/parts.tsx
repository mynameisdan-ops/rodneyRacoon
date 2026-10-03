import { memo, useId } from 'react';
import { ink, mix, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { bump, circles, clamp01, noise, roundPath } from '../sceneKit';
import { NS, P, ROCK, SAND, SAND_SHADE } from './kit';

/**
 * Pieces shared by the World 5 (Canyon to Home) obstacles, painted like the backdrop (gorges,
 * banded rock) or lined like the hero (rocks and sand that act).
 * Local coordinates, with the ground line at y = 0.
 */

/** How far up the ground behind the path a gorge reaches as it runs off into the distance. */
const FAR = -150;

/**
 * A gorge across the path from a to b (painted), running away from the camera: its walls lit on
 * one side and in shadow on the other, narrowing into the haze far off, a river winding up its
 * floor, and the depths falling away below the path.
 */
export const Gorge = memo(function Gorge({ a, b }: { a: number; b: number }) {
  const id = useId();
  const mid = (a + b) / 2;
  const w = b - a;
  // Where the gorge vanishes into the distance, and where its rims run to.
  const fl = mid - w * 0.06;
  const fr = mid + w * 0.06;
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}lit`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={FAR}
          x2="0"
          y2={200}
        >
          <stop offset="0" stopColor={mix(P.cliffLit, P.haze, 0.5)} />
          <stop offset="0.35" stopColor={P.cliffLit} />
          <stop offset="0.7" stopColor={P.cliff} />
          <stop offset="1" stopColor={P.cliffShade} />
        </linearGradient>
        <linearGradient
          id={`${id}dark`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={FAR}
          x2="0"
          y2={200}
        >
          <stop offset="0" stopColor={mix(P.cliffShade, P.haze, 0.5)} />
          <stop offset="0.4" stopColor={P.cliffShade} />
          <stop offset="1" stopColor={P.cliffDark} />
        </linearGradient>
        <linearGradient
          id={`${id}deep`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={FAR}
          x2="0"
          y2={240}
        >
          <stop offset="0" stopColor={mix(P.cliffShade, P.haze, 0.4)} />
          <stop offset="0.5" stopColor={P.cliffDark} />
          <stop offset="1" stopColor="#3a1a2a" />
        </linearGradient>
        <linearGradient id={`${id}haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.haze} stopOpacity={0.8} />
          <stop offset="1" stopColor={P.haze} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* The gorge's depths, then its two walls running off into the distance. */}
      <path
        d={`M${a} 240 L${a} -14 L${fl} ${FAR} H${fr} L${b} -14 V240 Z`}
        fill={`url(#${id}deep)`}
      />
      <path
        d={`M${a} -14 L${fl} ${FAR} L${fl + w * 0.02} ${FAR + 30} L${a + w * 0.2} 240 H${a} Z`}
        fill={`url(#${id}lit)`}
      />
      <path
        d={`M${b} -14 L${fr} ${FAR} L${fr - w * 0.02} ${FAR + 34} L${b - w * 0.22} 240 H${b} Z`}
        fill={`url(#${id}dark)`}
      />
      {/* Bands of rock along the walls, converging into the distance. */}
      {P.bands.map((c, i) => {
        const f = (i + 1) / 5;
        return (
          <g key={c} opacity={0.5}>
            <path
              d={`M${a} ${-14 + 50 * f * 4} L${fl} ${FAR + 6 * (i + 1)}`}
              stroke={c}
              strokeWidth={7 - i}
              strokeLinecap="round"
            />
            <path
              d={`M${b} ${-14 + 50 * f * 4} L${fr} ${FAR + 6 * (i + 1)}`}
              stroke={shade(c, 0.3)}
              strokeWidth={7 - i}
              strokeLinecap="round"
            />
          </g>
        );
      })}
      {/* A river winding up the floor of the gorge, catching the evening light. */}
      <path
        d={`M${mid - 4} ${FAR + 40} Q${mid + w * 0.05} ${FAR + 90} ${mid - w * 0.04} ${FAR + 150} Q${mid - w * 0.1} ${FAR + 230} ${mid + w * 0.02} 240 L${mid + w * 0.12} 240 Q${mid} ${FAR + 230} ${mid + w * 0.04} ${FAR + 150} Q${mid + w * 0.1} ${FAR + 90} ${mid + 4} ${FAR + 40} Z`}
        fill="#4a8ab8"
      />
      <path
        d={`M${mid} ${FAR + 60} q6 20 -2 40 M${mid - w * 0.02} ${FAR + 180} q-10 30 4 50`}
        stroke="#fff0c8"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${fl - 20} ${FAR - 4} H${fr + 20} V${FAR + 60} H${fl - 20} Z`}
        fill={`url(#${id}haze)`}
      />
      {/* The rims: a lip of sand along each edge where the desert drops away. */}
      <path
        d={`M${a - 8} -10 L${fl - 4} ${FAR - 2} L${fl + 2} ${FAR + 2} L${a + 4} -6 Z`}
        fill={P.sandTop}
      />
      <path
        d={`M${b + 8} -10 L${fr + 4} ${FAR - 2} L${fr - 2} ${FAR + 2} L${b - 4} -6 Z`}
        fill={P.sand}
      />
      <path d={`M${a - 10} -6 Q${a + 20} -18 ${a + 40} -8 L${a} 8 Z`} fill={P.sandTop} />
      <path d={`M${b + 10} -6 Q${b - 20} -18 ${b - 40} -8 L${b} 8 Z`} fill={P.sand} />
    </g>
  );
});

/** A sandstone rock's lumpy outline around (0, 0), radius about 30. */
const ROCK_EDGE = roundPath(
  Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    const m = 30 * (1 + 0.16 * (noise(i, 8) - 0.5));
    return [Math.cos(a) * m, Math.sin(a) * m * 0.86] as const;
  }),
);

/** What stays put as it tumbles: a crisp shadow, a rim light. */
const RockShell = memo(function RockShell() {
  return (
    <g>
      <path d="M-26 12 A30 26 0 0 0 22 18 Q-6 20 -26 12 Z" fill={shade(ROCK, 0.35)} />
      <path
        d="M8 -24 A28 26 0 0 1 28 -4"
        stroke={tint(ROCK, 0.5)}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

/** A lined sandstone rock `r` px in radius at (x, y), turned `spin` degrees as it tumbles. */
export function Rock({ x, y, r, spin = 0 }: { x: number; y: number; r: number; spin?: number }) {
  const k = r / 30;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(3)})`}>
      <path d={ROCK_EDGE} fill={ROCK} {...ink(OUT)} {...NS} />
      <g transform={`rotate(${spin.toFixed(1)})`}>
        <path
          d="M-14 -8 H14 M-18 6 H10"
          stroke={shade(ROCK, 0.3)}
          strokeWidth={IN}
          strokeLinecap="round"
          {...NS}
        />
      </g>
      <RockShell />
    </g>
  );
}

/**
 * Sand bursting up from (x, y) (cel-drawn): a ring of lined puffs rolling outward and clumps
 * flung up in a fan, falling back. `size` 1 is about 200px across.
 */
export function SandBurst({
  x,
  y,
  dt,
  size = 1,
  ms = 800,
  fill = SAND,
  shadow = SAND_SHADE,
}: {
  x: number;
  y: number;
  dt: number;
  size?: number;
  ms?: number;
  fill?: string;
  shadow?: string;
}) {
  if (!(dt >= 0 && dt < ms)) return null;
  const p = dt / ms;
  const fade = 1 - clamp01((p - 0.6) / 0.4);
  const rise = bump(dt, ms * 1.4);
  const puffs = [-1, -0.55, -0.15, 0.3, 0.75, 0, -0.4, 0.45].map((s, i) => ({
    x: x + s * (34 + 70 * Math.sqrt(p)) * size,
    y: y - (10 + (i > 4 ? 70 : 40) * rise * (1 - Math.abs(s) * 0.6)) * size,
    r: (12 + 16 * p) * size * (1.1 - Math.abs(s) * 0.4) * (i > 4 ? 0.85 : 1),
  }));
  const clumps = Array.from({ length: 7 }, (_, i) => {
    const a = -Math.PI * (0.18 + (0.64 * i) / 6);
    const v = (0.38 + 0.25 * noise(i, 4)) * size;
    return {
      x: x + Math.cos(a) * v * dt,
      y: y + Math.sin(a) * v * dt + 0.0016 * dt * dt,
      r: (4 + 3 * noise(i, 7)) * size,
    };
  });
  return (
    <g opacity={fade}>
      <path d={circles(puffs)} fill={shadow} {...ink(IN)} />
      <path
        d={circles(puffs.map((c) => ({ x: c.x + c.r * 0.14, y: c.y - c.r * 0.2, r: c.r * 0.78 })))}
        fill={fill}
      />
      <path d={circles(clumps)} fill={fill} {...ink(IN)} />
    </g>
  );
}

/** Streaks of blowing sand (painted), `strength` 0..1, blowing toward `dir`. */
export function SandStreaks({
  t,
  strength,
  dir = 1,
}: {
  t: number;
  strength: number;
  dir?: 1 | -1;
}) {
  if (strength <= 0) return null;
  const span = 2600;
  const d = Array.from({ length: 22 }, (_, i) => {
    const x = -400 + ((i * 151 + t * 1.1) % span);
    const y = -30 - ((i * 67) % 560);
    const len = 40 + (i % 4) * 22;
    const px = dir > 0 ? x : 2200 - x;
    return `M${px.toFixed(1)} ${y}q${(dir * len) / 2} -6 ${dir * len} 0`;
  }).join('');
  const motes = Array.from({ length: 16 }, (_, i) => {
    const x = -400 + ((i * 197 + t * 1.3) % span);
    return { x: dir > 0 ? x : 2200 - x, y: -20 - ((i * 89) % 520), r: 2 + (i % 3) };
  });
  return (
    <g opacity={0.75 * strength}>
      <path d={d} stroke={tint(SAND, 0.4)} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <path d={circles(motes)} fill={SAND_SHADE} />
    </g>
  );
}
