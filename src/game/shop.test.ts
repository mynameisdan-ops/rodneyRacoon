import { describe, expect, it } from 'vitest';
import { GEAR_SLOTS, getItem, SHOP_ITEMS, type ShopItem } from '../content/shop';
import { buy, canBuy, toggleWear, type Wallet } from './shop';

const item = (id: string): ShopItem => getItem(id)!;
const empty: Wallet = { coins: 0, owned: [], gear: {} };

describe('shop content', () => {
  it('has unique ids, positive whole prices, and items in every slot', () => {
    const ids = SHOP_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const i of SHOP_ITEMS) expect(Number.isInteger(i.price) && i.price > 0).toBe(true);
    for (const slot of GEAR_SLOTS) expect(SHOP_ITEMS.some((i) => i.slot === slot)).toBe(true);
  });

  it('lists each slot cheapest first', () => {
    for (const slot of GEAR_SLOTS) {
      const prices = SHOP_ITEMS.filter((i) => i.slot === slot).map((i) => i.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    }
  });
});

describe('buy', () => {
  it('spends the coins, keeps the item and puts it on', () => {
    const hat = item('bandana');
    const w = buy({ ...empty, coins: hat.price + 5 }, hat);
    expect(w).toEqual({ coins: 5, owned: ['bandana'], gear: { hat: 'bandana' } });
    expect(canBuy(w, hat)).toBe('owned');
  });

  it('refuses when short of coins or already owned', () => {
    const hat = item('crown');
    const short = { ...empty, coins: hat.price - 1 };
    expect(canBuy(short, hat)).toBe('short');
    expect(buy(short, hat)).toBe(short);
    const owned = { coins: 999, owned: ['crown'], gear: {} };
    expect(buy(owned, hat)).toBe(owned);
  });

  it('replaces what was worn in the same slot only', () => {
    const w = buy(
      { coins: 500, owned: ['bandana', 'puppy'], gear: { hat: 'bandana', pet: 'puppy' } },
      item('crown'),
    );
    expect(w.gear).toEqual({ hat: 'crown', pet: 'puppy' });
  });
});

describe('toggleWear', () => {
  it('puts an owned item on and takes it off again', () => {
    const w: Wallet = { coins: 0, owned: ['bandana', 'crown'], gear: { hat: 'crown' } };
    const on = toggleWear(w, item('bandana'));
    expect(on.gear).toEqual({ hat: 'bandana' });
    expect(toggleWear(on, item('bandana')).gear).toEqual({});
  });

  it('ignores items not owned', () => {
    expect(toggleWear(empty, item('crown'))).toBe(empty);
  });
});
