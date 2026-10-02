import { useId, useMemo } from 'react';
import { createRng } from '../../game/rng';
import { shade, tint } from '../style';
import { ridgePath, useGroundBits, useSpots, W, type LayerProps } from '../worlds/sceneryKit';
import type { ForestTheme } from '../worlds/themes';
import { PAINTED_FOREST } from './paintedPalette';

/*
 * The Whispering Forest, painted (M7b style test). Backgrounds in a Saturday-morning cartoon are
 * painted rather than outlined: soft gradients, fog between the rows of trees, light falling
 * through the canopy, and only the hero and the props he touches get ink lines. Gradients are
 * plain SVG paint (no `filter`). Same layer slots and tiling rules as the flat forest.
 */

type P = LayerProps<ForestTheme>;

const C = PAINTED_FOREST;

const canopyDepth = (horizon: number) => Math.max(18, horizon * 0.32);

/** The canopy overhead, a glow of sun through the leaves, and shafts of light. */
export function PaintedCanopy({ horizon, height, k, seed }: P) {
  const id = useId();
  const depth = canopyDepth(horizon);
  const blobs = useSpots(seed * 17, 16, 0);
  const shafts = useSpots(seed * 29, 5, 100);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}shaft`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.light} stopOpacity={0.5} />
          <stop offset="0.7" stopColor={C.light} stopOpacity={0.12} />
          <stop offset="1" stopColor={C.light} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}sun`}>
          <stop offset="0" stopColor={C.light} stopOpacity={0.75} />
          <stop offset="1" stopColor={C.light} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={W * 0.62} cy={horizon * 0.7} rx={420 * k} ry={260 * k} fill={`url(#${id}sun)`} />
      {shafts.map((s, i) => (
        <path
          key={i}
          d={`M${s.x} ${depth * 0.5} L${s.x + (40 + s.r * 50) * k} ${depth * 0.5} L${s.x + (250 + s.r2 * 120) * k} ${height} L${s.x + (110 + s.r2 * 60) * k} ${height} Z`}
          fill={`url(#${id}shaft)`}
        />
      ))}
      <rect x={0} y={0} width={W} height={depth * 0.6} fill={C.canopyDark} />
      <g fill={C.canopyDark}>
        {blobs.map((b, i) => (
          <circle key={i} cx={b.x} cy={depth * (0.6 + b.r * 0.4)} r={(42 + b.r2 * 44) * k} />
        ))}
        <circle cx={0} cy={depth * 0.75} r={48 * k} />
        <circle cx={W} cy={depth * 0.75} r={48 * k} />
      </g>
      <g fill={C.canopy}>
        {blobs.map((b, i) => (
          <circle
            key={i}
            cx={b.x + 8 * k}
            cy={depth * (0.5 + b.r * 0.35)}
            r={(30 + b.r2 * 30) * k}
          />
        ))}
      </g>
      <g fill={C.canopyLight}>
        {blobs
          .filter((_, i) => i % 2 === 0)
          .map((b, i) => (
            <circle
              key={i}
              cx={b.x + 18 * k}
              cy={depth * (0.38 + b.r * 0.3)}
              r={(16 + b.r2 * 14) * k}
            />
          ))}
      </g>
      <g fill={C.canopyRim} opacity={0.55}>
        {blobs
          .filter((_, i) => i % 3 === 0)
          .map((b, i) => (
            <circle key={i} cx={b.x + 24 * k} cy={depth * (0.3 + b.r * 0.3)} r={7 * k} />
          ))}
      </g>
      {/* Hanging vines with a few leaves. */}
      {blobs
        .filter((_, i) => i % 4 === 1)
        .map((b, i) => {
          const len = (80 + b.r * 90) * k;
          const top = depth * 0.85;
          return (
            <g key={i}>
              <path
                d={`M${b.x} ${top} q ${12 * k} ${len * 0.5} ${-5 * k} ${len}`}
                stroke={shade(C.canopyLight, 0.25)}
                strokeWidth={4 * k}
                fill="none"
                strokeLinecap="round"
              />
              {[0.35, 0.6, 0.85].map((f) => (
                <ellipse
                  key={f}
                  cx={b.x + 5 * k}
                  cy={top + len * f}
                  rx={7 * k}
                  ry={3.5 * k}
                  fill={C.canopyLight}
                  transform={`rotate(${f * 120 - 50} ${b.x + 5 * k} ${top + len * f})`}
                />
              ))}
            </g>
          );
        })}
    </g>
  );
}

