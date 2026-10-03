import { useId } from 'react';
import { ink, shade, tint } from '../../style';
import { type Item, STAR } from './kit';

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
