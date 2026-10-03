import { memo } from 'react';
import { ink, PROP_IN as IN, PROP_OUT as OUT, shade } from '../../style';
import { Saguaro } from '../../worlds/canyon';
import { clamp01, fallen, heroPasses, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { NS, P, ROCK, ROCK_LIT, ROCK_SHADE } from './kit';
import { ARCH } from './layout';
import { Gorge, SandBurst } from './parts';

// ---------- Level 37: crumbling arch ----------
// crack (cracks spread from under his feet) → crumble (the arch breaks up behind him, slice by
// slice, never closer than `lag` behind him, as he runs across).

const [A, B] = ARCH.canyon;
const MID = (A + B) / 2;
const SLICE = 60;
const TOP = -6;

/** The arch's underside at x: thin at the top of its curve, thick where it meets the walls. */
const under = (x: number) => 34 + 140 * ((x - MID) / ((B - A) / 2)) ** 2;

/** When the slice starting at x falls: those behind him at once, the rest as he passes. */
function fallAt(p: ObstacleProps, x: number) {
  const crumbleAt = eventTime(p.events, 'crumble');
  if (!Number.isFinite(crumbleAt)) return Infinity;
  const start = p.heroAt(crumbleAt).x - ARCH.lag;
  if (x + SLICE <= start) return crumbleAt + ((x - A) / Math.max(1, start - A)) * 350;
  return heroPasses(p, x + SLICE + ARCH.lag, crumbleAt) + 60;
}

/** A stretch of the arch from x0 to x1 (lined): banded sandstone, lit on top, shadowed under. */
function Span({ x0, x1, edges }: { x0: number; x1: number; edges: boolean }) {
  const n = Math.max(2, Math.round((x1 - x0) / 30));
  const pts = Array.from({ length: n + 1 }, (_, i) => x0 + ((x1 - x0) * i) / n);
  const bottom = pts
    .slice()
    .reverse()
    .map((x) => `L${x.toFixed(1)} ${under(x).toFixed(1)}`)
    .join(' ');
  const band = (f: number) =>
    pts
      .map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${(TOP + (under(x) - TOP) * f).toFixed(1)}`)
      .join(' ');
  const outline = `M${x0} ${TOP} H${x1} ${bottom} Z`;
  return (
    <g>
      <path d={outline} fill={ROCK} />
      <path d={`${band(0.62)} ${bottom} Z`} fill={ROCK_SHADE} opacity={0.6} />
      <path d={band(0.3)} stroke={P.bands[0]} strokeWidth={5} fill="none" opacity={0.8} />
      <path d={band(0.48)} stroke={shade(ROCK, 0.2)} strokeWidth={3} fill="none" opacity={0.7} />
      <path d={`M${x0} ${TOP + 3} H${x1}`} stroke={ROCK_LIT} strokeWidth={5} />
      {/* Its outline, open at the left while it still meets the rim there. */}
      <path d={edges ? outline : `M${x0} ${TOP} H${x1} ${bottom}`} fill="none" {...ink(OUT)} />
    </g>
  );
}

/** One slice of the arch broken off (lined all round), tumbling into the gorge. */
const Slice = memo(function Slice({ x0 }: { x0: number }) {
  const x1 = x0 + SLICE;
  const j = (k: number) => (noise(x0 + k, 3) - 0.5) * 12;
  const y0 = under(x0);
  const y1 = under(x1);
  const cx = x0 + SLICE / 2;
  // Drawn around its own middle so it can tumble.
  const d = `M${x0 - cx + j(1)} ${TOP} L${x1 - cx + j(2)} ${TOP} L${x1 - cx + j(3)} ${y1} L${x0 - cx + j(4)} ${y0} Z`;
  return (
    <g>
      <path d={d} fill={ROCK} {...ink(OUT)} {...NS} />
      <path d={`M${x0 - cx + 4} ${TOP + 4} H${x1 - cx - 4}`} stroke={ROCK_LIT} strokeWidth={4} />
      <path
        d={`M${x0 - cx + 6} ${(y0 + TOP) / 2} L${x1 - cx - 6} ${(y1 + TOP) / 2}`}
        stroke={P.bands[0]}
        strokeWidth={4}
        opacity={0.8}
      />
    </g>
  );
});

export function ArchBack(p: ObstacleProps) {
  const crack = since(p, 'crack');
  const slices: number[] = [];
  for (let x = A; x < B; x += SLICE) slices.push(x);
  const falls = slices.map((x) => p.t - fallAt(p, x));
  const firstUp = falls.findIndex((dt) => dt < 0);
  const x0 = firstUp < 0 ? B : slices[firstUp]!;
  return (
    <g>
      <Gorge a={A} b={B} />
      <Saguaro x={A - 160} y={-14} h={100} />
      <Saguaro x={B + 240} y={-14} h={80} flip />
      {x0 < B && <Span x0={x0} x1={B} edges={x0 > A} />}
      {/* Cracks spreading out from under his feet. */}
      {crack >= 0 && x0 < B && (
        <g
          stroke={shade(ROCK, 0.5)}
          strokeWidth={IN + 1}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {[0, 1, 2, 3, 4].map((i) => {
            const len = Math.min(1, crack / 400) * (30 + 26 * noise(i, 5));
            const x = Math.max(x0 + 10, p.heroX + (i - 2) * 60 + 14 * noise(i, 3));
            if (x > B - 20) return null;
            return (
              <path
                key={i}
                d={`M${x} ${TOP + 4} l${len * 0.3} ${len * 0.4} l${len * 0.3} -${len * 0.1} l${len * 0.2} ${len * 0.5}`}
              />
            );
          })}
        </g>
      )}
      {slices.map((x, i) => {
        const dt = falls[i]!;
        if (dt < 0) return null;
        const y = fallen(dt, 0.0026);
        if (y > 300) return null;
        return (
          <g key={x}>
            <g
              transform={`translate(${(x + SLICE / 2).toFixed(1)} ${y.toFixed(1)}) rotate(${((noise(i) - 0.5) * dt * 0.25).toFixed(1)})`}
              opacity={1 - clamp01((y - 200) / 100)}
            >
              <Slice x0={x} />
            </g>
            {i % 2 === 0 && <SandBurst x={x + SLICE / 2} y={-4} dt={dt} size={0.35} ms={600} />}
          </g>
        );
      })}
    </g>
  );
}
