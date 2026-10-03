import { memo, useId } from 'react';
import { Dust, SpeedLines } from '../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../style';
import { PAINTED_FOREST } from '../worlds/forestPalette';
import {
  BOAR,
  BRAMBLE,
  FALLING_BRIDGE,
  FIREFLIES,
  LOG_ROLL,
  MUSHROOMS,
  ROOT_SLIDE,
} from './forestLayout';
import {
  bump,
  clamp01,
  easeOut,
  fallen,
  lerp,
  noise,
  progress,
  rollAngle,
  roundPath,
  since,
} from './sceneKit';
import { eventTime, type ObstacleProps } from './types';

/*
 * World 2 (Whispering Forest) scenes, levels 9–16, in the cartoon look (M7b; level 12's vine
 * swing is in vineSwing.tsx). What he touches, and the animals, are lined like him: a bold line
 * around the silhouette, thin lines inside, one crisp shadow shape and a rim light, lit from the
 * upper right. The ground around them (the hollow, the bog, the ravine, the night) is painted
 * like the backdrop. Every motion is computed from `t` and the prop schedule, so any frame can be
 * drawn exactly; parts that never change are memoized, since obstacles redraw every frame.
 */

const P = PAINTED_FOREST;
const BARK = '#7a5234';
const HEART = '#e8b878';
const LEAF = '#3f9a4a';
const LEAF_LIGHT = '#8fd06a';
const MOSS = '#68b84a';
const ROOT = '#6e4630';
const EARTH_TOP = '#6a4630';
const EARTH_DEEP = '#1d120b';
const SPEED_YS = [-60, -90, -120, -40];

/** Leaves bursting out from (x, y) and fluttering down. */
function LeafBurst({ x, y, dt, count = 10 }: { x: number; y: number; dt: number; count?: number }) {
  if (!(dt >= 0 && dt < 1400)) return null;
  return (
    <g opacity={1 - dt / 1400}>
      {Array.from({ length: count }, (_, i) => {
        const a = -Math.PI * (0.1 + 0.8 * noise(i, 3));
        const d = dt * (0.25 + 0.2 * noise(i, 5));
        const px = x + Math.cos(a) * d + 12 * Math.sin(dt / 120 + i);
        const py = y + Math.sin(a) * d + 0.0004 * dt * dt;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${dt * 0.3 + i * 40})`}>
            <path d="M-8 0 Q0 -7 8 0 Q0 7 -8 0 Z" fill={i % 2 ? LEAF : LEAF_LIGHT} {...ink(1.3)} />
            <path d="M-5 0 H5" stroke={shade(LEAF, 0.35)} strokeWidth={0.9} />
          </g>
        );
      })}
    </g>
  );
}

/**
 * A clump of foliage drawn like his props: overlapping lobes under one bold outline (the ink is a
 * wider stroke behind the fills, so the inner overlaps stay clean), leaf tips poking out around
 * its edge, a shadowed underside and a lit top. `lobes` are [x, y, r]. Use it memoized: it's a
 * lot of shapes.
 */
function LinedFoliage({
  lobes,
  color = LEAF,
}: {
  lobes: readonly (readonly number[])[];
  color?: string;
}) {
  return (
    <g>
      {/* Leaf tips, drawn first so the lobes cover all but the ends that stick out. */}
      {lobes.map(([x, y, r], i) =>
        Array.from({ length: 8 }, (_, j) => {
          const a = (j / 8) * Math.PI * 2 + i * 0.7;
          const s = (r! / 26) * (0.8 + 0.4 * noise(i * 8 + j, 2));
          return (
            <path
              key={`${i}-${j}`}
              d="M0 0 Q7 -5.5 16 0 Q7 5.5 0 0 Z"
              transform={`translate(${x! + Math.cos(a) * r! * 0.84} ${y! + Math.sin(a) * r! * 0.84}) rotate(${(a * 180) / Math.PI}) scale(${s})`}
              fill={Math.sin(a) < -0.2 ? tint(color, 0.2) : shade(color, 0.2)}
              {...ink(1.5 / s)}
            />
          );
        }),
      )}
      <g fill={INK} stroke={INK} strokeWidth={OUT * 2}>
        {lobes.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g fill={shade(color, 0.28)}>
        {lobes.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g fill={color}>
        {lobes.map(([x, y, r], i) => (
          <circle key={i} cx={x! + r! * 0.12} cy={y! - r! * 0.16} r={r! * 0.86} />
        ))}
      </g>
      <g fill={tint(color, 0.35)}>
        {lobes.map(([x, y, r], i) => (
          <circle key={i} cx={x! + r! * 0.3} cy={y! - r! * 0.42} r={r! * 0.38} />
        ))}
      </g>
    </g>
  );
}

/** A dark cutaway hollow in the earth from a to b, `depth` px deep (painted). */
function Hollow({ a, b, depth }: { a: number; b: number; depth: number }) {
  const id = useId();
  const mid = (a + b) / 2;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={EARTH_TOP} />
          <stop offset="1" stopColor={EARTH_DEEP} />
        </linearGradient>
      </defs>
      <path
        d={`M${a - 10} -2 L${a + 10} ${depth + 50} Q${mid} ${depth + 90} ${b - 10} ${depth + 50} L${b + 10} -2 Z`}
        fill={`url(#${id})`}
      />
      {/* The far wall catches the light; strata run across the earth; roots hang over the edges. */}
      <path
        d={`M${b + 10} -2 L${b - 10} ${depth + 50} L${b - 36} ${depth + 56} L${b - 16} -2 Z`}
        fill={tint(EARTH_TOP, 0.18)}
        opacity={0.6}
      />
      <g
        stroke={shade(EARTH_TOP, 0.35)}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.55}
        fill="none"
      >
        <path d={`M${a + 16} 30 Q${mid} 46 ${b - 16} 30`} />
        <path
          d={`M${a + 24} ${depth * 0.75} Q${mid} ${depth * 0.75 + 18} ${b - 24} ${depth * 0.75}`}
        />
      </g>
      <g stroke="#4a2f1e" strokeWidth={3.5} fill="none" strokeLinecap="round">
        <path d={`M${a - 2} 2 q 10 26 2 50`} />
        <path d={`M${a + 12} 2 q -6 18 6 32`} />
        <path d={`M${b + 2} 2 q -12 28 -2 54`} />
        <path d={`M${mid - 120} 2 q 6 20 -4 36`} />
      </g>
    </g>
  );
}

// ---------- Level 9: log roll ----------
// rumble (a huge log rolls up behind him) → ride (he runs on top) → hit (it slams into a stump).

function logX(p: ObstacleProps) {
  const rumbleAt = eventTime(p.events, 'rumble');
  const rideAt = eventTime(p.events, 'ride');
  const hitAt = eventTime(p.events, 'hit');
  if (p.t < rumbleAt) return null;
  if (p.t < rideAt) {
    const target = p.heroAt(rideAt).x;
    return lerp(LOG_ROLL.logStart, target, (p.t - rumbleAt) / (rideAt - rumbleAt));
  }
  if (p.t < hitAt) return Math.min(p.heroX, LOG_ROLL.stop);
  return LOG_ROLL.stop - 18 * bump(p.t - hitAt, 350);
}

const LR = LOG_ROLL.r;
/** The log's bark rim, a little lumpy, seen end-on. */
const LOG_EDGE = roundPath(
  Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const m = 1 + 0.035 * noise(i, 8);
    return [Math.cos(a) * LR * m, Math.sin(a) * LR * m] as const;
  }),
);
const FACE = LR - 13;

