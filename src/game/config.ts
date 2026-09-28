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
} as const;
