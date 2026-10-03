import { INK, ink, shade, tint } from '../style';
import { BOULDER_R, CRYSTALS, IRON, RAIL_TOP, ROCK, STEEL, WOOD } from './mineKit';

/** Shared pieces for the World 1 (mine) obstacles. Local coordinates, ground line at y = 0. */

/** A mine cart with its base `lift` px above the rails at x. Draw in front of the hero. */
export function MineCart({
  x,
  lift = 0,
  tilt = 0,
  ore = false,
}: {
  x: number;
  lift?: number;
  tilt?: number;
  ore?: boolean;
}) {
  const spin = (x / 15) * (180 / Math.PI);
  return (
    <g transform={`translate(${x} ${-lift}) rotate(${tilt} 0 -24)`}>
      {ore && <Ore />}
      {[-30, 30].map((wx) => (
        <g key={wx} transform={`translate(${wx} ${RAIL_TOP - 15}) rotate(${spin})`}>
          <circle r={15} fill="#3a3f47" {...ink(3)} />
          <path d="M-11 0 H11 M0 -11 V11" stroke={tint(IRON, 0.3)} strokeWidth={3} />
          <circle r={4} fill={tint(IRON, 0.4)} {...ink(1.5)} />
        </g>
      ))}
      <path d="M-50 -34 L50 -34 L60 -116 L-60 -116 Z" fill={WOOD} {...ink(3.5)} />
      <path d="M-50 -34 L50 -34 L52 -52 L-52 -52 Z" fill={shade(WOOD, 0.35)} />
      <path d="M-56 -84 L56 -84" stroke={shade(WOOD, 0.4)} strokeWidth={3} />
      {[-36, 0, 36].map((sx) => (
        <path key={sx} d={`M${sx} -36 L${sx * 1.18} -114`} stroke={IRON} strokeWidth={9} />
      ))}
      <rect x={-64} y={-122} width={128} height={13} rx={3} fill={IRON} {...ink(3)} />
      <rect x={-60} y={-120} width={120} height={3} fill={tint(IRON, 0.5)} />
      {[-50, -18, 18, 50].map((rx) => (
        <circle key={rx} cx={rx} cy={-115} r={2.4} fill={tint(IRON, 0.6)} />
      ))}
    </g>
  );
}

/** A heap of rock and glowing crystal ore above the cart's rim. */
function Ore() {
  return (
    <g {...ink(2.5)}>
      <path d="M-58 -118 Q-40 -160 -8 -152 Q20 -176 44 -150 Q60 -140 58 -118 Z" fill={ROCK} />
      <path d="M-30 -130 L-22 -168 L-12 -128 Z" fill={CRYSTALS[0]} />
      <path d="M8 -132 L18 -178 L28 -134 Z" fill={CRYSTALS[1]} />
      <path d="M34 -126 L44 -156 L52 -124 Z" fill={CRYSTALS[2]} />
    </g>
  );
}

/** The inside of a cart's far wall, seen behind the rider. Draw behind the hero. */
export function CartRim({ x, lift = 0, tilt = 0 }: { x: number; lift?: number; tilt?: number }) {
  return (
    <path
      transform={`translate(${x} ${-lift}) rotate(${tilt} 0 -24)`}
      d="M-58 -116 L58 -116 L54 -128 L-54 -128 Z"
      fill="#2a1a14"
      {...ink(3)}
    />
  );
}

