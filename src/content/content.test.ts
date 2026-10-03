import { describe, expect, it } from 'vitest';
import { OBSTACLES } from '../art/obstacles/registry';
import { WORLD_ART } from '../art/worlds/registry';
import { getCutScene } from './cutscenes';
import { LEVELS, WORLDS } from './levels';
import { SHOP_ITEMS } from './shop';
import { SKILL_AGE } from './skills';
import { getSticker } from './stickers';

/** Everything a world and its levels need: a new world fails here until it has all of it. */
describe('content', () => {
  it('numbers worlds and levels 1, 2, 3… in play order', () => {
    expect(WORLDS.map((w) => w.id)).toEqual(WORLDS.map((_, i) => i + 1));
    expect(LEVELS.map((l) => l.id)).toEqual(LEVELS.map((_, i) => i + 1));
    const worlds = LEVELS.map((l) => l.world);
    expect(worlds).toEqual([...worlds].sort((a, b) => a - b));
  });

  it.each(WORLDS.map((w) => [w.id, w] as const))(
    'world %s has its art, levels and a boss at the end',
    (_, world) => {
      expect(WORLD_ART[world.id], 'an entry in art/worlds/registry.ts').toBeDefined();
      const levels = LEVELS.filter((l) => l.world === world.id);
      expect(levels.length).toBeGreaterThan(0);
      expect(levels.filter((l) => l.boss)).toEqual([levels.at(-1)]);
    },
  );

  it.each(LEVELS.map((l) => [l.id, l] as const))(
    'level %s has a scene, a sticker, a skill age and sane numbers',
    (_, level) => {
      const scene = getCutScene(level.id);
      expect(scene, 'a script in content/cutscenes/').toBeDefined();
      expect(OBSTACLES[scene!.obstacle], 'art in art/obstacles/').toBeDefined();
      expect(getSticker(level.id), 'a row in content/stickers.ts').toBeDefined();
      expect(SKILL_AGE[level.skill], 'an age in content/skills.ts').toBeGreaterThan(0);
      const [fewest, most] = level.problems;
      expect(fewest).toBeGreaterThan(0);
      expect(most).toBeGreaterThanOrEqual(fewest);
      const [low, high] = level.band;
      expect(low).toBeGreaterThanOrEqual(0);
      expect(high).toBeGreaterThan(low);
      expect(high).toBeLessThanOrEqual(1);
      // Captions stay short: gameplay must never depend on reading.
      expect(level.caption.length).toBeLessThanOrEqual(24);
    },
  );

  it('has shop items with unique ids and a price', () => {
    expect(new Set(SHOP_ITEMS.map((i) => i.id)).size).toBe(SHOP_ITEMS.length);
    for (const item of SHOP_ITEMS) expect(item.price, item.id).toBeGreaterThan(0);
  });
});
