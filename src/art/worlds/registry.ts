import { createElement, type FC, type ReactNode } from 'react';
import { Bees, Boulder, DustDevil, Snowball, Wave } from '../chasers';
import { CanyonFar, CanyonMid, CanyonNear, CanyonSky } from './canyon';
import { ForestCanopy, ForestFar, ForestMid, ForestNear } from './forest';
import { MineCeiling, MineFar, MineMid, MineNear } from './mine';
import { MountainClouds, MountainFar, MountainMid, MountainNear } from './mountain';
import { RiverClouds, RiverFar, RiverMid, RiverNear } from './river';
import type { LayerProps } from './sceneryKit';
import { CANYON, FOREST, MINE, MOUNTAIN, RIVER, type WorldTheme } from './themes';

/** The backdrop's layers, back to front. `clouds` is the slowest (sky, cave ceiling, canopy). */
export type LayerName = 'clouds' | 'far' | 'mid' | 'near';
/** What every layer gets besides its theme. */
export type LayerBase = Omit<LayerProps<unknown>, 'theme'>;

/** How a world looks: its colors, backdrop, the danger that chases the hero, and the timer. */
export interface WorldArt {
  theme: WorldTheme;
  /** Draws the four backdrop layers (each a 1280px tile; see WorldBackdrop). */
  layers: (base: LayerBase) => Record<LayerName, ReactNode>;
  /** The top layer drifts on its own (clouds), unlike a cave ceiling, canopy or low sun. */
  drift: boolean;
  /** The danger behind the hero on the page strip, drawn in `CHASER_BOX` (art/chasers.tsx). */
  chaser: FC;
  /** The page timer: the sun crossing the sky, or a lantern glow underground. */
  timer: 'sun' | 'lantern';
}

/** A world's art from a theme and the layer drawings made for that kind of theme. */
function world<T extends WorldTheme>(
  theme: T,
  layers: Record<LayerName, FC<LayerProps<T>>>,
  rest: Omit<WorldArt, 'theme' | 'layers'>,
): WorldArt {
  return {
    theme,
    layers: (base) => ({
      clouds: createElement(layers.clouds, { ...base, theme }),
      far: createElement(layers.far, { ...base, theme }),
      mid: createElement(layers.mid, { ...base, theme }),
      near: createElement(layers.near, { ...base, theme }),
    }),
    ...rest,
  };
}

/** Each world's art, by world id (`content/levels.ts` lists the worlds). */
export const WORLD_ART: Record<number, WorldArt> = {
  1: world(
    MINE,
    { clouds: MineCeiling, far: MineFar, mid: MineMid, near: MineNear },
    { drift: false, chaser: Boulder, timer: 'lantern' },
  ),
  2: world(
    FOREST,
    { clouds: ForestCanopy, far: ForestFar, mid: ForestMid, near: ForestNear },
    { drift: false, chaser: Bees, timer: 'sun' },
  ),
  3: world(
    RIVER,
    { clouds: RiverClouds, far: RiverFar, mid: RiverMid, near: RiverNear },
    { drift: true, chaser: Wave, timer: 'sun' },
  ),
  4: world(
    MOUNTAIN,
    { clouds: MountainClouds, far: MountainFar, mid: MountainMid, near: MountainNear },
    { drift: true, chaser: Snowball, timer: 'sun' },
  ),
  5: world(
    CANYON,
    { clouds: CanyonSky, far: CanyonFar, mid: CanyonMid, near: CanyonNear },
    { drift: false, chaser: DustDevil, timer: 'sun' },
  ),
};

/** A world's art (the first world's for an unknown id). */
export function getWorldArt(worldId: number): WorldArt {
  return WORLD_ART[worldId] ?? (WORLD_ART[1] as WorldArt);
}
