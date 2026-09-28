import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HAIR_COLORS, HAIR_STYLES, PANTS_COLORS, SHOE_COLORS, SKIN_TONES } from '../content/avatar';
import { PROFILE_COLORS } from '../content/profiles';
import { avatarForProfile, DEFAULT_AVATAR } from './hero/avatar';
import { HERO_POSES } from './hero/poses';
import { getTheme } from './worlds/themes';
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

  it('falls back to the meadow for worlds without a theme yet', () => {
    expect(getTheme(5)).toBe(getTheme(1));
  });
});
