import { useEffect, useRef, useState, type ReactNode } from 'react';

export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 800;

/** A fixed 1280×800 design canvas, scaled to fit and centered in the window. */
export function Stage({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(() =>
    window.innerWidth > 0 && window.innerHeight > 0
      ? { w: window.innerWidth, h: window.innerHeight }
      : { w: DESIGN_WIDTH, h: DESIGN_HEIGHT },
  );

  // Measure the viewport element itself rather than listening for window resizes: a window
  // that starts with no size (a background tab, an app launching) reports 0×0 at first and
  // doesn't always send a resize event once it gets its real size.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(size.w / DESIGN_WIDTH, size.h / DESIGN_HEIGHT);
  const portrait = size.h > size.w;

  return (
    <div className="viewport" ref={viewportRef}>
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