export function Boulder({
  x,
  y,
  spin,
  r = BOULDER_R,
}: {
  x: number;
  y: number;
  spin: number;
  r?: number;
}) {
  const k = r / BOULDER_R;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <circle r={BOULDER_R} fill={ROCK} {...ink(4 / k)} />
      <path
        d={`M${-BOULDER_R * 0.95} 10 A${BOULDER_R} ${BOULDER_R} 0 0 0 ${BOULDER_R * 0.4} ${BOULDER_R * 0.92} Q ${-BOULDER_R * 0.5} ${BOULDER_R * 0.6} ${-BOULDER_R * 0.95} 10 Z`}
        fill={shade(ROCK, 0.4)}
      />
      <path
        d="M8 -44 Q30 -40 40 -22"
        fill="none"
        stroke={tint(ROCK, 0.4)}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <g
        transform={`rotate(${spin})`}
        fill="none"
        stroke={INK}
        strokeWidth={3}
        strokeLinecap="round"
      >
        <path d="M-10 -20 L4 -4 L-2 12 M4 -4 L22 0" />
        <path d="M-40 18 L-26 26" />
        <path d="M24 -40 L30 -28" />
        <circle cx={-24} cy={-26} r={5} fill={shade(ROCK, 0.25)} stroke="none" />
        <circle cx={30} cy={30} r={7} fill={shade(ROCK, 0.25)} stroke="none" />
      </g>
    </g>
  );
}

/** A small rock (for rockfalls and rubble), resting on its base at (x, y). */
export function Rock({ x, y, s, spin = 0 }: { x: number; y: number; s: number; spin?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${spin}) scale(${s / 20})`}>
      <path d="M-20 0 L-15 -14 L-2 -21 L14 -16 L20 0 Z" fill={ROCK} {...ink((2.5 * 20) / s)} />
      <path d="M-15 -14 L-2 -21 L2 -9 Z" fill={tint(ROCK, 0.25)} />
      <path d="M20 0 L-20 0 L0 -6 Z" fill={shade(ROCK, 0.3)} />
    </g>
  );
}

/** A chasm in the floor from a to b (hides the rails there), dark down to the bottom of the screen. */
export function Pit({ a, b }: { a: number; b: number }) {
  return (
    <g>
      <path
        d={`M${a - 14} -4 L${a} -14 L${b} -14 L${b + 14} -4 L${b + 4} 200 L${a - 4} 200 Z`}
        fill="#140b12"
        {...ink(3)}
      />
      <path d={`M${a} -10 L${a + 26} 200 L${a - 4} 200 Z`} fill="#2e1d24" />
      <path d={`M${b} -10 L${b - 18} 200 L${b + 4} 200 Z`} fill="#241620" />
    </g>
  );
}

/** A pit's near lip: draw it after things falling in, so they drop behind it. */
export function PitLip({ a, b }: { a: number; b: number }) {
  const mid = (a + b) / 2;
  return (
    <path
      d={`M${a - 20} 40 L${a + 30} 22 L${mid} 34 L${b - 20} 20 L${b + 20} 40 V200 H${a - 20} Z`}
      fill="#3d2a20"
      {...ink(3)}
    />
  );
}

/** A stretch of track (sleepers and rail) from a to b whose rail top is `lift` px up. */
export function Rails({ a, b, lift = 0 }: { a: number; b: number; lift?: number }) {
  const ties = [];
  for (let x = a + 6; x < b - 20; x += 40) ties.push(x);
  return (
    <g transform={`translate(0 ${-lift})`}>
      {ties.map((x) => (
        <rect key={x} x={x} y={-1} width={26} height={11} rx={2} fill={WOOD} {...ink(2)} />
      ))}
      <rect x={a} y={RAIL_TOP} width={b - a} height={8} fill={STEEL} {...ink(2)} />
      <rect x={a + 2} y={RAIL_TOP + 1} width={b - a - 4} height={2} fill={tint(STEEL, 0.6)} />
    </g>
  );
}

/** A hanging chain from (x1, y1) to (x2, y2). */
export function Chain({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const d = `M${x1} ${y1} L${x2} ${y2}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth={9} />
      <path d={d} stroke={STEEL} strokeWidth={5} strokeDasharray="9 5" />
    </g>
  );
}

/** A timber beam across the tunnel roof, for hooks, pulleys and lanterns. */
export function RoofBeam({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - 12} width={w} height={24} fill={WOOD} {...ink(3)} />
      <rect x={x - w / 2} y={y + 4} width={w} height={8} fill={shade(WOOD, 0.35)} />
    </g>
  );
}
