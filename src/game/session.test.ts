import { describe, expect, it } from 'vitest';
import type { Problem } from './problems';
import { evaluatePage } from './scoring';
import { createSession, sessionReducer, type SessionAction, type SessionState } from './session';

const p = (a: number, b: number): Problem => ({
  a,
  op: '+',
  b,
  result: a + b,
  unknown: 'result',
  answer: a + b,
  key: `${a}+${b}`,
});

function run(state: SessionState, ...actions: SessionAction[]) {
  return actions.reduce(sessionReducer, state);
}
const digit = (d: number, now = 0): SessionAction => ({ type: 'digit', digit: d, now });

describe('sessionReducer', () => {
  it('auto-submits when the typed answer reaches the answer length', () => {
    const s = run(createSession([p(2, 3), p(6, 7)], 0), digit(5, 800));
    expect(s.index).toBe(1);
    expect(s.results).toEqual([{ correct: true, tries: 1, ms: 800 }]);
    expect(s.feedback?.kind).toBe('correct');

    const partial = run(s, digit(1));
    expect(partial.index).toBe(1);
    expect(partial.input).toBe('1');
    const done = run(partial, digit(3, 2000));
    expect(done.phase).toBe('done');
    expect(done.results[1]).toEqual({ correct: true, tries: 1, ms: 1200 });
  });

  it('waits for Enter when a short answer is typed for a longer one', () => {
    const s = run(createSession([p(6, 7)], 0), digit(9));
    expect(s.input).toBe('9');
    const after = run(s, { type: 'submit', now: 100 });
    expect(after.feedback?.kind).toBe('wrong');
    expect(after.input).toBe('');
  });

  it('gives a second try, then reveals and waits for advance', () => {
    let s = run(createSession([p(2, 3), p(1, 1)], 0), digit(4));
    expect(s.feedback?.kind).toBe('wrong');
    expect(s.misses).toBe(1);
    expect(s.index).toBe(0);

    s = run(s, digit(6, 500));
    expect(s.phase).toBe('revealing');
    expect(s.input).toBe('5');
    expect(s.results).toEqual([{ correct: false, tries: 2, ms: 500 }]);

    // Input is ignored while revealing.
    expect(run(s, digit(2))).toBe(s);

    s = run(s, { type: 'advance', now: 1900 });
    expect(s.phase).toBe('playing');
    expect(s.index).toBe(1);
    expect(s.problemStartedAt).toBe(1900);
  });

  it('counts a second-try success as correct but not first-try', () => {
    const s = run(createSession([p(2, 3)], 0), digit(4), digit(5, 300));
    expect(s.results).toEqual([{ correct: true, tries: 2, ms: 300 }]);
  });

  it('tracks combos and resets them on a miss', () => {
    const s = run(createSession([p(1, 1), p(1, 2), p(1, 3), p(1, 4)], 0), digit(2), digit(3));
    expect(s.combo).toBe(2);
    const missed = run(s, digit(9));
    expect(missed.combo).toBe(0);
    expect(missed.bestCombo).toBe(2);
  });

  it('supports backspace and replaces a leading zero', () => {
    const s = run(createSession([p(6, 7)], 0), digit(0), digit(1), { type: 'backspace' });
    expect(s.input).toBe('');
  });

  it('ends the page when time is up', () => {
    const s = run(createSession([p(1, 1), p(1, 2)], 0), digit(2), { type: 'timeUp' });
    expect(s.phase).toBe('done');
    expect(s.timedOut).toBe(true);
    expect(run(s, digit(3))).toBe(s);
  });
});

describe('evaluatePage', () => {
  const right = { correct: true, tries: 1, ms: 1000 };
  const secondTry = { correct: true, tries: 2, ms: 1000 };
  const wrong = { correct: false, tries: 2, ms: 1000 };

  it('3 stars: all first try with 10s+ left', () => {
    expect(evaluatePage(Array(10).fill(right), 10, 12).stars).toBe(3);
    expect(evaluatePage(Array(10).fill(right), 10, 5).stars).toBe(2);
  });

  it('2 stars at 90%+, 1 star at 80%+', () => {
    expect(evaluatePage([...Array(9).fill(right), secondTry], 10, 30).stars).toBe(2);
    expect(evaluatePage([...Array(9).fill(right), wrong], 10, 30).stars).toBe(2);
    expect(evaluatePage([...Array(8).fill(right), wrong, wrong], 10, 30).stars).toBe(1);
  });

  it('fails below 80% or when time runs out first', () => {
    const low = evaluatePage([...Array(7).fill(right), ...Array(3).fill(wrong)], 10, 30);
    expect(low.passed).toBe(false);
    expect(low.stars).toBe(0);
    const unfinished = evaluatePage(Array(9).fill(right), 10, 0);
    expect(unfinished.passed).toBe(false);
    expect(unfinished.answeredAll).toBe(false);
  });
});
