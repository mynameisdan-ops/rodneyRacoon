import { memo, useId } from 'react';
import { Dust, SpeedLines } from '../fx';
import { INK, ink, mix, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../style';
import { PAINTED_RIVER } from '../worlds/riverPalette';
import { DAM, FALLS, GEYSER, RAFT, RAPIDS, RISING, ROPE_BRIDGE, STONES } from './riverLayout';
import {
  bump,
  circles,
  clamp01,
  easeOut,
  ellipses,
  fallen,
  heroPasses,
  lerp,
  noise,
  roundPath,
  since,
} from './sceneKit';
import { eventTime, type ObstacleProps } from './types';

/*
 * World 3 (Rushing River) scenes, levels 17–24, in the cartoon look (M7b). What he touches, and
 * the animals, are lined like him: a bold line around the silhouette, thin lines inside, one crisp
 * shadow shape and a rim light, lit from the upper right. So is moving water that acts (waves,
 * splashes, jets): it's cel-drawn, like a cartoon's effects. The river itself and the ground
 * around his props (banks, the gorge, the cliffs, the hot spring) are painted like the backdrop.
 * Every motion is computed from `t` and the prop schedule, so any frame can be drawn exactly;
 * parts that never change are memoized, since obstacles redraw every frame.
 */

const P = PAINTED_RIVER;
const WATER = P.water;
const LIGHT = P.waterLight;
const DEEP = P.waterDeep;
const FOAM = P.foam;
const SPRAY = '#effbff';
const SPRAY_SHADE = '#a4dbf2';
const ROCK = '#a3abbd';
const MOSS = '#76ba4e';
const BARK = '#7c5434';
const HEART = '#ebc184';
const WOOD = '#c48c52';
const ROPE = '#dcbc7c';
const LEAF = '#4fa64a';
const SPEED_YS = [-50, -80, -110, -30];
/** An almond-shaped leaf pointing right from (0, 0), about 12 long. */
const LEAF_PATH = 'M0 0 Q5 -5 12 0 Q5 5 0 0 Z';
/** Keeps a stroke's width in screen px inside a scaled group (so scaled art can be memoized). */
const NS = { vectorEffect: 'non-scaling-stroke' } as const;

/** A rope: a bold line with twists along it. */
function Rope({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth={8.4} />
      <path d={d} stroke={ROPE} strokeWidth={5} />
      <path d={d} stroke={shade(ROPE, 0.35)} strokeWidth={5} strokeDasharray="2 6" />
    </g>
  );
}

/** The far side of a river channel (painted): wet sand dipping down to the water at both ends. */
const FarShore = memo(function FarShore({ a, b, level }: { a: number; b: number; level: number }) {
  const id = useId();
  const ramp = Math.min(60, (b - a) / 4);
  const n = Math.max(2, Math.round((b - a) / 70));
  return (
    <g>
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-16}
          x2="0"
          y2={level + 6}
        >
          <stop offset="0" stopColor={P.sandLight} />
          <stop offset="0.4" stopColor={P.sand} />
          <stop offset="1" stopColor={mix(P.earth, DEEP, 0.3)} />
        </linearGradient>
      </defs>
      <path
        d={`M${a} ${level + 8} V-2 Q${a + ramp * 0.4} -16 ${a + ramp} -16 H${b - ramp} Q${b - ramp * 0.4} -16 ${b} -2 V${level + 8} Z`}
        fill={`url(#${id})`}
      />
      <g fill={P.sandDark} opacity={0.55}>
        {Array.from({ length: n }, (_, i) => (
          <ellipse
            key={i}
            cx={a + ramp + ((b - a - 2 * ramp) * (i + 0.5)) / n}
            cy={-9 + 5 * noise(i, 3)}
            rx={2.5 + 2.5 * noise(i, 5)}
            ry={1.5}
          />
        ))}
      </g>
      <g fill={P.grass}>
        {Array.from({ length: n }, (_, i) => {
          const x = a + ramp + ((b - a - 2 * ramp) * (i + 0.2)) / n;
          return (
            <path
              key={i}
              d={`M${x - 6} -14 Q${x - 4} -24 ${x - 8} -30 Q${x} -22 ${x + 1} -14 Q${x + 3} -26 ${x + 8} -28 Q${x + 5} -20 ${x + 6} -14 Z`}
            />
          );
        })}
      </g>
    </g>
  );
});

/** The river's gradient from its surface at `level` down: light, then turquoise, then deep. */
const WaterGradient = memo(function WaterGradient({ id, level }: { id: string; level: number }) {
  return (
    <defs>
      <linearGradient
        id={id}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1={level - 6}
        x2="0"
        y2={level + 160}
      >
        <stop offset="0" stopColor={LIGHT} />
        <stop offset="0.25" stopColor={WATER} />
        <stop offset="1" stopColor={DEEP} />
      </linearGradient>
    </defs>
  );
});

/**
 * A stretch of painted river from a to b with its surface at `level` (y): lighter near the top and
 * deeper below, a bright line along the moving surface, ripples drifting downstream (right) and
 * foam when `white` > 0. Behind it, the channel's far shore (`shore`), so the path doesn't seem
 * to run on over the water.
 */
function River({
  a,
  b,
  level,
  t,
  flow = 0.35,
  white = 0,
  shore = true,
}: {
  a: number;
  b: number;
  level: number;
  t: number;
  flow?: number;
  /** 0..1: how much whitewater. */
  white?: number;
  shore?: boolean;
}) {
  const id = useId();
  const n = Math.max(4, Math.round((b - a) / 90));
  const seg = (b - a) / n;
  const amp = 4 + 7 * white;
  let top = `M${a} ${level}`;
  for (let i = 1; i <= n; i++) {
    const x = a + seg * i;
    top += ` Q${(x - seg / 2).toFixed(1)} ${(level + amp * Math.sin(t / 160 + i * 1.7)).toFixed(1)} ${x.toFixed(1)} ${level}`;
  }
  const rows = Math.max(3, Math.min(8, Math.round((240 - level) / 45)));
  const ripples = Math.max(1, Math.round(((b - a) / 110) * (rows / 3)));
  const span = Math.max(1, b - a - 60);
  const foam =
    white > 0
      ? Array.from({ length: n * 2 }, (_, i) => ({
          x: a + ((i * 57 + t * flow * 1.3) % (b - a)),
          y: level - 1 + 5 * Math.sin(t / 90 + i),
          r: 6 + (i % 3) * 3,
        }))
      : [];
  return (
    <g>
      <WaterGradient id={id} level={level} />
      {shore && <FarShore a={a} b={b} level={level} />}
      <path d={`${top} L${b} 240 L${a} 240 Z`} fill={`url(#${id})`} />
      <path d={top} stroke={FOAM} strokeWidth={3} fill="none" opacity={0.9} />
      <path
        d={Array.from({ length: ripples }, (_, i) => {
          const x = a + 20 + ((t * flow + i * 110 * 1.37) % span);
          return `M${x.toFixed(1)} ${level + 16 + (i % rows) * 26}h${24 + (i % 2) * 18}`;
        }).join('')}
        stroke={FOAM}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.55}
      />
      {white > 0 && (
        <g opacity={Math.min(1, white * 1.3)}>
          <path
            d={circles(foam.map((f) => ({ x: f.x - 1.5, y: f.y + 2.5, r: f.r })))}
            fill={SPRAY_SHADE}
          />
          <path d={circles(foam.map((f) => ({ ...f, r: f.r * 0.88 })))} fill={FOAM} />
        </g>
      )}
    </g>
  );
}

/**
 * The edge of a river channel (painted), on its left (dir 1) or right (-1): a muddy strip
 * running down past the grass, foam where the water laps at it.
 */
const Bank = memo(function Bank({
  x,
  dir,
  level = 10,
}: {
  x: number;
  dir: 1 | -1;
  level?: number;
}) {
  const id = useId();
  const d = (v: number) => x + dir * v;
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-4} x2="0" y2={170}>
          <stop offset="0" stopColor={P.sand} />
          <stop offset="0.12" stopColor={P.earth} />
          <stop offset="1" stopColor={P.earthDark} />
        </linearGradient>
      </defs>
      <path
        d={`M${d(-12)} -3 L${d(5)} -3 Q${d(18)} 60 ${d(18)} 240 L${d(-18)} 240 Q${d(-12)} 60 ${d(-12)} -3 Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M${d(2)} 2 Q${d(10)} 60 ${d(8)} 240`}
        stroke={shade(P.earth, 0.45)}
        strokeWidth={2}
        fill="none"
        opacity={0.45}
      />
      <path
        d={`M${d(10)} ${level} Q${d(19)} 70 ${d(19)} 240`}
        stroke={FOAM}
        strokeWidth={3}
        fill="none"
        opacity={0.85}
      />
      <g fill={P.grass}>
        {[-6, 40, 96, 150].map((y, i) => (
          <path
            key={i}
            d={`M${d(-20)} ${y + 8} Q${d(-6)} ${y - 6} ${d(6 + i * 2)} ${y - 4} Q${d(-6)} ${y + 2} ${d(-16)} ${y + 12} Z`}
          />
        ))}
      </g>
    </g>
  );
});

const CROWN =
  'M-46 6 Q-44 -10 -38 -30 Q-35 -39 -31 -31 Q-27 -18 -20 -16 Q-17 -40 -9 -54 Q-4 -61 -1 -53 Q2 -36 4 -22 Q10 -44 18 -52 Q23 -57 25 -49 Q24 -30 27 -18 Q32 -26 38 -36 Q42 -41 44 -33 Q45 -14 46 6';

/** A crown of water 92 wide, rising from (0, 6): rounded prongs with drops thrown off them. */
const CrownArt = memo(function CrownArt() {
  const id = useId();
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor={SPRAY} />
          <stop offset="1" stopColor={SPRAY_SHADE} stopOpacity={0.4} />
        </linearGradient>
      </defs>
      <path d={`${CROWN} Z`} fill={`url(#${id})`} />
      <path
        d="M-40 6 Q-38 -8 -34 -22 Q-26 -6 -12 -4 Q6 0 22 -6 Q34 -10 40 6 Z"
        fill={SPRAY_SHADE}
        opacity={0.5}
      />
      <path d={CROWN} fill="none" {...ink(IN + 0.4)} {...NS} />
      <path
        d="M-36 -18 Q-35 -26 -33 -27 M-6 -30 Q-4 -44 -2 -48 M18 -30 Q20 -40 22 -44"
        stroke="#ffffff"
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
        {...NS}
      />
      <g fill={SPRAY} {...ink(IN)}>
        <circle cx={-34} cy={-46} r={4} {...NS} />
        <circle cx={-4} cy={-72} r={5} {...NS} />
        <circle cx={22} cy={-66} r={4.4} {...NS} />
        <circle cx={41} cy={-48} r={3.6} {...NS} />
      </g>
    </g>
  );
});

