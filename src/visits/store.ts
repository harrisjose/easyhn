import { storage } from '#imports';
import type { Visits, VisitStore } from './ledger';

/**
 * Reading state lives in `storage.local`, never the `storage.sync` area the
 * settings use: it rewrites on every thread opened, and Chrome caps sync at
 * ~100KB across 512 items — a few hundred threads would exhaust that and start
 * failing the writes carrying the user's actual settings. See ADR-0002.
 */
const visitsItem = storage.defineItem<Visits>('local:visits', {
  fallback: {},
  version: 2,
  migrations: {
    // v1 also stored HN's comment count at the time of the visit. Nothing ever
    // read it, so drop it rather than carry it forward on every write.
    2: (visits: Record<string, { seenAt: number; count?: number }>) =>
      Object.fromEntries(Object.entries(visits).map(([id, v]) => [id, { seenAt: v.seenAt }])),
  },
});

/** The only binding between the visit ledger and the extension runtime. */
export const extensionVisitStore: VisitStore = {
  read: () => visitsItem.getValue(),
  write: (visits) => visitsItem.setValue(visits),
};
