# easyhn

A neat, modern, cross-browser UI for [Hacker News](https://news.ycombinator.com).
Open `news.ycombinator.com` and easyhn takes over the page in place with a clean,
themeable interface — no separate app, no accounts, no pro tier.

## Features

- **Redesigned story lists** — Top / New / Ask / Show / Jobs, with favicons, domains,
  score, author, age and comment counts.
- **Readable comment threads** with one-click collapse/expand (and hidden-reply counts).
- **Full account features** when you're logged in to HN: upvote, reply (inline composer),
  favorite, flag — wired straight through to HN using your existing session.
- **User profiles** — karma, join date, about, links to submissions & comments.
- **Customization** — theme (Light / Dark / Auto), accent color, font (sans/serif),
  font size, content width, favicons on/off. Synced across your browsers and applied
  live to every open tab.
- **Keyboard navigation** — `j`/`k` to move, `o`/Enter to open, `c` for comments.

It works by parsing HN's own server-rendered HTML (not the JSON API), so all the
auth tokens HN needs for voting/replying stay intact and nothing leaves your browser.

## Tech

Built with [WXT](https://wxt.dev) + React + TypeScript. One codebase targets
Chrome (MV3) and Firefox (MV2).

```
entrypoints/hn.content   in-place takeover content script (parse → mount React)
entrypoints/popup        toolbar quick-settings
entrypoints/options      full settings page
src/parse                HN DOM → typed model (the core; covered by tests)
src/actions              vote / reply / favorite / flag write-backs
src/ui                   React views & components
src/settings             schema, storage.sync store, theming
```

## Develop

```bash
pnpm install
pnpm dev            # launches Chrome with the extension + HMR
pnpm dev:firefox    # launches Firefox
```

## Build & package

```bash
pnpm build          # .output/chrome-mv3
pnpm build:firefox  # .output/firefox-mv2
pnpm zip            # store-ready chrome zip
pnpm zip:firefox    # store-ready firefox zip + sources zip
```

### Load manually (without the dev server)

- **Chrome:** `chrome://extensions` → enable Developer mode → *Load unpacked* →
  select `.output/chrome-mv3`.
- **Firefox:** `about:debugging#/runtime/this-firefox` → *Load Temporary Add-on* →
  select `.output/firefox-mv2/manifest.json`.

Then open https://news.ycombinator.com.

## Tests

The DOM parsers are the fragile part (HN markup can change), so they're covered by
tests that run against captured real HN HTML:

```bash
pnpm test           # run parser tests against tests/fixtures
pnpm test:fixtures  # re-capture fixtures from live HN
```