/** Spray bursting up from (x, y): a crown of water and drops flung out and falling back (cel). */
function Splash({ x, y, dt, size = 1 }: { x: number; y: number; dt: number; size?: number }) {
  if (!(dt >= 0 && dt < 900)) return null;
  const fade = 1 - clamp01((dt - 550) / 350);
  const crown = bump(dt, 560);
  // Drops flung out in an upward fan, falling back; each stretched along the way it flies.
  const drops = Array.from({ length: 9 }, (_, i) => {
    const a = -Math.PI * (0.15 + (0.7 * i) / 8);
    const v = (0.45 + 0.3 * noise(i, 2)) * size;
    const vx = Math.cos(a) * v;
    const vy = Math.sin(a) * v + 0.0024 * dt;
    const r = (5 + 4 * noise(i, 4)) * size;
    return {
      x: x + vx * dt,
      y: y + Math.sin(a) * v * dt + 0.0012 * dt * dt,
      rx: r * 1.5,
      ry: r,
      rot: (Math.atan2(vy, vx) * 180) / Math.PI,
    };
  });
  return (
    <g opacity={fade}>
      {crown > 0.02 && (
        <g
          transform={`translate(${x} ${y}) scale(${(size * (0.7 + 0.3 * crown)).toFixed(3)} ${(size * crown).toFixed(3)})`}
        >
          <CrownArt />
        </g>
      )}
      <path d={ellipses(drops)} fill={SPRAY} {...ink(IN)} />
      <path
        d={ellipses(
          drops.map((p) => {
            const a = (p.rot * Math.PI) / 180;
            const ox = p.ry * 0.3;
            const oy = -p.ry * 0.35;
            return {
              x: p.x + ox * Math.cos(a) - oy * Math.sin(a),
              y: p.y + ox * Math.sin(a) + oy * Math.cos(a),
              rx: p.ry * 0.55,
              ry: p.ry * 0.25,
              rot: p.rot,
            };
          }),
        )}
        fill="#ffffff"
      />
    </g>
  );
}

/** Bubbles rising where something has gone under at (x, y). */
function Bubbles({ x, y, dt }: { x: number; y: number; dt: number }) {
  if (!(dt >= 0 && dt < 900)) return null;
  return (
    <g fill="none" stroke={FOAM} strokeWidth={2}>
      {[0, 1, 2, 3].map((i) => {
        const ph = ((dt + i * 150) % 600) / 600;
        return (
          <circle
            key={i}
            cx={x + (noise(i, 2) - 0.5) * 34}
            cy={y - ph * 16}
            r={2 + ph * 4}
            opacity={(1 - ph) * (1 - dt / 900)}
          />
        );
      })}
    </g>
  );
}

const WAVE =
  'M-420 30 Q-300 20 -200 -40 Q-110 -150 -10 -210 Q60 -236 90 -180 Q60 -196 40 -170 Q20 -140 50 -120 Q10 -100 -10 -60 Q-20 -10 0 30';

/** The wave's body, 220 tall, drawn once and scaled (its outline stays the same width). */
const WaveBody = memo(function WaveBody() {
  const id = useId();
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-230} x2="0" y2={30}>
          <stop offset="0" stopColor={LIGHT} />
          <stop offset="0.5" stopColor={WATER} />
          <stop offset="0.87" stopColor={mix(WATER, DEEP, 0.3)} />
          <stop offset="1" stopColor={mix(WATER, DEEP, 0.3)} stopOpacity={0.1} />
        </linearGradient>
      </defs>
      <path d={`${WAVE} Z`} fill={`url(#${id})`} />
      {/* The face under the curl is in shadow, and the hollow of the curl is deepest. */}
      <path
        d="M50 -120 Q10 -100 -10 -60 Q-17 -26 -12 4 L-66 4 Q-56 -40 -6 -96 Q24 -116 50 -120 Z"
        fill={DEEP}
        opacity={0.45}
      />
      <path d="M40 -170 Q20 -140 50 -120 Q26 -124 22 -146 Q24 -164 40 -170 Z" fill={P.waterDark} />
      <g stroke="#ffffff" fill="none" strokeLinecap="round">
        <path d="M-180 -60 Q-100 -160 4 -198" strokeWidth={9} opacity={0.5} />
        <path d="M-290 6 Q-230 -26 -176 -84" strokeWidth={4} opacity={0.45} />
      </g>
      <path d={WAVE} fill="none" {...ink(OUT)} {...NS} />
    </g>
  );
});

/** A curling wave `h` tall whose front is at x, on `level`: cel-drawn, with claws of foam. */
function CurlWave({ x, level, h, t }: { x: number; level: number; h: number; t: number }) {
  if (h < 4) return null;
  const k = h / 220;
  return (
    <g transform={`translate(${x} ${level}) scale(${k})`}>
      <WaveBody />
      <path
        d={circles([
          ...[0, 1, 2, 3, 4].map((i) => ({
            x: 74 - i * 22 + 4 * Math.sin(t / 80 + i),
            y: -194 + i * 7,
            r: 16 - i * 2,
          })),
          ...[
            [12, 18, 13],
            [-24, 24, 11],
            [-60, 26, 9],
            [-96, 27, 8],
          ].map(([x, y, r], i) => ({ x: x! + 3 * Math.sin(t / 70 + i), y: y!, r: r! })),
        ])}
        fill={FOAM}
        {...ink(IN)}
        {...NS}
      />
      <path
        d={ellipses(
          [0, 1, 2, 3].map((i) => {
            const ph = ((t + i * 130) % 520) / 520;
            return {
              x: 92 + ph * (40 + i * 14),
              y: -186 - ph * 30 + ph * ph * 140,
              rx: 7 - i,
              ry: 4.5 - i * 0.6,
              rot: 0,
            };
          }),
        )}
        fill={SPRAY}
        opacity={0.85}
        {...ink(IN)}
        {...NS}
      />
    </g>
  );
}

// ---------- Level 17: stepping stones ----------
// surge (a wave rolls in behind him) → s1..s4 (each stone tips and sinks after he leaves it)
// → crash (the wave breaks on the bank behind him).

const STONE_EDGE = roundPath([
  [-44, 34],
  [-43, 12],
  [-30, 2],
  [0, -2],
  [28, 1],
  [42, 10],
  [46, 34],
  [40, 74],
  [-38, 74],
]);

/** A stepping stone with its top at (0, 0): mossy, wet and shiny. */
const Stone = memo(function Stone({ i }: { i: number }) {
  const m = 6 + 10 * noise(i, 3);
  return (
    <g>
      <path d={STONE_EDGE} fill={ROCK} {...ink(OUT)} />
      <path d="M-43 13 Q-47 34 -40 56 L-24 56 Q-32 34 -29 9 Z" fill={shade(ROCK, 0.3)} />
      <path
        d="M-12 22 l7 9 l-3 10"
        stroke={shade(ROCK, 0.45)}
        strokeWidth={IN}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M-34 7 Q-22 -6 ${m} -3 Q${m - 10} 3 -10 6 Q-14 14 -20 9 Q-26 12 -34 7 Z`}
        fill={MOSS}
        {...ink(IN)}
      />
      <path
        d="M-28 3 Q-18 -3 -6 -2"
        stroke={tint(MOSS, 0.45)}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M16 0 Q36 3 43 17"
        stroke={tint(ROCK, 0.6)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={20} cy={9} rx={8} ry={2.6} fill="#ffffff" opacity={0.65} />
    </g>
  );
});

export function SteppingStonesBack(p: ObstacleProps) {
  const clip = useId();
  const [a, b] = STONES.channel;
  const sunk = STONES.stones.map((x, i) => {
    const landAt = eventTime(p.events, `s${i + 1}`);
    const dt = p.t - heroPasses(p, x + 30, landAt) - 120;
    return { land: p.t - landAt, dt, sink: fallen(dt, 0.0006) };
  });
  return (
    <g>
      <River a={a} b={b} level={10} t={p.t} white={clamp01(since(p, 'surge') / 800) * 0.6} />
      <clipPath id={clip}>
        <rect x={a} y={-400} width={b - a} height={416} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        {STONES.stones.map((x, i) => {
          const { land, dt, sink } = sunk[i]!;
          if (sink > 110) return null;
          const tilt = dt > 0 ? Math.min(25, dt * 0.05) * (i % 2 ? 1 : -1) : 0;
          // It bobs on the current, and dips under him as he lands.
          const y = -STONES.top + 1.5 * Math.sin(p.t / 380 + i * 2) + 5 * bump(land, 220) + sink;
          return (
            <g key={x} transform={`translate(${x} ${y.toFixed(1)}) rotate(${tilt.toFixed(1)})`}>
              <Stone i={i} />
            </g>
          );
        })}
      </g>
      {/* Foam rings where the stones meet the water, and bubbles as each one goes under. */}
      {STONES.stones.map((x, i) => {
        const { dt, sink } = sunk[i]!;
        const ring = 1 - clamp01((sink - 20) / 40);
        return (
          <g key={x}>
            {ring > 0 && (
              <ellipse
                cx={x}
                cy={11}
                rx={52 - 12 * (1 - ring)}
                ry={5}
                fill="none"
                stroke={FOAM}
                strokeWidth={4}
                opacity={0.9 * ring}
              />
            )}
            <Bubbles x={x} y={10} dt={dt - 500} />
          </g>
        );
      })}
      <Bank x={a} dir={1} />
      <Bank x={b} dir={-1} />
    </g>
  );
}

export function SteppingStonesFront(p: ObstacleProps) {
  const clip = useId();
  const surgeAt = eventTime(p.events, 'surge');
  const crashAt = eventTime(p.events, 'crash');
  if (p.t < surgeAt) return null;
  const [a, b] = STONES.channel;
  const k = clamp01((p.t - surgeAt) / (crashAt - surgeAt));
  // It rolls along the channel but never catches him (it rears up while he stops).
  const x = Math.min(lerp(STONES.waveStart, b - 60, k), p.heroX - 190);
  const after = p.t - crashAt;
  // It bursts up out of the river at the bank, then follows him.
  const h =
    after < 0 ? 200 * easeOut(clamp01((p.t - surgeAt) / 400)) : 200 * (1 - clamp01(after / 500));
  return (
    <g>
      <Splash x={a + 50} y={4} dt={p.t - surgeAt} size={1.5} />
      <clipPath id={clip}>
        <rect x={a - 4} y={-600} width={b - a + 300} height={900} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <CurlWave x={x} level={16} h={h} t={p.t} />
      </g>
      <Splash x={b - 60} y={-30} dt={after} size={1.6} />
    </g>
  );
}

// ---------- Level 18: beaver dam ----------
// crack (water spurts through) → burst (logs pop out behind him as he runs the top).

const MUD = '#7a5436';
const STICK = '#ad7c4c';
const FUR = '#9c6238';
const MUZZLE = '#e9be88';
const TAIL = '#5b3b2c';
const DAM_TOP = -DAM.top + 18;

/** The dam's outline: a heap of sticks and mud from bank to bank, flat on top. */
const DAM_EDGE = `M${DAM.dam[0] - 56} 70 Q${DAM.dam[0] - 44} 14 ${DAM.dam[0] - 8} ${DAM_TOP} H${DAM.dam[1] + 8} Q${DAM.dam[1] + 44} 14 ${DAM.dam[1] + 56} 70 Z`;

/** Sticks woven through the dam, as one path of strokes (a few elements, cheap every frame). */
const DAM_STICKS = (() => {
  const [a, b] = DAM.dam;
  let d = '';
  let i = 0;
  for (let y = DAM_TOP + 12; y < 60; y += 18) {
    const f = (y - DAM_TOP) / (70 - DAM_TOP);
    const left = a - 8 - 48 * f + 14;
    const right = b + 8 + 48 * f - 14;
    for (let x = left + noise(i, 3) * 24; x < right - 20; x += 52 + noise(i, 5) * 34) {
      const ang = ((noise(i, 9) - 0.5) * 50 * Math.PI) / 180;
      const l = (30 + noise(i, 11) * 26) / 2;
      const yy = y + (noise(i, 7) - 0.5) * 6;
      d += `M${(x - Math.cos(ang) * l).toFixed(1)} ${(yy - Math.sin(ang) * l).toFixed(1)} L${(x + Math.cos(ang) * l).toFixed(1)} ${(yy + Math.sin(ang) * l).toFixed(1)} `;
      i++;
    }
  }
  return d;
})();

const DamBody = memo(function DamBody() {
  const [a, b] = DAM.dam;
  return (
    <g>
      <path d={DAM_EDGE} fill={MUD} {...ink(OUT)} />
      <path
        d={`M${a - 56} 70 Q${a - 44} 14 ${a - 8} ${DAM_TOP} L${a + 26} ${DAM_TOP} Q${a - 14} 14 ${a - 22} 70 Z`}
        fill={shade(MUD, 0.3)}
      />
      <g fill={tint(MUD, 0.18)}>
        {[0.12, 0.3, 0.52, 0.7, 0.88].map((f, i) => (
          <ellipse key={f} cx={lerp(a, b, f)} cy={DAM_TOP + 30 + (i % 2) * 22} rx={34} ry={9} />
        ))}
      </g>
      <path d={DAM_STICKS} stroke={INK} strokeWidth={9.4} strokeLinecap="round" fill="none" />
      <path d={DAM_STICKS} stroke={STICK} strokeWidth={6} strokeLinecap="round" fill="none" />
      <path
        d={DAM_STICKS}
        transform="translate(0.8 -1.4)"
        stroke={tint(STICK, 0.45)}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${b - 30} ${DAM_TOP + 3} H${b + 6} Q${b + 38} 14 ${b + 48} 56`}
        stroke={tint(MUD, 0.45)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      {/* The beavers' doorways. */}
      {DAM.beavers.map((x) => (
        <ellipse key={x} cx={x} cy={12} rx={30} ry={22} fill="#2a1912" {...ink(IN + 0.5)} />
      ))}
    </g>
  );
});

