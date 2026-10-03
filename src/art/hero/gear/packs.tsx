import { ink, shade, tint } from '../../style';
import { type Item, LW } from './kit';

export function Pack({ item }: { item: Item<'pack'> }) {
  const { color: c, accent: a } = item;
  switch (item.art) {
    case 'backpack':
      return (
        <g className="gear-pack">
          <rect x={24} y={60} width={18} height={30} rx={6} fill={c} {...ink(LW)} />
          <path d="M26 64 Q24 72 25 86 L29 88 Q27 74 29 64 Z" fill={shade(c, 0.3)} />
          <path d="M24 70 Q24 59 33 59 Q42 59 42 70 Z" fill={shade(c, 0.15)} {...ink(1.6)} />
          <rect x={26.5} y={76} width={12} height={10} rx={3} fill={a} {...ink(1.4)} />
          <circle cx={33} cy={70} r={1.6} fill="#e0b458" {...ink(1)} />
        </g>
      );
    case 'map-tube':
      return (
        <g className="gear-pack" transform="translate(34 76) rotate(22)">
          <path d="M-3.5 -34 Q-6 -44 0 -45 Q6 -44 3.5 -34 Z" fill={a} {...ink(1.4)} />
          <rect x={-5} y={-35} width={10} height={58} rx={4} fill={c} {...ink(LW)} />
          <rect x={-5} y={-35} width={4} height={58} rx={2} fill={shade(c, 0.3)} />
          <rect x={-6} y={-36} width={12} height={6} rx={2} fill={shade(c, 0.4)} {...ink(1.4)} />
          <rect x={-6} y={17} width={12} height={6} rx={2} fill={shade(c, 0.4)} {...ink(1.4)} />
        </g>
      );
    case 'bedroll':
      return (
        <g className="gear-pack">
          <rect x={23} y={62} width={19} height={29} rx={6} fill={c} {...ink(LW)} />
          <path d="M25 66 Q23 74 24 87 L28 89 Q26 75 28 66 Z" fill={shade(c, 0.3)} />
          <rect x={26} y={76} width={12} height={10} rx={3} fill={shade(c, 0.15)} {...ink(1.4)} />
          {/* The rolled blanket on top, seen end on. */}
          <rect x={18} y={52} width={27} height={11} rx={5.5} fill={a} {...ink(LW)} />
          <path d="M20 56 H43" stroke={shade(a, 0.3)} strokeWidth={2} />
          <ellipse cx={19.5} cy={57.5} rx={3.5} ry={5.5} fill={tint(a, 0.3)} {...ink(1.4)} />
          <path d="M26 51.5 V63.5 M37 51.5 V63.5" stroke="#6b4226" strokeWidth={2.2} />
        </g>
      );
    case 'rocket':
      return (
        <g className="gear-pack">
          <g className="gear-flame">
            <path d="M24 92 Q27 104 29 110 Q31 104 34 92 Z" fill="#ffb02e" />
            <path d="M26 92 Q28 100 29 104 Q30 100 32 92 Z" fill="#ffe36b" />
            <path d="M34 92 Q37 102 39 107 Q41 102 43 92 Z" fill="#ffb02e" />
          </g>
          <rect x={22} y={62} width={11} height={30} rx={5} fill={c} {...ink(LW)} />
          <rect x={32} y={64} width={11} height={28} rx={5} fill={c} {...ink(LW)} />
          <rect x={22} y={62} width={4} height={30} rx={2} fill={shade(c, 0.3)} />
          <path d="M22 66 Q27.5 52 33 66 Z" fill={a} {...ink(1.6)} />
          <path d="M32 68 Q37.5 55 43 68 Z" fill={a} {...ink(1.6)} />
          <rect x={21} y={88} width={13} height={5} rx={2} fill={shade(c, 0.4)} {...ink(1.3)} />
          <rect x={31} y={88} width={13} height={5} rx={2} fill={shade(c, 0.4)} {...ink(1.3)} />
        </g>
      );
  }
}
