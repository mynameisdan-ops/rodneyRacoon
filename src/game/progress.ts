import type { PageEvaluation } from './scoring';

export interface LevelProgress {
  bestStars: 0 | 1 | 2 | 3;
  plays: number;
  passes: number;
  lastPlayedAt: number;
}

/** Progress per level id. Levels never played have no entry. */
export type ProgressMap = Record<number, LevelProgress>;

/**
 * Levels unlock strictly in order: level 1 is always open, then pass a level to open the next.
 * `unlockAll` (a parent setting) opens every level.
 */
export function isUnlocked(progress: ProgressMap, levelId: number, unlockAll = false): boolean {
  return unlockAll || levelId <= 1 || (progress[levelId - 1]?.passes ?? 0) > 0;
}

export function isPassed(progress: ProgressMap, levelId: number): boolean {
  return (progress[levelId]?.passes ?? 0) > 0;
}

/** The level the hero is "at": the first unlocked level not yet passed, else the last level. */
export function currentLevel(progress: ProgressMap, levelIds: readonly number[]): number {
  const next = levelIds.find((id) => isUnlocked(progress, id) && !isPassed(progress, id));
  return next ?? levelIds[levelIds.length - 1] ?? 1;
}

export function totalStars(progress: ProgressMap): number {
  return Object.values(progress).reduce((sum, p) => sum + p.bestStars, 0);
}

export function recordPlay(
  progress: ProgressMap,
  levelId: number,
  evaluation: PageEvaluation,
  now: number,
): ProgressMap {
  const prev = progress[levelId];
  const next: LevelProgress = {
    bestStars: Math.max(prev?.bestStars ?? 0, evaluation.stars) as LevelProgress['bestStars'],
    plays: (prev?.plays ?? 0) + 1,
    passes: (prev?.passes ?? 0) + (evaluation.passed ? 1 : 0),
    lastPlayedAt: now,
  };
  return { ...progress, [levelId]: next };
}