/** Rows of trees fading into the fog, palest farthest away. */
export function PaintedFar({ horizon, height, k, seed }: P) {
  const id = useId();
  const rows = useMemo(() => {
    const rng = createRng(seed * 131);
    return [0, 1, 2].map((row) => {
      const trees: { x: number; h: number; pine: boolean }[] = [];
      for (let x = 20 + row * 30; x < W - 30; x += rng.int(50, 90)) {
        trees.push({ x, h: rng.int(70, 140) * (1 + row * 0.25), pine: rng.next() < 0.5 });
      }
      return trees;
    });
  }, [seed]);
  return (
    <g>
      <defs>
        {C.rows.map((color, row) => (
          <linearGradient key={row} id={`${id}r${row}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} />
            <stop offset="1" stopColor={C.mist} />
          </linearGradient>
        ))}
        <linearGradient id={`${id}fog`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.mist} stopOpacity={0} />
          <stop offset="0.6" stopColor={C.mist} stopOpacity={0.7} />
          <stop offset="1" stopColor={C.mist} stopOpacity={0} />
        </linearGradient>
      </defs>
      {rows.map((trees, row) => {
        const base = horizon + row * 22 * k;
        return (
          <g key={row}>
            <g fill={`url(#${id}r${row})`}>
              <rect x={0} y={base - 6} width={W} height={height - base + 6} fill={C.rows[row]} />
              {trees.map((t, i) =>
                t.pine ? (
                  <path
                    key={i}
                    d={`M${t.x - 24 * k} ${base} L${t.x - 14 * k} ${base - t.h * 0.5 * k} L${t.x - 20 * k} ${base - t.h * 0.5 * k} L${t.x} ${base - t.h * k} L${t.x + 20 * k} ${base - t.h * 0.5 * k} L${t.x + 14 * k} ${base - t.h * 0.5 * k} L${t.x + 24 * k} ${base} Z`}
                  />
                ) : (
                  <g key={i}>
                    <circle cx={t.x} cy={base - t.h * 0.66 * k} r={t.h * 0.3 * k} />
                    <circle
                      cx={t.x - t.h * 0.2 * k}
                      cy={base - t.h * 0.48 * k}
                      r={t.h * 0.24 * k}
                    />
                    <circle
                      cx={t.x + t.h * 0.22 * k}
                      cy={base - t.h * 0.5 * k}
                      r={t.h * 0.25 * k}
                    />
                    <rect
                      x={t.x - 4 * k}
                      y={base - t.h * 0.4 * k}
                      width={8 * k}
                      height={t.h * 0.4 * k}
                    />
                  </g>
                ),
              )}
            </g>
            <rect x={0} y={base - 50 * k} width={W} height={80 * k} fill={`url(#${id}fog)`} />
          </g>
        );
      })}
    </g>
  );
}

/** Big painted trunks with moss and roots, leafy branches, mushrooms and fireflies. */
export function PaintedMid({ horizon, groundTop, height, k, seed }: P) {
  const id = useId();
  const base = horizon + (groundTop - horizon) * 0.55;
  const trunks = useSpots(seed * 211, 5, 70);
  const flies = useSpots(seed * 223, 10, 30);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}bark`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.trunkDark} />
          <stop offset="0.45" stopColor={C.trunk} />
          <stop offset="0.82" stopColor={C.trunk} />
          <stop offset="0.93" stopColor={C.trunkLight} />
          <stop offset="1" stopColor={C.trunk} />
        </linearGradient>
        <linearGradient id={`${id}ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(C.ground, 0.15)} />
          <stop offset="1" stopColor={C.groundDark} />
        </linearGradient>
        <linearGradient id={`${id}moss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint(C.moss, 0.3)} />
          <stop offset="1" stopColor={shade(C.moss, 0.3)} />
        </linearGradient>
        <radialGradient id={`${id}fly`}>
          <stop offset="0" stopColor={C.firefly} stopOpacity={0.9} />
          <stop offset="0.25" stopColor={C.firefly} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.firefly} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={ridgePath(seed * 5, base, 8 * k, 160, height, true)} fill={`url(#${id}ground)`} />
      {trunks.map((t, i) => {
        const w = (38 + t.r * 26) * k;
        const flip = t.r < 0.5 ? -1 : 1;
        return (
          <g key={i}>
            <path
              d={`M${t.x - w / 2} -10 L${t.x - w / 2} ${base - 24 * k} Q${t.x - w / 2} ${base} ${t.x - w * 1.05} ${base + 5 * k} L${t.x + w * 1.05} ${base + 5 * k} Q${t.x + w / 2} ${base} ${t.x + w / 2} ${base - 24 * k} L${t.x + w / 2} -10 Z`}
              fill={`url(#${id}bark)`}
            />
            {/* Bark grooves and a knot. */}
            <g
              stroke={C.trunkDark}
              strokeWidth={2.5 * k}
              strokeLinecap="round"
              fill="none"
              opacity={0.6}
            >
              <path
                d={`M${t.x - w * 0.22} ${horizon * 0.35} q ${-4 * k} ${50 * k} ${2 * k} ${100 * k}`}
              />
              <path
                d={`M${t.x + w * 0.08} ${horizon * 0.8} q ${3 * k} ${40 * k} ${-2 * k} ${80 * k}`}
              />
              <path
                d={`M${t.x - w * 0.05} ${base - 60 * k} q ${-3 * k} ${20 * k} ${0} ${40 * k}`}
              />
            </g>
            {t.r2 < 0.45 && (
              <g>
                <ellipse
                  cx={t.x - w * 0.08}
                  cy={base - 70 * k}
                  rx={w * 0.2}
                  ry={15 * k}
                  fill={C.trunkDark}
                />
                <ellipse
                  cx={t.x - w * 0.04}
                  cy={base - 66 * k}
                  rx={w * 0.13}
                  ry={9 * k}
                  fill="#1a0f0a"
                />
              </g>
            )}
            {/* Moss climbing from the roots. */}
            <path
              d={`M${t.x - w * 1.05} ${base + 5 * k} Q${t.x - w * 0.6} ${base - 30 * k} ${t.x - w * 0.5} ${base - 58 * k} Q${t.x - w * 0.3} ${base - 40 * k} ${t.x - w * 0.1} ${base - 30 * k} Q${t.x + w * 0.2} ${base - 10 * k} ${t.x + w * 0.1} ${base + 5 * k} Z`}
              fill={`url(#${id}moss)`}
            />
            {/* A leafy branch reaching out, lit from above. */}
            <g transform={`translate(${t.x} ${horizon * 0.62}) scale(${flip * k} ${k})`}>
              <path
                d="M0 0 Q40 -4 74 -30"
                stroke={C.trunk}
                strokeWidth={10}
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M0 -3 Q40 -7 74 -33"
                stroke={C.trunkLight}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                opacity={0.7}
              />
              <g fill={C.canopy}>
                <circle cx={64} cy={-38} r={28} />
                <circle cx={96} cy={-28} r={24} />
                <circle cx={80} cy={-60} r={22} />
              </g>
              <g fill={C.canopyLight}>
                <circle cx={70} cy={-50} r={16} />
                <circle cx={98} cy={-36} r={12} />
                <circle cx={84} cy={-66} r={12} />
              </g>
              <g fill={C.canopyRim} opacity={0.7}>
                <circle cx={78} cy={-56} r={6} />
                <circle cx={102} cy={-40} r={5} />
              </g>
            </g>
            {/* Mushrooms at the roots. */}
            <g transform={`translate(${t.x + w * 0.95} ${base + 3 * k}) scale(${k})`}>
              <rect x={-4} y={-14} width={8} height={14} rx={3} fill="#f3e6cf" />
              <rect x={-4} y={-14} width={3} height={14} rx={1.5} fill="#cdbb9e" />
              <path d="M-15 -11 Q0 -34 15 -11 Z" fill={C.mushroom} />
              <path d="M-15 -11 Q-8 -24 0 -27 Q-6 -20 -8 -11 Z" fill={shade(C.mushroom, 0.25)} />
              <circle cx={-3} cy={-21} r={2.6} fill="#fff" />
              <circle cx={6} cy={-17} r={2} fill="#fff" />
            </g>
          </g>
        );
      })}
      {flies.map((f, i) => (
        <circle
          key={i}
          cx={f.x}
          cy={horizon * (0.7 + f.r * 0.6)}
          r={(10 + f.r2 * 8) * k}
          fill={`url(#${id}fly)`}
        />
      ))}
    </g>
  );
}

