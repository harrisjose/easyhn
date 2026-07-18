export type Theme = 'light' | 'dark' | 'auto';
export type FontFamily = 'sans' | 'serif';
export type Width = 'narrow' | 'medium' | 'wide';

export interface Settings {
  theme: Theme;
  font: FontFamily;
  /** Base font size in px. */
  fontSize: number;
  width: Width;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  font: 'sans',
  fontSize: 15,
  width: 'medium',
};

export const WIDTH_PX: Record<Width, number> = {
  narrow: 640,
  medium: 820,
  wide: 1040,
};

// Font stacks mirror Modern for HN's own design tokens (Inter / Source Serif
// Pro), degrading to the platform defaults when those faces aren't installed.
export const FONT_STACK: Record<FontFamily, string> = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 'Helvetica Neue', Arial, sans-serif",
  serif: "'Source Serif Pro', 'Iowan Old Style', 'Sitka Text', Palatino, 'Book Antiqua', Georgia, serif",
};
