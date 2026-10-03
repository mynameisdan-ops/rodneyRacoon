import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { OBSTACLE_IDS, OBSTACLES } from '../../art/obstacles/registry';
import type { ObstacleProps } from '../../art/obstacles/types';
import { buildTimeline, cameraFor, sampleTimeline } from '../../cutscenes/timeline';
import { CUT_SCENES } from '.';
import { LEVELS } from '../levels';

function draw(id: (typeof OBSTACLE_IDS)[number], props: ObstacleProps): string {
  const art = OBSTACLES[id];
  return renderToStaticMarkup(
    createElement(
      'svg',
      null,
      createElement(art.back, props),
      art.front && createElement(art.front, props),
    ),
  );
}

describe('cut scenes', () => {
  it('every level has one, and every obstacle is used', () => {
    for (const level of LEVELS) expect(CUT_SCENES[level.id], `level ${level.id}`).toBeDefined();
    const used = new Set(Object.values(CUT_SCENES).map((s) => s.obstacle));
    for (const id of OBSTACLE_IDS) expect(used.has(id), id).toBe(true);
  });

  it.each(Object.entries(CUT_SCENES))('level %s: timing, placement and camera', (_, scene) => {
    const tl = buildTimeline(scene.script);
    // Short enough to keep a kid's attention, long enough to read as a story.
    expect(tl.duration).toBeGreaterThanOrEqual(4000);
    expect(tl.duration).toBeLessThanOrEqual(14000);
    // Slow motion and freeze frames stretch it as it plays, but only by a beat or two.
    expect(tl.realDuration).toBeGreaterThanOrEqual(tl.duration);
    expect(tl.realDuration - tl.duration).toBeLessThanOrEqual(1500);
    expect(tl.captionAt).not.toBeNull();

    const end = sampleTimeline(tl, tl.duration);
    const art = OBSTACLES[scene.obstacle];
    // He ends past the obstacle, standing on something (not mid-jump), and on screen.
    expect(end.x).toBeGreaterThan(scene.anchor + art.width);
    expect(end.lift).toBe(end.floor);
    expect(end.x).toBeLessThan(scene.width - 60);
    expect(end.pose === 'cheer' || end.pose === 'idle').toBe(true);

    // The backdrop's near layer is a doubled 1280px tile: the camera must stay within it.
    expect(scene.width).toBeGreaterThanOrEqual(1280);
    expect(cameraFor(end.x, scene.width)).toBeLessThan(1280);
  });

  it.each(Object.entries(CUT_SCENES))('level %s: every frame draws without errors', (_, scene) => {
    const tl = buildTimeline(scene.script);
    const heroAt = (time: number) => {
      const f = sampleTimeline(tl, time);
      return { x: f.x - scene.anchor, lift: f.lift };
    };
    for (let t = 0; t <= tl.duration + 500; t += 97) {
      const f = sampleTimeline(tl, t);
      const svg = draw(scene.obstacle, {
        t,
        state: f.propState,
        since: f.propSince,
        events: tl.propEvents,
        heroX: f.x - scene.anchor,
        heroLift: f.lift,
        heroAt,
      });
      expect(svg, `t=${t}`).not.toContain('NaN');
      expect(svg, `t=${t}`).not.toContain('Infinity');
    }
  });

  it('draws a still preview for the page strip', () => {
    for (const id of OBSTACLE_IDS) {
      const svg = draw(id, {
        t: 0,
        state: 'idle',
        since: 0,
        events: [],
        heroX: -1000,
        heroLift: 0,
        heroAt: () => ({ x: -1000, lift: 0 }),
      });
      expect(svg, id).not.toContain('NaN');
    }
  });
});