/** The forest floor: dappled light, the path, ferns, grass and flowers. */
export function PaintedNear({ groundTop, height, pathY, k, seed }: P) {
  const id = useId();
  const bits = useGroundBits(seed * 307, groundTop, height, pathY, k);
  const dapples = useSpots(seed * 331, 9, 40);
  const g = groundTop;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.groundTop} />
          <stop offset={Math.min(1, 40 / Math.max(1, height - g))} stopColor={C.ground} />
          <stop offset="1" stopColor={C.groundDark} />
        </linearGradient>
        <linearGradient id={`${id}path`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.pathLight} />
          <stop offset="0.5" stopColor={C.path} />
          <stop offset="1" stopColor={shade(C.path, 0.25)} />
        </linearGradient>
        <radialGradient id={`${id}dapple`}>
          <stop offset="0" stopColor={C.light} stopOpacity={0.55} />
          <stop offset="1" stopColor={C.light} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path
        d={`M0 ${g} Q 320 ${g - 12 * k} 640 ${g} T ${W} ${g} V ${height} H 0 Z`}
        fill={`url(#${id}g)`}
      />
      {pathY !== undefined && (
        <g>
          <path d={`M0 ${pathY - 15 * k} H${W} V${pathY + 15 * k} H0 Z`} fill={`url(#${id}path)`} />
          <path
            d={`M0 ${pathY + 13 * k} H${W} V${pathY + 17 * k} H0 Z`}
            fill={C.pathEdge}
            opacity={0.55}
          />
          {Array.from({ length: 16 }, (_, i) => (
            <g key={i}>
              <ellipse
                cx={i * 80 + 30}
                cy={pathY + ((i % 3) - 1) * 6 * k}
                rx={5 * k}
                ry={3 * k}
                fill={C.pathEdge}
              />
              <ellipse
                cx={i * 80 + 29}
                cy={pathY + ((i % 3) - 1) * 6 * k - 1.2 * k}
                rx={2.6 * k}
                ry={1.3 * k}
                fill={C.pathLight}
              />
            </g>
          ))}
        </g>
      )}
      {dapples.map((d, i) => (
        <ellipse
          key={i}
          cx={d.x}
          cy={g + (height - g) * (0.15 + d.r * 0.75)}
          rx={(50 + d.r2 * 40) * k}
          ry={(12 + d.r2 * 8) * k}
          fill={`url(#${id}dapple)`}
        />
      ))}
      {bits.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          {b.kind < 0.35 ? (
            <Fern />
          ) : b.kind < 0.75 ? (
            <Grass />
          ) : (
            <Flower color={C.flowers[i % 3]!} />
          )}
        </g>
      ))}
    </g>
  );
}

