// Generates every raster the ghost mark needs, from one path definition.
//
//   node scripts/gen-icons.mjs
//
// Writes public/icon/{16,32,48,128}.png (the extension icons declared in
// wxt.config.ts) and landing/public/icon.{svg,png}.
//
// The ghost reads as cloth rather than as an arcade ghost because of a bell
// taper, unequal hem folds and small flat eyes. Symmetrise any of the three and
// it turns into Pac-Man.

import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// sharp is a landing/ devDependency, not a root one — resolve it from there.
const require = createRequire(resolve(root, 'landing/package.json'));
let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('sharp not found — run `npm install` inside landing/ first.');
  process.exit(1);
}

/* ---- Geometry -------------------------------------------------------------
 * Authored in a 0–64 box. The body sits at x9–57.8 / y4–55, off centre, so it
 * is drawn inside a group that nudges it back to the middle: some surfaces crop
 * an icon to its bounding box and others centre it, and this way both look
 * right. Re-derive NUDGE if the path changes.
 *
 * Hem control points sit directly above/below their endpoints, giving every tip
 * and notch a horizontal tangent. Lose that and the folds read as scalloped
 * trim. */
const NUDGE = 'translate(-1.4 2.5)';

const BODY = [
  'M32 4',
  'C44.4 4 54.2 15.6 55.4 30.4', //         right shoulder
  'C56 37.4 57.4 43 57.8 47.6', //          right side, flaring out
  'C53.65 47.6 53.65 54.2 49.5 54.2', //    hem: first fold
  'C45.5 54.2 45.5 48.8 41.5 48.8', //      notch
  'C36.75 48.8 36.75 55 32 55', //          second fold — the deepest
  'C27.5 55 27.5 48.4 23 48.4', //          notch
  'C19.25 48.4 19.25 53.4 15.5 53.4', //    third fold, shallower and narrower
  'C13.15 53.4 13.15 48.2 10.8 48.2', //    hem tucks up into the left side
  'C10.2 42.4 9.2 36.6 9 30.4', //          left side
  'C10.2 15.6 19.6 4 32 4Z', //             left shoulder
].join(' ');

// Tilted a few degrees outward. Upright ovals read as a printed face; the tilt
// is what makes it look drawn.
const EYES = `
    <ellipse cx="26.7" cy="27.6" rx="3.5" ry="4.7" transform="rotate(-8 26.7 27.6)" fill="EYE"/>
    <ellipse cx="40.2" cy="27.6" rx="3.5" ry="4.7" transform="rotate(8 40.2 27.6)" fill="EYE"/>`;

/* ---- Colour ----------------------------------------------------------------
 * #c95000 is the brand accent and carries the mark on paper. On its own it
 * muddies against dark browser chrome, so the body is lit from the top-left
 * with #ff6600 — the same two-orange system the landing tokens already use. */
const LIT = `
    <linearGradient id="lit" x1="0.1" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="#ff6600"/>
      <stop offset="0.55" stop-color="#dd5a00"/>
      <stop offset="1" stop-color="#c95000"/>
    </linearGradient>`;

const EYE_COLOR = '#faf9f7';

function ghostSvg({ size } = {}) {
  const dims = size ? ` width="${size}" height="${size}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"${dims}>
  <defs>${LIT}
  </defs>
  <g transform="${NUDGE}">
    <path d="${BODY}" fill="url(#lit)"/>${EYES.replaceAll('EYE', EYE_COLOR)}
  </g>
</svg>
`;
}

/* ---- Emit ---------------------------------------------------------------- */
const master = ghostSvg();

mkdirSync(resolve(root, 'public/icon'), { recursive: true });
mkdirSync(resolve(root, 'landing/public'), { recursive: true });

writeFileSync(resolve(root, 'landing/public/icon.svg'), master);
console.log('landing/public/icon.svg');

// Each PNG comes from an SVG already carrying its target width/height, so the
// rasteriser hints the curves for the pixel grid it actually lands on.
async function png(path, size) {
  const buf = await sharp(Buffer.from(ghostSvg({ size })), { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(resolve(root, path), buf);
  console.log(`${path}  ${size}×${size}  ${(buf.length / 1024).toFixed(1)}KB`);
}

for (const size of [16, 32, 48, 128]) await png(`public/icon/${size}.png`, size);
await png('landing/public/icon.png', 128);
