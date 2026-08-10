export type Theme = 'light' | 'dark' | 'auto';
export type FontFamily = 'sans' | 'serif';
export type Density = 'compact' | 'default' | 'comfortable';

export interface Settings {
  theme: Theme;
  font: FontFamily;
  /** Base font size in px. */
  fontSize: number;
  /** Vertical whitespace in lists and comment threads, independent of size. */
  density: Density;
  /** Open story/article title links in a new tab. */
  openInNewTab: boolean;
  /** Mark the comments added to a thread since you last opened it. Off also
   *  means we stop keeping the per-thread reading history it needs. */
  highlightNew: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  font: 'sans',
  fontSize: 15,
  density: 'default',
  openInNewTab: true,
  highlightNew: true,
};

/** Multiplier applied to list/comment vertical padding via `--ehn-density`. */
export const DENSITY_SCALE: Record<Density, number> = {
  compact: 0.6,
  default: 1,
  comfortable: 1.5,
};

// Inter for sans and Source Serif Pro for serif, degrading to the platform
// defaults when those faces aren't installed.
export const FONT_STACK: Record<FontFamily, string> = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 'Helvetica Neue', Arial, sans-serif",
  serif: "'Source Serif Pro', 'Iowan Old Style', 'Sitka Text', Palatino, 'Book Antiqua', Georgia, serif",
};
