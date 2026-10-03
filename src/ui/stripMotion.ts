import type { HeroPose } from '../art/hero/poses';

/*
 * How the hero moves on the page strip after each answer (M7b), as a pure function of the time
 * since the answer was checked, so it's exact and testable:
 * - right: a quick crouch, a dash to his new spot (overshooting a touch), and a springy landing;
 * - wrong (or the answer shown): a stumble while the strip shakes.
 */

export const STRIP_MS = {
  crouch: 50,
  dash: 340,
  land: 220,
  stumble: 650,
  shake: 300,
  /** The combo cut-in at 5, 10 and 15 in a row. */
  cutin: 950,
} as const;

/** Streaks that get the cut-in. */
export const CUTIN_COMBOS = [5, 10, 15] as const;

export type StripKind = 'correct' | 'wrong' | 'reveal';

export interface StripMotion {
  /** 0..1 along the trail. */
  pos: number;
  pose: HeroPose | 'crouch';
  squash: { sx: number; sy: number };
  /** Forward tilt, degrees. */
  lean: number;
  /** 0..1, for his cape and hair. */
  wind: number;
  /** 0..1 through the dash, or null when he isn't dashing. */
  dash: number | null;
  /** Time since he landed from a dash (ms), or null. */
  landing: number | null;
  /** Horizontal shake of the whole strip, px. */
  shake: number;
}

/** Overshoots its end a touch and settles back. */
const easeOutBack = (p: number) => 1 + 2.4 * (p - 1) ** 3 + 1.4 * (p - 1) ** 2;

/**
 * The hero on the strip `dt` ms after the latest answer (`kind`; null before any), moving from
 * trail position `from` to `to`. At rest he takes `rest` (the page's end pose, or idle).
 */
export function stripMotion(
  kind: StripKind | null,
  dt: number,
  from: number,
  to: number,
  rest: HeroPose = 'idle',
): StripMotion {
  const still: StripMotion = {
    pos: to,
    pose: rest,
    squash: { sx: 1, sy: 1 },
    lean: 0,
    wind: 0,
    dash: null,
    landing: null,
    shake: 0,
  };
  if (kind === null || !(dt >= 0)) return still;

  if (kind === 'correct') {
    const { crouch, dash, land } = STRIP_MS;
    if (dt < crouch) {
      const q = dt / crouch;
      return {
        ...still,
        pos: from,
        pose: 'crouch',
        squash: { sx: 1 + 0.08 * q, sy: 1 - 0.12 * q },
      };
    }
    if (dt < crouch + dash) {
      const p = (dt - crouch) / dash;
      return {
        ...still,
        pos: from + (to - from) * easeOutBack(p),
        pose: 'run',
        squash: { sx: 1.12 - 0.12 * p, sy: 0.92 + 0.08 * p },
        lean: 14 * (1 - 0.5 * p),
        wind: 1 - 0.4 * p,
        dash: p,
      };
    }
    const since = dt - crouch - dash;
    if (since < land) {
      const s = 0.12 * (1 - since / land) * Math.cos((since / land) * Math.PI * 2);
      return { ...still, squash: { sx: 1 + s * 0.7, sy: 1 - s }, landing: since };
    }
    return still;
  }

  // A wrong answer (or the answer shown after two): he stumbles and the strip shakes.
  const { stumble, shake } = STRIP_MS;
  return {
    ...still,
    pose: dt < stumble ? 'stumble' : rest,
    shake: dt < shake ? 7 * Math.sin(dt * 0.09) * (1 - dt / shake) : 0,
  };
}
