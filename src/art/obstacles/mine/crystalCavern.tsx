import { memo, useId } from 'react';
import { Dust } from '../../fx';
import { ink, shade, tint } from '../../style';
import { Glint } from '../../worlds/paintKit';
import { eventTime, type ObstacleProps } from '../types';
import { IN, OUT, CRYSTALS, crystal } from './kit';
import { CRYSTAL_CAVERN } from './layout';
import { Pit, PitLip, Rock } from './parts';

// ---------- Level 5: crystal cavern ----------
// crumble (the ledge gives way) → sink1..3 (each spire drops after he leaves it).

const SHARDS = Array.from({ length: 6 }, (_, i) => ({ x: 90 + i * 95, delay: i * 260 }));
const LEDGE_BITS = Array.from({ length: 4 }, (_, i) => ({ x: -44 + i * 20, delay: i * 90 }));

/** A crystal spire standing in the chasm, its flat top a stepping stone, glowing softly. */
function Spire({
  x,
  dy,
  tilt,
  color,
  glow,
}: {
  x: number;
  dy: number;
  tilt: number;
  color: string;
  glow: string;
}) {
  return (
    <g transform={`translate(${x} ${dy - CRYSTAL_CAVERN.spireTop}) rotate(${tilt} 0 0)`}>
      <SpireArt color={color} glow={glow} />
    </g>
  );
}

/** The spire itself, drawn once for its color (only its transform changes as it sinks). */
const SpireArt = memo(function SpireArt({ color, glow }: { color: string; glow: string }) {
  const lit = tint(color, 0.35);
  return (
    <g>
      <ellipse cx={0} cy={30} rx={130} ry={150} fill={glow} />
      {/* Smaller crystals growing out of its sides. */}
      <path d="M-30 60 L-78 10 L-62 2 L-24 40 Z" fill={tint(color, 0.15)} {...ink(OUT)} />
      <path d="M-78 10 L-62 2 L-50 18 Z" fill={lit} />
      <path d="M24 90 L74 40 L84 52 L28 116 Z" fill={shade(color, 0.1)} {...ink(OUT)} />
      <path d="M74 40 L84 52 L60 76 Z" fill={lit} />
      <path d="M-45 -4 L45 -4 L30 120 L5 260 L-25 120 Z" fill={color} {...ink(OUT + 0.4)} />
      {/* The shadow facet on the left, a lit one on the right, and a shine down the middle. */}
      <path d="M-45 -4 L-12 -4 L-6 120 L5 260 L-25 120 Z" fill={shade(color, 0.28)} />
      <path d="M22 -4 L45 -4 L30 120 L18 190 Z" fill={lit} opacity={0.7} />
      <path
        d="M-2 12 L4 110"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.75}
      />
      <path d="M-45 -4 L45 -4 L39 9 L-39 9 Z" fill={tint(color, 0.55)} {...ink(IN + 0.6)} />
      <Glint x={30} y={2} r={9} color="#ffffff" />
    </g>
  );
});

export function CrystalCavernBack(p: ObstacleProps) {
  const id = useId();
  const [a, b] = CRYSTAL_CAVERN.pit;
  const crumbleAt = eventTime(p.events, 'crumble');
  return (
    <g>
      <defs>
        {CRYSTALS.map((c, i) => (
          <radialGradient key={c} id={`${id}g${i}`}>
            <stop offset="0" stopColor={c} stopOpacity={0.45} />
            <stop offset="0.45" stopColor={c} stopOpacity={0.16} />
            <stop offset="1" stopColor={c} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      <Pit a={a} b={b} />
      {SHARDS.map((s, i) => {
        const dt = p.t - crumbleAt - s.delay;
        if (!(dt >= 0)) return null;
        const y = -620 + 0.003 * dt * dt;
        if (y > 260) return null;
        const c = crystal(i);
        return (
          <g key={i} transform={`translate(${s.x} ${y}) rotate(${dt * 0.2})`}>
            <path d="M0 -26 L12 0 L0 26 L-12 0 Z" fill={c} {...ink(2.4)} />
            <path d="M0 -26 L-12 0 L0 26 Z" fill={shade(c, 0.3)} />
            <path d="M3 -14 L7 -2" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
          </g>
        );
      })}
      {CRYSTAL_CAVERN.spires.map((x, i) => {
        const sinkAt = eventTime(p.events, `sink${i + 1}`);
        const dt = p.t - sinkAt;
        const sinking = dt >= 0;
        return (
          <Spire
            key={x}
            x={x}
            dy={sinking ? 0.0022 * dt * dt : 0}
            tilt={sinking ? (i % 2 ? 1 : -1) * 0.012 * dt : 0}
            color={crystal(i)}
            glow={`url(#${id}g${i % 3})`}
          />
        );
      })}
      <PitLip a={a} b={b} />
      {/* The crumbling edge of the ledge he starts on. */}
      {LEDGE_BITS.map((bit, i) => {
        const dt = p.t - crumbleAt - bit.delay;
        const falling = dt >= 0;
        const y = falling ? 0.0025 * dt * dt : 0;
        if (y > 260) return null;
        return <Rock key={i} x={bit.x} y={y} s={14} spin={falling ? dt * 0.25 : (i * 17) % 20} />;
      })}
      <Dust x={0} y={-4} dt={p.t - crumbleAt} ms={800} size={0.8} />
    </g>
  );
}
