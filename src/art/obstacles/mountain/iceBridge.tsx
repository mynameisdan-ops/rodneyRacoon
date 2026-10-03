import { memo } from 'react';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade } from '../../style';
import { clamp01, fallen, heroPasses, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { ICE, ICE_DEEP, ICE_LIGHT, NS, SNOW } from './kit';
import { ICE_BRIDGE } from './layout';
import { Crevasse, SnowBurst } from './parts';

// ---------- Level 29: ice bridge ----------
// crack (cracks spread under his feet) → shatter (the bridge breaks up behind him, piece by
// piece, never closer than `lag` behind him, as he slides across).

const PIECE = 50;
const TOP = -14;
const BOTTOM = 26;

/** When the piece of bridge starting at x falls: those behind him at once, the rest as he passes. */
function fallAt(p: ObstacleProps, x: number) {
  const shatterAt = eventTime(p.events, 'shatter');
  if (!Number.isFinite(shatterAt)) return Infinity;
  const [a] = ICE_BRIDGE.crevasse;
  const start = p.heroAt(shatterAt).x - ICE_BRIDGE.lag;
  if (x + PIECE <= start) return shatterAt + ((x - a) / Math.max(1, start - a)) * 300;
  return heroPasses(p, x + PIECE + ICE_BRIDGE.lag, shatterAt) + 60;
}

/** A stretch of bridge from x0 to x1 (lined): clear ice under a layer of snow, icicles below. */
function Slab({ x0, x1 }: { x0: number; x1: number }) {
  const w = x1 - x0;
  return (
    <g>
      <path
        d={`M${x0} ${TOP} H${x1} L${x1 - 4} ${BOTTOM} Q${(x0 + x1) / 2} ${BOTTOM + 8} ${x0 + 4} ${BOTTOM} Z`}
        fill={ICE}
        {...ink(OUT)}
        {...NS}
      />
      <path
        d={`M${x0} ${BOTTOM - 10} H${x1} L${x1 - 4} ${BOTTOM} Q${(x0 + x1) / 2} ${BOTTOM + 8} ${x0 + 4} ${BOTTOM} Z`}
        fill={ICE_DEEP}
        opacity={0.6}
      />
      <path
        d={`M${x0 + 6} ${TOP + 10} H${x1 - 6}`}
        stroke={ICE_LIGHT}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.9}
      />
      {w > 60 &&
        Array.from({ length: Math.floor(w / 90) }, (_, i) => {
          const x = x0 + 40 + i * 90 + 20 * noise(i, 4);
          return (
            <path
              key={i}
              d={`M${x} ${TOP + 16} l14 -4`}
              stroke="#ffffff"
              strokeWidth={2.4}
              strokeLinecap="round"
              opacity={0.85}
            />
          );
        })}
      <path
        d={`M${x0 - 2} ${TOP + 2} Q${x0 + w * 0.25} ${TOP - 8} ${x0 + w * 0.5} ${TOP - 4} Q${x0 + w * 0.75} ${TOP - 9} ${x1 + 2} ${TOP + 2} V${TOP + 6} H${x0 - 2} Z`}
        fill={SNOW}
      />
      <path
        d={`M${x0 - 2} ${TOP + 2} Q${x0 + w * 0.25} ${TOP - 8} ${x0 + w * 0.5} ${TOP - 4} Q${x0 + w * 0.75} ${TOP - 9} ${x1 + 2} ${TOP + 2}`}
        fill="none"
        stroke={INK}
        strokeWidth={IN}
        {...NS}
      />
    </g>
  );
}

/** The bridge's icicles from x0 to x1 (lined, small). */
function BridgeIcicles({ x0, x1 }: { x0: number; x1: number }) {
  let d = '';
  for (let x = x0 + 14; x < x1 - 8; x += 26) {
    const i = Math.round(x / 26);
    const len = 10 + 22 * noise(i, 6);
    d += `M${x - 5} ${BOTTOM + 2} L${x} ${BOTTOM + 2 + len} L${x + 5} ${BOTTOM + 2} Z`;
  }
  return <path d={d} fill={ICE_LIGHT} {...ink(IN)} {...NS} />;
}

