import { OBSTACLES } from '../obstacles/registry';
import type { ObstacleArt, ObstacleId } from '../obstacles/types';
import { PaintedVineSwingBack } from './paintedVineSwing';

/** Obstacles repainted so far for the M7b style test (the rest draw their flat versions). */
export const PAINTED_OBSTACLES: Partial<Record<ObstacleId, ObstacleArt>> = {
  'vine-swing': { ...OBSTACLES['vine-swing'], back: PaintedVineSwingBack },
};
