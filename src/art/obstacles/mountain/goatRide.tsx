import { memo, useId } from 'react';
import { Dust } from '../../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { SnowPine } from '../../worlds/mountain';
import { clamp01, fallen, heroPasses, lerp, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { CLIFF, CLIFF_DARK, CLIFF_SHADE, NS, P, SNOW, STONE } from './kit';
import { GOAT } from './layout';
import { Icicles, SnowBurst, SnowLedge } from './parts';

// ---------- Level 28: goat ride ----------
// goat (a mountain goat bounds down the ledges to him) → ride (he's on its back, bounding up
// them; each ledge's lip breaks away behind them) → off (he hops off at the top; it bounds away).

const FUR = '#f6f0e2';
const FUR_SHADE = '#cfc3ad';
const HORN = '#6a5c52';

/** Where the goat stands on the way down to him: the top ledge, the two below, then the path. */
const ARRIVAL: readonly (readonly [number, number])[] = [
  [GOAT.ledges[2][0] + 60, GOAT.ledges[2][1]],
  [GOAT.ledges[1][0], GOAT.ledges[1][1]],
  [GOAT.ledges[0][0], GOAT.ledges[0][1]],
  [GOAT.goatRest, 0],
];
const BOUND = 280;

function goatPose(p: ObstacleProps) {
  const goatAt = eventTime(p.events, 'goat');
  const rideAt = eventTime(p.events, 'ride');
  const offAt = eventTime(p.events, 'off');
  if (p.t < goatAt) return null;
  if (p.t < rideAt) {
    // It bounds down the ledges toward him, then skids to a stop and waits, wagging its tail.
    const dt = p.t - goatAt;
    const i = Math.min(ARRIVAL.length - 2, Math.floor(dt / BOUND));
    const u = clamp01((dt - i * BOUND) / BOUND);
    const [x0, l0] = ARRIVAL[i]!;
    const [x1, l1] = ARRIVAL[i + 1]!;
    const air = u < 1;
    return {
      x: lerp(x0, x1, u),
      lift: lerp(l0, l1, u) + 50 * Math.sin(Math.PI * u),
      facing: -1,
      leap: air,
      wag: !air,
    };
  }
  if (p.t < offAt) {
    return {
      x: p.heroX,
      lift: p.heroLift - GOAT.saddle,
      facing: 1,
      leap: p.heroLift - GOAT.saddle > groundAt(p.heroX) + 2,
      wag: false,
    };
  }
  const dt = p.t - offAt;
  const start = p.heroAt(offAt);
  return {
    x: start.x + 50 + dt * 0.7,
    lift: GOAT.top + 70 * Math.abs(Math.sin(dt / 190)),
    facing: 1,
    leap: true,
    wag: false,
  };
}

/** The height of the ground (the ledges' tops) at local x. */
function groundAt(x: number) {
  let top = 0;
  for (const [lx, lift] of GOAT.ledges) if (x >= lx - 70) top = lift;
  return top;
}

/** The goat's body and head (lined, cute: shaggy fur, curled horns, a beard, shiny eyes). */
const GoatBody = memo(function GoatBody() {
  return (
    <g>
      {/* A tuft of a tail. */}
      <path d="M-54 -78 Q-66 -86 -62 -96 Q-54 -90 -50 -82 Z" fill={FUR} {...ink(IN)} />
      {/* The shaggy body, its fur hanging in a fringe under the belly. */}
      <path
        d="M-56 -70 Q-56 -94 -20 -96 Q24 -98 46 -84 Q58 -74 52 -54 L44 -40 L36 -48 L28 -38 L18 -46 L8 -36 L-2 -46 L-12 -36 L-22 -46 L-32 -38 L-40 -48 L-50 -42 Q-58 -54 -56 -70 Z"
        fill={FUR}
        {...ink(OUT)}
      />
      <path
        d="M-50 -42 L-40 -48 L-32 -38 L-22 -46 L-12 -36 L-2 -46 L8 -36 L18 -46 L28 -38 L36 -48 L44 -40 Q40 -56 20 -58 Q-20 -60 -50 -54 Z"
        fill={FUR_SHADE}
      />
      <path
        d="M-30 -92 Q4 -98 36 -88"
        stroke="#ffffff"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-20 -70 q8 4 16 0 M10 -76 q8 4 14 -2"
        stroke={FUR_SHADE}
        strokeWidth={IN}
        fill="none"
        strokeLinecap="round"
      />
      {/* Neck and head. */}
      <path d="M30 -86 Q44 -112 62 -116 L74 -100 Q60 -88 50 -66 Z" fill={FUR} {...ink(OUT)} />
      <g transform="translate(70 -114)">
        {/* Horns curling back over its head. */}
        <path
          d="M-8 -12 Q-20 -36 -40 -30 Q-30 -26 -26 -18 Q-20 -10 -12 -6 Z"
          fill={HORN}
          {...ink(IN)}
        />
        <path
          d="M-2 -14 Q-6 -40 -28 -42 Q-18 -34 -16 -24 Q-12 -14 -6 -8 Z"
          fill={tint(HORN, 0.2)}
          {...ink(IN)}
        />
        <path
          d="M-16 -32 l4 4 M-24 -32 l2 5 M-10 -26 l5 2"
          stroke={shade(HORN, 0.4)}
          strokeWidth={1.4}
        />
        <path
          d="M-14 -4 Q-20 -14 -6 -16 Q14 -18 26 -6 Q36 4 30 14 Q22 22 8 18 Q-8 14 -14 -4 Z"
          fill={FUR}
          {...ink(OUT)}
        />
        <path d="M-12 -2 Q-10 10 6 16 Q-6 16 -12 -2 Z" fill={FUR_SHADE} />
        {/* An ear to the side. */}
        <path d="M-6 -10 Q-22 -14 -26 -4 Q-14 -2 -6 -4 Z" fill={FUR} {...ink(IN)} />
        <path d="M-8 -8 Q-18 -10 -21 -5 Q-14 -4 -8 -5 Z" fill="#f2b8c0" />
        {/* The beard. */}
        <path d="M14 16 Q12 30 18 38 Q22 28 26 14 Z" fill="#ffffff" {...ink(IN)} />
        {/* Its big shiny eye, nose and smile. */}
        <ellipse cx={8} cy={-4} rx={5.5} ry={6.5} fill="#ffffff" {...ink(1.6)} />
        <ellipse cx={9.5} cy={-3.5} rx={3.6} ry={4.6} fill="#3a2a20" />
        <circle cx={10.8} cy={-5.6} r={1.6} fill="#ffffff" />
        <circle cx={8.2} cy={-1.4} r={0.8} fill="#ffffff" />
        <path
          d="M2 -12 Q8 -14 14 -10"
          stroke={INK}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx={30} cy={8} rx={4} ry={3} fill="#e89aa4" {...ink(1.2)} />
        <path
          d="M20 14 Q25 17 29 13"
          stroke={INK}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
});

/** One leg from the body down to its hoof, `swing` degrees from straight. */
function Leg({ x, swing }: { x: number; swing: number }) {
  return (
    <g transform={`rotate(${swing.toFixed(1)} ${x} -46)`}>
      <path d={`M${x} -48 L${x} -6`} stroke={INK} strokeWidth={13} strokeLinecap="round" />
      <path d={`M${x} -48 L${x} -8`} stroke={FUR} strokeWidth={13 - 2 * IN} strokeLinecap="round" />
      <path d={`M${x - 5} -8 h10 l1 8 h-12 Z`} fill="#3a3038" {...ink(IN)} />
    </g>
  );
}

function Goat({
  x,
  lift,
  facing,
  leap,
  wag,
  t,
}: {
  x: number;
  lift: number;
  facing: number;
  leap: boolean;
  wag: boolean;
  t: number;
}) {
  const s = leap ? 26 : 0;
  const trot = leap ? 0 : 3 * Math.sin(t / 90);
  return (
    <g transform={`translate(${x.toFixed(1)} ${(-lift).toFixed(1)}) scale(${facing} 1)`}>
      <ellipse
        cx={0}
        cy={lift > 2 ? 4 : 0}
        rx={50}
        ry={7}
        fill="#1e2a5c"
        opacity={leap ? 0 : 0.2}
      />
      <Leg x={-36} swing={s + trot} />
      <Leg x={34} swing={-s - trot} />
      <g transform={wag ? `rotate(${(2 * Math.sin(t / 70)).toFixed(1)} -50 -80)` : undefined}>
        <GoatBody />
      </g>
      <Leg x={-24} swing={s - trot} />
      <Leg x={44} swing={-s + trot} />
    </g>
  );
}

/** How far a broken ledge's lip has gone: it now starts here, past its old edge. */
const BREAK = 12;

/**
 * The ledges stepping up the cliff (painted): faces in shadow, snow on top, icicles under.
 * The first `broken` ledges have lost their lips.
 */
const Ledges = memo(function Ledges({ broken }: { broken: number }) {
  const id = useId();
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-420} x2="0" y2={0}>
          <stop offset="0" stopColor={CLIFF} />
          <stop offset="1" stopColor={CLIFF_DARK} />
        </linearGradient>
      </defs>
      {/* The cliff above the top ledge, rising out of view. */}
      <path
        d={`M${GOAT.ledges[2][0] + 160} ${-GOAT.top - 8} Q1250 -560 1300 -900 H3000 V${-GOAT.top} Z`}
        fill={CLIFF_SHADE}
      />
      <path
        d={`M${GOAT.ledges[2][0] + 160} ${-GOAT.top - 8} Q1250 -560 1300 -900`}
        stroke={P.snowTop}
        strokeWidth={10}
        fill="none"
      />
      {GOAT.ledges.map(([x, lift], i) => {
        const gone = i < broken;
        const x0 = gone ? x + BREAK : x - 70;
        const face = gone
          ? `M${x0 - 8} 4 L${x0 + 6} ${-lift + 70} L${x0 - 6} ${-lift + 34} L${x0 + 4} ${-lift + 12} L${x0} ${-lift}`
          : `M${x0} 4 L${x0 - 6} ${-lift + 10} Q${x0 - 4} ${-lift} ${x0 + 10} ${-lift}`;
        return (
          <g key={x}>
            <path d={`${face} H3000 V4 Z`} fill={`url(#${id})`} />
            {/* The lit face turned to the sun, and cracks in the rock. */}
            <path
              d={`${face} L${x0 + 30} ${-lift} L${x0 + 18} 4 Z`}
              fill={gone ? CLIFF_SHADE : CLIFF}
              opacity={0.8}
            />
            <path
              d={`M${x + 50} ${-lift + 30} l14 26 l-6 24 M${x + 130} ${-lift + 50} l10 30`}
              stroke={CLIFF_DARK}
              strokeWidth={3}
              fill="none"
              opacity={0.5}
            />
            <Icicles x0={x0 + 4} x1={x + 40 + i * 20} y={-lift + 8} len={22} seed={i * 3 + 1} />
            <SnowLedge x0={x0 - 10} x1={1400} y={-lift} depth={14} />
          </g>
        );
      })}
      <SnowPine x={GOAT.ledges[1][0] + 120} y={-GOAT.ledges[1][1]} h={60} />
      <SnowPine x={GOAT.ledges[2][0] + 240} y={-GOAT.top} h={80} flip />
    </g>
  );
});

