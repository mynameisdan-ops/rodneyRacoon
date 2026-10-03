import { ink, shade, tint } from '../../style';
import { type Item, LW } from './kit';

/** A pet trots (or flies) just ahead of the hero's front boot. */
export function Pet({ item }: { item: Item<'pet'> }) {
  const { color: c, accent: a } = item;
  const flies = item.art === 'owl' || item.art === 'dragon';
  return (
    <g
      className={flies ? 'hero-pet hero-pet--fly' : 'hero-pet'}
      transform="translate(96 164) scale(1.15) translate(-96 -164)"
    >
      <ellipse cx={96} cy={164} rx={flies ? 9 : 14} ry={2.6} fill="rgba(0,0,0,0.18)" />
      <g className="hero-pet__body">
        <PetBody art={item.art} c={c} a={a} />
      </g>
    </g>
  );
}

function Eye({ x, y, r = 1.8 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} fill="#1d2433" />
      <circle cx={x + r * 0.35} cy={y - r * 0.4} r={r * 0.35} fill="#fff" />
    </>
  );
}

/** Four short legs for a walking animal, front pair at x 101/105 and back pair at 86/90. */
function Legs({ c }: { c: string }) {
  return (
    <g {...ink(1.4)}>
      <rect
        className="pet-leg pet-leg--b"
        x={85}
        y={152}
        width={4.4}
        height={11}
        rx={2}
        fill={shade(c, 0.3)}
      />
      <rect
        className="pet-leg pet-leg--f"
        x={100}
        y={152}
        width={4.4}
        height={11}
        rx={2}
        fill={shade(c, 0.3)}
      />
      <rect className="pet-leg pet-leg--f" x={89} y={152} width={4.4} height={11} rx={2} fill={c} />
      <rect
        className="pet-leg pet-leg--b"
        x={104}
        y={152}
        width={4.4}
        height={11}
        rx={2}
        fill={c}
      />
    </g>
  );
}

