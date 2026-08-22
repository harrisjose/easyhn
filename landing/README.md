# easyhn landing page

The marketing site for [Easy for Hacker News](../README.md), served at
[easyhn.harrisjose.com](https://easyhn.harrisjose.com). Plain HTML and CSS — no
framework, no build step, so what's in this folder is what ships.

## Deploys

**Automatic.** Cloudflare is connected to this repo and deploys on every push to
`main`; there's nothing to run and no release step to remember. Merge the change
and the site follows.

```bash
npm install
npm run dev      # serve on http://localhost:4600
npm run deploy   # manual wrangler deploy — only for bypassing the Git build
```

`npm run deploy` pushes straight from your working copy, so it can put the live
site ahead of `main`. Reach for it only to test a deploy-time problem you can't
reproduce locally; otherwise let the push do it.

## What gets uploaded

`wrangler.jsonc` sets the assets directory to this folder itself, so **every file
here is served unless it's named in `.assetsignore`**. If you add a config file
or a script alongside the page, add it to `.assetsignore` too.

Type is self-hosted in `public/fonts/` (latin subsets, ~83KB) rather than loaded
from a CDN: the page's own pitch is that nothing leaves your browser, so it
shouldn't call a third party to render its headline.

See the root README for [the hero image](../README.md#the-hero-image) — it's a
composite, and regenerating it after a UI change has its own recipe.
