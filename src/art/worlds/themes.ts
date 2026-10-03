/**
 * Colors for each world's backdrop. Each kind of theme has its own layer drawings
 * (mine.tsx, forest.tsx, river.tsx, mountain.tsx, canyon.tsx); `registry.ts` pairs a
 * world with its theme and layers, so a new world can reuse a kind with new colors.
 * The painted worlds (M7b) take most colors from their palettes (`*Palette.ts`).
 */
interface BaseTheme {
  /** Top and bottom of the background gradient (sky, or the cave's back wall). */
  skyTop: string;
  skyBottom: string;
  ground: string;
  groundLight: string;
  /** The trail on the map, and the walking path. */
  path: string;
  pathEdge: string;
}

/** The mine is painted (M7b): its layers take their colors from `PAINTED_MINE` (minePalette.ts). */
export interface MineTheme extends BaseTheme {
  kind: 'mine';
}

export interface ForestTheme extends BaseTheme {
  kind: 'forest';
  /** Misty tree rows, farthest first. */
  mistFar: string;
  mistNear: string;
  canopy: string;
  trunk: string;
  leaves: string[];
  fern: string;
  mushroom: string;
  firefly: string;
  light: string;
}

/** The river is painted (M7b): its layers take their colors from `PAINTED_RIVER` (riverPalette.ts). */
export interface RiverTheme extends BaseTheme {
  kind: 'river';
}

/** The mountains are painted (M7b): their layers take their colors from `PAINTED_MOUNTAIN`. */
export interface MountainTheme extends BaseTheme {
  kind: 'mountain';
}

/** The canyon is painted (M7b): its layers take their colors from `PAINTED_CANYON`. */
export interface CanyonTheme extends BaseTheme {
  kind: 'canyon';
}

export type WorldTheme = MineTheme | ForestTheme | RiverTheme | MountainTheme | CanyonTheme;

export const MINE: MineTheme = {
  kind: 'mine',
  skyTop: '#120c1a',
  skyBottom: '#5c3826',
  ground: '#4a3226',
  groundLight: '#7a5538',
  path: '#c9a26b',
  pathEdge: '#6b4524',
};

export const FOREST: ForestTheme = {
  kind: 'forest',
  skyTop: '#2c5a5e',
  skyBottom: '#a8d8b0',
  ground: '#3f6b35',
  groundLight: '#5e8f45',
  path: '#b98f5a',
  pathEdge: '#7a5634',
  mistFar: '#7fb3a0',
  mistNear: '#5a9280',
  canopy: '#1f4a34',
  trunk: '#6b4a32',
  leaves: ['#2f7a45', '#3d8c4f', '#27663c'],
  fern: '#4c9a4a',
  mushroom: '#e0503c',
  firefly: '#f4ff8a',
  light: '#fff6c8',
};

export const RIVER: RiverTheme = {
  kind: 'river',
  skyTop: '#5cb8f0',
  skyBottom: '#d8f2ff',
  ground: '#6cb85a',
  groundLight: '#8fd06e',
  path: '#e6cf98',
  pathEdge: '#b8995e',
};

export const MOUNTAIN: MountainTheme = {
  kind: 'mountain',
  skyTop: '#2f6fc4',
  skyBottom: '#eef7ff',
  ground: '#e7f0fb',
  groundLight: '#f8fbff',
  path: '#aa9a8b',
  pathEdge: '#7a6b61',
};

export const CANYON: CanyonTheme = {
  kind: 'canyon',
  skyTop: '#4e6cc4',
  skyBottom: '#ffe8b8',
  ground: '#eab878',
  groundLight: '#f6d29a',
  path: '#d8a46c',
  pathEdge: '#a8724a',
};
