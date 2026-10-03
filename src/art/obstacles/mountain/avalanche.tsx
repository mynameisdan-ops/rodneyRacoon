import { memo, useId } from 'react';
import { SpeedLines } from '../../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { SnowPine } from '../../worlds/mountain';
import { bump, circles, clamp01, fallen, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { BARK, NS, P, PINE, SNOW, SNOW_SHADE } from './kit';
import { AVALANCHE } from './layout';
import { SnowBurst } from './parts';

// ---------- Level 27: avalanche ----------
// crack (the snowfield up the slope breaks away) → grab (he hangs from a pine branch as the
// avalanche roars under him) → settle (it has passed, leaving new snow; he drops onto it).

/** The slope behind the path, rising to the upper left, where the avalanche comes from. */
const SLOPE: readonly (readonly [number, number])[] = [
  [-700, -660],
  [-420, -470],
  [-160, -300],
  [120, -120],
  [330, -12],
];

/** The snowy mountainside (painted). */
const Slope = memo(function Slope() {
  const id = useId();
  const line = SLOPE.map(([x, y]) => `L${x} ${y}`).join(' ');
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-660} x2="0" y2={0}>
          <stop offset="0" stopColor={P.snowTop} />
          <stop offset="1" stopColor={P.snowLow} />
        </linearGradient>
      </defs>
      <path d={`M-800 -12 L-800 -700 ${line} Z`} fill={`url(#${id})`} />
      <path d={`M-800 -700 ${line}`} stroke="#ffffff" strokeWidth={5} fill="none" />
      <path
        d={`M-700 -560 Q-400 -360 -60 -170 Q100 -80 240 -30`}
        stroke={P.snowBlue}
        strokeWidth={26}
        fill="none"
        opacity={0.5}
        strokeLinecap="round"
      />
      {[
        [-520, -440, 0.8],
        [-260, -260, 0.6],
        [40, -90, 0.7],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M-40 0 Q-36 -30 -6 -40 Q30 -44 40 -10 L40 0 Z" fill={P.stone} />
          <path d="M8 -42 Q30 -40 40 -10 L40 0 L14 0 Q20 -24 8 -42 Z" fill={P.stoneDark} />
          <path
            d="M-34 -18 Q-26 -40 6 -42 Q24 -40 30 -30 Q10 -34 -6 -28 Q-20 -24 -34 -18 Z"
            fill={P.snowTop}
          />
        </g>
      ))}
      <SnowPine x={-600} y={-520} h={70} />
      <SnowPine x={-340} y={-330} h={86} flip />
      <SnowPine x={-90} y={-180} h={64} />
    </g>
  );
});

