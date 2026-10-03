import type { ObstacleArt } from '../types';
import { TrainBack, TrainFront } from './canyonTrain';
import { ArchBack } from './crumblingArch';
import { DuneBack, DuneFront } from './duneSurf';
import { FlashFloodBack } from './flashFlood';
import { HomeBack, HomeFront } from './home';
import { HillBack } from './lastHill';
import { ARCH, DUNE, FLASH_FLOOD, HILL, HOME, TRAIN, TUMBLEWEEDS, ZIP } from './layout';
import { TumbleweedsBack, TumbleweedsFront } from './tumbleweeds';
import { ZipLineBack, ZipLineFront } from './zipLine';

/** World 5 (Canyon to Home) obstacles by id, in level order. */
export const CANYON_OBSTACLES = {
  'flash-flood': { back: FlashFloodBack, width: FLASH_FLOOD.width, focus: 230 },
  'zip-line': { back: ZipLineBack, front: ZipLineFront, width: ZIP.width, focus: 130 },
  'dune-surf': { back: DuneBack, front: DuneFront, width: DUNE.width },
  tumbleweeds: {
    back: TumbleweedsBack,
    front: TumbleweedsFront,
    width: TUMBLEWEEDS.width,
    focus: 1050,
  },
  'crumbling-arch': { back: ArchBack, width: ARCH.width, focus: 180 },
  'canyon-train': { back: TrainBack, front: TrainFront, width: TRAIN.width, focus: 1780 },
  'last-hill': { back: HillBack, width: HILL.width },
  home: { back: HomeBack, front: HomeFront, width: HOME.width, focus: 1150 },
} satisfies Record<string, ObstacleArt>;
