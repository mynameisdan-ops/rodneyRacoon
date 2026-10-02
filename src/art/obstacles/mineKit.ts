import { PROP_IN, PROP_OUT } from '../style';
import { CART_FLOOR } from './mineLayout';
import { eventTime, type ObstacleProps } from './types';

/** Colors, sizes and motion helpers shared by the World 1 (mine) obstacles. */

export const RAIL_TOP = -9;
/** The style kit's line weights for the props he touches: the silhouette, and inside it. */
export const OUT = PROP_OUT;
export const IN = PROP_IN;
export const WOOD = '#a26a3c';
export const IRON = '#5a6270';
export const ROCK = '#8c7468';
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
