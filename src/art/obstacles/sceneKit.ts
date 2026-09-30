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
