import { memo, useId } from 'react';
import { Debris, Dust, SparkBurst, SparkTrail, SpeedLines } from '../fx';
import { debrisPieces } from '../fxData';
import { INK, ink, mix, shade, tint } from '../style';
import { Glint } from '../worlds/paintKit';
import { PAINTED_MINE } from '../worlds/minePalette';
import { CART_JUMP, CART_RACE, MINE_TRAIN, WALL_SMASH } from './mineLayout';
import {
  BOULDER_R,
  cartRide,
  clamp,
  flightTilt,
  IN,
  IRON,
  OUT,
  RAIL_TOP,
  ROCK,
  WOOD,
} from './mineKit';
import { Boulder, CartRim, MineCart, Pit, PitLip, Rails, Rock } from './mineParts';
import { eventTime, type ObstacleProps } from './types';

/*
 * World 1 cart scenes: levels 1, 2, 3 and the level 8 boss. Motion is computed from `t` and the
 * prop schedule, so every frame is deterministic. What he touches is lined like him; the ground,
 * the timber of the track and the daylight outside are painted like the backdrop (M7b).
 */

const P = PAINTED_MINE;
const SPEED_YS = [-60, -86, -100, -48];

// ---------- Level 1: cart race ----------
// rumble (a boulder crashes down) → chase (he rides, it rolls after him)
// → drop (it smashes the trestle and falls into the pit) → crash (the buffer stops the cart).

const R = BOULDER_R;
const PIT_MID = (CART_RACE.pit[0] + CART_RACE.pit[1]) / 2;

/** Boulder center and spin at time t, or null while it is hidden. */
function raceBoulder(p: ObstacleProps): { x: number; y: number; spin: number } | null {
  const rumbleAt = eventTime(p.events, 'rumble');
  const chaseAt = eventTime(p.events, 'chase');
  const dropAt = eventTime(p.events, 'drop');
  const rest = -R - 1;
  if (p.t < rumbleAt) return null;
  if (p.t < chaseAt) {
    // Falls from the ceiling, then bounces twice.
    const dt = p.t - rumbleAt;
    const fall = 450;
    const y =
      dt < fall
        ? -900 + (900 + rest) * (dt / fall) ** 2
        : rest -
          22 * Math.abs(Math.sin((Math.PI * (dt - fall)) / 220)) * Math.exp(-(dt - fall) / 180);
    return { x: CART_RACE.boulderStart, y, spin: 0 };
  }
  const spinAt = (x: number) => ((x - CART_RACE.boulderStart) / R) * (180 / Math.PI);
  if (p.t < dropAt) {
    // Rolls after the cart. By design the gap puts it over the pit's middle at `dropAt`.
    const k = clamp((p.t - chaseAt) / 700, 0, 1);
    const gap = CART_RACE.gap.start + (CART_RACE.gap.end - CART_RACE.gap.start) * k;
    const x = Math.min(p.heroX - gap, PIT_MID);
    return { x, y: rest, spin: spinAt(x) };
  }
  const dt = p.t - dropAt;
  const x = PIT_MID + Math.min(dt * 0.25, 40);
  const y = rest + 0.0028 * dt * dt;
  return y > 400 ? null : { x, y, spin: spinAt(x) };
}

/** Pebbles shaken loose from the ceiling during the rumble. */
const PEBBLES = Array.from({ length: 10 }, (_, i) => ({
  x: -520 + i * 70 + ((i * 37) % 30),
  delay: (i * 97) % 600,
  r: 5 + (i % 3) * 3,
}));

function Pebbles({ t, from }: { t: number; from: number }) {
  return (
    <g>
      {PEBBLES.map((pb, i) => {
        const dt = t - from - pb.delay;
        if (!(dt >= 0)) return null;
        const y = -760 + 0.004 * dt * dt;
        if (y > -pb.r) return null;
        return <Rock key={i} x={pb.x} y={y + pb.r} s={pb.r * 1.6} spin={dt * 0.3} />;
      })}
    </g>
  );
}