/** A tier's lower edge: a fringe of needle tips from its left tip to its right one. */
function fringe(tx: number, tw: number, by: number) {
  const n = 10;
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = tx - tw + (2 * tw * i) / n;
    const y = by + 14 * Math.sin((Math.PI * i) / n) + (i % 2 ? 12 : 0);
    return `L${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

/** The big pine (lined: he hangs from its branch), with snow on every tier. */
const Pine = memo(function Pine() {
  const { tree } = AVALANCHE;
  const tx = tree + 90;
  return (
    <g>
      <path
        d={`M${tx - 26} 4 L${tx - 14} -700 L${tx + 14} -700 L${tx + 26} 4 Z`}
        fill={BARK}
        {...ink(OUT)}
      />
      <path
        d={`M${tx + 6} 4 L${tx + 6} -700 L${tx + 14} -700 L${tx + 26} 4 Z`}
        fill={shade(BARK, 0.3)}
      />
      <path
        d={`M${tx - 16} -40 q4 -60 -2 -120 M${tx - 4} -200 q4 -60 -2 -100`}
        stroke={shade(BARK, 0.45)}
        strokeWidth={IN}
        fill="none"
      />
      {[0, 1, 2, 3].map((i) => {
        const by = -390 - i * 92;
        const ay = by - 150 + i * 12;
        const tw = 180 - i * 34;
        return (
          <g key={i}>
            <path
              d={`M${tx} ${ay} Q${tx - tw * 0.4} ${by - 60} ${tx - tw} ${by} ${fringe(tx, tw, by)} Q${tx + tw * 0.4} ${by - 60} ${tx} ${ay} Z`}
              fill={PINE}
              {...ink(OUT)}
            />
            <path
              d={`M${tx} ${ay} Q${tx + tw * 0.4} ${by - 60} ${tx + tw} ${by} Q${tx + tw * 0.5} ${by + 18} ${tx} ${by + 6} Q${tx + tw * 0.2} ${by - 60} ${tx} ${ay} Z`}
              fill={tint(PINE, 0.25)}
            />
            <path
              d={`M${tx} ${ay - 2} Q${tx - tw * 0.36} ${by - 66} ${tx - tw * 0.86} ${by - 10} Q${tx - tw * 0.5} ${by - 30} ${tx - tw * 0.1} ${by - 22} Q${tx + tw * 0.4} ${by - 34} ${tx + tw * 0.88} ${by - 8} Q${tx + tw * 0.36} ${by - 66} ${tx} ${ay - 2} Z`}
              fill={SNOW}
              {...ink(IN)}
            />
            <path
              d={`M${tx + 8} ${ay + 10} Q${tx + tw * 0.4} ${by - 56} ${tx + tw * 0.8} ${by - 14}`}
              stroke="#ffffff"
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
});

/** The branch he grabs, dipping as he lands on it, with its snow shaken off. */
function Branch({ dip, snow }: { dip: number; snow: boolean }) {
  const { tree, branch } = AVALANCHE;
  const tx = tree + 90;
  const d = `M${tx - 10} ${-branch - 14} Q${tree - 20} ${-branch + 2 + dip * 0.5} ${tree - 120} ${-branch - 8 + dip}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={24} strokeLinecap="round" fill="none" />
      <path d={d} stroke={BARK} strokeWidth={24 - 2 * OUT} strokeLinecap="round" fill="none" />
      <path
        d={d}
        stroke={tint(BARK, 0.3)}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
        transform="translate(0 -5)"
      />
      <path
        d={`M${tree - 70} ${-branch - 4 + dip * 0.8} l-20 -26 M${tree + 10} ${-branch - 6 + dip * 0.3} l10 -24`}
        stroke={INK}
        strokeWidth={9}
        strokeLinecap="round"
      />
      <path
        d={`M${tree - 70} ${-branch - 4 + dip * 0.8} l-20 -26 M${tree + 10} ${-branch - 6 + dip * 0.3} l10 -24`}
        stroke={BARK}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {snow && (
        <path
          d={`M${tx - 20} ${-branch - 22} Q${tree - 20} ${-branch - 14 + dip * 0.5} ${tree - 112} ${-branch - 20 + dip} Q${tree - 120} ${-branch - 32 + dip} ${tree - 90} ${-branch - 30 + dip} Q${tree - 20} ${-branch - 28} ${tx - 20} ${-branch - 34} Z`}
          fill={SNOW}
          {...ink(IN)}
        />
      )}
    </g>
  );
}

export function AvalancheBack(p: ObstacleProps) {
  const crack = since(p, 'crack');
  const grab = since(p, 'grab');
  const { tree, branch } = AVALANCHE;
  return (
    <g>
      <Slope />
      {/* The crack across the snowfield up the slope, and the slab breaking away. */}
      {crack >= 0 && (
        <g>
          <path
            d="M-230 -300 l50 30 l36 -12 l60 36 l44 -8 l50 30"
            stroke={INK}
            strokeWidth={5}
            fill="none"
            strokeLinejoin="round"
            strokeDasharray={`${Math.min(320, crack * 0.8)} 400`}
          />
          <SnowBurst x={-120} y={-270} dt={crack} size={1.1} ms={900} />
        </g>
      )}
      <Pine />
      <Branch
        dip={grab >= 0 ? 14 * bump(grab, 360) + 6 * clamp01(grab / 200) : 0}
        snow={grab < 0}
      />
      {/* The branch's snow shaken off as he grabs it. */}
      {grab >= 0 && grab < 900 && (
        <path
          d={circles(
            [0, 1, 2, 3, 4].map((i) => ({
              x: tree - 100 + i * 34 + 10 * noise(i, 3),
              y: -branch - 20 + fallen(grab - i * 30, 0.0024),
              r: 9 - i,
            })),
          )}
          fill={SNOW}
          {...ink(IN)}
        />
      )}
    </g>
  );
}

/** Where the avalanche's front is: it reaches the tree just after he grabs the branch. */
function frontAt(p: ObstacleProps) {
  const crackAt = eventTime(p.events, 'crack');
  const grabAt = eventTime(p.events, 'grab');
  const hit = grabAt + 300;
  const v = (AVALANCHE.tree - 40 - AVALANCHE.snowStart) / (hit - crackAt);
  return AVALANCHE.snowStart + (p.t - crackAt) * v;
}

/** The cel shadow on the avalanche's snow. */
const PUFF_SHADE = '#a9c0ea';

