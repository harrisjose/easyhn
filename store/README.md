# Store submission assets

Everything here is for the Chrome Web Store / Firefox Add-ons listings — not part of the site or the extension build.

- `screenshots/*.png` — 1280×800, no alpha. Upload as-is to either store.
- `screenshots.html` — the source template. Reuses the landing page's fonts, tokens and the actual `landing/public/card-*.jpg` captures, framed for a store listing instead of a feature grid.

## Regenerating

After a UI change, retake the four `landing/public/card-*.jpg` screenshots the same way they were shot for the landing page's feature grid, then re-render:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --force-device-scale-factor=2 --window-size=1280,800 \
  --screenshot=/tmp/shot.png "file://$(pwd)/screenshots.html?shot=1"   # 1–4

sips -z 800 1280 /tmp/shot.png --out screenshots/1-list.png
```

`--force-device-scale-factor=2` renders at 2560×1600 for a sharper downscale; `sips -z 800 1280` brings it back to the exact 1280×800 both stores expect.
