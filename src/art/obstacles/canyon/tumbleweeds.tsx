import { INK } from '../../style';
import { Cactus } from '../../worlds/canyon';
import { clamp01, rollAngle, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { TUMBLEWEEDS } from './layout';
import { SandStreaks } from './parts';

// ---------- Level 36: tumbleweeds ----------
// wind → j1..j3 (a tumbleweed rolls under him at the top of each jump).

function Tumbleweed({ x, r, spin }: { x: number; r: number; spin: number }) {
  const twig = '#a07844';
  return (
    <g transform={`translate(${x} ${-r}) rotate(${spin})`}>
      <circle r={r} fill="#c9a060" opacity={0.35} />
      <g stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round">
        <circle r={r} />
      </g>
      <g stroke={twig} strokeWidth={4} fill="none" strokeLinecap="round">
        <circle r={r - 2} />
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <path
              key={i}
              d={`M${Math.cos(a) * r * 0.9} ${Math.sin(a) * r * 0.9} Q0 0 ${Math.cos(a + 2) * r * 0.9} ${Math.sin(a + 2) * r * 0.9}`}
            />
          );
        })}
        <circle r={r * 0.5} />
      </g>
    </g>
  );
}

export function TumbleweedsBack(p: ObstacleProps) {
  const wind = since(p, 'wind');
  return (
    <g>
      <SandStreaks t={p.t} strength={clamp01(wind / 600)} dir={-1} />
      <g transform="translate(1100 0) scale(0.9)">
        <Cactus color="#4f9a52" />
      </g>
    </g>
  );
}

export function TumbleweedsFront(p: ObstacleProps) {
  if (since(p, 'wind') < 0) return null;
  return (
    <g>
      {TUMBLEWEEDS.radii.map((r, i) => {
        const jumpAt = eventTime(p.events, `j${i + 1}`);
        // Find the top of his jump: halfway through it.
        const jumpMs = [550, 550, 700][i]!;
        const apex = jumpAt + jumpMs / 2;
        const at = p.heroAt(apex).x;
        const x = at + TUMBLEWEEDS.speed * (apex - p.t);
        if (x > 2400 || x < -900) return null;
        const bounce = 30 * Math.abs(Math.sin((p.t - apex) / 180 + i));
        return (
          <g key={i} transform={`translate(0 ${-bounce})`}>
            <Tumbleweed x={x} r={r} spin={-rollAngle(apex - p.t, r) * TUMBLEWEEDS.speed} />
          </g>
        );
      })}
    </g>
  );
}
