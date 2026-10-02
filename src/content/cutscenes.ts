import type { ObstacleId } from '../art/obstacles/types';
import type { SceneScript } from '../cutscenes/timeline';

/**
 * Cut scenes after each level (data only). World x is in px from the scene's left
 * edge; the obstacle is drawn with its local (0, 0) at `anchor` on the ground line.
 * The hero is about 190px tall (sized so his hands reach 175px up in the swing pose); `lift`
 * is how high his feet are above the ground. Steps can also direct the scene like a cartoon
 * (faces, impacts, emotes, camera moves, cut-ins, slow motion and freeze frames: see
 * `SceneStep` in timeline.ts).
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

  // ---------- World 2: the Whispering Forest (layouts in art/obstacles/forestLayout.ts) ----------

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
  // The gully floods at 530–970. Directed like a Saturday-morning cartoon (M7b): the flood
  // freezes for a beat and the camera snaps to his surprised face; a cut-in of his determined
  // face; he crouches and leaps under a tilted camera; the swing slows at the bottom of its arc;
  // the landing freezes, kicks up dust and sparkles as the camera eases back.
  12: {
    obstacle: 'vine-swing',
    anchor: 300,
    width: 1400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 500, ms: 1000 },
        { do: 'prop', state: 'flood' },
        { do: 'impact', x: 750, lift: 40, size: 1.2 },
        { do: 'hold', pose: 'brace', ms: 70 },
        { do: 'freeze', ms: 120 },
        { do: 'shake', ms: 700, amp: 12 },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.9, ms: 240 },
        { do: 'hold', pose: 'brace', ms: 530 },
        { do: 'camera', zoom: 1.08, ms: 220 },
        { do: 'cutin', ms: 820, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 820, expr: 'determined' },
        { do: 'caption' },
        { do: 'camera', zoom: 1.22, tilt: -5, ms: 420 },
        { do: 'jump', x: 602.5, lift: 129.5, height: 70, ms: 360, pose: 'leap' },
        { do: 'prop', state: 'grab' },
        { do: 'impact', x: 602.5, lift: 304, size: 0.35 },
        { do: 'action', ms: 1100 },
        { do: 'move', x: 750, lift: 90, ms: 550, pose: 'swing', ease: 'in' },
        { do: 'slow', ms: 300, rate: 0.4 },
        { do: 'move', x: 897.5, lift: 129.5, ms: 550, pose: 'swing', ease: 'out' },
        { do: 'prop', state: 'letgo' },
        { do: 'camera', zoom: 1, ms: 380 },
        { do: 'jump', x: 1100, height: 95, ms: 420, pose: 'leap' },
        { do: 'impact', x: 1100, lift: 0, size: 0.6 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'shake', ms: 260, amp: 6 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.14, ms: 200 },
        { do: 'hold', pose: 'cheer', ms: 210 },
        { do: 'camera', zoom: 1, ms: 700 },
        { do: 'hold', pose: 'cheer', ms: 1300 },
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

  // ---------- World 3: the Rushing River (layouts in art/obstacles/riverLayout.ts) ----------

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

  // ---------- World 4: the Misty Mountains (layouts in art/obstacles/mountainLayout.ts) ----------

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

export function getCutScene(levelId: number): CutScene | undefined {
  return CUT_SCENES[levelId];
}
