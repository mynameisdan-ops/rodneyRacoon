import type { CutScene } from './types';

/**
 * World 3 (Rushing River) cut scenes, levels 17–24. Positions the art shares are in
 * `art/obstacles/river/layout.ts`; each level's comment says which numbers it relies on.
 */
export const RIVER_SCENES: Record<number, CutScene> = {
  // Level 17: stepping stones (STONES, anchor 300). The river is 500–1300; the stones are at
  // 600, 780, 960 and 1140, 30px up, and sink after he leaves them. The wave rolls from
  // -400 to the far bank at a steady pace between 'surge' and 'crash', always behind him.
  17: {
    obstacle: 'stepping-stones',
    anchor: 300,
    width: 1500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 450, ms: 1000 },
        { do: 'prop', state: 'surge' },
        { do: 'shake', ms: 500, amp: 6 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 600 },
        { do: 'face', facing: 'right' },
        { do: 'caption' },
        { do: 'jump', x: 600, lift: 30, height: 70, ms: 450, pose: 'leap' },
        { do: 'prop', state: 's1' },
        { do: 'jump', x: 780, lift: 30, height: 70, ms: 420, pose: 'leap' },
        { do: 'prop', state: 's2' },
        { do: 'jump', x: 960, lift: 30, height: 70, ms: 420, pose: 'leap' },
        { do: 'prop', state: 's3' },
        { do: 'jump', x: 1140, lift: 30, height: 70, ms: 420, pose: 'leap' },
        { do: 'prop', state: 's4' },
        { do: 'jump', x: 1400, height: 110, ms: 550, pose: 'leap' },
        { do: 'prop', state: 'crash' },
        { do: 'shake', ms: 400, amp: 8 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 18: the beaver dam (DAM, anchor 300). The dam top runs 480–1240, 80px up. After
  // 'burst' the logs pop out 110px behind him as he runs at 0.8px/ms.
  18: {
    obstacle: 'beaver-dam',
    anchor: 300,
    width: 1600,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 420, ms: 1000 },
        { do: 'jump', x: 540, lift: 80, height: 60, ms: 400, pose: 'leap' },
        { do: 'walk', x: 640, ms: 400 },
        { do: 'prop', state: 'crack' },
        { do: 'shake', ms: 600, amp: 7 },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'prop', state: 'burst' },
        { do: 'caption' },
        { do: 'run', x: 1200, ms: 700 },
        { do: 'jump', x: 1420, height: 100, ms: 550, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 19: the rapids (RAPIDS, anchor 300). The log floats at 480; its top is 16px up
  // before the drop at 1400 and 24px down after it. Full speed is 0.93px/ms.
  19: {
    obstacle: 'rapids',
    anchor: 300,
    width: 2500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 380, ms: 900 },
        { do: 'jump', x: 480, lift: 16, height: 60, ms: 400, pose: 'leap' },
        { do: 'prop', state: 'board' },
        { do: 'move', x: 900, lift: 16, ms: 900, pose: 'ride', ease: 'in' },
        { do: 'move', x: 1360, lift: 16, ms: 495, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'drop' },
        { do: 'caption' },
        { do: 'jump', x: 1700, lift: -24, height: 90, ms: 365, pose: 'ride' },
        { do: 'prop', state: 'splash' },
        { do: 'shake', ms: 500, amp: 10 },
        { do: 'move', x: 1950, lift: -24, ms: 540, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2250, height: 140, ms: 700, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 20: the rope bridge (ROPE_BRIDGE, anchor 300). The gorge is 450–1300; the planks at
  // 660–1060 fall. He hangs from the hand rope (80px up, so his feet are 95px down) and goes
  // hand over hand to 1080, then climbs back up onto the planks.
  20: {
    obstacle: 'rope-bridge',
    anchor: 300,
    width: 1600,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 500, ms: 900 },
        { do: 'walk', x: 620, ms: 450 },
        { do: 'prop', state: 'snap' },
        { do: 'shake', ms: 600, amp: 8 },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'caption' },
        { do: 'move', x: 680, lift: -95, ms: 350, pose: 'swing', ease: 'in' },
        { do: 'move', x: 1080, lift: -95, ms: 1500, pose: 'swing', ease: 'linear' },
        { do: 'move', x: 1110, lift: 0, ms: 500, pose: 'climb', ease: 'out' },
        { do: 'walk', x: 1340, ms: 500 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 21: the geyser (GEYSER, anchor 300). The hot springs are 500–1120. He stands on
  // the rock lid over the vent at 600 (30px up); the blast throws him 380px up and over.
  21: {
    obstacle: 'geyser',
    anchor: 300,
    width: 1500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 470, ms: 1000 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 700, amp: 6 },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'jump', x: 600, lift: 30, height: 60, ms: 400, pose: 'leap' },
        { do: 'prop', state: 'blast' },
        { do: 'caption' },
        { do: 'shake', ms: 400, amp: 10 },
        { do: 'move', x: 620, lift: 380, ms: 500, pose: 'leap', ease: 'out' },
        { do: 'jump', x: 1250, height: 100, ms: 900, pose: 'leap' },
        { do: 'prop', state: 'land' },
        { do: 'shake', ms: 300, amp: 5 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 22: the waterfall slide (FALLS, anchor 300). Rock steps at 440, 520 and 600 (80,
  // 160, 240px up); the chute runs from 620 (240 up) to 1120 (20 up); the pool is 1150–1350.
  22: {
    obstacle: 'waterfall-slide',
    anchor: 300,
    width: 1600,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 380, ms: 800 },
        { do: 'jump', x: 440, lift: 80, height: 50, ms: 350, pose: 'leap' },
        { do: 'jump', x: 520, lift: 160, height: 50, ms: 350, pose: 'leap' },
        { do: 'jump', x: 600, lift: 240, height: 50, ms: 350, pose: 'leap' },
        { do: 'prop', state: 'crack' },
        { do: 'shake', ms: 500, amp: 7 },
        { do: 'hold', pose: 'brace', ms: 400 },
        { do: 'caption' },
        { do: 'move', x: 1120, lift: 20, ms: 900, pose: 'slide', ease: 'in' },
        { do: 'prop', state: 'launch' },
        { do: 'jump', x: 1450, height: 140, ms: 650, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 23: the rising water (RISING, anchor 300). The cliff is at 600 with a ledge 300px
  // up running right; the root ladder hangs at 560. The water stays 60px below his feet.
  23: {
    obstacle: 'rising-water',
    anchor: 300,
    width: 1400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 1000 },
        { do: 'prop', state: 'flood' },
        { do: 'shake', ms: 600, amp: 8 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'face', facing: 'right' },
        { do: 'caption' },
        { do: 'walk', x: 560, ms: 300 },
        { do: 'move', x: 560, lift: 290, ms: 1300, pose: 'climb', ease: 'linear' },
        { do: 'jump', x: 680, lift: 300, height: 40, ms: 400, pose: 'leap' },
        { do: 'prop', state: 'safe' },
        { do: 'walk', x: 900, ms: 700 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 24 (boss): cross the river (RAFT, anchor 300). He builds the raft at 560, sails at
  // 0.88px/ms, rides a giant wave 160px up, splashes down and runs aground on the beach at 2100.
  24: {
    obstacle: 'raft',
    anchor: 300,
    width: 2500,
    sign: { x: 2170, text: 'Misty Mountains' },
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 1000 },
        { do: 'prop', state: 'build' },
        { do: 'hold', pose: 'brace', ms: 900 },
        { do: 'hold', pose: 'cheer', ms: 600 },
        { do: 'caption' },
        { do: 'jump', x: 560, lift: 20, height: 50, ms: 400, pose: 'leap' },
        { do: 'prop', state: 'sail' },
        { do: 'move', x: 1000, lift: 20, ms: 1000, pose: 'ride', ease: 'in' },
        { do: 'prop', state: 'wave' },
        { do: 'move', x: 1500, lift: 160, ms: 570, pose: 'ride', ease: 'linear' },
        { do: 'move', x: 1900, lift: 20, ms: 455, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'splash' },
        { do: 'shake', ms: 500, amp: 10 },
        { do: 'move', x: 2100, lift: 20, ms: 455, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'beach' },
        { do: 'jump', x: 2420, height: 140, ms: 700, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1800 },
      ],
    },
  },
};
