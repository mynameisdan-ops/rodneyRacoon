import type { ObstacleArt } from '../types';
import { BeaverDamBack } from './beaverDam';
import { GeyserBack } from './geyser';
import { DAM, FALLS, GEYSER, RAFT, RAPIDS, RISING, ROPE_BRIDGE, STONES } from './layout';
import { RaftBack, RaftFront } from './raft';
import { RapidsBack, RapidsFront } from './rapids';
import { RisingBack } from './risingWater';
import { RopeBridgeBack } from './ropeBridge';
import { SteppingStonesBack, SteppingStonesFront } from './steppingStones';
import { FallsBack } from './waterfallSlide';

/** World 3 (Rushing River) obstacles by id, in level order. */
export const RIVER_OBSTACLES = {
  'stepping-stones': {
    back: SteppingStonesBack,
    front: SteppingStonesFront,
    width: STONES.width,
    focus: 250,
  },
  'beaver-dam': { back: BeaverDamBack, width: DAM.width, focus: 160 },
  rapids: { back: RapidsBack, front: RapidsFront, width: RAPIDS.width, focus: 120 },
  'rope-bridge': { back: RopeBridgeBack, width: ROPE_BRIDGE.width, focus: 130 },
  geyser: { back: GeyserBack, width: GEYSER.width, focus: 230 },
  'waterfall-slide': { back: FallsBack, width: FALLS.width, focus: 120 },
  'rising-water': { back: RisingBack, width: RISING.width, focus: 240 },
  raft: { back: RaftBack, front: RaftFront, width: RAFT.width, focus: 180 },
} satisfies Record<string, ObstacleArt>;
