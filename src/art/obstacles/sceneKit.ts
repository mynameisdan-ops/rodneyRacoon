import { eventTime, type ObstacleProps } from './types';

/** Small motion helpers shared by the obstacle drawings of every world. */

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Time since a prop state began (negative before it; -Infinity if it never comes). */
export const since = (p: ObstacleProps, state: string) => p.t - eventTime(p.events, state);

/** 0..1 progress of a motion that starts at `state` and lasts `ms`. */
export const progress = (p: ObstacleProps, state: string, ms: number) =>
  clamp01(since(p, state) / ms);

/** Distance fallen after `dt` ms under gravity `g` (px/ms²); 0 before it starts. */
export const fallen = (dt: number, g = 0.0025) => (dt > 0 ? g * dt * dt : 0);

/** A single bump 0 → 1 → 0 over `ms` (for squashes, flashes and recoils). */
export const bump = (dt: number, ms: number) =>
  dt >= 0 && dt <= ms ? Math.sin((Math.PI * dt) / ms) : 0;

export const easeOut = (t: number) => 1 - (1 - t) ** 2;
export const easeIn = (t: number) => t * t;

/** Deterministic 0..1 noise for the i-th item of a set. */
export const noise = (i: number, seed = 1) => {
  const h = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return h - Math.floor(h);
};

/** Rotation in degrees of a wheel or log of radius `r` that has rolled `dist` px. */
export const rollAngle = (dist: number, r: number) => (dist / r) * (180 / Math.PI);

/** A closed path through `pts`, rounded by curving through the midpoints (rocks, lumps). */
export function roundPath(pts: readonly (readonly [number, number])[]): string {
  const n = pts.length;
  const mid = (i: number) => {
    const [x1, y1] = pts[i % n]!;
    const [x2, y2] = pts[(i + 1) % n]!;
    return [(x1 + x2) / 2, (y1 + y2) / 2] as const;
  };
  const [sx, sy] = mid(n - 1);
  let d = `M${sx.toFixed(1)} ${sy.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [cx, cy] = pts[i]!;
    const [mx, my] = mid(i);
    d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return `${d} Z`;
}

/** Hero-passing times, cached per scene (its prop schedule is made once per timeline). */
const passTimes = new WeakMap<ObstacleProps['events'], Map<string, number>>();

/**
 * When his feet first reach local x at or after `from` (ms), looking up to 8 s ahead; Infinity
 * if they don't. Lets a prop wait for him (a stone sinks once he's left it), however long the
 * script holds him first. Cached, so it's cheap to ask every frame.
 */
export function heroPasses(p: ObstacleProps, x: number, from: number): number {
  if (!Number.isFinite(from)) return Infinity;
  let cache = passTimes.get(p.events);
  if (!cache) passTimes.set(p.events, (cache = new Map()));
  const key = `${x}|${from}`;
  let at = cache.get(key);
  if (at === undefined) {
    at = Infinity;
    for (let t = from; t < from + 8000; t += 10) {
      if (p.heroAt(t).x >= x) {
        at = t;
        break;
      }
    }
    cache.set(key, at);
  }
  return at;
}

/**
 * Many circles as one path, so a cloud of foam or bubbles that moves every frame is one element
 * to update rather than dozens. Overlapping ones share a single fill and outline.
 */
export function circles(list: readonly { x: number; y: number; r: number }[]): string {
  let d = '';
  for (const { x, y, r } of list) {
    d += `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0Z`;
  }
  return d;
}

/** Many ellipses as one path, each turned `rot` degrees (drops flying along their paths). */
export function ellipses(
  list: readonly { x: number; y: number; rx: number; ry: number; rot: number }[],
): string {
  let d = '';
  for (const { x, y, rx, ry, rot } of list) {
    const a = (rot * Math.PI) / 180;
    const dx = rx * Math.cos(a);
    const dy = rx * Math.sin(a);
    const arc = `${rx.toFixed(1)} ${ry.toFixed(1)} ${rot.toFixed(0)} 0 1`;
    d += `M${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}A${arc} ${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)}A${arc} ${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}Z`;
  }
  return d;
}
