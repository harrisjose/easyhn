// Renders landing/public/og.jpg — the 1200×630 card that shows when the site
// is shared.
//
//   node scripts/gen-og.mjs
//
// Composed with Satori (layout → SVG, text converted to outlines) and
// rasterised with sharp. No browser involved, so this runs the same way on a
// laptop and in CI.
//
// The card is defined here rather than as an HTML file. That means it can't
// literally share the site's stylesheet, so the handful of values it does
// borrow are pinned in TOKENS below — keep them in step with landing/tokens.css.

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const landing = resolve(root, 'landing');
const require = createRequire(resolve(landing, 'package.json'));

let satori, sharp, wawoff2;
try {
  // Resolved out of landing/node_modules rather than imported by name: this
  // script sits at the repo root, where those packages aren't installed.
  // satori's CJS build puts the function on .default.
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

/* Satori reads TTF/OTF/WOFF but not WOFF2, which is all the site ships.
   Decompressing at build time beats committing a second copy of each face. */
async function face(file, name, weight = 400) {
  const woff2 = readFileSync(resolve(landing, 'public/fonts', file));
  return { name, weight, style: 'normal', data: Buffer.from(await wawoff2.decompress(woff2)) };
}

const fonts = [
  await face('instrument-serif-400.woff2', 'Instrument Serif'),
  await face('jetbrains-mono-400.woff2', 'JetBrains Mono'),
];

// The ghost goes in as an <img>. Satori rasterises SVG data URIs itself, so
// the mark stays vector all the way to the final resize.
const ghost = `data:image/svg+xml;base64,${readFileSync(
  resolve(landing, 'public/icon.svg'),
).toString('base64')}`;

/* ---- Card ---------------------------------------------------------------
 * Satori is flexbox-only: every element holding more than one child needs an
 * explicit display:flex, and there is no font-synthesis, so the accent line is
 * distinguished by colour alone rather than the page's synthesised italic. */
const h = (style, children) => ({ type: 'div', props: { style, children } });

const serif = { fontFamily: 'Instrument Serif', color: TOKENS.ink };

const card = h(
  {
    // Fills whatever canvas satori is given — the size lives in one place, at
    // the satori() call below.
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '76px 88px 66px',
    backgroundColor: TOKENS.paper,
    // The page's warm top wash, a shade stronger — it has to survive JPEG and
    // a ~500px-wide timeline thumbnail.
    backgroundImage:
      'radial-gradient(120% 68% at 50% 0%, rgba(255, 102, 0, 0.10), rgba(255, 102, 0, 0) 64%)',
  },
  [
    // Lockup
    h({ display: 'flex', alignItems: 'center' }, [
      { type: 'img', props: { src: ghost, width: 62, height: 62 } },
      h({ ...serif, fontSize: 46, letterSpacing: '0.006em', marginLeft: 16, display: 'flex' }, [
        h({ ...serif, fontSize: 46 }, 'easy'),
        h({ fontFamily: 'Instrument Serif', fontSize: 46, color: TOKENS.accentText }, 'hn'),
      ]),
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
 * PNG, not JPEG. The card is flat colour plus one very gradual wash — exactly
 * the case JPEG puts visible contour rings through, and which PNG happens to
 * pack smaller anyway, losslessly. */
const svg = await satori(card, { width: 1200, height: 630, fonts });

// Rasterised at 2× (density 144 against satori's 72dpi output) and downsampled,
// because the serif's thin strokes break up if they go straight to final size.
const buf = await sharp(Buffer.from(svg), { density: 144 })
  .resize(1200, 630)
  .flatten({ background: TOKENS.paper }) // the card's own padding is transparent otherwise
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(resolve(landing, 'public/og.png'), buf);
console.log(`landing/public/og.png  1200×630  ${(buf.length / 1024).toFixed(1)}KB`);
