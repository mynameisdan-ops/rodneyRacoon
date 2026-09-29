import type { HairStyle } from '../../content/avatar';
import { ink, mix, shade, tint } from '../style';
import type { AvatarConfig } from './avatar';
import type { HeroPose } from './poses';
import './hero.css';

export type { HeroPose };

interface Props {
  avatar: AvatarConfig;
  pose?: HeroPose;
  facing?: 'left' | 'right';
  /** Rendered height in px (width follows the 100:170 aspect ratio). */
  size?: number;
  /** Draw the ground shadow under the feet (off when a scene draws its own). */
  shadow?: boolean;
  className?: string;
}

const VIEW_W = 100;
const VIEW_H = 170;
/** Outline width in view units (about 2.5px at cut-scene size). */
const LW = 2.1;
const LEATHER = '#6b4226';
const BRASS = '#e0b458';

/**
 * The hero: a young adventurer in a tunic, cape, belt, satchel and boots, drawn as
 * a cel-shaded paper doll facing right with his feet at (52, 163). Arms and legs
 * are two segments (shoulder/elbow, hip/knee), each drawn hanging down from its
 * joint, so poses are just rotations (see hero.css). The back limbs use darker
 * colors instead of a CSS filter, which is slow on tablets.
 */
export function Hero({
  avatar,
  pose = 'idle',
  facing = 'right',
  size = 120,
  shadow = true,
  className,
}: Props) {
  const { skin, shirt, pants, shoes, hairColor, hairStyle } = avatar;
  const cape = mix(shade(shirt, 0.45), '#2a1f4a', 0.35);
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
          fill="rgba(0,0,0,0.22)"
        />
      )}
      <g className="hero-body">
        {/* Cape, hanging from the shoulders behind everything. */}
        <g className="hero-cape">
          <path
            d="M52 56 Q40 58 35 78 Q31 96 25 116 Q34 112 38 116 Q42 110 47 112 Q46 84 56 60 Z"
            fill={cape}
            {...ink(LW)}
          />
          <path d="M44 62 Q38 80 33 106 L38 108 Q40 84 48 62 Z" fill={shade(cape, 0.3)} />
        </g>

        <g transform="translate(46 61)">
          <Arm side="back" sleeve={shade(shirt, 0.28)} skin={shade(skin, 0.25)} />
        </g>
        <g transform="translate(48 104)">
          <Leg side="back" pants={shade(pants, 0.28)} boots={shade(shoes, 0.25)} />
        </g>
        <g transform="translate(57 104)">
          <Leg side="front" pants={pants} boots={shoes} />
        </g>

        {/* Satchel on the back hip. */}
        <rect x={31} y={88} width={15} height={14} rx={3} fill={LEATHER} {...ink(LW)} />
        <path d="M31 92 H46" stroke={shade(LEATHER, 0.4)} strokeWidth={2} />

        {/* Neck and tunic. */}
        <rect x={50} y={45} width={9} height={14} rx={3} fill={shade(skin, 0.18)} {...ink(LW)} />
        <path
          d="M40 61 Q48 54 55 57 Q62 54 66 59 L68 92 Q71 102 73 111 Q63 108 55 112 Q46 108 36 111 Q38 101 38 92 Z"
          fill={shirt}
          {...ink(LW)}
        />
        <path
          d="M41 62 L39 92 Q39 102 37 110 Q42 108 47 110 Q44 96 46 62 Z"
          fill={shade(shirt, 0.3)}
        />
        <path d="M64 61 Q66 76 66.5 90" fill="none" stroke={tint(shirt, 0.45)} strokeWidth={2.2} />
        <path d="M51 57 L55 66 L60 57" fill="none" {...ink(1.6)} />

        {/* Belt and the satchel strap across the chest. */}
        <path d="M60 58 L42 91" stroke={LEATHER} strokeWidth={4.5} strokeLinecap="round" />
        <path d="M60 58 L42 91" stroke={shade(LEATHER, 0.35)} strokeWidth={1.2} />
        <rect x={37} y={89} width={32} height={7} rx={2} fill={LEATHER} {...ink(LW)} />
        <rect x={56} y={88} width={7} height={9} rx={1.5} fill={BRASS} {...ink(1.4)} />

        <g className="hero-head">
          <Head skin={skin} hairColor={hairColor} hairStyle={hairStyle} />
        </g>

        <g transform="translate(62 61)">
          <Arm side="front" sleeve={shirt} skin={skin} />
        </g>
      </g>
    </svg>
  );
}

