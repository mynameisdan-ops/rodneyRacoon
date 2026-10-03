import { memo, useId } from 'react';
import { Glow, SpeedLines } from '../../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, tint } from '../../style';
import { Saguaro } from '../../worlds/canyon';
import { circles, clamp01, lerp, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { P, RED, SAND, SAND_SHADE, WOOD } from './kit';
import { DUNE } from './layout';
import { SandBurst, SandStreaks } from './parts';

// ---------- Level 35: dune surf ----------
// storm (a sandstorm towers up behind him) → board (he jumps on at the crest) → land (over the
// bump at the bottom; the storm blows over) → off.

/** Ground height along the dune's profile at local x. */
function groundAt(x: number) {
  const pts = DUNE.profile;
  if (x <= pts[0]![0]) return 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, l0] = pts[i - 1]!;
    const [x1, l1] = pts[i]!;
    if (x <= x1) return lerp(l0, l1, (x - x0) / (x1 - x0));
  }
  return 0;
}

/** The slope's angle where he rides down it, degrees. */
const SLOPE =
  (Math.atan2(DUNE.profile[2][1], DUNE.profile[3][0] - DUNE.profile[2][0]) * 180) / Math.PI;

function boardPose(p: ObstacleProps) {
  const boardAt = eventTime(p.events, 'board');
  const offAt = eventTime(p.events, 'off');
  const riding = p.t >= boardAt && p.t < offAt && p.heroX >= DUNE.board - 2;
  let x = DUNE.board;
  let lift = groundAt(x);
  if (riding) {
    x = p.heroX;
    lift = p.heroLift - DUNE.seat;
  } else if (p.t >= offAt) {
    x = Math.min(p.heroAt(offAt).x, DUNE.stop);
    lift = groundAt(x);
  }
  const ground = groundAt(x);
  const onSlope = x > DUNE.profile[2][0] && x < DUNE.profile[3][0] && lift - ground < 4;
  const waiting = p.t < boardAt || (!riding && p.t < offAt);
  return { x, lift, tilt: onSlope ? SLOPE : 0, riding, waiting };
}

/** The dune (painted): its sunlit face, the shadowed lee beyond the crest, wind ripples. */
const Dune = memo(function Dune() {
  const id = useId();
  const pts = DUNE.profile;
  // A soft curve through the profile's corners.
  const crest = `M-700 0 L${pts[0][0]} 0 Q${pts[1][0] * 0.55} ${-pts[1][1] * 0.2} ${pts[1][0]} ${-pts[1][1]} Q${(pts[1][0] + pts[2][0]) / 2} ${-pts[1][1] - 10} ${pts[2][0]} ${-pts[2][1]} L${pts[3][0]} 0 L${pts[4][0]} 0 Q${pts[5][0]} ${-pts[5][1] * 2} ${pts[6][0]} 0 L2700 0`;
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}face`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-210}
          x2="0"
          y2={40}
        >
          <stop offset="0" stopColor={P.sandTop} />
          <stop offset="1" stopColor={P.sand} />
        </linearGradient>
      </defs>
      <path d={`${crest} V240 H-700 Z`} fill={`url(#${id}face)`} />
      {/* The lee side beyond the crest falls into shadow. */}
      <path
        d={`M${pts[2][0]} ${-pts[2][1]} L${pts[3][0]} 0 L${pts[3][0] - 200} 0 Q${pts[2][0] + 200} ${-pts[2][1] * 0.6} ${pts[2][0]} ${-pts[2][1]} Z`}
        fill={P.sandShade}
        opacity={0.55}
      />
      <path d={crest} stroke={tint(P.sandTop, 0.5)} strokeWidth={4} fill="none" />
      <g
        stroke={tint(P.sand, 0.35)}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      >
        {Array.from({ length: 14 }, (_, i) => {
          const x = -500 + i * 200 + 60 * noise(i, 3);
          const y = -groundAt(x) + 30 + 50 * noise(i, 5);
          return <path key={i} d={`M${x} ${y} q30 -6 60 0 t60 0`} />;
        })}
      </g>
      <Saguaro x={-300} y={-2} h={90} />
      <Saguaro x={DUNE.stop + 260} y={-2} h={110} flip />
    </g>
  );
});

