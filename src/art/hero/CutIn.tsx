import { useId } from 'react';
import { wornItem } from '../../content/shop';
import { noise } from '../obstacles/sceneKit';
import { INK, shade, tint } from '../style';
import type { AvatarConfig } from './avatar';
import { BODY } from './body';
import type { Expression } from './expressions';
import { Head } from './Hero';

/*
 * The anime cut-in (M7b): just before the big move, a slanted panel slams across the screen with
 * a close-up of his face over a burst of light, holds a beat, and whips away. Pure in `dt`.
 */

const ENTER = 140;
const EXIT = 170;
/**
 * Where it plays: the full scene, or the page strip at the top of a page (the combo cut-in).
 * `band` is the panel (a band across, higher on the right), `face` where the middle of his skull
 * sits in it and how big, and `burst` the center of the light behind him.
 */
const LAYOUTS = {
  scene: {
    w: 1280,
    h: 800,
    band: 'M-60 252 L1340 148 L1340 548 L-60 652 Z',
    face: { x: 790, y: 404, scale: 5.4 },
    burst: { x: 860, y: 380 },
    line: 12,
  },
  strip: {
    w: 1280,
    h: 240,
    band: 'M-60 40 L1340 10 L1340 214 L-60 244 Z',
    face: { x: 720, y: 140, scale: 2.5 },
    burst: { x: 760, y: 120 },
    line: 7,
  },
} as const;

const easeOut = (p: number) => 1 - (1 - p) ** 3;
const easeIn = (p: number) => p * p * p;

export function CutIn({
  dt,
  ms,
  expr,
  avatar,
  layout = 'scene',
}: {
  dt: number;
  ms: number;
  expr: Expression;
  avatar: AvatarConfig;
  layout?: keyof typeof LAYOUTS;
}) {
  const id = useId();
  const { w: W, h: H, band: BAND, face: FACE, burst: BURST, line } = LAYOUTS[layout];
  if (!(dt >= 0 && dt < ms)) return null;
  const slide =
    dt < ENTER
      ? (1 - easeOut(dt / ENTER)) * 1500
      : dt > ms - EXIT
        ? -easeIn((dt - (ms - EXIT)) / EXIT) * 1500
        : 0;
  // A slow push on his face while it holds.
  const push = 1 + 0.06 * Math.min(1, dt / ms);
  const spin = dt * 0.004;
  const lines = Array.from({ length: 30 }, (_, i) => {
    const a = (i / 30) * Math.PI * 2 + spin + noise(i, 2) * 0.1;
    const w = 0.025 + 0.03 * noise(i, 5);
    const r0 = 150 + 60 * noise(i, 8);
    const r1 = 1600;
    return `M${BURST.x + Math.cos(a) * r0} ${BURST.y + Math.sin(a) * r0} L${BURST.x + Math.cos(a - w) * r1} ${BURST.y + Math.sin(a - w) * r1} L${BURST.x + Math.cos(a + w) * r1} ${BURST.y + Math.sin(a + w) * r1} Z`;
  }).join('');
  const sweep = ((dt - ENTER) / (ms - ENTER - EXIT)) * 1800 - 300;
  return (
    <svg className="cutin" viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <clipPath id={`${id}band`}>
          <path d={BAND} />
        </clipPath>
        <radialGradient
          id={`${id}burst`}
          cx={BURST.x}
          cy={BURST.y}
          r={760}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fff6c0" />
          <stop offset="0.35" stopColor="#ffc24a" />
          <stop offset="1" stopColor="#e2493a" />
        </radialGradient>
      </defs>
      <g transform={`translate(${slide} 0)`}>
        <g clipPath={`url(#${id}band)`}>
          <rect x={-100} y={0} width={1500} height={H} fill={`url(#${id}burst)`} />
          <path d={lines} fill="#fffbe6" opacity={0.75} />
          <g
            transform={`translate(${FACE.x} ${FACE.y}) scale(${FACE.scale * push}) translate(0 -4)`}
          >
            <Shoulders avatar={avatar} />
            <Head
              skin={avatar.skin}
              hairColor={avatar.hairColor}
              hairStyle={avatar.hairStyle}
              expr={expr}
              s={BODY.head.s}
              weight={0.36}
              wind={0.5}
              hat={wornItem(avatar.gear, 'hat')}
            />
          </g>
          {sweep > -300 && sweep < 1500 && (
            <path
              d={`M${sweep} 0 L${sweep + 90} 0 L${sweep - 110} ${H} L${sweep - 200} ${H} Z`}
              fill="#fff"
              opacity={0.28}
            />
          )}
        </g>
        <path d={BAND} fill="none" stroke={INK} strokeWidth={line} />
        <path
          d={BAND}
          transform="translate(0 -14)"
          fill="none"
          stroke="#fff"
          strokeWidth={4}
          opacity={0.8}
          clipPath={`url(#${id}band)`}
        />
      </g>
      {dt < 90 && <rect width={W} height={H} fill="#fffdf0" opacity={0.55 * (1 - dt / 90)} />}
    </svg>
  );
}

/** His neck and the top of his tunic under the close-up (head-local units). */
function Shoulders({ avatar }: { avatar: AvatarConfig }) {
  const { skin, shirt } = avatar;
  return (
    <g>
      <rect
        x={-9}
        y={16}
        width={15}
        height={26}
        rx={5}
        fill={shade(skin, 0.22)}
        stroke={INK}
        strokeWidth={1.4}
      />
      <path
        d="M-46 70 Q-40 40 -12 34 L4 48 L16 34 Q40 38 48 70 Z"
        fill={shirt}
        stroke={INK}
        strokeWidth={1.4}
      />
      <path d="M-46 70 Q-40 40 -12 34 L-6 40 Q-28 46 -30 70 Z" fill={shade(shirt, 0.3)} />
      <path d="M-12 34 L4 48 L16 34 L10 32 L4 40 L-6 32 Z" fill={shade(shirt, 0.45)} />
      <path d="M30 44 Q40 52 44 66" fill="none" stroke={tint(shirt, 0.5)} strokeWidth={1.2} />
    </g>
  );
}
