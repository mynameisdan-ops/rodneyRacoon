// Draws the app icons into public/ from the dev page #icon-<shape>-<size> with headless Chrome
// (or Edge). Run the dev server first, then: npm run icons [-- http://localhost:5173/]
// Set CHROME to the browser's path if it isn't found.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const base = process.argv[2] ?? 'http://localhost:5173/';
const browsers = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];
const chrome = browsers.find((path) => path && existsSync(path));
if (!chrome) throw new Error('No Chrome or Edge found: set CHROME to its path.');

// [file, shape, size]: "round" has its own rounded shape; "full" is edge to edge with a safe
// zone, for Android's maskable icon and Apple's touch icon (they cut their own shape).
const icons = [
  ['icon-192.png', 'round', 192],
  ['icon-512.png', 'round', 512],
  ['icon-maskable-512.png', 'full', 512],
  ['apple-touch-icon.png', 'full', 180],
  ['favicon-64.png', 'round', 64],
];

for (const [file, shape, size] of icons) {
  const out = resolve('public', file);
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    '--virtual-time-budget=4000',
    `--window-size=${size},${size}`,
    `--screenshot=${out}`,
    `${base}?icon=${Date.now()}#icon-${shape}-${size}`,
  ]);
  console.log(`${file} (${size}×${size}, ${shape})`);
}
