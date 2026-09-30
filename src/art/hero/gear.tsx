import { useId } from 'react';
import type { ShopItem } from '../../content/shop';
import { ink, shade, tint } from '../style';

/**
 * Shop gear, drawn in the Hero's own 100×170 view units (facing right, feet at y 163), so each
 * piece slots into the paper doll: hats ride on the head, capes replace the default cape, packs
 * sit on his back, and pets stand (or hover) just ahead of him.
 */

type Item<S extends ShopItem['slot']> = Extract<ShopItem, { slot: S }>;

const LW = 2;
const STAR =
  'M0 -5 L1.5 -1.6 L5 -1.5 L2.3 0.9 L3.1 4.6 L0 2.5 L-3.1 4.6 L-2.3 0.9 L-5 -1.5 L-1.5 -1.6 Z';

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

/** The default cape: short, hanging from the shoulders behind everything. */
const CAPE_PATH = 'M52 56 Q40 58 35 78 Q31 96 25 116 Q34 112 38 116 Q42 110 47 112 Q46 84 56 60 Z';
/** Shop capes are longer and fuller, so they show from the side. */
const GRAND_CAPE_PATH =
  'M52 55 Q37 57 30 80 Q24 104 14 132 Q25 127 30 133 Q37 126 43 131 Q48 124 50 126 Q45 92 57 60 Z';

export function Cape({ color, item }: { color: string; item?: Item<'cape'> }) {
  const clip = useId();
  if (!item) {
    return (
      <>
        <path d={CAPE_PATH} fill={color} {...ink(2.1)} />
        <path d="M44 62 Q38 80 33 106 L38 108 Q40 84 48 62 Z" fill={shade(color, 0.3)} />
      </>
    );
  }
  const { color: c, accent: a } = item;
  return (
    <>
      <path d={GRAND_CAPE_PATH} fill={c} {...ink(2.1)} />
      <path d="M43 62 Q34 84 27 120 L32 124 Q37 88 47 62 Z" fill={shade(c, 0.3)} />
      <path d="M50 66 Q45 94 47 124" fill="none" stroke={tint(c, 0.25)} strokeWidth={2} />
      {item.art !== 'plain' && (
        <g clipPath={`url(#${clip})`}>
          <defs>
            <clipPath id={clip}>
              <path d={GRAND_CAPE_PATH} />
            </clipPath>
          </defs>
          <CapePattern art={item.art} accent={a} />
        </g>
      )}
      {item.art === 'plain' && (
        // A royal cape: a gold hem with white spots (ermine), and a clasp.
        <>
          <path
            d="M14 132 Q25 127 30 133 Q37 126 43 131 Q48 124 50 126 L49 119 Q44 117 42 123 Q36 119 30 126 Q24 121 17 124 Z"
            fill={a}
            {...ink(1.4)}
          />
          <circle cx={53} cy={58} r={3.2} fill={a} {...ink(1.3)} />
        </>
      )}
      <path d={GRAND_CAPE_PATH} fill="none" {...ink(2.1)} />
    </>
  );
}

function CapePattern({
  art,
  accent,
}: {
  art: Exclude<Item<'cape'>['art'], 'plain'>;
  accent: string;
}) {
  switch (art) {
    case 'leaves':
      return (
        <g fill={accent} {...ink(1.1)}>
          <path d="M16 134 Q15 122 23 118 Q25 128 16 134 Z" />
          <path d="M27 134 Q26 122 34 118 Q36 128 27 134 Z" />
          <path d="M38 132 Q37 120 45 116 Q47 126 38 132 Z" />
          <path d="M30 106 Q29 96 36 92 Q38 101 30 106 Z" />
          <path d="M39 84 Q39 75 45 71 Q47 79 39 84 Z" />
        </g>
      );
    case 'stars':
      return (
        <g fill={accent}>
          <path d={STAR} transform="translate(44 72) scale(0.9)" />
          <path d={STAR} transform="translate(36 94) scale(1.2)" />
          <path d={STAR} transform="translate(25 118) scale(1)" />
          <path d={STAR} transform="translate(41 114) scale(0.7)" />
          <circle cx={36} cy={80} r={1} />
          <circle cx={45} cy={96} r={1} />
          <circle cx={31} cy={106} r={1} />
        </g>
      );
    case 'flames':
      return (
        <>
          <path
            d="M10 136 Q16 118 21 110 Q22 120 27 114 Q29 100 34 92 Q36 104 40 102 Q43 110 42 116 Q47 110 49 102 L52 138 Z"
            fill={accent}
          />
          <path
            d="M16 136 Q21 126 23 120 Q25 128 29 122 Q32 112 35 106 Q37 116 40 118 L46 138 Z"
            fill="#ffe36b"
          />
        </>
      );
    case 'waves':
      return (
        <g fill="none" stroke={accent} strokeWidth={2.8} strokeLinecap="round">
          <path d="M14 122 Q19 117 24 122 T34 122 T44 122 T54 122" />
          <path d="M22 102 Q27 97 32 102 T42 102 T52 102" />
          <path d="M30 82 Q35 77 40 82 T50 82" />
        </g>
      );
  }
}

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
