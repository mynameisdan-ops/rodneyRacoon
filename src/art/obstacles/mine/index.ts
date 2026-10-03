import type { ObstacleArt } from '../types';
import { BatStormBack, BatStormFront } from './batStorm';
import { CartJumpBack, CartJumpFront } from './cartJump';
import { CartRaceBack, CartRaceFront } from './cartRace';
import { CrystalCavernBack } from './crystalCavern';
import {
  BAT_STORM,
  CART_JUMP,
  CART_RACE,
  CRYSTAL_CAVERN,
  MINE_TRAIN,
  RAT_SWARM,
  RUNAWAY_LIFT,
  WALL_SMASH,
} from './layout';
import { MineTrainBack, MineTrainFront } from './mineTrain';
import { RatSwarmBack } from './ratSwarm';
import { RunawayLiftBack, RunawayLiftFront } from './runawayLift';
import { WallSmashBack, WallSmashFront } from './wallSmash';

/** World 1 (Old Mine Shaft) obstacles by id, in level order. */
export const MINE_OBSTACLES = {
  'cart-race': { back: CartRaceBack, front: CartRaceFront, width: CART_RACE.width },
  'cart-jump': { back: CartJumpBack, front: CartJumpFront, width: CART_JUMP.width },
  'wall-smash': { back: WallSmashBack, front: WallSmashFront, width: WALL_SMASH.width },
  'rat-swarm': { back: RatSwarmBack, width: RAT_SWARM.width },
  'crystal-cavern': { back: CrystalCavernBack, width: CRYSTAL_CAVERN.width },
  'bat-storm': { back: BatStormBack, front: BatStormFront, width: BAT_STORM.width },
  'runaway-lift': { back: RunawayLiftBack, front: RunawayLiftFront, width: RUNAWAY_LIFT.width },
  'mine-train': { back: MineTrainBack, front: MineTrainFront, width: MINE_TRAIN.width },
} satisfies Record<string, ObstacleArt>;
