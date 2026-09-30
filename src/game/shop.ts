import type { Gear, ShopItem } from '../content/shop';

/** The part of a player the shop reads and changes. */
export interface Wallet {
  coins: number;
  owned: readonly string[];
  gear: Gear;
}

export type BuyCheck = 'owned' | 'ok' | 'short';

export function canBuy(wallet: Wallet, item: ShopItem): BuyCheck {
  if (wallet.owned.includes(item.id)) return 'owned';
  return wallet.coins >= item.price ? 'ok' : 'short';
}

/** Buys an item and puts it straight on. Returns the wallet unchanged if it can't be bought. */
export function buy<W extends Wallet>(wallet: W, item: ShopItem): W {
  if (canBuy(wallet, item) !== 'ok') return wallet;
  return {
    ...wallet,
    coins: wallet.coins - item.price,
    owned: [...wallet.owned, item.id],
    gear: { ...wallet.gear, [item.slot]: item.id },
  };
}

/** Puts on an owned item, or takes it off if it's already worn. Items not owned are ignored. */
export function toggleWear<W extends Wallet>(wallet: W, item: ShopItem): W {
  if (!wallet.owned.includes(item.id)) return wallet;
  const gear = { ...wallet.gear };
  if (gear[item.slot] === item.id) delete gear[item.slot];
  else gear[item.slot] = item.id;
  return { ...wallet, gear };
}
