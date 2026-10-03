import { memo, useId } from 'react';
import { SnowPine } from '../../worlds/mountain';
import { clamp01, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { CLIFF, CLIFF_DARK, CLIFF_SHADE, P } from './kit';
import { ROCK_SLIDE } from './layout';
import { Icicles, Rock, SnowBurst, SnowLedge } from './parts';

// ---------- Level 25: rock slide ----------
// rumble (pebbles trickle down the cliff) → slide (rocks roll down its snowy top, fly off the
// shelf's lip over his head and crash onto the path behind him) → clear.

const SLOPE = ROCK_SLIDE.slope;
const LIP = SLOPE[0];
/** The slope from its top down to the lip, with each point's distance from the top. */
const DOWN = [...SLOPE].reverse();
const DIST = DOWN.reduce<number[]>(
  (acc, p, i) =>
    i === 0
      ? [0]
      : [...acc, acc[i - 1]! + Math.hypot(p[0] - DOWN[i - 1]![0], p[1] - DOWN[i - 1]![1])],
  [],
);
const LENGTH = DIST[DIST.length - 1]!;
/** How deep the snow lies on the cliff's top. */
const SNOW_ON_TOP = 8;

/** The point `d` px down the slope from its top, and the slope's upward normal there. */
function onSlope(d: number) {
  let i = 1;
  while (i < DOWN.length - 1 && DIST[i]! < d) i++;
  const a = DOWN[i - 1]!;
  const b = DOWN[i]!;
  const len = DIST[i]! - DIST[i - 1]!;
  const u = clamp01((d - DIST[i - 1]!) / len);
  const dx = (b[0] - a[0]) / len;
  const dy = (b[1] - a[1]) / len;
  return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, nx: -dy, ny: dx };
}

const G = 0.0011;

const ROCKS = [0, 180, 420, 560, 760, 980, 1120, 1300, 1480].map((delay, i) => ({
  delay,
  r: 22 + 16 * noise(i, 3),
  vx: 0.4 + 0.24 * noise(i, 5),
  hops: 2 + (i % 3),
  rest: i % 3 === 1,
  snow: i % 2 === 0,
}));

/** Where a rock is `dt` ms after it set off, how far it has rolled, and its landings. */
function rockAt(r: (typeof ROCKS)[number], dt: number) {
  const roll = ROCK_SLIDE.roll;
  if (dt < roll) {
    const u = (dt / roll) ** 1.3;
    const s = onSlope(u * LENGTH);
    const hop = r.r * 0.4 * Math.abs(Math.sin(Math.PI * r.hops * u)) ** 1.6;
    const off = r.r + SNOW_ON_TOP + hop;
    return { x: s.x + s.nx * off, y: s.y + s.ny * off, dist: u * LENGTH, land: -1, land2: -1 };
  }
  // Off the lip in a hop, then down onto the path, one bounce, and on along it.
  const end = onSlope(LENGTH);
  const x0 = end.x + end.nx * (r.r + SNOW_ON_TOP);
  const y0 = end.y + end.ny * (r.r + SNOW_ON_TOP);
  const vy = -0.18;
  const ft = dt - roll;
  const fall = y0 + r.r;
  const t1 = (-vy + Math.sqrt(vy * vy + 4 * G * -fall)) / (2 * G);
  if (ft < t1) {
    return {
      x: x0 - r.vx * ft,
      y: y0 + vy * ft + G * ft * ft,
      dist: LENGTH + r.vx * ft,
      land: -1,
      land2: -1,
    };
  }
  const x1 = x0 - r.vx * t1;
  const v2 = r.vx * 0.7;
  const bounce = (2 * 0.28) / (2 * G);
  const bt = ft - t1;
  if (bt < bounce) {
    return {
      x: x1 - v2 * bt,
      y: -r.r - (0.28 * bt - G * bt * bt),
      dist: LENGTH + r.vx * t1 + v2 * bt,
      land: bt,
      land2: -1,
    };
  }
  const x2 = x1 - v2 * bounce;
  const rt = bt - bounce;
  const slow = 500;
  const run = r.rest ? v2 * (Math.min(rt, slow) - Math.min(rt, slow) ** 2 / (2 * slow)) : v2 * rt;
  return {
    x: x2 - run,
    y: -r.r,
    dist: LENGTH + r.vx * t1 + v2 * bounce + run,
    land: bt,
    land2: rt,
  };
}

