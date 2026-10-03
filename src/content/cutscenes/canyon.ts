import type { CutScene } from './types';

/**
 * World 5 (Canyon to Home) cut scenes, levels 33–40. Positions the art shares are in
 * `art/obstacles/canyon/layout.ts`; each level's comment says which numbers it relies on.
 */
export const CANYON_SCENES: Record<number, CutScene> = {
  // Level 33: the flash flood (FLASH_FLOOD, anchor 300). Rock steps at 600, 720 and 860
  // (80, 160 and 240px up); the ledge runs on from 790. The muddy water rises 120px.
  33: {
    obstacle: 'flash-flood',
    anchor: 300,
    width: 1400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 1000 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 700, amp: 7 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 600 },
        { do: 'face', facing: 'right' },
        { do: 'prop', state: 'flood' },
        { do: 'caption' },
        { do: 'jump', x: 600, lift: 80, height: 50, ms: 350, pose: 'leap' },
        { do: 'jump', x: 720, lift: 160, height: 50, ms: 350, pose: 'leap' },
        { do: 'jump', x: 860, lift: 240, height: 50, ms: 380, pose: 'leap' },
        { do: 'walk', x: 1000, ms: 400 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 34: the zip line (ZIP, anchor 300). The line runs from 450 (380px up) to 1800
  // (200px up); his hands ride it 175px above his feet, so his feet go from 202 to 45 up.
  34: {
    obstacle: 'zip-line',
    anchor: 300,
    width: 2200,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 420, ms: 1000 },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'caption' },
        { do: 'jump', x: 470, lift: 202, height: 40, ms: 400, pose: 'leap' },
        { do: 'prop', state: 'zip' },
        { do: 'move', x: 1650, lift: 45, ms: 1500, pose: 'swing', ease: 'in' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 1900, height: 60, ms: 450, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 35: the dune surf (DUNE, anchor 300). Up the dune to the crest at 700–820 (200px
  // up), onto the board, down to 1600 at 1.2px/ms, over the bump at 1800 and to a stop at 2200.
  35: {
    obstacle: 'dune-surf',
    anchor: 300,
    width: 2400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 300, ms: 700 },
        { do: 'prop', state: 'storm' },
        { do: 'move', x: 700, lift: 200, ms: 1000, pose: 'run', ease: 'linear' },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'prop', state: 'board' },
        { do: 'caption' },
        { do: 'jump', x: 820, lift: 220, height: 40, ms: 350, pose: 'leap' },
        { do: 'move', x: 1600, lift: 20, ms: 1300, pose: 'ride', ease: 'in' },
        { do: 'move', x: 1720, lift: 20, ms: 100, pose: 'ride', ease: 'linear' },
        { do: 'move', x: 1800, lift: 80, ms: 67, pose: 'ride', ease: 'linear' },
        { do: 'jump', x: 2050, lift: 20, height: 80, ms: 210, pose: 'ride' },
        { do: 'prop', state: 'land' },
        { do: 'move', x: 2200, lift: 20, ms: 250, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2320, height: 60, ms: 450, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1600 },
      ],
    },
  },

  // Level 36: the tumbleweeds (TUMBLEWEEDS, anchor 300). Each one (60, 70 and 100px across
  // the middle) rolls in at 0.7px/ms and is right under him at the top of his jump.
  36: {
    obstacle: 'tumbleweeds',
    anchor: 300,
    width: 1600,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'wind' },
        { do: 'shake', ms: 300, amp: 4 },
        { do: 'hold', pose: 'brace', ms: 600 },
        { do: 'caption' },
        { do: 'prop', state: 'j1' },
        { do: 'jump', x: 600, height: 150, ms: 550, pose: 'leap' },
        { do: 'run', x: 720, ms: 200 },
        { do: 'prop', state: 'j2' },
        { do: 'jump', x: 920, height: 160, ms: 550, pose: 'leap' },
        { do: 'run', x: 1040, ms: 200 },
        { do: 'prop', state: 'j3' },
        { do: 'jump', x: 1320, height: 230, ms: 700, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 37: the crumbling arch (ARCH, anchor 300). The canyon is 500–1400; after 'crumble'
  // the arch breaks up behind him as he runs at 0.81px/ms.
  37: {
    obstacle: 'crumbling-arch',
    anchor: 300,
    width: 1800,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 1000 },
        { do: 'walk', x: 620, ms: 400 },
        { do: 'prop', state: 'crack' },
        { do: 'shake', ms: 500, amp: 6 },
        { do: 'hold', pose: 'brace', ms: 400 },
        { do: 'prop', state: 'crumble' },
        { do: 'caption' },
        { do: 'run', x: 1350, ms: 900 },
        { do: 'jump', x: 1600, height: 120, ms: 550, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 38: the canyon train (TRAIN, anchor 300). The flatcar (deck 120px up) comes up at
  // 0.9px/ms and is under him when he lands at 640; he rides it to 1900 and hops off onto the
  // station platform (2100–2600, 40px up).
  38: {
    obstacle: 'canyon-train',
    anchor: 300,
    width: 2500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 420, ms: 900 },
        { do: 'prop', state: 'whistle' },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 700 },
        { do: 'face', facing: 'right' },
        { do: 'caption' },
        { do: 'run', x: 560, ms: 300 },
        { do: 'jump', x: 640, lift: 120, height: 70, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'board' },
        { do: 'move', x: 1900, lift: 120, ms: 1400, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2200, lift: 40, height: 90, ms: 550, pose: 'leap' },
        { do: 'walk', x: 2300, ms: 250 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 39: the last hill (HILL, anchor 300). The slope climbs from 300 to the top at 1200
  // (260px up). The wind pushes him back once; at the top he sees home far away.
  39: {
    obstacle: 'last-hill',
    anchor: 300,
    width: 2000,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 300, ms: 600 },
        { do: 'prop', state: 'wind' },
        { do: 'move', x: 600, lift: 87, ms: 1000, pose: 'run', ease: 'linear' },
        { do: 'move', x: 540, lift: 69, ms: 400, pose: 'stumble', ease: 'out' },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'caption' },
        { do: 'move', x: 1200, lift: 260, ms: 1700, pose: 'run', ease: 'linear' },
        { do: 'prop', state: 'calm' },
        { do: 'walk', x: 1400, ms: 500 },
        { do: 'hold', pose: 'cheer', ms: 1800 },
      ],
    },
  },

  // Level 40 (boss): home (HOME, anchor 300). A twister rises in the lane; he leaps the garden
  // fence (750–940), the twister spins away, and his family waves from the porch.
  40: {
    obstacle: 'home',
    anchor: 300,
    width: 2400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'storm' },
        { do: 'shake', ms: 800, amp: 8 },
        { do: 'hold', pose: 'brace', ms: 800 },
        { do: 'caption' },
        { do: 'run', x: 700, ms: 400 },
        { do: 'jump', x: 950, height: 160, ms: 600, pose: 'leap' },
        { do: 'prop', state: 'clear' },
        { do: 'hold', pose: 'cheer', ms: 700 },
        { do: 'run', x: 1350, ms: 450 },
        { do: 'prop', state: 'home' },
        { do: 'hold', pose: 'cheer', ms: 2600 },
      ],
    },
  },
};
