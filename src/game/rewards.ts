import { CONFIG } from './config';
import type { LevelProgress } from './progress';
import { standardSeconds, type PageEvaluation, type ProblemResult } from './scoring';

/** The coins a page paid, line by line, for the results tally. */
export interface CoinReward {
  /** For right answers. */
  answers: number;
  /** Combo bursts (5, 10, 15 right first try in a row). */
  combo: number;
  /** Time left on a passed page. */
  time: number;
  /** The first pass of the level. */
  firstPass: number;
  /** Stars above the level's best so far. */
  newStars: number;
  total: number;
}

/**
 * The combo bonus for reaching `streak` right answers in a row, or 0 when `streak` isn't a
 * burst (5, 10, 15, … with the default config).
 */
export function comboBonus(streak: number): number {
  const { comboEvery, comboBonus: bonuses } = CONFIG.coins;
  if (streak <= 0 || streak % comboEvery !== 0) return 0;
  const step = streak / comboEvery;
  return bonuses[Math.min(step, bonuses.length) - 1] ?? 0;
}

/**
 * Combo bonuses over a page. The streak matches the page's combo counter: a right first try
 * adds one, any miss restarts it (a right second try starts a new streak of 1).
 */
export function comboCoins(results: readonly ProblemResult[]): number {
  let streak = 0;
  let coins = 0;
  for (const r of results) {
    streak = r.correct ? (r.tries === 1 ? streak + 1 : 1) : 0;
    coins += comboBonus(streak);
  }
  return coins;
}

/**
 * What a page pays. `before` is the level's progress before this page (undefined if never
 * played), so a first pass and new stars can be told apart from a replay.
 */
export function pageCoins(
  results: readonly ProblemResult[],
  evaluation: PageEvaluation,
  before: LevelProgress | undefined,
  boss = false,
): CoinReward {
  const c = CONFIG.coins;
  const answers = evaluation.correct * c.perCorrect;
  const combo = comboCoins(results);
  // Time left counts as on a standard page, so a parent's longer timer doesn't pay more.
  const left = standardSeconds(evaluation.secondsLeft, evaluation.pageSeconds);
  const time = evaluation.passed ? Math.floor(left / c.secondsPerTimeCoin) : 0;
  const firstPass =
    evaluation.passed && (before?.passes ?? 0) === 0 ? (boss ? c.firstPassBoss : c.firstPass) : 0;
  const newStars = Math.max(0, evaluation.stars - (before?.bestStars ?? 0)) * c.perNewStar;
  return {
    answers,
    combo,
    time,
    firstPass,
    newStars,
    total: answers + combo + time + firstPass + newStars,
  };
}
