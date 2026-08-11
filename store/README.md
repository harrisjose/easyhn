# Store submission assets

Everything here is for the Chrome Web Store / Firefox Add-ons listings — not part of the site or the extension build.

- `screenshots/*.png` — 1280×800, no alpha, numbered in upload order (`0-theme` first). Upload as-is to either store.
- `screenshots.html` — the source template. Reuses the landing page's fonts and tokens, framed for a store listing instead of a feature grid. Shots 1–4 use the actual `landing/public/card-*.jpg` captures; shot 0 is a light/dark diagonal split built from `raw/theme-*-crop.png` instead (see below).
- `raw/theme-light.jpg`, `raw/theme-dark.jpg` — full-page captures of the live extension on news.ycombinator.com, one per theme, same page load so the story rows match. Unprocessed — still has the nav bar and rank-number column.
- `raw/theme-light-crop.png`, `raw/theme-dark-crop.png` — the above, cropped to just the story rows (no nav bar, no rank-number gutter) via `raw/crop-tool.html`. These are what shot 0 actually uses.
- `raw/crop-tool.html` — loads one raw capture at a natural-size offset inside a fixed, clipped viewport, so a headless-Chrome screenshot of it *is* the crop. Existing offsets (`left:-400px; top:-66px`, 480×600 box) match the current app layout; recompute them if the header height or list padding changes.

## Regenerating

After a UI change, retake the four `landing/public/card-*.jpg` screenshots the same way they were shot for the landing page's feature grid. For shot 0:

1. Open news.ycombinator.com with the extension installed, screenshot it, switch the theme in Settings, screenshot again — same page load, so both captures show the same stories. Save over `raw/theme-light.jpg` / `raw/theme-dark.jpg`.
2. Re-crop both through `crop-tool.html` (adjust the offsets first if the layout moved):

   ```
   cd store/raw
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --headless --disable-gpu --force-device-scale-factor=3 --window-size=480,600 \
     --screenshot=theme-light-crop.png "file://$(pwd)/crop-tool.html?src=theme-light.jpg"
   # repeat for dark
   ```

3. Re-render all five shots:

   ```
   cd store
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --headless --disable-gpu --force-device-scale-factor=3 --window-size=1280,800 \
     --screenshot=/tmp/shot.png "file://$(pwd)/screenshots.html?shot=0"   # 0–4

   sips -z 800 1280 /tmp/shot.png --out screenshots/0-theme.png
   ```

`--force-device-scale-factor=3` renders at 3840×2400 before the downscale — sharper than 2x, worth the larger intermediate file since these never ship, only the final 1280×800 PNGs do. `sips -z 800 1280` brings each back to the exact size both stores expect; PNG output is lossless throughout, so nothing here re-compresses on the way down. Run each `sips` call on its own — piping several through a shell loop has silently swapped output filenames here before.

The one hard quality ceiling: `raw/theme-*.jpg` come from the browser screenshot tool itself, which caps captures at 1512×795 JPEG regardless of window size — resizing the browser window before capturing doesn't get more source pixels, confirmed by testing. Everything downstream of that capture is now lossless and supersampled to compensate, but a genuinely sharper shot 0 would need a higher-fidelity capture method upstream.
