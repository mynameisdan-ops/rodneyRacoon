import { memo, useId } from 'react';
import { ink, mix, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { bump, circles, clamp01, lerp, noise, roundPath } from '../sceneKit';
import { ICE, ICE_LIGHT, NS, P, SNOW, SNOW_SHADE, STONE } from './kit';

/**
 * Pieces shared by the World 4 (Misty Mountains) obstacles, painted like the backdrop (cliffs,
 * crevasses, snow lying on ledges) or lined like the hero (rocks and snow that act).
 * Local coordinates, with the ground line at y = 0.
 */

/** A lumpy edge of snow from x0 to x1 along y = -16. */
function lumps(x0: number, x1: number) {
  const n = Math.max(2, Math.round((x1 - x0) / 60));
  return Array.from({ length: n }, (_, i) => {
    const x = lerp(x0, x1, (i + 1) / n);
    return `Q${(x - 30).toFixed(1)} -22 ${x.toFixed(1)} -16`;
  }).join(' ');
}

/**
 * A crevasse in the snow from a to b (painted): walls of blue ice falling away into the dark,
 * lit facets and icicles on the far wall, snow overhanging its rims, mist far below.
 */
export const Crevasse = memo(function Crevasse({ a, b }: { a: number; b: number }) {
  const id = useId();
  const n = Math.max(3, Math.round((b - a) / 70));
  const facets = Array.from({ length: n }, (_, i) => lerp(a + 20, b - 20, (i + 0.5) / n));
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}far`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-14}
          x2="0"
          y2={200}
        >
          <stop offset="0" stopColor="#d6f2ff" />
          <stop offset="0.07" stopColor="#7cc0ea" />
          <stop offset="0.3" stopColor="#3474b4" />
          <stop offset="0.65" stopColor="#1a3a72" />
          <stop offset="1" stopColor="#0e1d44" />
        </linearGradient>
        <linearGradient id={`${id}facet`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8faff" stopOpacity={0.7} />
          <stop offset="1" stopColor="#e8faff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}mist`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dff2ff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#dff2ff" stopOpacity={0.22} />
          <stop offset="1" stopColor="#dff2ff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`M${a} 240 V-4 Q${a + 20} -14 ${a + 50} -14 H${b - 50} Q${b - 20} -14 ${b} -4 V240 Z`}
        fill={`url(#${id}far)`}
      />
      <g fill={`url(#${id}facet)`}>
        {facets.map((x, i) => {
          const w = 26 + 26 * noise(i, 3);
          const h = 60 + 60 * noise(i, 5);
          return (
            <path
              key={i}
              d={`M${x - w * 0.5} -10 L${x + w * 0.5} -12 L${x + w * 0.2} ${h} L${x - w * 0.3} ${h * 0.75} Z`}
            />
          );
        })}
      </g>
      {/* The near walls, in shadow, closing in toward the camera. */}
      <path d={`M${a} -4 L${a + 26} 240 H${a - 6} V-4 Z`} fill="#16305e" />
      <path d={`M${b} -4 L${b - 18} 240 H${b + 6} V-4 Z`} fill="#24508a" />
      {/* Icicles hanging from the far rim. */}
      <g fill={ICE_LIGHT} opacity={0.9}>
        {facets.map((x, i) => {
          const len = 14 + 22 * noise(i, 9);
          return (
            <path
              key={i}
              d={`M${x - 14} -10 L${x - 10} ${-10 + len} L${x - 6} -10 M${x + 4} -11 L${x + 7} ${-11 + len * 0.6} L${x + 10} -11 Z`}
            />
          );
        })}
      </g>
      <rect x={a} y={70} width={b - a} height={70} fill={`url(#${id}mist)`} />
      {/* Snow overhanging the far rim, lit along its top. */}
      <path
        d={`M${a - 6} -6 Q${a + 20} -22 ${a + 50} -16 ${lumps(a + 50, b - 50)} Q${b - 20} -22 ${b + 6} -6 Z`}
        fill={P.snowMid}
      />
    </g>
  );
});

/** A snowy rock's lumpy outline around (0, 0), radius about 30. */
const ROCK_EDGE = roundPath(
  Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    const m = 30 * (1 + 0.12 * (noise(i, 6) - 0.5));
    return [Math.cos(a) * m, Math.sin(a) * m * 0.92] as const;
  }),
);

/** What turns as a rock tumbles: its cracks and pits. */
const RockTurning = memo(function RockTurning() {
  return (
    <g>
      <path
        d="M-6 -12 L2 -2 L-2 8 M2 -2 L12 0 M-20 6 L-12 10 M10 14 Q12 18 10 22"
        stroke={shade(STONE, 0.5)}
        strokeWidth={IN}
        fill="none"
        strokeLinecap="round"
        {...NS}
      />
      <circle cx={-14} cy={-10} r={2.6} fill={shade(STONE, 0.3)} />
      <circle cx={14} cy={-14} r={2} fill={shade(STONE, 0.3)} />
    </g>
  );
});

