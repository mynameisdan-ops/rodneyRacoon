import { memo, useId } from 'react';
import { INK, ink, mix, shade, tint } from '../../style';
import { PAINTED_MINE } from '../../worlds/minePalette';
import { noise, roundPath } from '../sceneKit';
import { BOULDER_R, CRYSTALS, IN, IRON, OUT, RAIL_TOP, ROCK, STEEL, WOOD } from './kit';

/*
 * Shared pieces for the World 1 (mine) obstacles. Local coordinates, ground line at y = 0.
 * What he touches (carts, boulders, chains) is drawn like him: a bold line around the
 * silhouette, thin lines inside, one crisp shadow shape and a rim light, lit from the upper
 * right. The ground around it (pits, ledges, rails, beams overhead) is painted like the backdrop.
 */

const P = PAINTED_MINE;

/** A wheel at (x, y) that has turned `spin` degrees: iron, spokes, a hub and a lit rim. */
function Wheel({
  x,
  y,
  r,
  spin,
  color = '#3a3f47',
}: {
  x: number;
  y: number;
  r: number;
  spin: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={color} {...ink(OUT)} />
      <g
        transform={`rotate(${spin})`}
        stroke={tint(IRON, 0.25)}
        strokeWidth={3}
        strokeLinecap="round"
      >
        <path d={`M${-r * 0.72} 0 H${r * 0.72} M0 ${-r * 0.72} V${r * 0.72}`} />
      </g>
      <path
        d={`M${r * 0.15} ${-r * 0.78} A${r * 0.8} ${r * 0.8} 0 0 1 ${r * 0.78} ${-r * 0.15}`}
        stroke={tint(color, 0.55)}
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
      />
      <circle r={r * 0.28} fill={tint(IRON, 0.45)} {...ink(IN)} />
    </g>
  );
}

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
        <Wheel key={wx} x={wx} y={RAIL_TOP - 15} r={15} spin={spin} />
      ))}
      <CartBody />
    </g>
  );
}

