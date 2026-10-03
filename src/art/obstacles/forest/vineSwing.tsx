import { useId } from 'react';
import { INK, ink, shade, tint } from '../../style';
import { bump, clamp01, easeOut, lerp, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { VINE_SWING, vineEnd } from './layout';

/*
 * Level 12's vine swing, painted (M7b): a gully the flood roars into, and a vine on a branch he
 * swings across on (positions in `VINE_SWING`). Things he touches (the vine, the branch, the
 * water's surface) keep an ink line; the earth is painted.
 */

const BARK = '#6b4a32';
const LEAF = '#2f7d45';
const EARTH_TOP = '#6a4630';
const EARTH_DEEP = '#1d120b';
const WATER_TOP = '#86e0ff';
const WATER_DEEP = '#1c64a8';
const FOAM = '#f4fdff';
const GRASS = '#5aa64a';

function Gully({ a, b, depth, id }: { a: number; b: number; depth: number; id: string }) {
  const bottom = depth + 80;
  return (
    <g>
      <path
        d={`M${a - 14} -2 Q${a} ${depth * 0.4} ${a + 14} ${bottom} L${b - 14} ${bottom} Q${b} ${depth * 0.4} ${b + 14} -2 Z`}
        fill={`url(#${id}earth)`}
      />
      {/* The far wall catches the light; strata lines across the earth. */}
      <path
        d={`M${b + 14} -2 Q${b} ${depth * 0.4} ${b - 14} ${bottom} L${b - 40} ${bottom} Q${b - 22} ${depth * 0.4} ${b - 10} -2 Z`}
        fill={tint(EARTH_TOP, 0.15)}
        opacity={0.6}
      />
      <g stroke={shade(EARTH_TOP, 0.35)} strokeWidth={3} strokeLinecap="round" opacity={0.6}>
        <path d={`M${a + 4} 30 Q${(a + b) / 2} 44 ${b - 4} 30`} fill="none" />
        <path d={`M${a + 8} 70 Q${(a + b) / 2} 86 ${b - 8} 70`} fill="none" />
      </g>
      {/* Roots dangling over the edges, and the grass lip. */}
      <g stroke="#4a2f1e" strokeWidth={3.5} fill="none" strokeLinecap="round">
        <path d={`M${a - 4} 4 q 10 24 2 46`} />
        <path d={`M${a + 6} 2 q -6 18 6 30`} />
        <path d={`M${b + 4} 4 q -12 28 -2 52`} />
      </g>
      {[a, b].map((x, side) => (
        <g key={side} fill={GRASS}>
          <path
            d={`M${x - 40} 2 Q${x - 20} -10 ${x} -4 Q${x + 4} 4 ${x + (side ? -10 : 10)} 12 Q${x - 6} 4 ${x - 40} 8 Z`}
          />
          <path
            d={`M${x - 34} 0 Q${x - 18} -6 ${x - 4} -3`}
            stroke={tint(GRASS, 0.4)}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  );
}

function Water({
  a,
  b,
  level,
  t,
  id,
}: {
  a: number;
  b: number;
  level: number;
  t: number;
  id: string;
}) {
  const n = 8;
  let top = `M${a} ${level}`;
  for (let i = 1; i <= n; i++) {
    const x = lerp(a, b, i / n);
    top += ` Q${x - (b - a) / n / 2} ${level + 8 * Math.sin(t / 150 + i)} ${x} ${level}`;
  }
  return (
    <g>
      <path d={`${top} L${b} 240 L${a} 240 Z`} fill={`url(#${id}water)`} />
      {/* A bright band just under the surface, and foam riding the waves. */}
      <path
        d={`${top} L${b} ${level + 12} L${a} ${level + 12} Z`}
        fill={tint(WATER_TOP, 0.5)}
        opacity={0.7}
      />
      <path d={top} fill="none" {...ink(3)} />
      <g fill={FOAM}>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = a + (((t * 0.32 + i * 97) % (b - a - 60)) + 30);
          return (
            <ellipse key={i} cx={x} cy={level + 3 + (i % 2) * 4} rx={14 + noise(i) * 10} ry={4} />
          );
        })}
      </g>
      <g stroke={FOAM} strokeWidth={3} strokeLinecap="round" opacity={0.8}>
        {[0, 1, 2, 3].map((i) => {
          const x = a + (((t * 0.35 + i * 110) % (b - a - 40)) + 20);
          return <path key={i} d={`M${x} ${level + 30 + (i % 2) * 18} h 24`} />;
        })}
      </g>
    </g>
  );
}

export function VineSwingBack(p: ObstacleProps) {
  const id = useId();
  const { pivot, gully } = VINE_SWING;
  const [a, b] = gully;
  const flood = since(p, 'flood');
  const level = flood < 0 ? 150 : lerp(150, -6, easeOut(clamp01(flood / 900)));
  const end = vineEnd(p);
  const logX = flood < 0 ? -1000 : a - 120 + flood * 0.3;
  const branch = `M${pivot.x - 420} ${pivot.y - 60} Q${pivot.x - 200} ${pivot.y - 10} ${pivot.x + 120} ${pivot.y - 20}`;
  const vine = `M${pivot.x} ${pivot.y} Q${(pivot.x + end.x) / 2 + 12} ${(pivot.y + end.y) / 2} ${end.x} ${end.y}`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}earth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={EARTH_TOP} />
          <stop offset="1" stopColor={EARTH_DEEP} />
        </linearGradient>
        <linearGradient id={`${id}water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={WATER_TOP} />
          <stop offset="0.5" stopColor="#3aa6e0" />
          <stop offset="1" stopColor={WATER_DEEP} />
        </linearGradient>
      </defs>
      <Gully a={a} b={b} depth={120} id={id} />
      <Water a={a + 8} b={b - 8} level={level} t={p.t} id={id} />
      {logX > a && logX < b - 60 && (
        <g transform={`translate(${logX} ${level - 4}) rotate(${Math.sin(p.t / 200) * 6})`}>
          <rect x={-60} y={-16} width={120} height={28} rx={14} fill={BARK} {...ink(3)} />
          <rect x={-54} y={-12} width={104} height={6} rx={3} fill={tint(BARK, 0.35)} />
          <ellipse cx={60} cy={-2} rx={8} ry={14} fill="#e0b070" {...ink(2.5)} />
          <ellipse cx={60} cy={-2} rx={3.5} ry={7} fill="none" stroke="#a87a44" strokeWidth={1.6} />
        </g>
      )}
      {/* The surge: towers of foam bursting up as the water roars in. */}
      {flood >= 0 && flood < 1200 && (
        <g opacity={Math.min(1, 2.4 * (1 - flood / 1200))}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = a + 30 + i * ((b - a - 60) / 5);
            const h = 230 * bump(flood - i * 60, 900) * (0.7 + 0.3 * noise(i, 6));
            if (h < 2) return null;
            // A crown splash: a column of water that flares into tips at the top.
            const w = 26 + 6 * noise(i, 2);
            const tip = (k: number) => level - h * (0.92 + 0.14 * noise(i * 5 + k, 4));
            return (
              <g key={i}>
                <path
                  d={`M${x - w} ${level} Q${x - w * 0.4} ${level - h * 0.5} ${x - w * 0.55} ${level - h * 0.8} L${x - w * 1.25} ${tip(0)} L${x - w * 0.6} ${level - h * 0.86} L${x - w * 0.25} ${tip(1)} L${x} ${level - h * 0.84} L${x + w * 0.3} ${tip(2)} L${x + w * 0.62} ${level - h * 0.86} L${x + w * 1.2} ${tip(3)} L${x + w * 0.55} ${level - h * 0.8} Q${x + w * 0.4} ${level - h * 0.5} ${x + w} ${level} Z`}
                  fill={FOAM}
                  {...ink(2.5)}
                />
                <path
                  d={`M${x + w * 0.1} ${level} Q${x + w * 0.5} ${level - h * 0.45} ${x + w * 0.35} ${level - h * 0.78} Q${x + w * 0.62} ${level - h * 0.5} ${x + w * 0.85} ${level} Z`}
                  fill="#bfe9ff"
                />
                <circle cx={x - w * 0.5} cy={tip(5) - 18} r={5} fill={FOAM} {...ink(2)} />
                <circle cx={x + w * 0.6} cy={tip(6) - 26} r={4} fill={FOAM} {...ink(2)} />
              </g>
            );
          })}
        </g>
      )}
      {flood >= 0 && flood < 900 && (
        <g fill={FOAM} {...ink(2)} opacity={1 - flood / 900}>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={a + 40 + i * 80}
              cy={level - 30 - ((flood * 0.14 * (1 + noise(i))) % 80)}
              r={8 + noise(i, 3) * 8}
            />
          ))}
        </g>
      )}
      {/* The big branch the vine hangs from: bark with a lit top edge. */}
      <path d={branch} stroke={INK} strokeWidth={32} fill="none" strokeLinecap="round" />
      <path d={branch} stroke={BARK} strokeWidth={26} fill="none" strokeLinecap="round" />
      <path
        d={branch}
        transform="translate(0 -7)"
        stroke={tint(BARK, 0.35)}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <g {...ink(2.5)}>
        <circle cx={pivot.x + 120} cy={pivot.y - 40} r={42} fill={LEAF} />
        <circle cx={pivot.x + 68} cy={pivot.y - 66} r={32} fill={LEAF} />
      </g>
      <circle cx={pivot.x + 130} cy={pivot.y - 54} r={22} fill={tint(LEAF, 0.25)} />
      <circle cx={pivot.x + 76} cy={pivot.y - 78} r={14} fill={tint(LEAF, 0.25)} />
      <circle cx={pivot.x + 138} cy={pivot.y - 62} r={8} fill="#a5e07a" />
      {/* The vine. */}
      <path d={vine} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={vine} stroke="#4f9a2e" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path
        d={vine}
        transform="translate(1.5 0)"
        stroke="#a5e07a"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
      {[0.3, 0.6].map((f) => (
        <path
          key={f}
          transform={`translate(${lerp(pivot.x, end.x, f)} ${lerp(pivot.y, end.y, f)})`}
          d="M0 0 Q12 -8 18 2 Q8 6 0 0 Z"
          fill={tint(LEAF, 0.2)}
          {...ink(1.5)}
        />
      ))}
    </g>
  );
}