/** One broken piece of the bridge, lined all round, tumbling down into the crevasse. */
const Piece = memo(function Piece({ i }: { i: number }) {
  const w = PIECE / 2;
  const j = (k: number) => (noise(i * 7 + k, 3) - 0.5) * 10;
  return (
    <g>
      <path
        d={`M${-w + j(1)} ${TOP} L${w + j(2)} ${TOP} L${w - 4 + j(3)} ${BOTTOM} L${-w + 4 + j(4)} ${BOTTOM + 4} Z`}
        fill={ICE}
        {...ink(OUT)}
        {...NS}
      />
      <path
        d={`M${-w + 4} ${BOTTOM - 8} L${w - 6} ${BOTTOM - 10} L${w - 4 + j(3)} ${BOTTOM} L${-w + 4 + j(4)} ${BOTTOM + 4} Z`}
        fill={ICE_DEEP}
        opacity={0.6}
      />
      <path
        d={`M${-w + j(1)} ${TOP} L${w + j(2)} ${TOP} L${w + j(2)} ${TOP + 7} L${-w + j(1)} ${TOP + 7} Z`}
        fill={SNOW}
      />
      <path
        d={`M${-w + 8} ${TOP + 12} H${w - 10}`}
        stroke={ICE_LIGHT}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
});

export function IceBridgeBack(p: ObstacleProps) {
  const [a, b] = ICE_BRIDGE.crevasse;
  const crack = since(p, 'crack');
  const pieces: number[] = [];
  for (let x = a; x < b; x += PIECE) pieces.push(x);
  const falls = pieces.map((x) => p.t - fallAt(p, x));
  // The bridge still standing: from the first piece that hasn't fallen to the far side.
  const firstUp = falls.findIndex((dt) => dt < 0);
  const x0 = firstUp < 0 ? b : pieces[firstUp]!;
  const heroLocal = p.heroX;
  return (
    <g>
      <Crevasse a={a} b={b} />
      {x0 < b && (
        <g>
          <BridgeIcicles x0={x0} x1={b} />
          <Slab x0={x0} x1={b + 30} />
          <path d={`M${x0} ${TOP + 2} L${x0} ${BOTTOM}`} stroke={INK} strokeWidth={OUT} />
        </g>
      )}
      {/* Cracks spreading out from under his feet. */}
      {crack >= 0 && x0 < b && (
        <g
          stroke={shade(ICE_DEEP, 0.4)}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const ox = (i - 2.5) * 70 + 20 * noise(i, 3);
            const len = Math.min(1, crack / 400) * (40 + 30 * noise(i, 5));
            const x = Math.max(x0 + 10, heroLocal + ox);
            if (x > b - 20) return null;
            return (
              <path
                key={i}
                d={`M${x} ${TOP + 6} l${len * 0.4} ${len * 0.25} l${len * 0.3} -${len * 0.12} l${len * 0.5} ${len * 0.3}`}
              />
            );
          })}
        </g>
      )}
      {pieces.map((x, i) => {
        const dt = falls[i]!;
        if (dt < 0) return null;
        const y = fallen(dt, 0.0026);
        if (y > 280) return null;
        return (
          <g key={x}>
            <g
              transform={`translate(${(x + PIECE / 2).toFixed(1)} ${y.toFixed(1)}) rotate(${((noise(i) - 0.5) * dt * 0.3).toFixed(1)})`}
              opacity={1 - clamp01((y - 180) / 100)}
            >
              <Piece i={i} />
            </g>
            {i % 3 === 0 && <SnowBurst x={x + PIECE / 2} y={-6} dt={dt} size={0.3} ms={500} />}
          </g>
        );
      })}
    </g>
  );
}
