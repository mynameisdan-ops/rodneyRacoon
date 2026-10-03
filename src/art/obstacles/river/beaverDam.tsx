import { INK, ink, shade } from '../../style';
import { clamp01, fallen, lerp, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { WATER, FOAM, WOOD, BARK } from './kit';
import { DAM } from './layout';
import { River, Splash, Bank } from './parts';

// ---------- Level 18: beaver dam ----------
// crack (water spurts through) → burst (logs pop out behind him as he runs the top).

function logBurstAt(p: ObstacleProps, x: number) {
  const burstAt = eventTime(p.events, 'burst');
  const start = p.heroAt(burstAt).x - DAM.lag;
  const [a] = DAM.dam;
  if (x <= start) return burstAt + ((x - a) / Math.max(1, start - a)) * 200;
  return burstAt + 200 + (x - start) / DAM.run;
}

function Beaver({ x, y, wave }: { x: number; y: number; wave: number }) {
  const fur = '#8a5a34';
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={24} ry={22} fill={fur} {...ink(2.5)} />
      <circle cx={-8} cy={-18} r={6} fill={fur} {...ink(2)} />
      <circle cx={8} cy={-18} r={6} fill={fur} {...ink(2)} />
      <circle cx={-8} cy={-4} r={3} fill={INK} />
      <circle cx={8} cy={-4} r={3} fill={INK} />
      <ellipse cx={0} cy={6} rx={8} ry={5} fill="#3a2418" />
      <rect x={-5} y={10} width={10} height={8} rx={2} fill="#fff6e0" {...ink(1.5)} />
      <path
        d={`M20 -4 q 14 ${-12 - wave * 10} 10 ${-26 - wave * 6}`}
        stroke={INK}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M20 -4 q 14 ${-12 - wave * 10} 10 ${-26 - wave * 6}`}
        stroke={fur}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

export function BeaverDamBack(p: ObstacleProps) {
  const [a, b] = DAM.dam;
  const crack = since(p, 'crack');
  const burst = since(p, 'burst');
  const logs = [];
  for (let x = a + 20; x < b - 10; x += 46) logs.push(x);
  return (
    <g>
      {/* The lake behind the dam, high up, and the river below it. */}
      <path d={`M${a} ${-DAM.top + 16} H${b} V-40 H${a} Z`} fill={WATER} opacity={0.9} />
      <River a={a - 40} b={b + 40} level={40} t={p.t} white={clamp01(burst / 600)} />
      <Bank x={a - 40} dir={1} />
      <Bank x={b + 40} dir={-1} />
      {/* The dam: a ramp of sticks up to a top walkway of logs. */}
      <path
        d={`M${a - 40} 0 L${a} ${-DAM.top} H${b} L${b + 40} 0 L${b + 20} 60 H${a - 20} Z`}
        fill={shade(WOOD, 0.35)}
        {...ink(3)}
      />
      {logs.map((x, i) => {
        const dt = p.t - logBurstAt(p, x);
        const y = -DAM.top + fallen(dt, 0.002) - (dt > 0 ? dt * 0.35 : 0);
        if (y > 260) return null;
        return (
          <g
            key={x}
            transform={`translate(${x} ${y}) rotate(${dt > 0 ? (noise(i) - 0.5) * dt * 0.5 : (i % 3) * 3})`}
          >
            <rect x={-24} y={-6} width={48} height={18} rx={8} fill={BARK} {...ink(2.5)} />
            <ellipse cx={24} cy={3} rx={5} ry={8} fill="#d9a86a" {...ink(1.5)} />
          </g>
        );
      })}
      {/* Water spurting through the cracks toward us. */}
      {crack >= 0 &&
        [0.25, 0.5, 0.75].map((f, i) => {
          const x = lerp(a, b, f);
          const h =
            (30 + 50 * clamp01(crack / 600)) *
            (1 + (burst > 0 ? 1.5 : 0)) *
            (0.8 + 0.2 * Math.sin(p.t / 70 + i));
          return (
            <path
              key={f}
              d={`M${x - 8} ${-DAM.top + 30} Q${x + h * 0.6} ${-DAM.top + 20} ${x + h} ${40} L${x + h - 26} ${40} Q${x + h * 0.4} ${-DAM.top + 44} ${x - 8} ${-DAM.top + 44} Z`}
              fill={FOAM}
              {...ink(2)}
            />
          );
        })}
      {/* The beavers wave hello, then dive out of the way. */}
      {DAM.beavers.map((x, i) => {
        const dive = burst - i * 80;
        const y = dive < 0 ? 20 - 20 * clamp01(crack / 300) : 20 + dive * 0.25;
        return y < 70 ? <Beaver key={x} x={x} y={y} wave={Math.sin(p.t / 120 + i)} /> : null;
      })}
      <Splash x={(a + b) / 2} y={0} dt={burst} size={1.4} />
    </g>
  );
}
