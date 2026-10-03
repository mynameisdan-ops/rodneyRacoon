import { Dust } from '../../fx';
import { ink, shade, tint } from '../../style';
import { clamp01, easeOut, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { RED, RED_DARK, WOOD } from './kit';
import { FLASH_FLOOD } from './layout';

// ---------- Level 33: flash flood ----------
// rumble → flood (muddy water roars in from behind; he scrambles up the rock steps).

const MUD = '#9a6a3e';

export function FlashFloodBack(p: ObstacleProps) {
  const flood = since(p, 'flood');
  const front = FLASH_FLOOD.floodStart + Math.max(0, flood) * FLASH_FLOOD.speed;
  const level = -FLASH_FLOOD.depth * easeOut(clamp01(flood / 900));
  const [, , [lastX, top]] = FLASH_FLOOD.steps;
  return (
    <g>
      {/* The rock steps up to a high ledge that runs on to the right. */}
      <path d={`M${lastX - 70} 4 V${-top} H3000 V4 Z`} fill={RED} {...ink(3.5)} />
      {FLASH_FLOOD.steps.slice(0, 2).map(([x, lift]) => (
        <path
          key={x}
          d={`M${x - 60} 4 V${-lift} H${lastX - 70} V4 Z`}
          fill={shade(RED, 0.1)}
          {...ink(3)}
        />
      ))}
      <path
        d={`M${lastX - 70} ${-top + 40} H3000 M${lastX - 70} ${-top + 110} H3000`}
        stroke={RED_DARK}
        strokeWidth={6}
        opacity={0.6}
      />
      {flood >= 0 && (
        <g>
          <path
            d={`M-900 240 V${level} H${front - 60} Q${front - 10} ${level - 30} ${front} ${level + 10} Q${front + 30} ${-10} ${front + 50} 240 Z`}
            fill={MUD}
            {...ink(3.5)}
          />
          <path d={`M-900 ${level + 16} H${front - 80}`} stroke={tint(MUD, 0.3)} strokeWidth={6} />
          {[0, 1].map((i) => {
            const x = front - 260 - i * 380;
            return (
              <g
                key={i}
                transform={`translate(${x} ${level - 4}) rotate(${Math.sin(p.t / 180 + i) * 8})`}
              >
                <rect x={-50} y={-12} width={100} height={22} rx={11} fill={WOOD} {...ink(2.5)} />
              </g>
            );
          })}
          <g fill={tint(MUD, 0.5)} {...ink(2)}>
            {[0, 1, 2, 3].map((i) => (
              <circle
                key={i}
                cx={front - 20 - i * 18}
                cy={level - 20 - 14 * Math.abs(Math.sin(p.t / 90 + i))}
                r={12 - i * 2}
              />
            ))}
          </g>
        </g>
      )}
      <Dust x={-200} y={-4} dt={since(p, 'rumble')} ms={900} color="#d8b890" />
    </g>
  );
}
