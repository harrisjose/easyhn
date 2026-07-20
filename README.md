# easyhn

A clean, readable, cross-browser UI for [Hacker News](https://news.ycombinator.com).
Open `news.ycombinator.com` and easyhn takes over the page in place with a
themeable, distraction-free interface — no separate app, no accounts, no pro tier.

## Features

- **Redesigned story lists** — Top / New / Best / Ask / Show / Jobs, with domains,
  score, author, age and comment counts.
- **Readable comment threads** with one-click collapse/expand.
- **Account features** — sign in / out and, when logged in, upvote and reply
  (inline composer), wired straight through to HN using your existing session.
- **User profiles** — a tabbed profile (About, Stories, Comments, Favorites, plus
  Upvoted / Hidden on your own account) rendered in place.
- **Customization** — theme (Light / Dark / Auto), font (sans / serif), font size,
  content width, and density. Synced across your browsers and applied live to
  every open tab.
- **Keyboard navigation** — `j` / `k` to move, `o` / Enter to open, `c` for comments.

It works by parsing HN's own server-rendered HTML (not the JSON API), so the auth
tokens HN needs for voting and replying stay intact and nothing leaves your browser.

## Install

Download the latest build from the [**Releases**](https://github.com/harrisjose/easyhn/releases)
page, then load it into your browser. easyhn isn't on the Chrome Web Store or
Firefox Add-ons yet, so it installs as an unpacked / temporary extension for now.

- **Chrome:** download `easyhn-<version>-chrome.zip`, unzip it, then open
  `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and
  select the unzipped folder.
- **Firefox:** download `easyhn-<version>-firefox.zip`, open
  `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and
  select the zip (Firefox drops temporary add-ons when it restarts).

Then open [news.ycombinator.com](https://news.ycombinator.com). Prefer to build it
yourself? See [Development](#development).

## Using easyhn

Just open [news.ycombinator.com](https://news.ycombinator.com) — easyhn replaces the
page automatically. Pages it doesn't redesign are left untouched, so the rest of HN
still works as usual.

- **Browse** — use the top nav (Top / New / Best / Ask / Show / Jobs), or the
  keyboard: `j` / `k` to move the selection, `o` or Enter to open a story, `c` to
  jump to its comments.
- **Read threads** — click any comment's chevron to collapse or expand it.
- **Vote & reply** — sign in from the account button in the header. Once logged in,
  the upvote arrows and an inline reply box become active on stories and comments.
- **Settings** — click the gear in the easyhn header (or open the extension's
  options page) to change theme, font, size, width, and density. Changes apply
  instantly and sync to your other browsers.
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
reload icon on the easyhn card.

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
