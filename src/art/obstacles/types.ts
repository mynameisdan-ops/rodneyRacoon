import type { FC } from 'react';

export const OBSTACLE_IDS = [
  'tall-grass',
  'puddle',
  'fence-stile',
  'bees',
  'stepping-logs',
  'windy-hill',
  'sleeping-bull',
  'rope-bridge',
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
  /** Hero feet position relative to the anchor (x px, lift px up). */
  heroX: number;
  heroLift: number;
}

export interface ObstacleArt {
  /** Drawn behind the hero. */
  back: FC<ObstacleProps>;
  /** Drawn in front of the hero (grass blades, near rope). */
  front?: FC<ObstacleProps>;
  /** Width from the anchor, px (used to place the page-strip preview). */
  width: number;
}
