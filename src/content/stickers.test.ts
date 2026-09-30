import { describe, expect, it } from 'vitest';
import { getCutScene } from './cutscenes';
import { LEVELS } from './levels';
import { STICKERS } from './stickers';

describe('stickers', () => {
  it('has one sticker per level, each with a scene to take its still from', () => {
    expect(STICKERS.map((s) => s.level)).toEqual(LEVELS.map((l) => l.id));
    for (const s of STICKERS) expect(getCutScene(s.level)).toBeDefined();
  });

  it('has unique names and moments inside the scene', () => {
    expect(new Set(STICKERS.map((s) => s.name)).size).toBe(STICKERS.length);
    for (const s of STICKERS) {
      expect(s.moment).toBeGreaterThanOrEqual(0);
      expect(s.moment).toBeLessThanOrEqual(1);
    }
  });
});
