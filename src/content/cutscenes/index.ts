import { CANYON_SCENES } from './canyon';
import { FOREST_SCENES } from './forest';
import { MINE_SCENES } from './mine';
import { MOUNTAIN_SCENES } from './mountain';
import { RIVER_SCENES } from './river';
import type { CutScene } from './types';

export type { CutScene } from './types';

/** The cut scene after each level, by level id (data only): one file per world. */
export const CUT_SCENES: Record<number, CutScene> = {
  ...MINE_SCENES,
  ...FOREST_SCENES,
  ...RIVER_SCENES,
  ...MOUNTAIN_SCENES,
  ...CANYON_SCENES,
};

export function getCutScene(levelId: number): CutScene | undefined {
  return CUT_SCENES[levelId];
}
