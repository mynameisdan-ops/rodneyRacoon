import { useId } from 'react';
import type { ShopItem } from '../../content/shop';
import { INK, ink, shade, tint } from '../style';

/**
 * Shop gear (M7b). Hats are drawn in the head's own units (around the middle of the skull) and
 * ride inside `Head`, so they turn with it and show in the cut-in close-up; hair above a hat's
 * band is tucked under it (`HAT_LINE`). Capes, packs and pets are in the hero's 100×170 view
 * (facing right, feet at y 163): capes replace his default cape, packs sit on his back (the left
 * edge, in his three-quarter view), and pets stand (or hover) just ahead of him.
 */

type Item<S extends ShopItem['slot']> = Extract<ShopItem, { slot: S }>;

/** Silhouette and inner line widths, in the hero's view units (as the hero's own). */
const OUT = 2.5;
const IN = 1.3;
const LW = 2.4;
const BRASS = '#f0c050';
const STAR =
  'M0 -5 L1.5 -1.6 L5 -1.5 L2.3 0.9 L3.1 4.6 L0 2.5 L-3.1 4.6 L-2.3 0.9 L-5 -1.5 L-1.5 -1.6 Z';

/** A hat, in head units; `s` is the head's scale (lines match the body's) and `weight` thins them. */
export function Hat({ item, s, weight = 1 }: { item: Item<'hat'>; s: number; weight?: number }) {
  const { color: c, accent: a } = item;
  const lw = (IN / s) * weight;
  const o = ink((OUT / s) * weight);
  const i = ink(lw);
  switch (item.art) {
    case 'bandana':
      return (
        <g className="gear-hat">
          {/* Tails of the knot, flying out behind. */}
          <path
            d="M-29 -16 Q-38 -23 -48 -20 Q-42 -15 -43 -9 Q-36 -14 -29 -12 Z"
            fill={shade(c, 0.2)}
            {...o}
          />
          <path
            d="M-30 -11 Q-37 -7 -42 2 Q-36 0 -33 4 Q-31 -4 -26 -8 Z"
            fill={shade(c, 0.34)}
            {...o}
          />
          <path
            d="M-29 -13 C-32 -28 -20 -41 2 -41 C20 -41 31 -31 31.5 -17 Q16 -22 2 -20.5 Q-14 -19 -29 -13 Z"
            fill={c}
            {...o}
          />
          {/* Shade on the back of the head, a shine across the top, a fold. */}
          <path
            d="M-29 -13 C-32 -28 -20 -41 2 -41 C-11 -36 -17 -27 -17 -17.8 Q-23 -16 -29 -13 Z"
            fill={shade(c, 0.3)}
          />
          <path d="M-8 -36.5 Q5 -40.5 19 -35.5 L17 -32.5 Q5 -36.5 -7 -33.5 Z" fill={tint(c, 0.4)} />
          <path
            d="M-16 -19.5 Q-6 -27 6 -21"
            fill="none"
            stroke={shade(c, 0.32)}
            strokeWidth={lw}
            strokeLinecap="round"
          />
          <g fill={a}>
            <circle cx={-1} cy={-31} r={2.3} />
            <circle cx={11} cy={-33} r={2.1} />
            <circle cx={21} cy={-26} r={2.1} />
            <circle cx={-11} cy={-26} r={2} />
            <circle cx={6} cy={-25} r={1.9} />
            <circle cx={-21} cy={-20} r={1.7} />
            <circle cx={25} cy={-20.5} r={1.6} />
            <circle cx={-9} cy={-37} r={1.5} />
          </g>
          {/* The knot. */}
          <ellipse cx={-28.5} cy={-13.5} rx={4.8} ry={4.2} fill={c} {...o} />
          <path
            d="M-31 -12 Q-28.5 -15 -26 -12.5"
            fill="none"
            stroke={shade(c, 0.35)}
            strokeWidth={lw}
          />
        </g>
      );
    case 'explorer':
      return (
        <g className="gear-hat">
          <ellipse cx={3} cy={-18} rx={43} ry={10} fill={tint(c, 0.15)} {...o} />
          <path
            d="M-38 -15 Q3 -2 44 -15"
            fill="none"
            stroke={shade(c, 0.2)}
            strokeWidth={lw * 1.4}
            strokeLinecap="round"
          />
          <path
            d="M-26 -19 C-27 -39 -13 -48 3 -48 C20 -48 32 -39 31 -19 Q3 -12 -26 -19 Z"
            fill={c}
            {...o}
          />
          <path
            d="M-26 -19 C-27 -39 -13 -48 3 -48 C-8 -43 -14 -32 -13 -16.6 Q-20 -17 -26 -19 Z"
            fill={shade(c, 0.28)}
          />
          <path d="M-26.4 -21 Q3 -14 31.4 -21 L31 -27.5 Q3 -21 -26.4 -27.5 Z" fill={a} {...i} />
          <path
            d="M9 -45 Q23 -42 27.5 -31"
            fill="none"
            stroke={tint(c, 0.55)}
            strokeWidth={lw * 1.5}
            strokeLinecap="round"
          />
        </g>
      );
    case 'miner':
      return (
        <g className="gear-hat">
          {/* The lamp's beam: a flat see-through wedge (no filter). */}
          <path d="M28 -37 L76 -54 L76 -12 L28 -28 Z" fill={a} opacity={0.35} />
          <ellipse cx={3} cy={-18} rx={34} ry={5.5} fill={shade(c, 0.12)} {...o} />
          <path
            d="M-27 -18 C-28 -40 -12 -49 3 -49 C21 -49 32 -40 31 -18 Q3 -12 -27 -18 Z"
            fill={c}
            {...o}
          />
          <path
            d="M-27 -18 C-28 -40 -12 -49 3 -49 C-8 -44 -14 -33 -13 -15.6 Q-21 -16 -27 -18 Z"
            fill={shade(c, 0.25)}
          />
          <path
            d="M-1 -48.6 Q8 -34 6 -14"
            fill="none"
            stroke={shade(c, 0.35)}
            strokeWidth={lw * 1.6}
          />
          <path
            d="M13 -47 Q24 -45 27 -36"
            fill="none"
            stroke={tint(c, 0.55)}
            strokeWidth={lw * 1.5}
            strokeLinecap="round"
          />
          <path d="M16 -18.5 Q32 -21.5 42 -14.5 Q31 -10 16 -13.5 Z" fill={shade(c, 0.12)} {...o} />
          <rect x={16} y={-41} width={11} height={13} rx={3.5} fill="#4a4a52" {...i} />
          <circle cx={27} cy={-34.5} r={5.2} fill={a} {...i} />
          <circle cx={28.5} cy={-36} r={1.7} fill="#fff" />
        </g>
      );
    case 'wizard':
      return (
        <g className="gear-hat">
          <ellipse cx={2} cy={-18} rx={44} ry={9.5} fill={tint(c, 0.1)} {...o} />
          <path
            d="M-23 -19 Q-17 -42 -16 -62 Q-17 -80 -38 -91 Q-6 -90 5 -66 Q13 -42 27 -19 Q2 -12 -23 -19 Z"
            fill={c}
            {...o}
          />
          <path
            d="M-23 -19 Q-17 -42 -16 -62 Q-17 -80 -38 -91 Q-14 -84 -9 -64 Q-6 -40 -8 -15.6 Q-16 -16 -23 -19 Z"
            fill={shade(c, 0.3)}
          />
          <path d="M-23.6 -21 Q2 -14 27.6 -21 L26 -27.5 Q2 -21 -22 -27.5 Z" fill={shade(c, 0.45)} />
          <g fill={a}>
            <path d={STAR} transform="translate(5 -39) scale(1.15)" />
            <path d={STAR} transform="translate(-6 -58) scale(0.8)" />
            <path d={STAR} transform="translate(15 -30) scale(0.7)" />
          </g>
          <circle cx={-38} cy={-91} r={4.4} fill={a} {...i} />
        </g>
      );
    case 'viking':
      return (
        <g className="gear-hat">
          {/* The far horn, behind the helmet. */}
          <path d="M22 -33 Q37 -36 41 -58 Q31 -46 19 -42 Z" fill={shade(a, 0.18)} {...o} />
          <path
            d="M-28 -18 C-29 -40 -13 -49 2 -49 C20 -49 31 -40 31 -18 Q2 -12 -28 -18 Z"
            fill={c}
            {...o}
          />
          <path
            d="M-28 -18 C-29 -40 -13 -49 2 -49 C-9 -44 -15 -33 -14 -15.6 Q-21 -16 -28 -18 Z"
            fill={shade(c, 0.25)}
          />
          <path d="M2 -49 Q7 -34 5 -15" fill="none" stroke={shade(c, 0.3)} strokeWidth={lw * 1.6} />
          <path
            d="M11 -46 Q24 -42 28 -31"
            fill="none"
            stroke={tint(c, 0.6)}
            strokeWidth={lw * 1.5}
            strokeLinecap="round"
          />
          <path d="M-29 -16 Q2 -10 32 -16 L32 -23 Q2 -16.5 -29 -23 Z" fill={shade(c, 0.2)} {...i} />
          <g fill={tint(c, 0.55)}>
            {[-22, -10, 2, 14, 26].map((x) => (
              <circle key={x} cx={x} cy={-19.6 + 3.4 * (1 - ((x - 2) / 30) ** 2)} r={1.6} />
            ))}
          </g>
          {/* The near horn, out in front. */}
          <path d="M-24 -26 Q-41 -27 -48 -52 Q-36 -40 -22 -36 Z" fill={a} {...o} />
          <path
            d="M-44 -45 Q-40 -37 -34 -33 M-38 -48 Q-34 -40 -30 -37"
            fill="none"
            stroke={shade(a, 0.3)}
            strokeWidth={lw}
          />
        </g>
      );
    case 'crown':
      return (
        <g className="gear-hat">
          <path
            d="M-20 -30 L-23 -50 L-13 -41 L-5 -55 L3 -42 L12 -56 L18 -42 L27 -52 L25 -31 Q3 -25.5 -20 -30 Z"
            fill={c}
            {...o}
          />
          <path d="M-20 -30 L-23 -50 L-13 -41 L-12 -28.6 Z" fill={shade(c, 0.25)} />
          <path
            d="M-20.4 -30 Q3 -25.5 25 -31 L25.6 -37 Q3 -31.5 -21.2 -36 Z"
            fill={shade(c, 0.15)}
            {...i}
          />
          <circle cx={3} cy={-32.5} r={3.4} fill={a} {...i} />
          <circle cx={-11} cy={-32.5} r={2.3} fill="#3a86ff" {...i} />
          <circle cx={16} cy={-33.5} r={2.3} fill="#2a9d5c" {...i} />
          <circle cx={-5} cy={-55} r={2} fill={tint(c, 0.6)} />
          <circle cx={12} cy={-56} r={2} fill={tint(c, 0.6)} />
          <path
            d="M20 -44 L24 -48"
            stroke={tint(c, 0.6)}
            strokeWidth={lw * 1.4}
            strokeLinecap="round"
          />
        </g>
      );
  }
}

