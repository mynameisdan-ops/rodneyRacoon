import { useId } from 'react';
import { avatarForProfile } from './hero/avatar';
import { BODY } from './hero/body';
import { Shoulders } from './hero/CutIn';
import { Head } from './hero/Hero';
import { INK } from './style';

/**
 * The app's icon: the hero's determined close-up from his cut-in, over a burst of light, with a
 * "+×" badge. `round` is the home-screen icon (a rounded square with an ink rim, transparent
 * corners); `full` fills the square edge to edge with everything inside the middle 80%, for
 * Android's maskable icon and the Apple touch icon, which cut their own shape. Drawn to PNG by
 * `npm run icons` from the dev page `#icon-<shape>-<size>`.
 */
export function AppIcon({ size, shape }: { size: number; shape: 'round' | 'full' }) {
  const id = useId();
  const avatar = avatarForProfile({ color: '#2a9d5c' });
  const inner = shape === 'full' ? 0.8 : 1;
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const w = 0.09;
    const r = 520;
    return `M256 300 L${256 + Math.cos(a - w) * r} ${300 + Math.sin(a - w) * r} L${256 + Math.cos(a + w) * r} ${300 + Math.sin(a + w) * r} Z`;
  }).join('');

  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden>
      <defs>
        <radialGradient id={`${id}sky`} cx={256} cy={290} r={360} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff6c0" />
          <stop offset="0.45" stopColor="#ffc24a" />
          <stop offset="1" stopColor="#e2493a" />
        </radialGradient>
        <clipPath id={`${id}clip`}>
          {shape === 'round' ? (
            <rect width={512} height={512} rx={112} />
          ) : (
            <rect width={512} height={512} />
          )}
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}clip)`}>
        <rect width={512} height={512} fill={`url(#${id}sky)`} />
        <path d={rays} fill="#fffbe6" opacity={0.6} />
        <g transform={`translate(256 256) scale(${inner}) translate(-256 -256)`}>
          <g transform="translate(250 318) scale(4.3)">
            <Shoulders avatar={avatar} />
            <Head
              skin={avatar.skin}
              hairColor={avatar.hairColor}
              hairStyle={avatar.hairStyle}
              expr="determined"
              s={BODY.head.s}
              weight={0.36}
              wind={0.5}
            />
          </g>
          <g transform="translate(404 112) rotate(-8)">
            <circle r={78} fill="#2f7d4f" stroke={INK} strokeWidth={10} />
            <circle r={62} fill="none" stroke="#fff" strokeWidth={4} opacity={0.35} />
            <text
              y={30}
              textAnchor="middle"
              fontFamily="'Lilita One', sans-serif"
              fontSize={92}
              fill="#fff8e8"
              stroke={INK}
              strokeWidth={10}
              paintOrder="stroke"
            >
              +×
            </text>
          </g>
        </g>
      </g>
      {shape === 'round' && (
        <rect
          x={7}
          y={7}
          width={498}
          height={498}
          rx={106}
          fill="none"
          stroke={INK}
          strokeWidth={14}
        />
      )}
    </svg>
  );
}
