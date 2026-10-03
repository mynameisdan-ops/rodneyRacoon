import { Dust, Glow } from '../../fx';
import { ink } from '../../style';
import { fallen, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { ICE } from './kit';
import { ICICLES } from './layout';

// ---------- Level 30: icicle cave ----------
// rumble → fall (icicles crash down right behind him as he dashes through).

export function IcicleCaveBack(p: ObstacleProps) {
  const [a, b] = ICICLES.cave;
  const top = -ICICLES.ceiling;
  const fallAt = eventTime(p.events, 'fall');
  const icicles = [];
  for (let x = a + 60; x < b - 40; x += 110) icicles.push(x);
  const rumble = since(p, 'rumble');
  return (
    <g>
      {/* The cave: an icy ceiling and walls, glowing blue inside. */}
      <path
        d={`M${a - 120} 4 L${a - 60} ${top - 60} Q${(a + b) / 2} ${top - 140} ${b + 60} ${top - 60} L${b + 120} 4 L${b + 40} 4 Q${b} ${top + 40} ${b - 60} ${top} H${a + 60} Q${a} ${top + 40} ${a - 40} 4 Z`}
        fill="#6a9ac8"
        {...ink(3.5)}
      />
      <path
        d={`M${a - 40} 4 Q${a} ${top + 40} ${a + 60} ${top} H${b - 60} Q${b} ${top + 40} ${b + 40} 4 Z`}
        fill="#bfe4f8"
        opacity={0.35}
      />
      <Glow x={(a + b) / 2} y={top / 2} r={380} color="#dff4ff" />
      {icicles.map((x, i) => {
        // Each drops once he is safely past it.
        let dropAt = Infinity;
        if (p.t >= fallAt) {
          for (let t = fallAt; t <= p.t; t += 20) {
            if (p.heroAt(t).x > x + ICICLES.behind) {
              dropAt = t;
              break;
            }
          }
        }
        const dt = p.t - dropAt;
        const len = 90 + noise(i, 2) * 70;
        const wobble = rumble >= 0 && dt < 0 ? 2 * Math.sin(p.t / 30 + i) : 0;
        const y = top + fallen(dt, 0.004);
        const landed = y - top + len > -top;
        const iy = landed ? -len : y;
        return (
          <g key={x}>
            {!landed ? (
              <path
                transform={`translate(${x + wobble} ${iy})`}
                d={`M-18 0 L18 0 L2 ${len} L-2 ${len} Z`}
                fill={ICE}
                {...ink(2.5)}
              />
            ) : (
              <g transform={`translate(${x} 0)`}>
                <path d="M-30 4 L-10 -30 L6 -10 L22 -40 L34 4 Z" fill={ICE} {...ink(2.5)} />
              </g>
            )}
            {landed && (
              <Dust
                x={x}
                y={-6}
                dt={dt - Math.sqrt((-top - len) / 0.004)}
                ms={600}
                size={0.6}
                color="#e8f6ff"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
