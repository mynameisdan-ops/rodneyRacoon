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
] as const;
export type HeroPose = (typeof HERO_POSES)[number];
