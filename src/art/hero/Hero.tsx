import { memo, useId } from 'react';
import type { HairStyle } from '../../content/avatar';
import { wornItem, type ShopItem } from '../../content/shop';
import { INK, ink, shade, tint } from '../style';
import type { AvatarConfig } from './avatar';
import { BODY, capeColor, CX, type BodyDef } from './body';
import { POSE_EXPRESSION, type Expression } from './expressions';
import { Cape, Hat, Pack, Pet } from './gear';
import { HAT_LINE } from './gear/layout';
import type { HeroPose } from './poses';
import './hero.css';

export type { HeroPose };

/*
 * The hero (M7b): a young adventurer in a tunic, cape, belt, satchel and boots, in a
 * Saturday-morning cartoon style. He stands in a three-quarter view facing right, with big anime
 * eyes, bold outlines on his silhouette and thin ones inside, one crisp shadow shape per part and
 * a rim light on the lit edge. He's a paper doll with his feet at (52, 163) in a 100×170 view:
 * arms and legs are two segments (shoulder/elbow, hip/knee), each drawn hanging down from its
 * joint, so poses are just rotations (see hero.css). The far limbs use darker colors instead of a
 * CSS filter, which is slow on tablets.
 */

const VIEW_W = 100;
const VIEW_H = 170;
/** Silhouette and inner line widths, view units. */
const OUT = 2.5;
const IN = 1.3;
const LEATHER = '#7a4a2a';
const BRASS = '#f0c050';
const EYE = '#5a3620';
const MOUTH = '#6a1d24';

type HatItem = Extract<ShopItem, { slot: 'hat' }>;

interface Props {
  avatar: AvatarConfig;
  pose?: HeroPose;
  /** Overrides the pose's own face. */
  expression?: Expression;
  facing?: 'left' | 'right';
  /** Rendered height in px (width follows the 100:170 aspect ratio). */
  size?: number;
  /** Draw the ground shadow under the feet (off when a scene draws its own). */
  shadow?: boolean;
  /** Draw his pet, if he has one (off in cut scenes, where he leaps and swings). */
  pet?: boolean;
  /** 0..1: how hard the air rushes past him (his cape and hair stream back). */
  wind?: number;
  className?: string;
}

