import type { CutScene } from './types';

/**
 * World 4 (Misty Mountains) cut scenes, levels 25–32. Positions the art shares are in
 * `art/obstacles/mountain/layout.ts`; each level's comment says which numbers it relies on.
 */
export const MOUNTAIN_SCENES: Record<number, CutScene> = {
  // Level 25: the rock slide (ROCK_SLIDE, anchor 300). The overhang covers 750–1060 with
  // 150px clear under it. He dives under and waits while the rocks bounce over.
  25: {
    obstacle: 'rock-slide',
    anchor: 300,
    width: 1500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 420, ms: 900 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 900, amp: 8 },
        { do: 'hold', pose: 'brace', ms: 600 },
        { do: 'prop', state: 'slide' },
        { do: 'caption' },
        { do: 'run', x: 620, ms: 300 },
        { do: 'move', x: 880, lift: 0, ms: 550, pose: 'slide', ease: 'out' },
        { do: 'hold', pose: 'brace', ms: 1550 },
        { do: 'prop', state: 'clear' },
        { do: 'walk', x: 1260, ms: 700 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 26: the crumbling ledge (LEDGE, anchor 300). The gaps open at 700–780,
  // 1000–1100 and 1300–1480; each leap is a little longer than the last.
  26: {
    obstacle: 'crumbling-ledge',
    anchor: 300,
    width: 1700,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 380, ms: 900 },
        { do: 'prop', state: 'gust' },
        { do: 'shake', ms: 400, amp: 5 },
        { do: 'hold', pose: 'brace', ms: 700 },
        { do: 'prop', state: 'crumble' },
        { do: 'caption' },
        { do: 'shake', ms: 400, amp: 6 },
        { do: 'run', x: 640, ms: 350 },
        { do: 'jump', x: 820, height: 90, ms: 420, pose: 'leap' },
        { do: 'run', x: 960, ms: 180 },
        { do: 'jump', x: 1150, height: 100, ms: 420, pose: 'leap' },
        { do: 'run', x: 1240, ms: 130 },
        { do: 'jump', x: 1560, height: 150, ms: 620, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 27: the avalanche (AVALANCHE, anchor 300). He hangs from the branch 360px up (feet
  // 185–195px up) at 800 while the snow wave (150px tall) rushes under him, then drops onto
  // the 30px of new snow it leaves.
  27: {
    obstacle: 'avalanche',
    anchor: 300,
    width: 1500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 700, ms: 1200 },
        { do: 'prop', state: 'crack' },
        { do: 'shake', ms: 700, amp: 10 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 700 },
        { do: 'face', facing: 'right' },
        { do: 'caption' },
        { do: 'jump', x: 800, lift: 185, height: 60, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'grab' },
        { do: 'move', x: 800, lift: 195, ms: 1300, pose: 'swing', ease: 'linear' },
        { do: 'prop', state: 'settle' },
        { do: 'jump', x: 1000, lift: 30, height: 40, ms: 500, pose: 'leap' },
        { do: 'walk', x: 1120, ms: 300 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 28: the goat ride (GOAT, anchor 300). The goat stops at 620; he rides 90px above its
  // feet up the ledges at 900, 1100 and 1300 (100, 200 and 300px up), then hops off.
  28: {
    obstacle: 'goat-ride',
    anchor: 300,
    width: 1900,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 500, ms: 1000 },
        { do: 'prop', state: 'goat' },
        { do: 'hold', pose: 'brace', ms: 900 },
        { do: 'caption' },
        { do: 'jump', x: 620, lift: 90, height: 60, ms: 400, pose: 'leap' },
        { do: 'prop', state: 'ride' },
        { do: 'hold', pose: 'ride', ms: 250 },
        { do: 'jump', x: 900, lift: 190, height: 80, ms: 450, pose: 'ride' },
        { do: 'jump', x: 1100, lift: 290, height: 80, ms: 450, pose: 'ride' },
        { do: 'jump', x: 1300, lift: 390, height: 80, ms: 450, pose: 'ride' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 1450, lift: 300, height: 60, ms: 450, pose: 'leap' },
        { do: 'walk', x: 1600, ms: 350 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 29: the ice bridge (ICE_BRIDGE, anchor 300). The crevasse is 550–1300; after
  // 'shatter' the ice breaks up behind him as he slides across at 0.81px/ms.
  29: {
    obstacle: 'ice-bridge',
    anchor: 300,
    width: 1700,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 1000 },
        { do: 'walk', x: 600, ms: 400 },
        { do: 'prop', state: 'crack' },
        { do: 'shake', ms: 500, amp: 5 },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'prop', state: 'shatter' },
        { do: 'caption' },
        { do: 'run', x: 700, ms: 150 },
        { do: 'move', x: 1350, lift: 0, ms: 800, pose: 'slide', ease: 'linear' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 30: the icicle cave (ICICLES, anchor 300). The cave runs 500–1600; each icicle
  // drops once he is 70px past it.
  30: {
    obstacle: 'icicle-cave',
    anchor: 300,
    width: 1900,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 700, amp: 7 },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'prop', state: 'fall' },
        { do: 'caption' },
        { do: 'run', x: 1780, ms: 1380 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 31: the ice wall (ICE_WALL, anchor 300). The frozen waterfall stands at 600, 330px
  // tall. A foothold breaks halfway up and he drops 40px before climbing on.
  31: {
    obstacle: 'ice-wall',
    anchor: 300,
    width: 1500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 560, ms: 1100 },
        { do: 'prop', state: 'climb' },
        { do: 'caption' },
        { do: 'move', x: 580, lift: 160, ms: 1100, pose: 'climb', ease: 'linear' },
        { do: 'prop', state: 'slip' },
        { do: 'shake', ms: 300, amp: 6 },
        { do: 'move', x: 580, lift: 120, ms: 250, pose: 'fall', ease: 'in' },
        { do: 'hold', pose: 'climb', ms: 300 },
        { do: 'move', x: 580, lift: 320, ms: 1100, pose: 'climb', ease: 'linear' },
        { do: 'jump', x: 700, lift: 330, height: 40, ms: 400, pose: 'leap' },
        { do: 'walk', x: 900, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 32 (boss): over the peak (PEAK, anchor 300). Up the slope to the peak at 700–780
  // (220px up) in a storm, onto the sled, down to 1800 at 1.27px/ms, over the crevasse
  // (1900–2100) and to a stop at 2300. The storm clears as he lands.
  32: {
    obstacle: 'peak',
    anchor: 300,
    width: 2500,
    sign: { x: 2170, text: 'Canyon to Home' },
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 300, ms: 700 },
        { do: 'prop', state: 'storm' },
        { do: 'move', x: 700, lift: 220, ms: 1100, pose: 'run', ease: 'linear' },
        { do: 'hold', pose: 'brace', ms: 700 },
        { do: 'prop', state: 'sled' },
        { do: 'caption' },
        { do: 'jump', x: 780, lift: 240, height: 40, ms: 350, pose: 'leap' },
        { do: 'move', x: 1800, lift: 20, ms: 1600, pose: 'ride', ease: 'in' },
        { do: 'prop', state: 'jump' },
        { do: 'jump', x: 2150, lift: 20, height: 120, ms: 280, pose: 'ride' },
        { do: 'prop', state: 'land' },
        { do: 'shake', ms: 500, amp: 10 },
        { do: 'move', x: 2300, lift: 20, ms: 240, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2420, height: 80, ms: 500, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1800 },
      ],
    },
  },

  // ---------- World 5: Canyon to Home (layouts in art/obstacles/canyonLayout.ts) ----------
};