/** A painted timber beam from (x1, y1) to (x2, y2), lit along one edge. */
function Timber({
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

/** The wooden trestle carrying the track over the pit, until the boulder smashes through it. */
function Trestle({ t, dropAt }: { t: number; dropAt: number }) {
  const [a, b] = CART_RACE.pit;
  if (t < dropAt) {
    return (
      <g>
        <Timber x1={a + 10} y1={-2} x2={a + 100} y2={150} w={11} />
        <Timber x1={b - 10} y1={-2} x2={a + 100} y2={150} w={11} />
        <Timber x1={a + 100} y1={-2} x2={a + 100} y2={190} w={12} />
        <Timber x1={a + 40} y1={60} x2={b - 40} y2={60} w={8} />
        <Rails a={a - 12} b={b + 12} />
      </g>
    );
  }
  const dt = t - dropAt;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const y = 0.0025 * dt * dt;
        if (y > 300) return null;
        const x = a + 35 + i * 65 + (i - 1) * dt * 0.05;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(i - 1) * 0.35 * dt + 8})`}>
            <rect x={-14} y={3} width={26} height={11} fill={P.sleeper} />
            <rect x={-36} y={-5} width={72} height={8} fill={P.rail} />
            <rect x={-36} y={-5} width={72} height={1.8} fill={P.railLight} />
            <rect x={-36} y={0} width={72} height={3} fill={P.railDark} />
          </g>
        );
      })}
    </g>
  );
}

/** The buffer stop at the end of the line: a red-and-white beam on a braced timber post. */
function Bumper({ x }: { x: number }) {
  return (
    <g>
      <path
        d={`M${x + 24} -112 L${x + 84} 2 L${x + 70} 2 L${x + 16} -100 Z`}
        fill={shade(WOOD, 0.2)}
        {...ink(OUT)}
      />
      <rect x={x + 10} y={-124} width={24} height={128} rx={3} fill={WOOD} {...ink(OUT)} />
      <rect x={x + 10} y={-124} width={8} height={128} fill={shade(WOOD, 0.3)} />
      <path
        d={`M${x + 30} -118 V-6`}
        stroke={tint(WOOD, 0.5)}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <rect x={x} y={-94} width={48} height={62} rx={5} fill="#e04b3a" {...ink(OUT)} />
      {/* White stripes, then its shadow side and a rim light. */}
      <path
        d={`M${x + 4} -66 L${x + 30} -92 L${x + 44} -92 L${x + 4} -52 Z M${x + 4} -36 L${x + 46} -78 L${x + 46} -62 L${x + 20} -36 Z`}
        fill="#fff4e6"
      />
      <path
        d={`M${x} -40 V-89 Q${x} -94 ${x + 5} -94 L${x + 12} -94 L${x + 12} -32 L${x + 5} -32 Q${x} -32 ${x} -40 Z`}
        fill={shade('#e04b3a', 0.35)}
        opacity={0.75}
      />
      <path d={`M${x + 44} -88 V-40`} stroke="#ffb0a0" strokeWidth={2.2} strokeLinecap="round" />
      <rect x={x - 6} y={-84} width={10} height={40} rx={3} fill={IRON} {...ink(IN + 0.6)} />
    </g>
  );
}

const raceCart = (p: ObstacleProps) =>
  cartRide(p, CART_RACE.cartRest, CART_RACE.bufferX, 'chase', 'crash');

export function CartRaceBack(p: ObstacleProps) {
  const rumbleAt = eventTime(p.events, 'rumble');
  const dropAt = eventTime(p.events, 'drop');
  const b = raceBoulder(p);
  const cart = raceCart(p);
  const [a, bEnd] = CART_RACE.pit;
  return (
    <g>
      <Bumper x={CART_RACE.bufferX + 64} />
      <Pit a={a} b={bEnd} />
      <Trestle t={p.t} dropAt={dropAt} />
      <Pebbles t={p.t} from={rumbleAt} />
      {b && <Boulder {...b} />}
      <PitLip a={a} b={bEnd} />
      <Dust x={CART_RACE.boulderStart} y={-4} dt={p.t - rumbleAt - 450} ms={700} />
      <Dust x={PIT_MID} y={-10} dt={p.t - dropAt - 150} ms={1000} size={1.4} />
      <CartRim x={cart.x} lift={cart.lift} />
    </g>
  );
}

export function CartRaceFront(p: ObstacleProps) {
  const crashAt = eventTime(p.events, 'crash');
  const cart = raceCart(p);
  const sinceCrash = p.t - crashAt;
  const tilt =
    sinceCrash >= 0 && sinceCrash < 420 ? 15 * Math.sin((Math.PI * sinceCrash) / 420) : 0;
  return (
    <g>
      {cart.rolling && <SpeedLines x={cart.x - 90} t={p.t} ys={SPEED_YS} />}
      <g transform={`rotate(${tilt} ${cart.x + 60} -24)`}>
        <MineCart x={cart.x} />
      </g>
      {cart.rolling && <SparkTrail x={cart.x - 34} y={RAIL_TOP - 2} t={p.t} />}
      <SparkBurst x={cart.x + 66} y={-70} dt={sinceCrash} />
    </g>
  );
}

// ---------- Level 2: cart jump ----------
// board → launch (up the broken ramp) → fly (off the end) → land (far rails) → off.

const jumpCart = (p: ObstacleProps) =>
  cartRide(p, CART_JUMP.cartRest, CART_JUMP.stop, 'board', 'off');
const RAMP_ANGLE =
  (Math.atan2(CART_JUMP.rampHeight, CART_JUMP.rampEnd - CART_JUMP.rampStart) * 180) / Math.PI;

function jumpTilt(p: ObstacleProps) {
  const launchAt = eventTime(p.events, 'launch');
  const flyAt = eventTime(p.events, 'fly');
  const landAt = eventTime(p.events, 'land');
  if (p.t >= launchAt && p.t < flyAt) return -RAMP_ANGLE * clamp((p.t - launchAt) / 80, 0, 1);
  if (p.t >= flyAt && p.t < landAt)
    return -RAMP_ANGLE + (RAMP_ANGLE + 10) * ((p.t - flyAt) / (landAt - flyAt));
  return flightTilt(p.t, landAt - 1, landAt);
}

/** A painted steel rail along a path (it can bend): dark underside, steel, a bright top edge. */
function BentRail({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={P.railDark} strokeWidth={9} />
      <path d={d} stroke={P.rail} strokeWidth={5} transform="translate(0 -1.5)" />
      <path d={d} stroke={P.railLight} strokeWidth={1.8} transform="translate(0 -3.2)" />
    </g>
  );
}

export function CartJumpBack(p: ObstacleProps) {
  const { rampStart: r0, rampEnd: r1, rampHeight: h } = CART_JUMP;
  const [a, b] = CART_JUMP.gap;
  const cart = jumpCart(p);
  return (
    <g>
      <Pit a={a} b={b} />
      {/* The broken ramp: a timber trestle under the rail, bent up where the track ends. */}
      <path d={`M${r0 + 20} 0 L${r1} ${-h + 4} L${r1 + 4} 2 Z`} fill={P.timberDark} />
      <path
        d={`M${r0 + 40} -2 L${r1 - 6} ${-h + 10} L${r1 - 6} -2 Z`}
        fill={mix(P.timberDark, P.timber, 0.45)}
      />
      <Timber x1={r0 + 62} y1={0} x2={r1 - 30} y2={-h + 18} w={9} />
      <Timber x1={r1 - 30} y1={0} x2={r1 - 30} y2={-h + 18} w={9} />
      <Timber x1={r1} y1={2} x2={r1} y2={-h + 6} w={10} />
      <BentRail d={`M${r0} ${RAIL_TOP + 4} L${r1} ${RAIL_TOP - h + 4} l14 -14`} />
      {/* The far rail's broken end curls down into the gap. */}
      <BentRail d={`M${b + 30} ${RAIL_TOP + 4} Q${b + 6} ${RAIL_TOP + 2} ${b} 20`} />
      <CartRim x={cart.x} lift={cart.lift} tilt={jumpTilt(p)} />
    </g>
  );
}

export function CartJumpFront(p: ObstacleProps) {
  const cart = jumpCart(p);
  const landAt = eventTime(p.events, 'land');
  const flyAt = eventTime(p.events, 'fly');
  const flying = p.t >= flyAt && p.t < landAt;
  return (
    <g>
      {(cart.rolling || flying) && (
        <SpeedLines x={cart.x - 90} t={p.t} ys={SPEED_YS.map((y) => y - cart.lift)} />
      )}
      <MineCart x={cart.x} lift={cart.lift} tilt={jumpTilt(p)} />
      {cart.rolling && <SparkTrail x={cart.x - 34} y={RAIL_TOP - 2} t={p.t} />}
      <SparkBurst x={cart.x - 30} y={RAIL_TOP} dt={p.t - landAt} ms={500} count={12} />
      <SparkBurst x={cart.x + 30} y={RAIL_TOP} dt={p.t - landAt - 40} ms={500} />
      <Dust x={cart.x} y={-4} dt={p.t - landAt} ms={600} />
    </g>
  );
}

// ---------- Level 3: wall smash ----------
// push (he pushes the loaded ore cart) → smash (it bursts through the cave-in).

const WALL_ROCKS = [
  [720, 0, 34],
  [790, 0, 30],
  [745, -60, 38],
  [800, -70, 28],
  [715, -120, 30],
  [775, -140, 36],
  [740, -210, 32],
  [800, -230, 30],
  [720, -280, 28],
  [770, -310, 36],
  [735, -380, 30],
  [800, -400, 28],
  [755, -450, 34],
  [720, -500, 26],
  [795, -520, 30],
] as const;
const SMASH_A = debrisPieces(3, 14);
const SMASH_B = debrisPieces(7, 12);

function smashCartX(p: ObstacleProps) {
  const pushAt = eventTime(p.events, 'push');
  const smashAt = eventTime(p.events, 'smash');
  if (p.t < pushAt) return WALL_SMASH.cartRest;
  const x = Math.max(WALL_SMASH.cartRest, p.heroX + WALL_SMASH.pushGap);
  // After the smash it rolls on ahead of him.
  return p.t < smashAt ? x : x + 0.35 * (p.t - smashAt);
}

/** The cave-in: a mass of fallen rock from floor to roof (painted), loose boulders on its face. */
const CaveIn = memo(function CaveIn() {
  const id = useId();
  const [w0, w1] = WALL_SMASH.wall;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a3036" />
          <stop offset="0.5" stopColor="#6a4a44" />
          <stop offset="1" stopColor="#3a2430" />
        </linearGradient>
      </defs>
      <path
        d={`M${w0 - 20} 4 L${w0} -120 L${w0 - 14} -260 L${w0 + 6} -400 L${w0 - 10} -620 L${w1 + 30} -620 L${w1 + 10} -420 L${w1 + 26} -250 L${w1 + 8} -110 L${w1 + 30} 4 Z`}
        fill={`url(#${id})`}
      />
      {/* Broken props sticking out of the cave-in. */}
      <path
        d={`M${w0 - 30} -470 L${w1 + 40} -330`}
        stroke={INK}
        strokeWidth={22}
        strokeLinecap="round"
      />
      <path
        d={`M${w0 - 30} -470 L${w1 + 40} -330`}
        stroke={WOOD}
        strokeWidth={15}
        strokeLinecap="round"
      />
      <path
        d={`M${w0 - 26} -476 L${w1 + 42} -337`}
        stroke={tint(WOOD, 0.5)}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      {WALL_ROCKS.map(([x, y, s], i) => (
        <Rock key={i} x={x} y={y} s={s} spin={((i * 23) % 30) - 15} />
      ))}
      {/* Cracks glow where the wall is weakest. */}
      <path
        d={`M${w0 + 10} -60 L${w0 + 40} -90 L${w0 + 30} -130 L${w0 + 55} -170`}
        fill="none"
        stroke="#ffd27a"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M${w0 + 10} -60 L${w0 + 40} -90 L${w0 + 30} -130 L${w0 + 55} -170`}
        fill="none"
        stroke="#fff6d0"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
});

export function WallSmashBack(p: ObstacleProps) {
  const smashAt = eventTime(p.events, 'smash');
  const [w0, w1] = WALL_SMASH.wall;
  if (p.t >= smashAt) {
    const dt = p.t - smashAt;
    return (
      <g>
        <Rock x={w0 - 10} y={0} s={24} />
        <Rock x={w1 + 30} y={0} s={20} spin={10} />
        <Debris x={w0} dt={dt} pieces={SMASH_A} color={ROCK} />
        <Debris x={w0 + 40} dt={dt - 60} pieces={SMASH_B} color={shade(ROCK, 0.15)} />
        <Dust x={(w0 + w1) / 2} y={-40} dt={dt} ms={1100} size={2} />
        <Dust x={(w0 + w1) / 2 + 60} y={-220} dt={dt - 100} ms={1000} size={1.6} />
      </g>
    );
  }
  // The cracks pulse while he pushes toward them.
  const pulse = 0.55 + 0.45 * Math.sin(p.t / 120);
  return (
    <g>
      <CaveIn />
      <circle cx={w0 + 34} cy={-115} r={60} fill="#ffb347" opacity={0.12 * pulse} />
    </g>
  );
}

export function WallSmashFront(p: ObstacleProps) {
  const smashAt = eventTime(p.events, 'smash');
  const pushAt = eventTime(p.events, 'push');
  const x = smashCartX(p);
  const moving = p.t >= pushAt && x > WALL_SMASH.cartRest + 2;
  return (
    <g>
      <MineCart x={x} ore />
      {moving && <SparkTrail x={x - 34} y={RAIL_TOP - 2} t={p.t} />}
      <SparkBurst x={WALL_SMASH.wall[0]} y={-80} dt={p.t - smashAt} ms={500} count={12} />
    </g>
  );
}

// ---------- Level 8 (boss): the mine train ----------
// rumble → board (the rockfall chases the train out of the mine) → fly (off the canyon
// edge) → land (far side) → off.

const trainCart = (p: ObstacleProps) =>
  cartRide(p, MINE_TRAIN.cartRest, MINE_TRAIN.stop, 'board', 'off');

function trainTilt(p: ObstacleProps) {
  return flightTilt(p.t, eventTime(p.events, 'fly'), eventTime(p.events, 'land'));
}

/** Rocks dropping from the roof behind the train, each landing where the train just was. */
function Rockfall(p: ObstacleProps) {
  const rumbleAt = eventTime(p.events, 'rumble');
  const boardAt = eventTime(p.events, 'board');
  if (!(p.t >= rumbleAt)) return null;
  const rocks = [];
  // A first few behind him as the rumble starts (never on him: he stands at about 30).
  for (let i = 0; i < 4; i++) {
    rocks.push({ s: rumbleAt + i * 160, x: -230 + i * 55, size: 18 + (i % 2) * 8, k: i });
  }
  for (let k = 0; ; k++) {
    const s = boardAt + 200 + k * 110;
    if (!(s <= p.t)) break;
    const hx = p.heroAt(s).x;
    if (hx > MINE_TRAIN.mouth + 40) break;
    const x = hx - 250 - ((k * 53) % 80);
    if (x > MINE_TRAIN.mouth - 60) continue;
    rocks.push({ s, x, size: 16 + ((k * 7) % 20), k: k + 4 });
  }
  return (
    <g>
      {rocks.map((r) => {
        const dt = p.t - r.s;
        if (dt < 0) return null;
        const y = Math.min(0, -620 + 0.003 * dt * dt);
        return (
          <g key={r.k}>
            <Rock x={r.x} y={y} s={r.size} spin={y < 0 ? dt * 0.3 : 12} />
            <Dust x={r.x} y={-4} dt={dt - 455} ms={500} size={0.5} />
          </g>
        );
      })}
    </g>
  );
}

/** Daylight past the tunnel mouth (painted): sky, sun, mesas, the canyon and the far river. */
const Outside = memo(function Outside() {
  const id = useId();
  const { mouth } = MINE_TRAIN;
  const [c0, c1] = MINE_TRAIN.canyon;
  const end = 2400;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5845a" />
          <stop offset="0.6" stopColor="#ffc27a" />
          <stop offset="1" stopColor="#ffe6b0" />
        </linearGradient>
        <radialGradient id={`${id}sun`}>
          <stop offset="0" stopColor="#fffbe6" stopOpacity={1} />
          <stop offset="0.25" stopColor="#fff1c0" stopOpacity={0.8} />
          <stop offset="1" stopColor="#ffe0a0" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}deep`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a4030" />
          <stop offset="1" stopColor="#4a1e1c" />
        </linearGradient>
      </defs>
      <rect x={mouth} y={-700} width={end - mouth} height={704} fill={`url(#${id}sky)`} />
      <circle cx={1900} cy={-430} r={260} fill={`url(#${id}sun)`} />
      <circle cx={1900} cy={-430} r={44} fill="#fffaf0" />
      {/* Mesas far away, then nearer, each lit along its top. */}
      <path
        d={`M${mouth} -120 L1150 -120 L1170 -210 L1320 -210 L1340 -130 L1560 -130 L1580 -260 L1760 -260 L1790 -150 L2000 -150 L2020 -230 L2200 -230 L2230 -110 L${end} -110 V0 H${mouth} Z`}
        fill="#e09a84"
        opacity={0.85}
      />
      <path
        d="M1170 -210 L1320 -210 M1580 -260 L1760 -260 M2020 -230 L2200 -230"
        stroke="#ffd8b8"
        strokeWidth={4}
        opacity={0.8}
      />
      <path
        d={`M${mouth} -40 L1240 -40 L1260 -90 L1400 -90 L1420 -50 L1700 -50 L1730 -120 L1880 -120 L1900 -60 L${end} -60 V0 H${mouth} Z`}
        fill="#c26a50"
      />
      <path d="M1260 -90 L1400 -90 M1730 -120 L1880 -120" stroke="#f0a880" strokeWidth={4} />
      {/* The canyon: the far wall, the river far below, and the two cliff faces. */}
      <rect x={c0} y={-4} width={c1 - c0} height={210} fill={`url(#${id}deep)`} />
      <path d={`M${c0} 150 Q${(c0 + c1) / 2} 135 ${c1} 150 V210 H${c0} Z`} fill="#4fb3d9" />
      <path
        d={`M${c0 + 30} 146 Q${(c0 + c1) / 2} 134 ${c1 - 40} 146`}
        stroke="#c8f0ff"
        strokeWidth={3}
        fill="none"
      />
      <path d={`M${c0} -4 L${c0 + 40} 210 H${c0 - 4} Z`} fill="#b86a4a" />
      <path d={`M${c1} -4 L${c1 - 30} 210 H${c1 + 4} Z`} fill="#6e3424" />
      <path
        d={`M${c0 + 8} 30 l14 4 M${c0 + 16} 80 l14 4`}
        stroke="#d88a60"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Sunlit ground on both sides, with its own track. */}
      {(
        [
          [mouth, c0],
          [c1, end],
        ] as const
      ).map(([a, b]) => (
        <g key={a}>
          <rect x={a} y={-4} width={b - a} height={210} fill="#c47a45" />
          <rect x={a} y={-4} width={b - a} height={8} fill="#f0b47a" />
          <rect x={a} y={30} width={b - a} height={180} fill="#a85e38" opacity={0.6} />
          <Rails a={a} b={b} />
        </g>
      ))}
    </g>
  );
});

