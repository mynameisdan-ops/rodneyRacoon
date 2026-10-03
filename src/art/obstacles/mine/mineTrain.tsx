import { useId } from 'react';
import { Dust, Glow, SparkBurst, SparkTrail, SpeedLines } from '../../fx';
import { ink, shade } from '../../style';
import { eventTime, type ObstacleProps } from '../types';
import { cartRide, flightTilt, RAIL_TOP, WOOD, SPEED_YS } from './kit';
import { MINE_TRAIN } from './layout';
import { CartRim, MineCart, Rails, Rock } from './parts';

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
  // A first few around him as the rumble starts.
  for (let i = 0; i < 4; i++) {
    rocks.push({ s: rumbleAt + i * 160, x: -160 + i * 70, size: 18 + (i % 2) * 8, k: i });
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

/** Daylight past the tunnel mouth: sky, mesas, sunlit ground and the canyon. */
function Outside() {
  const sky = useId();
  const { mouth } = MINE_TRAIN;
  const [c0, c1] = MINE_TRAIN.canyon;
  const end = 2400;
  return (
    <g>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f08a5d" />
          <stop offset="1" stopColor="#ffe0a3" />
        </linearGradient>
      </defs>
      <rect x={mouth} y={-700} width={end - mouth} height={704} fill={`url(#${sky})`} />
      <Glow x={1900} y={-430} r={260} color="#fff3c4" />
      <circle cx={1900} cy={-430} r={46} fill="#fff6d8" />
      <path
        d={`M${mouth} -120 L1150 -120 L1170 -210 L1320 -210 L1340 -130 L1560 -130 L1580 -260 L1760 -260 L1790 -150 L2000 -150 L2020 -230 L2200 -230 L2230 -110 L${end} -110 V0 H${mouth} Z`}
        fill="#c77a6e"
        opacity={0.8}
      />
      <path
        d={`M${mouth} -40 L1240 -40 L1260 -90 L1400 -90 L1420 -50 L1700 -50 L1730 -120 L1880 -120 L1900 -60 L${end} -60 V0 H${mouth} Z`}
        fill="#a85a45"
      />
      {/* The canyon: far wall, river far below, and the two cliff faces. */}
      <rect x={c0} y={-4} width={c1 - c0} height={210} fill="#7a3b24" />
      <path d={`M${c0} 150 Q${(c0 + c1) / 2} 135 ${c1} 150 V210 H${c0} Z`} fill="#4fb3d9" />
      <path d={`M${c0} -4 L${c0 + 40} 210 H${c0 - 4} Z`} fill="#b86a3e" {...ink(3)} />
      <path d={`M${c1} -4 L${c1 - 30} 210 H${c1 + 4} Z`} fill="#8f4a2c" {...ink(3)} />
      {/* Sunlit ground on both sides, with its own track. */}
      {(
        [
          [mouth, c0],
          [c1, end],
        ] as const
      ).map(([a, b]) => (
        <g key={a}>
          <rect x={a} y={-4} width={b - a} height={210} fill="#c47a45" {...ink(3)} />
          <rect x={a} y={-4} width={b - a} height={8} fill="#e0a068" />
          <Rails a={a} b={b} />
        </g>
      ))}
    </g>
  );
}

/** The tunnel mouth: the rock face and a timber portal. */
function Mouth() {
  const m = MINE_TRAIN.mouth;
  return (
    <g>
      <path
        d={`M${m - 40} -700 L${m + 50} -700 L${m + 30} -560 L${m + 60} -420 L${m + 36} -300 L${m + 58} -170 L${m + 40} 4 L${m - 40} 4 Z`}
        fill="#3a2830"
        {...ink(3)}
      />
      <rect x={m - 20} y={-250} width={20} height={254} fill={WOOD} {...ink(3)} />
      <rect x={m - 60} y={-270} width={110} height={24} fill={WOOD} {...ink(3)} />
    </g>
  );
}

/** The little engine pushing the cart, its front facing right. */
function Engine({ x, lift, tilt, t }: { x: number; lift: number; tilt: number; t: number }) {
  const spin = (x / 16) * (180 / Math.PI);
  return (
    <g>
      {Array.from({ length: 4 }, (_, i) => {
        const ph = ((t + i * 180) % 720) / 720;
        return (
          <circle
            key={i}
            cx={x + 40 - ph * 90}
            cy={-lift - 150 - ph * 120}
            r={12 + ph * 26}
            fill="#e8e1d8"
            opacity={0.7 * (1 - ph)}
          />
        );
      })}
      <g transform={`translate(${x} ${-lift}) rotate(${tilt} 0 -24)`}>
        {[-40, 0, 40].map((wx) => (
          <g key={wx} transform={`translate(${wx} ${RAIL_TOP - 16}) rotate(${spin})`}>
            <circle r={16} fill="#8a2a24" {...ink(3)} />
            <path d="M-12 0 H12 M0 -12 V12" stroke="#e0b458" strokeWidth={3} />
          </g>
        ))}
        <rect x={-66} y={-44} width={136} height={16} rx={3} fill="#2c2f36" {...ink(3)} />
        <rect x={-8} y={-100} width={72} height={58} rx={26} fill="#2f5d50" {...ink(3.5)} />
        <rect x={-8} y={-70} width={72} height={10} fill={shade('#2f5d50', 0.35)} />
        {[10, 40].map((bx) => (
          <rect key={bx} x={bx} y={-102} width={7} height={62} fill="#e0b458" {...ink(2)} />
        ))}
        <path d="M34 -100 L30 -132 H56 L50 -100 Z" fill="#2c2f36" {...ink(3)} />
        <rect x={-66} y={-138} width={60} height={96} rx={4} fill="#a8322d" {...ink(3.5)} />
        <rect x={-72} y={-148} width={72} height={14} rx={3} fill="#5a1f24" {...ink(3)} />
        <rect x={-54} y={-126} width={36} height={30} rx={3} fill="#ffe7a8" {...ink(2.5)} />
        <rect x={64} y={-60} width={12} height={22} rx={3} fill="#e0b458" {...ink(2.5)} />
      </g>
    </g>
  );
}

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
