import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Stage } from './ui/Stage';
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
} else {
  render(<App />);
}
