export interface DebrisPiece {
  vx: number;
  vy: number;
  spin: number;
  size: number;
  y0: number;
}

/** Deterministic pieces for a `Debris` burst. */
export function debrisPieces(seed: number, count: number): DebrisPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const h = Math.sin(seed * 97.3 + i * 12.9898) * 43758.5453;
    const r = h - Math.floor(h);
    const h2 = Math.sin(seed * 31.7 + i * 78.233) * 12345.678;
    const r2 = h2 - Math.floor(h2);
    return {
      vx: 0.15 + r * 0.55,
      vy: -(0.35 + r2 * 0.6),
      spin: (r - 0.5) * 1.2,
      size: 10 + Math.round(r2 * 16),
      y0: -40 - Math.round(r * 300),
    };
  });
}
