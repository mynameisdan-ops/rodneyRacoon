import type { CutScene } from './types';

/**
 * World 1 (Old Mine Shaft) cut scenes, levels 1–8. Positions the art shares are in
 * `art/obstacles/mine/layout.ts`; each level's comment says which numbers it relies on.
 *
 * Directed like a Saturday-morning cartoon (M7b): each threat lands with an impact and a beat
 * of hit-stop, the camera snaps to his face, a cut-in shows him deciding, the big move plays
 * in slow motion under focus lines and a tilted camera, and landings freeze, shake and sparkle.
 * A freeze starts a few frames after its impact (or it holds an empty burst), so where a ride
 * must not stop, its move is split into a short stretch at the same speed, then the freeze.
 */
export const MINE_SCENES: Record<number, CutScene> = {
  // Level 1: the cart race (numbers match CART_RACE, anchor 500). The cart waits at 560 and
  // stops at the buffer at 2150; the pit spans 1500–1700. He rides with his feet on the cart
  // floor, 44px up. The ride moves chain (ease in, steady, steady) so the speed never jumps:
  // 0.8px/ms at full speed. The boulder lands at 150, 450ms after 'rumble'; it trails him by
  // 300px, so when he reaches 1900 ('drop') it is over the pit. Beats: the boulder slams down
  // behind him (hit-stop, his surprised face), a determined cut-in, a tilted chase under focus
  // lines, the trestle smashing in slow motion, a hit-stop at the buffer, a sparkling landing.
  1: {
    obstacle: 'cart-race',
    anchor: 500,
    width: 2500,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 480, ms: 1300 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 1300, amp: 6 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'surprised' },
        { do: 'impact', x: 150, lift: 30, size: 1.15 },
        { do: 'hold', pose: 'brace', ms: 60 },
        { do: 'freeze', ms: 120 },
        { do: 'shake', ms: 700, amp: 16 },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.85, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 480, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'face', facing: 'right' },
        { do: 'cutin', ms: 760, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 760, expr: 'determined' },
        { do: 'caption' },
        { do: 'jump', x: 560, lift: 44, height: 70, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'chase' },
        { do: 'camera', zoom: 1.12, tilt: -3, ms: 500 },
        { do: 'action', ms: 900 },
        { do: 'move', x: 1000, lift: 44, ms: 1100, pose: 'ride', ease: 'in' },
        { do: 'move', x: 1900, lift: 44, ms: 1100, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'drop' },
        { do: 'impact', x: 1600, lift: 0, size: 1 },
        { do: 'shake', ms: 800, amp: 14 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'slow', ms: 280, rate: 0.45 },
        { do: 'emote', emote: 'sweat' },
        { do: 'move', x: 2150, lift: 44, ms: 305, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'crash' },
        { do: 'impact', x: 2214, lift: 70, size: 0.9 },
        { do: 'hold', pose: 'ride', ms: 60 },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 450, amp: 10 },
        { do: 'jump', x: 2380, height: 150, ms: 750, pose: 'leap' },
        { do: 'impact', x: 2380, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 70 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.12, ms: 200 },
        { do: 'hold', pose: 'cheer', ms: 250 },
        { do: 'camera', zoom: 1, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1300 },
      ],
    },
  },

  // Level 2: the cart jump (CART_JUMP, anchor 300). The cart waits at 420; the ramp runs
  // 820–940 and rises 60px; the gap is 950–1310; the cart stops at 1560. Full speed is
  // 0.8px/ms, kept steady from the ramp through the flight to the braking (whose first 48px
  // are split off so the landing can freeze). Beats: he sees the broken track (a sweat drop),
  // a determined cut-in, the camera tilts as he hits the ramp, the flight over the gap in slow
  // motion under focus lines, a hit-stop on the landing, a sparkling hop out.
  2: {
    obstacle: 'cart-jump',
    anchor: 300,
    width: 1900,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 330, ms: 900 },
        { do: 'emote', emote: 'sweat' },
        { do: 'hold', pose: 'brace', ms: 400, expr: 'worried' },
        { do: 'cutin', ms: 700, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 700, expr: 'determined' },
        { do: 'caption' },
        { do: 'jump', x: 420, lift: 44, height: 70, ms: 420, pose: 'leap' },
        { do: 'prop', state: 'board' },
        { do: 'camera', zoom: 1.1, tilt: -2, ms: 600 },
        { do: 'move', x: 820, lift: 44, ms: 1000, pose: 'ride', ease: 'in' },
        { do: 'prop', state: 'launch' },
        { do: 'camera', zoom: 1.24, tilt: -6, ms: 250 },
        { do: 'action', ms: 1000 },
        { do: 'move', x: 940, lift: 104, ms: 150, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'fly' },
        { do: 'slow', ms: 280, rate: 0.4 },
        { do: 'jump', x: 1340, lift: 44, height: 110, ms: 500, pose: 'ride', expr: 'shout' },
        { do: 'prop', state: 'land' },
        { do: 'impact', x: 1340, lift: 25, size: 0.85 },
        { do: 'camera', zoom: 1, ms: 300 },
        { do: 'move', x: 1388, lift: 44, ms: 60, pose: 'ride', ease: 'linear' },
        { do: 'freeze', ms: 90 },
        { do: 'shake', ms: 500, amp: 12 },
        { do: 'move', x: 1560, lift: 44, ms: 430, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 1740, height: 130, ms: 650, pose: 'leap' },
        { do: 'impact', x: 1740, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1450 },
      ],
    },
  },

  // Level 3: the wall smash (WALL_SMASH, anchor 300). He pushes the ore cart from 90px
  // behind it; its front meets the cave-in (1000–1110) when he reaches 850. After the smash he
  // runs on at the push's final speed, 0.83px/ms. Beats: a worried look at the cave-in, a
  // shouting cut-in, the push under a low tilted camera and focus lines, the wall bursting
  // (a big impact, hit-stop, then the run through the debris in slow motion), a cheer.
  3: {
    obstacle: 'wall-smash',
    anchor: 300,
    width: 1600,
    script: {
      startX: 100,
      steps: [
        { do: 'walk', x: 310, ms: 900 },
        { do: 'hold', pose: 'brace', ms: 250, expr: 'surprised' },
        { do: 'emote', emote: 'sweat' },
        { do: 'hold', pose: 'brace', ms: 350, expr: 'worried' },
        { do: 'cutin', ms: 720, expr: 'shout' },
        { do: 'hold', pose: 'brace', ms: 720, expr: 'determined' },
        { do: 'caption' },
        { do: 'prop', state: 'push' },
        { do: 'camera', zoom: 1.14, tilt: 3, ms: 500 },
        { do: 'action', ms: 1300 },
        { do: 'move', x: 850, lift: 0, ms: 1300, pose: 'run', ease: 'in', expr: 'shout' },
        { do: 'prop', state: 'smash' },
        { do: 'impact', x: 1040, lift: 170, size: 1.1 },
        { do: 'run', x: 900, ms: 60 },
        { do: 'freeze', ms: 130 },
        { do: 'shake', ms: 700, amp: 16 },
        { do: 'slow', ms: 300, rate: 0.45 },
        { do: 'run', x: 1150, ms: 300 },
        { do: 'camera', zoom: 1, ms: 300 },
        { do: 'move', x: 1280, lift: 0, ms: 310, pose: 'run', ease: 'out' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.1, ms: 200 },
        { do: 'hold', pose: 'cheer', ms: 300 },
        { do: 'camera', zoom: 1, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1200 },
      ],
    },
  },

  // Level 4: the rat swarm (RAT_SWARM, anchor 300). The chain hangs from 700 (295px to his
  // hands, which are 175px above his feet). He grabs it 30° left of straight down, swings
  // through the bottom, and lets go 30° right; the rats pour out of the hole at 900 at
  // 0.55px/ms, so he must be off the ground within about 700ms. Beats: a hit-stop and a
  // close-up of his surprised face as they pour out, a snap on the chain, the swing over them
  // slowing at the bottom under a tilted camera and focus lines, a sparkling landing.
  4: {
    obstacle: 'rat-swarm',
    anchor: 300,
    width: 1280,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 1000 },
        { do: 'prop', state: 'swarm' },
        { do: 'emote', emote: 'alert' },
        { do: 'hold', pose: 'brace', ms: 70, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 500, amp: 6 },
        { do: 'camera', zoom: 1.7, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 300, expr: 'surprised' },
        { do: 'camera', zoom: 1.1, ms: 180 },
        { do: 'caption' },
        { do: 'jump', x: 552.5, lift: 129.5, height: 60, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'grab' },
        { do: 'impact', x: 552.5, lift: 304.5, size: 0.35 },
        { do: 'camera', zoom: 1.2, tilt: -4, ms: 350 },
        { do: 'action', ms: 1100 },
        { do: 'move', x: 700, lift: 90, ms: 550, pose: 'swing', ease: 'in' },
        { do: 'slow', ms: 300, rate: 0.4 },
        { do: 'move', x: 847.5, lift: 129.5, ms: 550, pose: 'swing', ease: 'out' },
        { do: 'prop', state: 'letgo' },
        { do: 'camera', zoom: 1, ms: 350 },
        { do: 'jump', x: 1100, height: 70, ms: 550, pose: 'leap' },
        { do: 'impact', x: 1100, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.12, ms: 200 },
        { do: 'hold', pose: 'cheer', ms: 200 },
        { do: 'camera', zoom: 1, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1300 },
      ],
    },
  },

  // Level 5: the crystal cavern (CRYSTAL_CAVERN, anchor 300). The chasm spans 320–940;
  // the spire tops are at 440, 600 and 760, standing 90px up. Each spire sinks as he leaves
  // it. Beats: the ledge cracks under his feet (hit-stop, a sweat drop, a close-up of his
  // worried face), a little burst on each spire he lands on, the last leap in slow motion
  // under a tilted camera and focus lines, a sparkling landing.
  5: {
    obstacle: 'crystal-cavern',
    anchor: 300,
    width: 1280,
    script: {
      startX: 100,
      steps: [
        { do: 'walk', x: 290, ms: 800 },
        { do: 'prop', state: 'crumble' },
        { do: 'impact', x: 290, lift: 0, size: 0.45 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 600, amp: 8 },
        { do: 'emote', emote: 'sweat' },
        { do: 'camera', zoom: 1.65, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 330, expr: 'worried' },
        { do: 'camera', zoom: 1.08, ms: 200 },
        { do: 'caption' },
        { do: 'jump', x: 440, lift: 90, height: 60, ms: 500, pose: 'leap' },
        { do: 'impact', x: 440, lift: 90, size: 0.3 },
        { do: 'hold', pose: 'idle', ms: 150, expr: 'determined' },
        { do: 'prop', state: 'sink1' },
        { do: 'jump', x: 600, lift: 90, height: 60, ms: 500, pose: 'leap' },
        { do: 'impact', x: 600, lift: 90, size: 0.3 },
        { do: 'hold', pose: 'idle', ms: 150, expr: 'determined' },
        { do: 'prop', state: 'sink2' },
        { do: 'jump', x: 760, lift: 90, height: 60, ms: 500, pose: 'leap' },
        { do: 'impact', x: 760, lift: 90, size: 0.3 },
        { do: 'hold', pose: 'idle', ms: 150, expr: 'determined' },
        { do: 'prop', state: 'sink3' },
        { do: 'camera', zoom: 1.18, tilt: -4, ms: 300 },
        { do: 'action', ms: 700 },
        { do: 'slow', ms: 300, rate: 0.4 },
        { do: 'jump', x: 1030, height: 100, ms: 560, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 1030, lift: 0, size: 0.55 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1450 },
      ],
    },
  },

  // Level 6: the bat storm (BAT_STORM, anchor 300). The lantern hangs at 400 and lands
  // about 390ms after 'crash'. He slides under the fallen beam (580–740, 155px clear) while
  // the bats sweep over him. Beats: the lantern smashes (impact, hit-stop), a close-up of his
  // surprised face as the bats burst out, a dash, the slide under the beam in slow motion
  // under a tilted camera and focus lines, a sparkle as he stands up past it.
  6: {
    obstacle: 'bat-storm',
    anchor: 300,
    width: 1280,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 280, ms: 800 },
        { do: 'prop', state: 'crash' },
        { do: 'hold', pose: 'brace', ms: 390, expr: 'surprised' },
        { do: 'impact', x: 400, lift: 14, size: 0.75 },
        { do: 'hold', pose: 'brace', ms: 60 },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 300, amp: 8 },
        { do: 'prop', state: 'bats' },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.7, ms: 180 },
        { do: 'hold', pose: 'brace', ms: 320, expr: 'surprised' },
        { do: 'camera', zoom: 1.1, tilt: 3, ms: 200 },
        { do: 'caption' },
        { do: 'run', x: 520, ms: 330, expr: 'determined' },
        { do: 'action', ms: 800 },
        { do: 'camera', zoom: 1.2, tilt: -4, ms: 250 },
        { do: 'slow', ms: 350, rate: 0.4 },
        { do: 'move', x: 900, lift: 0, ms: 750, pose: 'slide', ease: 'out' },
        { do: 'camera', zoom: 1, ms: 300 },
        { do: 'walk', x: 960, ms: 260 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 7: the runaway lift (RUNAWAY_LIFT, anchor 300). The cage is at 400, the chain at
  // 450, the pulley 560px up at 400, and the upper ledge starts at 490, 340px up. He ends
  // standing on the ledge. Beats: a happy ride up, a creak (a sweat drop and a close-up of his
  // worried face), the rope snaps at the pulley (impact, the camera pulls back, hit-stop), he
  // catches the chain with a burst, a determined cut-in as he climbs, a sparkle on the ledge.
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
        { do: 'move', x: 400, lift: 240, ms: 1800, pose: 'idle', expr: 'happy' },
        { do: 'prop', state: 'creak' },
        { do: 'shake', ms: 500, amp: 4 },
        { do: 'emote', emote: 'sweat' },
        { do: 'camera', zoom: 1.6, ms: 250 },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'worried' },
        { do: 'prop', state: 'snap' },
        { do: 'impact', x: 400, lift: 520, size: 0.6 },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 700, amp: 12 },
        { do: 'emote', emote: 'alert' },
        { do: 'caption' },
        { do: 'move', x: 450, lift: 250, ms: 250, pose: 'swing', ease: 'out', expr: 'shout' },
        { do: 'impact', x: 450, lift: 425, size: 0.35 },
        { do: 'cutin', ms: 650, expr: 'determined' },
        { do: 'move', x: 450, lift: 330, ms: 1000, pose: 'climb', ease: 'linear' },
        { do: 'jump', x: 560, lift: 340, height: 40, ms: 450 },
        { do: 'impact', x: 560, lift: 340, size: 0.45 },
        { do: 'hold', pose: 'idle', ms: 50 },
        { do: 'freeze', ms: 70 },
        { do: 'walk', x: 700, ms: 500, expr: 'happy' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.1, ms: 200 },
        { do: 'hold', pose: 'cheer', ms: 300 },
        { do: 'camera', zoom: 1, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1200 },
      ],
    },
  },

  // Level 8 (boss): escape the mine (MINE_TRAIN, anchor 300). The engine pushes the cart
  // from 170px behind. The tunnel mouth is at 1300, the canyon spans 1500–1850, and the cart
  // stops at 2150. Full speed is about 0.91px/ms (the braking's first 50px are split off so
  // the landing can freeze). Rocks fall where the train just was; the first one lands at 70,
  // 455ms after 'rumble'. Beats: the first rock crashes down (impact, hit-stop, his surprised
  // face), a determined cut-in, the escape under a tilted camera and focus lines, the leap
  // over the canyon in slow motion, a big landing (hit-stop, shake), a sparkling hop out.
  8: {
    obstacle: 'mine-train',
    anchor: 300,
    width: 2500,
    sign: { x: 2000, text: 'Whispering Forest' },
    foreground: false,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 330, ms: 800 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 1500, amp: 8 },
        { do: 'hold', pose: 'brace', ms: 455, expr: 'surprised' },
        { do: 'impact', x: 70, lift: 15, size: 1.1 },
        { do: 'hold', pose: 'brace', ms: 60 },
        { do: 'freeze', ms: 120 },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.8, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 300, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 180 },
        { do: 'cutin', ms: 750, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 750, expr: 'determined' },
        { do: 'jump', x: 400, lift: 44, height: 60, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'board' },
        { do: 'camera', zoom: 1.12, tilt: -3, ms: 400 },
        { do: 'action', ms: 1000 },
        { do: 'move', x: 900, lift: 44, ms: 1100, pose: 'ride', ease: 'in' },
        { do: 'move', x: 1500, lift: 44, ms: 660, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'fly' },
        { do: 'caption' },
        { do: 'camera', zoom: 1.22, tilt: -6, ms: 300 },
        { do: 'action', ms: 1100 },
        { do: 'slow', ms: 420, rate: 0.35 },
        { do: 'jump', x: 1880, lift: 44, height: 170, ms: 640, pose: 'ride', expr: 'shout' },
        { do: 'prop', state: 'land' },
        { do: 'impact', x: 1880, lift: 30, size: 1.05 },
        { do: 'camera', zoom: 1, ms: 300 },
        { do: 'move', x: 1930, lift: 44, ms: 55, pose: 'ride', ease: 'linear' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 600, amp: 14 },
        { do: 'move', x: 2150, lift: 44, ms: 484, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2380, height: 140, ms: 700, pose: 'leap' },
        { do: 'impact', x: 2380, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.15, ms: 220 },
        { do: 'hold', pose: 'cheer', ms: 300 },
        { do: 'camera', zoom: 1, ms: 700 },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },
};