/** The sandboard (lined): a wooden board with a red stripe and a foot strap. */
const Board = memo(function Board() {
  return (
    <g>
      <path d="M-70 -4 Q-82 -10 -74 -18 L60 -18 Q82 -16 74 -4 Z" fill={WOOD} {...ink(OUT)} />
      <path d="M-62 -12 H62" stroke={RED} strokeWidth={5} strokeLinecap="round" />
      <path d="M-66 -16 H56" stroke={tint(WOOD, 0.5)} strokeWidth={2} strokeLinecap="round" />
      <path
        d="M-30 -18 Q-24 -28 -14 -18 M14 -18 Q20 -28 30 -18"
        stroke={INK}
        strokeWidth={4}
        fill="none"
      />
      <path
        d="M-30 -18 Q-24 -28 -14 -18 M14 -18 Q20 -28 30 -18"
        stroke="#3a3048"
        strokeWidth={2}
        fill="none"
      />
    </g>
  );
});

/** The storm's strength 0..1: it gathers at 'storm' and blows over after 'land'. */
const stormOf = (p: ObstacleProps) =>
  clamp01(since(p, 'storm') / 900) - clamp01((since(p, 'land') - 100) / 1100);

export function DuneBack(p: ObstacleProps) {
  const storm = stormOf(p);
  const t = p.t;
  const sun = clamp01((since(p, 'land') - 200) / 1000);
  // The storm wall rolls in from the left and towers up behind him, creeping after him.
  const front = -100 + Math.min(420, Math.max(0, since(p, 'storm')) * 0.12);
  const edge = Array.from({ length: 8 }, (_, i) => ({
    x: front - 40 - 30 * noise(i, 3) + 14 * Math.sin(t / 300 + i),
    y: 20 - i * 90 - 20 * Math.sin(t / 420 + i * 2),
    r: 70 + 40 * noise(i, 6),
  }));
  const top = Array.from({ length: 7 }, (_, i) => ({
    x: front - 160 - i * 170 + 20 * Math.sin(t / 380 + i),
    y: -640 - 60 * noise(i, 4) - 20 * Math.sin(t / 500 + i),
    r: 110 + 40 * noise(i, 8),
  }));
  const billows = [...edge, ...top];
  return (
    <g>
      {sun > 0 && (
        <g opacity={sun}>
          <Glow x={1600} y={-520} r={260} color="#fff1c4" />
        </g>
      )}
      {storm > 0 && (
        <g opacity={storm}>
          <rect x={-700} y={-900} width={3600} height={1200} fill="#a8683a" opacity={0.28} />
          <path d={`M${front - 2400} 40 V-900 H${front - 60} V40 Z`} fill="#9a6444" />
          <path d={circles(billows)} fill="#a8704a" />
          <path
            d={circles(
              billows.map((c) => ({ x: c.x + c.r * 0.22, y: c.y - c.r * 0.22, r: c.r * 0.72 })),
            )}
            fill="#c88a58"
          />
          <path
            d={circles(
              billows.map((c) => ({ x: c.x + c.r * 0.38, y: c.y - c.r * 0.4, r: c.r * 0.32 })),
            )}
            fill="#e8b47c"
            opacity={0.85}
          />
        </g>
      )}
      <Dune />
      <SandStreaks t={t} strength={storm} />
    </g>
  );
}

export function DuneFront(p: ObstacleProps) {
  const b = boardPose(p);
  const landAt = eventTime(p.events, 'land');
  const storm = stormOf(p);
  return (
    <g>
      {b.riding && <SpeedLines x={b.x - 120} t={p.t} ys={[-30, -60, -90]} />}
      <g
        transform={`translate(${b.x.toFixed(1)} ${(-b.lift).toFixed(1)}) rotate(${b.waiting ? -70 : b.tilt.toFixed(1)}${b.waiting ? ' 0 -10' : ''})`}
      >
        <Board />
      </g>
      {/* Sand sprayed up behind the board. */}
      {b.riding && (
        <path
          d={circles(
            [0, 1, 2, 3].map((i) => {
              const ph = ((p.t + i * 80) % 320) / 320;
              return {
                x: b.x - 80 - ph * 70,
                y: -b.lift - 8 - ph * 40 + ph * ph * 30,
                r: 7 + 5 * ph,
              };
            }),
          )}
          fill={SAND}
          {...ink(IN)}
        />
      )}
      <SandBurst x={b.x} y={-b.lift} dt={p.t - landAt} size={1.1} ms={900} />
      {/* Gusts of the storm blowing past in front, cel-drawn. */}
      {storm > 0.2 && (
        <path
          d={circles(
            Array.from({ length: 6 }, (_, i) => {
              const ph = ((p.t * 0.9 + i * 400) % 2400) / 2400;
              return {
                x: -600 + ph * 2800,
                y: -60 - 60 * noise(i, 3) - 20 * Math.sin(p.t / 150 + i),
                r: 10 + 6 * noise(i, 5),
              };
            }),
          )}
          fill={SAND_SHADE}
          opacity={storm}
          {...ink(IN)}
        />
      )}
    </g>
  );
}
