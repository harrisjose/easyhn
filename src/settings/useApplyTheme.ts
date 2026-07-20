import { useEffect } from 'react';
import type { Settings } from './schema';
import { applyTheme, watchSystemTheme } from './applyTheme';

/**
 * Apply theme settings to `<html>` and re-apply when the OS theme flips while on
 * "auto". Used by the popup and options pages, which render outside the content
 * script's shadow root and theme the document element directly.
 */
export function useApplyTheme(settings: Settings): void {
  useEffect(() => {
    const el = document.documentElement;
    applyTheme(el, settings);
    return watchSystemTheme(() => applyTheme(el, settings));
  }, [settings]);
}
