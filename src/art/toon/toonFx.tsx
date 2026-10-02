import type { Emote } from '../hero/expressions';
import { noise } from '../obstacles/sceneKit';
import { INK, ink } from '../style';

/*
 * Saturday-morning cartoon effects (M7b). Like the other effects, each is a pure function of the
 * time since it began (`dt`, ms), so any frame of a scene draws exactly.
 */

const BURST = '#fff6c2';
const BURST_HOT = '#ffd23f';

/**
 * An anime impact: a jagged star bursts out and a ring of action lines shoots away from the
 * hit, all in about a third of a second. `size` 1 is about 260px across at its widest.
 */
export function ImpactBurst({
  x,
  y,
  dt,
  size = 1,
  ms = 380,
}: {
  x: number;
  y: number;
  dt: number;
  size?: number;
  ms?: number;
}) {
  if (!(dt >= 0 && dt < ms)) return null;
  const p = dt / ms;
  const grow = Math.min(1, dt / 70);
  const fade = p < 0.45 ? 1 : 1 - (p - 0.45) / 0.55;
  const points = 14;
  const star = (r: number, jag: number) => {
    let d = '';
    for (let i = 0; i < points * 2; i++) {
      const a = (i / (points * 2)) * Math.PI * 2 + 0.2;
      const rr = i % 2 === 0 ? r * (0.85 + 0.3 * noise(i, 7)) : r * jag;
      d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr * 0.8).toFixed(1)}`;
    }
    return d + 'Z';
  };
  const r = 120 * size * grow * (1 + 0.15 * p);
  return (
    <g transform={`translate(${x} ${y})`} opacity={fade}>
      <g stroke={INK} strokeWidth={5 * size} strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2 + noise(i, 3) * 0.3;
          const r0 = r * (0.9 + 0.5 * p);
          const r1 = r0 + 60 * size * (1 - p * 0.5);
          return (
            <path
              key={i}
              d={`M${Math.cos(a) * r0} ${Math.sin(a) * r0 * 0.8} L${Math.cos(a) * r1} ${Math.sin(a) * r1 * 0.8}`}
            />
          );
        })}
      </g>
      <path d={star(r, 0.55)} fill={BURST} {...ink(4 * size)} />
      <path d={star(r * 0.55, 0.6)} fill={BURST_HOT} />
      <circle r={r * 0.22} fill="#fff" />
    </g>
  );
}

/** A quick white flash over the whole screen when something big hits (one frame-ish, soft). */
export function ImpactFlash({ dt, w, h }: { dt: number; w: number; h: number }) {
  if (!(dt >= 0 && dt < 110)) return null;
  return <rect width={w} height={h} fill="#fffbe8" opacity={0.4 * (1 - dt / 110)} />;
}

/**
 * Anime focus lines: thin wedges rushing in from the edges of the screen toward the hero, with
 * a clear space around him. They are redrawn every 70ms so they flicker like hand-drawn frames.
 * `strength` 0..1 fades them in and out.
 */
export function FocusLines({
  cx,
  cy,
  t,
  strength,
  w = 1280,
  h = 800,
}: {
  cx: number;
  cy: number;
  t: number;
  strength: number;
  w?: number;
  h?: number;
}) {
  if (strength <= 0) return null;
  const frame = Math.floor(t / 70);
  const reach = Math.hypot(w, h);
  const lines = Array.from({ length: 46 }, (_, i) => {
    const a = (i / 46) * Math.PI * 2 + noise(i + frame * 7, 5) * 0.12;
    const inner = 190 + 120 * noise(i + frame * 3, 9);
    const spread = 0.012 + 0.018 * noise(i, 11);
    const ax = Math.cos(a - spread);
    const ay = Math.sin(a - spread);
    const bx = Math.cos(a + spread);
    const by = Math.sin(a + spread);
    return `M${cx + Math.cos(a) * inner} ${cy + Math.sin(a) * inner} L${cx + ax * reach} ${cy + ay * reach} L${cx + bx * reach} ${cy + by * reach} Z`;
  });
  return (
    <g opacity={strength}>
      <rect width={w} height={h} fill="#fff4d6" opacity={0.28} />
      <path d={lines.join('')} fill="#fffdf3" opacity={0.85} />
    </g>
  );
}

/** Speed lines streaming behind a fast-moving hero (screen x of his back, his height). */
export function DashLines({
  x,
  feetY,
  height,
  t,
  dir,
}: {
  x: number;
  feetY: number;
  height: number;
  t: number;
  dir: 1 | -1;
}) {
  return (
    <g stroke="#fffdf3" strokeLinecap="round" opacity={0.8}>
      {[0.2, 0.38, 0.55, 0.72, 0.86].map((f, i) => {
        const off = (t * 0.9 + i * 61) % 140;
        const len = 50 + noise(i, 4) * 70;
        const y = feetY - height * f;
        const x0 = x - dir * (20 + off);
        return <path key={i} d={`M${x0} ${y} h${-dir * len}`} strokeWidth={i % 2 ? 3 : 5} />;
      })}
    </g>
  );
}

/** A cartoon sign over his head at (x, y): it pops in with an overshoot and fades at the end. */
export function EmoteSign({ emote, x, y, dt }: { emote: Emote; x: number; y: number; dt: number }) {
  const pop =
    dt < 160 ? 1.25 * Math.sin((dt / 160) * (Math.PI / 2)) : dt < 260 ? 1.25 - (dt - 160) / 400 : 1;
  const fade = dt > 760 ? Math.max(0, 1 - (dt - 760) / 240) : 1;
  switch (emote) {
    case 'alert':
      return (
        <g transform={`translate(${x + 30} ${y - 10}) scale(${pop}) rotate(12)`} opacity={fade}>
          <path d="M-6 -46 Q0 -52 8 -46 L4 -12 Q1 -8 -2 -12 Z" fill="#ff4d3d" {...ink(4)} />
          <circle cx={1} cy={2} r={6.5} fill="#ff4d3d" {...ink(4)} />
          <path d="M-14 -36 l-12 -8 M-16 -20 l-14 0 M18 -40 l12 -10" {...ink(4)} />
        </g>
      );
    case 'sweat': {
      const slide = Math.min(1, dt / 700) * 14;
      return (
        <g transform={`translate(${x - 36} ${y + 34 + slide}) scale(${pop})`} opacity={fade}>
          <path
            d="M0 -16 Q10 -2 8 6 Q4 13 -2 11 Q-8 8 -7 1 Q-6 -6 0 -16 Z"
            fill="#8fd3ff"
            {...ink(3)}
          />
          <path
            d="M-3 0 Q-3 5 1 6"
            stroke="#fff"
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    }
    case 'sparkle':
      return (
        <g opacity={fade}>
          {[
            [-58, 16, 1.5],
            [62, 0, 1.25],
            [6, -40, 1],
            [-30, -30, 0.7],
          ].map(([sx, sy, s], i) => {
            const tw = 0.6 + 0.4 * Math.sin(dt / 90 + i * 2);
            return (
              <path
                key={i}
                transform={`translate(${x + sx!} ${y + sy!}) scale(${s! * pop * tw})`}
                d="M0 -18 Q3 -3 18 0 Q3 3 0 18 Q-3 3 -18 0 Q-3 -3 0 -18 Z"
                fill="#fff27a"
                {...ink(3)}
              />
            );
          })}
        </g>
      );
  }
}

/**
 * A motion arc: a tapered streak along the path he has just traveled, widest at him and fading
 * to a point (`points` run from where he is now back in time).
 */
export function MotionTrail({
  points,
  width,
}: {
  points: readonly { x: number; y: number }[];
  width: number;
}) {
  const n = points.length;
  if (n < 3) return null;
  const streak = (w: number) => {
    const left: string[] = [];
    const right: string[] = [];
    points.forEach((pt, i) => {
      const a = points[Math.max(0, i - 1)]!;
      const b = points[Math.min(n - 1, i + 1)]!;
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const nx = -(b.y - a.y) / len;
      const ny = (b.x - a.x) / len;
      const half = (w / 2) * (1 - i / (n - 1));
      left.push(`${(pt.x + nx * half).toFixed(1)} ${(pt.y + ny * half).toFixed(1)}`);
      right.push(`${(pt.x - nx * half).toFixed(1)} ${(pt.y - ny * half).toFixed(1)}`);
    });
    return `M${left.join(' L')} L${right.reverse().join(' L')} Z`;
  };
  return (
    <g>
      <path d={streak(width)} fill="#fffdf3" opacity={0.45} />
      <path d={streak(width * 0.45)} fill="#fff" opacity={0.7} />
    </g>
  );
}
