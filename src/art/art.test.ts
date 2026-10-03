import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HAIR_COLORS, HAIR_STYLES, PANTS_COLORS, SHOE_COLORS, SKIN_TONES } from '../content/avatar';
import { PROFILE_COLORS } from '../content/profiles';
import { SHOP_ITEMS } from '../content/shop';
import { avatarForProfile, DEFAULT_AVATAR } from './hero/avatar';
import { Hero } from './hero/Hero';
import { EXPRESSIONS } from './hero/expressions';
import { ItemIcon } from './hero/ItemIcon';
import { HERO_POSES } from './hero/poses';
import { mix, shade, tint } from './style';
import { PAINTED_MINE } from './worlds/minePalette';
import { PAINTED_MOUNTAIN } from './worlds/mountainPalette';
import { PAINTED_RIVER } from './worlds/riverPalette';
import { getWorldArt, WORLD_ART } from './worlds/registry';
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

  it('draws World 1 as the painted mine, with rails on the path', () => {
    expect(getWorldArt(1).theme.kind).toBe('mine');
    expect(render(1)).toContain(PAINTED_MINE.rail);
    expect(render(1)).not.toContain('NaN');
    expect(render(1)).not.toContain('filter');
  });

  it('draws World 3 as the painted river, with reeds in front in scenes only', () => {
    expect(getWorldArt(3).theme.kind).toBe('river');
    expect(render(3)).toContain(PAINTED_RIVER.waterLight);
    const front = (foreground: boolean) =>
      renderToStaticMarkup(
        createElement(WorldBackdrop, {
          worldId: 3,
          height: 800,
          horizon: 330,
          groundTop: 470,
          pathY: 640,
          foreground,
        }),
      );
    // The reeds' cattail heads are the front layer's darkest brown.
    expect(front(true)).toContain('#2a170e');
    expect(front(false)).not.toContain('#2a170e');
  });

  it('draws World 4 as the painted mountains, with pines in front in scenes only', () => {
    expect(getWorldArt(4).theme.kind).toBe('mountain');
    expect(render(4)).toContain(PAINTED_MOUNTAIN.snowTop);
    const front = (foreground: boolean) =>
      renderToStaticMarkup(
        createElement(WorldBackdrop, {
          worldId: 4,
          height: 800,
          horizon: 330,
          groundTop: 470,
          pathY: 640,
          foreground,
        }),
      );
    // The young pines in front of the camera are the front layer's darkest green.
    expect(front(true)).toContain('#0e2a24');
    expect(front(false)).not.toContain('#0e2a24');
  });

  it.each([1, 2, 3, 4, 5])('draws World %s in its own style, cleanly', (worldId) => {
    const kinds = { 1: 'mine', 2: 'forest', 3: 'river', 4: 'mountain', 5: 'canyon' } as const;
    expect(getWorldArt(worldId).theme.kind).toBe(kinds[worldId as keyof typeof kinds]);
    for (const [height, horizon, groundTop, pathY] of [
      [240, 120, 168, 206],
      [800, 330, 470, 640],
      [800, 190, 290, undefined],
    ] as const) {
      for (const scroll of [0, 700]) {
        const svg = renderToStaticMarkup(
          createElement(WorldBackdrop, {
            worldId,
            height,
            horizon,
            groundTop,
            pathY,
            scroll,
            foreground: true,
          }),
        );
        expect(svg).not.toContain('NaN');
        expect(svg).not.toContain('filter');
      }
    }
  });

  it('falls back to the first world for unknown worlds', () => {
    expect(getWorldArt(99)).toBe(WORLD_ART[1]);
    expect(render(99)).not.toContain('NaN');
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
  it.each(HERO_POSES)('draws the %s pose for every face, hair style and skin tone', (pose) => {
    for (const hairStyle of HAIR_STYLES) {
      for (const skin of SKIN_TONES) {
        for (const expression of [undefined, ...EXPRESSIONS]) {
          const svg = renderToStaticMarkup(
            createElement(Hero, {
              avatar: { ...DEFAULT_AVATAR, hairStyle, skin: skin.value },
              pose,
              expression,
              wind: hairStyle === 'curly' ? 1 : 0.4,
            }),
          );
          expect(svg).toContain(`hero-svg--${pose}`);
          expect(svg).not.toContain('NaN');
          // No CSS filters: they are slow on tablets.
          expect(svg).not.toContain('filter');
        }
      }
    }
  });

  it.each(SHOP_ITEMS.map((i) => [i.id, i] as const))('wears %s, and draws it alone', (_, item) => {
    for (const hairStyle of HAIR_STYLES) {
      const svg = renderToStaticMarkup(
        createElement(Hero, {
          avatar: { ...DEFAULT_AVATAR, hairStyle, gear: { [item.slot]: item.id } },
          pose: 'walk',
        }),
      );
      const marker = { hat: 'gear-hat', cape: item.color, pack: 'gear-pack', pet: 'hero-pet' };
      expect(svg).toContain(marker[item.slot]);
      expect(svg).not.toContain('NaN');
      expect(svg).not.toContain('filter');
    }
    const icon = renderToStaticMarkup(createElement(ItemIcon, { item, size: 100 }));
    expect(icon).toContain('item-icon');
    expect(icon).not.toContain('NaN');
  });

  it('draws the cut-in close-up through its whole slide, hat and all', async () => {
    const { CutIn } = await import('./hero/CutIn');
    for (const layout of ['scene', 'strip'] as const) {
      for (const dt of [0, 70, 400, 700, 790]) {
        const svg = renderToStaticMarkup(
          createElement(CutIn, {
            dt,
            ms: 800,
            expr: 'determined',
            avatar: { ...DEFAULT_AVATAR, gear: { hat: 'wizard-hat' } },
            layout,
          }),
        );
        expect(svg).toContain('cutin');
        expect(svg).toContain('gear-hat');
        expect(svg).not.toContain('NaN');
        expect(svg).not.toContain('filter');
      }
    }
  });
});
