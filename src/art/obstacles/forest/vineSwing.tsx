import { INK, ink, tint } from '../../style';
import { bump, clamp01, easeOut, lerp, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { BARK, LEAF } from './kit';
import { VINE_SWING } from './layout';
import { Hollow } from './parts';

// ---------- Level 12: vine swing ----------
// flood (water roars into the gully) → grab (he swings on a vine) → letgo.

const WATER = '#3aa0d8';

const FOAM = '#e8f8ff';

function vineEnd(p: ObstacleProps) {
  const { pivot, vine, reach } = VINE_SWING;
  const grabAt = eventTime(p.events, 'grab');
  const letgoAt = eventTime(p.events, 'letgo');
  if (p.t >= grabAt && p.t < letgoAt) return { x: p.heroX, y: -(p.heroLift + reach) };
  let angle = 0.05 * Math.sin(p.t / 600);
  if (p.t >= letgoAt) {
    const dt = p.t - letgoAt;
    const a0 = Math.asin(clamp01((p.heroAt(letgoAt).x - pivot.x) / vine));
    angle = a0 * Math.cos(dt / 330) * Math.exp(-dt / 1400);
  }
  return { x: pivot.x + vine * Math.sin(angle), y: pivot.y + vine * Math.cos(angle) };
}

function Water({ a, b, level, t }: { a: number; b: number; level: number; t: number }) {
  const n = 8;
  let top = `M${a} ${level}`;
  for (let i = 1; i <= n; i++) {
    const x = lerp(a, b, i / n);
    top += ` Q${x - (b - a) / n / 2} ${level + 8 * Math.sin(t / 150 + i)} ${x} ${level}`;
  }
  return (
    <g>
      <path d={`${top} L${b} 220 L${a} 220 Z`} fill={WATER} {...ink(3)} />
      <path d={`${top} L${b} ${level + 14} L${a} ${level + 14} Z`} fill={tint(WATER, 0.35)} />
      <g stroke={FOAM} strokeWidth={4} strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => {
          const x = a + (((t * 0.35 + i * 110) % (b - a - 40)) + 20);
          return <path key={i} d={`M${x} ${level + 24 + (i % 2) * 16} h 26`} />;
        })}
      </g>
    </g>
  );
}

export function VineSwingBack(p: ObstacleProps) {
  const { pivot, gully } = VINE_SWING;
  const [a, b] = gully;
  const flood = since(p, 'flood');
  const level = flood < 0 ? 150 : lerp(150, -6, easeOut(clamp01(flood / 900)));
  const end = vineEnd(p);
  const logX = flood < 0 ? -1000 : a - 120 + flood * 0.3;
  return (
    <g>
      <Hollow a={a} b={b} depth={120} />
      <Water a={a + 8} b={b - 8} level={level} t={p.t} />
      {logX > a && logX < b - 60 && (
        <g transform={`translate(${logX} ${level - 4}) rotate(${Math.sin(p.t / 200) * 6})`}>
          <rect x={-60} y={-16} width={120} height={28} rx={14} fill={BARK} {...ink(3)} />
          <ellipse cx={60} cy={-2} rx={8} ry={14} fill="#d9a86a" {...ink(2)} />
        </g>
      )}
      {/* The surge: a tall wall of spray bursting up as the water roars in. */}
      {flood >= 0 && flood < 1200 && (
        <g fill={FOAM} {...ink(2.5)} opacity={1 - flood / 1200}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = a + 30 + i * ((b - a - 60) / 5);
            const h = 220 * bump(flood - i * 60, 900) * (0.7 + 0.3 * noise(i, 6));
            return h > 1 ? (
              <path
                key={i}
                d={`M${x - 26} ${level} Q${x - 30} ${level - h * 0.6} ${x} ${level - h} Q${x + 30} ${level - h * 0.6} ${x + 26} ${level} Z`}
              />
            ) : null;
          })}
        </g>
      )}
      {flood >= 0 && flood < 900 && (
        <g fill={FOAM} {...ink(2)} opacity={1 - flood / 900}>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={a + 40 + i * 80}
              cy={level - 20 - ((flood * 0.12 * (1 + noise(i))) % 60)}
              r={10 + noise(i, 3) * 8}
            />
          ))}
        </g>
      )}
      {/* The big branch the vine hangs from. */}
      <path
        d={`M${pivot.x - 420} ${pivot.y - 60} Q${pivot.x - 200} ${pivot.y - 10} ${pivot.x + 120} ${pivot.y - 20}`}
        stroke={INK}
        strokeWidth={34}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${pivot.x - 420} ${pivot.y - 60} Q${pivot.x - 200} ${pivot.y - 10} ${pivot.x + 120} ${pivot.y - 20}`}
        stroke={BARK}
        strokeWidth={27}
        fill="none"
        strokeLinecap="round"
      />
      <g fill={LEAF} {...ink(2.5)}>
        <circle cx={pivot.x + 120} cy={pivot.y - 40} r={40} />
        <circle cx={pivot.x + 70} cy={pivot.y - 64} r={30} />
      </g>
      <path
        d={`M${pivot.x} ${pivot.y} Q${(pivot.x + end.x) / 2 + 12} ${(pivot.y + end.y) / 2} ${end.x} ${end.y}`}
        stroke={INK}
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${pivot.x} ${pivot.y} Q${(pivot.x + end.x) / 2 + 12} ${(pivot.y + end.y) / 2} ${end.x} ${end.y}`}
        stroke="#4f8a2e"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      {[0.3, 0.6].map((f) => (
        <path
          key={f}
          transform={`translate(${lerp(pivot.x, end.x, f)} ${lerp(pivot.y, end.y, f)})`}
          d="M0 0 Q12 -8 18 2 Q8 6 0 0 Z"
          fill={LEAF}
          {...ink(1.5)}
        />
      ))}
    </g>
  );
}
