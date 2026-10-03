import { ink, shade, tint } from '../../style';
import { type Item, OUT, IN, STAR } from './kit';

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
