import { createElement, type FC, type ReactNode } from 'react';
import { Bees, Boulder, DustDevil, Snowball, Wave } from '../chasers';
import { CanyonFar, CanyonFront, CanyonMid, CanyonNear, CanyonSky } from './canyon';
import { PAINTED_CANYON } from './canyonPalette';
import { ForestCanopy, ForestFar, ForestFront, ForestMid, ForestNear } from './forest';
import { PAINTED_FOREST } from './forestPalette';
import { MineCeiling, MineFar, MineFront, MineMid, MineNear } from './mine';
import { PAINTED_MINE } from './minePalette';
import { MountainClouds, MountainFar, MountainFront, MountainMid, MountainNear } from './mountain';
import { PAINTED_MOUNTAIN } from './mountainPalette';
import { RiverClouds, RiverFar, RiverFront, RiverMid, RiverNear } from './river';
import { PAINTED_RIVER } from './riverPalette';
import type { LayerProps } from './sceneryKit';
import { CANYON, FOREST, MINE, MOUNTAIN, RIVER, type WorldTheme } from './themes';

/** The backdrop's layers, back to front. `clouds` is the slowest (sky, cave ceiling, canopy). */
export type LayerName = 'clouds' | 'far' | 'mid' | 'near';
/** What every layer gets besides its theme. */
export type LayerBase = Omit<LayerProps<unknown>, 'theme'>;

/** The layer drawings for one kind of theme; `front` is drawn in front of the hero in scenes. */
type Layers<T> = Record<LayerName, FC<LayerProps<T>>> & { front?: FC<LayerProps<T>> };

/** How a world looks: its colors, backdrop, the danger that chases the hero, and the timer. */
export interface WorldArt {
  theme: WorldTheme;
  /** A painted world's sky (M7b): three stops, the middle one partway down to the horizon. */
  sky?: { top: string; mid: string; bottom: string };
  /** Draws the backdrop layers (each a 1280px tile; see WorldBackdrop), and any foreground. */
  layers: (base: LayerBase) => Record<LayerName, ReactNode> & { front?: ReactNode };
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
  layers: Layers<T>,
  rest: Omit<WorldArt, 'theme' | 'layers'>,
): WorldArt {
  return {
    theme,
    layers: (base) => ({
      clouds: createElement(layers.clouds, { ...base, theme }),
      far: createElement(layers.far, { ...base, theme }),
      mid: createElement(layers.mid, { ...base, theme }),
      near: createElement(layers.near, { ...base, theme }),
      ...(layers.front && { front: createElement(layers.front, { ...base, theme }) }),
    }),
    ...rest,
  };
}

/** A painted world's three-stop sky, from its palette. */
const skyOf = (p: { skyTop: string; skyMid: string; skyBottom: string }) => ({
  top: p.skyTop,
  mid: p.skyMid,
  bottom: p.skyBottom,
});

/** Each world's art, by world id (`content/levels.ts` lists the worlds). */
export const WORLD_ART: Record<number, WorldArt> = {
  1: world(
    MINE,
    { clouds: MineCeiling, far: MineFar, mid: MineMid, near: MineNear, front: MineFront },
    { drift: false, chaser: Boulder, timer: 'lantern', sky: skyOf(PAINTED_MINE) },
  ),
  2: world(
    FOREST,
    { clouds: ForestCanopy, far: ForestFar, mid: ForestMid, near: ForestNear, front: ForestFront },
    { drift: false, chaser: Bees, timer: 'sun', sky: skyOf(PAINTED_FOREST) },
  ),
  3: world(
    RIVER,
    { clouds: RiverClouds, far: RiverFar, mid: RiverMid, near: RiverNear, front: RiverFront },
    { drift: true, chaser: Wave, timer: 'sun', sky: skyOf(PAINTED_RIVER) },
  ),
  4: world(
    MOUNTAIN,
    {
      clouds: MountainClouds,
      far: MountainFar,
      mid: MountainMid,
      near: MountainNear,
      front: MountainFront,
    },
    { drift: true, chaser: Snowball, timer: 'sun', sky: skyOf(PAINTED_MOUNTAIN) },
  ),
  5: world(
    CANYON,
    { clouds: CanyonSky, far: CanyonFar, mid: CanyonMid, near: CanyonNear, front: CanyonFront },
    { drift: false, chaser: DustDevil, timer: 'sun', sky: skyOf(PAINTED_CANYON) },
  ),
};

/** A world's art (the first world's for an unknown id). */
export function getWorldArt(worldId: number): WorldArt {
  return WORLD_ART[worldId] ?? (WORLD_ART[1] as WorldArt);
}
