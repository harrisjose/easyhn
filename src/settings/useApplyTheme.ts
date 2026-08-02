import { useEffect } from 'react';
import type { Settings } from './schema';
import { applyTheme, watchSystemTheme } from './applyTheme';

/**
 * Themes `<html>` directly, for the popup and options pages — the content script
 * renders in a shadow root and themes its host instead.
 */
export function useApplyTheme(settings: Settings): void {
  useEffect(() => {
    const el = document.documentElement;
    applyTheme(el, settings);
    return watchSystemTheme(() => applyTheme(el, settings));
  }, [settings]);
}
