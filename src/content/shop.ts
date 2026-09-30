/**
 * The avatar shop (data only). Each item is worn in one slot; its `art` picks the drawing in
 * `art/hero/gear.tsx` and the colors tint it, so a new color is just a new entry.
 */

export const GEAR_SLOTS = ['hat', 'cape', 'pack', 'pet'] as const;
export type GearSlot = (typeof GEAR_SLOTS)[number];

/** What a player is wearing: an item id per slot (a missing slot shows the default look). */
export type Gear = Partial<Record<GearSlot, string>>;

export type HatArt = 'bandana' | 'explorer' | 'miner' | 'wizard' | 'viking' | 'crown';
export type CapePattern = 'plain' | 'leaves' | 'stars' | 'flames' | 'waves';
export type PackArt = 'backpack' | 'map-tube' | 'bedroll' | 'rocket';
export type PetArt = 'puppy' | 'kitten' | 'fox' | 'owl' | 'raccoon' | 'dragon';

interface ItemBase {
  id: string;
  name: string;
  /** Price in coins. */
  price: number;
  /** Main color. */
  color: string;
  /** Second color (trim, pattern, belly). */
  accent: string;
}

export type ShopItem =
  | (ItemBase & { slot: 'hat'; art: HatArt })
  | (ItemBase & { slot: 'cape'; art: CapePattern })
  | (ItemBase & { slot: 'pack'; art: PackArt })
  | (ItemBase & { slot: 'pet'; art: PetArt });

/** In shop order: cheapest first within each slot, so an early visit can already buy something. */
export const SHOP_ITEMS: readonly ShopItem[] = [
  {
    id: 'bandana',
    slot: 'hat',
    art: 'bandana',
    name: 'Bandana',
    price: 20,
    color: '#d62f3a',
    accent: '#fff3d6',
  },
  {
    id: 'explorer-hat',
    slot: 'hat',
    art: 'explorer',
    name: 'Explorer hat',
    price: 40,
    color: '#c9a36a',
    accent: '#6b4226',
  },
  {
    id: 'miner-helmet',
    slot: 'hat',
    art: 'miner',
    name: 'Miner helmet',
    price: 60,
    color: '#f2c230',
    accent: '#fff3a0',
  },
  {
    id: 'wizard-hat',
    slot: 'hat',
    art: 'wizard',
    name: 'Wizard hat',
    price: 120,
    color: '#3b3f9e',
    accent: '#ffd84a',
  },
  {
    id: 'viking-helmet',
    slot: 'hat',
    art: 'viking',
    name: 'Viking helmet',
    price: 180,
    color: '#9aa7b4',
    accent: '#f4ead2',
  },
  {
    id: 'crown',
    slot: 'hat',
    art: 'crown',
    name: 'Crown',
    price: 300,
    color: '#ffc53d',
    accent: '#e63946',
  },

  {
    id: 'leaf-cape',
    slot: 'cape',
    art: 'leaves',
    name: 'Leaf cape',
    price: 30,
    color: '#2f7d4f',
    accent: '#7cc46a',
  },
  {
    id: 'wave-cape',
    slot: 'cape',
    art: 'waves',
    name: 'Wave cape',
    price: 60,
    color: '#1f6fb2',
    accent: '#8fd3f4',
  },
  {
    id: 'royal-cape',
    slot: 'cape',
    art: 'plain',
    name: 'Royal cape',
    price: 90,
    color: '#7a2a8c',
    accent: '#ffc53d',
  },
  {
    id: 'star-cape',
    slot: 'cape',
    art: 'stars',
    name: 'Star cape',
    price: 150,
    color: '#1d2a5c',
    accent: '#ffe066',
  },
  {
    id: 'flame-cape',
    slot: 'cape',
    art: 'flames',
    name: 'Flame cape',
    price: 220,
    color: '#c0262d',
    accent: '#ffb02e',
  },

  {
    id: 'backpack',
    slot: 'pack',
    art: 'backpack',
    name: 'Backpack',
    price: 35,
    color: '#e8743b',
    accent: '#ffd08a',
  },
  {
    id: 'map-tube',
    slot: 'pack',
    art: 'map-tube',
    name: 'Map tube',
    price: 70,
    color: '#8a5a2b',
    accent: '#f3e2b8',
  },
  {
    id: 'bedroll',
    slot: 'pack',
    art: 'bedroll',
    name: 'Camping pack',
    price: 110,
    color: '#2f6b4f',
    accent: '#c8553d',
  },
  {
    id: 'rocket-pack',
    slot: 'pack',
    art: 'rocket',
    name: 'Rocket pack',
    price: 280,
    color: '#c4ccd6',
    accent: '#e63946',
  },

  {
    id: 'puppy',
    slot: 'pet',
    art: 'puppy',
    name: 'Puppy',
    price: 100,
    color: '#c98a4b',
    accent: '#fff3d6',
  },
  {
    id: 'kitten',
    slot: 'pet',
    art: 'kitten',
    name: 'Kitten',
    price: 100,
    color: '#8d8f99',
    accent: '#f6f0e6',
  },
  {
    id: 'fox',
    slot: 'pet',
    art: 'fox',
    name: 'Fox',
    price: 160,
    color: '#e8743b',
    accent: '#fff3d6',
  },
  {
    id: 'owl',
    slot: 'pet',
    art: 'owl',
    name: 'Owl',
    price: 160,
    color: '#9a6433',
    accent: '#f3e2b8',
  },
  {
    id: 'raccoon',
    slot: 'pet',
    art: 'raccoon',
    name: 'Raccoon',
    price: 220,
    color: '#8a8d96',
    accent: '#2b2b33',
  },
  {
    id: 'dragon',
    slot: 'pet',
    art: 'dragon',
    name: 'Baby dragon',
    price: 350,
    color: '#3fae6a',
    accent: '#ffd84a',
  },
];

export function getItem(id: string | undefined): ShopItem | undefined {
  return id === undefined ? undefined : SHOP_ITEMS.find((i) => i.id === id);
}

/** The item a player wears in a slot, if any. */
export function wornItem<S extends GearSlot>(
  gear: Gear | undefined,
  slot: S,
): Extract<ShopItem, { slot: S }> | undefined {
  const item = getItem(gear?.[slot]);
  return item?.slot === slot ? (item as Extract<ShopItem, { slot: S }>) : undefined;
}
