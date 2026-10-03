import { memo, useId } from 'react';
import { ink, mix, PROP_IN as IN, PROP_OUT as OUT, shade } from '../../style';
import { PAINTED_RIVER } from '../../worlds/riverPalette';
import { bump, circles, clamp01, ellipses, noise } from '../sceneKit';
import { WATER, LIGHT, DEEP, FOAM, SPRAY, SPRAY_SHADE, NS, CROWN, WAVE } from './kit';

/**
 * Pieces shared by the World 3 (Rushing River) obstacles.
 * Local coordinates, with the ground line at y = 0.
 */

/** The far side of a river channel (painted): wet sand dipping down to the water at both ends. */
const P = PAINTED_RIVER;

export const FarShore = memo(function FarShore({
  a,
  b,
  level,
}: {
  a: number;
  b: number;
  level: number;
}) {
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
export const WaterGradient = memo(function WaterGradient({
  id,
  level,
}: {
  id: string;
  level: number;
}) {
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
export function River({
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
export const Bank = memo(function Bank({
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

/** A crown of water 92 wide, rising from (0, 6): rounded prongs with drops thrown off them. */
export const CrownArt = memo(function CrownArt() {
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
export function Splash({
  x,
  y,
  dt,
  size = 1,
}: {
  x: number;
  y: number;
  dt: number;
  size?: number;
}) {
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

/** The wave's body, 220 tall, drawn once and scaled (its outline stays the same width). */
export const WaveBody = memo(function WaveBody() {
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
export function CurlWave({ x, level, h, t }: { x: number; level: number; h: number; t: number }) {
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
