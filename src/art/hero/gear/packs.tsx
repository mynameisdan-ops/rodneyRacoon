import { ink, shade, tint } from '../../style';
import { type Item, OUT, IN, BRASS } from './kit';

/** A pack on his back: in his three-quarter view it shows past the left edge of his tunic. */
export function Pack({ item }: { item: Item<'pack'> }) {
  const { color: c, accent: a } = item;
  switch (item.art) {
    case 'backpack':
      return (
        <g className="gear-pack">
          <rect x={24} y={57} width={20} height={33} rx={7} fill={c} {...ink(OUT)} />
          <path d="M26.5 62 Q24.5 74 26 86 L30.5 88.5 Q28 75 30 62 Z" fill={shade(c, 0.3)} />
          <path
            d="M24 68 Q24 56 34 56 Q44 56 44 68 Q34 65.5 24 68 Z"
            fill={shade(c, 0.15)}
            {...ink(IN)}
          />
          <rect x={26.5} y={74} width={13} height={11} rx={3.5} fill={a} {...ink(IN)} />
          <path d="M27.5 77.5 H38.5" stroke={shade(a, 0.3)} strokeWidth={1.2} />
          <rect x={32} y={64.5} width={4} height={5} rx={1} fill={BRASS} {...ink(1)} />
        </g>
      );
    case 'map-tube':
      return (
        <g className="gear-pack" transform="translate(36 78) rotate(-26)">
          <path d="M-3.5 -36 Q-6 -46 0 -47 Q6 -46 3.5 -36 Z" fill={a} {...ink(IN)} />
          <rect x={-5.5} y={-37} width={11} height={62} rx={4.5} fill={c} {...ink(OUT)} />
          <rect x={-5.5} y={-35} width={4} height={58} rx={2} fill={shade(c, 0.3)} />
          <path d="M3 -30 V18" stroke={tint(c, 0.4)} strokeWidth={1.6} strokeLinecap="round" />
          <rect x={-6.5} y={-38} width={13} height={6.5} rx={2} fill={shade(c, 0.4)} {...ink(IN)} />
          <rect x={-6.5} y={18} width={13} height={6.5} rx={2} fill={shade(c, 0.4)} {...ink(IN)} />
        </g>
      );
    case 'bedroll':
      return (
        <g className="gear-pack">
          <rect x={23} y={59} width={20} height={31} rx={7} fill={c} {...ink(OUT)} />
          <path d="M25.5 64 Q23.5 75 25 86 L29.5 88.5 Q27 76 29 64 Z" fill={shade(c, 0.3)} />
          <rect x={26} y={74} width={13} height={11} rx={3.5} fill={shade(c, 0.15)} {...ink(IN)} />
          {/* The rolled blanket on top, seen end on. */}
          <rect x={18} y={47} width={30} height={12.5} rx={6} fill={a} {...ink(OUT)} />
          <path d="M21 51.5 H46" stroke={shade(a, 0.3)} strokeWidth={2} />
          <path d="M23 56 H45" stroke={tint(a, 0.35)} strokeWidth={1.4} strokeLinecap="round" />
          <ellipse cx={19.5} cy={53.2} rx={3.8} ry={6} fill={tint(a, 0.3)} {...ink(IN)} />
          <path
            d="M19.5 50 Q17.8 53.2 19.5 56.5"
            fill="none"
            stroke={shade(a, 0.3)}
            strokeWidth={1}
          />
          <path d="M27 46.5 V60 M39 46.5 V60" stroke="#6b4226" strokeWidth={2.4} />
        </g>
      );
    case 'rocket':
      return (
        <g className="gear-pack">
          <g className="gear-flame">
            <path d="M22 92 Q26 106 28 113 Q30 106 34 92 Z" fill="#ffb02e" />
            <path d="M25 92 Q27 101 28 106 Q29 101 31 92 Z" fill="#ffe36b" />
            <path d="M33 92 Q37 104 39 110 Q41 104 44 92 Z" fill="#ffb02e" />
            <path d="M36 92 Q38 99 39 103 Q40 99 41.5 92 Z" fill="#ffe36b" />
          </g>
          <rect x={21} y={61} width={12} height={31} rx={5.5} fill={c} {...ink(OUT)} />
          <rect x={32} y={63} width={12} height={29} rx={5.5} fill={c} {...ink(OUT)} />
          <rect x={21.5} y={63} width={4} height={27} rx={2} fill={shade(c, 0.3)} />
          <path
            d="M29.5 66 V86 M40.5 68 V86"
            stroke={tint(c, 0.45)}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <path d="M21 66 Q27 50 33 66 Z" fill={a} {...ink(IN + 0.3)} />
          <path d="M32 68 Q38 53 44 68 Z" fill={a} {...ink(IN + 0.3)} />
          <rect x={20} y={88} width={14} height={5.5} rx={2} fill={shade(c, 0.4)} {...ink(IN)} />
          <rect x={31} y={88} width={14} height={5.5} rx={2} fill={shade(c, 0.4)} {...ink(IN)} />
        </g>
      );
  }
}
