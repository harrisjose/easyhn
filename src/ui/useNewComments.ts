import { useEffect, useMemo, useState } from 'react';
import type { Comment } from '@/src/types';
import { clearVisits, getVisit, hasVisits, recordVisit } from '@/src/visits/store';
import { NO_NEW, newSince } from '@/src/visits/newComments';

/**
 * Mark the comments added to a thread since the reader last opened it.
 *
 * Read the stored visit before re-stamping it, or opening a thread erases the
 * marks you came back to see. Consequence: opening one counts as reading it,
 * even if you close it again straight away.
 */
export function useNewComments(
  itemId: string,
  comments: Comment[],
  count: number | undefined,
  enabled: boolean,
): { newIds: ReadonlySet<string>; order: string[] } {
  const [since, setSince] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    if (!enabled) {
      setSince(null);
      // Off means we keep nothing — drop history an earlier session left behind.
      void hasVisits().then((any) => {
        if (any) return clearVisits();
      });
      return;
    }

    void (async () => {
      const visit = await getVisit(itemId);
      if (!active) return;
      setSince(visit?.seenAt ?? null);
      await recordVisit(itemId, count);
    })();

    return () => {
      active = false;
    };
  }, [itemId, count, enabled]);

  const order = useMemo(() => newSince(comments, since), [comments, since]);
  const newIds = useMemo(() => (order.length ? new Set(order) : NO_NEW), [order]);

  return { newIds, order };
}
