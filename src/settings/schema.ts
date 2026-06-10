export type Theme = 'light' | 'dark' | 'auto';
export type Accent = 'orange' | 'blue' | 'green' | 'purple' | 'red';
export type FontFamily = 'sans' | 'serif';
export type Width = 'narrow' | 'medium' | 'wide';

export interface Settings {
  theme: Theme;
  accent: Accent;
  font: FontFamily;
  /** Base font size in px. */
  fontSize: number;
  width: Width;
  /** Show site favicons next to story domains. */
  showFavicons: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  accent: 'orange',
  font: 'sans',
  fontSize: 15,
  width: 'medium',
  showFavicons: false,
};

export const ACCENT_HEX: Record<Accent, string> = {
  orange: '#ff6600',
  blue: '#2f6feb',
  green: '#1a8f3c',
  purple: '#8957e5',
  red: '#e5484d',
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
