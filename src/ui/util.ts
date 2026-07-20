import { createContext, useContext } from 'react';
import { DEFAULT_SETTINGS, type Settings } from '@/src/settings/schema';
import type { ProfileTab } from '@/src/types';

/** Single source of truth for the site we take over. */
export const HN_ORIGIN = 'https://news.ycombinator.com';

/** Anchor props for opening (or not) a link in a new tab, with a safe rel. */
export function newTab(enabled: boolean): { target?: '_blank'; rel: string } {
  return enabled ? { target: '_blank', rel: 'noopener noreferrer' } : { rel: 'noopener' };
}

export function itemUrl(id: string): string {
  return `${HN_ORIGIN}/item?id=${encodeURIComponent(id)}`;
}

export function userUrl(id: string): string {
  return `${HN_ORIGIN}/user?id=${encodeURIComponent(id)}`;
}

export function fromSiteUrl(site: string): string {
  return `${HN_ORIGIN}/from?site=${encodeURIComponent(site)}`;
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** The profile sub-pages we render as tabs, in display order, each mapped to its
 *  HN URL. `selfOnly` tabs only exist on the logged-in user's own profile. */
export interface ProfileTabDef {
  tab: ProfileTab;
  label: string;
  href: (id: string) => string;
  selfOnly?: boolean;
}

export const PROFILE_TABS: ProfileTabDef[] = [
  { tab: 'about', label: 'About', href: userUrl },
  { tab: 'stories', label: 'Stories', href: (id) => `${HN_ORIGIN}/submitted?id=${encodeURIComponent(id)}` },
  { tab: 'comments', label: 'Comments', href: (id) => `${HN_ORIGIN}/threads?id=${encodeURIComponent(id)}` },
  { tab: 'favorites', label: 'Favorites', href: (id) => `${HN_ORIGIN}/favorites?id=${encodeURIComponent(id)}` },
  { tab: 'upvoted', label: 'Upvoted', href: (id) => `${HN_ORIGIN}/upvoted?id=${encodeURIComponent(id)}`, selfOnly: true },
  { tab: 'hidden', label: 'Hidden', href: () => `${HN_ORIGIN}/hidden`, selfOnly: true },
];

/** Lightweight toast notifications surfaced from anywhere in the tree. */
export const ToastContext = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

/** Current settings, provided once by App so leaf rows don't each hit storage. */
export const SettingsContext = createContext<Settings>(DEFAULT_SETTINGS);
export const useAppSettings = () => useContext(SettingsContext);

/** Settings open/close, shared so the header button can toggle the panel. */
export const SettingsUIContext = createContext<() => void>(() => {});
export const useOpenSettings = () => useContext(SettingsUIContext);

/** Account menu / login open, shared so the header user button can open it. */
export const AccountUIContext = createContext<() => void>(() => {});
export const useOpenAccount = () => useContext(AccountUIContext);
