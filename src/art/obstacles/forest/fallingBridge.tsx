import { ink, shade } from '../../style';
import { fallen, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { BARK, WOOD } from './kit';
import { FALLING_BRIDGE } from './layout';

// ---------- Level 15: falling bridge ----------
// creak → collapse (the planks drop one by one behind him as he runs).

/** The hero's running speed across the bridge (matches the script). */
const BRIDGE_RUN = 0.78;

function plankFallAt(p: ObstacleProps, x: number) {
  const collapseAt = eventTime(p.events, 'collapse');
  const start = p.heroAt(collapseAt).x - FALLING_BRIDGE.lag;
  const [a] = FALLING_BRIDGE.ravine;
  // Planks already behind him go in a quick cascade; the rest as he runs past.
  if (x <= start) return collapseAt + ((x - a) / Math.max(1, start - a)) * 250;
  return collapseAt + 250 + (x - start) / BRIDGE_RUN;
}

export function FallingBridgeBack(p: ObstacleProps) {
  const [a, b] = FALLING_BRIDGE.ravine;
  const planks = [];
  for (let x = a + 4; x < b - 4; x += FALLING_BRIDGE.plank) planks.push(x);
  const creak = since(p, 'creak');
  const wobble = creak >= 0 ? 3 * Math.sin(p.t / 40) * Math.exp(-Math.max(0, creak) / 600) : 0;
  const collapseAt = eventTime(p.events, 'collapse');
  const front = p.t < collapseAt ? a : Math.min(b, p.heroX - FALLING_BRIDGE.lag);
  return (
    <g>
      <path
        d={`M${a - 16} -4 L${a} 16 L${a + 30} 220 L${b - 30} 220 L${b} 16 L${b + 16} -4 Z`}
        fill="#1e2a22"
        {...ink(3)}
      />
      <path d={`M${a + 60} 220 Q${(a + b) / 2} 120 ${b - 60} 220 Z`} fill="#2e4a36" />
      {[a - 10, b + 10].map((x) => (
        <g key={x}>
          <rect x={x - 9} y={-90} width={18} height={96} rx={4} fill={BARK} {...ink(3)} />
        </g>
      ))}
      {planks.map((x, i) => {
        const dt = p.t - plankFallAt(p, x);
        const y = fallen(dt, 0.0028) + wobble * Math.sin(i);
        if (y > 300) return null;
        return (
          <g
            key={x}
            transform={`translate(${x + 22} ${y}) rotate(${dt > 0 ? (noise(i) - 0.5) * dt * 0.4 : 0})`}
          >
            <rect x={-22} y={-6} width={44} height={12} rx={2} fill={WOOD} {...ink(2.5)} />
            <path d="M-18 -1 H18" stroke={shade(WOOD, 0.3)} strokeWidth={2} />
          </g>
        );
      })}
      {/* The rope rail: taut from the break to the far post, dangling from the near one. */}
      <path
        d={`M${front} -70 Q${(front + b) / 2} -40 ${b + 10} -84`}
        stroke="#c9a66b"
        strokeWidth={5}
        fill="none"
        {...{ strokeLinecap: 'round' }}
      />
      {p.t >= collapseAt && (
        <path
          d={`M${a - 10} -84 q 20 60 6 ${140 + 20 * Math.sin(p.t / 300)}`}
          stroke="#c9a66b"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {p.t < collapseAt && (
        <path
          d={`M${a - 10} -84 Q${(a + b) / 2} -40 ${b + 10} -84`}
          stroke="#c9a66b"
          strokeWidth={5}
          fill="none"
        />
      )}
    </g>
  );
}
