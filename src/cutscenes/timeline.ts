import { POSE_EXPRESSION, type Emote, type Expression } from '../art/hero/expressions';
import type { HeroPose } from '../art/hero/poses';

/**
 * Cut-scene scripts are lists of steps. Blocking steps (walk, run, move, jump, hold)
 * take time and run one after another; instant steps (prop, caption, face, shake,
 * impact, action, emote) happen at the moment they are reached.
 *
 * Positions are world x (px) and `lift`, the height of the hero's feet above the
 * ground line (px, up is positive). A blocking step's `expr` sets his face for that
 * step; otherwise the pose picks it (`POSE_EXPRESSION`).
 */
export type SceneStep =
  | { do: 'walk'; x: number; ms: number; expr?: Expression }
  | { do: 'run'; x: number; ms: number; expr?: Expression }
  /** `ease` defaults to 'inOut'; chain 'in', 'linear' and 'out' moves for one long smooth ride. */
  | {
      do: 'move';
      x: number;
      lift: number;
      ms: number;
      pose: HeroPose;
      ease?: Ease;
      expr?: Expression;
    }
  | {
      do: 'jump';
      x: number;
      lift?: number;
      height: number;
      ms: number;
      pose?: HeroPose;
      expr?: Expression;
    }
  | { do: 'hold'; pose: HeroPose; ms: number; expr?: Expression }
  | { do: 'prop'; state: string }
  | { do: 'caption' }
  | { do: 'face'; facing: Facing }
  /** Camera shake that fades out over `ms`; `amp` is the starting size in px. */
  | { do: 'shake'; ms: number; amp: number }
  /** An anime impact burst at world x, `lift` px up (a hit, a crash, a landing). */
  | { do: 'impact'; x: number; lift: number; size?: number }
  /** Focus lines rush in around the hero for `ms`: the big moment. */
  | { do: 'action'; ms: number }
  /** A sign over his head: "!", a sweat drop, sparkles. */
  | { do: 'emote'; emote: Emote }
  /**
   * The camera eases (with a little overshoot) to a zoom (1 = normal) and a tilt in degrees over
   * `ms`, framing him; it holds there until the next camera step.
   */
  | { do: 'camera'; zoom: number; tilt?: number; ms: number }
  /** An anime cut-in: a panel with a close-up of his face slams in for `ms`. */
  | { do: 'cutin'; ms: number; expr?: Expression }
  /**
   * Slow motion: the next `ms` of the scene play at `rate` (0.5 = half speed). A freeze is a
   * hit-stop: the scene holds still for `ms` of real time. Neither may overlap the next.
   */
  | { do: 'slow'; ms: number; rate: number }
  | { do: 'freeze'; ms: number };

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
  expr?: Expression;
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

interface Impact {
  at: number;
  x: number;
  lift: number;
  size: number;
}

interface CameraMove {
  at: number;
  ms: number;
  zoom: number;
  tilt: number;
  /** Where the camera was when this move began. */
  from: { zoom: number; tilt: number };
}

/** A stretch of scene time that plays slower (or not at all) in real time. */
interface Warp {
  at: number;
  scriptMs: number;
  realMs: number;
}

export interface Timeline {
  /** Scene time, ms (what scripts and props count in). */
  duration: number;
  /** How long the scene really plays, with its slow motion and freezes. */
  realDuration: number;
  segments: Segment[];
  propEvents: PropEvent[];
  shakes: Shake[];
  impacts: Impact[];
  actions: { at: number; ms: number }[];
  emotes: { at: number; emote: Emote }[];
  cameras: CameraMove[];
  cutins: { at: number; ms: number; expr: Expression }[];
  warps: Warp[];
  captionAt: number | null;
  startX: number;
}

