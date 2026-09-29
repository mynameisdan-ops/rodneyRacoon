import type { HeroPose } from '../art/hero/poses';

/**
 * Cut-scene scripts are lists of steps. Blocking steps (walk, run, move, jump, hold)
 * take time and run one after another; instant steps (prop, caption, face, shake)
 * happen at the moment they are reached.
 *
 * Positions are world x (px) and `lift`, the height of the hero's feet above the
 * ground line (px, up is positive).
 */
export type SceneStep =
  | { do: 'walk'; x: number; ms: number }
  | { do: 'run'; x: number; ms: number }
  /** `ease` defaults to 'inOut'; chain 'in', 'linear' and 'out' moves for one long smooth ride. */
  | { do: 'move'; x: number; lift: number; ms: number; pose: HeroPose; ease?: Ease }
  | { do: 'jump'; x: number; lift?: number; height: number; ms: number; pose?: HeroPose }
  | { do: 'hold'; pose: HeroPose; ms: number }
  | { do: 'prop'; state: string }
  | { do: 'caption' }
  | { do: 'face'; facing: Facing }
  /** Camera shake that fades out over `ms`; `amp` is the starting size in px. */
  | { do: 'shake'; ms: number; amp: number };

export type Ease = 'linear' | 'in' | 'out' | 'inOut';

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
  ease: Ease;
  facing: Facing;
}

export interface PropEvent {
  at: number;
  state: string;
}

interface Shake {
  at: number;
  ms: number;
  amp: number;
}

export interface Timeline {
  duration: number;
  segments: Segment[];
  propEvents: PropEvent[];
  shakes: Shake[];
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
  /** Camera shake offset, px. */
  shake: { x: number; y: number };
}

export function buildTimeline(script: SceneScript): Timeline {
  const segments: Segment[] = [];
  const propEvents: PropEvent[] = [];
  const shakes: Shake[] = [];
  let captionAt: number | null = null;
  let t = 0;
  let x = script.startX;
  let lift = 0;
  let facing: Facing = 'right';

  const push = (s: Pick<Segment, 'toX' | 'toLift' | 'pose' | 'arc' | 'ease'>, ms: number) => {
    segments.push({ ...s, start: t, end: t + ms, fromX: x, fromLift: lift, facing });
    t += ms;
    x = s.toX;
    lift = s.toLift;
  };

  for (const step of script.steps) {
    switch (step.do) {
      case 'walk':
      case 'run':
        push({ toX: step.x, toLift: lift, pose: step.do, arc: 0, ease: 'linear' }, step.ms);
        break;
      case 'move':
        push(
          { toX: step.x, toLift: step.lift, pose: step.pose, arc: 0, ease: step.ease ?? 'inOut' },
          step.ms,
        );
        break;
      case 'jump':
        push(
          {
            toX: step.x,
            toLift: step.lift ?? 0,
            pose: step.pose ?? 'jump',
            arc: step.height,
            ease: 'linear',
          },
          step.ms,
        );
        break;
      case 'hold':
        push({ toX: x, toLift: lift, pose: step.pose, arc: 0, ease: 'linear' }, step.ms);
        break;
      case 'shake':
        shakes.push({ at: t, ms: step.ms, amp: step.amp });
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
  return { duration: t, segments, propEvents, shakes, captionAt, startX: script.startX };
}

const EASE: Record<Ease, (p: number) => number> = {
  linear: (p) => p,
  in: (p) => p * p,
  out: (p) => 1 - (1 - p) ** 2,
  inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2),
};

/** Sum of the active shakes at `time`: a fast wobble that fades out. */
function shakeAt(shakes: Shake[], time: number): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (const s of shakes) {
    const dt = time - s.at;
    if (dt < 0 || dt >= s.ms) continue;
    const a = s.amp * (1 - dt / s.ms);
    x += a * Math.sin(dt * 0.11);
    y += a * 0.7 * Math.sin(dt * 0.17 + 1);
  }
  return { x, y };
}

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
  const shake = shakeAt(tl.shakes, time);

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
      shake,
    };
  }

  const span = seg.end - seg.start;
  const p = span <= 0 ? 1 : Math.min(1, (time - seg.start) / span);
  const q = EASE[seg.ease](p);
  const x = seg.fromX + (seg.toX - seg.fromX) * q;
  const floor = seg.fromLift + (seg.toLift - seg.fromLift) * q;
  const lift = floor + seg.arc * 4 * p * (1 - p);
  // Once the scene is over, a walk, run or jump settles into standing.
  const settled = t >= tl.duration && (seg.pose === 'walk' || seg.pose === 'run' || seg.arc > 0);
  return {
    x,
    lift,
    floor,
    pose: settled ? 'idle' : seg.pose,
    facing: seg.facing,
    propState,
    propSince,
    showCaption,
    shake,
  };
}

/** The camera follows the hero, keeping it left of center, within the scene's width. */
export function cameraFor(heroX: number, sceneWidth: number, viewWidth = 1280): number {
  return Math.max(0, Math.min(heroX - viewWidth * 0.38, sceneWidth - viewWidth));
}
