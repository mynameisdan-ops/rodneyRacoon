import type { ObstacleId } from '../art/obstacles/types';
import type { SceneScript } from '../cutscenes/timeline';

/**
 * Cut scenes after each level (data only). World x is in px from the scene's left
 * edge; the obstacle is drawn with its local (0, 0) at `anchor` on the ground line.
 * The hero is about 200px tall; `lift` is how high his feet are above the ground.
 * The captions come from `levels.ts`.
 */
export interface CutScene {
  obstacle: ObstacleId;
  anchor: number;
  /** Scene width, px. Wider than 1280 makes the camera follow the hero (max 2500). */
  width: number;
  /** A signpost near the end, e.g. pointing to the next world. */
  sign?: { x: number; text: string };
  script: SceneScript;
}

export const CUT_SCENES: Record<number, CutScene> = {
  // Level 1: the cart race (numbers match CART_RACE in art/obstacles/mineLayout.ts, anchor 500).
  // The cart waits at 560 and stops at the buffer at 2150; the pit spans 1500–1700.
  // He rides with his feet on the cart floor, 44px up. The three ride moves chain
  // (ease in, steady, steady) so the speed never jumps: 0.8px/ms at full speed.
  // The boulder trails him by 300px, so when he reaches 1900 ('drop') it is over the pit.
  1: {
    obstacle: 'cart-race',
    anchor: 500,
    width: 2500,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 480, ms: 1300 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 1100, amp: 12 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 800 },
        { do: 'face', facing: 'right' },
        { do: 'jump', x: 560, lift: 44, height: 70, ms: 500 },
        { do: 'caption' },
        { do: 'prop', state: 'chase' },
        { do: 'move', x: 1000, lift: 44, ms: 1100, pose: 'ride', ease: 'in' },
        { do: 'move', x: 1900, lift: 44, ms: 1100, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'drop' },
        { do: 'shake', ms: 800, amp: 14 },
        { do: 'move', x: 2150, lift: 44, ms: 305, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'crash' },
        { do: 'shake', ms: 450, amp: 9 },
        { do: 'jump', x: 2380, height: 150, ms: 750, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 2: the cart jump (CART_JUMP, anchor 300). The cart waits at 420; the ramp runs
  // 820–940 and rises 60px; the gap is 950–1310; the cart stops at 1560. Full speed is
  // 0.8px/ms, kept steady from the ramp through the flight to the braking move.
  2: {
    obstacle: 'cart-jump',
    anchor: 300,
    width: 1900,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 330, ms: 900 },
        { do: 'caption' },
        { do: 'jump', x: 420, lift: 44, height: 70, ms: 450 },
        { do: 'prop', state: 'board' },
        { do: 'move', x: 820, lift: 44, ms: 1000, pose: 'ride', ease: 'in' },
        { do: 'prop', state: 'launch' },
        { do: 'move', x: 940, lift: 104, ms: 150, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'fly' },
        { do: 'jump', x: 1340, lift: 44, height: 110, ms: 500, pose: 'ride' },
        { do: 'prop', state: 'land' },
        { do: 'shake', ms: 500, amp: 12 },
        { do: 'move', x: 1560, lift: 44, ms: 550, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 1740, height: 130, ms: 650, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 3: the wall smash (WALL_SMASH, anchor 300). He pushes the ore cart from 90px
  // behind it; its front meets the cave-in (1000–1110) when he reaches 850.
  3: {
    obstacle: 'wall-smash',
    anchor: 300,
    width: 1600,
    script: {
      startX: 100,
      steps: [
        { do: 'walk', x: 310, ms: 900 },
        { do: 'hold', pose: 'brace', ms: 400 },
        { do: 'caption' },
        { do: 'prop', state: 'push' },
        { do: 'move', x: 850, lift: 0, ms: 1300, pose: 'run', ease: 'in' },
        { do: 'prop', state: 'smash' },
        { do: 'shake', ms: 700, amp: 16 },
        { do: 'run', x: 1150, ms: 360 },
        { do: 'move', x: 1280, lift: 0, ms: 310, pose: 'run', ease: 'out' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 4: the rat swarm (RAT_SWARM, anchor 300). The chain hangs from 700 (295px to his
  // hands, which are 175px above his feet). He grabs it 30° left of straight down, swings
  // through the bottom, and lets go 30° right; the rats pour out of the hole at 900.
  4: {
    obstacle: 'rat-swarm',
    anchor: 300,
    width: 1280,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 1000 },
        { do: 'prop', state: 'swarm' },
        { do: 'hold', pose: 'brace', ms: 350 },
        { do: 'caption' },
        { do: 'jump', x: 552.5, lift: 129.5, height: 60, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'grab' },
        { do: 'move', x: 700, lift: 90, ms: 550, pose: 'swing', ease: 'in' },
        { do: 'move', x: 847.5, lift: 129.5, ms: 550, pose: 'swing', ease: 'out' },
        { do: 'prop', state: 'letgo' },
        { do: 'jump', x: 1100, height: 70, ms: 550, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 5: the crystal cavern (CRYSTAL_CAVERN, anchor 300). The chasm spans 320–940;
  // the spire tops are at 440, 600 and 760, standing 90px up. Each spire sinks
  // as he leaves it.
  5: {
    obstacle: 'crystal-cavern',
    anchor: 300,
    width: 1280,
    script: {
      startX: 100,
      steps: [
        { do: 'walk', x: 290, ms: 800 },
        { do: 'prop', state: 'crumble' },
        { do: 'shake', ms: 600, amp: 8 },
        { do: 'hold', pose: 'brace', ms: 300 },
        { do: 'caption' },
        { do: 'jump', x: 440, lift: 90, height: 60, ms: 500, pose: 'leap' },
        { do: 'hold', pose: 'idle', ms: 150 },
        { do: 'prop', state: 'sink1' },
        { do: 'jump', x: 600, lift: 90, height: 60, ms: 500, pose: 'leap' },
        { do: 'hold', pose: 'idle', ms: 150 },
        { do: 'prop', state: 'sink2' },
        { do: 'jump', x: 760, lift: 90, height: 60, ms: 500, pose: 'leap' },
        { do: 'hold', pose: 'idle', ms: 150 },
        { do: 'prop', state: 'sink3' },
        { do: 'jump', x: 1030, height: 100, ms: 560, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 6: the bat storm (BAT_STORM, anchor 300). The lantern hangs at 400 and lands
  // about 390ms after 'crash'. He slides under the fallen beam (580–740, 155px clear).
  6: {
    obstacle: 'bat-storm',
    anchor: 300,
    width: 1280,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 280, ms: 800 },
        { do: 'prop', state: 'crash' },
        { do: 'hold', pose: 'brace', ms: 400 },
        { do: 'shake', ms: 300, amp: 7 },
        { do: 'prop', state: 'bats' },
        { do: 'caption' },
        { do: 'hold', pose: 'brace', ms: 350 },
        { do: 'run', x: 520, ms: 330 },
        { do: 'move', x: 900, lift: 0, ms: 750, pose: 'slide', ease: 'out' },
        { do: 'walk', x: 960, ms: 260 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 7: the runaway lift (RUNAWAY_LIFT, anchor 300). The cage is at 400, the chain at
  // 450, and the upper ledge starts at 490, 340px up. He ends standing on the ledge.
  7: {
    obstacle: 'runaway-lift',
    anchor: 300,
    width: 1280,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'board' },
        { do: 'hold', pose: 'idle', ms: 300 },
        { do: 'move', x: 400, lift: 240, ms: 1800, pose: 'idle' },
        { do: 'prop', state: 'creak' },
        { do: 'shake', ms: 500, amp: 4 },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'prop', state: 'snap' },
        { do: 'shake', ms: 700, amp: 12 },
        { do: 'caption' },
        { do: 'move', x: 450, lift: 250, ms: 250, pose: 'swing', ease: 'out' },
        { do: 'move', x: 450, lift: 330, ms: 1000, pose: 'climb', ease: 'linear' },
        { do: 'jump', x: 560, lift: 340, height: 40, ms: 450 },
        { do: 'walk', x: 700, ms: 500 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 8 (boss): escape the mine (MINE_TRAIN, anchor 300). The engine pushes the cart
  // from 170px behind. The tunnel mouth is at 1300, the canyon spans 1500–1850, and the cart
  // stops at 2150. Full speed is about 0.91px/ms. Rocks fall where the train just was.
  8: {
    obstacle: 'mine-train',
    anchor: 300,
    width: 2500,
    sign: { x: 2000, text: 'Whispering Forest' },
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 330, ms: 800 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 1400, amp: 10 },
        { do: 'hold', pose: 'brace', ms: 700 },
        { do: 'jump', x: 400, lift: 44, height: 60, ms: 450 },
        { do: 'prop', state: 'board' },
        { do: 'move', x: 900, lift: 44, ms: 1100, pose: 'ride', ease: 'in' },
        { do: 'move', x: 1500, lift: 44, ms: 660, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'fly' },
        { do: 'caption' },
        { do: 'jump', x: 1880, lift: 44, height: 170, ms: 640, pose: 'ride' },
        { do: 'prop', state: 'land' },
        { do: 'shake', ms: 600, amp: 14 },
        { do: 'move', x: 2150, lift: 44, ms: 594, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2380, height: 140, ms: 700, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1800 },
      ],
    },
  },
};

export function getCutScene(levelId: number): CutScene | undefined {
  return CUT_SCENES[levelId];
}