/** The tunnel mouth (painted): the rock face and a timber portal, daylight on its far edge. */
const Mouth = memo(function Mouth() {
  const m = MINE_TRAIN.mouth;
  return (
    <g>
      <path
        d={`M${m - 40} -700 L${m + 50} -700 L${m + 30} -560 L${m + 60} -420 L${m + 36} -300 L${m + 58} -170 L${m + 40} 4 L${m - 40} 4 Z`}
        fill="#3a2830"
      />
      <path
        d={`M${m + 50} -700 L${m + 30} -560 L${m + 60} -420 L${m + 36} -300 L${m + 58} -170 L${m + 40} 4`}
        stroke="#f0a070"
        strokeWidth={5}
        fill="none"
        opacity={0.7}
      />
      <rect x={m - 20} y={-250} width={20} height={254} fill={P.timber} />
      <rect x={m - 20} y={-250} width={7} height={254} fill={P.timberDark} />
      <rect x={m - 60} y={-270} width={110} height={24} fill={P.timber} />
      <rect x={m - 60} y={-254} width={110} height={8} fill={P.timberDark} />
      <rect x={m - 60} y={-270} width={110} height={3} fill={P.timberLight} />
    </g>
  );
});

const ENGINE = '#2f7d64';
const CAB = '#d2453a';
const BRASS = '#f0c050';

