import { PAINTED_CANYON } from '../../worlds/canyonPalette';

/** Colors and helpers shared by the World 5 (Canyon to Home) obstacles. */

export const P = PAINTED_CANYON;

/** Lined sandstone: rocks, the arch, ledges he lands on. */
export const ROCK = '#d8784e';
export const ROCK_LIT = '#f4a46c';
export const ROCK_SHADE = '#9a4a44';
/** Lined sand that acts (bursts, the sandstorm's gusts, the twister). */
export const SAND = '#f2cc90';
export const SAND_SHADE = '#d49a68';
/** The flash flood's muddy water and its foam. */
export const MUD = '#8e5a3a';
export const MUD_LIGHT = '#c48a58';
export const MUD_DEEP = '#5e3626';
export const FOAM = '#fbefdc';
export const WOOD = '#b07a44';
export const WOOD_DARK = '#7a5032';
export const IRON = '#4a4f5a';
export const RED = '#d8402e';

/** Keeps a stroke's width in screen px inside a scaled group (so scaled art can be memoized). */
export const NS = { vectorEffect: 'non-scaling-stroke' } as const;
