import { ink } from '../../style';
import { fallen, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { SNOW, ICE } from './kit';
import { ICE_WALL } from './layout';

// ---------- Level 31: ice wall ----------
// climb → slip (a foothold breaks and he drops a little) → he climbs on to the top.

export function IceWallBack(p: ObstacleProps) {
  const { wall, top } = ICE_WALL;
  const slip = since(p, 'slip');
  return (
    <g>
      <path d={`M${wall - 20} 6 L${wall - 10} ${-top} H3000 V6 Z`} fill={ICE} {...ink(3.5)} />
      <g fill="#ffffff" opacity={0.55}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M${wall + 20 + i * 70} ${-top + 20} q -12 ${120 + i * 20} 6 ${top - 60}`}
            stroke="#ffffff"
            strokeWidth={8}
            fill="none"
          />
        ))}
      </g>
      <path
        d={`M${wall - 14} ${-top - 4} H3000 V${-top + 16} H${wall - 12} Z`}
        fill={SNOW}
        {...ink(2.5)}
      />
      {/* The foothold that breaks away. */}
      <g
        transform={`translate(${wall - 16} ${-120 + fallen(slip, 0.003)}) rotate(${slip > 0 ? slip * 0.3 : 0})`}
      >
        {fallen(slip, 0.003) < 200 && <path d="M-16 -10 H10 L4 12 H-12 Z" fill={ICE} {...ink(2)} />}
      </g>
      <g fill={ICE} {...ink(2)}>
        {[0, 1, 2].map((i) => {
          const dt = since(p, 'climb') - 600 - i * 700;
          const y = -top + fallen(dt, 0.003);
          return dt > 0 && y < 60 ? (
            <path key={i} d={`M${wall + 40 + i * 30} ${y} l 16 -6 l 6 16 Z`} />
          ) : null;
        })}
      </g>
    </g>
  );
}
