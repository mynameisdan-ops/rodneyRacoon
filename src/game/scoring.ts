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
}

export function evaluatePage(
  results: readonly ProblemResult[],
  total: number,
  secondsLeft: number,
): PageEvaluation {
  const correct = results.filter((r) => r.correct).length;
  const accuracy = total === 0 ? 0 : correct / total;
  const answeredAll = results.length >= total;
  const passed = answeredAll && accuracy >= CONFIG.passAccuracy;

  let stars: PageEvaluation['stars'] = 0;
  if (passed) {
    const allFirstTry = results.every((r) => r.correct && r.tries === 1);
    if (allFirstTry && secondsLeft >= CONFIG.stars.threeStarSecondsLeft) stars = 3;
    else if (accuracy >= CONFIG.stars.twoStarAccuracy) stars = 2;
    else stars = 1;
  }
  return { passed, stars, correct, total, accuracy, answeredAll };
}
