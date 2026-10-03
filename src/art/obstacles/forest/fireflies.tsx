import { Dust, Glow } from '../../fx';
import { INK, ink } from '../../style';
import { clamp01, easeOut, lerp, noise, progress, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { ROOT } from './kit';
import { FIREFLIES } from './layout';

// ---------- Level 16 (boss): follow the fireflies ----------
// dusk (night falls, fog rolls in) → fireflies (they gather; roots rise across the path)
// → dawn (he bursts into a moonlit clearing).

const FLIES = Array.from({ length: 16 }, (_, i) => ({ i, ph: noise(i, 9) * 6.28 }));

function Firefly({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g>
      <Glow x={x} y={y} r={30 * s} color="#f4ff8a" />
      <circle cx={x} cy={y} r={4 * s} fill="#fbffc8" />
    </g>
  );
}

export function FirefliesBack(p: ObstacleProps) {
  const { hump, arch, archClear, gap } = FIREFLIES;
  const dark = clamp01(since(p, 'dusk') / 900) - clamp01(since(p, 'dawn') / 800);
  const rise = easeOut(progress(p, 'fireflies', 700));
  const rootLine = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const };
  return (
    <g>
      <rect x={-600} y={-900} width={3200} height={1200} fill="#0b1330" opacity={0.55 * dark} />
      {/* Fog along the ground. */}
      <g fill="#dfe8ff" opacity={0.25 * dark}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx={-200 + i * 380 + ((p.t * 0.02) % 380)} cy={-20} rx={260} ry={40} />
        ))}
      </g>
      {/* A root hump to jump, a root arch to slide under, and a gap. */}
      {rise > 0 && (
        <path
          d={`M${hump - 100} 6 Q${hump} ${-150 * rise} ${hump + 100} 6 Z`}
          fill={ROOT}
          {...rootLine}
        />
      )}
      {rise > 0 && (
        <g transform={`translate(0 ${(1 - rise) * 260})`}>
          <path
            d={`M${arch - 150} 6 Q${arch - 120} ${-archClear - 90} ${arch} ${-archClear - 60} Q${arch + 120} ${-archClear - 90} ${arch + 150} 6 L${arch + 110} 6 Q${arch + 90} ${-archClear - 10} ${arch} ${-archClear} Q${arch - 90} ${-archClear - 10} ${arch - 110} 6 Z`}
            fill={ROOT}
            {...rootLine}
          />
        </g>
      )}
      <path
        d={`M${gap[0] - 14} -4 L${gap[0]} 30 L${gap[0] + 20} 220 L${gap[1] - 20} 220 L${gap[1]} 30 L${gap[1] + 14} -4 Z`}
        fill="#0c0a14"
        {...ink(3)}
      />
      {[gap[0] + 40, gap[1] - 40].map((x, i) => (
        <path
          key={x}
          d={`M${x} 10 q ${i ? -20 : 20} 60 ${i ? 10 : -10} 140`}
          stroke={ROOT}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {/* The moon comes out when he reaches the clearing. */}
      <g opacity={clamp01(since(p, 'dawn') / 800)}>
        <Glow x={1900} y={-560} r={180} color="#fff6d0" />
        <circle cx={1900} cy={-560} r={52} fill="#fff6d0" {...ink(3)} />
      </g>
      <Dust x={arch} y={-4} dt={since(p, 'fireflies')} ms={900} color="#5a4a3a" />
    </g>
  );
}

export function FirefliesFront(p: ObstacleProps) {
  const dusk = since(p, 'dusk');
  const flies = since(p, 'fireflies');
  const dawn = since(p, 'dawn');
  if (dusk < 0) return null;
  return (
    <g>
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
        return (
          <g key={i} opacity={fade}>
            <Firefly x={x} y={y} s={0.8 + noise(i) * 0.5} />
          </g>
        );
      })}
    </g>
  );
}
