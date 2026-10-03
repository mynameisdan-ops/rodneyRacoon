import { useId } from 'react';
import { ink, shade, tint } from '../../style';
import { type Item, OUT, IN, STAR } from './kit';

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