/** The cart's body: drawn once (memoized), since only its wheels change as it rolls. */
const CartBody = memo(function CartBody() {
  return (
    <g>
      <path
        d="M-49 -34 Q-52 -34 -52.5 -38 L-60 -108 L60 -108 L52.5 -38 Q52 -34 49 -34 Z"
        fill={WOOD}
        {...ink(OUT)}
      />
      {/* Its shadow side and its underside, then the planks and a rim light. */}
      <path
        d="M-52.5 -38 L-60 -108 L-36 -108 L-31 -36 L-49 -34 Q-52 -34 -52.5 -38 Z"
        fill={shade(WOOD, 0.3)}
      />
      <path d="M-51 -34 L51 -34 L53 -48 L-53 -48 Z" fill={shade(WOOD, 0.42)} />
      <path d="M-55.5 -62 H55.5 M-58 -86 H58" stroke={INK} strokeWidth={IN} />
      <path
        d="M55.5 -100 L50 -52"
        stroke={tint(WOOD, 0.55)}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <path
        d="M-20 -95 l10 4 M18 -70 l9 -3"
        stroke={shade(WOOD, 0.4)}
        strokeWidth={IN}
        strokeLinecap="round"
      />
      {[-38, 38].map((sx) => (
        <g key={sx}>
          <path
            d={`M${sx - 5} -35 L${sx + 5} -35 L${sx * 1.15 + 5} -108 L${sx * 1.15 - 5} -108 Z`}
            fill={sx < 0 ? shade(IRON, 0.25) : IRON}
            {...ink(IN)}
          />
          {[-50, -76, -100].map((ry) => (
            <circle
              key={ry}
              cx={sx * (1 + ((-ry - 35) / 73) * 0.15)}
              cy={ry}
              r={1.8}
              fill={tint(IRON, 0.6)}
            />
          ))}
        </g>
      ))}
      <rect x={-66} y={-123} width={132} height={15} rx={5} fill={IRON} {...ink(OUT)} />
      <rect x={-63} y={-114} width={126} height={4} rx={2} fill={shade(IRON, 0.35)} />
      <path d="M-58 -119.5 H60" stroke={tint(IRON, 0.6)} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
});

/** A heap of rock and glowing crystal ore above the cart's rim. */
const Ore = memo(function Ore() {
  return (
    <g>
      <path
        d="M-58 -118 Q-46 -158 -12 -150 Q16 -176 44 -150 Q62 -138 58 -118 Z"
        fill={ROCK}
        {...ink(OUT)}
      />
      <path d="M-58 -118 Q-46 -158 -12 -150 Q-26 -138 -30 -118 Z" fill={shade(ROCK, 0.3)} />
      {[
        [-30, -128, -22, -170, -12, -128, 0],
        [6, -134, 18, -182, 30, -136, 1],
        [34, -128, 44, -160, 53, -124, 2],
      ].map(([x0, y0, x1, y1, x2, y2, c], i) => {
        const color = CRYSTALS[c!]!;
        return (
          <g key={i}>
            <path d={`M${x0} ${y0} L${x1} ${y1} L${x2} ${y2} Z`} fill={color} {...ink(2.4)} />
            <path
              d={`M${x1} ${y1} L${x2} ${y2} L${(x1! + x2!) / 2} ${y2} Z`}
              fill={shade(color, 0.3)}
            />
            <path
              d={`M${x0! + 3} ${y0! - 4} L${x1! - 1} ${y1! + 8}`}
              stroke={tint(color, 0.7)}
              strokeWidth={1.6}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
});

/** The inside of a cart's far wall, seen behind the rider. Draw behind the hero. */
export function CartRim({ x, lift = 0, tilt = 0 }: { x: number; lift?: number; tilt?: number }) {
  return (
    <path
      transform={`translate(${x} ${-lift}) rotate(${tilt} 0 -24)`}
      d="M-58 -116 L58 -116 L54 -128 L-54 -128 Z"
      fill="#3a2418"
      {...ink(OUT)}
    />
  );
}

const R = BOULDER_R;
/** The boulder's lumpy outline: a circle pushed out a little here and there. */
const BOULDER_EDGE = roundPath(
  Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2;
    const m = 1 + 0.06 * noise(i, 4);
    return [Math.cos(a) * R * m, Math.sin(a) * R * m] as const;
  }),
);
const BOULDER_SHADOW = `M${(-0.945 * R).toFixed(1)} ${(0.17 * R).toFixed(1)} A${0.96 * R} ${0.96 * R} 0 0 0 ${(0.33 * R).toFixed(1)} ${(0.9 * R).toFixed(1)} Q${(-0.42 * R).toFixed(1)} ${(0.6 * R).toFixed(1)} ${(-0.945 * R).toFixed(1)} ${(0.17 * R).toFixed(1)} Z`;

/**
 * A big round boulder: its lumps, cracks and chips turn as it rolls (`spin`, degrees) while its
 * shadow and shine stay put, lit from the upper right. Both are drawn once (memoized); only their
 * transforms change as it rolls.
 */
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
      <g transform={`rotate(${spin})`}>
        <BoulderEdge line={4.2 / k} />
      </g>
      <BoulderShadow />
      <g transform={`rotate(${spin})`}>
        <BoulderCracks line={2.2 / k} />
      </g>
      <BoulderShine />
    </g>
  );
}

const BoulderEdge = memo(function BoulderEdge({ line }: { line: number }) {
  return <path d={BOULDER_EDGE} fill={ROCK} {...ink(line)} />;
});

const BoulderShadow = memo(function BoulderShadow() {
  return <path d={BOULDER_SHADOW} fill={shade(ROCK, 0.36)} />;
});

const BoulderCracks = memo(function BoulderCracks({ line }: { line: number }) {
  return (
    <g fill="none" stroke={INK} strokeWidth={line} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-12 -22 L2 -6 L-4 12 M2 -6 L20 -2" />
      <path d="M-42 16 L-28 24" />
      <path d="M22 -42 L30 -30" />
      <path d="M30 22 Q36 30 34 40" />
      <circle cx={-26} cy={-28} r={5} fill={shade(ROCK, 0.25)} stroke="none" />
      <circle cx={-14} cy={34} r={6} fill={shade(ROCK, 0.3)} stroke="none" />
      <circle cx={40} cy={4} r={4} fill={shade(ROCK, 0.25)} stroke="none" />
    </g>
  );
});

const BoulderShine = memo(function BoulderShine() {
  return (
    <g>
      <path
        d={`M${0.14 * R} ${-0.77 * R} A${0.78 * R} ${0.78 * R} 0 0 1 ${0.77 * R} ${-0.14 * R}`}
        stroke={tint(ROCK, 0.5)}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx={0.3 * R}
        cy={-0.52 * R}
        rx={9}
        ry={5}
        transform={`rotate(40 ${0.3 * R} ${-0.52 * R})`}
        fill={tint(ROCK, 0.7)}
      />
    </g>
  );
});

/** A small rock (for rockfalls and rubble), resting on its base at (x, y). */
export function Rock({ x, y, s, spin = 0 }: { x: number; y: number; s: number; spin?: number }) {
  const k = s / 20;
  return (
    <g transform={`translate(${x} ${y}) rotate(${spin}) scale(${k})`}>
      <RockShape out={Math.min(OUT, s * 0.16) / k} rim={2.4 / k} />
    </g>
  );
}

/** A small rock's drawing, 40 across, for a given line weight (memoized). */
const RockShape = memo(function RockShape({ out, rim }: { out: number; rim: number }) {
  return (
    <g>
      <path
        d="M-20 0 Q-22 -10 -15 -15 L-3 -21 Q9 -23 15 -16 Q21 -9 20 0 Z"
        fill={ROCK}
        {...ink(out)}
      />
      <path d="M-20 0 Q-22 -10 -15 -15 L-9 -12 Q-11 -4 -4 0 Z" fill={shade(ROCK, 0.32)} />
      <path d="M-4 0 Q4 -4 19 -3 Q20 -1 20 0 Z" fill={shade(ROCK, 0.32)} />
      <path
        d="M-1 -19.5 Q9 -21 14 -14.5"
        stroke={tint(ROCK, 0.5)}
        strokeWidth={rim}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

/** A chasm in the floor from a to b (hides the rails there), dark down to the bottom of the screen. */
export function Pit({ a, b }: { a: number; b: number }) {
  const id = useId();
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2230" />
          <stop offset="0.3" stopColor="#1a0e16" />
          <stop offset="1" stopColor="#07040a" />
        </linearGradient>
      </defs>
      <path
        d={`M${a - 14} -4 L${a} -14 L${b} -14 L${b + 14} -4 L${b + 4} 200 L${a - 4} 200 Z`}
        fill={`url(#${id})`}
      />
      {/* The far wall catches a little light; the near one is in shadow. */}
      <path
        d={`M${b} -12 L${b - 22} 200 L${b + 4} 200 L${b + 14} -4 Z`}
        fill="#5a3640"
        opacity={0.75}
      />
      <path d={`M${a} -12 L${a + 18} 200 L${a - 4} 200 L${a - 14} -4 Z`} fill="#160c13" />
      <g stroke="#7a4a4a" strokeWidth={2.5} opacity={0.45} strokeLinecap="round">
        <path
          d={`M${b - 3} 24 L${b - 11} 26 M${b - 8} 62 L${b - 16} 65 M${b - 12} 104 L${b - 19} 106`}
        />
      </g>
    </g>
  );
}

/**
 * A pit's near lip: the floor in front of it, shaded like the floor around it so it reads as
 * ground, with its broken edge lit. Draw it after things falling in, so they drop behind it.
 */
export function PitLip({ a, b }: { a: number; b: number }) {
  const id = useId();
  const mid = (a + b) / 2;
  const edge = `M${a - 34} 44 Q${a - 8} 40 ${a + 30} 22 L${mid} 34 L${b - 20} 20 Q${b + 10} 38 ${b + 34} 44`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="20" x2="0" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={mix(P.ground, P.groundDark, 0.45)} />
          <stop offset="1" stopColor={P.groundDark} />
        </linearGradient>
      </defs>
      <path d={`${edge} V200 H${a - 34} Z`} fill={`url(#${id})`} />
      <path
        d={`M${a + 30} 22 L${mid} 34 L${b - 20} 20`}
        stroke={P.groundTop}
        strokeWidth={3.5}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.8}
      />
      <g fill={P.gravelDark}>
        <ellipse cx={a + 12} cy={48} rx={6} ry={3} />
        <ellipse cx={mid + 30} cy={56} rx={5} ry={2.6} />
        <ellipse cx={b - 40} cy={46} rx={7} ry={3} />
        <ellipse cx={mid - 50} cy={84} rx={8} ry={3.2} />
      </g>
      <g fill={P.gravel}>
        <ellipse cx={a + 11} cy={46.5} rx={3} ry={1.4} />
        <ellipse cx={b - 41} cy={44.5} rx={3.4} ry={1.4} />
      </g>
    </g>
  );
}

/**
 * A stretch of track from a to b whose rail top is `lift` px up, painted like the backdrop's:
 * sleepers lit along their tops and a steel rail with a bright edge (`bed` adds the gravel).
 */
export function Rails({
  a,
  b,
  lift = 0,
  bed = false,
}: {
  a: number;
  b: number;
  lift?: number;
  bed?: boolean;
}) {
  const ties = [];
  for (let x = a + 6; x < b - 20; x += 40) ties.push(x);
  return (
    <g transform={`translate(0 ${-lift})`}>
      {bed && <rect x={a} y={-1} width={b - a} height={15} fill={P.gravelDark} />}
      {ties.map((x) => (
        <g key={x}>
          <rect x={x} y={-1} width={26} height={11} rx={1.5} fill={P.sleeper} />
          <rect x={x} y={-1} width={26} height={2.6} fill={P.sleeperLight} />
          <rect x={x} y={7} width={26} height={3} fill={P.sleeperDark} />
        </g>
      ))}
      <rect x={a} y={RAIL_TOP} width={b - a} height={8} fill={P.rail} />
      <rect x={a} y={RAIL_TOP + 5} width={b - a} height={3} fill={P.railDark} />
      <rect x={a} y={RAIL_TOP} width={b - a} height={1.8} fill={P.railLight} />
    </g>
  );
}

/** A hanging chain from (x1, y1) to (x2, y2): links drawn as a dashed steel line over ink. */
export function Chain({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const d = `M${x1} ${y1} L${x2} ${y2}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth={9.5} />
      <path d={d} stroke={STEEL} strokeWidth={5.5} strokeDasharray="9 5" />
      <path
        d={d}
        stroke={tint(STEEL, 0.7)}
        strokeWidth={1.8}
        strokeDasharray="4 10"
        strokeDashoffset={-3}
      />
    </g>
  );
}

/** A timber beam across the tunnel roof, for hooks, pulleys and lanterns (painted). */
export function RoofBeam({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - 12} width={w} height={24} fill={P.timber} />
      <rect x={x - w / 2} y={y + 4} width={w} height={8} fill={P.timberDark} />
      <rect x={x - w / 2} y={y - 12} width={w} height={3} fill={P.timberLight} opacity={0.7} />
      <circle cx={x - w / 2 + 14} cy={y - 2} r={2.6} fill={P.iron} />
      <circle cx={x + w / 2 - 14} cy={y - 2} r={2.6} fill={P.iron} />
    </g>
  );
}

/** A dark opening in the rock, painted: deepest in the middle, lit a little around its rim. */
export function HoleDefs({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="0.5" cy="0.6" r="0.6">
      <stop offset="0" stopColor="#05030a" />
      <stop offset="0.7" stopColor="#1a0f18" />
      <stop offset="1" stopColor="#3a2430" />
    </radialGradient>
  );
}

/** A painted timber beam from (x1, y1) to (x2, y2), lit along one edge. */
export function Timber({
  x1,
  y1,
  x2,
  y2,
  w,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
}) {
  const d = `M${x1} ${y1} L${x2} ${y2}`;
  return (
    <g strokeLinecap="round" fill="none">
      <path d={d} stroke={P.timberDark} strokeWidth={w} />
      <path d={d} stroke={P.timber} strokeWidth={w * 0.62} transform={`translate(${w * 0.16} 0)`} />
    </g>
  );
}