/** One of the walkway logs on top of the dam, its top at y -9 (side on, its end to the right). */
const DamLog = memo(function DamLog() {
  return (
    <g>
      <rect x={-24} y={-9} width={48} height={18} rx={8} fill={BARK} {...ink(OUT - 0.6)} />
      <path d="M-24 2 Q-23 9 -16 9 H16 Q23 9 24 2 Z" fill={shade(BARK, 0.3)} />
      <path d="M-18 -5 H14" stroke={tint(BARK, 0.4)} strokeWidth={2.2} strokeLinecap="round" />
      <path
        d="M-12 2 h10 M5 0 h7"
        stroke={shade(BARK, 0.45)}
        strokeWidth={IN}
        strokeLinecap="round"
      />
      <ellipse cx={22} cy={0} rx={5.5} ry={8.5} fill={HEART} {...ink(IN)} />
      <ellipse
        cx={22}
        cy={0}
        rx={2.4}
        ry={4}
        fill="none"
        stroke={shade(HEART, 0.35)}
        strokeWidth={1}
      />
    </g>
  );
});

function logBurstAt(p: ObstacleProps, x: number) {
  const burstAt = eventTime(p.events, 'burst');
  const start = p.heroAt(burstAt).x - DAM.lag;
  const [a] = DAM.dam;
  if (x <= start) return burstAt + ((x - a) / Math.max(1, start - a)) * 200;
  return Math.max(burstAt + 200, heroPasses(p, x + DAM.lag, burstAt));
}

/** A beaver's body (facing us): a paddle tail, a round tummy, big eyes and buck teeth. */
const BeaverBody = memo(function BeaverBody() {
  return (
    <g>
      <g transform="rotate(-28 -14 12)">
        <ellipse cx={-36} cy={12} rx={20} ry={9} fill={TAIL} {...ink(OUT - 0.6)} />
        <path
          d="M-50 8 L-24 16 M-48 15 L-26 8 M-40 5 L-32 19"
          stroke={shade(TAIL, 0.45)}
          strokeWidth={1.2}
        />
      </g>
      <path d="M-22 14 Q-26 -16 0 -20 Q26 -16 22 14 Q0 24 -22 14 Z" fill={FUR} {...ink(OUT)} />
      <path d="M-22 14 Q-26 -6 -16 -14 Q-20 4 -10 18 Q-16 18 -22 14 Z" fill={shade(FUR, 0.3)} />
      <ellipse cx={1} cy={4} rx={11} ry={11} fill={MUZZLE} />
      <path d="M-16 8 q4 6 10 4" stroke={shade(FUR, 0.35)} strokeWidth={IN} fill="none" />
      <circle cx={-14} cy={-38} r={6} fill={FUR} {...ink(IN + 0.5)} />
      <circle cx={14} cy={-38} r={6} fill={FUR} {...ink(IN + 0.5)} />
      <circle cx={-14} cy={-38} r={2.6} fill={shade(FUR, 0.45)} />
      <circle cx={14} cy={-38} r={2.6} fill={shade(FUR, 0.45)} />
      <ellipse cx={0} cy={-25} rx={20} ry={17} fill={FUR} {...ink(OUT)} />
      <path
        d="M-20 -23 Q-20 -37 -6 -41 Q-16 -31 -14 -13 Q-20 -15 -20 -23 Z"
        fill={shade(FUR, 0.25)}
      />
      <path
        d="M10 -39 Q18 -35 19 -27"
        stroke={tint(FUR, 0.5)}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={0} cy={-17} rx={11} ry={8} fill={MUZZLE} {...ink(IN)} />
      <ellipse cx={0} cy={-22} rx={4.4} ry={3} fill="#3a2418" />
      <circle cx={1.4} cy={-23} r={1.1} fill="#ffffff" />
      <path d="M-3.4 -13 h6.8 v6 q-3.4 2 -6.8 0 Z" fill="#fff8ea" {...ink(1.1)} />
      <path d="M0 -13 V-7" stroke={INK} strokeWidth={0.9} />
      {[-8, 8].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex} cy={-29} rx={3.6} ry={4.4} fill="#2a1a20" />
          <circle cx={ex + 1.2} cy={-30.6} r={1.5} fill="#ffffff" />
          <circle cx={ex - 1} cy={-27.4} r={0.7} fill="#ffffff" />
        </g>
      ))}
      <ellipse cx={-13} cy={-18} rx={3} ry={1.8} fill="#ff9aa8" opacity={0.65} />
      <ellipse cx={13} cy={-18} rx={3} ry={1.8} fill="#ff9aa8" opacity={0.65} />
      <path
        d="M-16 -4 Q-24 2 -22 10"
        stroke={INK}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M-16 -4 Q-24 2 -22 10"
        stroke={FUR}
        strokeWidth={4.6}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
});

/** A beaver peeking out of its doorway: it waves hello, then dives out of the way. */
function Beaver({ x, y, wave }: { x: number; y: number; wave: number }) {
  return (
    <g transform={`translate(${x} ${y.toFixed(1)})`}>
      <BeaverBody />
      <g transform={`rotate(${(-20 + wave * 28).toFixed(1)} 16 -6)`}>
        <path
          d="M16 -6 Q26 -14 30 -28"
          stroke={INK}
          strokeWidth={8.4}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M16 -6 Q26 -14 30 -28"
          stroke={FUR}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
        <circle cx={30} cy={-29} r={4.2} fill={MUZZLE} {...ink(IN)} />
      </g>
    </g>
  );
}

