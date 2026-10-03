import type { CutScene } from './types';

/**
 * World 2 (Whispering Forest) cut scenes, levels 9–16. Positions the art shares are in
 * `art/obstacles/forest/layout.ts`; each level's comment says which numbers it relies on.
 */
export const FOREST_SCENES: Record<number, CutScene> = {
  // Level 9: the log roll (LOG_ROLL, anchor 500). The log rolls up from behind and is under
  // him when he lands at 470 ('ride'); he runs on top of it (feet 170 up) at 0.82px/ms until
  // it slams into the stump when its center reaches 1660.
  9: {
    obstacle: 'log-roll',
    anchor: 500,
    width: 2200,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 420, ms: 1000 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 900, amp: 8 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 700 },
        { do: 'face', facing: 'right' },
        { do: 'caption' },
        { do: 'jump', x: 470, lift: 170, height: 90, ms: 520, pose: 'leap' },
        { do: 'prop', state: 'ride' },
        { do: 'move', x: 900, lift: 170, ms: 1050, pose: 'run', ease: 'in' },
        { do: 'move', x: 1660, lift: 170, ms: 930, pose: 'run', ease: 'linear' },
        { do: 'prop', state: 'hit' },
        { do: 'shake', ms: 500, amp: 10 },
        { do: 'jump', x: 1960, height: 170, ms: 800, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 10: the bramble vault (BRAMBLE, anchor 400). The pole lies at 480; the brambles
  // grow at 700–920, 240px tall. He plants the pole at 690, rises on it to 250px, lets go
  // over the wall and lands at 1060.
  10: {
    obstacle: 'bramble-vault',
    anchor: 400,
    width: 1400,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'grow' },
        { do: 'shake', ms: 500, amp: 6 },
        { do: 'hold', pose: 'brace', ms: 900 },
        { do: 'caption' },
        { do: 'walk', x: 480, ms: 350 },
        { do: 'prop', state: 'grab' },
        { do: 'hold', pose: 'idle', ms: 250 },
        { do: 'run', x: 640, ms: 350 },
        { do: 'prop', state: 'plant' },
        { do: 'move', x: 700, lift: 250, ms: 450, pose: 'leap', ease: 'out' },
        { do: 'jump', x: 1060, height: 160, ms: 700, pose: 'leap' },
        { do: 'prop', state: 'land' },
        { do: 'shake', ms: 300, amp: 5 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 11: the root slide (ROOT_SLIDE, anchor 400). The ground over 550–1300 falls in;
  // he drops onto the chute and slides along it (its points plus 400), then pops out.
  11: {
    obstacle: 'root-slide',
    anchor: 400,
    width: 1800,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 520, ms: 1000 },
        { do: 'prop', state: 'crack' },
        { do: 'shake', ms: 500, amp: 8 },
        { do: 'hold', pose: 'brace', ms: 250 },
        { do: 'move', x: 600, lift: -40, ms: 350, pose: 'fall', ease: 'in' },
        { do: 'caption' },
        { do: 'move', x: 820, lift: -110, ms: 370, pose: 'slide', ease: 'linear' },
        { do: 'move', x: 1040, lift: -110, ms: 350, pose: 'slide', ease: 'linear' },
        { do: 'move', x: 1260, lift: -10, ms: 380, pose: 'slide', ease: 'linear' },
        { do: 'prop', state: 'out' },
        { do: 'jump', x: 1450, height: 140, ms: 600, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 12: the vine swing (VINE_SWING, anchor 300). The vine hangs from 750 (295px to his
  // hands, 175px above his feet); he grabs it 30° left of straight down and lets go 30° right.
  // The gully floods at 530–970.
  12: {
    obstacle: 'vine-swing',
    anchor: 300,
    width: 1400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 500, ms: 1000 },
        { do: 'prop', state: 'flood' },
        { do: 'shake', ms: 700, amp: 9 },
        { do: 'hold', pose: 'brace', ms: 900 },
        { do: 'caption' },
        { do: 'jump', x: 602.5, lift: 129.5, height: 60, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'grab' },
        { do: 'move', x: 750, lift: 90, ms: 550, pose: 'swing', ease: 'in' },
        { do: 'move', x: 897.5, lift: 129.5, ms: 550, pose: 'swing', ease: 'out' },
        { do: 'prop', state: 'letgo' },
        { do: 'jump', x: 1100, height: 70, ms: 550, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 13: the boar charge (BOAR, anchor 300). The branch is 260px up over 520–740. The
  // boar charges from 1200 to the bush at 250 between 'charge' and 'crash' (0.87px/ms),
  // passing under him once he's up.
  13: {
    obstacle: 'boar-charge',
    anchor: 300,
    width: 1400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 560, ms: 1000 },
        { do: 'prop', state: 'snort' },
        { do: 'hold', pose: 'brace', ms: 1000 },
        { do: 'prop', state: 'charge' },
        { do: 'caption' },
        { do: 'hold', pose: 'brace', ms: 250 },
        { do: 'jump', x: 600, lift: 260, height: 80, ms: 450, pose: 'leap' },
        { do: 'hold', pose: 'idle', ms: 500 },
        { do: 'prop', state: 'crash' },
        { do: 'shake', ms: 400, amp: 8 },
        { do: 'hold', pose: 'cheer', ms: 900 },
        { do: 'jump', x: 850, height: 60, ms: 600, pose: 'leap' },
        { do: 'walk', x: 1000, ms: 450 },
        { do: 'hold', pose: 'cheer', ms: 1300 },
      ],
    },
  },

  // Level 14: the mushroom bounce (MUSHROOMS, anchor 300). The bog is 450–1230; the caps
  // are at 580, 820 and 1060, 70px up. Each bounce is a little higher than the last.
  14: {
    obstacle: 'mushroom-bounce',
    anchor: 300,
    width: 1600,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'bubble' },
        { do: 'shake', ms: 400, amp: 5 },
        { do: 'hold', pose: 'brace', ms: 600 },
        { do: 'caption' },
        { do: 'jump', x: 580, lift: 70, height: 100, ms: 550, pose: 'leap' },
        { do: 'prop', state: 'b1' },
        { do: 'jump', x: 820, lift: 70, height: 140, ms: 600, pose: 'leap' },
        { do: 'prop', state: 'b2' },
        { do: 'jump', x: 1060, lift: 70, height: 160, ms: 600, pose: 'leap' },
        { do: 'prop', state: 'b3' },
        { do: 'jump', x: 1320, height: 220, ms: 800, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 15: the falling bridge (FALLING_BRIDGE, anchor 300). The ravine is 450–1450. After
  // 'collapse' the planks drop 140px behind his heels as he runs at 0.78px/ms.
  15: {
    obstacle: 'falling-bridge',
    anchor: 300,
    width: 2000,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 440, ms: 900 },
        { do: 'walk', x: 600, ms: 500 },
        { do: 'prop', state: 'creak' },
        { do: 'shake', ms: 500, amp: 6 },
        { do: 'hold', pose: 'brace', ms: 400 },
        { do: 'prop', state: 'collapse' },
        { do: 'caption' },
        { do: 'run', x: 1300, ms: 900 },
        { do: 'jump', x: 1560, height: 120, ms: 550, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 16 (boss): follow the fireflies (FIREFLIES, anchor 300). Night falls and roots rise:
  // a hump at 800, an arch at 1200 (150px clear) and a gap at 1600–1800. The fireflies lead
  // him through and swirl around him in the moonlit clearing.
  16: {
    obstacle: 'fireflies',
    anchor: 300,
    width: 2500,
    sign: { x: 2080, text: 'Rushing River' },
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 450, ms: 1000 },
        { do: 'prop', state: 'dusk' },
        { do: 'hold', pose: 'idle', ms: 1000 },
        { do: 'prop', state: 'fireflies' },
        { do: 'hold', pose: 'brace', ms: 700 },
        { do: 'caption' },
        { do: 'run', x: 680, ms: 330 },
        { do: 'jump', x: 920, height: 170, ms: 520, pose: 'leap' },
        { do: 'run', x: 1060, ms: 200 },
        { do: 'move', x: 1340, lift: 0, ms: 600, pose: 'slide', ease: 'out' },
        { do: 'run', x: 1560, ms: 300 },
        { do: 'jump', x: 1860, height: 160, ms: 650, pose: 'leap' },
        { do: 'prop', state: 'dawn' },
        { do: 'run', x: 2330, ms: 650 },
        { do: 'hold', pose: 'cheer', ms: 1800 },
      ],
    },
  },
};