/** What stays put as it tumbles: the outline, a crisp shadow, a rim light and a cap of snow. */
const RockShell = memo(function RockShell({ snow }: { snow: boolean }) {
  return (
    <g>
      <path d="M-26 14 A30 28 0 0 0 22 20 Q-6 22 -26 14 Z" fill={shade(STONE, 0.35)} />
      <path
        d="M10 -26 A28 28 0 0 1 28 -4"
        stroke={tint(STONE, 0.55)}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      {snow && (
        <g>
          <path
            d="M-24 -14 Q-16 -30 2 -30 Q20 -30 26 -14 Q18 -18 10 -14 Q2 -20 -6 -14 Q-14 -18 -24 -14 Z"
            fill={SNOW}
            {...ink(IN)}
            {...NS}
          />
          <path
            d="M-10 -24 Q2 -29 14 -24"
            stroke="#ffffff"
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
});

/** A lined snowy rock `r` px in radius at (x, y), turned `spin` degrees as it tumbles. */
export function Rock({
  x,
  y,
  r,
  spin = 0,
  snow = true,
}: {
  x: number;
  y: number;
  r: number;
  spin?: number;
  snow?: boolean;
}) {
  const k = r / 30;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(3)})`}>
      <path d={ROCK_EDGE} fill={STONE} {...ink(OUT)} {...NS} />
      <g transform={`rotate(${spin.toFixed(1)})`}>
        <RockTurning />
      </g>
      <RockShell snow={snow} />
    </g>
  );
}

/**
 * Snow bursting up from (x, y) (cel-drawn): a ring of lined puffs rolling outward and clumps
 * flung up in a fan, falling back. `size` 1 is about 200px across.
 */
export function SnowBurst({
  x,
  y,
  dt,
  size = 1,
  ms = 800,
}: {
  x: number;
  y: number;
  dt: number;
  size?: number;
  ms?: number;
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
      r: (5 + 4 * noise(i, 7)) * size,
    };
  });
  return (
    <g opacity={fade}>
      <path d={circles(puffs)} fill={SNOW} {...ink(IN)} />
      <path
        d={circles(puffs.map((c) => ({ x: c.x + c.r * 0.2, y: c.y - c.r * 0.3, r: c.r * 0.45 })))}
        fill="#ffffff"
      />
      <path d={circles(clumps)} fill={SNOW} {...ink(IN)} />
    </g>
  );
}

/** Snow lying along a ledge from x0 to x1 at y (painted): lumpy, lit on top, blue beneath. */
export function SnowLedge({
  x0,
  x1,
  y,
  depth = 14,
}: {
  x0: number;
  x1: number;
  y: number;
  depth?: number;
}) {
  const n = Math.max(2, Math.round((x1 - x0) / 50));
  const top = Array.from({ length: n }, (_, i) => {
    const xa = lerp(x0, x1, (i + 0.5) / n);
    const xb = lerp(x0, x1, (i + 1) / n);
    return `Q${xa.toFixed(1)} ${(y - 6 - 3 * noise(i, 3)).toFixed(1)} ${xb.toFixed(1)} ${(y - 2).toFixed(1)}`;
  }).join(' ');
  const under = Array.from({ length: n }, (_, i) => {
    const xa = lerp(x1, x0, (i + 0.5) / n);
    const xb = lerp(x1, x0, (i + 1) / n);
    return `Q${xa.toFixed(1)} ${(y + depth + 5 * noise(i, 5)).toFixed(1)} ${xb.toFixed(1)} ${(y + depth * 0.6).toFixed(1)}`;
  }).join(' ');
  return (
    <g>
      <path
        d={`M${x0 - 4} ${y + depth * 0.4} Q${x0 - 4} ${y - 2} ${x0} ${y - 2} ${top} Q${x1 + 4} ${y - 2} ${x1 + 4} ${y + depth * 0.4} ${under} Z`}
        fill={SNOW_SHADE}
      />
      <path d={`M${x0} ${y - 2} ${top} V${y + depth * 0.35} H${x0} Z`} fill={P.snowTop} />
      <path
        d={`M${x0 + 4} ${y - 4} ${top}`}
        stroke="#ffffff"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Painted icicles hanging under a lip from x0 to x1 at y. */
export function Icicles({
  x0,
  x1,
  y,
  len = 26,
  seed = 1,
}: {
  x0: number;
  x1: number;
  y: number;
  len?: number;
  seed?: number;
}) {
  const n = Math.max(2, Math.round((x1 - x0) / 22));
  let d = '';
  let lit = '';
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, (i + 0.5) / n);
    const l = len * (0.35 + 0.65 * noise(i, seed));
    const w = 4 + 3 * noise(i, seed + 2);
    d += `M${(x - w).toFixed(1)} ${y} L${x.toFixed(1)} ${(y + l).toFixed(1)} L${(x + w).toFixed(1)} ${y} Z`;
    lit += `M${(x + w * 0.2).toFixed(1)} ${y + 2} L${(x + w * 0.1).toFixed(1)} ${(y + l * 0.7).toFixed(1)}`;
  }
  return (
    <g>
      <path d={d} fill={mix(ICE, '#ffffff', 0.35)} opacity={0.95} />
      <path d={lit} stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" opacity={0.9} />
    </g>
  );
}

/** Snowflakes blowing sideways across the scene, `strength` 0..1. */
export function Blizzard({
  t,
  strength,
  x0 = -400,
  x1 = 2400,
}: {
  t: number;
  strength: number;
  x0?: number;
  x1?: number;
}) {
  if (strength <= 0) return null;
  const span = x1 - x0;
  const flakes = Array.from({ length: 46 }, (_, i) => ({
    x: x0 + ((i * 97 + t * (0.55 + noise(i) * 0.45)) % span),
    y: -720 + ((i * 53 + t * (0.22 + noise(i, 3) * 0.12)) % 780),
    r: 2.4 + (i % 3) * 1.2,
  }));
  return (
    <g opacity={0.9 * strength}>
      <path
        d={flakes
          .filter((_, i) => i % 3 === 0)
          .map((f) => `M${f.x.toFixed(1)} ${f.y.toFixed(1)}l-26 6`)
          .join('')}
        stroke="#ffffff"
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.55}
      />
      <path d={circles(flakes)} fill="#ffffff" />
    </g>
  );
}
