import { resolve } from 'node:path';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: '.',
  // Dev-only (`pnpm dev`): launch a Chromium window with the extension loaded
  // and hot-reload on every change. We open HN directly and expose a CDP port
  // so the dev browser can be driven/screenshotted (scripts/cdp.mjs).
  webExt: {
    startUrls: ['https://news.ycombinator.com'],
    chromiumArgs: ['--remote-debugging-port=9222'],
    // Reuse a dedicated dev profile (gitignored under .wxt/) instead of a fresh
    // throwaway temp dir — so the launched browser keeps your HN login and
    // state across restarts.
    chromiumProfile: resolve('.wxt/chrome-profile'),
    keepProfileChanges: true,
  },
  manifest: ({ browser }) => ({
    name: 'easyhn',
    description: 'A neat, modern UI for Hacker News.',
    permissions: ['storage'],
    // Needed so the content script can POST votes/replies to HN on the
    // user's behalf using their existing session cookies.
    host_permissions: ['*://news.ycombinator.com/*'],
    action: {
      default_title: 'easyhn',
    },
    // Firefox needs a stable extension id for storage.sync to work, and (for
    // new listings) an explicit data-collection declaration — we collect none.
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: { id: 'easyhn@harrispjose', strict_min_version: '109.0' },
          },
          // Firefox-only manifest field.
          data_collection_permissions: { required: ['none'] },
        }
      : {}),
  }),
});
