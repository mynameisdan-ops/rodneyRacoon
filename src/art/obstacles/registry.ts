import {
  BeesArt,
  FenceStileArt,
  PuddleArt,
  RopeBridgeBack,
  RopeBridgeFront,
  SleepingBullArt,
  SteppingLogsArt,
  TallGrassBack,
  TallGrassFront,
  WindyHillArt,
} from './meadow';
import type { ObstacleArt, ObstacleId } from './types';

export const OBSTACLES: Record<ObstacleId, ObstacleArt> = {
  'tall-grass': { back: TallGrassBack, front: TallGrassFront, width: 360 },
  puddle: { back: PuddleArt, width: 240 },
  'fence-stile': { back: FenceStileArt, width: 200 },
  bees: { back: BeesArt, width: 280 },
  'stepping-logs': { back: SteppingLogsArt, width: 470 },
  'windy-hill': { back: WindyHillArt, width: 700 },
  'sleeping-bull': { back: SleepingBullArt, width: 260 },
  'rope-bridge': { back: RopeBridgeBack, front: RopeBridgeFront, width: 560 },
};