/** How long an impact burst and an emote stay on screen, ms. */
export const IMPACT_MS = 380;
export const EMOTE_MS = 1000;

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
  expr: Expression;
  /**
   * Squash and stretch around his feet (1 = none): a crouch before a jump, a stretch as he
   * flies, a squash as he lands.
   */
  squash: { sx: number; sy: number };
  /** Horizontal speed, px/ms (for speed lines). */
  speed: number;
  /** Impact bursts on screen, with the time since each began. */
  impacts: { x: number; lift: number; size: number; dt: number }[];
  /** Focus-line strength 0..1 (0 when there are none). */
  action: number;
  /** The emote over his head and the time since it began, or null. */
  emote: { emote: Emote; dt: number } | null;
  /** In the moment before a jump, when he crouches to spring. */
  crouch: boolean;
  /**
   * How far his body tilts forward, in degrees: into a run, along the arc of a jump (back on
   * the way up, forward on the way down), with the swing of a vine.
   */
  lean: number;
  /** Time since he landed on level footing (ms), for dust and settling; null otherwise. */
  landing: number | null;
  camera: { zoom: number; tilt: number };
  /** The cut-in on screen, or null. */
  cutin: { dt: number; ms: number; expr: Expression } | null;
}

export function buildTimeline(script: SceneScript): Timeline {
  const segments: Segment[] = [];
  const propEvents: PropEvent[] = [];
  const shakes: Shake[] = [];
  const impacts: Impact[] = [];
  const actions: Timeline['actions'] = [];
  const emotes: Timeline['emotes'] = [];
  const cameras: CameraMove[] = [];
  const cutins: Timeline['cutins'] = [];
  const warps: Warp[] = [];
  let captionAt: number | null = null;
  let t = 0;
  let x = script.startX;
  let lift = 0;
  let facing: Facing = 'right';

  const push = (
    s: Pick<Segment, 'toX' | 'toLift' | 'pose' | 'arc' | 'ease' | 'expr'>,
    ms: number,
  ) => {
    segments.push({ ...s, start: t, end: t + ms, fromX: x, fromLift: lift, facing });
    t += ms;
    x = s.toX;
    lift = s.toLift;
  };

  for (const step of script.steps) {
    switch (step.do) {
      case 'walk':
      case 'run':
        push(
          { toX: step.x, toLift: lift, pose: step.do, arc: 0, ease: 'linear', expr: step.expr },
          step.ms,
        );
        break;
      case 'move':
        push(
          {
            toX: step.x,
            toLift: step.lift,
            pose: step.pose,
            arc: 0,
            ease: step.ease ?? 'inOut',
            expr: step.expr,
          },
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
            expr: step.expr,
          },
          step.ms,
        );
        break;
      case 'hold':
        push(
          { toX: x, toLift: lift, pose: step.pose, arc: 0, ease: 'linear', expr: step.expr },
          step.ms,
        );
        break;
      case 'shake':
        shakes.push({ at: t, ms: step.ms, amp: step.amp });
        break;
      case 'impact':
        impacts.push({ at: t, x: step.x, lift: step.lift, size: step.size ?? 1 });
        break;
      case 'action':
        actions.push({ at: t, ms: step.ms });
        break;
      case 'emote':
        emotes.push({ at: t, emote: step.emote });
        break;
      case 'camera': {
        const prev = cameras[cameras.length - 1];
        const from = prev ? cameraMove(prev, t) : { zoom: 1, tilt: 0 };
        cameras.push({ at: t, ms: step.ms, zoom: step.zoom, tilt: step.tilt ?? 0, from });
        break;
      }
      case 'cutin':
        cutins.push({ at: t, ms: step.ms, expr: step.expr ?? 'determined' });
        break;
      case 'slow':
        warps.push({ at: t, scriptMs: step.ms, realMs: step.ms / step.rate });
        break;
      case 'freeze':
        warps.push({ at: t, scriptMs: 0, realMs: step.ms });
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
  return {
    duration: t,
    realDuration: t + warps.reduce((sum, w) => sum + w.realMs - w.scriptMs, 0),
    segments,
    propEvents,
    shakes,
    impacts,
    actions,
    emotes,
    cameras,
    cutins,
    warps,
    captionAt,
    startX: script.startX,
  };
}

/** Scene time at real time `real` (ms), through the scene's slow motion and freezes. */
export function scriptTime(tl: Timeline, real: number): number {
  let shift = 0; // how far real time has run ahead of scene time
  for (const w of tl.warps) {
    const start = w.at + shift;
    if (real < start) break;
    if (real < start + w.realMs) return w.at + ((real - start) * w.scriptMs) / w.realMs;
    shift += w.realMs - w.scriptMs;
  }
  return Math.max(0, Math.min(tl.duration, real - shift));
}

/** A snappy ease that overshoots a touch and settles (for camera moves). */
const backOut = (p: number) => 1 + 2.2 * (p - 1) ** 3 + 1.2 * (p - 1) ** 2;

function cameraMove(c: CameraMove, time: number): { zoom: number; tilt: number } {
  const p = Math.max(0, Math.min(1, (time - c.at) / Math.max(1, c.ms)));
  const q = backOut(p);
  return {
    zoom: c.from.zoom + (c.zoom - c.from.zoom) * q,
    tilt: c.from.tilt + (c.tilt - c.from.tilt) * q,
  };
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

/** Where the hero's feet are at `time` within segment `seg`. */
function place(seg: Segment, time: number) {
  const span = seg.end - seg.start;
  const p = span <= 0 ? 1 : Math.max(0, Math.min(1, (time - seg.start) / span));
  const q = EASE[seg.ease](p);
  const floor = seg.fromLift + (seg.toLift - seg.fromLift) * q;
  return {
    x: seg.fromX + (seg.toX - seg.fromX) * q,
    floor,
    lift: floor + seg.arc * 4 * p * (1 - p),
  };
}

/** The crouch before a jump: how long it lasts (ms) and how deep it goes. */
const CROUCH_MS = 140;
const CROUCH = 0.12;
/** The squash on landing, with one springy overshoot. */
const LAND_MS = 240;
const LAND = 0.16;
/** The most a fast jump stretches him. */
const STRETCH = 0.13;

/**
 * Squash and stretch, from the timeline alone: he crouches just before a jump, stretches with
 * his vertical speed in the air (round at the top of the arc), and squashes when he lands on
 * level footing, with one springy overshoot. Taller means thinner, so he keeps his volume.
 */
function squashAt(tl: Timeline, i: number, time: number): { sx: number; sy: number } {
  const seg = tl.segments[i]!;
  let s = 0; // positive squashes, negative stretches
  if (seg.arc > 0) {
    const span = Math.max(1, seg.end - seg.start);
    const p = Math.max(0, Math.min(1, (time - seg.start) / span));
    const v = (seg.arc * 4 * (1 - 2 * p) + (seg.toLift - seg.fromLift)) / span;
    s = -Math.min(STRETCH, Math.abs(v) * 0.16);
  } else {
    const next = tl.segments[i + 1];
    const prev = tl.segments[i - 1];
    if (next && next.arc > 0 && time > next.start - CROUCH_MS && time < next.start) {
      s = CROUCH * Math.sin(((time - (next.start - CROUCH_MS)) / CROUCH_MS) * (Math.PI / 2));
    } else if (prev && prev.arc > 0 && seg.fromLift === seg.toLift) {
      const dt = time - seg.start;
      if (dt >= 0 && dt < LAND_MS) {
        s = LAND * (1 - dt / LAND_MS) * Math.cos((dt / LAND_MS) * Math.PI * 2);
      }
    }
  }
  return { sx: 1 + s * 0.7, sy: 1 - s };
}

/** The most his body tilts, degrees. */
const LEAN_MAX = 22;

/**
 * How far his body tilts forward (degrees) from how he moves: into a run, along a jump's arc
 * (fading out at take-off and landing, so he leaves and lands upright), with a swing or a ride.
 */
function leanAt(seg: Segment, time: number): number {
  const dir = seg.facing === 'right' ? 1 : -1;
  const now = place(seg, time);
  const before = place(seg, time - 16);
  const vx = ((now.x - before.x) / 16) * dir;
  const vy = (now.lift - before.lift) / 16;
  const clamp = (v: number) => Math.max(-LEAN_MAX, Math.min(LEAN_MAX, v));
  if (seg.arc > 0) {
    const span = Math.max(1, seg.end - seg.start);
    const p = Math.max(0, Math.min(1, (time - seg.start) / span));
    const travel = (Math.atan2(vy, Math.max(0.05, Math.abs(vx))) * 180) / Math.PI;
    return clamp(-travel * 0.4 + vx * 8) * Math.sin(Math.PI * p);
  }
  if (seg.pose === 'run') return Math.min(14, vx * 16);
  if (seg.pose === 'walk') return Math.min(5, vx * 10);
  if (seg.fromX !== seg.toX || seg.fromLift !== seg.toLift) return clamp(vx * 18);
  return 0;
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
  const impacts = tl.impacts
    .filter((m) => time >= m.at && time < m.at + IMPACT_MS)
    .map((m) => ({ x: m.x, lift: m.lift, size: m.size, dt: time - m.at }));
  let action = 0;
  for (const a of tl.actions) {
    const dt = time - a.at;
    if (dt < 0 || dt > a.ms) continue;
    action = Math.max(action, Math.min(1, dt / 120, (a.ms - dt) / 200));
  }
  let emote: SceneFrame['emote'] = null;
  for (const e of tl.emotes) {
    if (time >= e.at && time < e.at + EMOTE_MS) emote = { emote: e.emote, dt: time - e.at };
  }
  const cam = [...tl.cameras].reverse().find((c) => time >= c.at);
  const camera = cam ? cameraMove(cam, time) : { zoom: 1, tilt: 0 };
  const shown = tl.cutins.find((c) => time >= c.at && time < c.at + c.ms);
  const cutin = shown ? { dt: time - shown.at, ms: shown.ms, expr: shown.expr } : null;
  const extras = { impacts, action, emote, camera, cutin };

  let i = tl.segments.findIndex((s) => time >= s.start && time < s.end);
  if (i < 0) i = tl.segments.length - 1;
  const seg = tl.segments[i];
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
      expr: POSE_EXPRESSION.idle,
      squash: { sx: 1, sy: 1 },
      speed: 0,
      crouch: false,
      lean: 0,
      landing: null,
      ...extras,
    };
  }

  const { x, floor, lift } = place(seg, time);
  const speed = seg.end - seg.start > 16 ? (x - place(seg, time - 16).x) / 16 : 0;
  // Once the scene is over, a walk, run or jump settles into standing.
  const settled = t >= tl.duration && (seg.pose === 'walk' || seg.pose === 'run' || seg.arc > 0);
  const pose = settled ? 'idle' : seg.pose;
  const next = tl.segments[i + 1];
  const prev = tl.segments[i - 1];
  const crouch =
    !settled && seg.arc === 0 && !!next && next.arc > 0 && time > next.start - CROUCH_MS;
  const landed =
    !!prev && prev.arc > 0 && seg.arc === 0 && seg.fromLift === seg.toLift
      ? time - seg.start
      : null;
  return {
    x,
    lift,
    floor,
    pose,
    facing: seg.facing,
    propState,
    propSince,
    showCaption,
    shake,
    expr: settled ? POSE_EXPRESSION.idle : (seg.expr ?? POSE_EXPRESSION[pose]),
    squash: settled ? { sx: 1, sy: 1 } : squashAt(tl, i, time),
    speed: settled ? 0 : speed,
    crouch,
    lean: settled ? 0 : leanAt(seg, time),
    landing: landed !== null && landed < 600 ? landed : null,
    ...extras,
  };
}

/** The camera follows the hero, keeping it left of center, within the scene's width. */
export function cameraFor(heroX: number, sceneWidth: number, viewWidth = 1280): number {
  return Math.max(0, Math.min(heroX - viewWidth * 0.38, sceneWidth - viewWidth));
}
