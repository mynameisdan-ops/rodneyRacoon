import { ink, shade, tint } from '../../style';
import { fallen, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { WATER, FOAM, ROCK } from './kit';
import { FALLS } from './layout';
import { River, Splash, Bank } from './parts';

// ---------- Level 22: waterfall slide ----------
// crack (the top rock breaks) → he slides down the chute → launch (off the lip, over the pool).

export function FallsBack(p: ObstacleProps) {
  const [[c0x, c0l], [c1x, c1l]] = FALLS.chute;
  const [p0, p1] = FALLS.pool;
  const crack = since(p, 'crack');
  const slide = crack >= 0;
  return (
    <g>
      {/* The waterfall pouring down from the cliff onto the top of the chute. */}
      <rect
        x={c0x - 10}
        y={-900}
        width={70}
        height={900 - c0l}
        fill={tint(WATER, 0.25)}
        {...ink(3)}
      />
      <g stroke={FOAM} strokeWidth={5} strokeLinecap="round">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = -900 + ((p.t * 0.9 + i * 170) % (900 - c0l - 30));
          return <path key={i} d={`M${c0x + 6 + (i % 3) * 16} ${y} v 30`} />;
        })}
      </g>
      {/* Rock steps up to the top. */}
      {FALLS.steps.map(([x, lift]) => (
        <path key={x} d={`M${x - 50} 4 V${-lift} H${x + 40} V4 Z`} fill={ROCK} {...ink(3)} />
      ))}
      {/* The chute: a smooth wet rock slope with water rushing down it. */}
      <path
        d={`M${c0x - 20} ${-c0l} L${c1x} ${-c1l} L${c1x + 20} ${-c1l + 10} L${c1x + 20} 6 L${c0x - 20} 6 Z`}
        fill={shade(ROCK, 0.15)}
        {...ink(3)}
      />
      <path
        d={`M${c0x - 20} ${-c0l - 6} L${c1x + 10} ${-c1l - 6}`}
        stroke={WATER}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d={`M${c0x} ${-c0l - 9} L${c1x} ${-c1l - 9}`}
        stroke={FOAM}
        strokeWidth={3}
        strokeDasharray="20 30"
        strokeDashoffset={-p.t * 0.6}
      />
      {/* The pool he flies over. */}
      <River a={p0} b={p1} level={8} t={p.t} white={0.5} />
      <Bank x={p0} dir={1} />
      <Bank x={p1} dir={-1} />
      {/* The top rock cracks away as he starts to slide. */}
      {slide && (
        <g
          transform={`translate(${c0x - 30 - crack * 0.05} ${-c0l + fallen(crack - 150, 0.002)}) rotate(${-crack * 0.05})`}
        >
          <path d="M-26 0 L-18 -20 L14 -24 L26 0 Z" fill={ROCK} {...ink(2.5)} />
        </g>
      )}
      <Splash x={c1x + 60} y={0} dt={since(p, 'launch')} size={1.2} />
    </g>
  );
}
