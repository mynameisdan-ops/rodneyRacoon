import { useSyncExternalStore } from 'react';

/**
 * Installing the app from inside it. Chrome and Edge offer an install prompt
 * (`beforeinstallprompt`); we keep it so Settings can show an "Install" button. Elsewhere the
 * browser's own menu installs it. The service worker itself is registered by vite-plugin-pwa
 * (a new version takes over on the next launch, never in the middle of a page).
 */

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallState = 'installed' | 'ready' | 'unavailable';

let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function runningInstalled(): boolean {
  return ['fullscreen', 'standalone', 'minimal-ui'].some(
    (mode) => window.matchMedia(`(display-mode: ${mode})`).matches,
  );
}

/** Starts listening for the browser's install prompt (call once, early). */
export function watchInstall(): void {
  installed = runningInstalled();
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Show our own button instead of the browser's mini-bar.
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    notify();
  });
}

function state(): InstallState {
  return installed ? 'installed' : deferred ? 'ready' : 'unavailable';
}

export function useInstallState(): InstallState {
  return useSyncExternalStore((l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  }, state);
}

/** Shows the browser's install dialog (only while `useInstallState()` is 'ready'). */
export async function install(): Promise<void> {
  const e = deferred;
  if (!e) return;
  // A prompt can be shown once; the browser offers a new one later if it's dismissed.
  deferred = null;
  notify();
  await e.prompt();
}
