import { INK, ink, shade } from '../../style';
import { clamp01, easeOut, lerp, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { BANK } from './kit';
import { RISING } from './layout';
import { River, Splash } from './parts';

// ---------- Level 23: rising water ----------
// flood (a wall of water pours in) → he climbs the root ladder → safe (up on the ledge).

export function RisingBack(p: ObstacleProps) {
  const { cliff, ledge, ladder } = RISING;
  const flood = since(p, 'flood');
  // The water climbs after him but stays below his feet, rising up the cliff once he's safe.
  const rise = lerp(80, -240, easeOut(clamp01(flood / 2600)));
  const level = flood < 0 ? 80 : Math.max(rise, -p.heroLift + 60);
  return (
    <g>
      {/* The cliff and its high ledge running on to the right. */}
      <path d={`M${cliff} 6 L${cliff + 10} ${-ledge} H2400 V6 Z`} fill="#8a7a6a" {...ink(3.5)} />
      <path
        d={`M${cliff + 10} ${-ledge} H2400 V${-ledge + 22} H${cliff + 8} Z`}
        fill={BANK}
        {...ink(3)}
      />
      <path
        d={`M${cliff + 60} ${-ledge + 80} l 40 20 M${cliff + 200} ${-ledge + 160} l 60 -10 M${cliff + 120} -60 l 30 30`}
        stroke={shade('#8a7a6a', 0.35)}
        strokeWidth={4}
      />
      {/* The root ladder hanging down the cliff face. */}
      <g stroke={INK} strokeWidth={9} strokeLinecap="round">
        <path
          d={`M${ladder - 22} ${-ledge - 4} Q${ladder - 30} ${-ledge / 2} ${ladder - 22} 0`}
          fill="none"
        />
        <path
          d={`M${ladder + 22} ${-ledge - 4} Q${ladder + 14} ${-ledge / 2} ${ladder + 22} 0`}
          fill="none"
        />
      </g>
      <g stroke="#7a5234" strokeWidth={5} strokeLinecap="round">
        <path
          d={`M${ladder - 22} ${-ledge - 4} Q${ladder - 30} ${-ledge / 2} ${ladder - 22} 0`}
          fill="none"
        />
        <path
          d={`M${ladder + 22} ${-ledge - 4} Q${ladder + 14} ${-ledge / 2} ${ladder + 22} 0`}
          fill="none"
        />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M${ladder - 24} ${-20 - i * 42} H${ladder + 22}`} stroke="#7a5234" />
        ))}
      </g>
      {flood >= 0 && <River a={-700} b={cliff + 4} level={level} t={p.t} flow={0.8} white={0.8} />}
      <Splash x={-100} y={level} dt={flood} size={2} />
    </g>
  );
}
