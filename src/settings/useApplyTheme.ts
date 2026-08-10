import { useEffect } from 'react';
import type { Settings } from './schema';
import { applyTheme, applyPageBackground, watchSystemTheme } from './applyTheme';

/**
 * Keep a surface's CSS variables and `data-theme` in sync with settings,
 * re-applying when the OS theme flips while on "auto".
 *
 * Pass the shadow host in the content script: it carries the variables, and the
 * page behind it lives outside the shadow root so it has to be painted too.
 * Pass nothing in the popup and options pages, which theme `<html>` directly.
 */
export function useApplyTheme(settings: Settings, host?: HTMLElement): void {
  useEffect(() => {
    const el = host ?? document.documentElement;
    const sync = () => {
      applyTheme(el, settings);
      if (host) applyPageBackground(settings);
    };
    sync();
    return watchSystemTheme(sync);
  }, [host, settings]);
}
