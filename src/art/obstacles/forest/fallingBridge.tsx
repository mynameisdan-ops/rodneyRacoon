import { memo, useId } from 'react';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { PAINTED_FOREST } from '../../worlds/forestPalette';
import { fallen, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { FALLING_BRIDGE } from './layout';

// ---------- Level 15: falling bridge ----------
// creak → collapse (the planks drop one by one behind him as he runs).

/** The hero's running speed across the bridge (matches the script). */
const P = PAINTED_FOREST;

const BRIDGE_RUN = 0.78;
const PLANK = '#b07a46';
const ROPE = '#d8b070';

function plankFallAt(p: ObstacleProps, x: number) {
  const collapseAt = eventTime(p.events, 'collapse');
  const start = p.heroAt(collapseAt).x - FALLING_BRIDGE.lag;
  const [a] = FALLING_BRIDGE.ravine;
  // Planks already behind him go in a quick cascade; the rest as he runs past.
  if (x <= start) return collapseAt + ((x - a) / Math.max(1, start - a)) * 250;
  return collapseAt + 250 + (x - start) / BRIDGE_RUN;
}

/** A rope along `d`: ink, the rope, and its twist. */
function Rope({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth={8} />
      <path d={d} stroke={ROPE} strokeWidth={4.5} />
      <path d={d} stroke={shade(ROPE, 0.35)} strokeWidth={4.5} strokeDasharray="2 6" />
    </g>
  );
}

/** The ravine under the bridge (painted): mossy walls fading into misty depths. */
const Ravine = memo(function Ravine() {
  const id = useId();
  const [a, b] = FALLING_BRIDGE.ravine;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e5a3e" />
          <stop offset="0.5" stopColor="#173226" />
          <stop offset="1" stopColor="#08140e" />
        </linearGradient>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe8d6" stopOpacity={0} />
          <stop offset="0.5" stopColor="#cfe8d6" stopOpacity={0.35} />
          <stop offset="1" stopColor="#cfe8d6" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`M${a - 16} -4 L${a} 16 L${a + 30} 220 L${b - 30} 220 L${b} 16 L${b + 16} -4 Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M${b + 16} -4 L${b} 16 L${b - 30} 220 L${b - 60} 220 L${b - 22} 16 L${b - 4} -4 Z`}
        fill="#3e6a4a"
        opacity={0.7}
      />
      <rect x={a} y={70} width={b - a} height={90} fill={`url(#${id}m)`} />
      <g fill={P.fern}>
        <path
          d={`M${a - 6} 0 q-6 18 4 34 q2 -16 -4 -34 Z M${b + 6} 0 q8 20 -2 38 q-4 -18 2 -38 Z`}
        />
      </g>
    </g>
  );
});

/** A bridge post with its rope tied on (memoized: it never moves). */
const BridgePost = memo(function BridgePost({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 9} y={-92} width={18} height={98} rx={4} fill={PLANK} {...ink(OUT)} />
      <rect x={x - 8} y={-90} width={6} height={94} fill={shade(PLANK, 0.3)} />
      <path
        d={`M${x + 5} -86 V0`}
        stroke={tint(PLANK, 0.5)}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d={`M${x - 11} -80 h22 M${x - 11} -74 h22`}
        stroke={INK}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d={`M${x - 11} -80 h22 M${x - 11} -74 h22`}
        stroke={ROPE}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
});

/** A plank of the bridge: wood with grain, a lit top and a shadowed edge (memoized). */
const Plank = memo(function Plank() {
  return (
    <g>
      <rect x={-22} y={-6} width={44} height={12} rx={2} fill={PLANK} {...ink(IN + 1)} />
      <rect x={-21} y={2} width={42} height={3} fill={shade(PLANK, 0.3)} />
      <path d="M-18 -3.4 H16" stroke={tint(PLANK, 0.5)} strokeWidth={1.4} />
      <path d="M-12 -0.5 h10 M6 0.5 h8" stroke={shade(PLANK, 0.4)} strokeWidth={1} />
    </g>
  );
});

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
      <Ravine />
      <BridgePost x={a - 10} />
      <BridgePost x={b + 10} />
      {planks.map((x, i) => {
        const dt = p.t - plankFallAt(p, x);
        const y = fallen(dt, 0.0028) + wobble * Math.sin(i);
        if (y > 300) return null;
        return (
          <g
            key={x}
            transform={`translate(${x + 22} ${y}) rotate(${dt > 0 ? (noise(i) - 0.5) * dt * 0.4 : 0})`}
          >
            <Plank />
          </g>
        );
      })}
      {/* The rope rail: taut from the break to the far post, dangling from the near one. */}
      {p.t >= collapseAt ? (
        <g>
          <Rope d={`M${front} -70 Q${(front + b) / 2} -40 ${b + 10} -84`} />
          <Rope d={`M${a - 10} -84 q 20 60 6 ${140 + 20 * Math.sin(p.t / 300)}`} />
        </g>
      ) : (
        <Rope d={`M${a - 10} -84 Q${(a + b) / 2} -40 ${b + 10} -84`} />
      )}
    </g>
  );
}