function Fern() {
  return (
    <g>
      <path d="M0 0 Q-22 -10 -38 -6 Q-20 -22 0 -6 Z" fill={C.fern} />
      <path d="M0 0 Q22 -12 38 -9 Q18 -26 0 -6 Z" fill={C.fern} />
      <path d="M0 0 Q-5 -26 4 -38 Q7 -18 3 0 Z" fill={C.fernLight} />
      <path d="M2 -5 Q16 -18 34 -10" stroke={C.fernLight} strokeWidth={1.6} fill="none" />
    </g>
  );
}

function Grass() {
  return (
    <g>
      <path d="M-10 0 Q-9 -10 -14 -18 Q-5 -10 -4 0 Z" fill={C.fern} />
      <path d="M-3 0 Q-2 -14 1 -24 Q4 -12 3 0 Z" fill={C.fernLight} />
      <path d="M4 0 Q7 -10 13 -16 Q9 -6 10 0 Z" fill={C.fern} />
    </g>
  );
}

function Flower({ color }: { color: string }) {
  return (
    <g>
      <path d="M0 0 V -12" stroke={C.fern} strokeWidth={2.5} />
      <circle cx={0} cy={-15} r={5.5} fill={color} />
      <circle cx={-1.5} cy={-16.5} r={2} fill="#fff" opacity={0.6} />
      <circle cx={0} cy={-15} r={2} fill="#f5b700" />
    </g>
  );
}
