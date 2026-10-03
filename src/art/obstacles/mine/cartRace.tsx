import { Dust, SparkBurst, SparkTrail, SpeedLines } from '../../fx';
import { ink, shade } from '../../style';
import { eventTime, type ObstacleProps } from '../types';
import { BOULDER_R, cartRide, clamp, RAIL_TOP, ROCK, STEEL, WOOD, SPEED_YS } from './kit';
import { CART_RACE } from './layout';
import { Boulder, CartRim, MineCart, Pit, PitLip, Rails } from './parts';

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
    <g fill={shade(ROCK, 0.15)} {...ink(2)}>
      {PEBBLES.map((pb, i) => {
        const dt = t - from - pb.delay;
        if (!(dt >= 0)) return null;
        const y = -760 + 0.004 * dt * dt;
        if (y > -pb.r) return null;
        return <circle key={i} cx={pb.x} cy={y} r={pb.r} />;
      })}
    </g>
  );
}

function Trestle({ t, dropAt }: { t: number; dropAt: number }) {
  const [a, b] = CART_RACE.pit;
  if (t < dropAt) {
    return (
      <g>
        <g stroke={shade(WOOD, 0.2)} strokeWidth={9} strokeLinecap="round">
          <path d={`M${a + 10} -2 L${a + 100} 150 M${b - 10} -2 L${a + 100} 150`} />
          <path d={`M${a + 100} -2 V180`} />
        </g>
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
            <rect x={-36} y={-5} width={72} height={10} fill={STEEL} {...ink(2)} />
            <rect x={-14} y={3} width={26} height={11} fill={WOOD} {...ink(2)} />
          </g>
        );
      })}
    </g>
  );
}

function Bumper({ x }: { x: number }) {
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
