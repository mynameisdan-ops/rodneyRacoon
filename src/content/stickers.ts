/**
 * The journey sticker book (data only): one sticker per level, collected the first time the
 * level is passed. A sticker is a still from the level's cut scene with the player's own hero
 * in it; `moment` picks the frame, as a fraction of the scene (0 = start, 1 = end).
 */
export interface StickerDef {
  level: number;
  name: string;
  moment: number;
}

export const STICKERS: readonly StickerDef[] = [
  { level: 1, name: 'Runaway Cart', moment: 0.6 },
  { level: 2, name: 'Cart Jump', moment: 0.6 },
  { level: 3, name: 'Wall Buster', moment: 0.7 },
  { level: 4, name: 'Rat Swarm', moment: 0.5 },
  { level: 5, name: 'Crystal Hop', moment: 0.3 },
  { level: 6, name: 'Bat Storm', moment: 0.5 },
  { level: 7, name: 'Runaway Lift', moment: 0.7 },
  { level: 8, name: 'Mine Train Leap', moment: 0.6 },
  { level: 9, name: 'Log Rider', moment: 0.3 },
  { level: 10, name: 'Bramble Vault', moment: 0.6 },
  { level: 11, name: 'Root Slide', moment: 0.4 },
  { level: 12, name: 'Vine Swing', moment: 0.6 },
  { level: 13, name: 'Grumpy Boar', moment: 0.8 },
  { level: 14, name: 'Bouncy Mushroom', moment: 0.4 },
  { level: 15, name: 'Falling Bridge', moment: 0.6 },
  { level: 16, name: 'Firefly Guides', moment: 0.5 },
  { level: 17, name: 'Stepping Stones', moment: 0.6 },
  { level: 18, name: 'Beaver Dam', moment: 0.6 },
  { level: 19, name: 'Rapids Rider', moment: 0.5 },
  { level: 20, name: 'Rope Bridge', moment: 0.5 },
  { level: 21, name: 'Geyser Blast', moment: 0.5 },
  { level: 22, name: 'Waterfall Slide', moment: 0.5 },
  { level: 23, name: 'High Ground', moment: 0.4 },
  { level: 24, name: 'River Raft', moment: 0.6 },
  { level: 25, name: 'Rock Slide', moment: 0.7 },
  { level: 26, name: 'Crumbling Ledge', moment: 0.5 },
  { level: 27, name: 'Avalanche', moment: 0.5 },
  { level: 28, name: 'Mountain Goat', moment: 0.6 },
  { level: 29, name: 'Ice Bridge', moment: 0.5 },
  { level: 30, name: 'Icicle Cave', moment: 0.5 },
  { level: 31, name: 'Ice Wall', moment: 0.4 },
  { level: 32, name: 'Storm Sled', moment: 0.5 },
  { level: 33, name: 'Flash Flood', moment: 0.5 },
  { level: 34, name: 'Zip Line', moment: 0.5 },
  { level: 35, name: 'Dune Surfer', moment: 0.4 },
  { level: 36, name: 'Tumbleweeds', moment: 0.6 },
  { level: 37, name: 'Stone Arch', moment: 0.5 },
  { level: 38, name: 'Canyon Train', moment: 0.7 },
  { level: 39, name: 'The Last Hill', moment: 0.6 },
  { level: 40, name: 'Home Sweet Home', moment: 0.7 },
];

export function getSticker(levelId: number): StickerDef | undefined {
  return STICKERS.find((s) => s.level === levelId);
}
