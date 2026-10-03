/** Every tunable number for gameplay lives here. */
export const CONFIG = {
  /**
   * Length of a timed page, in seconds. A parent can give a player more time (`pageChoices`);
   * the star and time-coin rules scale with it, so a longer page doesn't pay more.
   */
  pageSeconds: 60,
  pageChoices: [60, 90, 120],
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
  /** Coins, spent in the shop. A page pays for its right answers even when it's a retry. */
  coins: {
    /** For each problem answered right (first or second try). */
    perCorrect: 1,
    /** A combo burst every this many right-first-try answers in a row... */
    comboEvery: 5,
    /** ...paying these bonuses at 5, 10, 15 in a row (the last repeats beyond). */
    comboBonus: [2, 3, 5],
    /** On a passed page, 1 coin for every this many whole seconds left. */
    secondsPerTimeCoin: 5,
    /** The first time a level is passed (a world's boss pays more). */
    firstPass: 10,
    firstPassBoss: 25,
    /** For each star above the level's best so far. */
    perNewStar: 5,
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
    /**
     * A parent's ceiling on how hard pages get ("Hardest"): the rating is held at or below it.
     * 1 is no limit.
     */
    hardestChoices: [0.25, 0.5, 0.75, 1],
  },
  /** The parent's stats: how many recent pages to remember per player. */
  recentPages: 20,
} as const;