export function BeaverDamBack(p: ObstacleProps) {
  const [a, b] = DAM.dam;
  const crack = since(p, 'crack');
  const burst = since(p, 'burst');
  const logs = [];
  for (let x = a + 20; x < b - 10; x += 46) logs.push(x);
  return (
    <g>
      <Bank x={a - 40} dir={1} level={40} />
      <Bank x={b + 40} dir={-1} level={40} />
      <DamBody />
      {/* The beavers wave hello, then dive out of the way. */}
      {DAM.beavers.map((x, i) => {
        const dive = burst - i * 80;
        const y = dive < 0 ? 22 - 20 * clamp01((p.heroX - a - 20) / 120) : 22 + dive * 0.25;
        return y < 90 ? <Beaver key={x} x={x} y={y} wave={Math.sin(p.t / 120 + i)} /> : null;
      })}
      {/* Water spurting out through the cracks, then gushing once it bursts. */}
      {crack >= 0 &&
        [0.25, 0.5, 0.75].map((f, i) => {
          const x = lerp(a, b, f) + 40;
          const h =
            (30 + 50 * clamp01(crack / 600)) *
            (1 + (burst > 0 ? 1.5 : 0)) *
            (0.8 + 0.2 * Math.sin(p.t / 70 + i));
          const y0 = -DAM.top + 30;
          return (
            <g key={f}>
              <path
                d={`M${x - 8} ${y0} Q${x + h * 0.6} ${y0 - 10} ${x + h} 44 L${x + h - 24} 44 Q${x + h * 0.4} ${y0 + 14} ${x - 8} ${y0 + 14} Z`}
                fill={SPRAY}
                {...ink(IN + 0.4)}
              />
              <path
                d={`M${x} ${y0 + 4} Q${x + h * 0.55} ${y0 - 4} ${x + h - 8} 36`}
                stroke={SPRAY_SHADE}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      {logs.map((x, i) => {
        const dt = p.t - logBurstAt(p, x);
        const y = -DAM.top + 9 + fallen(dt, 0.002) - (dt > 0 ? dt * 0.35 : 0);
        if (y > 260) return null;
        const r = dt > 0 ? (noise(i) - 0.5) * dt * 0.5 : (i % 3) * 3;
        return (
          <g key={x} transform={`translate(${x} ${y.toFixed(1)}) rotate(${r.toFixed(1)})`}>
            <DamLog />
          </g>
        );
      })}
      <River a={a - 40} b={b + 40} level={40} t={p.t} white={clamp01(burst / 600)} shore={false} />
      <Splash x={(a + b) / 2} y={30} dt={burst} size={1.4} />
    </g>
  );
}

// ---------- Level 19: rapids ride ----------
// board (he hops on a floating log) → drop (it flies off the step) → splash → off.

function waterAt(x: number) {
  return x < RAPIDS.drop ? RAPIDS.waterBefore : RAPIDS.waterAfter;
}

function rapidsLog(p: ObstacleProps) {
  const boardAt = eventTime(p.events, 'board');
  const offAt = eventTime(p.events, 'off');
  const riding = p.t >= boardAt && p.t < offAt;
  const x = p.t < boardAt ? RAPIDS.logRest : Math.min(p.heroX, RAPIDS.stop);
  // Riding, the log's top is under his feet; otherwise it floats on the water.
  const y = riding ? -p.heroLift : waterAt(x) - RAPIDS.logTop + 3 * Math.sin(p.t / 300);
  return { x, y, riding };
}

const RAPIDS_ROCK = roundPath([
  [-32, 26],
  [-30, 4],
  [-14, -14],
  [6, -18],
  [24, -10],
  [32, 6],
  [34, 26],
  [0, 34],
]);

/** A rock sticking up out of the rapids, its base at the water line. */
const RiverRock = memo(function RiverRock() {
  return (
    <g>
      <path d={RAPIDS_ROCK} fill={ROCK} {...ink(OUT)} />
      <path d="M-30 6 Q-34 20 -28 30 L-12 30 Q-20 16 -16 -10 Z" fill={shade(ROCK, 0.3)} />
      <path
        d="M4 -16 Q24 -12 30 2"
        stroke={tint(ROCK, 0.6)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={12} cy={-5} rx={7} ry={2.4} fill="#ffffff" opacity={0.6} />
      <path d="M-22 -2 Q-10 -16 6 -15 Q-4 -10 -8 -4 Q-16 -2 -22 -2 Z" fill={MOSS} {...ink(IN)} />
    </g>
  );
});

/** The log he rides, side on with its top at y 0: bark, a cut end with rings, a leafy twig. */
const RideLog = memo(function RideLog() {
  return (
    <g>
      <rect x={-100} y={0} width={200} height={34} rx={17} fill={BARK} {...ink(OUT)} />
      <path
        d="M-100 17 A17 17 0 0 0 -83 34 H83 A17 17 0 0 0 100 17 Q0 27 -100 17 Z"
        fill={shade(BARK, 0.3)}
      />
      <path d="M-84 6 H82" stroke={tint(BARK, 0.45)} strokeWidth={3} strokeLinecap="round" />
      <path
        d="M-70 15 h30 M-20 12 h40 M34 18 h28 M-50 24 h22"
        stroke={shade(BARK, 0.45)}
        strokeWidth={IN}
        strokeLinecap="round"
      />
      <path d="M22 1 Q38 -6 56 1 Q42 5 22 1 Z" fill={MOSS} {...ink(IN)} />
      <ellipse cx={100} cy={17} rx={10} ry={17} fill={HEART} {...ink(OUT - 0.6)} />
      <ellipse
        cx={100}
        cy={17}
        rx={6}
        ry={11}
        fill="none"
        stroke={shade(HEART, 0.3)}
        strokeWidth={IN}
      />
      <ellipse cx={100} cy={17} rx={2.6} ry={4.6} fill={shade(HEART, 0.42)} />
      <path d="M-56 2 L-62 -12" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M-56 2 L-62 -12" stroke={BARK} strokeWidth={4.6} strokeLinecap="round" />
      <path d="M-62 -12 Q-70 -24 -82 -22 Q-72 -14 -62 -12 Z" fill={LEAF} {...ink(IN)} />
      <path d="M-62 -12 Q-56 -26 -44 -26 Q-50 -16 -62 -12 Z" fill={tint(LEAF, 0.25)} {...ink(IN)} />
    </g>
  );
});

/** The step the river pours over (painted): a smooth curtain of water with foam at its foot. */
const DropFall = memo(function DropFall() {
  const id = useId();
  const x = RAPIDS.drop;
  const y0 = RAPIDS.waterBefore;
  const y1 = RAPIDS.waterAfter;
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={y0} x2="0" y2={y1 + 10}>
          <stop offset="0" stopColor={LIGHT} />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <path
        d={`M${x - 8} ${y0 - 2} Q${x + 22} ${y0} ${x + 32} ${y1 + 6} L${x + 12} ${y1 + 10} Q${x + 4} ${y0 + 16} ${x - 8} ${y0 + 12} Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M${x - 6} ${y0} Q${x + 20} ${y0 + 2} ${x + 30} ${y1 + 4}`}
        stroke="#ffffff"
        strokeWidth={3}
        fill="none"
      />
    </g>
  );
});

export function RapidsBack(p: ObstacleProps) {
  const [a, b] = RAPIDS.channel;
  const white = 0.3 + 0.7 * clamp01(since(p, 'board') / 800);
  const d = RAPIDS.drop;
  return (
    <g>
      <FarShore a={a} b={b} level={RAPIDS.waterAfter} />
      <River
        a={a}
        b={d}
        level={RAPIDS.waterBefore}
        t={p.t}
        flow={0.6}
        white={white}
        shore={false}
      />
      <River a={d} b={b} level={RAPIDS.waterAfter} t={p.t} flow={0.6} white={white} shore={false} />
      <DropFall />
      {/* Foam churning at the foot of the step. */}
      <g opacity={0.85}>
        {[SPRAY_SHADE, FOAM].map((fill, layer) => (
          <path
            key={fill}
            d={circles(
              [0, 1, 2, 3, 4].map((i) => {
                const ph = ((p.t + i * 110) % 550) / 550;
                return {
                  x: d + 22 + layer + i * 14 + ph * 26,
                  y: RAPIDS.waterAfter + 4 - layer * 2 - ph * 6,
                  r: 8 - layer + 4 * noise(i, 2) + ph * (4 - layer),
                };
              }),
            )}
            fill={fill}
          />
        ))}
      </g>
      {[400, 760, 1350].map((x) => (
        <g key={x} transform={`translate(${x} ${waterAt(x) - 28})`}>
          <RiverRock />
        </g>
      ))}
      <path
        d={[400, 760, 1350]
          .map((x, i) => {
            const y = waterAt(x);
            return `M${x - 40} ${y + 3}a42 6 0 1 0 84 0a42 6 0 1 0 -84 0M${x + 40} ${y}h${(26 + 8 * Math.sin(p.t / 90 + i)).toFixed(1)}M${x + 34} ${y + 8}h${(18 + 6 * Math.sin(p.t / 70 + i)).toFixed(1)}`;
          })
          .join('')}
        fill="none"
        stroke={FOAM}
        strokeWidth={3.5}
        strokeLinecap="round"
        opacity={0.9}
      />
      <Bank x={a} dir={1} level={RAPIDS.waterBefore} />
      <Bank x={b} dir={-1} level={RAPIDS.waterAfter} />
    </g>
  );
}

export function RapidsFront(p: ObstacleProps) {
  const log = rapidsLog(p);
  const flyAt = eventTime(p.events, 'drop');
  const splashAt = eventTime(p.events, 'splash');
  const tilt = p.t >= flyAt && p.t < splashAt ? -8 + 18 * ((p.t - flyAt) / (splashAt - flyAt)) : 0;
  const rolling = log.riding && p.t < splashAt + 400;
  return (
    <g>
      {rolling && <SpeedLines x={log.x - 110} t={p.t} ys={SPEED_YS} />}
      <g
        transform={`translate(${log.x.toFixed(1)} ${log.y.toFixed(1)}) rotate(${tilt.toFixed(1)})`}
      >
        <RideLog />
      </g>
      {log.riding && p.t < flyAt && (
        <path
          d={`M${log.x - 104} ${log.y + 26} q-14 -6 -30 -2 M${log.x - 100} ${log.y + 32} q-10 4 -24 4`}
          stroke={FOAM}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />
      )}
      <Splash x={log.x} y={RAPIDS.waterAfter} dt={p.t - splashAt} size={1.5} />
    </g>
  );
}

// ---------- Level 20: rope bridge ----------
// snap (the planks ahead fall away) → he goes hand over hand along the rope → climbs up.

/** The gorge under the bridge (painted): the far wall falling away into the dark, a river below. */
const Gorge = memo(function Gorge() {
  const id = useId();
  const [a, b] = ROPE_BRIDGE.gorge;
  const facets = [0.08, 0.2, 0.33, 0.47, 0.6, 0.74, 0.88];
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}far`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-14}
          x2="0"
          y2={200}
        >
          <stop offset="0" stopColor="#9890b8" />
          <stop offset="0.04" stopColor="#5a5282" />
          <stop offset="0.18" stopColor="#2c2848" />
          <stop offset="0.5" stopColor="#1a1830" />
          <stop offset="1" stopColor="#0e0d1c" />
        </linearGradient>
        <linearGradient id={`${id}facet`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d74a4" stopOpacity={0.8} />
          <stop offset="1" stopColor="#7d74a4" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}mist`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dff0ff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#dff0ff" stopOpacity={0.16} />
          <stop offset="1" stopColor="#dff0ff" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={`${id}lit`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-4}
          x2="0"
          y2={180}
        >
          <stop offset="0" stopColor="#a69dc4" />
          <stop offset="0.2" stopColor="#5f5784" />
          <stop offset="1" stopColor="#1c1930" />
        </linearGradient>
        <linearGradient
          id={`${id}dark`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-4}
          x2="0"
          y2={180}
        >
          <stop offset="0" stopColor="#6c6490" />
          <stop offset="0.2" stopColor="#3a3456" />
          <stop offset="1" stopColor="#121022" />
        </linearGradient>
      </defs>
      <path
        d={`M${a} 240 V-2 Q${a + 30} -14 ${a + 60} -14 H${b - 60} Q${b - 30} -14 ${b} -2 V240 Z`}
        fill={`url(#${id}far)`}
      />
      {/* Lit facets of the far wall, fading into the shadow below. */}
      <g fill={`url(#${id}facet)`}>
        {facets.map((f, i) => {
          const x = lerp(a, b, f);
          const w = 30 + 26 * noise(i, 3);
          const h = 50 + 50 * noise(i, 5);
          return (
            <path
              key={f}
              d={`M${x - w * 0.5} -8 L${x + w * 0.5} -10 L${x + w * 0.3} ${h} L${x - w * 0.2} ${h * 0.8} Z`}
            />
          );
        })}
      </g>
      <path
        d={`M${a + 40} -6 Q${(a + b) / 2} -10 ${b - 40} -6`}
        stroke="#c8bfe0"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
      {/* Vines hanging over the far rim. */}
      <g stroke={P.reed} strokeWidth={3} fill="none" strokeLinecap="round">
        {[0.14, 0.4, 0.66, 0.92].map((f, i) => {
          const x = lerp(a, b, f);
          const len = 30 + 26 * noise(i, 7);
          return <path key={f} d={`M${x} -10 q${6 + i * 2} ${len * 0.5} ${-2} ${len}`} />;
        })}
      </g>
      <g fill={P.grass}>
        {[0.14, 0.4, 0.66, 0.92].map((f, i) => {
          const x = lerp(a, b, f);
          const len = 30 + 26 * noise(i, 7);
          return (
            <g key={f}>
              <path d={LEAF_PATH} transform={`translate(${x + 3} ${-10 + len * 0.4}) rotate(30)`} />
              <path
                d={LEAF_PATH}
                transform={`translate(${x - 1} ${-10 + len * 0.75}) rotate(150)`}
              />
            </g>
          );
        })}
      </g>
      {/* Mist drifting over the river far below. */}
      <rect x={a} y={84} width={b - a} height={56} fill={`url(#${id}mist)`} />
      <path
        d={`M${a + 20} 148 Q${(a + b) / 2} 140 ${b - 20} 148 V240 H${a + 20} Z`}
        fill="#1d4f7e"
      />
      <path
        d={`M${a + 70} 152 h70 M${a + 310} 148 h110 M${b - 190} 152 h80`}
        stroke={LIGHT}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.55}
      />
      {/* The gorge's near edges: the left one faces the light, the right one is in shadow. */}
      <path
        d={`M${a - 24} -3 L${a + 2} -3 Q${a + 20} 30 ${a + 34} 240 L${a - 24} 240 Z`}
        fill={`url(#${id}lit)`}
      />
      <path
        d={`M${b + 24} -3 L${b - 2} -3 Q${b - 20} 30 ${b - 34} 240 L${b + 24} 240 Z`}
        fill={`url(#${id}dark)`}
      />
      <g fill={P.grass}>
        <path
          d={`M${a - 30} -4 Q${a - 4} -8 ${a + 8} 2 Q${a + 2} 14 ${a + 6} 30 Q${a - 8} 14 ${a - 30} 6 Z`}
        />
        <path
          d={`M${b + 30} -4 Q${b + 4} -8 ${b - 8} 2 Q${b - 2} 16 ${b - 8} 34 Q${b + 8} 14 ${b + 30} 6 Z`}
        />
      </g>
    </g>
  );
});

/** A bridge post: wood with a cut top and rope wrapped round it. */
const Post = memo(function Post() {
  const top = -ROPE_BRIDGE.rope - 30;
  return (
    <g>
      <rect x={-9} y={top} width={18} height={-top + 8} rx={5} fill={WOOD} {...ink(OUT)} />
      <rect x={-7.4} y={top + 4} width={6} height={-top} rx={3} fill={shade(WOOD, 0.3)} />
      <path
        d={`M5 ${top + 8} V0`}
        stroke={tint(WOOD, 0.5)}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <ellipse cx={0} cy={top} rx={9} ry={3.4} fill={tint(WOOD, 0.35)} {...ink(IN)} />
      <path
        d={`M-10 ${top + 14} L10 ${top + 20} M-10 ${top + 20} L10 ${top + 26} M-10 ${top + 26} L10 ${top + 32}`}
        stroke={INK}
        strokeWidth={5.6}
        strokeLinecap="round"
      />
      <path
        d={`M-10 ${top + 14} L10 ${top + 20} M-10 ${top + 20} L10 ${top + 26} M-10 ${top + 26} L10 ${top + 32}`}
        stroke={ROPE}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
});

/** A plank of the bridge, its top at y 0, tied on with rope at both ends. */
const Plank = memo(function Plank() {
  return (
    <g>
      <rect x={-20} y={0} width={40} height={12} rx={2.5} fill={WOOD} {...ink(OUT - 0.6)} />
      <path d="M-20 8 H20 V9.5 Q20 12 17.5 12 H-17.5 Q-20 12 -20 9.5 Z" fill={shade(WOOD, 0.3)} />
      <path d="M-16 3.4 H14" stroke={tint(WOOD, 0.45)} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M-15 -1 V13 M15 -1 V13" stroke={INK} strokeWidth={4.6} />
      <path d="M-15 -1 V13 M15 -1 V13" stroke={ROPE} strokeWidth={2.4} />
    </g>
  );
});

export function RopeBridgeBack(p: ObstacleProps) {
  const [a, b] = ROPE_BRIDGE.gorge;
  const [g0, g1] = ROPE_BRIDGE.gap;
  const snap = since(p, 'snap');
  const planks = [];
  for (let x = a + 4; x < b - 4; x += 44) planks.push(x);
  const sag = 12 + 10 * bump(snap, 700);
  const rope = -ROPE_BRIDGE.rope;
  const mid = (a + b) / 2;
  return (
    <g>
      <Gorge />
      {/* The rope the planks hang from, behind them. */}
      <Rope d={`M${a - 10} 4 Q${mid} 18 ${b + 10} 4`} />
      {planks.map((x, i) => {
        const inGap = x > g0 - 22 && x < g1 + 22;
        const dt = inGap ? snap - Math.abs(x - (g0 + g1) / 2) * 0.6 : -1;
        const y = fallen(dt, 0.0028);
        if (y > 300) return null;
        const r = dt > 0 ? (noise(i) - 0.5) * dt * 0.5 : 0;
        return (
          <g
            key={x}
            transform={`translate(${x + 20} ${y.toFixed(1)}) rotate(${r.toFixed(1)})`}
            opacity={1 - clamp01((y - 160) / 120)}
          >
            <Plank />
          </g>
        );
      })}
      {[a - 10, b + 10].map((x) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <Post />
        </g>
      ))}
      {/* The hand rope he hangs from. */}
      <Rope d={`M${a - 10} ${rope} Q${mid} ${rope + sag} ${b + 10} ${rope}`} />
      <Dust x={(g0 + g1) / 2} y={-6} dt={snap} ms={700} size={0.9} color="#d8c8a8" />
    </g>
  );
}

// ---------- Level 21: geyser launch ----------
// rumble (the springs boil) → blast (the geyser under his rock shoots him up) → land.

const SINTER = '#f2dcae';
const SINTER_DARK = '#d79a5c';

/** Terraces of mineral crust stepping down into the pool from x (dir 1: the pool is to the right). */
function terrace(x: number, dir: 1 | -1) {
  const d = (v: number) => (x + dir * v).toFixed(1);
  return `M${d(-80)} 80 L${d(-80)} 0 Q${d(-74)} -9 ${d(-52)} -8 Q${d(-36)} -8 ${d(-32)} -1 Q${d(-18)} -2 ${d(-12)} 6 Q${d(0)} 6 ${d(6)} 13 Q${d(14)} 14 ${d(18)} 22 L${d(30)} 80 Z`;
}

/** The hot spring (painted): bright water in a basin of cream and orange mineral terraces. */
const SpringPool = memo(function SpringPool() {
  const id = useId();
  const [a, b] = GEYSER.pool;
  const mid = (a + b) / 2;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}w`} gradientUnits="userSpaceOnUse" x1="0" y1={0} x2="0" y2={80}>
          <stop offset="0" stopColor="#c4f7f2" />
          <stop offset="0.3" stopColor="#4fd2e2" />
          <stop offset="1" stopColor="#1d78b4" />
        </linearGradient>
        <linearGradient id={`${id}r`} gradientUnits="userSpaceOnUse" x1="0" y1={-8} x2="0" y2={70}>
          <stop offset="0" stopColor="#fbf0d6" />
          <stop offset="0.3" stopColor={SINTER} />
          <stop offset="0.75" stopColor="#e2a868" />
          <stop offset="1" stopColor="#b8744a" />
        </linearGradient>
      </defs>
      <path d={`M${a} 2 Q${mid} 8 ${b} 2 L${b - 30} 80 L${a + 30} 80 Z`} fill={`url(#${id}w)`} />
      <ellipse cx={mid} cy={44} rx={(b - a) * 0.3} ry={22} fill="#166aa6" opacity={0.35} />
      <path d={`M${a + 4} 2 Q${mid} 8 ${b - 4} 2`} stroke="#effffd" strokeWidth={3} fill="none" />
      {[
        [a, 1],
        [b, -1],
      ].map(([x, dir]) => {
        const d = (v: number) => x! + dir! * v;
        return (
          <g key={x}>
            <path d={terrace(x!, dir as 1 | -1)} fill={`url(#${id}r)`} />
            {/* Little pools on the steps, and the lit lips of the terraces. */}
            <path
              d={`M${d(-30)} -1 Q${d(-22)} -3 ${d(-13)} 4 Z M${d(-10)} 6 Q${d(-2)} 4 ${d(5)} 12 Z`}
              fill="#7fe0e8"
            />
            <path
              d={`M${d(-76)} -4 Q${d(-62)} -10 ${d(-40)} -7 M${d(-30)} -2 Q${d(-20)} -3 ${d(-12)} 5 M${d(-8)} 7 Q${d(2)} 6 ${d(8)} 13`}
              stroke="#fff6dc"
              strokeWidth={2.6}
              fill="none"
              strokeLinecap="round"
            />
            <g stroke={SINTER_DARK} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6}>
              <path
                d={`M${d(-60)} 4 q-3 14 2 30 M${d(-44)} 2 q3 18 -2 40 M${d(-22)} 10 q-3 16 1 34`}
              />
            </g>
          </g>
        );
      })}
      {/* Little mineral cones round the vents. */}
      {GEYSER.vents.map((x) => (
        <g key={x}>
          <path
            d={`M${x - 26} 6 Q${x - 12} -8 ${x} -8 Q${x + 12} -8 ${x + 26} 6 Z`}
            fill={SINTER}
          />
          <path
            d={`M${x - 26} 6 Q${x - 12} -8 ${x} -8 L${x - 4} 6 Z`}
            fill={SINTER_DARK}
            opacity={0.6}
          />
          <ellipse cx={x} cy={-6} rx={9} ry={3} fill="#5a3a2a" />
        </g>
      ))}
    </g>
  );
});

