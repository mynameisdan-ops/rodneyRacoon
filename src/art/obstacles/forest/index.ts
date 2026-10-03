import type { ObstacleArt } from '../types';
import { BoarChargeBack, BoarChargeFront } from './boarCharge';
import { BrambleBack, BrambleFront } from './brambleVault';
import { FallingBridgeBack } from './fallingBridge';
import { FirefliesBack, FirefliesFront } from './fireflies';
import {
  BOAR,
  BRAMBLE,
  FALLING_BRIDGE,
  FIREFLIES,
  LOG_ROLL,
  MUSHROOMS,
  ROOT_SLIDE,
  VINE_SWING,
} from './layout';
import { LogRollBack, LogRollFront } from './logRoll';
import { MushroomBounceBack } from './mushroomBounce';
import { RootSlideBack } from './rootSlide';
import { VineSwingBack } from './vineSwing';

/** World 2 (Whispering Forest) obstacles by id, in level order. */
export const FOREST_OBSTACLES = {
  'log-roll': { back: LogRollBack, front: LogRollFront, width: LOG_ROLL.width, focus: 1250 },
  'bramble-vault': { back: BrambleBack, front: BrambleFront, width: BRAMBLE.width, focus: 300 },
  'root-slide': { back: RootSlideBack, width: ROOT_SLIDE.width, focus: 150 },
  'vine-swing': { back: VineSwingBack, width: VINE_SWING.width, focus: 300 },
  'boar-charge': { back: BoarChargeBack, front: BoarChargeFront, width: BOAR.width, focus: 180 },
  'mushroom-bounce': { back: MushroomBounceBack, width: MUSHROOMS.width, focus: 250 },
  'falling-bridge': { back: FallingBridgeBack, width: FALLING_BRIDGE.width, focus: 150 },
  fireflies: { back: FirefliesBack, front: FirefliesFront, width: FIREFLIES.width, focus: 1250 },
} satisfies Record<string, ObstacleArt>;
