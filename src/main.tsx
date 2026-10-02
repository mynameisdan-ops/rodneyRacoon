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

if (import.meta.env.DEV && location.hash.startsWith('#gallery')) {
  // Dev-only art gallery; dropped from production builds. #gallery-gear shows one section.
  const section = location.hash.slice('#gallery-'.length) || undefined;
  void import('./screens/ArtGallery').then(({ ArtGallery }) =>
    render(
      <Stage>
        <ArtGallery section={section} />
      </Stage>,
    ),
  );
} else if (import.meta.env.DEV && location.hash.startsWith('#strip')) {
  // Dev-only: the page strip playing a page of answers by itself; #strip-combo-300 holds a moment.
  const [, kind, dt] = location.hash.split('-');
  void import('./screens/StripDemo').then(({ StripDemo }) =>
    render(
      <Stage>
        <StripDemo still={kind ? { kind, dt: Number(dt ?? 0) } : undefined} />
      </Stage>,
    ),
  );
} else if (import.meta.env.DEV && location.hash.startsWith('#scene-')) {
  // Dev-only: a level's cut scene in the scrubber (#scene-12), or one frame of it at a moment of
  // real time without the controls (#scene-12-2600, for screenshots).
  const [level, still] = location.hash.split('-').slice(1).map(Number);
  void Promise.all([import('./screens/ScenePreview'), import('./content/levels')]).then(
    ([{ ScenePreview }, { getLevel }]) =>
      render(
        <Stage>
          <ScenePreview
            level={getLevel(level ?? 1)!}
            still={still}
            onClose={() => (location.hash = '#gallery')}
          />
        </Stage>,
      ),
  );
} else if (import.meta.env.DEV && location.hash.startsWith('#moments')) {
  // Dev-only contact sheet for picking sticker moments, e.g. #moments-1-4.
  const [from = 1, to = from] = location.hash.split('-').slice(1).map(Number);
  void import('./screens/ArtGallery').then(({ StickerMoments }) =>
    render(<StickerMoments from={from} to={to} />),
  );
} else {
  render(<App />);
}
