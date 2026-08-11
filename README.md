# easyhn

A clean, readable, cross-browser UI for [Hacker News](https://news.ycombinator.com).
Open `news.ycombinator.com` and Easy for Hacker News takes over the page in place with a
themeable, distraction-free interface — no separate app, no accounts, no pro tier.

## Features

- **Redesigned story lists** — Top / New / Best / Ask / Show / Jobs, with domains,
  score, author, age and comment counts.
- **Readable comment threads** with one-click collapse/expand.
- **New since your last visit** — comments added since you last opened a thread
  are dotted in the margin, with a "N new" button that steps through them.
- **Account features** — sign in / out and, when logged in, upvote and reply
  (inline composer), wired straight through to HN using your existing session.
- **User profiles** — a tabbed profile (About, Stories, Comments, Favorites, plus
  Upvoted / Hidden on your own account) rendered in place.
- **Customization** — theme (Light / Dark / Auto), font (sans / serif), font size
  and density. Applied live to every open tab.
- **Keyboard navigation** — `j` / `k` to move, `o` / Enter to open, `c` for comments.

It works by parsing HN's own server-rendered HTML (not the JSON API), so the auth
tokens HN needs for voting and replying stay intact and nothing leaves your browser.

## Install

Download the latest build from the [**Releases**](https://github.com/harrisjose/easyhn/releases)
page, then load it into your browser. Easy for Hacker News isn't on the Chrome Web Store or
Firefox Add-ons yet, so it installs as an unpacked / temporary extension for now.

- **Chrome:** download `easyhn-<version>-chrome.zip`, unzip it, then open
  `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and
  select the unzipped folder.
- **Firefox:** download `easyhn-<version>-firefox.zip`, open
  `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and
  select the zip (Firefox drops temporary add-ons when it restarts).

Then open [news.ycombinator.com](https://news.ycombinator.com). Prefer to build it
yourself? See [Development](#development).

## Using Easy for Hacker News

Just open [news.ycombinator.com](https://news.ycombinator.com) — Easy for Hacker News
replaces the page automatically. Pages it doesn't redesign are left untouched, so the
rest of HN still works as usual.

- **Browse** — use the top nav (Top / New / Best / Ask / Show / Jobs), or the
  keyboard: `j` / `k` to move the selection, `o` or Enter to open a story, `c` to
  jump to its comments.
- **Read threads** — click any comment's chevron to collapse or expand it. Come
  back later and anything posted since your last visit carries an orange dot;
  the "N new" button next to the comment count jumps between them. Turn it off
  in Settings and it forgets which threads you've opened.
- **Vote & reply** — log in from the header. Once logged in, the upvote
  arrows and an inline reply box become active on stories and comments.
- **Settings** — click the gear in the header (or open the extension's
  options page) to change theme, font, font size and density. Changes
  apply instantly to every open tab.
- **Toolbar icon** — opens a small card with quick links (HN front page + author).

## Development

Built with [WXT](https://wxt.dev) + React + TypeScript. One codebase targets
Chrome (MV3) and Firefox (MV2).

```
entrypoints/hn.content   in-place takeover content script (parse → mount React)
entrypoints/popup        toolbar about / links card
entrypoints/options      full settings page
src/parse                HN DOM → typed model (the core; covered by tests)
src/actions              vote / reply write-backs
src/ui                   React views & components
src/settings             schema, storage.sync store, theming
```

```bash
pnpm install
pnpm dev            # launch Chrome with the extension + HMR
pnpm dev:firefox    # launch Firefox
```

For a persistent local install (rather than the `pnpm dev` HMR browser), run
`pnpm install-local`. It builds and copies the extension to `./unpacked` — a stable
folder to point Chrome's **Load unpacked** at once; after later runs just hit the
reload icon on the Easy for Hacker News card.

### Build & package

```bash
pnpm build          # .output/chrome-mv3
pnpm build:firefox  # .output/firefox-mv2
pnpm zip            # store-ready chrome zip
pnpm zip:firefox    # store-ready firefox zip + sources zip
```

### Releasing

Cut a release with a version script — each bumps the version in `package.json`,
commits and tags it, and pushes, which triggers
[`.github/workflows/release.yml`](.github/workflows/release.yml) to build both zips
and publish them to [GitHub Releases](https://github.com/harrisjose/easyhn/releases):

```bash
pnpm release-patch   # 0.1.0 -> 0.1.1
pnpm release-minor   # 0.1.0 -> 0.2.0
pnpm release-major   # 0.1.0 -> 1.0.0
```

### Tests

The DOM parsers are the fragile part (HN markup can change), so they're covered by
tests that run against captured real HN HTML:

```bash
pnpm test           # run parser tests against tests/fixtures
pnpm test:fixtures  # re-capture fixtures from live HN
```

## Landing page

The marketing site lives in `landing/` and is served at
[easyhn.harrisjose.com](https://easyhn.harrisjose.com). Cloudflare deploys it on
every push to `main`, so shipping a copy change is just a commit — see
[`landing/README.md`](landing/README.md).

```bash
cd landing
npm run dev      # serve on http://localhost:4600
```

### The hero image

`landing/public/mockup-easyhn.jpg` is a composite: a stock photo of a MacBook with a
real easyhn screenshot perspective-mapped onto the screen.

**`design/mockup.svg` is the source template — keep it.** It's a Figma export
containing two embedded PNGs: the photo plate, and a pre-warped placeholder whose alpha
channel defines the screen quad (including the notch cutout). That placeholder is what
makes the perspective correct — the screen is a true 4-corner projection (top edge
+17.6°, bottom +20.9°, right edge 7% longer than left), not a shear, so the corners have
to be read from it rather than eyeballed.

To regenerate the hero after a UI change:

1. Extract the corners from the placeholder's alpha and map them into photo space.
2. Capture the new screenshot at 16:10 — stitch two scrolled captures if one is too
   short, recovering the offset by correlation and putting the seam on a flat row.
3. Grade it like a photographed screen: lift blacks to the panel's own black level, cap
   highlights well below 255, add grain matching the plate (sigma ~3.4) — without the
   grain it reads as pasted.
4. Warp at 2x and downsample with Lanczos. Warping straight to final size minifies
   through point sampling and aliases the text.

The plate's blank screen is a flat synthetic fill, so it carries no real reflections to
reuse — the sheen and edge falloff have to be synthesised (light source is upper-left).

`mockup.svg` lives in `design/` rather than under `landing/` so it can't ship the 6MB
to production. Wrangler's assets directory is `landing/` itself, so anything sitting
there is uploaded unless it's named in `landing/.assetsignore` — keeping build-time
source art outside that tree means there's no ignore rule to forget.
