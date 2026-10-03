export const HERO_POSES = [
  'idle',
  'walk',
  'run',
  'jump',
  'leap',
  'climb',
  'cheer',
  'stumble',
  'brace',
  'ride',
  'slide',
  'swing',
  'fall',
  /** The wind-up before a jump: knees bent, arms swung back. */
  'crouch',
] as const;
export type HeroPose = (typeof HERO_POSES)[number];
