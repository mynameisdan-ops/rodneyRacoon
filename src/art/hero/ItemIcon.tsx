import type { GearSlot, ShopItem } from '../../content/shop';
import { Cape, Hat, Pack, Pet } from './gear';

/** Where each slot's gear sits in the Hero's 100×170 view, so a shop item can be drawn alone. */
const VIEW: Record<GearSlot, string> = {
  hat: '22 -32 68 64',
  cape: '6 48 58 94',
  pack: '10 30 48 84',
  pet: '62 90 66 76',
};

/** A shop item on its own (no hero), for shop cards and tabs. */
export function ItemIcon({ item, size }: { item: ShopItem; size: number }) {
  return (
    <svg width={size} height={size} viewBox={VIEW[item.slot]} aria-hidden className="item-icon">
      {item.slot === 'hat' && <Hat item={item} />}
      {item.slot === 'cape' && <Cape color={item.color} item={item} />}
      {item.slot === 'pack' && <Pack item={item} />}
      {item.slot === 'pet' && <Pet item={item} />}
    </svg>
  );
}
