import { mix, shade } from '../style';
import type { AvatarConfig } from './avatar';

/** Where the hero's joints are, in his 100×170 view (feet at y 163). */
export interface BodyDef {
  /** Where the head's local origin (the middle of the skull) sits, and its scale. */
  head: { x: number; y: number; s: number };
  shoulderY: number;
  hipY: number;
  upper: number;
  fore: number;
  thigh: number;
  shin: number;
  chest: number;
  waist: number;
}

/**
 * The hero's build (M7b): about 4.3 heads tall, a lean Saturday-morning adventurer.
 * Hip + thigh + shin = 163, where his feet stand.
 */
export const BODY: BodyDef = {
  head: { x: 55, y: 27, s: 0.7 },
  shoulderY: 55,
  hipY: 99,
  upper: 24,
  fore: 21,
  thigh: 31,
  shin: 33,
  chest: 27,
  waist: 23,
};

/** The middle of the body, left to right. */
export const CX = 54;

/**
 * How far above his feet his hands are in the swing pose, in view units. Scenes size him so this
 * is 175px, the reach their vines, ropes and ledges are laid out for.
 */
export const SWING_REACH = 163 - (BODY.shoulderY + 1 - BODY.upper - (BODY.fore + 3));

/** His height in cut scenes, px (his hands reach 175px up in the swing pose). */
export const SCENE_SIZE = (175 * 170) / SWING_REACH;

/** His cape when he wears none from the shop: a deep shade of his shirt. */
export const capeColor = (shirt: string) => mix(shade(shirt, 0.45), '#2a1f4a', 0.35);

/**
 * The colors of his smear, back to front: the cape, then one wide streak of his tunic with his
 * pants and hair running through it (see `Smear`).
 */
export function smearBands(avatar: AvatarConfig, size: number, cape: string) {
  return [
    { color: cape, y: 0.62, w: size * 0.24 },
    { color: avatar.shirt, y: 0.52, w: size * 0.36 },
    { color: avatar.pants, y: 0.3, w: size * 0.13 },
    { color: avatar.hairColor, y: 0.86, w: size * 0.13 },
  ];
}
