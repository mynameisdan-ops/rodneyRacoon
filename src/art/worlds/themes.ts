/** Colors for each world's backdrop. Worlds without a theme yet fall back to the meadow (M5 adds more). */
export interface WorldTheme {
  skyTop: string;
  skyBottom: string;
  cloud: string;
  far: string;
  mid: string;
  ground: string;
  groundLight: string;
  path: string;
  pathEdge: string;
  trunk: string;
  leaves: string[];
  flowers: string[];
}

const MEADOW: WorldTheme = {
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

const THEMES: Record<number, WorldTheme> = { 1: MEADOW };

export function getTheme(worldId: number): WorldTheme {
  return THEMES[worldId] ?? MEADOW;
}
