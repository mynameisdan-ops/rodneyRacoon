import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HAIR_COLORS, HAIR_STYLES, PANTS_COLORS, SHOE_COLORS, SKIN_TONES } from '../content/avatar';
import { PROFILE_COLORS } from '../content/profiles';
import { avatarForProfile, DEFAULT_AVATAR } from './hero/avatar';
import { Hero } from './hero/Hero';
import { HERO_POSES } from './hero/poses';
import { mix, shade, tint } from './style';
import { getTheme, MEADOW, MINE } from './worlds/themes';
import { WorldBackdrop } from './worlds/WorldBackdrop';

describe('avatar', () => {
  it('builds the default avatar from the offered options', () => {
    expect(SKIN_TONES.map((t) => t.value)).toContain(DEFAULT_AVATAR.skin);
    expect(HAIR_COLORS.map((c) => c.value)).toContain(DEFAULT_AVATAR.hairColor);
    expect(HAIR_STYLES).toContain(DEFAULT_AVATAR.hairStyle);
    expect(PANTS_COLORS).toContain(DEFAULT_AVATAR.pants);
    expect(SHOE_COLORS).toContain(DEFAULT_AVATAR.shoes);
  });

  it('gives every player color its own shirt and keeps the rest of the default', () => {
    for (const color of PROFILE_COLORS) {
      const avatar = avatarForProfile({ color: color.value });
      expect(avatar.shirt).toBe(color.value);
      expect({ ...avatar, shirt: DEFAULT_AVATAR.shirt }).toEqual(DEFAULT_AVATAR);
    }
  });

  it('has no duplicate options', () => {
    for (const list of [
      SKIN_TONES.map((t) => t.value),
      HAIR_COLORS.map((c) => c.value),
      HAIR_STYLES,
      HERO_POSES,
    ]) {
      expect(new Set(list).size).toBe(list.length);
    }
  });
});

describe('world backdrops', () => {
  const render = (worldId: number, scroll = 0) =>
    renderToStaticMarkup(
      createElement(WorldBackdrop, {
        worldId,
        height: 240,
        horizon: 120,
        groundTop: 170,
        pathY: 200,
        scroll,
      }),
    );

  it('places the scenery the same way every time', () => {
    expect(render(1)).toBe(render(1));
  });

  it('places it differently for a different world seed', () => {
    expect(render(1)).not.toBe(render(2));
  });

  it('draws World 1 as the mine, with rails on the path', () => {
    expect(getTheme(1).kind).toBe('mine');
    expect(render(1)).toContain(MINE.rail);
    expect(render(1)).not.toContain('NaN');
  });

  it('falls back to the meadow for worlds without a theme yet', () => {
    expect(getTheme(5)).toBe(MEADOW);
    expect(render(5)).not.toContain('NaN');
  });
});

describe('style kit', () => {
  it('mixes colors', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mix('#123456', '#abcdef', 0)).toBe('#123456');
    expect(mix('#fff', '#000', 1)).toBe('#000000');
  });

  it('shades darker and tints lighter', () => {
    const lum = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      return ((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255);
    };
    for (const c of ['#e63946', '#2d4a7a', '#f6d2b5']) {
      expect(lum(shade(c))).toBeLessThan(lum(c));
      expect(lum(tint(c))).toBeGreaterThan(lum(c));
    }
  });
});

describe('hero', () => {
  it.each(HERO_POSES)('draws the %s pose for every hair style and skin tone', (pose) => {
    for (const hairStyle of HAIR_STYLES) {
      for (const skin of SKIN_TONES) {
        const svg = renderToStaticMarkup(
          createElement(Hero, { avatar: { ...DEFAULT_AVATAR, hairStyle, skin: skin.value }, pose }),
        );
        expect(svg).toContain(`hero-svg--${pose}`);
        expect(svg).not.toContain('NaN');
        // No CSS filters: they are slow on tablets.
        expect(svg).not.toContain('filter');
      }
    }
  });
});
