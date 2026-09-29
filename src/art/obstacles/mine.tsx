import { INK, ink, shade, tint } from '../style';
import { CART_RACE } from './mineLayout';
import { eventTime, type ObstacleProps } from './types';

/*
 * World 1 (Old Mine Shaft) obstacles. Local coordinates: anchor (0, 0) on the
 * ground line, up is negative y, sized for a 200px-tall hero. Motion is computed
 * from `t` and the prop schedule, so every frame is deterministic.
 */

const RAIL_TOP = -9;
const WOOD = '#7a5234';
const IRON = '#5d6570';
const ROCK = '#80705f';

// ---------- Cart race (level 1) ----------
// States: rumble (a boulder crashes down) → chase (he rides, it rolls after him)
// → drop (it smashes the trestle and falls into the pit) → crash (the buffer stops the cart).

const R = 62;
const PIT_MID = (CART_RACE.pit[0] + CART_RACE.pit[1]) / 2;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function cartX(p: ObstacleProps) {
  return clamp(p.heroX, CART_RACE.cartRest, CART_RACE.bufferX);
}

/** Boulder center and spin at time t, or null while it is hidden. */
function boulder(p: ObstacleProps): { x: number; y: number; spin: number } | null {
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

function Boulder({ x, y, spin }: { x: number; y: number; spin: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={R} fill={ROCK} {...ink(4)} />
      <path
        d={`M${-R * 0.95} 10 A${R} ${R} 0 0 0 ${R * 0.4} ${R * 0.92} Q ${-R * 0.5} ${R * 0.6} ${-R * 0.95} 10 Z`}
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

/** Pebbles shaken loose from the ceiling during the rumble. */
const PEBBLES = Array.from({ length: 10 }, (_, i) => ({
  x: -520 + i * 70 + ((i * 37) % 30),
  delay: (i * 97) % 600,
  r: 5 + (i % 3) * 3,
}));

function Pebbles({ t, rumbleAt }: { t: number; rumbleAt: number }) {
  return (
    <g fill={shade(ROCK, 0.15)} {...ink(2)}>
      {PEBBLES.map((pb, i) => {
        const dt = t - rumbleAt - pb.delay;
        if (dt < 0) return null;
        const y = -760 + 0.004 * dt * dt;
        if (y > -pb.r) return null;
        return <circle key={i} cx={pb.x} cy={y} r={pb.r} />;
      })}
    </g>
  );
}

/** Puffs of dust at (x, y) that grow and fade over `ms`. */
function Dust({
  x,
  y,
  dt,
  ms,
  size = 1,
}: {
  x: number;
  y: number;
  dt: number;
  ms: number;
  size?: number;
}) {
  if (dt < 0 || dt > ms) return null;
  const p = dt / ms;
  return (
    <g fill="#b89a82" opacity={0.75 * (1 - p)}>
      {[-1, -0.4, 0.3, 1].map((s, i) => (
        <circle
          key={i}
          cx={x + s * (30 + 70 * p) * size}
          cy={y - (10 + 50 * p) * size * (i % 2 ? 1.2 : 0.8)}
          r={(18 + 36 * p) * size}
        />
      ))}
    </g>
  );
}

function Pit({ t, dropAt }: { t: number; dropAt: number }) {
  const [a, b] = CART_RACE.pit;
  const broken = t >= dropAt;
  const dt = t - dropAt;
  return (
    <g>
      <path
        d={`M${a - 14} -4 L${a} -14 L${b} -14 L${b + 14} -4 L${b + 4} 200 L${a - 4} 200 Z`}
        fill="#140b12"
        {...ink(3)}
      />
      <path d={`M${a} -10 L${a + 26} 200 L${a - 4} 200 Z`} fill="#2e1d24" />
      {!broken && (
        <g>
          {/* Trestle: X-braces down into the pit and the rails across it. */}
          <g stroke={shade(WOOD, 0.2)} strokeWidth={9} strokeLinecap="round">
            <path d={`M${a + 10} -2 L${a + 100} 150 M${b - 10} -2 L${a + 100} 150`} />
            <path d={`M${a + 100} -2 V180`} />
          </g>
          {Array.from({ length: 6 }, (_, i) => (
            <rect
              key={i}
              x={a - 6 + i * 40}
              y={-1}
              width={26}
              height={11}
              rx={2}
              fill={WOOD}
              {...ink(2)}
            />
          ))}
          <rect x={a - 12} y={RAIL_TOP} width={b - a + 24} height={8} fill="#a9b4c0" {...ink(2)} />
        </g>
      )}
      {broken &&
        [0, 1, 2].map((i) => {
          const y = 0.0025 * dt * dt;
          if (y > 300) return null;
          const x = a + 35 + i * 65 + (i - 1) * dt * 0.05;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(i - 1) * 0.35 * dt + 8})`}>
              <rect x={-36} y={-5} width={72} height={10} fill="#a9b4c0" {...ink(2)} />
              <rect x={-14} y={3} width={26} height={11} fill={WOOD} {...ink(2)} />
            </g>
          );
        })}
    </g>
  );
}

function Bumper() {
  const x = CART_RACE.bufferX + 64;
  return (
    <g>
      <rect x={x + 10} y={-120} width={22} height={124} fill={shade(WOOD, 0.15)} {...ink(3)} />
      <rect x={x} y={-92} width={46} height={60} rx={4} fill={WOOD} {...ink(3)} />
      <path
        d={`M${x} -80 H${x + 46} M${x} -48 H${x + 46}`}
        stroke={shade(WOOD, 0.4)}
        strokeWidth={3}
      />
      <rect x={x - 6} y={-86} width={10} height={48} rx={3} fill="#c0392b" {...ink(2.5)} />
    </g>
  );
}

/** Behind the hero: the pit, the boulder, the buffer and the far rim of the cart. */
export function CartRaceBack(p: ObstacleProps) {
  const rumbleAt = eventTime(p.events, 'rumble');
  const dropAt = eventTime(p.events, 'drop');
  const b = boulder(p);
  const cx = cartX(p);
  return (
    <g>
      <Bumper />
      <Pit t={p.t} dropAt={dropAt} />
      <Pebbles t={p.t} rumbleAt={rumbleAt} />
      {b && <Boulder {...b} />}
      {/* The pit's near lip hides the boulder as it drops in. */}
      <path
        d={`M${CART_RACE.pit[0] - 20} 40 L${CART_RACE.pit[0] + 30} 22 L${PIT_MID} 34 L${CART_RACE.pit[1] - 20} 20 L${CART_RACE.pit[1] + 20} 40 V200 H${CART_RACE.pit[0] - 20} Z`}
        fill="#3d2a20"
        {...ink(3)}
      />
      <Dust x={CART_RACE.boulderStart} y={-4} dt={p.t - rumbleAt - 450} ms={700} />
      <Dust x={PIT_MID} y={-10} dt={p.t - dropAt - 150} ms={1000} size={1.4} />
      {/* The inside of the cart's far wall, seen above the hero's legs. */}
      <path
        d={`M${cx - 58} -116 L${cx + 58} -116 L${cx + 54} -128 L${cx - 54} -128 Z`}
        fill="#2a1a14"
        {...ink(3)}
      />
    </g>
  );
}

/** In front of the hero: the cart (hiding his legs while he rides), sparks and speed lines. */
export function CartRaceFront(p: ObstacleProps) {
  const chaseAt = eventTime(p.events, 'chase');
  const crashAt = eventTime(p.events, 'crash');
  const cx = cartX(p);
  const riding = p.t >= chaseAt && p.t < crashAt && cx > CART_RACE.cartRest + 2;
  const sinceCrash = p.t - crashAt;
  const tilt =
    sinceCrash >= 0 && sinceCrash < 420 ? 15 * Math.sin((Math.PI * sinceCrash) / 420) : 0;
  const wheelSpin = (cx / 15) * (180 / Math.PI);

  return (
    <g>
      {riding && (
        <g stroke="#fff3d6" strokeWidth={4} strokeLinecap="round" opacity={0.55}>
          {[-60, -86, -100, -48].map((y, i) => {
            const off = (p.t * 0.7 + i * 53) % 170;
            return <path key={i} d={`M${cx - 90 - off} ${y} h${-50 - i * 12}`} />;
          })}
        </g>
      )}
      <g transform={`translate(${cx} 0) rotate(${tilt} 60 -24)`}>
        {[-30, 30].map((wx) => (
          <g key={wx} transform={`translate(${wx} ${RAIL_TOP - 15}) rotate(${wheelSpin})`}>
            <circle r={15} fill="#3a3f47" {...ink(3)} />
            <path d="M-11 0 H11 M0 -11 V11" stroke={tint(IRON, 0.3)} strokeWidth={3} />
            <circle r={4} fill={tint(IRON, 0.4)} {...ink(1.5)} />
          </g>
        ))}
        <path d="M-50 -34 L50 -34 L60 -116 L-60 -116 Z" fill={WOOD} {...ink(3.5)} />
        <path d="M-50 -34 L50 -34 L52 -52 L-52 -52 Z" fill={shade(WOOD, 0.35)} />
        <path d="M-56 -84 L56 -84" stroke={shade(WOOD, 0.4)} strokeWidth={3} />
        {[-36, 0, 36].map((x) => (
          <path key={x} d={`M${x} -36 L${x * 1.18} -114`} stroke={IRON} strokeWidth={9} />
        ))}
        <rect x={-64} y={-122} width={128} height={13} rx={3} fill={IRON} {...ink(3)} />
        <rect x={-60} y={-120} width={120} height={3} fill={tint(IRON, 0.5)} />
        {[-50, -18, 18, 50].map((x) => (
          <circle key={x} cx={x} cy={-115} r={2.4} fill={tint(IRON, 0.6)} />
        ))}
      </g>
      {riding &&
        Array.from({ length: 8 }, (_, i) => {
          const ph = ((p.t + i * 37) % 260) / 260;
          const x = cx - 34 - ph * (70 + (i % 3) * 20);
          const y = RAIL_TOP - 2 - 50 * ph + 70 * ph * ph;
          return (
            <path
              key={i}
              d={`M${x} ${y} l9 3`}
              stroke="#ffd35a"
              strokeWidth={3.5}
              strokeLinecap="round"
              opacity={1 - ph}
            />
          );
        })}
      {sinceCrash >= 0 &&
        sinceCrash < 450 &&
        Array.from({ length: 10 }, (_, i) => {
          const a = -Math.PI * (0.1 + (0.8 * i) / 9);
          const d = 20 + sinceCrash * 0.35;
          const x = cx + 66 + Math.cos(a) * d;
          const y = -70 + Math.sin(a) * d;
          return (
            <path
              key={i}
              d={`M${x} ${y} l${Math.cos(a) * 12} ${Math.sin(a) * 12}`}
              stroke="#ffd35a"
              strokeWidth={4}
              strokeLinecap="round"
              opacity={1 - sinceCrash / 450}
            />
          );
        })}
    </g>
  );
}
