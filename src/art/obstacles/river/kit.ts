import { PAINTED_RIVER } from '../../worlds/riverPalette';

/** Colors and helpers shared by the World 3 (Rushing River) obstacles. */

const P = PAINTED_RIVER;

export const WATER = P.water;
export const LIGHT = P.waterLight;
export const DEEP = P.waterDeep;
export const FOAM = P.foam;
export const SPRAY = '#effbff';
export const SPRAY_SHADE = '#a4dbf2';
export const ROCK = '#a3abbd';
export const MOSS = '#76ba4e';
export const BARK = '#7c5434';
export const HEART = '#ebc184';
export const WOOD = '#c48c52';
export const ROPE = '#dcbc7c';
export const LEAF = '#4fa64a';

/** Keeps a stroke's width in screen px inside a scaled group (so scaled art can be memoized). */
export const NS = { vectorEffect: 'non-scaling-stroke' } as const;

export const CROWN =
  'M-46 6 Q-44 -10 -38 -30 Q-35 -39 -31 -31 Q-27 -18 -20 -16 Q-17 -40 -9 -54 Q-4 -61 -1 -53 Q2 -36 4 -22 Q10 -44 18 -52 Q23 -57 25 -49 Q24 -30 27 -18 Q32 -26 38 -36 Q42 -41 44 -33 Q45 -14 46 6';

export const WAVE =
  'M-420 30 Q-300 20 -200 -40 Q-110 -150 -10 -210 Q60 -236 90 -180 Q60 -196 40 -170 Q20 -140 50 -120 Q10 -100 -10 -60 Q-20 -10 0 30';
