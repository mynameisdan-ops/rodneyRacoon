import { useState } from 'react';
import { avatarForProfile } from '../art/hero/avatar';
import { Hero } from '../art/hero/Hero';
import { ItemIcon } from '../art/hero/ItemIcon';
import { GEAR_SLOTS, SHOP_ITEMS, type GearSlot, type ShopItem } from '../content/shop';
import { canBuy } from '../game/shop';
import type { Profile } from '../state/schema';
import { Coin } from '../ui/icons';

interface Props {
  profile: Profile;
  onBuy: (itemId: string) => void;
  onToggle: (itemId: string) => void;
  onBack: () => void;
}

const SLOT_NAMES: Record<GearSlot, string> = {
  hat: 'Hats',
  cape: 'Capes',
  pack: 'Packs',
  pet: 'Pets',
};

/**
 * The avatar shop. Tapping an item tries it on the big hero; the button under him buys it
 * (or puts it on / takes it off once it's owned).
 */
export function ShopScreen({ profile, onBuy, onToggle, onBack }: Props) {
  const [slot, setSlot] = useState<GearSlot>('hat');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = SHOP_ITEMS.find((i) => i.id === selectedId);
  const items = SHOP_ITEMS.filter((i) => i.slot === slot);

  // Try the selected item on over what he's wearing.
  const gear = selected ? { ...profile.gear, [selected.slot]: selected.id } : profile.gear;
  const avatar = avatarForProfile({ ...profile, gear });

  return (
    <div className="shop">
      <div className="shop__hud">
        <button type="button" className="icon-button" aria-label="Back to the map" onClick={onBack}>
          ◀
        </button>
        <h1 className="shop__title">Shop</h1>
        <div className="coin-chip">
          <Coin size={44} />
          {profile.coins}
        </div>
      </div>

      <div className="shop__body">
        <div className="shop__stage">
          <div className="shop__pedestal" />
          {/* Keyed so trying something on replays the little hop. */}
          <div className="shop__hero" key={selectedId ?? 'worn'}>
            <Hero avatar={avatar} size={400} />
          </div>
          {selected && (
            <ShopAction
              item={selected}
              profile={profile}
              onBuy={() => {
                onBuy(selected.id);
                setSelectedId(null);
              }}
              onToggle={() => {
                onToggle(selected.id);
                setSelectedId(null);
              }}
            />
          )}
        </div>

        <div className="shop__shelf">
          <div className="shop__tabs" role="tablist">
            {GEAR_SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={s === slot}
                className={s === slot ? 'shop__tab shop__tab--on' : 'shop__tab'}
                onClick={() => {
                  setSlot(s);
                  setSelectedId(null);
                }}
              >
                <ItemIcon item={SHOP_ITEMS.find((i) => i.slot === s)!} size={56} />
                <span>{SLOT_NAMES[s]}</span>
              </button>
            ))}
          </div>
          <div className="shop__grid">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                profile={profile}
                selected={item.id === selectedId}
                onSelect={() => setSelectedId(item.id === selectedId ? null : item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemCard({
  item,
  profile,
  selected,
  onSelect,
}: {
  item: ShopItem;
  profile: Profile;
  selected: boolean;
  onSelect: () => void;
}) {
  const state = canBuy(profile, item);
  const worn = profile.gear[item.slot] === item.id;
  const cls = [
    'item-card',
    selected ? 'item-card--selected' : '',
    state === 'owned' ? 'item-card--owned' : '',
    state === 'short' ? 'item-card--short' : '',
  ].join(' ');
  return (
    <button type="button" className={cls} onClick={onSelect} aria-pressed={selected}>
      <ItemIcon item={item} size={110} />
      <span className="item-card__name">{item.name}</span>
      {state === 'owned' ? (
        <span className="item-card__owned">{worn ? '✓ Wearing' : '✓ Yours'}</span>
      ) : (
        <span className="item-card__price">
          <Coin size={28} />
          {item.price}
        </span>
      )}
    </button>
  );
}

function ShopAction({
  item,
  profile,
  onBuy,
  onToggle,
}: {
  item: ShopItem;
  profile: Profile;
  onBuy: () => void;
  onToggle: () => void;
}) {
  const state = canBuy(profile, item);
  if (state === 'owned') {
    const worn = profile.gear[item.slot] === item.id;
    return (
      <button type="button" className="big-button shop__action" onClick={onToggle}>
        {worn ? 'Take off' : 'Wear it'}
      </button>
    );
  }
  if (state === 'short') {
    return (
      <div className="shop__need">
        Need <Coin size={34} /> {item.price - profile.coins} more
      </div>
    );
  }
  return (
    <button type="button" className="big-button shop__action" onClick={onBuy}>
      Buy <Coin size={40} /> {item.price}
    </button>
  );
}