/** The avalanche's body (cel-drawn), its front at x = 0: a rolling wall of snow over new snow. */
const WaveBody = memo(function WaveBody() {
  const h = AVALANCHE.wave;
  const s = AVALANCHE.settled;
  const edge = `M-2400 ${-s} L-560 ${-s} Q-420 ${-s - 30} -300 ${-h * 0.6} Q-180 ${-h - 10} -60 ${-h - 4} Q20 ${-h + 6} 40 ${-h * 0.55} Q60 ${-h * 0.2} 44 40`;
  return (
    <g>
      <path d={`${edge} L-2400 40 Z`} fill={SNOW} />
      {/* The front face in shadow under its curling top, the churned snow behind it. */}
      <path
        d={`M-40 ${-h * 0.62} Q10 ${-h * 0.7} 32 ${-h * 0.5} Q50 ${-h * 0.2} 44 40 L-60 40 Q-70 ${-h * 0.3} -40 ${-h * 0.62} Z`}
        fill={SNOW_SHADE}
      />
      <path
        d={`M-560 ${-s + 10} Q-300 ${-h * 0.35} -100 ${-h * 0.4} Q-70 ${-h * 0.1} -60 40 L-2400 40 L-2400 ${-s + 10} Z`}
        fill={shade(SNOW, 0.08)}
      />
      <path d={`M-2400 ${-s + 20} H-200 Q-80 0 -60 40 H-2400 Z`} fill={SNOW_SHADE} opacity={0.8} />
      <path d={edge} fill="none" {...ink(OUT)} {...NS} />
      <path
        d={`M-2400 ${-s - 4} H-580 M-260 ${-h * 0.72} Q-160 ${-h - 2} -70 ${-h + 4}`}
        stroke="#ffffff"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

export function AvalancheFront(p: ObstacleProps) {
  const crackAt = eventTime(p.events, 'crack');
  if (p.t < crackAt) return null;
  const front = frontAt(p);
  const h = AVALANCHE.wave;
  // It grows as it gathers snow coming down off the slope.
  const grow = 0.45 + 0.55 * clamp01((front - AVALANCHE.snowStart) / 500);
  const t = p.t;
  // Big puffs churning along its crest and down its face, a second row behind them.
  const puffs = [
    ...Array.from({ length: 8 }, (_, i) => ({
      x: front + 20 - i * 38 + 8 * Math.sin(t / 60 + i * 1.3),
      y: (-h - 6 + i * 6 - 16 * Math.abs(Math.sin(t / 110 + i))) * grow,
      r: (34 - i * 2 + 6 * noise(i)) * grow,
    })),
    ...[
      [44, -0.62, 30],
      [52, -0.3, 26],
      [36, -0.02, 24],
    ].map(([dx, fy, r], i) => ({
      x: front + dx! + 6 * Math.sin(t / 70 + i),
      y: h * fy! * grow,
      r: r! * grow,
    })),
    ...Array.from({ length: 6 }, (_, i) => ({
      x: front - 60 - i * 52 + 10 * Math.sin(t / 80 + i * 2),
      y: (-h - 40 + i * 12 - 14 * Math.abs(Math.sin(t / 130 + i))) * grow,
      r: (30 - i * 3) * grow,
    })),
  ];
  const spray = Array.from({ length: 9 }, (_, i) => {
    const ph = ((t + i * 70) % 560) / 560;
    return {
      x: front + 30 + ph * (90 + i * 18),
      y: (-h * 0.9 - ph * 90 + ph * ph * 260) * grow,
      r: 8 - (i % 3) * 2,
    };
  });
  return (
    <g>
      {/* A cloud of powder billowing up behind its crest (painted, soft). */}
      <path
        d={circles(
          [0, 1, 2, 3, 4, 5].map((i) => ({
            x: front - 140 - i * 80,
            y: (-h - 50 - 40 * noise(i, 5) - 10 * Math.sin(t / 200 + i)) * grow,
            r: (54 + 10 * i) * grow,
          })),
        )}
        fill="#f2f7ff"
        opacity={0.8}
      />
      <g transform={`translate(${front.toFixed(1)} 0) scale(1 ${grow.toFixed(3)})`}>
        <WaveBody />
      </g>
      <path d={circles(puffs)} fill={PUFF_SHADE} {...ink(OUT)} />
      <path
        d={circles(puffs.map((c) => ({ x: c.x + c.r * 0.14, y: c.y - c.r * 0.2, r: c.r * 0.8 })))}
        fill={SNOW}
      />
      <path
        d={circles(puffs.map((c) => ({ x: c.x + c.r * 0.32, y: c.y - c.r * 0.42, r: c.r * 0.32 })))}
        fill="#ffffff"
      />
      <path d={circles(spray)} fill={SNOW} {...ink(IN)} />
      {front > -200 && <SpeedLines x={front - 300} t={t} ys={[-50, -100, -150]} />}
    </g>
  );
}
