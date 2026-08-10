import { useEffect, useState } from 'react';
import type { Comment } from '@/src/types';
import { NO_MARKS, type Marks } from '@/src/visits/ledger';
import { useVisitLedger } from './util';

/**
 * Mark the comments added to a thread since the reader last opened it.
 *
 * `comments` is deliberately not a dependency: opening a thread records the
 * visit, so re-running would read back the timestamp it just wrote and decide
 * nothing is new. The page model is parsed once and never mutated, so the tree
 * cannot change under a mounted thread anyway.
 */
export function useNewComments(itemId: string, comments: Comment[], enabled: boolean): Marks {
  const ledger = useVisitLedger();
  const [marks, setMarks] = useState<Marks>(NO_MARKS);

  useEffect(() => {
    if (!enabled) {
      setMarks(NO_MARKS);
      return;
    }
    let active = true;
    void ledger.openThread(itemId, comments).then((m) => {
      if (active) setMarks(m);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [itemId, enabled, ledger]);

  return marks;
}