/** A geyser jet `h` tall at x, `dt` after it blew (cel-drawn water, with foam at the top). */
function Geyser({ x, dt, h, cap = -Infinity }: { x: number; dt: number; h: number; cap?: number }) {
  if (!(dt >= 0 && dt < 2200)) return null;
  const rise = easeOut(clamp01(dt / 250)) * (1 - clamp01((dt - 1500) / 700));
  // `cap`: the top can't pass the underside of the rock it's pushing.
  const top = Math.max(-h * rise, cap);
  if (top > -8) return null;
  // Its sides ripple as the water rushes up.
  const edge = (scale: number, shift: number) => {
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    for (let i = 0; i <= 6; i++) {
      const f = i / 6;
      const y = lerp(8, top + 12, f);
      const w = (lerp(24, 32, f) + 5 * Math.sin(dt / 45 - f * 9)) * scale;
      left.push([x + shift - w, y]);
      right.unshift([x + shift + w + 4 * scale * Math.sin(dt / 50 - f * 8 + 1.4), y]);
    }
    return roundPath([...left, ...right]);
  };
  const crown = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
    x: x + (i - 3) * 15 + 5 * Math.sin(dt / 60 + i),
    y: top - 4 - 14 * Math.sin((i / 6) * Math.PI) + 6 * Math.sin(dt / 80 + i * 2),
    r: 12 + noise(i) * 8,
  }));
  return (
    <g>
      {/* Steam billowing round the jet. */}
      <path
        d={circles([
          { x: x - 30, y: top * 0.55, r: 34 },
          { x: x + 34, y: top * 0.75, r: 30 },
          { x: x - 10, y: top * 0.9, r: 40 },
        ])}
        fill="#ffffff"
        opacity={0.28}
      />
      <path d={edge(1, 0)} fill="#dcf4ff" {...ink(IN + 0.8)} />
      <path d={edge(0.5, -10)} fill={SPRAY_SHADE} opacity={0.75} />
      <path d={edge(0.22, 9)} fill="#ffffff" />
      <path
        d={`M${x - 14} 0 V${top + 30}`}
        stroke={LIGHT}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="22 34"
        strokeDashoffset={dt * 0.9}
      />
      {/* Foam boiling round its foot, the crown of foam on top, and drops thrown out of it. */}
      <path
        d={circles([
          ...[-30, -12, 10, 28].map((dx, i) => ({
            x: x + dx,
            y: 2 + 3 * Math.sin(dt / 70 + i),
            r: 10 - (i % 2) * 2,
          })),
          ...crown,
        ])}
        fill={SPRAY}
        {...ink(IN + 0.3)}
      />
      <path
        d={circles(crown.map((c) => ({ x: c.x + c.r * 0.25, y: c.y - c.r * 0.3, r: c.r * 0.4 })))}
        fill="#ffffff"
      />
      <path
        d={ellipses(
          [0, 1, 2, 3, 4, 5].map((i) => {
            const ph = ((dt + i * 95) % 570) / 570;
            const side = i % 2 ? 1 : -1;
            return {
              x: x + side * (16 + ph * (50 + i * 8)),
              y: top - 14 - ph * 50 + ph * ph * 190,
              rx: 5,
              ry: 6.5,
              rot: 0,
            };
          }),
        )}
        fill={SPRAY}
        opacity={0.85}
        {...ink(IN)}
      />
    </g>
  );
}

