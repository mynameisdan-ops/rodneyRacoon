import { describe, expect, it } from 'vitest';
import { getLevel, LEVELS } from '../content/levels';
import { AGES, DEFAULT_AGE, SKILL_AGE } from '../content/skills';
import {
  applyPage,
  nextRating,
  planPage,
  skillRating,
  startRating,
  updateWeakFacts,
  type AdaptiveState,
  type Answer,
  type WeakFact,
} from './adaptive';
import { CONFIG } from './config';
import { generatePage, SKILL_IDS, type Problem } from './problems';
import { createRng } from './rng';
import type { PageEvaluation } from './scoring';

const add = (a: number, b: number, skill: Problem['skill'] = 'add-within-20'): Problem => ({
  a,
  op: '+',
  b,
  result: a + b,
  unknown: 'result',
  answer: a + b,
  key: `${a}+${b}`,
  skill,
});

const fresh = (age: number | null = 7): AdaptiveState => ({ age, ratings: {}, weakFacts: [] });
const evaluation = (passed: boolean, stars: PageEvaluation['stars']): PageEvaluation => ({
  passed,
  stars,
  correct: 0,
  total: 10,
  accuracy: 0,
  answeredAll: true,
});
const answer = (problem: Problem, correct: boolean, tries: number, ms: number): Answer => ({
  problem,
  correct,
  tries,
  ms,
});

describe('starting point from age', () => {
  it('starts in the middle at the typical age, harder older, easier younger', () => {
    expect(startRating('add-within-20', SKILL_AGE['add-within-20'])).toBe(
      CONFIG.adaptive.startAtTypicalAge,
    );
    expect(startRating('add-within-20', 9)).toBeGreaterThan(startRating('add-within-20', 7));
    expect(startRating('add-within-20', 5)).toBeLessThan(startRating('add-within-20', 7));
  });

  it('stays within 0..1 for every age and skill', () => {
    for (const skill of SKILL_IDS) {
      for (const age of AGES) {
        const r = startRating(skill, age);
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThanOrEqual(1);
      }
    }
  });

  it('uses the default age when none is set', () => {
    expect(startRating('doubles', null)).toBe(startRating('doubles', DEFAULT_AGE));
  });

  it('gives a 9-year-old a harder first page than a 6-year-old', () => {
    const level = getLevel(1)!;
    const six = planPage(level, fresh(6), createRng(1));
    const nine = planPage(level, fresh(9), createRng(1));
    expect(nine.count).toBeGreaterThan(six.count);
    expect(nine.difficulty).toBeGreaterThan(six.difficulty);
  });
});

describe('planPage', () => {
  it.each(LEVELS.map((l) => [l.id, l] as const))(
    'level %s stays inside its problem range and band',
    (_, level) => {
      for (const rating of [0, 0.3, 0.7, 1]) {
        const state: AdaptiveState = { ...fresh(), ratings: { [level.skill]: rating } };
        const plan = planPage(level, state, createRng(3));
        expect(plan.count).toBeGreaterThanOrEqual(level.problems[0]);
        expect(plan.count).toBeLessThanOrEqual(level.problems[1]);
        expect(plan.difficulty).toBeGreaterThanOrEqual(level.band[0]);
        expect(plan.difficulty).toBeLessThanOrEqual(level.band[1]);
      }
    },
  );

  it('the same rating plays harder on a later level of the same skill', () => {
    const state: AdaptiveState = { ...fresh(), ratings: { 'add-within-10': 0.5 } };
    const l2 = planPage(getLevel(2)!, state, createRng(1));
    const l3 = planPage(getLevel(3)!, state, createRng(1));
    expect(l3.difficulty).toBeGreaterThan(l2.difficulty);
  });

  it('brings back weak facts for this skill only, within the share', () => {
    const weakFacts: WeakFact[] = [
      ...Array.from({ length: 10 }, (_, i) => ({
        problem: add(9, i + 2),
        misses: 1 + (i % 3),
        streak: 0,
        lastSeen: i,
      })),
      { problem: add(3, 3, 'doubles'), misses: 5, streak: 0, lastSeen: 0 },
    ];
    const level = getLevel(6)!; // add-within-20
    const plan = planPage(level, { ...fresh(), weakFacts }, createRng(5));
    expect(plan.weak.length).toBe(Math.floor(plan.count * CONFIG.adaptive.weakShare));
    expect(plan.weak.every((p) => p.skill === 'add-within-20')).toBe(true);
    // The review level covers both skills.
    const review = planPage(getLevel(8)!, { ...fresh(), weakFacts }, createRng(5));
    expect(review.weak.some((p) => p.skill === 'doubles')).toBe(true);
  });
});

