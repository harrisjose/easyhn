import { createContext, useContext } from 'react';

/** Privacy-light favicon source (no Google tracking). */
export function faviconUrl(domain?: string): string | undefined {
  if (!domain) return undefined;
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

export function itemUrl(id: string): string {
  return `https://news.ycombinator.com/item?id=${id}`;
}

export function userUrl(id: string): string {
  return `https://news.ycombinator.com/user?id=${encodeURIComponent(id)}`;
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Lightweight toast notifications surfaced from anywhere in the tree. */
export const ToastContext = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

/** Settings open/close, shared so the header button can toggle the panel. */
export const SettingsUIContext = createContext<() => void>(() => {});
export const useOpenSettings = () => useContext(SettingsUIContext);
