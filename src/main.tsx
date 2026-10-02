import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Stage } from './ui/Stage';
import '@fontsource/lilita-one/latin-400.css';
import './styles.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element');
const root = createRoot(rootEl);
const render = (node: ReactNode) => root.render(<StrictMode>{node}</StrictMode>);

if (import.meta.env.DEV && location.hash === '#gallery') {
  // Dev-only art gallery; dropped from production builds.
  void import('./screens/ArtGallery').then(({ ArtGallery }) =>
    render(
      <Stage>
        <ArtGallery />
      </Stage>,
    ),
  );
} else if (import.meta.env.DEV && location.hash.startsWith('#style')) {
  // Dev-only M7b style test: the current art next to the proposed cartoon look.
  // #style-faces, #style-poses ... show one section (for screenshots).
  const [, view, mode, still] = location.hash.split('-');
  if (view === 'page') {
    void import('./screens/StylePageDemo').then(({ StylePageDemo }) =>
      render(
        <Stage>
          <StylePageDemo still={mode ? { kind: mode, dt: Number(still ?? 0) } : undefined} />
        </Stage>,
      ),
    );
  } else if (view === 'scene') {
    void import('./screens/StyleTestScene').then(({ StyleTestScene }) =>
      render(
        <Stage>
          <StyleTestScene
            initial={mode === 'now' || mode === 'v1' ? mode : 'dynamic'}
            still={still === undefined ? undefined : Number(still)}
          />
        </Stage>,
      ),
    );
  } else {
    void import('./screens/StyleTest').then(({ StyleTest }) =>
      render(
        <Stage>
          <StyleTest view={view} />
        </Stage>,
      ),
    );
  }
} else if (import.meta.env.DEV && location.hash.startsWith('#moments')) {
  // Dev-only contact sheet for picking sticker moments, e.g. #moments-1-4.
  const [from = 1, to = from] = location.hash.split('-').slice(1).map(Number);
  void import('./screens/ArtGallery').then(({ StickerMoments }) =>
    render(<StickerMoments from={from} to={to} />),
  );
} else {
  render(<App />);
}
