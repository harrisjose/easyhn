// Renders landing/public/og.png — the 1200×630 card shown when the site is
// shared.
//
//   node scripts/gen-og.mjs
//
// Satori lays the card out and outlines the text, sharp rasterises. No browser,
// so it runs the same on a laptop and in CI.
//
// Being JS rather than HTML, the card can't read the site's stylesheet; the
// values it borrows are pinned in TOKENS below. Keep them in step with
// landing/tokens.css.

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const landing = resolve(root, 'landing');
const require = createRequire(resolve(landing, 'package.json'));

let satori, sharp, wawoff2;
try {
  // Resolved from landing/node_modules, not imported by name: this script lives
  // at the repo root where these aren't installed. satori's CJS build puts the
  // function on .default.
  satori = require('satori').default;
  sharp = require('sharp');
  wawoff2 = require('wawoff2');
} catch {
  console.error('Missing deps — run `npm install` inside landing/ first.');
  process.exit(1);
}

/* ---- Borrowed from landing/tokens.css ---------------------------------- */
const TOKENS = {
  paper: '#faf9f7',
  ink: '#17181a',
  inkFaint: '#707278',
  accentStrong: '#e35400', // display-size accent text
  accentText: '#b34700', //   small accent text
  accentLine: 'rgba(255, 102, 0, 0.45)',
};

/* Satori reads TTF/OTF/WOFF but not WOFF2, which is all the site ships. */
async function face(file, name, weight = 400) {
  const woff2 = readFileSync(resolve(landing, 'public/fonts', file));
  return { name, weight, style: 'normal', data: Buffer.from(await wawoff2.decompress(woff2)) };
}

const fonts = [
  await face('instrument-serif-400.woff2', 'Instrument Serif'),
  await face('jetbrains-mono-400.woff2', 'JetBrains Mono'),
];

// Satori rasterises SVG data URIs itself, so the mark stays vector until the
// final resize.
const ghost = `data:image/svg+xml;base64,${readFileSync(
  resolve(landing, 'public/icon.svg'),
).toString('base64')}`;

/* ---- Card ----------------------------------------------------------------
 * Satori is flexbox-only: anything holding more than one child needs an
 * explicit display:flex. */
const h = (style, children) => ({ type: 'div', props: { style, children } });

const serif = { fontFamily: 'Instrument Serif', color: TOKENS.ink };

const card = h(
  {
    // Fills whatever canvas satori is given; the size is set once, at the
    // satori() call. Pinning px here leaves the rest of the canvas transparent.
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '68px 88px 52px',
    backgroundColor: TOKENS.paper,
    // The page's warm top wash, a shade stronger: it has to still register in a
    // ~500px-wide timeline thumbnail.
    backgroundImage:
      'radial-gradient(120% 68% at 50% 0%, rgba(255, 102, 0, 0.10), rgba(255, 102, 0, 0) 64%)',
  },
  [
    // Mark — the headline already carries the product name.
    { type: 'img', props: { src: ghost, width: 72, height: 72 } },

    // Headline
    h(
      {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 0.92,
        letterSpacing: '0.002em',
      },
      [
        h({ ...serif, fontSize: 116 }, 'Easy'),
        h(
          {
            fontFamily: 'Instrument Serif',
            fontSize: 78,
            color: TOKENS.accentStrong,
            marginTop: 12,
          },
          'for Hacker News',
        ),
      ],
    ),

    // Action and trust points
    h(
      {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
      [
        h(
          {
            display: 'flex',
            alignItems: 'center',
            padding: '15px 28px',
            borderRadius: 999,
            backgroundColor: TOKENS.ink,
            color: '#ffffff',
            fontFamily: 'JetBrains Mono',
            fontSize: 19,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          },
          'Add to Chrome',
        ),
        h(
          {
            display: 'flex',
            alignItems: 'center',
            marginTop: 18,
            fontFamily: 'JetBrains Mono',
            fontSize: 17,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: TOKENS.inkFaint,
          },
          'Free & open source',
        ),
      ],
    ),
  ],
);

/* ---- Emit ----------------------------------------------------------------
 * PNG, not JPEG: flat colour plus one very gradual wash is the case JPEG puts
 * visible contour rings through, and PNG encodes it smaller here regardless. */
const svg = await satori(card, { width: 1200, height: 630, fonts });

// 2x (density 144 against satori's 72dpi) then downsampled: the serif's thin
// strokes break up if rasterised straight to final size.
const buf = await sharp(Buffer.from(svg), { density: 144 })
  .resize(1200, 630)
  .flatten({ background: TOKENS.paper }) // the card's own padding is transparent otherwise
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(resolve(landing, 'public/og.png'), buf);
console.log(`landing/public/og.png  1200×630  ${(buf.length / 1024).toFixed(1)}KB`);
