/** The style-test hero's two builds (M7b): where his joints are, in his 100×170 view. */

export type Build = 'kid' | 'lean';

export interface BuildDef {
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

/** Hip + thigh + shin = 163, where the feet stand. */
export const BUILDS: Record<Build, BuildDef> = {
  kid: {
    head: { x: 55, y: 33, s: 0.86 },
    shoulderY: 64,
    hipY: 105,
    upper: 21,
    fore: 18,
    thigh: 27,
    shin: 31,
    chest: 30,
    waist: 27,
  },
  lean: {
    head: { x: 55, y: 27, s: 0.7 },
    shoulderY: 55,
    hipY: 99,
    upper: 24,
    fore: 21,
    thigh: 31,
    shin: 33,
    chest: 27,
    waist: 23,
  },
};

/**
 * How far above his feet his hands are in the swing pose, in view units. Scenes size him so this
 * is 175px, the reach their vines, ropes and ledges are laid out for.
 */
export function swingReach(build: Build): number {
  const b = BUILDS[build];
  return 163 - (b.shoulderY + 1 - b.upper - (b.fore + 3));
}

/**
 * The colors of his smear, back to front: the cape, then one wide streak of his tunic with his
 * pants and hair running through it (see `Smear`).
 */
export function smearBands(
  avatar: { hairColor: string; skin: string; shirt: string; pants: string; shoes: string },
  size: number,
  cape: string,
) {
  return [
    { color: cape, y: 0.62, w: size * 0.24 },
    { color: avatar.shirt, y: 0.52, w: size * 0.36 },
    { color: avatar.pants, y: 0.3, w: size * 0.13 },
    { color: avatar.hairColor, y: 0.86, w: size * 0.13 },
  ];
}
