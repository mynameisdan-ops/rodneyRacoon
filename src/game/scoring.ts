import { CONFIG } from './config';

export interface ProblemResult {
  correct: boolean;
  /** Number of tries used (1 = right first time). */
  tries: number;
  /** Time spent on this problem, in ms. */
  ms: number;
}

export interface PageEvaluation {
  passed: boolean;
  stars: 0 | 1 | 2 | 3;
  correct: number;
  total: number;
  accuracy: number;
  answeredAll: boolean;
  /** Whole seconds left on the clock when the page ended. */
  secondsLeft: number;
  /** How long the page was (the player's timer setting). */
  pageSeconds: number;
}

/** Seconds left on a page of `pageSeconds`, as if it were a standard page (for stars and coins). */
export function standardSeconds(secondsLeft: number, pageSeconds: number): number {
  return (secondsLeft * CONFIG.pageSeconds) / pageSeconds;
}

export function evaluatePage(
  results: readonly ProblemResult[],
  total: number,
  secondsLeft: number,
  pageSeconds: number = CONFIG.pageSeconds,
): PageEvaluation {
  const correct = results.filter((r) => r.correct).length;
  const accuracy = total === 0 ? 0 : correct / total;
  const answeredAll = results.length >= total;
  const passed = answeredAll && accuracy >= CONFIG.passAccuracy;

  let stars: PageEvaluation['stars'] = 0;
  if (passed) {
    const allFirstTry = results.every((r) => r.correct && r.tries === 1);
    const left = standardSeconds(secondsLeft, pageSeconds);
    if (allFirstTry && left >= CONFIG.stars.threeStarSecondsLeft) stars = 3;
    else if (accuracy >= CONFIG.stars.twoStarAccuracy) stars = 2;
    else stars = 1;
  }
  return {
    passed,
    stars,
    correct,
    total,
    accuracy,
    answeredAll,
    secondsLeft: Math.max(0, Math.floor(secondsLeft)),
    pageSeconds,
  };
}