/** The little engine pushing the cart, its front facing right. */
function Engine({ x, lift, tilt, t }: { x: number; lift: number; tilt: number; t: number }) {
  const spin = (x / 16) * (180 / Math.PI);
  return (
    <g>
      {/* Puffs of smoke streaming back from the stack (painted, soft). */}
      {Array.from({ length: 4 }, (_, i) => {
        const ph = ((t + i * 180) % 720) / 720;
        const cx = x + 40 - ph * 90;
        const cy = -lift - 150 - ph * 120;
        const r = 12 + ph * 26;
        return (
          <g key={i} opacity={0.8 * (1 - ph)}>
            <circle cx={cx} cy={cy} r={r} fill="#d8d0cc" />
            <circle cx={cx - r * 0.2} cy={cy - r * 0.25} r={r * 0.62} fill="#f4f0ee" />
          </g>
        );
      })}
      <g transform={`translate(${x} ${-lift}) rotate(${tilt} 0 -24)`}>
        <EngineBody />
        {[-40, 0, 40].map((wx) => (
          <g key={wx} transform={`translate(${wx} ${RAIL_TOP - 16})`}>
            <circle r={16} fill="#a8322d" {...ink(OUT)} />
            <g transform={`rotate(${spin})`} stroke={BRASS} strokeWidth={3} strokeLinecap="round">
              <path d="M-11 0 H11 M0 -11 V11" />
            </g>
            <circle r={4.5} fill={BRASS} {...ink(IN)} />
          </g>
        ))}
        <path d="M-40 -24 H40" stroke={IRON} strokeWidth={5} strokeLinecap="round" />
      </g>
    </g>
  );
}

