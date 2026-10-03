import { ink, shade, tint } from '../../style';
import { type Item, LW, STAR } from './kit';

export function Hat({ item }: { item: Item<'hat'> }) {
  const { color: c, accent: a } = item;
  switch (item.art) {
    case 'bandana':
      return (
        <g className="gear-hat">
          {/* Tails of the knot, flying out behind. */}
          <path
            d="M39 22 Q30 24 24 32 Q30 30 33 33 Q36 27 41 25 Z"
            fill={shade(c, 0.2)}
            {...ink(LW)}
          />
          <path d="M39 20 Q31 15 25 17 Q30 20 29 24 Q35 21 40 23 Z" fill={c} {...ink(LW)} />
          <path
            d="M37.5 27 Q38 7 56 6.5 Q74 7 75 25 Q66 20 56 20.5 Q45 21 37.5 27 Z"
            fill={c}
            {...ink(LW)}
          />
          <path d="M40 22 Q41 10 52 8 Q44 13 44 21 Z" fill={shade(c, 0.3)} />
          <g fill={a}>
            <circle cx={50} cy={13} r={1.6} />
            <circle cx={60} cy={11} r={1.6} />
            <circle cx={68} cy={15} r={1.6} />
            <circle cx={57} cy={17} r={1.4} />
            <circle cx={46} cy={18} r={1.4} />
          </g>
          <circle cx={39} cy={22} r={3.2} fill={c} {...ink(1.6)} />
        </g>
      );
    case 'explorer':
      return (
        <g className="gear-hat">
          <path d="M39 18 Q37 1 56 0 Q73 1 72.5 15 Q56 12 39 18 Z" fill={c} {...ink(LW)} />
          <path d="M42 16 Q41 4 52 2 Q46 8 47 15 Z" fill={shade(c, 0.25)} />
          <path d="M40 17 Q56 11 72.5 14 L72.5 18 Q56 15 40 21 Z" fill={a} {...ink(1.4)} />
          <path
            d="M26 22 Q55 11 86 17 Q88 22 81 23 Q56 18 31 27 Q24 27 26 22 Z"
            fill={tint(c, 0.15)}
            {...ink(LW)}
          />
          <path d="M31 26 Q56 17 81 22" fill="none" stroke={shade(c, 0.3)} strokeWidth={1.6} />
        </g>
      );
    case 'miner':
      return (
        <g className="gear-hat">
          {/* The lamp's beam: a flat see-through wedge (no filter). */}
          <path d="M78 8 L104 -2 L104 26 L78 15 Z" fill={a} opacity={0.35} />
          <path d="M36 22 Q35 2 56 1 Q77 2 76.5 19 Z" fill={c} {...ink(LW)} />
          <path d="M39 20 Q39 6 51 3 Q44 10 45 20 Z" fill={shade(c, 0.25)} />
          <path d="M55 2 Q57 10 56 19" fill="none" stroke={shade(c, 0.35)} strokeWidth={2.2} />
          <path d="M32 23 Q56 15 81 19 L81 23 Q56 20 32 27 Z" fill={shade(c, 0.1)} {...ink(LW)} />
          <rect x={69} y={5} width={9} height={11} rx={3} fill="#4a4a52" {...ink(1.6)} />
          <circle cx={77} cy={10.5} r={3.6} fill={a} {...ink(1.4)} />
        </g>
      );
    case 'wizard':
      return (
        <g className="gear-hat">
          <path
            d="M38 20 Q46 11 50 -4 Q52 -18 40 -26 Q60 -24 63 -6 Q66 7 74 19 Q56 15 38 20 Z"
            fill={c}
            {...ink(LW)}
          />
          <path
            d="M42 18 Q48 8 51 -6 Q53 -16 46 -22 Q56 -14 54 -2 Q52 10 48 17 Z"
            fill={shade(c, 0.3)}
          />
          <path
            d="M27 23 Q55 12 86 18 Q88 23 81 24 Q56 19 31 28 Q24 28 27 23 Z"
            fill={tint(c, 0.1)}
            {...ink(LW)}
          />
          <g fill={a}>
            <path d={STAR} transform="translate(59 4) scale(0.9)" />
            <path d={STAR} transform="translate(52 -10) scale(0.6)" />
            <path d={STAR} transform="translate(66 13) scale(0.55)" />
          </g>
          <circle cx={40} cy={-26} r={3} fill={a} {...ink(1.4)} />
        </g>
      );
    case 'viking':
      return (
        <g className="gear-hat">
          {/* Horns (drawn first so the helmet covers their roots). */}
          <path d="M42 14 Q30 12 27 -6 Q34 2 44 5 Z" fill={a} {...ink(LW)} />
          <path d="M69 13 Q82 10 85 -8 Q77 1 67 4 Z" fill={a} {...ink(LW)} />
          <path d="M29 -2 Q33 3 37 5" fill="none" stroke={shade(a, 0.3)} strokeWidth={1.6} />
          <path d="M83 -4 Q79 2 75 4" fill="none" stroke={shade(a, 0.3)} strokeWidth={1.6} />
          <path d="M36 23 Q35 2 56 1 Q77 2 76.5 21 Z" fill={c} {...ink(LW)} />
          <path d="M39 21 Q39 6 51 3 Q44 10 45 21 Z" fill={shade(c, 0.25)} />
          <path d="M60 4 Q68 7 71 14" fill="none" stroke={tint(c, 0.5)} strokeWidth={2} />
          <rect x={34} y={18} width={44} height={6} rx={2.5} fill={shade(c, 0.2)} {...ink(1.6)} />
          <g fill={tint(c, 0.5)}>
            <circle cx={41} cy={21} r={1.2} />
            <circle cx={50} cy={21} r={1.2} />
            <circle cx={59} cy={21} r={1.2} />
            <circle cx={68} cy={21} r={1.2} />
          </g>
        </g>
      );
    case 'crown':
      return (
        <g className="gear-hat">
          <path
            d="M40 17 L38 1 L46 8 L51 -4 L57 6 L63 -4 L67 8 L75 1 L73 17 Q56 14 40 17 Z"
            fill={c}
            {...ink(LW)}
          />
          <path d="M41 16 L40 5 L45 10 L46 16 Z" fill={shade(c, 0.25)} />
          <path d="M40 17 Q56 14 73 17 L73 21 Q56 18 40 21 Z" fill={shade(c, 0.15)} {...ink(1.6)} />
          <circle cx={56.5} cy={11} r={2.6} fill={a} {...ink(1.3)} />
          <circle cx={47} cy={13} r={1.8} fill="#3a86ff" {...ink(1.1)} />
          <circle cx={66} cy={13} r={1.8} fill="#2a9d5c" {...ink(1.1)} />
          <circle cx={51} cy={-4} r={1.6} fill={tint(c, 0.6)} />
          <circle cx={63} cy={-4} r={1.6} fill={tint(c, 0.6)} />
        </g>
      );
  }
}
