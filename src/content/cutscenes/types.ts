import type { ObstacleId } from '../../art/obstacles/registry';
import type { SceneScript } from '../../cutscenes/timeline';

/**
 * Cut scenes after each level (data only). World x is in px from the scene's left
 * edge; the obstacle is drawn with its local (0, 0) at `anchor` on the ground line.
 * The hero is about 190px tall (sized so his hands reach 175px up in the swing pose); `lift`
 * is how high his feet are above the ground. Steps can also direct the scene like a cartoon
 * (faces, impacts, emotes, camera moves, cut-ins, slow motion and freeze frames: see
 * `SceneStep` in timeline.ts).
 * The captions come from `levels.ts`.
 */
export interface CutScene {
  obstacle: ObstacleId;
  anchor: number;
  /** Scene width, px. Wider than 1280 makes the camera follow the hero (max 2500). */
  width: number;
  /** A signpost near the end, e.g. pointing to the next world. */
  sign?: { x: number; text: string };
  /**
   * Draw the backdrop's foreground layer in front of him (default true). Off for a scene that
   * leaves its world's backdrop, like the mine train bursting out into daylight.
   */
  foreground?: boolean;
  script: SceneScript;
}
