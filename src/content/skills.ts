import type { SkillId } from '../game/problems';

/**
 * The age at which a child typically has each skill down (data only). A player's age
 * sets their starting difficulty: older than this starts harder, younger starts easier
 * (see `startRating` in game/adaptive.ts).
 */
export const SKILL_AGE: Record<SkillId, number> = {
  // World 1: addition.
  'add-within-5': 5,
  'add-within-10': 6,
  doubles: 6,
  'make-10': 6,
  'add-within-20': 7,
  'world1-review': 7,
  // World 2: subtraction.
  'sub-within-10': 6,
  'sub-within-20': 7,
  'add-sub-within-20': 7,
  'missing-addend': 7,
  'world2-review': 7,
  // World 3: two-digit adding and taking away.
  'add-sub-tens': 7,
  'add-2digit': 7,
  'sub-2digit': 8,
  'add-2digit-regroup': 8,
  'sub-2digit-regroup': 9,
  'world3-review': 9,
  // World 4: times tables.
  'mul-0-1-2-10': 7,
  'mul-5': 8,
  'mul-3-4': 8,
  'mul-6-9': 9,
  'mul-review': 9,
  // World 5: division, then everything.
  'div-1-2-5-10': 8,
  'div-3-4': 9,
  'div-6-9': 10,
  'mul-div-review': 10,
  'all-four': 10,
};

/** Ages a parent can pick in the player editor. The last one means "this age or older". */
export const AGES = [5, 6, 7, 8, 9, 10] as const;

/** Used for players saved before age was asked (and until a parent sets it). */
export const DEFAULT_AGE = 7;
