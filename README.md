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

Install from the [**Chrome Web Store**](https://chromewebstore.google.com/detail/easy-for-hacker-news/lchfcbigmcnnllgpiifdmpfpbbkfkjie).

Not on Firefox Add-ons yet. To run it there — or to try an unreleased build on
Chrome — load it by hand from the
[**Releases**](https://github.com/harrisjose/easyhn/releases) page:

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

The hero is a drawn MacBook frame (`landing/public/macbook.svg`) with a real
easyhn screenshot sitting in its screen — one per theme
(`hero-product-light.png` / `hero-product-dark.png`), swapped as the page's
theme changes.

To retake it after a UI change: capture the front page at the frame's aspect
ratio in both themes, export at 2x so text stays sharp when downscaled, and
bump the `?v=` query on the `<img>` tags in `landing/index.html` to bust caches.
