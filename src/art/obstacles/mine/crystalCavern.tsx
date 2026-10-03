import { Dust, Glow } from '../../fx';
import { ink, shade, tint } from '../../style';
import { eventTime, type ObstacleProps } from '../types';
import { crystal } from './kit';
import { CRYSTAL_CAVERN } from './layout';
import { Pit, PitLip, Rock } from './parts';

// ---------- Level 5: crystal cavern ----------
// crumble (the ledge gives way) → sink1..3 (each spire drops after he leaves it).

const SHARDS = Array.from({ length: 6 }, (_, i) => ({ x: 90 + i * 95, delay: i * 260 }));
const LEDGE_BITS = Array.from({ length: 4 }, (_, i) => ({ x: -44 + i * 20, delay: i * 90 }));

function Spire({ x, dy, tilt, color }: { x: number; dy: number; tilt: number; color: string }) {
  return (
    <g transform={`translate(${x} ${dy - CRYSTAL_CAVERN.spireTop}) rotate(${tilt} 0 0)`}>
      <Glow x={0} y={-10} r={120} color={color} />
      {/* Smaller crystals growing out of its sides. */}
      <path d="M-30 60 L-78 10 L-62 2 L-24 40 Z" fill={tint(color, 0.15)} {...ink(3)} />
      <path d="M24 90 L74 40 L84 52 L28 116 Z" fill={shade(color, 0.15)} {...ink(3)} />
      <path d="M-45 -4 L45 -4 L30 120 L5 260 L-25 120 Z" fill={color} {...ink(3.5)} />
      <path d="M5 -4 L45 -4 L30 120 L5 260 Z" fill={shade(color, 0.3)} />
      <path d="M-30 6 L-16 110" stroke={tint(color, 0.6)} strokeWidth={5} strokeLinecap="round" />
      <path d="M-45 -4 L45 -4 L38 8 L-38 8 Z" fill={tint(color, 0.35)} {...ink(2.5)} />
    </g>
  );
}

export function CrystalCavernBack(p: ObstacleProps) {
  const [a, b] = CRYSTAL_CAVERN.pit;
  const crumbleAt = eventTime(p.events, 'crumble');
  return (
    <g>
      <Pit a={a} b={b} />
      {SHARDS.map((s, i) => {
        const dt = p.t - crumbleAt - s.delay;
        if (!(dt >= 0)) return null;
        const y = -620 + 0.003 * dt * dt;
        if (y > 260) return null;
        const c = crystal(i);
        return (
          <g key={i} transform={`translate(${s.x} ${y}) rotate(${dt * 0.2})`}>
            <path d="M0 -26 L12 0 L0 26 L-12 0 Z" fill={c} {...ink(2.5)} />
            <path d="M0 -26 L12 0 L0 26 Z" fill={shade(c, 0.3)} />
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