function PetBody({ art, c, a }: { art: Item<'pet'>['art']; c: string; a: string }) {
  switch (art) {
    case 'puppy':
      return (
        <>
          <path
            className="pet-tail"
            d="M84 148 Q76 140 79 132 Q83 140 88 144 Z"
            fill={c}
            {...ink(1.6)}
          />
          <Legs c={c} />
          <ellipse cx={95} cy={149} rx={13} ry={8} fill={c} {...ink(LW)} />
          <ellipse cx={97} cy={152} rx={8} ry={4} fill={a} />
          <circle cx={107} cy={138} r={8.5} fill={c} {...ink(LW)} />
          <ellipse cx={113} cy={141} rx={5} ry={3.8} fill={a} {...ink(1.4)} />
          <circle cx={117.5} cy={139.5} r={1.8} fill="#1d2433" />
          <Eye x={109} y={135} />
          <path
            d="M101 131 Q96 134 98 145 Q103 143 104 134 Z"
            fill={shade(c, 0.35)}
            {...ink(1.5)}
          />
          <path d="M90 144 H100" stroke="#e63946" strokeWidth={2.4} strokeLinecap="round" />
        </>
      );
    case 'kitten':
      return (
        <>
          <path
            className="pet-tail"
            d="M84 150 Q74 146 76 132 Q78 124 83 126 Q79 134 82 142 Q85 146 87 146 Z"
            fill={c}
            {...ink(1.6)}
          />
          <Legs c={c} />
          <ellipse cx={95} cy={149} rx={12} ry={7.5} fill={c} {...ink(LW)} />
          <path
            d="M92 143 Q93 147 91 152 M97 142 Q98 147 96 153"
            fill="none"
            stroke={shade(c, 0.35)}
            strokeWidth={1.8}
          />
          <path d="M101 132 L102 122 L107 129 Z" fill={c} {...ink(1.5)} />
          <path d="M110 129 L114 121 L115 132 Z" fill={c} {...ink(1.5)} />
          <circle cx={108} cy={137} r={8} fill={c} {...ink(LW)} />
          <ellipse cx={112} cy={141} rx={4.2} ry={3} fill={a} />
          <path d="M115 140 L117 139" stroke="#e98aa0" strokeWidth={2.2} strokeLinecap="round" />
          <Eye x={111} y={135} />
          <path d="M114 142 L121 141 M114 143.5 L120.5 145" stroke="#1d2433" strokeWidth={0.7} />
        </>
      );
    case 'fox':
      return (
        <>
          <path
            className="pet-tail"
            d="M85 147 Q70 150 68 138 Q70 130 78 133 Q82 140 88 142 Z"
            fill={c}
            {...ink(1.6)}
          />
          <path d="M70 140 Q68 134 72 131 Q72 137 76 139 Z" fill={a} />
          <Legs c="#3b2a20" />
          <ellipse cx={95} cy={149} rx={13} ry={7.5} fill={c} {...ink(LW)} />
          <path d="M99 146 Q104 150 103 155 Q97 155 96 150 Z" fill={a} />
          <path d="M101 131 L100 119 L108 127 Z" fill={c} {...ink(1.5)} />
          <path d="M109 128 L113 118 L115 131 Z" fill={c} {...ink(1.5)} />
          <path
            d="M100 138 Q101 128 108 128 Q114 129 116 136 L122 141 Q116 145 108 145 Q101 144 100 138 Z"
            fill={c}
            {...ink(LW)}
          />
          <path d="M107 142 Q114 141 121 141 Q116 145 108 145 Z" fill={a} />
          <circle cx={122} cy={140.5} r={1.8} fill="#1d2433" />
          <Eye x={111} y={134.5} />
        </>
      );
    case 'raccoon':
      return (
        <>
          <g className="pet-tail">
            <path
              d="M84 148 Q72 148 70 136 Q72 130 78 133 Q81 142 88 144 Z"
              fill={c}
              {...ink(1.6)}
            />
            <path d="M71 140 L77 137 M73 146 L80 141 M78 148 L84 144" stroke={a} strokeWidth={3} />
          </g>
          <Legs c={a} />
          <ellipse cx={95} cy={149} rx={13} ry={8} fill={c} {...ink(LW)} />
          <ellipse cx={97} cy={152} rx={8} ry={4} fill={tint(c, 0.4)} />
          <path d="M101 132 L101 123 L107 128 Z" fill={c} {...ink(1.5)} />
          <path d="M109 128 L112 120 L114 131 Z" fill={c} {...ink(1.5)} />
          <circle cx={108} cy={137} r={8.5} fill={c} {...ink(LW)} />
          <ellipse cx={114} cy={141} rx={5} ry={3.2} fill="#f4ead2" {...ink(1.3)} />
          <path d="M103 133 Q110 130 116 134 Q114 139 110 137 Q106 139 103 133 Z" fill={a} />
          <circle cx={110.5} cy={134.6} r={1.5} fill="#fff" />
          <circle cx={118.5} cy={140} r={1.7} fill="#1d2433" />
        </>
      );
    case 'owl':
      return (
        <>
          <path
            className="pet-wing pet-wing--back"
            d="M92 116 Q80 106 76 114 Q80 122 92 124 Z"
            fill={shade(c, 0.3)}
            {...ink(1.5)}
          />
          <path d="M89 106 L88 97 L94 102 Z M101 102 L106 96 L106 106 Z" fill={c} {...ink(1.4)} />
          <ellipse cx={97} cy={116} rx={11} ry={13} fill={c} {...ink(LW)} />
          <ellipse cx={98} cy={121} rx={6.5} ry={7} fill={a} />
          <path
            d="M95 118 L97 120 L99 118 M95 123 L97 125 L99 123"
            fill="none"
            stroke={shade(a, 0.35)}
            strokeWidth={1}
          />
          <circle cx={94} cy={109} r={4.2} fill="#fff8e8" {...ink(1.3)} />
          <circle cx={103} cy={109} r={4.2} fill="#fff8e8" {...ink(1.3)} />
          <Eye x={95} y={109} r={2.1} />
          <Eye x={104} y={109} r={2.1} />
          <path d="M98.5 112 L101 115 L98.5 116 Z" fill="#f2a93b" {...ink(1)} />
          <path
            className="pet-wing"
            d="M97 114 Q108 104 114 110 Q110 120 98 124 Z"
            fill={shade(c, 0.1)}
            {...ink(1.5)}
          />
          <path
            d="M93 128 L92 132 M101 128 L102 132"
            stroke="#f2a93b"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      );
    case 'dragon':
      return (
        <>
          <path
            className="pet-wing pet-wing--back"
            d="M94 112 Q86 96 76 102 Q82 106 80 112 Q86 110 94 118 Z"
            fill={shade(c, 0.35)}
            {...ink(1.5)}
          />
          <path
            className="pet-tail"
            d="M88 124 Q78 130 72 124 Q70 120 66 122 L70 116 L74 120 Q80 124 88 118 Z"
            fill={c}
            {...ink(1.5)}
          />
          <ellipse cx={95} cy={120} rx={11} ry={9} fill={c} {...ink(LW)} />
          <ellipse cx={97} cy={123} rx={6.5} ry={5} fill={a} />
          <path
            d="M93 128 L92 133 M100 128 L101 133"
            stroke={shade(c, 0.3)}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <path d="M104 106 L103 99 L108 104 Z" fill={a} {...ink(1.2)} />
          <path
            d="M101 112 Q101 102 110 102 Q118 103 120 110 Q119 116 111 116 Q104 117 101 112 Z"
            fill={c}
            {...ink(LW)}
          />
          <circle cx={117} cy={108.5} r={0.9} fill="#1d2433" />
          <Eye x={109} y={107.5} />
          <path
            className="pet-wing"
            d="M96 114 Q100 98 112 96 Q108 102 110 106 Q104 106 100 118 Z"
            fill={tint(c, 0.15)}
            {...ink(1.5)}
          />
        </>
      );
  }
}
