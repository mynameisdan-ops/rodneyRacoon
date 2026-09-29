import type { DebrisPiece } from './fxData';
import { ink, shade, tint } from './style';

/*
 * Reusable effects for scenes and backdrops. Each one is a pure function of the
 * time since it started (`dt`, ms), so any frame can be drawn exactly.
 */

/** A soft light: stacked translucent circles (cheaper than a blur filter). */
export function Glow({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <g fill={color}>
      <circle cx={x} cy={y} r={r} opacity={0.07} />
      <circle cx={x} cy={y} r={r * 0.62} opacity={0.09} />
      <circle cx={x} cy={y} r={r * 0.34} opacity={0.14} />
    </g>
  );
}

/** Puffs of dust at (x, y) that grow and fade over `ms`. */
export function Dust({
  x,
  y,
  dt,
  ms,
  size = 1,
  color = '#b89a82',
}: {
  x: number;
  y: number;
  dt: number;
  ms: number;
  size?: number;
  color?: string;
}) {
  if (!(dt >= 0 && dt <= ms)) return null;
  const p = dt / ms;
  return (
    <g fill={color} opacity={0.75 * (1 - p)}>
      {[-1, -0.4, 0.3, 1].map((s, i) => (
        <circle
          key={i}
          cx={x + s * (30 + 70 * p) * size}
          cy={y - (10 + 50 * p) * size * (i % 2 ? 1.2 : 0.8)}
          r={(18 + 36 * p) * size}
        />
      ))}
    </g>
  );
}

/** A burst of sparks flying out from (x, y) in an upward fan. */
export function SparkBurst({
  x,
  y,
  dt,
  ms = 450,
  count = 10,
}: {
  x: number;
  y: number;
  dt: number;
  ms?: number;
  count?: number;
}) {
  if (!(dt >= 0 && dt < ms)) return null;
  return (
    <g stroke="#ffd35a" strokeWidth={4} strokeLinecap="round" opacity={1 - dt / ms}>
      {Array.from({ length: count }, (_, i) => {
        const a = -Math.PI * (0.08 + (0.84 * i) / (count - 1));
        const d = 16 + dt * 0.35;
        const px = x + Math.cos(a) * d;
        const py = y + Math.sin(a) * d + 0.0006 * dt * dt;
        return <path key={i} d={`M${px} ${py} l${Math.cos(a) * 12} ${Math.sin(a) * 12}`} />;
      })}
    </g>
  );
}

/** A steady trickle of sparks streaming back from (x, y), e.g. a wheel on a rail. */
export function SparkTrail({ x, y, t }: { x: number; y: number; t: number }) {
  return (
    <g stroke="#ffd35a" strokeWidth={3.5} strokeLinecap="round">
      {Array.from({ length: 8 }, (_, i) => {
        const ph = ((t + i * 37) % 260) / 260;
        const px = x - ph * (70 + (i % 3) * 20);
        const py = y - 50 * ph + 70 * ph * ph;
        return <path key={i} d={`M${px} ${py} l9 3`} opacity={1 - ph} />;
      })}
    </g>
  );
}

/** Horizontal speed lines streaming behind something moving right at x. */
export function SpeedLines({ x, t, ys }: { x: number; t: number; ys: readonly number[] }) {
  return (
    <g stroke="#fff3d6" strokeWidth={4} strokeLinecap="round" opacity={0.55}>
      {ys.map((y, i) => {
        const off = (t * 0.7 + i * 53) % 170;
        return <path key={i} d={`M${x - off} ${y} h${-50 - i * 12}`} />;
      })}
    </g>
  );
}

/** Rock chunks thrown right and up from x, falling with gravity. */
export function Debris({
  x,
  dt,
  pieces,
  color,
}: {
  x: number;
  dt: number;
  pieces: DebrisPiece[];
  color: string;
}) {
  if (!(dt >= 0)) return null;
  return (
    <g fill={color} {...ink(2.5)}>
      {pieces.map((pc, i) => {
        const px = x + pc.vx * dt;
        const py = pc.y0 + pc.vy * dt + 0.0016 * dt * dt;
        if (py > 220) return null;
        const s = pc.size;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${pc.spin * dt})`}>
            <path d={`M${-s} ${s * 0.4} L${-s * 0.5} ${-s} L${s} ${-s * 0.6} L${s * 0.7} ${s} Z`} />
            <path
              d={`M${-s * 0.5} ${-s} L${s} ${-s * 0.6} L${0} ${0} Z`}
              fill={tint(color, 0.25)}
              stroke="none"
            />
            <path
              d={`M${s * 0.7} ${s} L${-s} ${s * 0.4} L0 0 Z`}
              fill={shade(color, 0.3)}
              stroke="none"
            />
          </g>
        );
      })}
    </g>
  );
}
