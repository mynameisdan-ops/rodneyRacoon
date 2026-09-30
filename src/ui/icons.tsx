import { INK } from '../art/style';

/**
 * Small icons for the reward screens, drawn in the art style (ink outline, flat shading).
 * They carry the meaning, so the screens work for a child who can't read the labels yet.
 */

interface IconProps {
  size?: number;
}

const stroke = {
  stroke: INK,
  strokeWidth: 3,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
} as const;

export function Coin({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="icon-coin">
      <circle cx={20} cy={21} r={16} fill="#c98a00" {...stroke} />
      <circle cx={20} cy={19} r={16} fill="#ffc53d" {...stroke} />
      <circle cx={20} cy={19} r={10.5} fill="none" stroke="#e0a21a" strokeWidth={2.5} />
      <path
        d="M20 11.5 L22.2 16.3 L27.3 16.8 L23.5 20.2 L24.6 25.3 L20 22.7 L15.4 25.3 L16.5 20.2 L12.7 16.8 L17.8 16.3 Z"
        fill="#fff3a0"
      />
    </svg>
  );
}

export function CheckIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <circle cx={20} cy={20} r={16} fill="#2a9d5c" {...stroke} />
      <path
        d="M12 20.5 L18 26 L28 14"
        fill="none"
        stroke="#fff"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A lightning bolt: answers in a row. */
export function BoltIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <path d="M23 3 L9 23 H19 L15 37 L31 15 H21 Z" fill="#ffb02e" {...stroke} />
      <path d="M21 8 L13 21 H17 Z" fill="#ffe36b" />
    </svg>
  );
}

/** The sun is the page timer, so it stands for time left. */
export function SunIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <g stroke="#e8743b" strokeWidth={3.5} strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path key={a} d="M20 2.5 V7.5" transform={`rotate(${a} 20 20)`} />
        ))}
      </g>
      <circle cx={20} cy={20} r={10} fill="#ffc53d" {...stroke} />
    </svg>
  );
}

/** A flag: the first time a level is passed. */
export function FlagIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <path d="M10 36 V5" {...stroke} strokeWidth={4} />
      <path
        d="M11 6 Q20 2 26 7 Q31 11 36 8 V24 Q30 27 25 23 Q19 19 11 22 Z"
        fill="#e63946"
        {...stroke}
      />
    </svg>
  );
}

export function StarIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <path
        d="M20 3 L24.9 13.6 L36.4 14.8 L27.8 22.6 L30.2 34 L20 28.2 L9.8 34 L12.2 22.6 L3.6 14.8 L15.1 13.6 Z"
        fill="#ffc53d"
        {...stroke}
      />
    </svg>
  );
}

/** A shop bag. */
export function BagIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path d="M17 16 V12 a7 7 0 0 1 14 0 V16" fill="none" {...stroke} strokeWidth={3.5} />
      <path d="M8 16 H40 L37 43 H11 Z" fill="#e8743b" {...stroke} />
      <path d="M8 16 H14 L14 43 H11 Z" fill="#b8552a" />
      <circle cx={24} cy={29} r={6} fill="#ffc53d" {...stroke} strokeWidth={2.5} />
    </svg>
  );
}

/** An open sticker book. */
export function BookIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path
        d="M24 12 Q14 6 4 9 V39 Q14 36 24 42 Q34 36 44 39 V9 Q34 6 24 12 Z"
        fill="#3a86ff"
        {...stroke}
      />
      <path d="M24 12 Q16 8 8 10 V36 Q16 34 24 38 Z" fill="#fff8e8" {...stroke} strokeWidth={2.5} />
      <path
        d="M24 12 Q32 8 40 10 V36 Q32 34 24 38 Z"
        fill="#fff8e8"
        {...stroke}
        strokeWidth={2.5}
      />
      <rect x={11} y={15} width={9} height={8} rx={2} fill="#2a9d5c" transform="rotate(-6 15 19)" />
      <circle cx={33} cy={21} r={4.5} fill="#ffc53d" />
      <rect x={12} y={26} width={8} height={6} rx={2} fill="#e63946" transform="rotate(5 16 29)" />
    </svg>
  );
}
