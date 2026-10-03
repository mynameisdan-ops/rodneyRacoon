import { describe, expect, it } from 'vitest';
import type { Answer, WeakFact } from './adaptive';
import { CONFIG } from './config';
import type { Problem } from './problems';
import { evaluatePage } from './scoring';
import { emptyStats, overall, recordStats, skillRows, weakestFacts } from './stats';

const problem = (skill: Problem['skill'], key = '1+1'): Problem => ({
  a: 1,
  op: '+',
  b: 1,
  result: 2,
  unknown: 'result',
  answer: 2,
  key,
  skill,
});
const answer = (skill: Problem['skill'], correct: boolean, tries: number, ms: number): Answer => ({
  problem: problem(skill),
  correct,
  tries,
  ms,
});

describe('recordStats', () => {
  const answers = [
    answer('add-within-10', true, 1, 2000),
    answer('add-within-10', true, 2, 4000),
    answer('doubles', false, 2, 6000),
  ];
  const evaluation = evaluatePage(answers, 3, 20, 90);
  const stats = recordStats(emptyStats(), 8, evaluation, answers, 1000);

  it('adds each answer to its fact family', () => {
    expect(stats.skills['add-within-10']).toEqual({ answered: 2, right: 2, firstTry: 1, ms: 6000 });
    expect(stats.skills.doubles).toEqual({ answered: 1, right: 0, firstTry: 0, ms: 6000 });
  });

  it('remembers the page, newest first, up to a limit', () => {
    expect(stats.recent[0]).toEqual({
      at: 1000,
      level: 8,
      right: 2,
      total: 3,
      stars: 0,
      passed: false,
      seconds: 70,
    });
    let many = stats;
    for (let i = 0; i < CONFIG.recentPages + 5; i++) {
      many = recordStats(many, i, evaluation, [], i);
    }
    expect(many.recent).toHaveLength(CONFIG.recentPages);
    expect(many.recent[0]!.level).toBe(CONFIG.recentPages + 4);
  });

  it('sums up by family, in teaching order, and overall', () => {
    expect(
      skillRows(stats).map((r) => [r.skill, r.answered, r.right, r.firstTry, r.seconds]),
    ).toEqual([
      ['add-within-10', 2, 1, 0.5, 3],
      ['doubles', 1, 0, 0, 6],
    ]);
    expect(overall(stats)).toEqual({ answered: 3, right: 2 / 3, seconds: 4 });
    expect(overall(emptyStats())).toEqual({ answered: 0, right: 0, seconds: 0 });
  });
});

describe('weakestFacts', () => {
  const fact = (key: string, misses: number, lastSeen: number): WeakFact => ({
    problem: problem('add-within-10', key),
    misses,
    streak: 0,
    lastSeen,
  });

  it('puts the most-missed first, then the most recent', () => {
    const list = [fact('a', 1, 5), fact('b', 3, 1), fact('c', 1, 9), fact('d', 2, 2)];
    expect(weakestFacts(list).map((w) => w.problem.key)).toEqual(['b', 'd', 'c', 'a']);
    expect(weakestFacts(list, 2)).toHaveLength(2);
  });
});