function Head({
  skin,
  hairColor,
  hairStyle,
}: {
  skin: string;
  hairColor: string;
  hairStyle: HairStyle;
}) {
  return (
    <>
      <path
        d="M38 32 Q37 13 55 12 Q73 12 73.5 30 Q74.5 38 72 44 Q69 50 60 50.5 Q44 51 39 40 Z"
        fill={skin}
        {...ink(LW)}
      />
      {/* Shadow on the back of the head (the light comes from ahead of him). */}
      <path d="M40 28 Q39 44 50 49 Q42 50 39 40 Q37 33 40 28 Z" fill={shade(skin, 0.28)} />
      <circle cx={45} cy={34} r={4.4} fill={shade(skin, 0.12)} {...ink(1.6)} />
      <circle cx={65} cy={40} r={3} fill="#ff7a6b" opacity={0.3} />
      <g className="hero-eyes">
        <ellipse cx={59.5} cy={31} rx={3.7} ry={4.7} fill="#fff" {...ink(1.4)} />
        <ellipse cx={68.8} cy={31} rx={3.1} ry={4.4} fill="#fff" {...ink(1.4)} />
        <circle cx={60.9} cy={31.7} r={2.6} fill="#1d2433" />
        <circle cx={69.9} cy={31.7} r={2.3} fill="#1d2433" />
        <circle cx={61.7} cy={30.5} r={0.9} fill="#fff" />
        <circle cx={70.6} cy={30.5} r={0.8} fill="#fff" />
        {/* Upper lids give the eyes a clear, determined shape. */}
        <path
          d="M55.6 29 Q59.5 25.6 63.3 28.4 M65.8 28.6 Q68.8 25.8 71.9 28.6"
          fill="none"
          {...ink(1.7)}
        />
      </g>
      {/* The nose, standing out from the face in profile. */}
      <path d="M71.6 32 Q79.5 38.2 74 41.2 Q72 41.9 70.6 40.4" fill={skin} {...ink(1.6)} />
      <path
        d="M72.4 39.6 Q73.6 40 74.4 39.2"
        fill="none"
        stroke={shade(skin, 0.45)}
        strokeWidth={1.2}
      />
      <path
        className="hero-mouth"
        d="M61.5 44.5 Q66 47 70.5 43.8"
        fill="none"
        stroke="#5a1f24"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Hair style={hairStyle} color={hairColor} />
      {/* Determined brows. */}
      <path
        d="M56.5 25.5 L63 26.8 M67 26.6 L72.5 25.2"
        fill="none"
        stroke={shade(hairColor, 0.3)}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </>
  );
}

/** An arm hanging from the shoulder at (0, 0), elbow at (0, 23). */
function Arm({ side, sleeve, skin }: { side: 'front' | 'back'; sleeve: string; skin: string }) {
  return (
    <g className={`hero-arm hero-arm--${side}`}>
      <g transform="translate(0 23)">
        <g className={`hero-fore hero-fore--${side}`}>
          <rect x={-3.6} y={-2} width={7.2} height={20} rx={3.6} fill={skin} {...ink(LW)} />
          <rect x={-4.3} y={8} width={8.6} height={9} rx={2} fill={LEATHER} {...ink(1.6)} />
          <circle cx={0} cy={21} r={4.4} fill={skin} {...ink(LW)} />
        </g>
      </g>
      <rect x={-5} y={-4} width={10} height={29} rx={5} fill={sleeve} {...ink(LW)} />
      <path d="M-3.4 -1 V22" stroke={shade(sleeve, 0.3)} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

/** A leg hanging from the hip at (0, 0), knee at (0, 29), boot pointing right. */
function Leg({ side, pants, boots }: { side: 'front' | 'back'; pants: string; boots: string }) {
  return (
    <g className={`hero-leg hero-leg--${side}`}>
      <g transform="translate(0 29)">
        <g className={`hero-shin hero-shin--${side}`}>
          <rect x={-4.6} y={-3} width={9.2} height={14} rx={4} fill={pants} {...ink(LW)} />
          <path d="M-5.6 9 H5.6 V22 Q13 21.5 14.5 26 V30 H-5.6 Z" fill={boots} {...ink(LW)} />
          <path d="M-5.6 9 H5.6 V13 H-5.6 Z" fill={tint(boots, 0.25)} {...ink(1.4)} />
          <path d="M-5.6 28 H14.5" stroke={shade(boots, 0.45)} strokeWidth={2} />
        </g>
      </g>
      <rect x={-5.6} y={-4} width={11.2} height={34} rx={5.6} fill={pants} {...ink(LW)} />
      <path d="M-3.8 0 V26" stroke={shade(pants, 0.3)} strokeWidth={2.6} strokeLinecap="round" />
    </g>
  );
}

function Hair({ style, color }: { style: HairStyle; color: string }) {
  const dark = shade(color, 0.35);
  switch (style) {
    case 'short':
      return (
        <g>
          <path
            d="M37 36 Q31 9 56 8 Q76 9 75 26 Q71 20 65 21 Q61 25 56 21 Q51 25 46 22 Q43 27 44 35 Q41 31 37 36 Z"
            fill={color}
            {...ink(LW)}
          />
          <path d="M40 30 Q38 14 52 11 Q42 17 44 30 Z" fill={dark} />
        </g>
      );
    case 'spiky':
      return (
        <g>
          <path
            d="M37 36 L34 20 L41 21 L40 9 L49 15 L53 4 L60 13 L68 6 L69 16 L78 16 L75 26 Q70 20 64 22 Q58 24 53 21 Q48 25 45 23 Q43 28 44 35 Q41 31 37 36 Z"
            fill={color}
            {...ink(LW)}
          />
          <path d="M40 30 L38 21 L43 22 L43 13 L48 18 Q43 24 44 31 Z" fill={dark} />
        </g>
      );
    case 'curly':
      return (
        <g fill={color} {...ink(LW)}>
          <circle cx={40} cy={27} r={7} />
          <circle cx={45} cy={16} r={8} />
          <circle cx={56} cy={11} r={8.5} />
          <circle cx={67} cy={13} r={7.5} />
          <circle cx={74} cy={21} r={5.5} />
          <circle cx={39} cy={37} r={5} />
          <path d="M44 22 Q56 16 72 24 L72 18 Q56 6 42 18 Z" stroke="none" />
        </g>
      );
  }
}
