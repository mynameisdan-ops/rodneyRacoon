import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { OBSTACLES } from '../art/obstacles/registry';
import { OBSTACLE_IDS } from '../art/obstacles/types';
import { buildTimeline, cameraFor, sampleTimeline } from '../cutscenes/timeline';
import { CUT_SCENES } from './cutscenes';
import { LEVELS } from './levels';

describe('cut scenes', () => {
  it('every level has one', () => {
    for (const level of LEVELS) expect(CUT_SCENES[level.id], `level ${level.id}`).toBeDefined();
  });

  it.each(Object.entries(CUT_SCENES))('level %s: timing, placement and camera', (_, scene) => {
    const tl = buildTimeline(scene.script);
    // Short enough to keep a kid's attention, long enough to read as a story.
    expect(tl.duration).toBeGreaterThanOrEqual(4000);
    expect(tl.duration).toBeLessThanOrEqual(14000);
    expect(tl.captionAt).not.toBeNull();

    const end = sampleTimeline(tl, tl.duration);
    const art = OBSTACLES[scene.obstacle];
    // He ends past the obstacle, on the ground, and on screen.
    expect(end.x).toBeGreaterThan(scene.anchor + art.width);
    expect(end.lift).toBe(0);
    expect(end.x).toBeLessThan(scene.width - 60);
    expect(end.pose === 'cheer' || end.pose === 'idle').toBe(true);

    // The backdrop's near layer is a doubled 1280px tile: the camera must stay within it.
    expect(scene.width).toBeGreaterThanOrEqual(1280);
    expect(cameraFor(end.x, scene.width)).toBeLessThan(1280);
  });
});

describe('obstacle art', () => {
  it.each(OBSTACLE_IDS)('%s renders in every state without errors', (id) => {
    const art = OBSTACLES[id];
    for (const state of ['idle', 'rustle', 'splash', 'curious', 'home', 'gust', 'peek', 'wobble']) {
      for (const heroX of [-200, 50, art.width / 2, art.width + 100]) {
        const props = { t: 1234, state, since: 1000, heroX, heroLift: -20 };
        const svg = renderToStaticMarkup(
          createElement(
            'svg',
            null,
            createElement(art.back, props),
            art.front && createElement(art.front, props),
          ),
        );
        expect(svg).not.toContain('NaN');
      }
    }
  });
});
