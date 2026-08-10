import { createContext, useContext } from 'react';
import { DEFAULT_SETTINGS, type Settings } from '@/src/settings/schema';
import { createLedger, inMemoryVisitStore, type VisitLedger } from '@/src/visits/ledger';
import { createHnClient, fetchTransport, type HnClient } from '@/src/hn/client';

/** Anchor props for opening (or not) a link in a new tab, with a safe rel. */
export function newTab(enabled: boolean): { target?: '_blank'; rel: string } {
  return enabled ? { target: '_blank', rel: 'noopener noreferrer' } : { rel: 'noopener' };
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

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

/** The visit ledger, constructed at the composition root. Falls back to an
 *  in-memory one so a tree rendered without a provider still works. */
export const VisitLedgerContext = createContext<VisitLedger>(createLedger(inMemoryVisitStore()));
export const useVisitLedger = () => useContext(VisitLedgerContext);

/** Everything we ask Hacker News to do, likewise provided by the root. */
export const HnClientContext = createContext<HnClient>(createHnClient(fetchTransport));
export const useHn = () => useContext(HnClientContext);
