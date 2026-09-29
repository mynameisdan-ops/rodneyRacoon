import type { SkillId } from '../game/problems';

/**
 * The age at which a child typically has each skill down (data only). A player's age
 * sets their starting difficulty: older than this starts harder, younger starts easier
 * (see `startRating` in game/adaptive.ts).
 */
export const SKILL_AGE: Record<SkillId, number> = {
  'add-within-5': 5,
  'add-within-10': 6,
  doubles: 6,
  'make-10': 6,
  'add-within-20': 7,
  'world1-review': 7,
};

/** Ages a parent can pick in the player editor. The last one means "this age or older". */
export const AGES = [5, 6, 7, 8, 9, 10] as const;

/** Used for players saved before age was asked (and until a parent sets it). */
export const DEFAULT_AGE = 7;
