/** Every tunable number for gameplay lives here. */
export const CONFIG = {
  /** Length of a timed page, in seconds. */
  pageSeconds: 60,
  /** "3, 2, 1" before a page starts, in seconds. */
  countdownSeconds: 3,
  /** Tries per problem; after the last miss the answer is shown and the page moves on. */
  triesPerProblem: 2,
  /** How long a revealed answer stays on screen, in ms (the page timer keeps running). */
  revealMs: 1400,
  /** Fraction of the page's problems that must be correct to pass. */
  passAccuracy: 0.8,
  stars: {
    /** Accuracy needed for 2 stars. */
    twoStarAccuracy: 0.9,
    /** 3 stars: every problem right on the first try, with at least this many seconds left. */
    threeStarSecondsLeft: 10,
  },
  /** Adaptive difficulty: a rating from 0 (easiest) to 1 (hardest) for each skill. */
  adaptive: {
    /** How the skill's rating moves after a page. */
    step: { threeStars: 0.15, pass: 0.06, fail: -0.12 },
    /** Starting rating for a player exactly the skill's typical age... */
    startAtTypicalAge: 0.5,
    /** ...plus this for each year older (minus for each year younger). */
    startPerYear: 0.25,
    /**
     * Players older than a skill's typical age reach past a level's top, a little per year:
     * the band's top rises and the page gets extra problems (from the M5 tablet feedback).
     */
    olderReach: { bandPerYear: 0.1, maxBand: 0.3, problemsPerYear: 1, maxProblems: 3 },
    /** At most this share of a page is made of facts the player missed before. */
    weakShare: 0.3,
    /** A weak fact is "answered quickly" when right first try within this many ms. */
    fastMs: 5000,
    /** Answered right and quickly this many times in a row, a weak fact is dropped. */
    retireStreak: 3,
    /** Remember at most this many weak facts per player (the stalest go first). */
    maxWeakFacts: 30,
  },
} as const;