/** The log rolling end-on: its bark, moss and the rings of its cut face turn as it rolls. */
function Log({ x }: { x: number }) {
  const spin = rollAngle(x - LOG_ROLL.logStart, LR);
  return (
    <g transform={`translate(${x} ${-LR})`}>
      <g transform={`rotate(${spin})`}>
        <LogTurning />
      </g>
      <LogLight />
    </g>
  );
}

const LogTurning = memo(function LogTurning() {
  return (
    <g>
      <path d={LOG_EDGE} fill={BARK} {...ink(OUT + 1)} />
      <g stroke={shade(BARK, 0.45)} strokeWidth={IN} strokeLinecap="round">
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + 0.1;
          return (
            <path
              key={i}
              d={`M${Math.cos(a) * (LR - 5)} ${Math.sin(a) * (LR - 5)} L${Math.cos(a) * (LR + 1)} ${Math.sin(a) * (LR + 1)}`}
            />
          );
        })}
      </g>
      {/* Moss and a little mushroom riding round on the bark. */}
      <path
        d={`M${-LR * 0.98} ${-LR * 0.2} A${LR} ${LR} 0 0 1 ${-LR * 0.55} ${-LR * 0.84} L${-LR * 0.5} ${-LR * 0.74} A${LR - 10} ${LR - 10} 0 0 0 ${-LR * 0.86} ${-LR * 0.17} Z`}
        fill={MOSS}
        {...ink(IN)}
      />
      <g transform={`rotate(-58) translate(0 ${-LR - 1})`}>
        <path d="M-3 0 Q-4 -7 -2 -11 L2 -11 Q4 -7 3 0 Z" fill="#f3e6cf" {...ink(1.2)} />
        <path
          d="M-11 -9 Q-10 -21 0 -22 Q10 -21 11 -9 Q0 -12 -11 -9 Z"
          fill="#e2452f"
          {...ink(1.4)}
        />
        <circle cx={-3} cy={-16} r={2} fill="#fff" />
        <circle cx={4} cy={-13} r={1.6} fill="#fff" />
      </g>
      {/* The cut face: rings, a crack, the heart. */}
      <circle r={FACE} fill={HEART} {...ink(IN + 0.5)} />
      <g fill="none" stroke={shade(HEART, 0.28)} strokeWidth={IN}>
        <circle r={FACE - 14} />
        <circle r={FACE - 28} />
        <circle r={FACE - 42} />
      </g>
      <path
        d={`M2 -2 L${FACE - 6} 6 M${FACE * 0.45} 2 l8 -9`}
        stroke={shade(HEART, 0.5)}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <circle r={4.5} fill={shade(HEART, 0.42)} />
    </g>
  );
});