/** His default cape: hanging from the shoulders behind everything. */
const CAPE_PATH = 'M42.5 52 Q54 47 58 53 Q52 95 50 125 Q38 129 24.5 122 Q30.5 82 42.5 52 Z';
/** Shop capes are longer and fuller, with a scalloped hem, so they show from the side. */
const GRAND_CAPE_PATH =
  'M42.5 51 Q54 46 58.5 53 Q53 96 52 135 Q46.5 131 41 137 Q35 132 29 137 Q23 131.5 17 134 Q13 133 9 128 Q24 84 42.5 51 Z';

export function Cape({ color, item }: { color: string; item?: Item<'cape'> }) {
  const clip = useId();
  if (!item) {
    return (
      <>
        <path d={CAPE_PATH} fill={color} {...ink(OUT)} />
        <path
          d="M34.5 78 Q32.5 107 24.5 122 Q34.5 123 40.5 126 Q38.5 92 34.5 78 Z"
          fill={shade(color, 0.35)}
        />
        <path
          d="M48 60 Q46 95 45 121"
          fill="none"
          stroke={tint(color, 0.3)}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </>
    );
  }
  const { color: c, accent: a } = item;
  return (
    <>
      <path d={GRAND_CAPE_PATH} fill={c} />
      <g clipPath={`url(#${clip})`}>
        <defs>
          <clipPath id={clip}>
            <path d={GRAND_CAPE_PATH} />
          </clipPath>
        </defs>
        <path d="M33 72 Q25 104 9 128 Q14 134 18 134 Q30 104 37 74 Z" fill={shade(c, 0.35)} />
        <path
          d="M48 60 Q46 98 46.5 131"
          fill="none"
          stroke={tint(c, 0.3)}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        {item.art === 'plain' ? (
          // A royal cape: a gold hem with white spots (ermine).
          <>
            <path
              d="M6 126 Q13 133 17 134 Q23 131.5 29 137 Q35 132 41 137 Q46.5 131 52 135 L52 127 Q46 124 41 129 Q35 124 29 129 Q23 124 16 126 Q11 125 8 120 Z"
              fill={a}
            />
            <g fill="#fff8e8">
              <circle cx={18} cy={129} r={1.5} />
              <circle cx={30} cy={132} r={1.5} />
              <circle cx={42} cy={132} r={1.5} />
            </g>
          </>
        ) : (
          <CapePattern art={item.art} accent={a} />
        )}
      </g>
      <path d={GRAND_CAPE_PATH} fill="none" {...ink(OUT)} />
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
        <g fill={accent} {...ink(IN)}>
          <path d="M14 134 Q13 122 21 118 Q23 128 14 134 Z" />
          <path d="M27 136 Q26 124 34 120 Q36 130 27 136 Z" />
          <path d="M40 134 Q39 122 47 118 Q49 128 40 134 Z" />
          <path d="M29 106 Q28 96 35 92 Q37 101 29 106 Z" />
          <path d="M42 98 Q41 89 47 85 Q49 93 42 98 Z" />
          <path d="M40 76 Q40 67 46 63 Q48 71 40 76 Z" />
        </g>
      );
    case 'stars':
      return (
        <g fill={accent}>
          <path d={STAR} transform="translate(45 70) scale(0.9)" />
          <path d={STAR} transform="translate(37 95) scale(1.2)" />
          <path d={STAR} transform="translate(24 120) scale(1)" />
          <path d={STAR} transform="translate(44 118) scale(0.75)" />
          <circle cx={37} cy={80} r={1} />
          <circle cx={47} cy={98} r={1} />
          <circle cx={30} cy={108} r={1} />
          <circle cx={36} cy={128} r={1} />
        </g>
      );
    case 'flames':
      return (
        <>
          <path
            d="M6 140 Q14 120 19 112 Q21 122 26 116 Q28 102 33 94 Q36 106 40 104 Q43 112 42 118 Q47 112 50 104 L56 140 Z"
            fill={accent}
          />
          <path
            d="M14 140 Q20 128 22 122 Q24 130 28 124 Q31 114 34 108 Q36 118 40 120 L48 140 Z"
            fill="#ffe36b"
          />
        </>
      );
    case 'waves':
      return (
        <g fill="none" stroke={accent} strokeWidth={2.8} strokeLinecap="round">
          <path d="M8 124 Q13 119 18 124 T28 124 T38 124 T48 124 T58 124" />
          <path d="M18 104 Q23 99 28 104 T38 104 T48 104 T58 104" />
          <path d="M28 84 Q33 79 38 84 T48 84 T58 84" />
          <path d="M36 66 Q41 61 46 66 T56 66" />
        </g>
      );
  }
}

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

/** A shiny cartoon eye: dark, with a big highlight and a small one. */
function Eye({ x, y, r = 2.4 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} fill={INK} />
      <circle cx={x + r * 0.3} cy={y - r * 0.35} r={r * 0.42} fill="#fff" />
      <circle cx={x - r * 0.38} cy={y + r * 0.4} r={r * 0.18} fill="#fff" />
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
          <Eye x={95} y={109} r={2.6} />
          <Eye x={104} y={109} r={2.6} />
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
