import { SpeedLines } from '../../fx';
import { INK, ink } from '../../style';
import { noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { SNOW, SNOW_SHADE, BARK } from './kit';
import { AVALANCHE } from './layout';

// ---------- Level 27: avalanche ----------
// crack (the snowfield breaks) → grab (he hangs from a branch as the wave rushes under) → settle.

const PINE = '#2f5e4a';

export function AvalancheBack(p: ObstacleProps) {
  const { tree, branch } = AVALANCHE;
  const crack = since(p, 'crack');
  return (
    <g>
      {/* A big pine, with the strong branch he grabs. */}
      <path
        d={`M${tree + 60} 6 L${tree + 66} -700 L${tree + 104} -700 L${tree + 110} 6 Z`}
        fill={BARK}
        {...ink(3.5)}
      />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${tree - 40 + i * 20} ${-420 - i * 110} L${tree + 85} ${-620 - i * 110} L${tree + 210 - i * 20} ${-420 - i * 110} Z`}
          fill={PINE}
          {...ink(3)}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${tree - 20 + i * 20} ${-430 - i * 110} L${tree + 85} ${-470 - i * 110} L${tree + 190 - i * 20} ${-430 - i * 110}`}
          stroke={SNOW}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <path
        d={`M${tree + 70} ${-branch - 10} Q${tree - 20} ${-branch + 4} ${tree - 110} ${-branch - 8}`}
        stroke={INK}
        strokeWidth={26}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${tree + 70} ${-branch - 10} Q${tree - 20} ${-branch + 4} ${tree - 110} ${-branch - 8}`}
        stroke={BARK}
        strokeWidth={19}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${tree + 40} ${-branch - 20} Q${tree - 20} ${-branch - 8} ${tree - 100} ${-branch - 18}`}
        stroke={SNOW}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
      {/* The crack across the snowfield up the mountain. */}
      {crack >= 0 && (
        <path
          d="M-600 -520 l 60 20 l 40 -14 l 70 24 l 50 -10"
          stroke={INK}
          strokeWidth={4}
          fill="none"
          strokeDasharray={`${Math.min(260, crack * 0.6)} 400`}
        />
      )}
    </g>
  );
}

export function AvalancheFront(p: ObstacleProps) {
  const crackAt = eventTime(p.events, 'crack');
  const grabAt = eventTime(p.events, 'grab');
  if (p.t < crackAt) return null;
  const hit = grabAt + 400;
  const v = (AVALANCHE.tree - 60 - AVALANCHE.snowStart) / (hit - crackAt);
  const front = AVALANCHE.snowStart + (p.t - crackAt) * v;
  const h = AVALANCHE.wave;
  // The new snow it leaves behind stays, all the way back up the slope.
  const back = AVALANCHE.snowStart;
  // Once the wave has passed he drops onto the new snow it left behind.
  const settledTop = -AVALANCHE.settled;
  return (
    <g>
      <path
        d={`M${back - 200} 30 L${back} ${settledTop} L${front - 260} ${settledTop} Q${front - 150} ${-h - 10} ${front - 40} ${-h * 0.9} Q${front + 20} ${-h * 0.6} ${front + 30} 30 Z`}
        fill={SNOW}
        {...ink(3.5)}
      />
      <path
        d={`M${back} ${settledTop + 18} H${front - 200} Q${front - 110} ${-h * 0.4} ${front - 30} ${-h * 0.3}`}
        stroke={SNOW_SHADE}
        strokeWidth={10}
        fill="none"
      />
      <g fill={SNOW} {...ink(2.5)}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={front - 30 - i * 28 + 8 * Math.sin(p.t / 70 + i)}
            cy={-h * 0.8 - 30 * noise(i, 3) - 16 * Math.abs(Math.sin(p.t / 120 + i))}
            r={18 + noise(i) * 12}
          />
        ))}
      </g>
      {front > 0 && <SpeedLines x={front - 300} t={p.t} ys={[-40, -80, -120]} />}
    </g>
  );
}
