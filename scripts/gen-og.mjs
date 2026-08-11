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
  inkFaint: '#8a8c92',
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
    padding: '76px 88px 66px',
    backgroundColor: TOKENS.paper,
    // The page's warm top wash, a shade stronger: it has to still register in a
    // ~500px-wide timeline thumbnail.
    backgroundImage:
      'radial-gradient(120% 68% at 50% 0%, rgba(255, 102, 0, 0.10), rgba(255, 102, 0, 0) 64%)',
  },
  [
    // Lockup
    h({ display: 'flex', alignItems: 'center' }, [
      { type: 'img', props: { src: ghost, width: 62, height: 62 } },
      h({ ...serif, fontSize: 46, letterSpacing: '0.006em', marginLeft: 16 }, 'easy'),
    ]),

    // Headline
    h(
      {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: 96,
        lineHeight: 0.98,
        letterSpacing: '0.002em',
      },
      [
        h(serif, 'Hacker News,'),
        h({ fontFamily: 'Instrument Serif', color: TOKENS.accentStrong }, 'without the squint.'),
      ],
    ),

    // Footer strip
    h(
      {
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'JetBrains Mono',
        fontSize: 21,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: TOKENS.inkFaint,
      },
      [
        h({}, 'Chrome & Firefox'),
        h({ color: TOKENS.accentLine, padding: '0 18px' }, '•'),
        h({}, 'Free & open source'),
        h({ color: TOKENS.accentLine, padding: '0 18px' }, '•'),
        h({}, 'Nothing leaves your browser'),
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
