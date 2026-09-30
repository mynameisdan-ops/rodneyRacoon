import type { FC } from 'react';
import type { PropEvent } from '../../cutscenes/timeline';

export const OBSTACLE_IDS = [
  'cart-race',
  'cart-jump',
  'wall-smash',
  'rat-swarm',
  'crystal-cavern',
  'bat-storm',
  'runaway-lift',
  'mine-train',
  // World 2: the forest.
  'log-roll',
  'bramble-vault',
  'root-slide',
  'vine-swing',
  'boar-charge',
  'mushroom-bounce',
  'falling-bridge',
  'fireflies',
  // World 3: the river.
  'stepping-stones',
  'beaver-dam',
  'rapids',
  'rope-bridge',
  'geyser',
  'waterfall-slide',
  'rising-water',
  'raft',
  // World 4: the mountains.
  'rock-slide',
  'crumbling-ledge',
  'avalanche',
  'goat-ride',
  'ice-bridge',
  'icicle-cave',
  'ice-wall',
  'peak',
] as const;
export type ObstacleId = (typeof OBSTACLE_IDS)[number];

/**
 * What an obstacle drawing is given each frame. Coordinates are local: the
 * anchor is (0, 0) on the ground line and up is negative y.
 */
export interface ObstacleProps {
  /** Scene time, ms. */
  t: number;
  /** Current prop state from the script ('idle' until a prop step). */
  state: string;
  /** When `state` began, ms. */
  since: number;
  /**
   * The scene's whole prop schedule, including states still to come, so a prop can
   * time a motion to end exactly when a later event happens (see `eventTime`).
   */
  events: readonly PropEvent[];
  /** Hero feet position relative to the anchor (x px, lift px up). */
  heroX: number;
  heroLift: number;
  /** Where the hero's feet are at any scene time (same local coordinates), e.g. where he was when something began. */
  heroAt: (t: number) => { x: number; lift: number };
}

export interface ObstacleArt {
  /** Drawn behind the hero. */
  back: FC<ObstacleProps>;
  /** Drawn in front of the hero (grass blades, near rope). */
  front?: FC<ObstacleProps>;
  /** Width from the anchor, px (used to place the page-strip preview). */
  width: number;
}

/** When the scene reaches prop `state` (ms), or Infinity if it never does. */
export function eventTime(events: readonly PropEvent[], state: string): number {
  return events.find((e) => e.state === state)?.at ?? Infinity;
}
