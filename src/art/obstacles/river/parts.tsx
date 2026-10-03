import { ink, shade, tint } from '../../style';
import { lerp, noise } from '../sceneKit';
import { WATER, DEEP, FOAM, BANK } from './kit';

/**
 * Pieces shared by the World 3 (Rushing River) obstacles.
 * Local coordinates, with the ground line at y = 0.
 */

/** A stretch of river from a to b whose surface is at `level` (y), with moving ripples. */
export function River({
  a,
  b,
  level,
  t,
  flow = 0.35,
  white = 0,
}: {
  a: number;
  b: number;
  level: number;
  t: number;
  flow?: number;
  /** 0..1: how much whitewater. */
  white?: number;
}) {
  const n = Math.max(4, Math.round((b - a) / 90));
  let top = `M${a} ${level}`;
  for (let i = 1; i <= n; i++) {
    const x = lerp(a, b, i / n);
    const amp = 5 + 8 * white;
    top += ` Q${x - (b - a) / n / 2} ${level + amp * Math.sin(t / 160 + i * 1.7)} ${x} ${level}`;
  }
  const ripples = Math.round((b - a) / 110);
  return (
    <g>
      <path d={`${top} L${b} 240 L${a} 240 Z`} fill={WATER} {...ink(3)} />
      <path d={`M${a} ${level + 40} H${b} V240 H${a} Z`} fill={DEEP} opacity={0.5} />
      <g stroke={FOAM} strokeWidth={4} strokeLinecap="round" opacity={0.8}>
        {Array.from({ length: ripples }, (_, i) => {
          const x = a + 20 + ((t * flow + i * 110 * 1.37) % (b - a - 60));
          return <path key={i} d={`M${x} ${level + 18 + (i % 3) * 22} h ${24 + (i % 2) * 18}`} />;
        })}
      </g>
      {white > 0 && (
        <g fill={FOAM} opacity={0.9 * white} {...ink(1.5)}>
          {Array.from({ length: n * 2 }, (_, i) => {
            const x = a + ((i * 57 + t * flow * 1.3) % (b - a));
            return (
              <circle
                key={i}
                cx={x}
                cy={level - 2 + 6 * Math.sin(t / 90 + i)}
                r={6 + (i % 3) * 3}
              />
            );
          })}
        </g>
      )}
    </g>
  );
}

/** Spray drops bursting up from (x, y). */
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
  return (
    <g fill={FOAM} {...ink(2)} opacity={1 - dt / 900}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = -Math.PI * (0.15 + (0.7 * i) / 8);
        const v = (0.45 + 0.3 * noise(i, 2)) * size;
        const px = x + Math.cos(a) * v * dt;
        const py = y + Math.sin(a) * v * dt + 0.0012 * dt * dt;
        return <circle key={i} cx={px} cy={py} r={(7 + 5 * noise(i, 4)) * size} />;
      })}
    </g>
  );
}

export function Bank({ x, dir, depth = 200 }: { x: number; dir: 1 | -1; depth?: number }) {
  // The river's edge: a grassy lip dropping to the water, on the left (dir 1) or right (-1).
  return (
    <path
      d={`M${x - dir * 40} -2 L${x} -2 Q${x + dir * 14} 20 ${x + dir * 6} ${depth} L${x - dir * 40} ${depth} Z`}
      fill={shade(BANK, 0.2)}
      {...ink(3)}
    />
  );
}

/** A curling wave, `h` tall, whose front is at x, sitting on `level`. */
export function CurlWave({ x, level, h, t }: { x: number; level: number; h: number; t: number }) {
  if (h < 4) return null;
  const k = h / 220;
  return (
    <g transform={`translate(${x} ${level}) scale(${k})`}>
      <path
        d="M-420 30 Q-300 20 -200 -40 Q-110 -150 -10 -210 Q60 -236 90 -180 Q60 -196 40 -170 Q20 -140 50 -120 Q10 -100 -10 -60 Q-20 -10 0 30 Z"
        fill={WATER}
        {...ink(4 / Math.max(k, 0.3))}
      />
      <path
        d="M-380 30 Q-260 10 -150 -60 Q-90 -110 -60 -40 Q-80 0 -60 30 Z"
        fill={DEEP}
        opacity={0.5}
      />
      <path
        d="M-160 -80 Q-80 -170 20 -196"
        stroke={tint(WATER, 0.5)}
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
      />
      <g fill={FOAM} {...ink(2.5)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={70 - i * 22 + 4 * Math.sin(t / 80 + i)}
            cy={-190 + i * 6}
            r={16 - i * 2}
          />
        ))}
        <circle cx={10} cy={20} r={14} />
        <circle cx={-30} cy={26} r={10} />
      </g>
    </g>
  );
}
