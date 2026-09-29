import type { HeroPose } from '../art/hero/poses';

/**
 * Cut-scene scripts are lists of steps. Blocking steps (walk, move, jump, hold)
 * take time and run one after another; instant steps (prop, caption, face) happen
 * at the moment they are reached.
 *
 * Positions are world x (px) and `lift`, the height of the hero's feet above the
 * ground line (px, up is positive).
 */
export type SceneStep =
  | { do: 'walk'; x: number; ms: number }
  | { do: 'move'; x: number; lift: number; ms: number; pose: HeroPose }
  | { do: 'jump'; x: number; lift?: number; height: number; ms: number }
  | { do: 'hold'; pose: HeroPose; ms: number }
  | { do: 'prop'; state: string }
  | { do: 'caption' }
  | { do: 'face'; facing: Facing };

export type Facing = 'left' | 'right';

export interface SceneScript {
  /** Where the hero starts (world x). */
  startX: number;
  steps: SceneStep[];
}

interface Segment {
  start: number;
  end: number;
  fromX: number;
  fromLift: number;
  toX: number;
  toLift: number;
  pose: HeroPose;
  /** Extra height at the middle of a jump arc (0 for straight moves). */
  arc: number;
  facing: Facing;
}

export interface Timeline {
  duration: number;
  segments: Segment[];
  propEvents: { at: number; state: string }[];
  captionAt: number | null;
  startX: number;
}

export interface SceneFrame {
  x: number;
  lift: number;
  /** Height of the surface under the hero (his lift without any jump arc), for the shadow. */
  floor: number;
  pose: HeroPose;
  facing: Facing;
  /** Latest prop state reached ('idle' before any prop step). */
  propState: string;
  /** When the current prop state began, in scene ms (for prop animations). */
  propSince: number;
  showCaption: boolean;
}

export function buildTimeline(script: SceneScript): Timeline {
  const segments: Segment[] = [];
  const propEvents: Timeline['propEvents'] = [];
  let captionAt: number | null = null;
  let t = 0;
  let x = script.startX;
  let lift = 0;
  let facing: Facing = 'right';

  const push = (s: Pick<Segment, 'toX' | 'toLift' | 'pose' | 'arc'>, ms: number) => {
    segments.push({ ...s, start: t, end: t + ms, fromX: x, fromLift: lift, facing });
    t += ms;
    x = s.toX;
    lift = s.toLift;
  };

  for (const step of script.steps) {
    switch (step.do) {
      case 'walk':
        push({ toX: step.x, toLift: lift, pose: 'walk', arc: 0 }, step.ms);
        break;
      case 'move':
        push({ toX: step.x, toLift: step.lift, pose: step.pose, arc: 0 }, step.ms);
        break;
      case 'jump':
        push({ toX: step.x, toLift: step.lift ?? 0, pose: 'jump', arc: step.height }, step.ms);
        break;
      case 'hold':
        push({ toX: x, toLift: lift, pose: step.pose, arc: 0 }, step.ms);
        break;
      case 'prop':
        propEvents.push({ at: t, state: step.state });
        break;
      case 'caption':
        captionAt ??= t;
        break;
      case 'face':
        facing = step.facing;
        break;
    }
  }
  return { duration: t, segments, propEvents, captionAt, startX: script.startX };
}

const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

/** The state of the scene at time `t` (ms). Clamps to the start and the end. */
export function sampleTimeline(tl: Timeline, t: number): SceneFrame {
  const time = Math.max(0, Math.min(t, tl.duration));

  let propState = 'idle';
  let propSince = 0;
  for (const e of tl.propEvents) {
    if (e.at > time) break;
    propState = e.state;
    propSince = e.at;
  }
  const showCaption = tl.captionAt !== null && time >= tl.captionAt;

  const seg =
    tl.segments.find((s) => time >= s.start && time < s.end) ?? tl.segments[tl.segments.length - 1];
  if (!seg) {
    return {
      x: tl.startX,
      lift: 0,
      floor: 0,
      pose: 'idle',
      facing: 'right',
      propState,
      propSince,
      showCaption,
    };
  }

  const span = seg.end - seg.start;
  const p = span <= 0 ? 1 : Math.min(1, (time - seg.start) / span);
  // Jumps and walks travel at a steady speed; other moves ease in and out.
  const q = seg.arc > 0 || seg.pose === 'walk' ? p : easeInOut(p);
  const x = seg.fromX + (seg.toX - seg.fromX) * q;
  const floor = seg.fromLift + (seg.toLift - seg.fromLift) * q;
  const lift = floor + seg.arc * 4 * p * (1 - p);
  // Once the scene is over, a walk or jump settles into standing.
  const settled = t >= tl.duration && (seg.pose === 'walk' || seg.pose === 'jump');
  return {
    x,
    lift,
    floor,
    pose: settled ? 'idle' : seg.pose,
    facing: seg.facing,
    propState,
    propSince,
    showCaption,
  };
}

/** The camera follows the hero, keeping it left of center, within the scene's width. */
export function cameraFor(heroX: number, sceneWidth: number, viewWidth = 1280): number {
  return Math.max(0, Math.min(heroX - viewWidth * 0.38, sceneWidth - viewWidth));
}