const LID_EDGE = roundPath([
  [-58, 22],
  [-54, 4],
  [-36, -1],
  [0, -3],
  [36, -1],
  [54, 4],
  [58, 22],
  [40, 36],
  [-40, 36],
]);

/** The rock lid he stands on over the vent, its top at y 0. */
const LidRock = memo(function LidRock() {
  return (
    <g>
      <path d={LID_EDGE} fill={ROCK} {...ink(OUT)} />
      <path d="M-56 8 Q-58 24 -46 34 L-30 34 Q-42 22 -40 2 Z" fill={shade(ROCK, 0.3)} />
      <path
        d="M20 -1 Q46 1 54 12"
        stroke={tint(ROCK, 0.6)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-8 12 l6 8 l-2 8 M18 16 l8 6"
        stroke={shade(ROCK, 0.45)}
        strokeWidth={IN}
        fill="none"
        strokeLinecap="round"
      />
      <path d="M-40 30 Q0 40 40 30 Q30 37 0 38 Q-30 37 -40 30 Z" fill={SINTER_DARK} opacity={0.7} />
    </g>
  );
});

export function GeyserBack(p: ObstacleProps) {
  const [a, b] = GEYSER.pool;
  const rumble = since(p, 'rumble');
  const blast = since(p, 'blast');
  const [v1] = GEYSER.vents;
  // His rock lid rides up with him, then drops back onto the vent.
  const blastAt = eventTime(p.events, 'blast');
  const release = blastAt + 500;
  const lid =
    p.t < blastAt
      ? 30
      : p.t < release
        ? p.heroLift
        : Math.max(30, p.heroAt(release).lift - fallen(p.t - release, 0.003));
  const boil = rumble >= 0 ? clamp01(rumble / 600) : 0;
  return (
    <g>
      <SpringPool />
      {/* Steam and bubbles as the springs boil (a little steam even before), fading in two steps. */}
      {[0, 1].map((late) => (
        <path
          key={`s${late}`}
          d={circles(
            Array.from({ length: 8 }, (_, i) => {
              const cycle = (p.t * (0.6 + boil * 0.8) + i * 190) % 1200;
              return {
                x: a + 40 + i * ((b - a - 80) / 7) + 10 * Math.sin(cycle / 200),
                y: -cycle * 0.12,
                r: cycle < 600 === !late ? 10 + cycle * 0.03 : 0,
              };
            }).filter((c) => c.r > 0),
          )}
          fill="#ffffff"
          opacity={(0.16 + 0.34 * boil) * (late ? 0.4 : 0.85)}
        />
      ))}
      {boil > 0 &&
        [0, 1].map((late) => (
          <path
            key={`b${late}`}
            d={circles(
              Array.from({ length: 6 }, (_, i) => {
                const ph = ((rumble + i * 170) % 520) / 520;
                return {
                  x: a + 60 + i * ((b - a - 120) / 5),
                  y: 8 - ph * 6,
                  r: ph < 0.5 === !late ? 2 + ph * 5 : 0,
                };
              }).filter((c) => c.r > 0),
            )}
            fill="none"
            stroke="#effffd"
            strokeWidth={2.4}
            opacity={boil * (late ? 0.3 : 0.8)}
          />
        ))}
      {GEYSER.vents.map((x, i) => (
        <Geyser
          key={x}
          x={x}
          dt={blast - i * 350}
          h={[370, 280, 220][i]!}
          cap={i === 0 && p.t < release ? -lid + 30 : undefined}
        />
      ))}
      <g transform={`translate(${v1} ${(-lid).toFixed(1)})`}>
        <LidRock />
      </g>
    </g>
  );
}

// ---------- Level 22: waterfall slide ----------
// crack (the top rock breaks) → he slides down the chute → launch (off the lip, over the pool).

/** The cliff behind the falls (painted): rock lit from the right, with ledges, moss and ferns. */
const FallsCliff = memo(function FallsCliff() {
  const id = useId();
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={P.cliffDark} />
          <stop offset="0.5" stopColor={P.cliff} />
          <stop offset="0.9" stopColor={P.cliff} />
          <stop offset="1" stopColor={P.cliffLight} />
        </linearGradient>
      </defs>
      <path
        d="M30 6 L44 -900 L452 -900 Q440 -600 456 -420 Q470 -320 440 -250 L420 6 Z"
        fill={`url(#${id})`}
      />
      {/* Cracks running down it, and strata across it. */}
      <g stroke={P.cliffDark} fill="none" strokeLinecap="round" opacity={0.45}>
        <path d="M120 -900 q14 160 -6 330 q-12 150 6 300" strokeWidth={4} />
        <path d="M230 -900 q-10 120 8 260 q14 120 -4 220" strokeWidth={3} />
        <path d="M380 -780 q12 140 -8 260 q-10 100 6 200" strokeWidth={3.5} />
        <path d="M70 -330 q10 120 -4 230" strokeWidth={3} />
      </g>
      <g stroke={P.cliffDark} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.3}>
        <path d="M60 -620 q120 14 240 0 M50 -520 q140 12 260 -4 M70 -410 q90 10 170 0 M60 -180 q60 8 90 0" />
      </g>
      {/* Ledges, lit along the top with a shadow under, and tufts of grass on them. */}
      {[
        [56, -700, 90],
        [250, -560, 110],
        [44, -380, 80],
        [330, -440, 90],
        [150, -250, 70],
      ].map(([x, y, w]) => (
        <g key={`${x}${y}`}>
          <path
            d={`M${x} ${y! + 4} h${w} q-${w! * 0.5} 10 -${w} 6 Z`}
            fill={P.cliffDark}
            opacity={0.5}
          />
          <path
            d={`M${x} ${y} h${w}`}
            stroke={P.cliffLight}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <path
            d={`M${x! + w! * 0.3} ${y} q-4 -14 -10 -18 q10 4 14 14 q2 -12 10 -16 q-4 8 -4 20 Z`}
            fill={P.reed}
          />
        </g>
      ))}
      <g fill={P.moss}>
        <path d="M44 -460 q40 -14 80 0 q-40 10 -80 0 Z" />
        <path d="M380 -330 q30 -12 60 0 q-30 8 -60 0 Z" />
        <path d="M50 -250 q30 -10 60 0 q-30 8 -60 0 Z" />
      </g>
      <g fill={P.reed}>
        <path d="M416 -300 q20 -30 34 -20 q-14 4 -20 24 Z M420 -296 q26 -10 30 6 q-14 -8 -30 -6 Z" />
        <path d="M54 -330 q-20 -30 -30 -16 q12 2 18 22 Z" />
      </g>
    </g>
  );
});