const LogLight = memo(function LogLight() {
  return (
    <g>
      <path
        d={`M${-FACE * 0.97} ${FACE * 0.24} A${FACE} ${FACE} 0 0 0 ${FACE * 0.3} ${FACE * 0.95} Q${-FACE * 0.45} ${FACE * 0.62} ${-FACE * 0.97} ${FACE * 0.24} Z`}
        fill={shade(HEART, 0.3)}
        opacity={0.55}
      />
      <path
        d={`M${LR * 0.15} ${-LR * 0.9} A${LR * 0.92} ${LR * 0.92} 0 0 1 ${LR * 0.88} ${-LR * 0.26}`}
        stroke={tint(BARK, 0.5)}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

/** The stump the log slams into: bark, a cut top with rings, moss, roots and mushrooms. */
const Stump = memo(function Stump({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-46 2 Q-70 -4 -86 8 L-58 8 Z" fill={BARK} {...ink(IN + 0.8)} />
      <path d="M46 2 Q72 -6 88 8 L56 8 Z" fill={BARK} {...ink(IN + 0.8)} />
      <path d="M-50 4 L-44 -96 L44 -96 L52 4 Z" fill={BARK} {...ink(OUT)} />
      <path d="M-50 4 L-44 -96 L-22 -96 L-26 4 Z" fill={shade(BARK, 0.3)} />
      <path d="M40 -88 L46 -4" stroke={tint(BARK, 0.5)} strokeWidth={2.4} strokeLinecap="round" />
      <g stroke={shade(BARK, 0.45)} strokeWidth={IN} strokeLinecap="round" fill="none">
        <path d="M-8 -80 q4 30 -2 60 M18 -70 q-4 24 2 52 M-30 -60 q3 20 -1 40" />
      </g>
      <ellipse cx={0} cy={-96} rx={44} ry={12} fill={HEART} {...ink(OUT - 0.6)} />
      <g fill="none" stroke={shade(HEART, 0.3)} strokeWidth={IN}>
        <ellipse cx={0} cy={-96} rx={30} ry={7.5} />
        <ellipse cx={0} cy={-96} rx={15} ry={3.6} />
      </g>
      <path
        d="M-44 -96 Q-40 -110 -18 -106 Q-30 -100 -26 -92 Q-38 -92 -44 -96 Z"
        fill={MOSS}
        {...ink(IN)}
      />
      <g transform="translate(-58 6)">
        <path d="M-3 0 Q-4 -9 -2 -14 L2 -14 Q4 -9 3 0 Z" fill="#f3e6cf" {...ink(1.3)} />
        <path
          d="M-12 -12 Q-11 -26 0 -27 Q11 -26 12 -12 Q0 -15 -12 -12 Z"
          fill="#e8a33a"
          {...ink(1.5)}
        />
        <circle cx={-3} cy={-20} r={2.2} fill="#fff" />
      </g>
    </g>
  );
});

export function LogRollBack(p: ObstacleProps) {
  const x = logX(p);
  return (
    <g>
      <Stump x={LOG_ROLL.stump} />
      {x !== null && <Log x={x} />}
      <Dust x={LOG_ROLL.logStart + 300} y={-4} dt={since(p, 'rumble') - 200} ms={900} size={1.2} />
      <Dust x={LOG_ROLL.stump - 60} y={-10} dt={since(p, 'hit')} ms={800} size={1.2} />
      <LeafBurst x={LOG_ROLL.stump} y={-120} dt={since(p, 'hit')} count={12} />
    </g>
  );
}

export function LogRollFront(p: ObstacleProps) {
  const riding = since(p, 'ride') >= 0 && since(p, 'hit') < 0;
  return riding ? <SpeedLines x={p.heroX - 80} t={p.t} ys={SPEED_YS} /> : null;
}

// ---------- Level 10: bramble vault ----------
// grow (thorny brambles grow into a wall) → grab (he picks up a sapling pole)
// → plant (he plants it and vaults) → land.

const BRAMBLE_STEMS = Array.from({ length: 9 }, (_, i) => ({
  x: BRAMBLE.wall[0] + ((BRAMBLE.wall[1] - BRAMBLE.wall[0]) * (i + 0.5)) / 9,
  h: 0.7 + 0.3 * noise(i, 2),
  lean: (noise(i, 4) - 0.5) * 60,
}));
const STEM = '#4e6a2c';
const THORN = '#f4ecd0';
const BERRY = '#b03a6a';

/**
 * The wall of brambles at `height`. Each stem is drawn once for its height (memoized) and sways
 * with a cheap rotation about its foot, so a growing, swaying wall doesn't rebuild every frame.
 */
function Brambles({ height, t }: { height: number; t: number }) {
  // Height in 2px steps: the stems only redraw while they grow.
  const h = Math.round(height / 2) * 2;
  return (
    <g>
      {BRAMBLE_STEMS.map((s, i) => (
        <g key={i} transform={`rotate(${Math.sin(t / 300 + i) * 1.6} ${s.x} 4)`}>
          <BrambleStem i={i} height={h} />
        </g>
      ))}
    </g>
  );
}

const BrambleStem = memo(function BrambleStem({ i, height }: { i: number; height: number }) {
  const s = BRAMBLE_STEMS[i]!;
  const h = height * s.h;
  const dir = i % 2 ? 1 : -1;
  const top = { x: s.x + s.lean * (h / BRAMBLE.wallHeight), y: -h };
  // An S-shaped, curling stem.
  const d = `M${s.x} 4 C${s.x + dir * 40} ${-h * 0.3} ${top.x - dir * 50} ${-h * 0.65} ${top.x} ${top.y} q ${dir * 22} -4 ${dir * 16} 16`;
  const at = (f: number) => ({
    x: lerp(s.x, top.x, f) + dir * 26 * Math.sin(Math.PI * 2 * f),
    y: lerp(0, top.y, f),
  });
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={d} stroke={STEM} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path
        d={d}
        transform="translate(1.6 -1.6)"
        stroke={tint(STEM, 0.45)}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      {[0.18, 0.34, 0.5, 0.66, 0.82].map((f, j) => {
        const pt = at(f);
        const side = j % 2 ? 1 : -1;
        return (
          <path
            key={f}
            d={`M${pt.x} ${pt.y - 4} l${side * 14} -6 l${-side * 12} 10 Z`}
            fill={THORN}
            {...ink(1.3)}
          />
        );
      })}
      {h > 80 && (
        <g transform={`translate(${at(0.45).x} ${at(0.45).y}) rotate(${dir * 30})`}>
          <path d="M0 0 Q14 -12 28 0 Q14 10 0 0 Z" fill={LEAF} {...ink(1.4)} />
          <path d="M3 0 H24" stroke={shade(LEAF, 0.35)} strokeWidth={1} />
          <path d="M4 -2 Q14 -9 24 -2" stroke={LEAF_LIGHT} strokeWidth={1.4} fill="none" />
        </g>
      )}
      {h > 60 && (
        <g>
          <circle cx={top.x} cy={top.y} r={7.5} fill={BERRY} {...ink(1.5)} />
          <circle cx={top.x + 9} cy={top.y + 6} r={5.5} fill={BERRY} {...ink(1.5)} />
          <circle cx={top.x + 2} cy={top.y - 3} r={2.2} fill="#ffd8e6" />
          <circle cx={top.x + 10} cy={top.y + 4} r={1.6} fill="#ffd8e6" />
        </g>
      )}
    </g>
  );
});

/** When the vault carries him past the pole's foot (he lets go there). */
function releaseTime(p: ObstacleProps, plantAt: number) {
  for (let t = plantAt; t < plantAt + 2000; t += 16) {
    if (p.heroAt(t).x >= BRAMBLE.plant + 10) return t;
  }
  return plantAt + 2000;
}

/** The sapling pole: green wood with a lit edge and a tuft of leaves at its tip. */
function Pole({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const d = `M${x1} ${y1} L${x2} ${y2}`;
  const a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g strokeLinecap="round" fill="none">
      <path d={d} stroke={INK} strokeWidth={12} />
      <path d={d} stroke="#a8763e" strokeWidth={7} />
      <path d={d} transform="translate(0 -1.8)" stroke="#e0b070" strokeWidth={1.8} />
      <g transform={`translate(${x2} ${y2}) rotate(${a})`}>
        {[-40, 10, 55].map((r) => (
          <path
            key={r}
            transform={`rotate(${r})`}
            d="M0 0 Q8 -7 18 0 Q8 6 0 0 Z"
            fill={r > 0 ? LEAF_LIGHT : LEAF}
            {...ink(1.4)}
          />
        ))}
      </g>
    </g>
  );
}

export function BrambleBack(p: ObstacleProps) {
  const grow = easeOut(progress(p, 'grow', 1100));
  const height = 50 + (BRAMBLE.wallHeight - 50) * grow;
  return (
    <g>
      <Brambles height={height} t={p.t} />
      <Dust x={(BRAMBLE.wall[0] + BRAMBLE.wall[1]) / 2} y={-6} dt={since(p, 'grow')} ms={900} />
    </g>
  );
}

export function BrambleFront(p: ObstacleProps) {
  const grabAt = eventTime(p.events, 'grab');
  const plantAt = eventTime(p.events, 'plant');
  const len = BRAMBLE.poleLength;
  const hands = { x: p.heroX + 14, y: -(p.heroLift + 118) };
  if (p.t < grabAt)
    return <Pole x1={BRAMBLE.pole - len / 2} y1={-6} x2={BRAMBLE.pole + len / 2} y2={-8} />;
  if (p.t < plantAt) {
    return <Pole x1={hands.x - 90} y1={hands.y + 14} x2={hands.x + len - 90} y2={hands.y - 20} />;
  }
  const foot = { x: BRAMBLE.plant, y: 0 };
  const releaseAt = releaseTime(p, plantAt);
  let angle: number;
  if (p.t < releaseAt) {
    angle = Math.atan2(hands.x - foot.x, foot.y - hands.y);
  } else {
    // Topples forward onto the brambles.
    const dt = p.t - releaseAt;
    angle = Math.min(Math.PI / 2 - 0.25, 0.1 + 0.000004 * dt * dt);
  }
  return (
    <Pole
      x1={foot.x}
      y1={foot.y}
      x2={foot.x + len * Math.sin(angle)}
      y2={foot.y - len * Math.cos(angle)}
    />
  );
}

// ---------- Level 11: root slide ----------
// crack (the path gives way) → he slides through the root chute → out.

const COVER = Array.from({ length: 8 }, (_, i) => ({
  x: ROOT_SLIDE.hole[0] + 40 + i * 90,
  delay: Math.abs(i - 1) * 60,
  spin: (noise(i, 7) - 0.5) * 0.5,
}));

function chuteY(x: number) {
  const pts = ROOT_SLIDE.chute;
  for (let i = 1; i < pts.length; i++) {
    const [x0, l0] = pts[i - 1]!;
    const [x1, l1] = pts[i]!;
    if (x <= x1) return -lerp(l0, l1, clamp01((x - x0) / (x1 - x0)));
  }
  return 0;
}

/** The open hollow: the earth, glowing mushrooms and the thick root he slides along. */
const OpenHollow = memo(function OpenHollow() {
  const id = useId();
  const [a, b] = ROOT_SLIDE.hole;
  const chute = ROOT_SLIDE.chute.map(([x, l]) => `${x} ${-l}`).join(' L');
  const glows = ['#8af0ff', '#c8ff8a', '#8af0ff'];
  return (
    <g>
      <defs>
        {glows.map((c, i) => (
          <radialGradient key={i} id={`${id}g${i}`}>
            <stop offset="0" stopColor={c} stopOpacity={0.6} />
            <stop offset="0.45" stopColor={c} stopOpacity={0.2} />
            <stop offset="1" stopColor={c} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      <Hollow a={a} b={b} depth={ROOT_SLIDE.depth} />
      {/* Glowing mushrooms down in the hollow (painted: they glow, he never touches them). */}
      {[300, 520, 740].map((x, i) => {
        const y = chuteY(x) + 44;
        const c = glows[i]!;
        return (
          <g key={x}>
            <ellipse cx={x} cy={y - 8} rx={70} ry={50} fill={`url(#${id}g${i})`} />
            <path
              d={`M${x - 2} ${y} Q${x - 3} ${y - 8} ${x - 1} ${y - 12} L${x + 2} ${y - 12} Q${x + 3} ${y - 6} ${x + 2} ${y} Z`}
              fill="#f4fff0"
            />
            <path
              d={`M${x - 13} ${y - 10} Q${x} ${y - 30} ${x + 13} ${y - 10} Q${x} ${y - 14} ${x - 13} ${y - 10} Z`}
              fill={c}
            />
            <ellipse cx={x + 3} cy={y - 21} rx={4} ry={2} fill="#ffffff" opacity={0.8} />
          </g>
        );
      })}
      {/* The chute: a thick smooth root he slides along, lined like his props. */}
      <g transform="translate(0 15)" fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={`M${chute}`} stroke={INK} strokeWidth={30} />
        <path d={`M${chute}`} stroke={ROOT} strokeWidth={23} />
        <path
          d={`M${chute}`}
          transform="translate(0 6)"
          stroke={shade(ROOT, 0.35)}
          strokeWidth={8}
        />
        <path
          d={`M${chute}`}
          transform="translate(0 -7)"
          stroke={tint(ROOT, 0.4)}
          strokeWidth={4}
        />
      </g>
      {[260, 470, 600, 800].map((x) => (
        <ellipse
          key={x}
          cx={x}
          cy={chuteY(x) + 15}
          rx={9}
          ry={4}
          fill={shade(ROOT, 0.3)}
          {...ink(1.2)}
        />
      ))}
    </g>
  );
});

export function RootSlideBack(p: ObstacleProps) {
  const [a, b] = ROOT_SLIDE.hole;
  const crack = since(p, 'crack');
  return (
    <g>
      {crack >= 0 && <OpenHollow />}
      {/* The path over the hollow, painted like the path, breaking up and falling in. */}
      {COVER.map((c, i) => {
        const dt = crack - c.delay;
        const y = fallen(dt, 0.003);
        if (y > 300) return null;
        return (
          <g key={i} transform={`translate(${c.x} ${y}) rotate(${dt > 0 ? c.spin * dt : 0})`}>
            <path d="M-46 -4 L46 -4 L40 16 L-40 16 Z" fill={EARTH_TOP} />
            <path d="M-46 -4 L46 -4 L45 4 L-45 4 Z" fill={P.path} />
            <path d="M-44 -4 H44" stroke={P.pathLight} strokeWidth={2} />
            <path d="M-30 -4 l3 -8 l3 8 M24 -4 l2 -7 l3 7" fill={P.fernLight} />
          </g>
        );
      })}
      {/* Cracks shooting across the path the moment it gives way. */}
      {crack >= 0 && crack < 300 && (
        <path
          d={`M${a + 40} -2 l40 4 l30 -5 l50 6 l40 -4 l60 5 l50 -6 l70 4`}
          stroke={EARTH_DEEP}
          strokeWidth={3}
          fill="none"
          opacity={1 - crack / 300}
        />
      )}
      <Dust x={(a + b) / 2 - 200} y={-4} dt={crack} ms={800} color="#8a7050" />
      <LeafBurst x={b} y={-20} dt={since(p, 'out')} count={14} />
    </g>
  );
}

// ---------- Level 12: vine swing ----------
// Painted (M7b): see vineSwing.tsx.

// ---------- Level 13: boar charge ----------
// snort (a boar trots in and paws the ground) → charge → crash (into the bush) → it trots off.

function boarPose(p: ObstacleProps) {
  const snortAt = eventTime(p.events, 'snort');
  const chargeAt = eventTime(p.events, 'charge');
  const crashAt = eventTime(p.events, 'crash');
  const { boarStart, bush } = BOAR;
  if (p.t < snortAt) return null;
  if (p.t < chargeAt) {
    const x = lerp(boarStart, 900, easeOut(clamp01((p.t - snortAt) / 500)));
    return { x, step: Math.sin(p.t / 90), dazed: false, facing: -1 };
  }
  if (p.t < crashAt) {
    return {
      x: lerp(900, bush + 90, (p.t - chargeAt) / (crashAt - chargeAt)),
      step: Math.sin(p.t / 45),
      dazed: false,
      facing: -1,
    };
  }
  const dt = p.t - crashAt;
  // Sits dazed for a moment, then trots off the way it came, a bit sheepish.
  if (dt < 900) return { x: bush + 90 + 10 * bump(dt, 250), step: 0, dazed: true, facing: -1 };
  return { x: bush + 90 + (dt - 900) * 0.5, step: Math.sin(p.t / 70), dazed: false, facing: 1 };
}

const FUR = '#8a6450';
const SNOUT = '#f0a0a8';

/** A round, grumpy-cute boar (no glare, tiny tusks), its head at local −x. */
function Boar({
  x,
  step,
  dazed,
  facing,
  t,
}: {
  x: number;
  step: number;
  dazed: boolean;
  facing: number;
  t: number;
}) {
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      {[-40, -18, 22, 44].map((lx, i) => {
        const d = `M${lx} -30 L${lx + (i % 2 ? step : -step) * 10} -5`;
        const far = i === 1 || i === 3;
        return (
          <g key={lx} strokeLinecap="round">
            <path d={d} stroke={INK} strokeWidth={14} />
            <path d={d} stroke={far ? shade(FUR, 0.35) : shade(FUR, 0.15)} strokeWidth={8} />
          </g>
        );
      })}
      <BoarBody />
      <BoarHead dazed={dazed} />
      {dazed && (
        <g transform={`translate(-68 -120) rotate(${t * 0.3})`} fill="#ffd35a" {...ink(1.5)}>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              transform={`rotate(${i * 120}) translate(26 0)`}
              d="M0 -8 L2.5 -2.5 L8 0 L2.5 2.5 L0 8 L-2.5 2.5 L-8 0 L-2.5 -2.5 Z"
            />
          ))}
        </g>
      )}
    </g>
  );
}

const BoarBody = memo(function BoarBody() {
  return (
    <g>
      <path
        d="M66 -72 q18 -8 14 10 q-3 9 -11 3"
        stroke={INK}
        strokeWidth={3.2}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={0} cy={-62} rx={70} ry={44} fill={FUR} {...ink(OUT + 0.4)} />
      <path d="M-64 -46 Q0 -8 66 -48 Q44 -24 0 -22 Q-42 -24 -64 -46 Z" fill={shade(FUR, 0.3)} />
      <path
        d="M14 -104 Q48 -100 66 -78"
        stroke={tint(FUR, 0.45)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      {/* A bristly mane along its back. */}
      <path
        d="M-52 -94 L-44 -114 L-34 -100 L-22 -120 L-10 -103 L4 -122 L14 -103 L28 -116 L34 -99 Q-6 -108 -52 -94 Z"
        fill={shade(FUR, 0.35)}
        {...ink(IN + 0.6)}
      />
    </g>
  );
});

const BoarHead = memo(function BoarHead({ dazed }: { dazed: boolean }) {
  return (
    <g transform="translate(-68 -58)">
      <path d="M8 -24 L20 -48 L26 -20 Z" fill={FUR} {...ink(IN + 0.8)} />
      <path d="M12 -26 L19 -40 L22 -24 Z" fill={SNOUT} />
      <ellipse cx={0} cy={0} rx={34} ry={30} fill={FUR} {...ink(OUT)} />
      <path d="M-30 14 Q-10 32 26 18 Q6 26 -14 22 Z" fill={shade(FUR, 0.3)} />
      <path
        d="M8 -26 Q24 -20 30 -6"
        stroke={tint(FUR, 0.45)}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={-30} cy={8} rx={15} ry={13} fill={SNOUT} {...ink(OUT - 0.6)} />
      <ellipse cx={-35} cy={7} rx={2.6} ry={3.6} fill={shade(SNOUT, 0.6)} />
      <ellipse cx={-26} cy={7} rx={2.6} ry={3.6} fill={shade(SNOUT, 0.6)} />
      <ellipse cx={-27} cy={0} rx={4} ry={2} fill="#ffd8de" />
      <path d="M-18 18 Q-24 30 -32 26 Q-26 24 -24 17 Z" fill="#fff6e0" {...ink(IN)} />
      {dazed ? (
        <path
          d="M-14 -16 q6 -4 9 1 q2 6 -5 7 q-6 0 -5 -6 q2 -8 11 -6"
          stroke={INK}
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <g>
          <ellipse cx={-9} cy={-9} rx={6} ry={7} fill="#fff" {...ink(1.6)} />
          <circle cx={-11} cy={-8} r={3.4} fill={INK} />
          <circle cx={-12.2} cy={-9.6} r={1.2} fill="#fff" />
          <path d="M-18 -19 L0 -14" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
});

/** The tree he climbs, with the branch he stands on (memoized: it never moves). */
const BoarTree = memo(function BoarTree() {
  const { tree, branch } = BOAR;
  const limb = `M${tree + 20} ${-branch - 30} Q${tree + 120} ${-branch + 6} ${tree + 240} ${-branch - 10}`;
  return (
    <g>
      <path
        d={`M${tree - 40} 6 L${tree - 34} -700 L${tree + 34} -700 L${tree + 40} 6 Z`}
        fill={BARK}
        {...ink(OUT)}
      />
      <path
        d={`M${tree - 40} 6 L${tree - 34} -700 L${tree - 12} -700 L${tree - 16} 6 Z`}
        fill={shade(BARK, 0.3)}
      />
      <path
        d={`M${tree + 30} -690 L${tree + 36} -6`}
        stroke={tint(BARK, 0.45)}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <g stroke={shade(BARK, 0.45)} strokeWidth={IN} fill="none" strokeLinecap="round">
        <path
          d={`M${tree - 6} -640 q6 120 -2 240 M${tree + 14} -520 q-6 100 2 200 M${tree - 18} -300 q5 90 -2 180 M${tree + 10} -200 q-4 80 2 150`}
        />
      </g>
      <ellipse cx={tree + 6} cy={-420} rx={9} ry={14} fill={shade(BARK, 0.55)} {...ink(IN)} />
      {/* Roots flaring into the ground, a little moss on them. */}
      <path
        d={`M${tree - 38} 2 Q${tree - 62} -2 ${tree - 76} 8 L${tree - 44} 8 Z`}
        fill={BARK}
        {...ink(IN + 0.8)}
      />
      <path
        d={`M${tree + 38} 2 Q${tree + 64} -4 ${tree + 80} 8 L${tree + 46} 8 Z`}
        fill={BARK}
        {...ink(IN + 0.8)}
      />
      <path
        d={`M${tree - 64} 2 Q${tree - 56} -8 ${tree - 44} -6 Q${tree - 50} 0 ${tree - 56} 4 Z`}
        fill={MOSS}
        {...ink(IN)}
      />
      <g fill="none" strokeLinecap="round">
        <path d={limb} stroke={INK} strokeWidth={30} />
        <path d={limb} stroke={BARK} strokeWidth={23} />
        <path d={limb} transform="translate(0 5)" stroke={shade(BARK, 0.3)} strokeWidth={8} />
        <path d={limb} transform="translate(0 -7)" stroke={tint(BARK, 0.45)} strokeWidth={4} />
      </g>
      <LinedFoliage
        lobes={[
          [tree + 212, -branch - 36, 20],
          [tree + 240, -branch - 52, 28],
          [tree + 272, -branch - 38, 24],
          [tree + 230, -branch - 84, 22],
          [tree + 266, -branch - 78, 24],
          [tree + 296, -branch - 58, 18],
        ]}
      />
    </g>
  );
});

/** The bush the boar crashes into. */
const BoarBush = memo(function BoarBush() {
  return (
    <g>
      <LinedFoliage
        lobes={[
          [-46, -46, 46],
          [30, -58, 58],
          [-10, -98, 44],
          [62, -30, 34],
          [-78, -24, 30],
        ]}
      />
      <g fill="#e2452f" {...ink(1.4)}>
        <circle cx={-30} cy={-70} r={5} />
        <circle cx={20} cy={-96} r={4.5} />
        <circle cx={50} cy={-50} r={5} />
      </g>
    </g>
  );
});

export function BoarChargeBack(p: ObstacleProps) {
  const { bush } = BOAR;
  const crash = since(p, 'crash');
  const shakeBush = 8 * bump(crash, 500) * Math.sin(p.t / 30);
  return (
    <g>
      <BoarTree />
      <g transform={`translate(${bush + shakeBush} 0)`}>
        <BoarBush />
      </g>
      <LeafBurst x={bush + 20} y={-90} dt={crash} count={14} />
    </g>
  );
}

export function BoarChargeFront(p: ObstacleProps) {
  const boar = boarPose(p);
  if (!boar) return null;
  const snort = since(p, 'snort');
  const charge = since(p, 'charge');
  return (
    <g>
      {charge < 0 && (
        <Dust x={boar.x + 50} y={-4} dt={(snort % 600) - 100} ms={400} size={0.5} color="#8a7050" />
      )}
      {charge >= 0 && since(p, 'crash') < 0 && (
        <g>
          <g transform={`translate(${boar.x + 90} 0) scale(-1 1)`}>
            <SpeedLines x={0} t={p.t} ys={[-30, -60, -90]} />
          </g>
          <Dust x={boar.x + 60} y={-4} dt={p.t % 260} ms={260} size={0.4} color="#c8b090" />
        </g>
      )}
      <Boar {...boar} t={p.t} />
    </g>
  );
}

// ---------- Level 14: mushroom bounce ----------
// bubble (the path turns to bubbling mud) → b1..b3 (he bounces off each mushroom).

const MUD = '#7a5434';
const CAPS = ['#e0503c', '#e8743b', '#c04a8a'] as const;

/** A mushroom's cap: spots, a shine, its gills underneath (memoized per color). */
const MushroomCap = memo(function MushroomCap({ color }: { color: string }) {
  return (
    <g>
      <path
        d="M-80 16 Q-78 -58 0 -62 Q78 -58 80 16 Q0 4 -80 16 Z"
        fill={color}
        {...ink(OUT + 0.4)}
      />
      <path d="M-80 16 Q-78 -58 -8 -61.5 Q-56 -42 -58 12 Z" fill={shade(color, 0.28)} />
      <path d="M-78 15 Q0 4 78 15 Q0 26 -78 15 Z" fill="#f3e0c4" {...ink(IN)} />
      <path
        d="M-50 13 L-46 19 M-25 10 L-23 18 M0 9 V18 M25 10 L23 18 M50 13 L46 19"
        stroke={shade('#f3e0c4', 0.35)}
        strokeWidth={1.2}
      />
      <g fill="#fff6e0" {...ink(IN)}>
        <circle cx={-40} cy={-24} r={11} />
        <circle cx={0} cy={-42} r={9} />
        <circle cx={36} cy={-18} r={10} />
        <circle cx={62} cy={-2} r={5} />
      </g>
      <path
        d="M22 -54 Q50 -50 64 -32"
        stroke={tint(color, 0.55)}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

/** A mushroom's stem, from the cap down into the mud (memoized: it never moves). */
const MushroomStem = memo(function MushroomStem({ x, top }: { x: number; top: number }) {
  return (
    <g>
      <path
        d={`M${x - 16} 20 L${x - 12} ${top} L${x + 12} ${top} L${x + 16} 20 Z`}
        fill="#f3e6cf"
        {...ink(OUT)}
      />
      <path
        d={`M${x - 16} 20 L${x - 12} ${top} L${x - 4} ${top} L${x - 6} 20 Z`}
        fill={shade('#f3e6cf', 0.2)}
      />
      <path
        d={`M${x + 9} ${top + 6} L${x + 12} 14`}
        stroke="#fffaf0"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </g>
  );
});

export function MushroomBounceBack(p: ObstacleProps) {
  const id = useId();
  const [a, b] = MUSHROOMS.bog;
  const bubble = since(p, 'bubble');
  const rise = bubble < 0 ? 0 : easeOut(clamp01(bubble / 700));
  const s = -10 * rise;
  const mid = (a + b) / 2;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint(MUD, 0.15)} />
          <stop offset="1" stopColor={shade(MUD, 0.45)} />
        </linearGradient>
      </defs>
      {/* The bog (painted): the path darkens into a pool of glossy mud as it starts to bubble,
          with a wet rim, a lighter skin, reflections and grass leaning over its banks. */}
      <g opacity={0.35 + 0.65 * rise}>
        <path
          d={`M${a - 16} 0 Q${a - 6} ${s - 6} ${a + 70} ${s - 4} L${b - 70} ${s - 4} Q${b + 6} ${s - 6} ${b + 16} 0 Q${b + 2} 26 ${b - 96} 30 Q${mid + 110} 40 ${mid} 36 Q${mid - 170} 32 ${a + 96} 32 Q${a - 4} 26 ${a - 16} 0 Z`}
          fill={shade(P.groundDark, 0.15)}
        />
        <path
          d={`M${a} -2 Q${a + 30} ${s * 1.2} ${a + 80} ${s} L${b - 80} ${s} Q${b - 30} ${s * 1.2} ${b} -2 Q${b - 10} 18 ${b - 90} 22 Q${mid + 110} 31 ${mid} 28 Q${mid - 160} 24 ${a + 90} 24 Q${a + 8} 18 ${a} -2 Z`}
          fill={`url(#${id})`}
        />
      </g>
      <path
        d={`M${a + 60} ${s + 3} H${b - 60}`}
        stroke={tint(MUD, 0.35)}
        strokeWidth={4}
        opacity={0.8 * rise}
      />
      <g stroke="#fff3dc" strokeWidth={2.2} strokeLinecap="round" opacity={0.45 * rise}>
        <path d={`M${a + 130} ${s + 10} h40 M${a + 360} ${s + 14} h28 M${b - 260} ${s + 9} h46`} />
      </g>
      {[a, b].map((x, side) => (
        <g key={side} fill={side ? P.fernLight : P.fern}>
          <path
            d={`M${x - 10} 0 l${side ? -6 : 6} -16 l4 14 Z M${x + 2} 0 l${side ? -3 : 3} -12 l4 11 Z`}
          />
        </g>
      ))}
      <g fill={P.fern}>
        {[0.2, 0.45, 0.7].map((f) => (
          <path key={f} d={`M${lerp(a, b, f)} 30 l-4 -12 l5 10 l3 -14 l3 15 Z`} />
        ))}
      </g>
      {bubble >= 0 &&
        Array.from({ length: 7 }, (_, i) => {
          const cycle = (bubble + i * 170) % 900;
          const x = a + 80 + i * ((b - a - 160) / 6);
          const r = 6 + cycle * 0.012;
          if (cycle >= 700) {
            // A ring where it popped.
            const k = (cycle - 700) / 200;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={s}
                rx={r + 14 * k}
                ry={(r + 14 * k) * 0.3}
                fill="none"
                stroke={tint(MUD, 0.4)}
                strokeWidth={2}
                opacity={1 - k}
              />
            );
          }
          return (
            <g key={i}>
              <circle cx={x} cy={s - r * 0.6} r={r} fill={tint(MUD, 0.28)} />
              <path
                d={`M${x - r * 0.5} ${s - r * 1.1} A${r * 0.7} ${r * 0.7} 0 0 1 ${x + r * 0.3} ${s - r * 1.3}`}
                stroke="#fff3dc"
                strokeWidth={1.8}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      {MUSHROOMS.caps.map((x, i) => {
        const dt = since(p, `b${i + 1}`);
        const squash = bump(dt, 300);
        const top = -MUSHROOMS.capTop + 16 * squash;
        return (
          <g key={x}>
            <MushroomStem x={x} top={-MUSHROOMS.capTop + 6} />
            <g
              transform={`translate(${x} ${top}) scale(${1 + 0.18 * squash} ${1 - 0.18 * squash})`}
            >
              <MushroomCap color={CAPS[i]!} />
            </g>
            {dt >= 0 && dt < 700 && (
              <g fill="#fff6c8" opacity={1 - dt / 700}>
                {[0, 1, 2, 3, 4].map((j) => (
                  <circle
                    key={j}
                    cx={x + (j - 2) * 30 + (j - 2) * dt * 0.05}
                    cy={top - 70 - dt * 0.08 * (1 + noise(j + i))}
                    r={4}
                  />
                ))}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

// ---------- Level 15: falling bridge ----------
// creak → collapse (the planks drop one by one behind him as he runs).

/** The hero's running speed across the bridge (matches the script). */
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

// ---------- Level 16 (boss): follow the fireflies ----------
// dusk (night falls, fog rolls in) → fireflies (they gather; roots rise across the path)
// → dawn (he bursts into a moonlit clearing).

const FLIES = Array.from({ length: 16 }, (_, i) => ({ i, ph: noise(i, 9) * 6.28 }));
const NIGHT_ROOT = '#7a5238';

/**
 * The night roots he jumps and slides under, lined like his props, with bark and moss: a root
 * looping up out of the ground (rising with `rise`), and a tall arch.
 */
const RootHump = memo(function RootHump({ rise }: { rise: number }) {
  const { hump } = FIREFLIES;
  const h = 150 * rise;
  if (h < 1) return null;
  const outer = `M${hump - 112} 6 Q${hump - 104} ${-h * 0.95} ${hump} ${-h} Q${hump + 104} ${-h * 0.95} ${hump + 112} 6`;
  const inner = `L${hump + 72} 6 Q${hump + 64} ${-h * 0.6} ${hump} ${-h * 0.66} Q${hump - 64} ${-h * 0.6} ${hump - 72} 6 Z`;
  return (
    <g>
      <path
        d={`M${hump - 74} 6 Q${hump - 64} ${-h * 0.6} ${hump} ${-h * 0.66} Q${hump + 64} ${-h * 0.6} ${hump + 74} 6 Z`}
        fill="#1e1410"
      />
      <path d={outer + inner} fill={NIGHT_ROOT} {...ink(OUT)} />
      <path
        d={`M${hump - 112} 6 Q${hump - 104} ${-h * 0.95} ${hump - 30} ${-h * 0.99} L${hump - 26} ${-h * 0.8} Q${hump - 76} ${-h * 0.72} ${hump - 86} 6 Z`}
        fill={shade(NIGHT_ROOT, 0.3)}
      />
      <path
        d={`M${hump - 20} ${-h * 0.93} Q${hump + 60} ${-h * 0.9} ${hump + 96} ${-h * 0.3}`}
        stroke={tint(NIGHT_ROOT, 0.45)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${hump - 50} ${-h * 0.82} q12 4 20 -2 M${hump + 30} ${-h * 0.84} q10 6 18 0 M${hump + 74} ${-h * 0.45} q8 2 10 10`}
        stroke={shade(NIGHT_ROOT, 0.45)}
        strokeWidth={IN}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${hump - 40} ${-h * 0.97} q24 -14 52 -4 q-14 12 -52 4 Z`}
        fill={MOSS}
        {...ink(IN)}
      />
      <path
        d={`M${hump - 112} 6 q-14 -2 -20 6 M${hump + 112} 6 q16 -4 22 4`}
        stroke={INK}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

const RootArch = memo(function RootArch() {
  const { arch, archClear } = FIREFLIES;
  const outer = `M${arch - 150} 6 Q${arch - 120} ${-archClear - 90} ${arch} ${-archClear - 60} Q${arch + 120} ${-archClear - 90} ${arch + 150} 6 L${arch + 110} 6 Q${arch + 90} ${-archClear - 10} ${arch} ${-archClear} Q${arch - 90} ${-archClear - 10} ${arch - 110} 6 Z`;
  return (
    <g>
      <path d={outer} fill={NIGHT_ROOT} {...ink(OUT)} />
      <path
        d={`M${arch - 110} 6 Q${arch - 90} ${-archClear - 10} ${arch} ${-archClear} Q${arch + 90} ${-archClear - 10} ${arch + 110} 6 L${arch + 100} 6 Q${arch + 80} ${-archClear + 4} ${arch} ${-archClear + 12} Q${arch - 80} ${-archClear + 4} ${arch - 100} 6 Z`}
        fill={shade(NIGHT_ROOT, 0.35)}
      />
      <path
        d={`M${arch - 128} ${-archClear + 40} Q${arch - 100} ${-archClear - 72} ${arch} ${-archClear - 50} Q${arch + 90} ${-archClear - 70} ${arch + 120} ${-archClear - 10}`}
        stroke={tint(NIGHT_ROOT, 0.45)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${arch - 60} ${-archClear - 70} q20 -18 40 -8 q-10 14 -40 8 Z`}
        fill={MOSS}
        {...ink(IN)}
      />
    </g>
  );
});

/** The chasm at the end (painted): dark, with roots hanging into it. */
const RootGap = memo(function RootGap() {
  const id = useId();
  const [g0, g1] = FIREFLIES.gap;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1626" />
          <stop offset="1" stopColor="#05040a" />
        </linearGradient>
      </defs>
      <path
        d={`M${g0 - 14} -4 L${g0} 30 L${g0 + 20} 220 L${g1 - 20} 220 L${g1} 30 L${g1 + 14} -4 Z`}
        fill={`url(#${id})`}
      />
      {[g0 + 40, g1 - 40].map((x, i) => (
        <path
          key={x}
          d={`M${x} 10 q ${i ? -20 : 20} 60 ${i ? 10 : -10} 140`}
          stroke="#4a3426"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
});

export function FirefliesBack(p: ObstacleProps) {
  const id = useId();
  const { arch } = FIREFLIES;
  const dark = clamp01(since(p, 'dusk') / 900) - clamp01(since(p, 'dawn') / 800);
  const rise = easeOut(progress(p, 'fireflies', 700));
  const moon = clamp01(since(p, 'dawn') / 800);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}n`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07102c" />
          <stop offset="1" stopColor="#163a4a" />
        </linearGradient>
        <radialGradient id={`${id}m`}>
          <stop offset="0" stopColor="#fff6d0" stopOpacity={0.7} />
          <stop offset="0.35" stopColor="#fff6d0" stopOpacity={0.22} />
          <stop offset="1" stopColor="#fff6d0" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* Night (painted): deep blue over everything but him, a little lighter near the ground. */}
      <rect
        x={-600}
        y={-900}
        width={3200}
        height={1200}
        fill={`url(#${id}n)`}
        opacity={0.6 * dark}
      />
      {/* Fog along the ground. */}
      <g fill="#dfe8ff" opacity={0.25 * dark}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx={-200 + i * 380 + ((p.t * 0.02) % 380)} cy={-20} rx={260} ry={40} />
        ))}
      </g>
      {/* A root hump to jump, a root arch to slide under, and a gap. */}
      {rise > 0 && <RootHump rise={Math.round(rise * 40) / 40} />}
      {rise > 0 && (
        <g transform={`translate(0 ${(1 - rise) * 260})`}>
          <RootArch />
        </g>
      )}
      <RootGap />
      {/* The moon comes out when he reaches the clearing (painted). */}
      <g opacity={moon}>
        <circle cx={1900} cy={-560} r={190} fill={`url(#${id}m)`} />
        <circle cx={1900} cy={-560} r={50} fill="#fff6d0" />
        <circle cx={1888} cy={-572} r={9} fill="#efe2b4" />
        <circle cx={1914} cy={-548} r={6} fill="#efe2b4" />
      </g>
      <Dust x={arch} y={-4} dt={since(p, 'fireflies')} ms={900} color="#5a4a3a" />
    </g>
  );
}

export function FirefliesFront(p: ObstacleProps) {
  const id = useId();
  const dusk = since(p, 'dusk');
  const flies = since(p, 'fireflies');
  const dawn = since(p, 'dawn');
  if (dusk < 0) return null;
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#f4ff8a" stopOpacity={0.75} />
          <stop offset="0.4" stopColor="#f4ff8a" stopOpacity={0.22} />
          <stop offset="1" stopColor="#f4ff8a" stopOpacity={0} />
        </radialGradient>
      </defs>
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
        const sz = 0.8 + noise(i) * 0.5;
        const twinkle = 0.75 + 0.25 * Math.sin(p.t / 120 + ph * 3);
        return (
          <g key={i} opacity={fade * twinkle}>
            <circle cx={x} cy={y} r={30 * sz} fill={`url(#${id})`} />
            <circle cx={x} cy={y} r={4 * sz} fill="#fbffc8" />
          </g>
        );
      })}
    </g>
  );
}
