import type { ShopItem } from '../../content/shop';
import { BODY } from './body';
import { Cape, Hat, Pack, Pet } from './gear';
import { iconView } from './gearLayout';

/** A shop item on its own (no hero), for shop cards and tabs. */
export function ItemIcon({ item, size }: { item: ShopItem; size: number }) {
  return (
    <svg width={size} height={size} viewBox={iconView(item)} aria-hidden className="item-icon">
      {item.slot === 'hat' && <Hat item={item} s={BODY.head.s} />}
      {item.slot === 'cape' && <Cape color={item.color} item={item} />}
      {item.slot === 'pack' && <Pack item={item} />}
      {item.slot === 'pet' && <Pet item={item} />}
    </svg>
  );
}
