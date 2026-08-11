import type { ProfileTab } from '@/src/types';

/** The site we take over. Every URL easyhn builds or resolves starts here. */
export const HN_ORIGIN = 'https://news.ycombinator.com';

export function itemUrl(id: string): string {
  return `${HN_ORIGIN}/item?id=${encodeURIComponent(id)}`;
}

export function userUrl(id: string): string {
  return `${HN_ORIGIN}/user?id=${encodeURIComponent(id)}`;
}

export function fromSiteUrl(site: string): string {
  return `${HN_ORIGIN}/from?site=${encodeURIComponent(site)}`;
}

/** HN's own submission form. Not a page easyhn redesigns — following this
 *  link hands the reader back to native HN. */
export const SUBMIT_URL = `${HN_ORIGIN}/submit`;

/** Resolve an HN-relative href (e.g. "vote?id=1") to an absolute URL. */
export function toAbsolute(href: string | null | undefined): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href, `${HN_ORIGIN}/`).href;
  } catch {
    return undefined;
  }
}

/**
 * Story lists easyhn redesigns. `path` is HN's pathname, `slug` the list it
 * belongs to (several paths share one), and `label` marks the ones the header
 * shows — in this order. One table so a nav entry can't drift from a route.
 */
export interface ListDef {
  path: string;
  slug: string;
  label?: string;
}

export const LISTS: ListDef[] = [
  { path: 'news', slug: 'news', label: 'Top' },
  { path: 'newest', slug: 'newest', label: 'New' },
  { path: 'best', slug: 'best', label: 'Best' },
  { path: 'ask', slug: 'ask', label: 'Ask' },
  { path: 'show', slug: 'show', label: 'Show' },
  { path: 'jobs', slug: 'jobs', label: 'Jobs' },
  // Redesigned, but not in the header.
  { path: '', slug: 'news' },
  { path: 'front', slug: 'front' },
  { path: 'active', slug: 'active' },
  { path: 'classic', slug: 'classic' },
  { path: 'shownew', slug: 'show' },
  { path: 'noobstories', slug: 'newest' },
];

/** The lists the header links to, in display order. */
export const NAV = LISTS.filter((l) => l.label);

/** HN pathname (no slash) -> list slug. */
export const LIST_PATHS: Record<string, string> = Object.fromEntries(
  LISTS.map((l) => [l.path, l.slug]),
);

/**
 * Profile sub-pages easyhn presents as tabs of one user view. `selfOnly` tabs
 * exist only on the reader's own profile; `idless` ones carry no `?id=`, so the
 * user they belong to comes from the session.
 */
export interface ProfileTabDef {
  tab: ProfileTab;
  label: string;
  path: string;
  href: (id: string) => string;
  selfOnly?: boolean;
  idless?: boolean;
}

export const PROFILE_TABS: ProfileTabDef[] = [
  { tab: 'about', label: 'About', path: 'user', href: userUrl },
  {
    tab: 'stories',
    label: 'Stories',
    path: 'submitted',
    href: (id) => `${HN_ORIGIN}/submitted?id=${encodeURIComponent(id)}`,
  },
  {
    tab: 'comments',
    label: 'Comments',
    path: 'threads',
    href: (id) => `${HN_ORIGIN}/threads?id=${encodeURIComponent(id)}`,
  },
  {
    tab: 'favorites',
    label: 'Favorites',
    path: 'favorites',
    href: (id) => `${HN_ORIGIN}/favorites?id=${encodeURIComponent(id)}`,
  },
  {
    tab: 'upvoted',
    label: 'Upvoted',
    path: 'upvoted',
    href: (id) => `${HN_ORIGIN}/upvoted?id=${encodeURIComponent(id)}`,
    selfOnly: true,
  },
  {
    tab: 'hidden',
    label: 'Hidden',
    path: 'hidden',
    href: () => `${HN_ORIGIN}/hidden`,
    selfOnly: true,
    idless: true,
  },
];

/** HN pathname (no slash) -> the tab it renders as. */
export const PROFILE_TAB_BY_PATH: Record<string, ProfileTabDef> = Object.fromEntries(
  PROFILE_TABS.map((t) => [t.path, t]),
);
