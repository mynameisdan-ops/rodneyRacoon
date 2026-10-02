/**
 * Colors for each world's backdrop. A theme's `kind` picks which set of layers
 * WorldBackdrop draws (the layer drawings live in mine.tsx, forest.tsx, river.tsx,
 * mountain.tsx and canyon.tsx). Unknown worlds fall back to the meadow.
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

export interface OutdoorTheme extends BaseTheme {
  kind: 'outdoor';
  cloud: string;
  far: string;
  mid: string;
  trunk: string;
  leaves: string[];
  flowers: string[];
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

export interface RiverTheme extends BaseTheme {
  kind: 'river';
  cloud: string;
  hills: string;
  hillsNear: string;
  water: string;
  waterDeep: string;
  foam: string;
  rock: string;
  reed: string;
  leaves: string[];
  flowers: string[];
}

export interface MountainTheme extends BaseTheme {
  kind: 'mountain';
  cloud: string;
  peakFar: string;
  peakMid: string;
  snow: string;
  rock: string;
  pine: string;
}

export interface CanyonTheme extends BaseTheme {
  kind: 'canyon';
  sun: string;
  mesaFar: string;
  mesaMid: string;
  cliff: string;
  strata: string;
  cactus: string;
  scrub: string;
  rock: string;
}

export type WorldTheme =
  OutdoorTheme | MineTheme | ForestTheme | RiverTheme | MountainTheme | CanyonTheme;

export const MEADOW: OutdoorTheme = {
  kind: 'outdoor',
  skyTop: '#8fd3ff',
  skyBottom: '#e3f5ff',
  cloud: '#ffffff',
  far: '#9fd3a8',
  mid: '#78c47f',
  ground: '#62b565',
  groundLight: '#7fcb77',
  path: '#e4c48a',
  pathEdge: '#c9a263',
  trunk: '#8a5a33',
  leaves: ['#3f9d4c', '#4fae55', '#5cbf5f'],
  flowers: ['#ffffff', '#ffd23f', '#ff70a6', '#ff9f43', '#b388ff'],
};

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
  cloud: '#ffffff',
  hills: '#8cc9a0',
  hillsNear: '#6fb585',
  water: '#3aa0d8',
  waterDeep: '#2376b0',
  foam: '#e8f8ff',
  rock: '#8a8d96',
  reed: '#5f9a3a',
  leaves: ['#3f9d4c', '#4fae55'],
  flowers: ['#ffffff', '#ffd23f', '#ff70a6'],
};

export const MOUNTAIN: MountainTheme = {
  kind: 'mountain',
  skyTop: '#7fa8d8',
  skyBottom: '#e8f0fa',
  ground: '#e4edf7',
  groundLight: '#ffffff',
  path: '#9a8f86',
  pathEdge: '#6b625c',
  cloud: '#f7fbff',
  peakFar: '#a9bcd8',
  peakMid: '#7d8ea8',
  snow: '#ffffff',
  rock: '#7e7a82',
  pine: '#2f5e4a',
};

export const CANYON: CanyonTheme = {
  kind: 'canyon',
  skyTop: '#f08a4b',
  skyBottom: '#ffe0a8',
  ground: '#e0a765',
  groundLight: '#f0c585',
  path: '#f3d9a6',
  pathEdge: '#c29056',
  sun: '#fff1b8',
  mesaFar: '#d88a7a',
  mesaMid: '#b8553a',
  cliff: '#c8663f',
  strata: '#a24a33',
  cactus: '#4f9a52',
  scrub: '#8a9a4a',
  rock: '#a86a48',
};

const THEMES: Record<number, WorldTheme> = { 1: MINE, 2: FOREST, 3: RIVER, 4: MOUNTAIN, 5: CANYON };

export function getTheme(worldId: number): WorldTheme {
  return THEMES[worldId] ?? MEADOW;
}
