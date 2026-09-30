import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CHASER_WORLDS } from '../art/chaserData';
import { Chaser } from '../art/chasers';
import { CHASER, chaserFront, heroX } from './trailLayout';

describe('the danger behind the hero', () => {
  it('never reaches him, however far behind he falls', () => {
    for (const progress of [0, 0.2, 0.5, 1]) {
      for (const elapsed of [0, 0.3, 0.7, 1]) {
        expect(heroX(progress) - chaserFront(progress, elapsed)).toBeGreaterThanOrEqual(CHASER.gap);
      }
    }
  });

  it('keeps coming as time passes, and falls behind a hero who is on pace', () => {
    expect(chaserFront(0.5, 0.2)).toBeLessThan(chaserFront(0.5, 0.4));
    // Finishing the page right at time's up leaves it well behind him.
    expect(heroX(1) - chaserFront(1, 1)).toBeGreaterThan(100);
  });

  it.each(CHASER_WORLDS)('world %s has a chaser that draws cleanly', (worldId) => {
    const svg = renderToStaticMarkup(createElement(Chaser, { worldId }));
    expect(svg).not.toContain('NaN');
    expect(svg).not.toContain('filter');
  });
});