function HeroArt({
  avatar,
  pose = 'idle',
  expression,
  facing = 'right',
  size = 120,
  shadow = true,
  pet = true,
  wind = 0,
  className,
}: Props) {
  const b = BODY;
  const { skin, shirt, pants, shoes, gear } = avatar;
  const expr = expression ?? POSE_EXPRESSION[pose];
  const hat = wornItem(gear, 'hat');
  const pack = wornItem(gear, 'pack');
  const petItem = pet ? wornItem(gear, 'pet') : undefined;
  // In a three-quarter view facing right, the near arm and leg (his right) hang on the left
  // of the body, in front; the far ones on the right, partly behind it.
  const farShoulder = { x: CX + b.chest * 0.24, y: b.shoulderY + 2 };
  const nearShoulder = { x: CX - b.chest * 0.26, y: b.shoulderY + 1 };
  const neck = { x: b.head.x - 2, y: b.head.y + 22 * b.head.s };
  return (
    <svg
      className={['hero-svg', `hero-svg--${pose}`, className].filter(Boolean).join(' ')}
      width={(size * VIEW_W) / VIEW_H}
      height={size}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      style={facing === 'left' ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden
    >
      {shadow && (
        <ellipse
          className="hero-shadow"
          cx={52}
          cy={164}
          rx={22}
          ry={4.5}
          fill="rgba(20,10,40,0.25)"
        />
      )}
      <g className="hero-body">
        {/* The wind swings the cape back; the pose's own sway or flap plays inside. */}
        <g transform={`rotate(${wind * 38} ${CX - 4} ${b.shoulderY - 2})`}>
          <g className="hero-cape">
            <Cape color={capeColor(shirt)} item={wornItem(gear, 'cape')} />
          </g>
        </g>
        {pack && <Pack item={pack} />}
        <g transform={`translate(${farShoulder.x} ${farShoulder.y})`}>
          <Arm side="back" b={b} sleeve={shade(shirt, 0.3)} skin={shade(skin, 0.28)} />
        </g>
        <g transform={`translate(${CX + 5} ${b.hipY})`}>
          <Leg side="back" b={b} pants={shade(pants, 0.3)} boots={shade(shoes, 0.28)} />
        </g>
        <g transform={`translate(${CX - 4} ${b.hipY})`}>
          <Leg side="front" b={b} pants={pants} boots={shoes} />
        </g>
        <Satchel b={b} />
        {/* The neck, in the shadow of the head. */}
        <rect
          x={neck.x - 4.5}
          y={neck.y - 8}
          width={9}
          height={b.shoulderY - neck.y + 8}
          rx={3}
          fill={shade(skin, 0.22)}
          {...ink(OUT)}
        />
        <Tunic b={b} shirt={shirt} />
        <g className="hero-head">
          <g transform={`translate(${b.head.x} ${b.head.y}) scale(${b.head.s})`}>
            <Head
              skin={skin}
              hairColor={avatar.hairColor}
              hairStyle={avatar.hairStyle}
              expr={expr}
              s={b.head.s}
              wind={wind}
              hat={hat}
            />
          </g>
        </g>
        <g transform={`translate(${nearShoulder.x} ${nearShoulder.y})`}>
          <Arm side="front" b={b} sleeve={shirt} skin={skin} />
        </g>
      </g>
      {petItem && <Pet item={petItem} />}
    </svg>
  );
}

/** Same avatar? Compared by its looks, since callers often rebuild the object every render. */
const sameAvatar = (a: AvatarConfig, b: AvatarConfig) =>
  a === b ||
  (a.skin === b.skin &&
    a.hairStyle === b.hairStyle &&
    a.hairColor === b.hairColor &&
    a.shirt === b.shirt &&
    a.pants === b.pants &&
    a.shoes === b.shoes &&
    JSON.stringify(a.gear) === JSON.stringify(b.gear));

/**
 * The hero, driven by the avatar and a pose. Scenes move him every frame with a transform on a
 * group around him, so he only redraws when something about him changes (keep `wind` coarse,
 * e.g. in tenths).
 */
export const Hero = memo(
  HeroArt,
  (a, b) =>
    sameAvatar(a.avatar, b.avatar) &&
    a.pose === b.pose &&
    a.expression === b.expression &&
    a.facing === b.facing &&
    a.size === b.size &&
    a.shadow === b.shadow &&
    a.pet === b.pet &&
    a.wind === b.wind &&
    a.className === b.className,
);

// ---------- Body ----------

function Tunic({ b, shirt }: { b: BodyDef; shirt: string }) {
  const { shoulderY: sy, hipY: hy, chest, waist } = b;
  const back = CX - chest / 2;
  const front = CX + chest / 2;
  const wb = CX - waist / 2;
  const wf = CX + waist / 2;
  const body = `M${back + 2} ${sy - 1} Q${CX - 3} ${sy - 6} ${CX + 2} ${sy - 4} Q${front - 1} ${sy - 5} ${front} ${sy + 3} L${wf + 1} ${hy - 6} Q${wf + 3} ${hy + 3} ${wf + 4} ${hy + 9} Q${CX} ${hy + 6} ${wb - 4} ${hy + 9} Q${wb - 3} ${hy + 2} ${wb - 1} ${hy - 6} L${back} ${sy + 5} Z`;
  const shadow = `M${back + 2} ${sy - 1} Q${CX - 6} ${sy - 4} ${CX - 4} ${sy} Q${CX - 6} ${hy - 20} ${CX - 3} ${hy + 6} Q${CX - 9} ${hy + 6} ${wb - 4} ${hy + 9} Q${wb - 3} ${hy + 2} ${wb - 1} ${hy - 6} L${back} ${sy + 5} Z`;
  const strapFrom = { x: front - 4, y: sy - 3 };
  const strapTo = { x: back - 1, y: hy - 6 };
  return (
    <g>
      <path d={body} fill={shirt} {...ink(OUT)} />
      <path d={shadow} fill={shade(shirt, 0.3)} />
      {/* Rim light down the lit front edge. */}
      <path
        d={`M${front - 2.5} ${sy + 4} L${wf - 1.5} ${hy - 6}`}
        stroke={tint(shirt, 0.55)}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      {/* The V of the collar. */}
      <path
        d={`M${CX - 1} ${sy - 4.5} L${CX + 5} ${sy + 5} L${CX + 10} ${sy - 4}`}
        fill={shade(shirt, 0.45)}
        {...ink(IN)}
      />
      {/* The strap across the chest, then the belt. */}
      <path
        d={`M${strapFrom.x} ${strapFrom.y} L${strapTo.x} ${strapTo.y}`}
        stroke={INK}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d={`M${strapFrom.x} ${strapFrom.y} L${strapTo.x} ${strapTo.y}`}
        stroke={LEATHER}
        strokeWidth={3.6}
        strokeLinecap="round"
      />
      <path
        d={`M${wb - 1.5} ${hy - 7} Q${CX} ${hy - 9.5} ${wf + 1.5} ${hy - 7} L${wf + 2} ${hy - 1} Q${CX} ${hy - 3.5} ${wb - 2} ${hy - 1} Z`}
        fill={LEATHER}
        {...ink(IN + 0.3)}
      />
      <rect x={CX + 4} y={hy - 9.5} width={7} height={8} rx={1.6} fill={BRASS} {...ink(IN)} />
      <rect x={CX + 6.2} y={hy - 7.4} width={2.6} height={3.8} rx={0.6} fill={shade(BRASS, 0.5)} />
    </g>
  );
}

function Satchel({ b }: { b: BodyDef }) {
  const x = CX - b.chest / 2 - 8;
  const y = b.hipY - 14;
  return (
    <g>
      <rect x={x} y={y} width={15} height={14} rx={3.5} fill={LEATHER} {...ink(OUT)} />
      <path d={`M${x} ${y + 5} H${x + 15}`} stroke={shade(LEATHER, 0.45)} strokeWidth={2} />
      <rect x={x + 5.5} y={y + 4} width={4} height={4} rx={1} fill={BRASS} {...ink(1)} />
    </g>
  );
}

/** An arm hanging from the shoulder at (0, 0); the elbow is `upper` below it. */
function Arm({
  side,
  b,
  sleeve,
  skin,
}: {
  side: 'front' | 'back';
  b: BodyDef;
  sleeve: string;
  skin: string;
}) {
  const { upper, fore } = b;
  return (
    <g className={`hero-arm hero-arm--${side}`}>
      <g transform={`translate(0 ${upper})`}>
        <g className={`hero-fore hero-fore--${side}`}>
          <rect x={-3.4} y={-2} width={6.8} height={fore + 1} rx={3.4} fill={skin} {...ink(OUT)} />
          <rect
            x={-4.2}
            y={fore * 0.3}
            width={8.4}
            height={fore * 0.42}
            rx={2}
            fill={LEATHER}
            {...ink(IN)}
          />
          <path
            d={`M-4.4 ${fore - 1} Q-5.8 ${fore + 6} -2.2 ${fore + 7.6} Q2 ${fore + 8.6} 4.4 ${fore + 5} Q5.6 ${fore + 2} 4.6 ${fore - 1} Z`}
            fill={skin}
            {...ink(OUT - 0.6)}
          />
          <path
            d={`M3.6 ${fore} Q7.6 ${fore + 0.6} 7 ${fore + 4.4} Q5.4 ${fore + 5.4} 4 ${fore + 3.6}`}
            fill={skin}
            {...ink(IN)}
          />
        </g>
      </g>
      <path
        d={`M-5.6 -5 Q-7.4 ${upper * 0.45} -5.2 ${upper + 2} Q0 ${upper + 4.4} 5.2 ${upper + 2} Q7.2 ${upper * 0.45} 5.6 -5 Q0 -8 -5.6 -5 Z`}
        fill={sleeve}
        {...ink(OUT)}
      />
      <path
        d={`M-5.6 -3 Q-7.2 ${upper * 0.45} -5 ${upper + 1.5} Q-2.5 ${upper + 3} -1.2 ${upper + 2.8} Q-3.4 ${upper * 0.5} -2.2 -5 Z`}
        fill={shade(sleeve, 0.3)}
      />
      <path
        d={`M-5 ${upper - 1} Q0 ${upper + 1.6} 5 ${upper - 1}`}
        fill="none"
        stroke={shade(sleeve, 0.45)}
        strokeWidth={IN}
      />
    </g>
  );
}

/** A leg hanging from the hip at (0, 0); the knee is `thigh` below it, the sole `shin` below that. */
function Leg({
  side,
  b,
  pants,
  boots,
}: {
  side: 'front' | 'back';
  b: BodyDef;
  pants: string;
  boots: string;
}) {
  const { thigh, shin } = b;
  const top = shin - 20;
  return (
    <g className={`hero-leg hero-leg--${side}`}>
      <g transform={`translate(0 ${thigh})`}>
        <g className={`hero-shin hero-shin--${side}`}>
          <rect x={-4.8} y={-3} width={9.6} height={top + 6} rx={4.4} fill={pants} {...ink(OUT)} />
          <path
            d={`M-6 ${top} H6 V${shin - 8} Q13.5 ${shin - 8.6} 15.4 ${shin - 3.4} V${shin} H-6 Z`}
            fill={boots}
            {...ink(OUT)}
          />
          <path d={`M-6 ${top + 4} V${shin} H-1 V${top + 4} Z`} fill={shade(boots, 0.3)} />
          <path
            d={`M-6.8 ${top - 1} H6.8 V${top + 4.6} H-6.8 Z`}
            fill={tint(boots, 0.22)}
            {...ink(IN + 0.2)}
          />
          <path d={`M-6 ${shin - 1.6} H15`} stroke={shade(boots, 0.5)} strokeWidth={2} />
          <path
            d={`M8 ${shin - 7.6} Q12 ${shin - 7.4} 13.6 ${shin - 5}`}
            fill="none"
            stroke={tint(boots, 0.45)}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </g>
      </g>
      <rect x={-5.8} y={-4} width={11.6} height={thigh + 5} rx={5.6} fill={pants} {...ink(OUT)} />
      <path
        d={`M-5.8 0 Q-6 ${thigh * 0.5} -4.4 ${thigh} L-1.6 ${thigh} Q-3 ${thigh * 0.5} -2.4 -3 Z`}
        fill={shade(pants, 0.3)}
      />
    </g>
  );
}

// ---------- Head ----------
// Drawn around the middle of the skull at (0, 0), facing right in a three-quarter view: the
// near eye (his right) is big and on the left, the far eye is narrower near the edge of the face.

const FACE =
  'M-22 -2 C-23 -19 -11 -28 2 -28 C17 -28 26 -18 26 -3 C26 7 23 15 17 21 C12 26 7 28 2 28 C-8 28 -16 22 -19 13 C-21 8 -22 4 -22 -2 Z';
const FACE_SHADE =
  'M-22 -2 C-22 4 -21 8 -19 13 C-16 22 -8 28 2 28 C-5 25 -10 19 -12 11 C-13.5 5 -12 -2 -14 -8 Z';
const NEAR_EYE = { x: 0, y: 2, w: 7, h: 9.6, outer: -1 } as const;
const FAR_EYE = { x: 17.6, y: 2, w: 4.6, h: 9, outer: 1 } as const;

/**
 * His head, around the middle of the skull. `s` is the scale it's drawn at (lines are sized to
 * match the body); `weight` thins or thickens every line (a close-up wants thinner ones), and
 * `wind` streams locks of hair back. A hat sits on it; hair above a hat's band is tucked under.
 */
export function Head({
  skin,
  hairColor,
  hairStyle,
  expr,
  s,
  weight = 1,
  wind = 0,
  hat,
}: {
  skin: string;
  hairColor: string;
  hairStyle: HairStyle;
  expr: Expression;
  s: number;
  weight?: number;
  wind?: number;
  hat?: HatItem;
}) {
  const faceClip = useId();
  const hairClip = useId();
  const hair = HAIR[hairStyle];
  const line = ink((OUT / s) * weight);
  const wd = Math.max(0, Math.min(1, wind));
  const tuck = hat ? HAT_LINE[hat.art] : undefined;
  const tucked = tuck === undefined ? undefined : `url(#${hairClip})`;
  return (
    <g>
      <clipPath id={faceClip}>
        <path d={FACE} />
      </clipPath>
      {tuck !== undefined && (
        <clipPath id={hairClip}>
          <rect x={-80} y={tuck} width={160} height={120} />
        </clipPath>
      )}
      {/* In the wind, locks of hair stream back from behind his head. */}
      <g clipPath={tucked}>
        {wd > 0.05 &&
          [
            [-23, -24, 1],
            [-26, -13, 1.25],
            [-24, -2, 0.9],
          ].map(([x, y, k], i) => {
            const len = (8 + 24 * wd) * k!;
            const lift = -7 * wd + i * 2;
            return (
              <path
                key={i}
                d={`M${x} ${y! - 3.6} Q${x! - len * 0.5} ${y! - 4.5 + lift * 0.5} ${x! - len} ${y! + lift} Q${x! - len * 0.45} ${y! + 1.5 + lift * 0.3} ${x} ${y! + 3.6} Z`}
                fill={shade(hairColor, 0.15)}
                {...line}
              />
            );
          })}
        <path d={hair.back} fill={shade(hairColor, 0.3)} {...line} />
      </g>
      <path d={FACE} fill={skin} {...line} />
      <g clipPath={`url(#${faceClip})`}>
        <path d={FACE_SHADE} fill={shade(skin, 0.2)} />
        {/* The hair's (or the hat's) shadow on the forehead. */}
        <path
          d={hair.front}
          transform="translate(-1.8 3.4)"
          fill={shade(skin, 0.2)}
          clipPath={tucked}
        />
      </g>
      {/* Rim light along the lit cheek. */}
      <path
        d="M24.4 -2 C24.4 7 21.6 14 16 19.6"
        fill="none"
        stroke={tint(skin, 0.6)}
        strokeWidth={1.8 * weight}
        strokeLinecap="round"
      />
      <ellipse cx={-1} cy={13} rx={5} ry={2.4} fill="#ff7d7d" opacity={0.28} />
      <ellipse cx={20} cy={12} rx={2.6} ry={2} fill="#ff7d7d" opacity={0.28} />
      <g className="hero-eyes">
        <Eye eye={NEAR_EYE} expr={expr} skin={skin} s={s} weight={weight} />
        <Eye eye={FAR_EYE} expr={expr} skin={skin} s={s} weight={weight} />
      </g>
      {/* A small nose: just its shadow. */}
      <path d="M16.6 8.6 L18.6 12.2 L15.6 12.6 Z" fill={shade(skin, 0.3)} />
      <Mouth expr={expr} weight={weight} />
      {/* The ear on the near side of the head. */}
      <path
        d="M-17 -1 C-24 -5 -29 3 -25.5 10 C-23.5 14 -19.5 14.5 -16.5 12"
        fill={skin}
        {...ink((OUT / s - 0.4) * weight)}
      />
      <path
        d="M-19 3 C-23 2 -23.5 7 -20.5 9.5"
        fill="none"
        stroke={shade(skin, 0.4)}
        strokeWidth={1.4 * weight}
        strokeLinecap="round"
      />
      <g clipPath={tucked}>
        <path d={hair.front} fill={hairColor} {...ink((1.6 / s) * weight)} />
        <path d={hair.shade} fill={shade(hairColor, 0.3)} />
        <path d={hair.shine} fill={tint(hairColor, 0.45)} />
        <path d={hair.crown} fill="none" {...line} />
      </g>
      <Brows expr={expr} color={shade(hairColor, 0.6)} weight={weight} />
      {hat && <Hat item={hat} s={s} weight={weight} />}
    </g>
  );
}

type EyeDef = { x: number; y: number; w: number; h: number; outer: -1 | 1 };

/**
 * An anime eye: a white with a big iris, two highlights and a thick upper lid. The lid's slant
 * carries the expression: a low inner corner looks determined, a low outer corner worried.
 */
function Eye({
  eye,
  expr,
  skin,
  s,
  weight,
}: {
  eye: EyeDef;
  expr: Expression;
  skin: string;
  s: number;
  weight: number;
}) {
  const clip = useId();
  const { x, y, w, h, outer } = eye;
  if (expr === 'happy') {
    // Closed, smiling eyes.
    return (
      <path
        d={`M${x - w} ${y + 1} Q${x} ${y - h * 0.9} ${x + w} ${y + 1}`}
        fill="none"
        stroke={INK}
        strokeWidth={(2.6 / s) * weight}
        strokeLinecap="round"
      />
    );
  }
  const white = `M${x - w} ${y - h * 0.3} C${x - w * 0.6} ${y - h * 0.95} ${x + w * 0.6} ${y - h * 1.02} ${x + w} ${y - h * 0.4} C${x + w * 1.06} ${y + h * 0.4} ${x + w * 0.5} ${y + h} ${x} ${y + h} C${x - w * 0.6} ${y + h} ${x - w * 1.06} ${y + h * 0.4} ${x - w} ${y - h * 0.3} Z`;
  const surprised = expr === 'surprised';
  const iris = surprised ? 0.55 : 0.78;
  // Lid edge heights at the outer and inner corners (inner is toward the nose).
  const lid: Record<Exclude<Expression, 'happy'>, [number, number]> = {
    calm: [-0.78, -0.86],
    determined: [-0.62, -0.18],
    shout: [-0.66, -0.3],
    worried: [-0.3, -0.8],
    surprised: [-1.05, -1.05],
  };
  const [lo, li] = lid[expr];
  const xo = x + outer * w * 1.12;
  const xi = x - outer * w * 1.05;
  const yo = y + h * lo;
  const yi = y + h * li;
  const ix = x + w * 0.18;
  return (
    <g>
      <clipPath id={clip}>
        <path d={white} />
      </clipPath>
      <path d={white} fill="#fff" />
      <g clipPath={`url(#${clip})`}>
        <ellipse cx={ix} cy={y + h * 0.1} rx={w * iris} ry={h * iris} fill={EYE} />
        <ellipse
          cx={ix}
          cy={y + h * 0.42}
          rx={w * iris * 0.7}
          ry={h * iris * 0.38}
          fill={tint(EYE, 0.35)}
        />
        <ellipse cx={ix} cy={y + h * 0.05} rx={w * iris * 0.45} ry={h * iris * 0.5} fill={INK} />
        <ellipse cx={ix - w * 0.28} cy={y - h * 0.28} rx={w * 0.3} ry={h * 0.24} fill="#fff" />
        <circle cx={ix + w * 0.32} cy={y + h * 0.42} r={w * 0.12} fill="#fff" />
        {/* The eyelid, in skin, above the lid line. */}
        <path
          d={`M${xo} ${yo} L${xi} ${yi} L${xi} ${y - h * 1.4} L${xo} ${y - h * 1.4} Z`}
          fill={skin}
        />
      </g>
      <path
        d={`M${xo} ${yo} Q${x} ${Math.min(yo, yi) - h * 0.14} ${xi} ${yi}`}
        fill="none"
        stroke={INK}
        strokeWidth={(3 / s) * weight}
        strokeLinecap="round"
      />
      {/* A flick of lashes at the outer corner, and the lower lid. */}
      <path
        d={`M${xo} ${yo} l${outer * 2.4} ${-1.6}`}
        stroke={INK}
        strokeWidth={(2.2 / s) * weight}
        strokeLinecap="round"
      />
      <path
        d={`M${x + outer * w * 0.75} ${y + h * 0.78} Q${x + outer * w * 0.3} ${y + h * 1.02} ${x - outer * w * 0.1} ${y + h * 1.02}`}
        fill="none"
        stroke={INK}
        strokeWidth={(1.2 / s) * weight}
        strokeLinecap="round"
      />
    </g>
  );
}

function Brows({ expr, color, weight }: { expr: Expression; color: string; weight: number }) {
  // [outer y, inner y] of each brow.
  const pos: Record<Expression, [number, number]> = {
    calm: [-11, -11.5],
    determined: [-12.5, -8.4],
    shout: [-13, -8.8],
    happy: [-12.5, -12.5],
    surprised: [-15.5, -16],
    worried: [-9.5, -14],
  };
  const [o, i] = pos[expr];
  const arch = expr === 'determined' || expr === 'shout' ? 0.6 : -1.6;
  return (
    <g fill="none" stroke={color} strokeWidth={2.2 * weight} strokeLinecap="round">
      <path d={`M-6.5 ${o} Q-0.5 ${(o + i) / 2 + arch} 5 ${i}`} />
      <path d={`M22.5 ${o + 0.4} Q18 ${(o + i) / 2 + arch} 14 ${i}`} />
    </g>
  );
}

function Mouth({ expr, weight }: { expr: Expression; weight: number }) {
  switch (expr) {
    case 'calm':
      return <path d="M5 16.4 Q10.5 19.8 15.4 15.4" fill="none" {...ink(1.7 * weight)} />;
    case 'determined':
      return (
        <g>
          <path d="M4.5 17 Q10 18.6 15.6 14.6" fill="none" {...ink(1.8 * weight)} />
          <path d="M15.6 14.6 l1.2 -1.6" fill="none" {...ink(1.4 * weight)} />
        </g>
      );
    case 'happy':
      return (
        <g>
          <path
            d="M3.6 14.4 Q10 16.2 16.8 13.4 Q15.4 24 9.6 24 Q4.6 23.4 3.6 14.4 Z"
            fill={MOUTH}
            {...ink(1.6 * weight)}
          />
          <path d="M6 21 Q9.6 18.4 13.8 20.8 Q11.4 23.6 9.4 23.4 Q7.2 23 6 21 Z" fill="#ff7d7d" />
        </g>
      );
    case 'surprised':
      return <ellipse cx={10.4} cy={19} rx={2.8} ry={3.6} fill={MOUTH} {...ink(1.5 * weight)} />;
    case 'worried':
      return (
        <path d="M5 18 Q7.6 15.8 10.2 18 Q12.8 20.2 15.2 17" fill="none" {...ink(1.7 * weight)} />
      );
    case 'shout':
      return (
        <g>
          <path
            d="M3 13.2 Q10.4 12.8 17.4 12 Q16.4 25.4 10 25.4 Q4.4 24.8 3 13.2 Z"
            fill={MOUTH}
            {...ink(1.6 * weight)}
          />
          <path d="M3.6 13.6 Q10.4 13.2 16.8 12.6 L16.5 15 Q10.2 15.6 4 16 Z" fill="#fff" />
          <path d="M6.2 22.4 Q10 19.6 14.2 22 Q12 25 10 25 Q7.6 24.6 6.2 22.4 Z" fill="#ff7d7d" />
        </g>
      );
  }
}

// ---------- Hair ----------
// `back` is drawn behind the face (behind the ear and the nape) and `front` over it, with the
// bangs falling in a few big locks. `crown` is the front's outer edge, which gets the bold
// silhouette line (the bangs' own edge gets a thin one). `shade` darkens its back and `shine` is
// the anime highlight band across the crown. The front casts its shadow on the face.

interface HairDef {
  back: string;
  front: string;
  crown: string;
  shade: string;
  shine: string;
}

const HAIR: Record<HairStyle, HairDef> = {
  short: {
    back: 'M-24 -10 C-30 -4 -29 8 -23 16 L-19 13 L-16 18 L-14 8 Z',
    front:
      'M-24.5 -5 C-29 -16 -20 -35 4 -37 C18 -37 28 -29 29.5 -15 Q30 -10 26 -5 Q24.5 -11 19.5 -15.5 Q19 -6 13.5 -1 Q12 -10 7.5 -15.5 Q6 -8 1.5 -4 Q-0.5 -11 -4.5 -15 Q-8 -4 -13.5 9 Q-15 -1 -17.5 -4.5 Q-21 -3 -24.5 -5 Z',
    crown:
      'M-17.5 -4.5 Q-21 -3 -24.5 -5 C-29 -16 -20 -35 4 -37 C18 -37 28 -29 29.5 -15 Q30 -10 26 -5',
    shade:
      'M-24.5 -5 C-29 -16 -20 -35 4 -37 C-9 -32 -15 -22 -15.5 -10 Q-16.5 -6 -17.5 -4.5 Q-21 -3 -24.5 -5 Z',
    shine:
      'M-14 -26 Q3 -35.5 21 -28.5 L19 -24.5 L14 -27.6 L11 -22.5 L7 -27.8 L1 -24 L-3 -28.2 L-9 -23.5 Z',
  },
  spiky: {
    back: 'M-24 -10 L-33 2 L-25 4 L-27 14 L-18 12 L-14 8 Z',
    front:
      'M-24.5 -5 L-31 -12 L-26 -17 L-35 -27 L-21 -28 L-24 -40 L-10 -34 L-4 -46 L4 -37 L15 -44 L17 -34 C26 -32 30 -24 29.5 -15 L27 -4 L19.5 -15.5 L14 0 L7.5 -15.5 L1.5 -3 L-4.5 -15.5 L-14 10 L-17.5 -4.5 Q-21 -3 -24.5 -5 Z',
    crown:
      'M-17.5 -4.5 Q-21 -3 -24.5 -5 L-31 -12 L-26 -17 L-35 -27 L-21 -28 L-24 -40 L-10 -34 L-4 -46 L4 -37 L15 -44 L17 -34 C26 -32 30 -24 29.5 -15 L27 -4',
    shade:
      'M-24.5 -5 L-31 -12 L-26 -17 L-35 -27 L-21 -28 L-24 -40 L-10 -34 C-16 -26 -16 -16 -16 -10 L-17.5 -4.5 Q-21 -3 -24.5 -5 Z',
    shine:
      'M-12 -28 Q4 -36 21 -29 L18 -25 L13 -28 L10 -23.5 L5 -28.5 L0 -24.5 L-4 -28.5 L-8.5 -24 Z',
  },
  curly: {
    back: 'M-24 -10 C-33 -8 -33 4 -27 6 C-31 12 -24 18 -19 14 L-14 8 Z',
    front:
      'M-24.5 -5 C-31 -6 -32 -16 -26 -19 C-31 -28 -22 -36 -14 -33 C-10 -41 2 -42 6 -36 C14 -41 26 -36 25 -28 C32 -26 33 -16 28.5 -12 C30 -7 27 -3 23.5 -5 C23 -9 20 -11 17.5 -9.5 C17 -4 11 -2 9.5 -6.5 C8 -10 4 -10.5 2.5 -8 C1 -3 -4 -3.5 -5 -8 C-7 -6 -11 2 -13 7 C-15 2 -15 -2 -17.5 -4.5 Q-21 -3 -24.5 -5 Z',
    crown:
      'M-17.5 -4.5 Q-21 -3 -24.5 -5 C-31 -6 -32 -16 -26 -19 C-31 -28 -22 -36 -14 -33 C-10 -41 2 -42 6 -36 C14 -41 26 -36 25 -28 C32 -26 33 -16 28.5 -12 C30 -7 27 -3 23.5 -5',
    shade:
      'M-24.5 -5 C-31 -6 -32 -16 -26 -19 C-31 -28 -22 -36 -14 -33 C-18 -26 -17 -16 -16 -10 L-17.5 -4.5 Q-21 -3 -24.5 -5 Z',
    shine:
      'M-8 -31 C-4 -36 4 -36 7 -32 C3 -33 -1 -32.5 -3.5 -30 C-5 -31 -6.5 -31 -8 -31 Z M12 -33 C16 -35 21 -33 22.5 -29 C19 -31 16 -31 14 -30.5 Z',
  },
};