/** A rock step `lift` px tall, its top at -lift, from -50 to 40 (lined: he jumps on it). */
const StepRock = memo(function StepRock({ lift }: { lift: number }) {
  const edge = roundPath([
    [-50, 8],
    [-52, -lift * 0.5],
    [-46, -lift + 2],
    [-10, -lift - 2],
    [30, -lift],
    [42, -lift + 8],
    [44, -lift * 0.4],
    [40, 8],
  ]);
  return (
    <g>
      <path d={edge} fill={ROCK} {...ink(OUT)} />
      <path
        d={`M-50 0 Q-52 ${-lift * 0.5} -44 ${-lift + 6} L-32 ${-lift + 6} Q-38 ${-lift * 0.5} -34 2 Z`}
        fill={shade(ROCK, 0.3)}
      />
      <path
        d={`M6 ${-lift - 1} Q34 ${-lift} 41 ${-lift + 12}`}
        stroke={tint(ROCK, 0.6)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M-42 ${-lift + 2} Q-24 ${-lift - 8} -6 ${-lift - 2} Q-18 ${-lift + 4} -28 ${-lift + 6} Z`}
        fill={MOSS}
        {...ink(IN)}
      />
      <path
        d={`M-8 ${-lift * 0.6} l7 10 l-3 10`}
        stroke={shade(ROCK, 0.45)}
        strokeWidth={IN}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

/** The chute: a smooth wet rock slope with water rushing down it (lined: he slides on it). */
const ChuteRock = memo(function ChuteRock() {
  const [[c0x, c0l], [c1x, c1l]] = FALLS.chute;
  return (
    <g>
      <path
        d={`M${c0x - 20} ${-c0l} L${c1x} ${-c1l} Q${c1x + 14} ${-c1l - 2} ${c1x + 22} ${-c1l + 8} L${c1x + 24} 6 L${c0x - 20} 6 Z`}
        fill={shade(ROCK, 0.08)}
        {...ink(OUT)}
      />
      <path
        d={`M${c0x - 20} ${-c0l + 30} L${c1x - 60} ${-c1l + 40} L${c1x - 40} 6 L${c0x - 20} 6 Z`}
        fill={shade(ROCK, 0.3)}
      />
      {/* Strata running along the slope, and a few cracks. */}
      <g
        stroke={shade(ROCK, 0.35)}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
        opacity={0.7}
      >
        {[34, 78, 130].map((d) => (
          <path key={d} d={`M${c0x - 6} ${-c0l + d} L${c1x - d * 1.6} ${-c1l + d * 0.7}`} />
        ))}
      </g>
      <g stroke={shade(ROCK, 0.45)} strokeWidth={IN} fill="none" strokeLinecap="round">
        <path
          d={`M${c0x + 40} ${-c0l + 70} l18 22 l-6 18 M${c0x + 220} ${-c0l + 120} l14 20 M${c1x - 180} ${-c1l + 30} l10 16 l-4 14`}
        />
      </g>
      <path
        d={`M${c0x - 18} ${-c0l + 4} L${c1x - 4} ${-c1l + 4}`}
        stroke={tint(ROCK, 0.5)}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={`M${c0x + 60} ${-c0l + 120} q30 -20 60 -16 q-20 14 -60 16 Z M${c1x - 120} ${-c1l + 40} q24 -14 50 -10 q-20 10 -50 10 Z`}
        fill={MOSS}
        {...ink(IN)}
      />
    </g>
  );
});

export function FallsBack(p: ObstacleProps) {
  const [[c0x, c0l], [c1x, c1l]] = FALLS.chute;
  const [p0, p1] = FALLS.pool;
  const crack = since(p, 'crack');
  // How long since he slid off the top (the cracked corner falls then).
  const fall = Math.max(0, p.t - heroPasses(p, c0x, eventTime(p.events, 'crack')));
  return (
    <g>
      <FallsCliff />
      {/* The waterfall pouring down the cliff onto the top of the chute. */}
      <rect x={c0x - 10} y={-900} width={70} height={900 - c0l} fill={P.fall} />
      <rect x={c0x - 10} y={-900} width={14} height={900 - c0l} fill="#ffffff" opacity={0.6} />
      <rect x={c0x + 44} y={-900} width={16} height={900 - c0l} fill={LIGHT} opacity={0.7} />
      <g stroke="#ffffff" strokeWidth={4} strokeLinecap="round" strokeDasharray="34 50">
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${c0x + 8 + i * 16} -900 V${-c0l - 10}`}
            strokeDashoffset={-(p.t * 0.9 + i * 30)}
          />
        ))}
      </g>
      <g>
        {[0, 1, 2, 3].map((i) => {
          const ph = ((p.t + i * 120) % 480) / 480;
          return (
            <g key={i} opacity={1 - ph * 0.6}>
              <circle
                cx={c0x + 4 + i * 16}
                cy={-c0l - 8 - ph * 10}
                r={10 + ph * 5}
                fill={SPRAY_SHADE}
              />
              <circle cx={c0x + 5 + i * 16} cy={-c0l - 10 - ph * 10} r={9 + ph * 4} fill={FOAM} />
            </g>
          );
        })}
      </g>
      {FALLS.steps.map(([x, lift]) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <StepRock lift={lift} />
        </g>
      ))}
      <ChuteRock />
      {/* Water rushing down the chute. */}
      <path
        d={`M${c0x - 18} ${-c0l - 7} L${c1x + 10} ${-c1l - 7}`}
        stroke={WATER}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d={`M${c0x - 16} ${-c0l - 11} L${c1x + 8} ${-c1l - 11}`}
        stroke={LIGHT}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={`M${c0x} ${-c0l - 8} L${c1x} ${-c1l - 8}`}
        stroke={FOAM}
        strokeWidth={3}
        strokeDasharray="20 30"
        strokeDashoffset={-p.t * 0.6}
        strokeLinecap="round"
      />
      {/* The pool he flies over. */}
      <River a={p0} b={p1} level={8} t={p.t} white={0.5} />
      <Bank x={p0} dir={1} level={8} />
      <Bank x={p1} dir={-1} level={8} />
      {/* The corner of the top rock cracks, and tumbles away as he slides off. */}
      <g
        transform={`translate(${(c0x - 52 - fall * 0.06).toFixed(1)} ${(-c0l + 2 + fallen(fall, 0.002)).toFixed(1)}) rotate(${(-Math.max(0, fall) * 0.12).toFixed(1)})`}
      >
        <path
          d="M-20 2 Q-22 -12 -12 -20 Q2 -26 14 -20 Q22 -12 20 2 Z"
          fill={ROCK}
          {...ink(OUT - 0.4)}
        />
        <path d="M-20 2 Q-22 -12 -12 -20 L-6 -18 Q-14 -8 -10 2 Z" fill={shade(ROCK, 0.3)} />
        <path
          d="M2 -23 Q16 -20 20 -8"
          stroke={tint(ROCK, 0.6)}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
        {crack >= 0 && (
          <path
            d="M-4 -24 L2 -14 L-3 -7 L4 2"
            stroke={INK}
            strokeWidth={2}
            fill="none"
            strokeLinejoin="round"
          />
        )}
      </g>
      <Splash x={c1x + 60} y={4} dt={since(p, 'launch')} size={1.2} />
    </g>
  );
}

// ---------- Level 23: rising water ----------
// flood (a wall of water pours in) → he climbs the root ladder → safe (up on the ledge).

const ROOT = '#7a5234';

/** The cliff and its high ledge running on to the right (painted), with grass and ferns on top. */
const RisingCliff = memo(function RisingCliff() {
  const id = useId();
  const { cliff, ledge } = RISING;
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-ledge} x2="0" y2={10}>
          <stop offset="0" stopColor={P.cliffLight} />
          <stop offset="0.25" stopColor={P.cliff} />
          <stop offset="1" stopColor={P.cliffDark} />
        </linearGradient>
      </defs>
      <path
        d={`M${cliff - 6} 8 Q${cliff - 2} ${-ledge * 0.5} ${cliff + 8} ${-ledge + 6} L${cliff + 14} ${-ledge} H2400 V8 Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M${cliff - 6} 8 Q${cliff - 2} ${-ledge * 0.5} ${cliff + 8} ${-ledge + 6} L${cliff + 30} ${-ledge + 10} Q${cliff + 18} ${-ledge * 0.5} ${cliff + 24} 8 Z`}
        fill={P.cliffDark}
        opacity={0.5}
      />
      <g stroke={P.cliffDark} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.4}>
        <path d={`M${cliff + 40} ${-ledge + 70} q160 14 320 -2 T${cliff + 900} ${-ledge + 66}`} />
        <path
          d={`M${cliff + 30} ${-ledge + 150} q180 12 360 -4 T${cliff + 1000} ${-ledge + 146}`}
        />
        <path d={`M${cliff + 50} ${-ledge + 230} q140 10 280 -2 T${cliff + 860} ${-ledge + 226}`} />
        <path
          d={`M${cliff + 120} ${-ledge + 90} l20 30 l-8 26 M${cliff + 420} ${-ledge + 170} l-16 28`}
        />
      </g>
      <g fill={P.moss}>
        <path d={`M${cliff + 60} ${-ledge + 150} q40 -16 80 0 q-40 10 -80 0 Z`} />
        <path d={`M${cliff + 300} ${-ledge + 70} q30 -12 60 0 q-30 8 -60 0 Z`} />
        <path d={`M${cliff + 200} -40 q50 -18 100 0 q-50 12 -100 0 Z`} />
      </g>
      {/* The grassy top of the ledge. */}
      <path
        d={`M${cliff + 8} ${-ledge + 4} Q${cliff + 10} ${-ledge - 8} ${cliff + 30} ${-ledge - 6} H2400 V${-ledge + 18} H${cliff + 40} Q${cliff + 20} ${-ledge + 22} ${cliff + 8} ${-ledge + 4} Z`}
        fill={P.groundTop}
      />
      <path
        d={`M${cliff + 40} ${-ledge + 14} H2400 V${-ledge + 22} H${cliff + 44} Z`}
        fill={P.grass}
      />
      <g fill={P.grass}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const x = cliff + 50 + i * 130 + noise(i, 3) * 40;
          return (
            <path
              key={i}
              d={`M${x - 8} ${-ledge - 4} Q${x - 4} ${-ledge - 18} ${x - 10} ${-ledge - 26} Q${x} ${-ledge - 16} ${x + 1} ${-ledge - 4} Q${x + 4} ${-ledge - 20} ${x + 10} ${-ledge - 22} Q${x + 6} ${-ledge - 12} ${x + 8} ${-ledge - 4} Z`}
            />
          );
        })}
      </g>
      <g>
        {[0, 1, 2, 3].map((i) => {
          const x = cliff + 110 + i * 210;
          return (
            <g key={i}>
              <path d={`M${x} ${-ledge - 4} V${-ledge - 14}`} stroke="#3f8a3a" strokeWidth={2} />
              <circle cx={x} cy={-ledge - 17} r={4.4} fill={P.flowers[i % 4]} />
              <circle cx={x} cy={-ledge - 17} r={1.6} fill="#ffc531" />
            </g>
          );
        })}
      </g>
    </g>
  );
});

