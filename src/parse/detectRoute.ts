import type { ProfileTab, Route } from '@/src/types';

/** Profile sub-pages we redesign as tabs of the user view. */
const PROFILE_TABS: Record<string, ProfileTab> = {
  user: 'about',
  submitted: 'stories',
  threads: 'comments',
  favorites: 'favorites',
  upvoted: 'upvoted',
  hidden: 'hidden',
};

/** Lists we redesign as story lists. Maps pathname (no slash) -> slug. */
const LIST_PATHS: Record<string, string> = {
  '': 'news',
  news: 'news',
  newest: 'newest',
  front: 'front',
  best: 'best',
  ask: 'ask',
  show: 'show',
  shownew: 'show',
  jobs: 'jobs',
  active: 'active',
  classic: 'classic',
  noobstories: 'newest',
};

/**
 * Figure out which kind of HN page we're on from the current location.
 * Anything we don't explicitly handle returns `unknown`, leaving the native
 * page untouched.
 */
export function detectRoute(loc: Location = window.location): Route {
  const path = loc.pathname.replace(/^\/+/, '');
  const params = new URLSearchParams(loc.search);

  if (path === 'item') {
    const itemId = params.get('id') ?? undefined;
    return itemId ? { kind: 'item', itemId } : { kind: 'unknown' };
  }

  if (path in PROFILE_TABS) {
    const tab = PROFILE_TABS[path];
    // /hidden carries no ?id= — it's always the logged-in user's, resolved
    // from the session once the DOM is ready (detection runs at document_start).
    if (tab === 'hidden') return { kind: 'user', tab };
    const userId = params.get('id') ?? undefined;
    return userId ? { kind: 'user', userId, tab } : { kind: 'unknown' };
  }

  if (path in LIST_PATHS) {
    return { kind: 'storylist', list: LIST_PATHS[path] };
  }

  return { kind: 'unknown' };
}
