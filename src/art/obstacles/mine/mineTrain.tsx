import { memo, useId } from 'react';
import { Dust, SparkBurst, SparkTrail, SpeedLines } from '../../fx';
import { ink, shade, tint } from '../../style';
import { PAINTED_MINE } from '../../worlds/minePalette';
import { Glint } from '../../worlds/paintKit';
import { eventTime, type ObstacleProps } from '../types';
import { cartRide, flightTilt, IN, IRON, OUT, RAIL_TOP, SPEED_YS } from './kit';
import { MINE_TRAIN } from './layout';
import { CartRim, MineCart, Rails, Rock } from './parts';

// ---------- Level 8 (boss): the mine train ----------
// rumble → board (the rockfall chases the train out of the mine) → fly (off the canyon
// edge) → land (far side) → off.

const P = PAINTED_MINE;

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
