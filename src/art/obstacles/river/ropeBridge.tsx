import { Dust } from '../../fx';
import { INK, ink } from '../../style';
import { bump, fallen, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { WATER, FOAM, WOOD, BARK } from './kit';
import { ROPE_BRIDGE } from './layout';

// ---------- Level 20: rope bridge ----------
// snap (the planks ahead fall away) → he goes hand over hand along the rope → climbs up.

export function RopeBridgeBack(p: ObstacleProps) {
  const [a, b] = ROPE_BRIDGE.gorge;
  const [g0, g1] = ROPE_BRIDGE.gap;
  const snap = since(p, 'snap');
  const planks = [];
  for (let x = a + 4; x < b - 4; x += 44) planks.push(x);
  const sag = 12 + 10 * bump(snap, 700);
  return (
    <g>
      <path
        d={`M${a - 16} -4 L${a} 20 L${a + 30} 240 L${b - 30} 240 L${b} 20 L${b + 16} -4 Z`}
        fill="#2a3a44"
        {...ink(3)}
      />
      <path
        d={`M${a + 40} 150 Q${(a + b) / 2} 120 ${b - 40} 150 L${b - 40} 240 L${a + 40} 240 Z`}
        fill={WATER}
      />
      <path
        d={`M${a + 60} 150 h 80 M${a + 300} 146 h 120 M${b - 200} 150 h 90`}
        stroke={FOAM}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {[a - 10, b + 10].map((x) => (
        <rect
          key={x}
          x={x - 9}
          y={-ROPE_BRIDGE.rope - 30}
          width={18}
          height={ROPE_BRIDGE.rope + 36}
          rx={4}
          fill={BARK}
          {...ink(3)}
        />
      ))}
      {planks.map((x, i) => {
        const inGap = x > g0 - 22 && x < g1 + 22;
        const dt = inGap ? snap - Math.abs(x - (g0 + g1) / 2) * 0.6 : -1;
        const y = fallen(dt, 0.0028);
        if (y > 300) return null;
        return (
          <g
            key={x}
            transform={`translate(${x + 20} ${y}) rotate(${dt > 0 ? (noise(i) - 0.5) * dt * 0.5 : 0})`}
          >
            <rect x={-20} y={-6} width={40} height={12} rx={2} fill={WOOD} {...ink(2.5)} />
          </g>
        );
      })}
      {/* The hand rope he hangs from. */}
      <path
        d={`M${a - 10} ${-ROPE_BRIDGE.rope} Q${(a + b) / 2} ${-ROPE_BRIDGE.rope + sag} ${b + 10} ${-ROPE_BRIDGE.rope}`}
        stroke={INK}
        strokeWidth={9}
        fill="none"
      />
      <path
        d={`M${a - 10} ${-ROPE_BRIDGE.rope} Q${(a + b) / 2} ${-ROPE_BRIDGE.rope + sag} ${b + 10} ${-ROPE_BRIDGE.rope}`}
        stroke="#c9a66b"
        strokeWidth={5}
        fill="none"
      />
      <Dust x={(g0 + g1) / 2} y={-10} dt={snap} ms={700} size={0.9} />
    </g>
  );
}
