import { Glow } from '../../fx';
import { ink, shade } from '../../style';
import { Cactus } from '../../worlds/canyon';
import { clamp01, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { SAND } from './kit';
import { HILL } from './layout';
import { SandStreaks } from './parts';

// ---------- Level 39: the last hill ----------
// wind (it pushes him back) → calm (at the top, he sees home far away).

export function HillBack(p: ObstacleProps) {
  const { top, height, home } = HILL;
  const wind = clamp01(since(p, 'wind') / 500) - clamp01(since(p, 'calm') / 600);
  const calm = clamp01(since(p, 'calm') / 900);
  return (
    <g>
      <path d={`M-40 4 L0 0 L${top} ${-height} H3000 V240 H-40 Z`} fill={SAND} {...ink(3.5)} />
      <path
        d={`M120 ${-height * (120 / top) + 24} L${top - 60} ${-height + 22}`}
        stroke={shade(SAND, 0.15)}
        strokeWidth={10}
      />
      <g transform={`translate(${top + 420} ${-height})`}>
        <Cactus color="#4f9a52" />
      </g>
      {/* Home, far away on the horizon, with its light on. */}
      <g opacity={calm} transform={`translate(${home.x} ${home.y})`}>
        <Glow x={0} y={-20} r={120} color="#ffd35a" />
        <rect x={-40} y={-40} width={80} height={50} fill="#e8d4b0" {...ink(2.5)} />
        <path d="M-50 -40 L0 -80 L50 -40 Z" fill="#c0392b" {...ink(2.5)} />
        <rect x={-10} y={-26} width={20} height={20} fill="#ffd35a" {...ink(2)} />
      </g>
      <SandStreaks t={p.t} strength={wind} dir={-1} />
    </g>
  );
}
