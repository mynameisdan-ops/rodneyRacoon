import { useEffect, useState, type ReactNode } from 'react';

export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 800;

function fitScale() {
  return Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
}

/** A fixed 1280×800 design canvas, scaled to fit and centered in the window. */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(fitScale);
  const [portrait, setPortrait] = useState(() => window.innerHeight > window.innerWidth);

  useEffect(() => {
    const onResize = () => {
      setScale(fitScale());
      setPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="viewport">
      <div
        className="stage"
        style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, transform: `scale(${scale})` }}
      >
        {children}
      </div>
      {portrait && (
        <div className="rotate-hint">
          <div className="rotate-hint__icon" aria-hidden>
            ⟳
          </div>
          <div>Turn your tablet sideways</div>
        </div>
      )}
    </div>
  );
}
