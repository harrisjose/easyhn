import type { Route } from '@/src/types';
import { LIST_PATHS, PROFILE_TAB_BY_PATH } from '@/src/hn/urls';

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

  if (path in PROFILE_TAB_BY_PATH) {
    const { tab, idless } = PROFILE_TAB_BY_PATH[path];
    // An idless tab (/hidden) is always the logged-in user's, resolved from the
    // session once the DOM is ready (detection runs at document_start).
    if (idless) return { kind: 'user', tab };
    const userId = params.get('id') ?? undefined;
    return userId ? { kind: 'user', userId, tab } : { kind: 'unknown' };
  }

  if (path in LIST_PATHS) {
    return { kind: 'storylist', list: LIST_PATHS[path] };
  }

  return { kind: 'unknown' };
}