describe('ratings', () => {
  it('moves up a step for 3 stars, a little for a pass, and down for a miss', () => {
    const { step } = CONFIG.adaptive;
    expect(nextRating(0.5, evaluation(true, 3))).toBeCloseTo(0.5 + step.threeStars);
    expect(nextRating(0.5, evaluation(true, 1))).toBeCloseTo(0.5 + step.pass);
    expect(nextRating(0.5, evaluation(false, 0))).toBeCloseTo(0.5 + step.fail);
    expect(nextRating(0.98, evaluation(true, 3))).toBe(1);
    expect(nextRating(0.02, evaluation(false, 0))).toBe(0);
  });

  it('applyPage updates only the played skill, starting from the age', () => {
    const level = getLevel(4)!; // doubles
    const state = fresh(6);
    const next = applyPage(state, level, evaluation(true, 3), [], 100);
    expect(next.ratings.doubles).toBeCloseTo(
      startRating('doubles', 6) + CONFIG.adaptive.step.threeStars,
    );
    expect(Object.keys(next.ratings)).toEqual(['doubles']);
    expect(skillRating(next, 'make-10')).toBe(startRating('make-10', 6));
  });
});

describe('weak facts', () => {
  const p = add(7, 8);

  it('remembers misses and second tries, not first-try answers', () => {
    const list = updateWeakFacts(
      [],
      [
        answer(p, false, 2, 3000),
        answer(add(6, 6), true, 2, 3000),
        answer(add(5, 9), true, 1, 900),
      ],
      10,
    );
    expect(list.map((w) => w.problem.key).sort()).toEqual(['6+6', '7+8']);
    expect(list.find((w) => w.problem.key === '7+8')).toMatchObject({ misses: 1, streak: 0 });
  });

  it('retires a fact after enough right-and-quick answers in a row', () => {
    let list = updateWeakFacts([], [answer(p, false, 2, 3000)], 1);
    const { retireStreak, fastMs } = CONFIG.adaptive;
    for (let i = 1; i < retireStreak; i++) {
      list = updateWeakFacts(list, [answer(p, true, 1, fastMs - 1)], 1 + i);
      expect(list[0]!.streak).toBe(i);
    }
    // A slow answer doesn't count toward it, a miss resets it.
    expect(updateWeakFacts(list, [answer(p, true, 1, fastMs + 1)], 9)[0]!.streak).toBe(
      retireStreak - 1,
    );
    expect(updateWeakFacts(list, [answer(p, false, 2, 100)], 9)[0]).toMatchObject({
      misses: 2,
      streak: 0,
    });
    expect(updateWeakFacts(list, [answer(p, true, 1, 100)], 9)).toEqual([]);
  });

  it('keeps at most the most recent facts', () => {
    const answers = Array.from({ length: 50 }, (_, i) =>
      answer(add(1 + (i % 10), 1 + Math.floor(i / 10)), false, 2, 100),
    );
    const list = updateWeakFacts([], answers, 5);
    expect(list.length).toBe(CONFIG.adaptive.maxWeakFacts);
  });
});

describe('generatePage with weak facts', () => {
  it('puts each weak fact on the page once, never back-to-back', () => {
    const weak = [add(9, 9, 'doubles'), add(7, 7, 'doubles'), add(8, 8, 'doubles')];
    for (let seed = 0; seed < 40; seed++) {
      const page = generatePage('doubles', 12, createRng(seed), 0.2, weak);
      expect(page).toHaveLength(12);
      for (const w of weak) expect(page.some((q) => q.key === w.key)).toBe(true);
      for (let i = 1; i < page.length; i++) expect(page[i]!.key).not.toBe(page[i - 1]!.key);
    }
  });
});
