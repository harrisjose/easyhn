import type { Comment } from '@/src/types';
import { NO_NEW, newSince } from './newComments';

/**
 * The record of which threads the reader has opened, and what that makes new.
 *
 * Nothing in here may import `#imports`: the ordering this module exists to
 * protect is only testable because the module can be imported outside the
 * extension runtime. The storage adapter is passed in.
 */

/** What we remember about one thread we've opened. */
export interface Visit {
  /** Unix seconds when the thread was last opened. */
  seenAt: number;
}

export type Visits = Record<string, Visit>;

/** Where a ledger keeps its visits. Two adapters: extension storage, and a fake. */
export interface VisitStore {
  read(): Promise<Visits>;
  write(visits: Visits): Promise<void>;
}

/** Comments added since the reader's last visit, in render order. */
export interface Marks {
  newIds: ReadonlySet<string>;
  order: string[];
}

export const NO_MARKS: Marks = { newIds: NO_NEW, order: [] };

/** Threads to remember; reading state older than that is worthless. */
const MAX_VISITS = 400;

export interface VisitLedger {
  /**
   * Open a thread: mark what arrived since last time, then record that it has
   * now been seen. Reading the stored visit before re-stamping it is the whole
   * job — do it the other way round and opening a thread erases the marks you
   * came back for. Consequence: opening a thread counts as reading it, even if
   * it is closed again straight away.
   */
  openThread(itemId: string, comments: Comment[]): Promise<Marks>;
}

export function createLedger(store: VisitStore): VisitLedger {
  return {
    async openThread(itemId, comments) {
      const visits = await store.read();
      const since = visits[itemId]?.seenAt ?? null;

      visits[itemId] = { seenAt: Math.floor(Date.now() / 1000) };
      await store.write(prune(visits));

      const order = newSince(comments, since);
      return { order, newIds: order.length ? new Set(order) : NO_NEW };
    },
  };
}

/** An in-memory ledger, for tests and for anywhere storage isn't available. */
export function inMemoryVisitStore(initial: Visits = {}): VisitStore {
  let visits: Visits = { ...initial };
  return {
    read: async () => ({ ...visits }),
    write: async (next) => {
      visits = { ...next };
    },
  };
}

function prune(visits: Visits): Visits {
  const entries = Object.entries(visits);
  if (entries.length <= MAX_VISITS) return visits;
  entries.sort((a, b) => b[1].seenAt - a[1].seenAt);
  return Object.fromEntries(entries.slice(0, MAX_VISITS));
}
