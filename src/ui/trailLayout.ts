/** Positions along the page strip's trail (design px). */
// Starts in from the edge so the danger behind him is on screen from the first second.
export const TRAIL_START = 190;
export const TRAIL_END = 1030;

/** The hero's x for how far along the trail he is (0..1). */
export const heroX = (progress: number) => TRAIL_START + (TRAIL_END - TRAIL_START) * progress;

/**
 * The danger behind him moves at `pace` times the speed that finishes the page right at
 * time's up, starting `lead` px back; it never gets closer than `gap` to him.
 */
export const CHASER = { pace: 0.85, lead: 60, gap: 55 } as const;

/** x of the chaser's front edge: it keeps coming as time passes, but never reaches him. */
export function chaserFront(progress: number, elapsed: number): number {
  const paceX = heroX(elapsed * CHASER.pace) - CHASER.lead;
  return Math.min(paceX, heroX(progress) - CHASER.gap);
}
