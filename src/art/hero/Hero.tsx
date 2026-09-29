import type { HairStyle } from '../../content/avatar';
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

/**
 * The hero, drawn as a layered paper doll facing right. Each limb is its own
 * group drawn hanging down from its joint, so poses are just rotations (see hero.css).
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
        <ellipse className="hero-shadow" cx={52} cy={164} rx={26} ry={5} fill="rgba(0,0,0,0.18)" />
      )}
      <g className="hero-body">
        <g transform="translate(40 84)">
          <Arm className="hero-arm hero-arm--back" shirt={shirt} skin={skin} />
        </g>
        <g transform="translate(46 116)">
          <Leg className="hero-leg hero-leg--back" pants={pants} shoes={shoes} />
        </g>
        <g transform="translate(58 116)">
          <Leg className="hero-leg hero-leg--front" pants={pants} shoes={shoes} />
        </g>

        {/* Torso */}
        <rect x={46} y={70} width={12} height={12} rx={4} fill={skin} />
        <path d="M34 80 Q52 72 70 80 L72 118 Q52 126 32 118 Z" fill={shirt} />
        <path d="M34 80 Q52 72 70 80 L70.6 88 Q52 81 33.6 88 Z" fill="rgba(255,255,255,0.18)" />
        <path d="M44 77 Q52 84 60 77" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={2.5} />

        <g className="hero-head">
          <circle cx={24} cy={50} r={7} fill={skin} />
          <circle cx={24} cy={50} r={3.5} fill="rgba(0,0,0,0.08)" />
          <circle cx={52} cy={46} r={32} fill={skin} />
          <circle cx={60} cy={61} r={5} fill="#ff8a8a" opacity={0.35} />
          <g className="hero-eyes">
            <ellipse cx={62} cy={46} rx={5.5} ry={6.5} fill="#fff" />
            <ellipse cx={78} cy={46} rx={5} ry={6.2} fill="#fff" />
            <circle cx={63.6} cy={47} r={3.3} fill="#1d2433" />
            <circle cx={79.4} cy={47} r={3.1} fill="#1d2433" />
            <circle cx={64.6} cy={45.6} r={1.1} fill="#fff" />
            <circle cx={80.3} cy={45.6} r={1} fill="#fff" />
          </g>
          <circle cx={83.5} cy={55} r={4.6} fill={skin} />
          <path
            d="M83 58.6 Q86.6 58.4 87.6 55.6"
            fill="none"
            stroke="rgba(0,0,0,0.16)"
            strokeWidth={1.6}
          />
          <path
            className="hero-mouth"
            d="M62 63 Q71 71 80 62"
            fill="none"
            stroke="#7a2e2e"
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <Hair style={hairStyle} color={hairColor} />
          <path
            d="M57 36 Q62 33 67 35 M73 35 Q78 33 83 36"
            fill="none"
            stroke={hairColor}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </g>

        <g transform="translate(64 84)">
          <Arm className="hero-arm hero-arm--front" shirt={shirt} skin={skin} />
        </g>
      </g>
    </svg>
  );
}

/** An arm hanging from the shoulder at (0, 0). */
function Arm({ className, shirt, skin }: { className: string; shirt: string; skin: string }) {
  return (
    <g className={className}>
      <rect x={-5} y={10} width={10} height={24} rx={5} fill={skin} />
      <rect x={-6.5} y={-4} width={13} height={20} rx={6.5} fill={shirt} />
      <circle cx={0} cy={35} r={6.5} fill={skin} />
    </g>
  );
}

/** A leg hanging from the hip at (0, 0), shoe pointing right. */
function Leg({ className, pants, shoes }: { className: string; pants: string; shoes: string }) {
  return (
    <g className={className}>
      <rect x={-6.5} y={-4} width={13} height={42} rx={6.5} fill={pants} />
      <path d="M-7 38 Q-8 48 2 48 L12 48 Q16 48 15 43 Q13 38 5 37 Z" fill={shoes} />
    </g>
  );
}

function Hair({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case 'short':
      return (
        <path
          d="M21 48 Q17 14 52 12 Q86 12 86 40 Q80 30 70 29 Q64 34 56 30 Q48 34 40 31 Q32 34 30 46 Q26 42 21 48 Z"
          fill={color}
        />
      );
    case 'spiky':
      return (
        <path
          d="M21 48 L20 28 L29 31 L31 14 L42 23 L50 7 L58 21 L70 10 L72 24 L86 22 L85 39 Q74 29 62 31 Q52 27 42 32 Q33 34 30 46 Q26 42 21 48 Z"
          fill={color}
        />
      );
    case 'curly':
      return (
        <g fill={color}>
          <circle cx={27} cy={34} r={10} />
          <circle cx={36} cy={21} r={12} />
          <circle cx={51} cy={15} r={12} />
          <circle cx={66} cy={17} r={12} />
          <circle cx={78} cy={26} r={10} />
          <circle cx={84} cy={36} r={6} />
          <circle cx={23} cy={45} r={7} />
        </g>
      );
  }
}
