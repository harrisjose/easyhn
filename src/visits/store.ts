import { storage } from '#imports';

/** What we remember about one thread we've opened. */
export interface Visit {
  /** Unix seconds when the thread was last opened. */
  seenAt: number;
  /** HN's own comment count at that moment. */
  count?: number;
}

export type Visits = Record<string, Visit>;

/**
 * Reading state lives in `storage.local`, never the `storage.sync` area the
 * settings use: it rewrites on every thread opened, and Chrome caps sync at
 * ~100KB across 512 items — a few hundred threads would exhaust that and start
 * failing the writes carrying the user's actual settings.
 */
const visitsItem = storage.defineItem<Visits>('local:visits', { fallback: {}, version: 1 });

/** Threads to remember; reading state older than that is worthless. */
const MAX_VISITS = 400;

export async function getVisit(itemId: string): Promise<Visit | undefined> {
  return (await visitsItem.getValue())[itemId];
}

export async function recordVisit(itemId: string, count?: number): Promise<void> {
  const visits = await visitsItem.getValue();
  visits[itemId] = { seenAt: Math.floor(Date.now() / 1000), count };
  await visitsItem.setValue(prune(visits));
}

export async function clearVisits(): Promise<void> {
  await visitsItem.setValue({});
}

export async function hasVisits(): Promise<boolean> {
  return Object.keys(await visitsItem.getValue()).length > 0;
}

function prune(visits: Visits): Visits {
  const entries = Object.entries(visits);
  if (entries.length <= MAX_VISITS) return visits;
  entries.sort((a, b) => b[1].seenAt - a[1].seenAt);
  return Object.fromEntries(entries.slice(0, MAX_VISITS));
}
