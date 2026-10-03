import { eventTime, type ObstacleProps } from '../types';
import { CART_FLOOR } from './layout';

/** Colors, sizes and motion helpers shared by the World 1 (mine) obstacles. */

export const RAIL_TOP = -9;
export const WOOD = '#7a5234';
export const IRON = '#5d6570';
export const ROCK = '#80705f';
export const STEEL = '#a9b4c0';
export const CRYSTALS = ['#43e0cf', '#a07bff', '#ff6fb5'] as const;
/** The i-th crystal color, cycling through the palette. */
export const crystal = (i: number): string => CRYSTALS[i % CRYSTALS.length] ?? CRYSTALS[0];

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Where a cart is when the hero rides it: parked at `rest` until `board`, then
 * under his feet, stopped at `stop`. After `off` it sits on the rails.
 */
export function cartRide(
  p: ObstacleProps,
  rest: number,
  stop: number,
  boardState: string,
  offState: string,
) {
  const board = eventTime(p.events, boardState);
  const off = eventTime(p.events, offState);
  const riding = p.t >= board && p.t < off;
  const x = p.t < board ? rest : clamp(p.heroX, rest, stop);
  const lift = riding ? Math.max(0, p.heroLift - CART_FLOOR) : 0;
  const rolling = riding && x > rest + 2 && x < stop - 2 && lift < 1;
  return { x, lift, riding, rolling };
}

/** Nose-up on the way up, nose-down on the way down: for a cart flying from `flyAt` to `landAt`. */
export function flightTilt(t: number, flyAt: number, landAt: number) {
  if (!(t >= flyAt && t < landAt + 300)) return 0;
  if (t >= landAt) return 5 * Math.sin((Math.PI * (t - landAt)) / 300);
  return -16 + 26 * ((t - flyAt) / (landAt - flyAt));
}

export const BOULDER_R = 62;
/** Heights of the speed lines behind a racing cart. */
export const SPEED_YS = [-60, -86, -100, -48];
/** The dark of a hole in the rock. */
export const HOLE = '#140b12';
