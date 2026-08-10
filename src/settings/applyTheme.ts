import { FONT_STACK, DENSITY_SCALE, type Settings } from './schema';

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
 * Writes settings as custom properties and a `data-theme` attribute onto `el` —
 * the shadow host in the content script, <html> in the popup and options pages.
 * Cheap enough to call on every change.
 */
export function applyTheme(el: HTMLElement, s: Settings): void {
  el.dataset.theme = effectiveTheme(s);
  el.dataset.font = s.font;
  const css = el.style;
  css.setProperty('--ehn-font', FONT_STACK[s.font]);
  css.setProperty('--ehn-font-size', `${s.fontSize}px`);
  css.setProperty('--ehn-density', `${DENSITY_SCALE[s.density]}`);
}

/**
 * The page <html> sits outside our shadow root and can't read `--bg`, so it
 * needs the literal hex. Keep in sync with `--bg` in theme.css.
 */
export const PAGE_BG: Record<'light' | 'dark', string> = {
  light: '#fcfcfa',
  dark: '#181a1e',
};

/** Content-script only: stops overscroll rubber-banding flashing a bare page. */
export function applyPageBackground(s: Settings): void {
  document.documentElement.style.background = PAGE_BG[effectiveTheme(s)];
}

export function watchSystemTheme(cb: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