/** The cliff (painted): its face, the dark hollow under its shelf, snow along its top. */
const Cliff = memo(function Cliff() {
  const id = useId();
  const sky = SLOPE.map(([x, y]) => `L${x} ${y}`).join(' ');
  const [o0, o1] = ROCK_SLIDE.overhang;
  const under = -ROCK_SLIDE.clear;
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}face`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-860}
          x2="0"
          y2={0}
        >
          <stop offset="0" stopColor={CLIFF} />
          <stop offset="0.55" stopColor={CLIFF_SHADE} />
          <stop offset="1" stopColor={CLIFF_DARK} />
        </linearGradient>
        <linearGradient
          id={`${id}hollow`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={under}
          x2="0"
          y2={0}
        >
          <stop offset="0" stopColor="#1e2654" />
          <stop offset="0.5" stopColor="#323d74" />
          <stop offset="1" stopColor="#56649c" />
        </linearGradient>
      </defs>
      <path
        d={`M380 -12 Q400 -120 ${o0 - 4} ${under - 6} L418 -240 L416 -282 ${sky} L1450 -12 Z`}
        fill={`url(#${id}face)`}
      />
      {/* Lit faces turned to the sun (upper right). */}
      <g fill="#c2c5e6" opacity={0.55}>
        <path d="M600 -360 L700 -416 L760 -330 L690 -300 Z" />
        <path d="M860 -544 L1000 -660 L1060 -560 L960 -470 Z" />
        <path d="M1150 -760 L1300 -812 L1340 -700 L1220 -640 Z" />
        <path d="M900 -300 L1010 -380 L1060 -250 L960 -220 Z" />
      </g>
      <g stroke={CLIFF_DARK} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.45}>
        <path d="M520 -280 q60 10 130 -6 M820 -420 q80 10 160 -12 M1060 -600 q90 6 170 -20" />
        <path d="M900 -160 l20 40 l-8 40 M1200 -400 l14 50 l-10 30 M700 -250 l10 30" />
      </g>
      {/* The hollow under the shelf, in shadow: its back wall, a snowy floor, a few icicles. */}
      <path
        d={`M380 -12 Q400 -120 ${o0 - 4} ${under - 6} Q${o0 + 80} ${under + 8} ${o0 + 160} ${under - 4} Q${o1 - 60} ${under + 10} ${o1} ${under - 2} Q${o1 + 70} -150 ${o1 + 100} -12 Z`}
        fill={`url(#${id}hollow)`}
      />
      <g fill="#4c5890" opacity={0.7}>
        <path
          d={`M${o0 + 40} ${under + 30} L${o0 + 130} ${under + 20} L${o0 + 110} -60 L${o0 + 50} -40 Z`}
        />
        <path
          d={`M${o0 + 200} ${under + 26} L${o1 - 40} ${under + 30} L${o1 - 70} -70 L${o0 + 230} -50 Z`}
        />
      </g>
      <path
        d={`M${o0 - 30} -12 Q${(o0 + o1) / 2} -44 ${o1 + 80} -12 Z`}
        fill="#8a9cd0"
        opacity={0.8}
      />
      <ellipse cx={(o0 + o1) / 2 + 20} cy={2} rx={250} ry={12} fill="#1e2a5c" opacity={0.25} />
      <Icicles x0={o0 + 30} x1={o0 + 90} y={under + 2} len={34} seed={3} />
      <Icicles x0={o0 + 190} x1={o0 + 230} y={under + 4} len={18} seed={7} />
      <Icicles x0={o1 - 80} x1={o1 - 30} y={under + 3} len={26} seed={11} />
      {/* Ledges on the face, with snow, icicles and little pines. */}
      <SnowLedge x0={890} x1={1030} y={-290} depth={12} />
      <Icicles x0={900} x1={1020} y={-280} len={18} seed={5} />
      <SnowLedge x0={1160} x1={1320} y={-470} depth={12} />
      <SnowPine x={950} y={-292} h={70} />
      <SnowPine x={1240} y={-472} h={56} flip />
      <path d="M380 -12 Q900 -30 1450 -12 L1450 -4 L380 -4 Z" fill={P.snowMid} />
      {/* Snow lying along the cliff's top and the shelf's lip. */}
      <path
        d={`M410 -296 ${sky}`}
        stroke={P.snowShade}
        strokeWidth={22}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d={`M412 -300 ${SLOPE.map(([x, y]) => `L${x} ${y - 4}`).join(' ')}`}
        stroke={P.snowTop}
        strokeWidth={14}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d={`M414 -306 ${SLOPE.map(([x, y]) => `L${x} ${y - 9}`).join(' ')}`}
        stroke="#ffffff"
        strokeWidth={3}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </g>
  );
});

export function RockSlideBack(p: ObstacleProps) {
  const rumble = since(p, 'rumble');
  const slide = since(p, 'slide');
  return (
    <g>
      <Cliff />
      {/* Pebbles trickle down the slope in the rumble. */}
      {rumble >= 0 &&
        (slide < 0 || slide < 600) &&
        [0, 1, 2, 3].map((i) => {
          const dt = (rumble + i * 260) % 1000;
          const s = onSlope((dt / 1000) * LENGTH * 0.9 + LENGTH * 0.1);
          return (
            <Rock
              key={i}
              x={s.x + s.nx * 14}
              y={s.y + s.ny * 14 - 14 * Math.abs(Math.sin(dt / 90))}
              r={7}
              spin={-dt}
              snow={false}
            />
          );
        })}
      <SnowBurst x={1000} y={-670} dt={rumble} size={0.7} ms={900} />
      {slide >= 0 &&
        ROCKS.map((r, i) => {
          const dt = slide - r.delay;
          if (dt < 0) return null;
          const at = rockAt(r, dt);
          if (at.x < -700) return null;
          return (
            <g key={i}>
              <SnowBurst x={at.x} y={0} dt={at.land} size={0.5} ms={700} />
              <SnowBurst x={at.x} y={0} dt={at.land2} size={0.3} ms={500} />
              <Rock
                x={at.x}
                y={at.y}
                r={r.r}
                spin={(-at.dist / r.r) * (180 / Math.PI)}
                snow={r.snow}
              />
            </g>
          );
        })}
      <SnowBurst x={LIP[0] + 200} y={-4} dt={since(p, 'clear') - 100} size={0.6} ms={900} />
    </g>
  );
}
