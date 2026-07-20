// Copy the freshly-built Chrome extension to ./unpacked — a stable path you can
// point Chrome's "Load unpacked" at once, then just hit reload after rebuilds.
// Run via `pnpm install-local` (which builds first). See scripts in package.json.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const src = resolve('.output/chrome-mv3');
const dest = resolve('unpacked');

if (!existsSync(src)) {
  console.error(`\n✗ Build output not found at ${src}\n  Run \`pnpm build\` first.\n`);
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });

console.log(`\n✔ easyhn built and copied to:\n\n    ${dest}\n`);
console.log('First time — load it in Chrome:');
console.log('  1. Open chrome://extensions');
console.log('  2. Turn on "Developer mode" (top-right)');
console.log('  3. Click "Load unpacked" and pick the folder above\n');
console.log('After future runs, just click the reload icon on the easyhn card.\n');
