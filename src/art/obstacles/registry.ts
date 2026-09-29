import {
  CartJumpBack,
  CartJumpFront,
  CartRaceBack,
  CartRaceFront,
  MineTrainBack,
  MineTrainFront,
  WallSmashBack,
  WallSmashFront,
} from './mineCarts';
import {
  BatStormBack,
  BatStormFront,
  CrystalCavernBack,
  RatSwarmBack,
  RunawayLiftBack,
  RunawayLiftFront,
} from './mineCaverns';
import {
  BAT_STORM,
  CART_JUMP,
  CART_RACE,
  CRYSTAL_CAVERN,
  MINE_TRAIN,
  RAT_SWARM,
  RUNAWAY_LIFT,
  WALL_SMASH,
} from './mineLayout';
import type { ObstacleArt, ObstacleId } from './types';

export const OBSTACLES: Record<ObstacleId, ObstacleArt> = {
  'cart-race': { back: CartRaceBack, front: CartRaceFront, width: CART_RACE.width },
  'cart-jump': { back: CartJumpBack, front: CartJumpFront, width: CART_JUMP.width },
  'wall-smash': { back: WallSmashBack, front: WallSmashFront, width: WALL_SMASH.width },
  'rat-swarm': { back: RatSwarmBack, width: RAT_SWARM.width },
  'crystal-cavern': { back: CrystalCavernBack, width: CRYSTAL_CAVERN.width },
  'bat-storm': { back: BatStormBack, front: BatStormFront, width: BAT_STORM.width },
  'runaway-lift': { back: RunawayLiftBack, front: RunawayLiftFront, width: RUNAWAY_LIFT.width },
  'mine-train': { back: MineTrainBack, front: MineTrainFront, width: MINE_TRAIN.width },
};
