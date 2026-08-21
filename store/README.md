# Store submission assets

Everything here is for the Chrome Web Store / Firefox Add-ons listings — not part of the site or the extension build.

The set is frameless: the product fills each canvas edge-to-edge, no cards, no baked-in captions. Words live in the listing text, not the pixels.

- `screenshots/` — final PNGs, numbered in upload order.
- `screenshots.html` — the screenshot template, one 1280×800 shot per `?shot=N`. Reads from `raw/captures/`; a slot whose capture is missing renders a labelled placeholder rather than silently shipping something stale.
- `promo.html` — both promo tiles from one source: `?size=marquee` → 1400×560, `?size=small` → 440×280. The marquee's right side is a flat screenshot bleeding off three edges.

## Captures (`raw/captures/`)

Full-page screenshots of the live build on news.ycombinator.com, named for their slot:

| File | Slot | Status |
| --- | --- | --- |
| `front-light.png` | 1 | Current live front page in light mode. |
| `thread-dark.png` | 3 | Current live comment thread in dark mode. |
| `keyboard-light.png` | 4 | Current live front page with the first story focused. |
| `settings-light.png` | 5 | Current live item/thread page with the settings panel open. |

Drop a file in with the right name and re-render; nothing else changes. `scripts/cdp.mjs shot` captures at 1280×800 CSS pixels and 2× device scale so the output stays sharp without changing aspect ratio.

**Settings capture rule:** Always open Settings over an item/thread page so the screenshot shows the article and discussion context behind the panel. Do not capture Settings over a story-list page.

## Theme split sources

- `raw/theme-light.jpg`, `raw/theme-dark.jpg` — full-page captures of the live extension, one per theme, same page load so the story rows match. Shot 2 layers these directly along a diagonal at normal product scale.
- `raw/theme-light-crop.png`, `raw/theme-dark-crop.png` — legacy close crops retained as source material, but no longer used by Shot 2.
- `raw/crop-tool.html` — loads one raw capture at a natural-size offset inside a fixed, clipped viewport, so a headless-Chrome screenshot of it *is* the crop. Existing offsets (`left:-400px; top:-66px`, 480×600 box) match the current app layout; recompute them if the header height or list padding changes.

## Regenerating

```
cd store
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# screenshots 1–5
"$CHROME" --headless --disable-gpu --force-device-scale-factor=3 \
  --window-size=1280,800 --screenshot=/tmp/shot.png \
  "file://$(pwd)/screenshots.html?shot=1"   # 0–4
sips -z 800 1280 /tmp/shot.png --out screenshots/1-front-light.png

# promos
"$CHROME" --headless --disable-gpu --force-device-scale-factor=3 \
  --window-size=1400,560 --screenshot=/tmp/marquee.png "file://$(pwd)/promo.html?size=marquee"
sips -z 560 1400 /tmp/marquee.png --out screenshots/promo-marquee.png
# repeat with ?size=small at 440x280 → promo-small.png
```

`--force-device-scale-factor=3` renders oversized before the downscale — sharper than 2x, worth the larger intermediate since these never ship. Run each `sips` call on its own — piping several through a shell loop has silently swapped output filenames here before.

The one hard quality ceiling: the browser screenshot tool caps window captures at ~1512×795 JPEG regardless of window size, which bounds `theme-*-crop.png` sharpness. Everything downstream is lossless and supersampled to compensate.
