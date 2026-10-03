import type { HatArt, ShopItem } from '../../../content/shop';

/*
 * Where shop gear sits (M7b). Hats are drawn in the head's own units (around the middle of the
 * skull, see `Head`), so they turn and scale with it; capes, packs and pets in the hero's
 * 100×170 view.
 */

/**
 * The hat's band, in head units: hair above it is tucked under the hat (so spikes don't poke
 * through a helmet). Left out for hats that sit on top of the hair, like the crown.
 */
export const HAT_LINE: Partial<Record<HatArt, number>> = {
  bandana: -20,
  explorer: -19,
  miner: -18,
  wizard: -19,
  viking: -18,
};

/** The viewBox that frames each item on its own (shop cards and tabs), around its drawing. */
const ICON_VIEW: Record<ShopItem['art'], string> = {
  // Hats, in head units.
  bandana: '-52 -64 92 92',
  explorer: '-48 -78 100 100',
  miner: '-32 -86 110 110',
  wizard: '-50 -102 100 100',
  viking: '-53 -86 100 100',
  crown: '-32 -72 66 66',
  // Capes, packs and pets, in the hero's view.
  plain: '-15 45 96 96',
  leaves: '-15 45 96 96',
  stars: '-15 45 96 96',
  flames: '-15 45 96 96',
  waves: '-15 45 96 96',
  backpack: '12 51 44 44',
  'map-tube': '-4 32 72 72',
  bedroll: '6 43 52 52',
  rocket: '0 49 66 66',
  puppy: '60 104 68 68',
  kitten: '60 104 68 68',
  fox: '60 104 68 68',
  raccoon: '60 104 68 68',
  owl: '67 79 56 56',
  dragon: '60 74 64 64',
};

export const iconView = (item: ShopItem) => ICON_VIEW[item.art];
