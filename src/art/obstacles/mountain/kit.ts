import { PAINTED_MOUNTAIN } from '../../worlds/mountainPalette';

/** Colors and helpers shared by the World 4 (Misty Mountains) obstacles. */

export const P = PAINTED_MOUNTAIN;

/** Lined snow (snow that acts: avalanches, bursts, caps on the props he touches). */
export const SNOW = '#f6faff';
export const SNOW_SHADE = '#c3d4f0';
export const SNOW_DEEP = '#93acd8';
/** Lined rock: falling rocks, ledge chunks. */
export const STONE = '#a29eba';
/** Lined ice: bridges, icicles, the frozen waterfall. */
export const ICE = '#a6e0f6';
export const ICE_LIGHT = '#e6f9ff';
export const ICE_DEEP = '#4f9fd2';
export const BARK = '#7a5236';
export const PINE = '#2f735a';
/** Painted cliffs: lit and shadowed faces, as in the backdrop's peaks. */
export const CLIFF = '#9ea3cc';
export const CLIFF_SHADE = '#6a73a8';
export const CLIFF_DARK = '#454c80';

/** Keeps a stroke's width in screen px inside a scaled group (so scaled art can be memoized). */
export const NS = { vectorEffect: 'non-scaling-stroke' } as const;
