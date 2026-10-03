import { Dust, SparkBurst, SparkTrail, SpeedLines } from '../../fx';
import { INK, ink, shade } from '../../style';
import { eventTime, type ObstacleProps } from '../types';
import { cartRide, clamp, flightTilt, RAIL_TOP, STEEL, WOOD, SPEED_YS } from './kit';
import { CART_JUMP } from './layout';
import { CartRim, MineCart, Pit } from './parts';

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

export function CartJumpBack(p: ObstacleProps) {
  const { rampStart: r0, rampEnd: r1, rampHeight: h } = CART_JUMP;
  const [a, b] = CART_JUMP.gap;
  const cart = jumpCart(p);
  return (
    <g>
      <Pit a={a} b={b} />
      {/* The broken ramp: a timber trestle with the rail bent up at the end. */}
      <path d={`M${r0 + 20} 0 L${r1} ${-h + 4} L${r1} 0 Z`} fill={shade(WOOD, 0.25)} {...ink(3)} />
      <path
        d={`M${r0 + 60} 0 L${r1 - 30} ${-h + 14} M${r1 - 30} 0 L${r1 - 30} ${-h + 16}`}
        stroke={WOOD}
        strokeWidth={7}
      />
      <path
        d={`M${r0} ${RAIL_TOP + 4} L${r1} ${RAIL_TOP - h + 4} l14 -14`}
        fill="none"
        stroke={INK}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M${r0} ${RAIL_TOP + 4} L${r1} ${RAIL_TOP - h + 4} l14 -14`}
        fill="none"
        stroke={STEEL}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* The far rail's broken end curls down into the gap. */}
      <path
        d={`M${b + 30} ${RAIL_TOP + 4} Q${b + 6} ${RAIL_TOP + 2} ${b} 20`}
        fill="none"
        stroke={INK}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d={`M${b + 30} ${RAIL_TOP + 4} Q${b + 6} ${RAIL_TOP + 2} ${b} 20`}
        fill="none"
        stroke={STEEL}
        strokeWidth={7}
        strokeLinecap="round"
      />
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
