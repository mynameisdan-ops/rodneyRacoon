/**
 * Colors for each world's backdrop. A theme's `kind` picks which set of layers
 * WorldBackdrop draws. Worlds without a theme yet fall back to the meadow (M5 adds more).
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

export interface MineTheme extends BaseTheme {
  kind: 'mine';
  /** Rock from farthest (hazy) to nearest. */
  rockFar: string;
  rockMid: string;
  rockNear: string;
  timber: string;
  rail: string;
  lantern: string;
  crystals: string[];
}

export type WorldTheme = OutdoorTheme | MineTheme;

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
  rockFar: '#3b2735',
  rockMid: '#2e1f2a',
  rockNear: '#5a3d30',
  timber: '#8a5a30',
  rail: '#a9b4c0',
  lantern: '#ffc64d',
  crystals: ['#43e0cf', '#a07bff', '#ff6fb5'],
};

const THEMES: Record<number, WorldTheme> = { 1: MINE };

export function getTheme(worldId: number): WorldTheme {
  return THEMES[worldId] ?? MEADOW;
}
