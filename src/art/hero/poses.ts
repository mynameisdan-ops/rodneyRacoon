export const HERO_POSES = ['idle', 'walk', 'jump', 'climb', 'cheer', 'stumble'] as const;
export type HeroPose = (typeof HERO_POSES)[number];
