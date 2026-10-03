import { memo, useId } from 'react';
import { Debris, Dust, SparkBurst, SparkTrail } from '../../fx';
import { debrisPieces } from '../../fxData';
import { INK, shade, tint } from '../../style';
import { eventTime, type ObstacleProps } from '../types';
import { RAIL_TOP, ROCK, WOOD } from './kit';
import { WALL_SMASH } from './layout';
import { MineCart, Rock } from './parts';

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