/** The root ladder hanging down the cliff (lined: he climbs it), with leaves and vine ties. */
const RootLadder = memo(function RootLadder() {
  const { ledge, ladder } = RISING;
  const rails = [
    `M${ladder - 22} ${-ledge - 4} Q${ladder - 34} ${-ledge * 0.7} ${ladder - 20} ${-ledge * 0.45} Q${ladder - 10} ${-ledge * 0.22} ${ladder - 24} 2`,
    `M${ladder + 22} ${-ledge - 4} Q${ladder + 12} ${-ledge * 0.7} ${ladder + 24} ${-ledge * 0.45} Q${ladder + 32} ${-ledge * 0.22} ${ladder + 20} 2`,
  ];
  const rungs = Array.from({ length: 7 }, (_, i) => -20 - i * 42);
  return (
    <g>
      {rungs.map((y) => (
        <path
          key={y}
          d={`M${ladder - 26} ${y} Q${ladder} ${y + 4} ${ladder + 26} ${y}`}
          stroke={INK}
          strokeWidth={8.4}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {rungs.map((y) => (
        <path
          key={`f${y}`}
          d={`M${ladder - 26} ${y} Q${ladder} ${y + 4} ${ladder + 26} ${y}`}
          stroke={shade(ROOT, 0.1)}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {rails.map((d) => (
        <g key={d}>
          <path d={d} stroke={INK} strokeWidth={12} strokeLinecap="round" fill="none" />
          <path d={d} stroke={ROOT} strokeWidth={8} strokeLinecap="round" fill="none" />
          <path
            d={d}
            transform="translate(2 -1)"
            stroke={tint(ROOT, 0.4)}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ))}
      {/* Vines tying the rungs on, and leaves sprouting from the roots. */}
      {rungs.map((y, i) =>
        [-1, 1].map((side) => (
          <path
            key={`${y}${side}`}
            d={`M${ladder + side * 25} ${y - 6} l${-side * 4} 6 l${side * 5} 4`}
            stroke="#3f8f3a"
            strokeWidth={2.6}
            fill="none"
            strokeLinecap="round"
            opacity={i % 2 ? 1 : 0.85}
          />
        )),
      )}
      {[
        [ladder - 32, -ledge * 0.72, -140],
        [ladder + 30, -ledge * 0.5, -30],
        [ladder - 30, -ledge * 0.3, 200],
        [ladder + 28, -ledge * 0.15, 10],
      ].map(([x, y, rot], i) => (
        <path
          key={i}
          d="M0 0 Q7 -5.5 16 0 Q7 5.5 0 0 Z"
          transform={`translate(${x} ${y}) rotate(${rot})`}
          fill={i % 2 ? LEAF : tint(LEAF, 0.25)}
          {...ink(IN)}
        />
      ))}
    </g>
  );
});

export function RisingBack(p: ObstacleProps) {
  const { cliff } = RISING;
  const flood = since(p, 'flood');
  // The water climbs after him but stays below his feet, rising up the cliff once he's safe.
  const rise = lerp(80, -240, easeOut(clamp01(flood / 2600)));
  const level = flood < 0 ? 80 : Math.max(rise, -p.heroLift + 60);
  // A wall of water rushes in from the left as the flood begins, then sinks into the rising pool.
  const front = clamp01(flood / 650);
  const waveH = flood < 0 ? 0 : 150 * clamp01(flood / 200) * (1 - clamp01((flood - 600) / 400));
  return (
    <g>
      <RisingCliff />
      <RootLadder />
      {flood >= 0 && (
        <River a={-700} b={cliff + 4} level={level} t={p.t} flow={0.8} white={0.8} shore={false} />
      )}
      <CurlWave x={lerp(-760, -20, easeOut(front))} level={level + 6} h={waveH} t={p.t} />
      <Splash x={40} y={Math.min(level, 40)} dt={flood - 600} size={1.6} />
    </g>
  );
}

// ---------- Level 24 (boss): cross the river ----------
// build (logs roll in, a rope binds them, a sail pops up) → sail (push off)
// → wave (a giant wave lifts the raft) → splash → beach.

function raftPose(p: ObstacleProps) {
  const sailAt = eventTime(p.events, 'sail');
  const beachAt = eventTime(p.events, 'beach');
  const riding = p.t >= sailAt && p.t < beachAt;
  const x = p.t < sailAt ? RAFT.raftRest : Math.min(p.heroX, RAFT.beach);
  const deckY = riding ? -p.heroLift : -RAFT.deck + 3 * Math.sin(p.t / 300);
  const waveAt = eventTime(p.events, 'wave');
  const splashAt = eventTime(p.events, 'splash');
  let tilt = 0;
  if (p.t >= waveAt && p.t < splashAt)
    tilt = (p.t - waveAt) / (splashAt - waveAt) < 0.55 ? -14 : 12;
  return { x, deckY, tilt, riding };
}

/** The far beach (painted): sand rising out of the water, pebbles, a tuft of reeds. */
const Beach = memo(function Beach() {
  const id = useId();
  const b = RAFT.river[1];
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-8} x2="0" y2={120}>
          <stop offset="0" stopColor={P.sandLight} />
          <stop offset="0.35" stopColor={P.sand} />
          <stop offset="1" stopColor={P.sandDark} />
        </linearGradient>
      </defs>
      <path
        d={`M${b - 40} 6 Q${b + 20} -6 ${b + 80} -2 L2600 -2 V240 H${b - 60} Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M${b - 40} 6 Q${b + 20} -6 ${b + 80} -2`}
        stroke={mix(P.sand, DEEP, 0.3)}
        strokeWidth={4}
        fill="none"
      />
      <path
        d={`M${b - 54} 10 Q${b - 20} 2 ${b + 10} 4`}
        stroke={FOAM}
        strokeWidth={3}
        fill="none"
      />
      <g fill={P.sandDark}>
        {[30, 90, 160, 240, 330].map((dx, i) => (
          <ellipse key={dx} cx={b + dx} cy={14 + (i % 3) * 22} rx={5 + (i % 2) * 3} ry={2.6} />
        ))}
      </g>
      <g fill={P.reed}>
        {[120, 300].map((dx) => (
          <path
            key={dx}
            d={`M${b + dx - 10} -2 Q${b + dx - 8} -26 ${b + dx - 16} -40 Q${b + dx - 2} -26 ${b + dx} -2 Q${b + dx + 4} -30 ${b + dx + 14} -36 Q${b + dx + 6} -20 ${b + dx + 8} -2 Z`}
          />
        ))}
      </g>
    </g>
  );
});

/** The raft's three logs, side by side, with their cut ends and rope bindings (lined). */
function RaftLog({ i }: { i: number }) {
  return (
    <g>
      <rect
        x={-110}
        y={i * 12}
        width={220}
        height={20}
        rx={10}
        fill={i % 2 ? BARK : shade(BARK, 0.12)}
        {...ink(OUT - 0.6)}
      />
      <path
        d={`M-100 ${i * 12 + 5} H96`}
        stroke={tint(BARK, 0.4)}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <ellipse cx={110} cy={i * 12 + 10} rx={6} ry={10} fill={HEART} {...ink(IN)} />
      <ellipse
        cx={110}
        cy={i * 12 + 10}
        rx={2.6}
        ry={4.6}
        fill="none"
        stroke={shade(HEART, 0.35)}
        strokeWidth={1}
      />
    </g>
  );
}
const MemoRaftLog = memo(RaftLog);

/** The mast and sail, standing on the deck at x -80 (lined), with a pennant at the top. */
const RaftSail = memo(function RaftSail() {
  return (
    <g>
      <path d="M-80 0 V-190" stroke={INK} strokeWidth={9} strokeLinecap="round" {...NS} />
      <path d="M-80 0 V-190" stroke={WOOD} strokeWidth={5} strokeLinecap="round" {...NS} />
      <path d="M-74 -180 Q-2 -120 -12 -40 L-74 -40 Z" fill="#f6ead2" {...ink(OUT)} {...NS} />
      <path d="M-74 -180 Q-40 -150 -30 -110 L-74 -100 Z" fill={shade('#f6ead2', 0.12)} />
      <path d="M-74 -128 L-20 -96" stroke="#e8743b" strokeWidth={9} />
      <path d="M-74 -86 L-14 -60" stroke="#3aa0d8" strokeWidth={7} />
      <rect
        x={-60}
        y={-70}
        width={16}
        height={14}
        fill="#f2c94c"
        transform="rotate(-8 -52 -63)"
        {...ink(IN)}
        {...NS}
      />
      <path d="M-80 -190 L-50 -182 L-80 -172 Z" fill="#e8463a" {...ink(IN)} {...NS} />
    </g>
  );
});

export function RaftBack(p: ObstacleProps) {
  const [a, b] = RAFT.river;
  const waveAt = eventTime(p.events, 'wave');
  const splashAt = eventTime(p.events, 'splash');
  const raft = raftPose(p);
  const sail = easeOut(clamp01((since(p, 'build') - 1150) / 300));
  const inWave = p.t >= waveAt && p.t < splashAt + 700;
  const waveH = inWave ? Math.max(0, -raft.deckY - RAFT.deck) + 40 : 0;
  return (
    <g>
      <River a={a} b={b} level={10} t={p.t} flow={0.5} white={clamp01(since(p, 'sail') / 1000)} />
      <Bank x={a} dir={1} />
      <Beach />
      {inWave && p.t < splashAt && <CurlWave x={raft.x + 80} level={14} h={waveH} t={p.t} />}
      {/* The mast and sail stand behind him. */}
      <g
        transform={`translate(${raft.x.toFixed(1)} ${raft.deckY.toFixed(1)}) rotate(${raft.tilt})`}
      >
        {sail > 0.01 && (
          <g transform={`scale(1 ${sail.toFixed(3)})`}>
            <RaftSail />
          </g>
        )}
      </g>
      <Splash x={raft.x} y={6} dt={p.t - splashAt} size={1.8} />
    </g>
  );
}

export function RaftFront(p: ObstacleProps) {
  const build = since(p, 'build');
  const raft = raftPose(p);
  if (build < 0) return null;
  // Three logs roll in, then the rope wraps them, then the sail pops up.
  const logsIn = [0, 1, 2].map((i) => easeOut(clamp01((build - i * 220) / 400)));
  const rope = clamp01((build - 900) / 250);
  return (
    <g transform={`translate(${raft.x.toFixed(1)} ${raft.deckY.toFixed(1)}) rotate(${raft.tilt})`}>
      {logsIn.map((k, i) =>
        k > 0 ? (
          <g key={i} transform={`translate(${lerp(-400 + i * 60, 0, k).toFixed(1)} ${i * 2})`}>
            <MemoRaftLog i={i} />
          </g>
        ) : null,
      )}
      {rope > 0 &&
        [-70, 70].map((x) => (
          <g key={x}>
            <path
              d={`M${x} -2 V${(48 * rope).toFixed(1)}`}
              stroke={INK}
              strokeWidth={10}
              strokeLinecap="round"
            />
            <path
              d={`M${x} -2 V${(48 * rope).toFixed(1)}`}
              stroke={ROPE}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <path
              d={`M${x} -2 V${(48 * rope).toFixed(1)}`}
              stroke={shade(ROPE, 0.35)}
              strokeWidth={6}
              strokeDasharray="2 5"
            />
          </g>
        ))}
      {raft.riding && <SpeedLines x={-140} t={p.t} ys={[-30, -60, -90]} />}
    </g>
  );
}
