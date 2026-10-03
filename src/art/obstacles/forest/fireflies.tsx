import { memo, useId } from 'react';
import { Dust } from '../../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { clamp01, easeOut, lerp, noise, progress, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { MOSS } from './kit';
import { FIREFLIES } from './layout';

// ---------- Level 16 (boss): follow the fireflies ----------
// dusk (night falls, fog rolls in) → fireflies (they gather; roots rise across the path)
// → dawn (he bursts into a moonlit clearing).

const FLIES = Array.from({ length: 16 }, (_, i) => ({ i, ph: noise(i, 9) * 6.28 }));
const NIGHT_ROOT = '#7a5238';

/**
 * The night roots he jumps and slides under, lined like his props, with bark and moss: a root
 * looping up out of the ground (rising with `rise`), and a tall arch.
 */
const RootHump = memo(function RootHump({ rise }: { rise: number }) {
  const { hump } = FIREFLIES;
  const h = 150 * rise;
  if (h < 1) return null;
  const outer = `M${hump - 112} 6 Q${hump - 104} ${-h * 0.95} ${hump} ${-h} Q${hump + 104} ${-h * 0.95} ${hump + 112} 6`;
  const inner = `L${hump + 72} 6 Q${hump + 64} ${-h * 0.6} ${hump} ${-h * 0.66} Q${hump - 64} ${-h * 0.6} ${hump - 72} 6 Z`;
  return (
    <g>
      <path
        d={`M${hump - 74} 6 Q${hump - 64} ${-h * 0.6} ${hump} ${-h * 0.66} Q${hump + 64} ${-h * 0.6} ${hump + 74} 6 Z`}
        fill="#1e1410"
      />
      <path d={outer + inner} fill={NIGHT_ROOT} {...ink(OUT)} />
      <path
        d={`M${hump - 112} 6 Q${hump - 104} ${-h * 0.95} ${hump - 30} ${-h * 0.99} L${hump - 26} ${-h * 0.8} Q${hump - 76} ${-h * 0.72} ${hump - 86} 6 Z`}
        fill={shade(NIGHT_ROOT, 0.3)}
      />
      <path
        d={`M${hump - 20} ${-h * 0.93} Q${hump + 60} ${-h * 0.9} ${hump + 96} ${-h * 0.3}`}
        stroke={tint(NIGHT_ROOT, 0.45)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${hump - 50} ${-h * 0.82} q12 4 20 -2 M${hump + 30} ${-h * 0.84} q10 6 18 0 M${hump + 74} ${-h * 0.45} q8 2 10 10`}
        stroke={shade(NIGHT_ROOT, 0.45)}
        strokeWidth={IN}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${hump - 40} ${-h * 0.97} q24 -14 52 -4 q-14 12 -52 4 Z`}
        fill={MOSS}
        {...ink(IN)}
      />
      <path
        d={`M${hump - 112} 6 q-14 -2 -20 6 M${hump + 112} 6 q16 -4 22 4`}
        stroke={INK}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

const RootArch = memo(function RootArch() {
  const { arch, archClear } = FIREFLIES;
  const outer = `M${arch - 150} 6 Q${arch - 120} ${-archClear - 90} ${arch} ${-archClear - 60} Q${arch + 120} ${-archClear - 90} ${arch + 150} 6 L${arch + 110} 6 Q${arch + 90} ${-archClear - 10} ${arch} ${-archClear} Q${arch - 90} ${-archClear - 10} ${arch - 110} 6 Z`;
  return (
    <g>
      <path d={outer} fill={NIGHT_ROOT} {...ink(OUT)} />
      <path
        d={`M${arch - 110} 6 Q${arch - 90} ${-archClear - 10} ${arch} ${-archClear} Q${arch + 90} ${-archClear - 10} ${arch + 110} 6 L${arch + 100} 6 Q${arch + 80} ${-archClear + 4} ${arch} ${-archClear + 12} Q${arch - 80} ${-archClear + 4} ${arch - 100} 6 Z`}
        fill={shade(NIGHT_ROOT, 0.35)}
      />
      <path
        d={`M${arch - 128} ${-archClear + 40} Q${arch - 100} ${-archClear - 72} ${arch} ${-archClear - 50} Q${arch + 90} ${-archClear - 70} ${arch + 120} ${-archClear - 10}`}
        stroke={tint(NIGHT_ROOT, 0.45)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${arch - 60} ${-archClear - 70} q20 -18 40 -8 q-10 14 -40 8 Z`}
        fill={MOSS}
        {...ink(IN)}
      />
    </g>
  );
});

/** The chasm at the end (painted): dark, with roots hanging into it. */
const RootGap = memo(function RootGap() {
  const id = useId();
  const [g0, g1] = FIREFLIES.gap;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1626" />
          <stop offset="1" stopColor="#05040a" />
        </linearGradient>
      </defs>
      <path
        d={`M${g0 - 14} -4 L${g0} 30 L${g0 + 20} 220 L${g1 - 20} 220 L${g1} 30 L${g1 + 14} -4 Z`}
        fill={`url(#${id})`}
      />
      {[g0 + 40, g1 - 40].map((x, i) => (
        <path
          key={x}
          d={`M${x} 10 q ${i ? -20 : 20} 60 ${i ? 10 : -10} 140`}
          stroke="#4a3426"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
});

export function FirefliesBack(p: ObstacleProps) {
  const id = useId();
  const { arch } = FIREFLIES;
  const dark = clamp01(since(p, 'dusk') / 900) - clamp01(since(p, 'dawn') / 800);
  const rise = easeOut(progress(p, 'fireflies', 700));
  const moon = clamp01(since(p, 'dawn') / 800);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}n`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07102c" />
          <stop offset="1" stopColor="#163a4a" />
        </linearGradient>
        <radialGradient id={`${id}m`}>
          <stop offset="0" stopColor="#fff6d0" stopOpacity={0.7} />
          <stop offset="0.35" stopColor="#fff6d0" stopOpacity={0.22} />
          <stop offset="1" stopColor="#fff6d0" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* Night (painted): deep blue over everything but him, a little lighter near the ground. */}
      <rect
        x={-600}
        y={-900}
        width={3200}
        height={1200}
        fill={`url(#${id}n)`}
        opacity={0.6 * dark}
      />
      {/* Fog along the ground. */}
      <g fill="#dfe8ff" opacity={0.25 * dark}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx={-200 + i * 380 + ((p.t * 0.02) % 380)} cy={-20} rx={260} ry={40} />
        ))}
      </g>
      {/* A root hump to jump, a root arch to slide under, and a gap. */}
      {rise > 0 && <RootHump rise={Math.round(rise * 40) / 40} />}
      {rise > 0 && (
        <g transform={`translate(0 ${(1 - rise) * 260})`}>
          <RootArch />
        </g>
      )}
      <RootGap />
      {/* The moon comes out when he reaches the clearing (painted). */}
      <g opacity={moon}>
        <circle cx={1900} cy={-560} r={190} fill={`url(#${id}m)`} />
        <circle cx={1900} cy={-560} r={50} fill="#fff6d0" />
        <circle cx={1888} cy={-572} r={9} fill="#efe2b4" />
        <circle cx={1914} cy={-548} r={6} fill="#efe2b4" />
      </g>
      <Dust x={arch} y={-4} dt={since(p, 'fireflies')} ms={900} color="#5a4a3a" />
    </g>
  );
}

export function FirefliesFront(p: ObstacleProps) {
  const id = useId();
  const dusk = since(p, 'dusk');
  const flies = since(p, 'fireflies');
  const dawn = since(p, 'dawn');
  if (dusk < 0) return null;
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#f4ff8a" stopOpacity={0.75} />
          <stop offset="0.4" stopColor="#f4ff8a" stopOpacity={0.22} />
          <stop offset="1" stopColor="#f4ff8a" stopOpacity={0} />
        </radialGradient>
      </defs>
      {FLIES.map(({ i, ph }) => {
        // Scattered in the dark, then streaming ahead of him as a glowing trail,
        // then swirling up around him in the clearing.
        const wander = {
          x: -200 + i * 130 + 30 * Math.sin(p.t / 700 + ph),
          y: -260 - 80 * Math.sin(p.t / 500 + ph),
        };
        const trail = {
          x: p.heroX + 140 + i * 60 + 12 * Math.sin(p.t / 260 + ph),
          y: -90 - 50 * Math.sin(i * 0.6 + p.t / 400),
        };
        const k = easeOut(clamp01(flies / 900));
        let x = lerp(wander.x, trail.x, k);
        let y = lerp(wander.y, trail.y, k);
        if (dawn >= 0) {
          const a = ph + dawn / 500 + (i / FLIES.length) * 6.28;
          const r = 90 + dawn * 0.12;
          const s = clamp01(dawn / 600);
          x = lerp(x, p.heroX + Math.cos(a) * r, s);
          y = lerp(y, -120 + Math.sin(a) * r * 0.6 - dawn * 0.08, s);
        }
        const fade = dawn > 1400 ? Math.max(0, 1 - (dawn - 1400) / 600) : 1;
        const sz = 0.8 + noise(i) * 0.5;
        const twinkle = 0.75 + 0.25 * Math.sin(p.t / 120 + ph * 3);
        return (
          <g key={i} opacity={fade * twinkle}>
            <circle cx={x} cy={y} r={30 * sz} fill={`url(#${id})`} />
            <circle cx={x} cy={y} r={4 * sz} fill="#fbffc8" />
          </g>
        );
      })}
    </g>
  );
}