/** A ledge's lip breaking away behind them (lined: they stood on it). */
const Lip = memo(function Lip() {
  return (
    <g>
      <path
        d="M-74 2 Q-74 -8 -60 -8 L10 -8 L4 20 L-30 36 L-70 24 Z"
        fill={STONE}
        {...ink(OUT)}
        {...NS}
      />
      <path d="M-30 36 L-70 24 L-72 10 L-36 18 Z" fill={shade(STONE, 0.3)} />
      <path
        d="M-78 -6 Q-60 -18 -20 -14 Q0 -16 12 -8 L8 0 L-76 2 Z"
        fill={SNOW}
        {...ink(IN)}
        {...NS}
      />
    </g>
  );
});

export function GoatBack(p: ObstacleProps) {
  const rideAt = eventTime(p.events, 'ride');
  // Each lower ledge's lip breaks away once they've bounded on past it.
  const breaks = GOAT.ledges.slice(0, 2).map(([x]) => p.t - heroPasses(p, x + 100, rideAt));
  return (
    <g>
      <Ledges broken={breaks.filter((dt) => dt >= 0).length} />
      {GOAT.ledges.slice(0, 2).map(([x, lift], i) => {
        const dt = breaks[i]!;
        if (dt < 0) return null;
        const y = fallen(dt, 0.0026);
        return (
          <g key={x}>
            {y < 400 && (
              <g
                transform={`translate(${x + BREAK - 10} ${-lift + y}) rotate(${(-dt * 0.08).toFixed(1)})`}
              >
                <Lip />
              </g>
            )}
            <SnowBurst x={x - 30} y={-lift} dt={dt} size={0.45 + i * 0.1} ms={700} />
          </g>
        );
      })}
    </g>
  );
}

export function GoatFront(p: ObstacleProps) {
  const goat = goatPose(p);
  if (!goat) return null;
  const goatAt = eventTime(p.events, 'goat');
  const stopAt = goatAt + BOUND * (ARRIVAL.length - 1);
  return (
    <g>
      <Goat {...goat} t={p.t} />
      <Dust x={GOAT.goatRest + 30} y={-4} dt={p.t - stopAt} ms={500} size={0.6} color="#e4ecf8" />
      {[0, 1, 2].map((i) => (
        <SnowBurst
          key={i}
          x={ARRIVAL[i + 1]![0]}
          y={-ARRIVAL[i + 1]![1]}
          dt={p.t - goatAt - BOUND * (i + 1)}
          size={0.3}
          ms={500}
        />
      ))}
      {since(p, 'off') >= 0 && (
        <Dust
          x={goat.x - 40}
          y={-goat.lift}
          dt={since(p, 'off') % 380}
          ms={380}
          size={0.3}
          color="#e4ecf8"
        />
      )}
    </g>
  );
}
