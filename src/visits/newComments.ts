import type { Comment } from '@/src/types';

/** Shared empty set, for its stable identity: an unmarked thread shouldn't hand
 *  every CommentNode a fresh object on each render. */
export const NO_NEW: ReadonlySet<string> = new Set();

/**
 * Ids of the comments posted since `since` (unix seconds), in render order.
 *
 * Null `since` (no recorded visit) marks nothing — lighting up a whole unread
 * thread would be noise. Undated comments are never new either: HN has put an
 * epoch on every `.age` for years, so a missing one means the markup moved, and
 * marking everything is the worse failure.
 */
export function newSince(comments: Comment[], since: number | null): string[] {
  if (since == null) return [];
  const ids: string[] = [];
  const walk = (cs: Comment[]) => {
    for (const c of cs) {
      if (c.time != null && c.time > since) ids.push(c.id);
      walk(c.children);
    }
  };
  walk(comments);
  return ids;
}
