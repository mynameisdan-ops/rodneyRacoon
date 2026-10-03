import { CANYON_OBSTACLES } from './canyon';
import { FOREST_OBSTACLES } from './forest';
import { MINE_OBSTACLES } from './mine';
import { MOUNTAIN_OBSTACLES } from './mountain';
import { RIVER_OBSTACLES } from './river';
import type { ObstacleArt } from './types';

/** Every obstacle, by id: each world's folder lists its own in `index.ts`. */
const ALL = {
  ...MINE_OBSTACLES,
  ...FOREST_OBSTACLES,
  ...RIVER_OBSTACLES,
  ...MOUNTAIN_OBSTACLES,
  ...CANYON_OBSTACLES,
};

export type ObstacleId = keyof typeof ALL;
export const OBSTACLES: Readonly<Record<ObstacleId, ObstacleArt>> = ALL;
export const OBSTACLE_IDS = Object.keys(ALL) as ObstacleId[];
