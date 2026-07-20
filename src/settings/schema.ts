export type Theme = 'light' | 'dark' | 'auto';
export type FontFamily = 'sans' | 'serif';
export type Width = 'narrow' | 'medium' | 'wide';

export interface Settings {
  theme: Theme;
  font: FontFamily;
  /** Base font size in px. */
  fontSize: number;
  width: Width;
  /** Open story/article title links in a new tab. */
  openInNewTab: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  font: 'sans',
  fontSize: 15,
  width: 'medium',
  openInNewTab: true,
};

export const WIDTH_PX: Record<Width, number> = {
  narrow: 640,
  medium: 820,
  wide: 1040,
};

// Inter for sans and Source Serif Pro for serif, degrading to the platform
// defaults when those faces aren't installed.
export const FONT_STACK: Record<FontFamily, string> = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 'Helvetica Neue', Arial, sans-serif",
  serif: "'Source Serif Pro', 'Iowan Old Style', 'Sitka Text', Palatino, 'Book Antiqua', Georgia, serif",
};
