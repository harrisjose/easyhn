import { FONT_STACK, WIDTH_PX, type Settings } from './schema';

function prefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
}

export function effectiveTheme(s: Settings): 'light' | 'dark' {
  if (s.theme === 'auto') return prefersDark() ? 'dark' : 'light';
  return s.theme;
}

/**
 * Apply settings as CSS custom properties + a `data-theme` attribute on the
 * given element (the shadow host for the content script, or <html> for the
 * popup/options pages). Cheap enough to call on every change — no re-parse.
 */
export function applyTheme(el: HTMLElement, s: Settings): void {
  el.dataset.theme = effectiveTheme(s);
  el.dataset.font = s.font;
  const css = el.style;
  css.setProperty('--ehn-font', FONT_STACK[s.font]);
  css.setProperty('--ehn-font-size', `${s.fontSize}px`);
  css.setProperty('--ehn-width', `${WIDTH_PX[s.width]}px`);
}

/**
 * Page color behind the flush UI — the single source for the raw hex the page
 * <html> needs (it sits outside the shadow root and can't read `--bg`). Keep in
 * sync with `--bg` in theme.css.
 */
export const PAGE_BG: Record<'light' | 'dark', string> = {
  light: '#fcfcfa',
  dark: '#181a1e',
};

/**
 * Color the host page to match the UI, so overscroll/rubber-banding never
 * flashes a different shade. The page <html> sits outside our shadow root, so
 * it can't read the theme's CSS variables — it gets the literal color for the
 * effective theme instead. Content-script only.
 */
export function applyPageBackground(s: Settings): void {
  document.documentElement.style.background = PAGE_BG[effectiveTheme(s)];
}

/**
 * Re-apply when the OS theme flips while set to "auto". Returns a cleanup fn.
 */
export function watchSystemTheme(cb: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
