import type { ObstacleArt } from '../types';
import { AvalancheBack, AvalancheFront } from './avalanche';
import { LedgeBack } from './crumblingLedge';
import { GoatBack, GoatFront } from './goatRide';
import { IceBridgeBack } from './iceBridge';
import { IceWallBack } from './iceWall';
import { IcicleCaveBack } from './icicleCave';
import { AVALANCHE, GOAT, ICE_BRIDGE, ICE_WALL, ICICLES, LEDGE, PEAK, ROCK_SLIDE } from './layout';
import { PeakBack, PeakFront } from './peak';
import { RockSlideBack, RockSlideFront } from './rockSlide';

/** World 4 (Misty Mountains) obstacles by id, in level order. */
export const MOUNTAIN_OBSTACLES = {
  'rock-slide': { back: RockSlideBack, front: RockSlideFront, width: ROCK_SLIDE.width, focus: 430 },
  'crumbling-ledge': { back: LedgeBack, width: LEDGE.width },
  avalanche: { back: AvalancheBack, front: AvalancheFront, width: AVALANCHE.width, focus: 520 },
  'goat-ride': { back: GoatBack, front: GoatFront, width: GOAT.width, focus: 520 },
  'ice-bridge': { back: IceBridgeBack, width: ICE_BRIDGE.width, focus: 230 },
  'icicle-cave': { back: IcicleCaveBack, width: ICICLES.width, focus: 100 },
  'ice-wall': { back: IceWallBack, width: ICE_WALL.width, focus: 280 },
  peak: { back: PeakBack, front: PeakFront, width: PEAK.width },
} satisfies Record<string, ObstacleArt>;
