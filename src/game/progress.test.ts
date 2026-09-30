import { describe, expect, it } from 'vitest';
import { currentLevel, isUnlocked, recordPlay, totalStars, type ProgressMap } from './progress';
import type { PageEvaluation } from './scoring';

const evalOf = (passed: boolean, stars: PageEvaluation['stars']): PageEvaluation => ({
  passed,
  stars,
  correct: 0,
  total: 10,
  accuracy: 0,
  answeredAll: true,
});

const IDS = [1, 2, 3, 4, 5, 6, 7, 8];

describe('progress', () => {
  it('unlocks strictly in order', () => {
    let p: ProgressMap = {};
    expect(isUnlocked(p, 1)).toBe(true);
    expect(isUnlocked(p, 2)).toBe(false);

    p = recordPlay(p, 1, evalOf(false, 0), 1);
    expect(isUnlocked(p, 2)).toBe(false);

    p = recordPlay(p, 1, evalOf(true, 1), 2);
    expect(isUnlocked(p, 2)).toBe(true);
    expect(isUnlocked(p, 3)).toBe(false);
  });

  it('opens every level when unlockAll is on', () => {
    expect(isUnlocked({}, 40, true)).toBe(true);
    expect(isUnlocked({}, 40, false)).toBe(false);
  });

  it('keeps the best stars and counts plays and passes', () => {
    let p: ProgressMap = {};
    p = recordPlay(p, 1, evalOf(true, 3), 1);
    p = recordPlay(p, 1, evalOf(true, 1), 2);
    p = recordPlay(p, 1, evalOf(false, 0), 3);
    expect(p[1]).toEqual({ bestStars: 3, plays: 3, passes: 2, lastPlayedAt: 3 });
  });

  it('does not mutate the input', () => {
    const p: ProgressMap = {};
    recordPlay(p, 1, evalOf(true, 2), 1);
    expect(p).toEqual({});
  });

  it('finds the current level and totals stars', () => {
    let p: ProgressMap = {};
    expect(currentLevel(p, IDS)).toBe(1);
    p = recordPlay(p, 1, evalOf(true, 2), 1);
    p = recordPlay(p, 2, evalOf(true, 3), 2);
    expect(currentLevel(p, IDS)).toBe(3);
    expect(totalStars(p)).toBe(5);

    for (const id of IDS) p = recordPlay(p, id, evalOf(true, 1), 3);
    expect(currentLevel(p, IDS)).toBe(8);
  });
});