/** The engine's body, cab and boiler: drawn once (memoized), since only its wheels turn. */
const EngineBody = memo(function EngineBody() {
  return (
    <g>
      <rect x={-68} y={-46} width={142} height={18} rx={4} fill="#2c2f36" {...ink(OUT)} />
      <rect x={-64} y={-34} width={134} height={5} fill="#16181c" />
      {/* The boiler, its bands and a rim light along the top. */}
      <rect x={-10} y={-104} width={78} height={60} rx={28} fill={ENGINE} {...ink(OUT)} />
      <path
        d="M-10 -66 Q-10 -46 10 -46 L60 -46 Q66 -46 68 -54 L-6 -54 Z"
        fill={shade(ENGINE, 0.32)}
      />
      <path
        d="M10 -100 Q40 -104 58 -96"
        stroke={tint(ENGINE, 0.5)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      {[12, 42].map((bx) => (
        <rect key={bx} x={bx} y={-106} width={7} height={63} rx={2} fill={BRASS} {...ink(IN)} />
      ))}
      <path d="M34 -104 L29 -136 H57 L51 -104 Z" fill="#2c2f36" {...ink(OUT)} />
      <rect x={25} y={-142} width={36} height={9} rx={3} fill="#2c2f36" {...ink(IN + 0.5)} />
      {/* The headlamp at the front. */}
      <rect x={64} y={-92} width={16} height={18} rx={5} fill={BRASS} {...ink(IN + 0.5)} />
      <circle cx={76} cy={-83} r={5} fill="#fff6c0" />
      <Glint x={78} y={-86} r={9} color="#ffffff" />
      {/* The cab: red, with a window and a roof. */}
      <rect x={-68} y={-140} width={62} height={98} rx={5} fill={CAB} {...ink(OUT)} />
      <path d="M-68 -136 L-68 -46 L-50 -46 L-50 -136 Z" fill={shade(CAB, 0.3)} />
      <path d="M-10 -134 V-52" stroke={tint(CAB, 0.5)} strokeWidth={2.4} strokeLinecap="round" />
      <rect x={-76} y={-152} width={76} height={15} rx={4} fill="#5a1f24" {...ink(OUT)} />
      <rect x={-55} y={-128} width={38} height={32} rx={4} fill="#ffe7a8" {...ink(IN + 0.5)} />
      <path d="M-50 -100 L-24 -124" stroke="#fff8e0" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
});

export function MineTrainBack(p: ObstacleProps) {
  const cart = trainCart(p);
  return (
    <g>
      <Outside />
      <Mouth />
      <Rockfall {...p} />
      <CartRim x={cart.x} lift={cart.lift} tilt={trainTilt(p)} />
    </g>
  );
}

export function MineTrainFront(p: ObstacleProps) {
  const cart = trainCart(p);
  const tilt = trainTilt(p);
  const landAt = eventTime(p.events, 'land');
  const flyAt = eventTime(p.events, 'fly');
  const flying = p.t >= flyAt && p.t < landAt;
  const ex = cart.x - MINE_TRAIN.engineGap;
  return (
    <g>
      {(cart.rolling || flying) && (
        <SpeedLines x={ex - 80} t={p.t} ys={SPEED_YS.map((y) => y - cart.lift)} />
      )}
      <Engine x={ex} lift={cart.lift} tilt={tilt} t={p.t} />
      <MineCart x={cart.x} lift={cart.lift} tilt={tilt} />
      {cart.rolling && <SparkTrail x={ex - 40} y={RAIL_TOP - 2} t={p.t} />}
      <SparkBurst x={cart.x} y={RAIL_TOP} dt={p.t - landAt} ms={550} count={12} />
      <SparkBurst x={ex} y={RAIL_TOP} dt={p.t - landAt - 60} ms={550} />
      <Dust x={cart.x - 60} y={-4} dt={p.t - landAt} ms={700} size={1.3} color="#e0a068" />
    </g>
  );
}
