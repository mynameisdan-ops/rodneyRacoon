import { describe, expect, it } from 'vitest';
import { CONFIG } from './config';
import { comboBonus, comboCoins, pageCoins } from './rewards';
import { evaluatePage, type ProblemResult } from './scoring';

const right: ProblemResult = { correct: true, tries: 1, ms: 1000 };
const secondTry: ProblemResult = { correct: true, tries: 2, ms: 3000 };
const wrong: ProblemResult = { correct: false, tries: 2, ms: 3000 };
const c = CONFIG.coins;

describe('comboBonus', () => {
  it('pays only at every 5th answer in a row, growing to the last step', () => {
    expect(comboBonus(0)).toBe(0);
    expect(comboBonus(4)).toBe(0);
    expect(comboBonus(5)).toBe(c.comboBonus[0]);
    expect(comboBonus(6)).toBe(0);
    expect(comboBonus(10)).toBe(c.comboBonus[1]);
    expect(comboBonus(15)).toBe(c.comboBonus[2]);
    expect(comboBonus(20)).toBe(c.comboBonus[2]);
  });
});

describe('comboCoins', () => {
  it('counts bursts along the page', () => {
    expect(comboCoins(Array(4).fill(right))).toBe(0);
    expect(comboCoins(Array(5).fill(right))).toBe(c.comboBonus[0]);
    expect(comboCoins(Array(12).fill(right))).toBe(c.comboBonus[0] + c.comboBonus[1]);
  });

  it('restarts the streak on a miss, and a second try starts a new one', () => {
    expect(comboCoins([...Array(4).fill(right), wrong, ...Array(4).fill(right)])).toBe(0);
    // The second-try answer counts as 1, so four more make 5.
    expect(comboCoins([...Array(4).fill(right), secondTry, ...Array(4).fill(right)])).toBe(
      c.comboBonus[0],
    );
  });
});

describe('pageCoins', () => {
  it('pays for right answers even on a page that needs a retry', () => {
    const results = [...Array(5).fill(right), ...Array(5).fill(wrong)];
    const evaluation = evaluatePage(results, 10, 20);
    expect(evaluation.passed).toBe(false);
    const coins = pageCoins(results, evaluation, undefined);
    expect(coins).toEqual({
      answers: 5 * c.perCorrect,
      combo: c.comboBonus[0],
      time: 0,
      firstPass: 0,
      newStars: 0,
      total: 5 * c.perCorrect + c.comboBonus[0],
    });
  });

  it('pays a first pass, new stars and time left', () => {
    const results = Array(10).fill(right);
    const evaluation = evaluatePage(results, 10, 23.7);
    expect(evaluation.stars).toBe(3);
    const coins = pageCoins(results, evaluation, undefined);
    expect(coins.answers).toBe(10 * c.perCorrect);
    expect(coins.combo).toBe(c.comboBonus[0] + c.comboBonus[1]);
    expect(coins.time).toBe(Math.floor(23 / c.secondsPerTimeCoin));
    expect(coins.firstPass).toBe(c.firstPass);
    expect(coins.newStars).toBe(3 * c.perNewStar);
    expect(coins.total).toBe(
      coins.answers + coins.combo + coins.time + coins.firstPass + coins.newStars,
    );
  });

  it('pays the boss bonus for a boss level', () => {
    const results = Array(10).fill(right);
    const evaluation = evaluatePage(results, 10, 0);
    expect(pageCoins(results, evaluation, undefined, true).firstPass).toBe(c.firstPassBoss);
  });

  it('on a replay, pays only stars above the best and no first-pass bonus', () => {
    const results = Array(10).fill(right);
    const evaluation = evaluatePage(results, 10, 30);
    const before = { bestStars: 2 as const, plays: 3, passes: 2, lastPlayedAt: 0 };
    const coins = pageCoins(results, evaluation, before);
    expect(coins.firstPass).toBe(0);
    expect(coins.newStars).toBe(c.perNewStar);

    const worse = evaluatePage([...Array(9).fill(right), wrong], 10, 30);
    expect(pageCoins([], worse, before).newStars).toBe(0);
  });

  it('a first pass after earlier failed plays still pays the bonus', () => {
    const results = Array(10).fill(right);
    const evaluation = evaluatePage(results, 10, 0);
    const before = { bestStars: 0 as const, plays: 2, passes: 0, lastPlayedAt: 0 };
    expect(pageCoins(results, evaluation, before).firstPass).toBe(c.firstPass);
  });
});
