import type { PageModel, ProfilePage, ProfileTab, Route, Session } from '@/src/types';
import { detectRoute } from './detectRoute';
import { parseSession } from './auth';
import { parseStoryList } from './parseStoryList';
import { parseItem } from './parseItem';
import { parseCommentPage } from './parseComment';
import { parseUser } from './parseUser';
import { parseUserComments } from './parseUserComments';

/**
 * Turning a Hacker News page into easyhn's model, in the two phases the content
 * script actually runs in.
 *
 * Nothing in here may import `#imports`: the whole point of this module is that
 * it can be imported outside the extension runtime, which the content-script
 * entrypoint cannot.
 */

/** Where a parse gave up. Named so a bug report identifies the markup that moved. */
export type FailureReason =
  | 'no-item-head'
  | 'no-story-title'
  | 'no-profile-id'
  | 'no-profile-data';

export type ParseResult =
  | { ok: true; page: PageModel; session: Session }
  | { ok: false; reason: FailureReason };

export interface TakeoverPlan {
  /** The route this plan was made for — the header still highlights from it. */
  readonly route: Route;
  /** Second phase: needs a document, so it can only run once the DOM is ready. */
  parse(doc?: Document): ParseResult;
}

/**
 * First phase: decide whether this is a page we take over, from the URL alone.
 * Runs at document_start, before there is a document to read.
 *
 * Null means a native page — the caller must leave it completely alone, which is
 * why this has to be answerable before anything on the page is touched.
 */
export function planTakeover(loc: Location = window.location): TakeoverPlan | null {
  const route = detectRoute(loc);
  if (route.kind === 'unknown') return null;
  return {
    route,
    parse: (doc: Document = document) => parsePage(route, doc),
  };
}

function parsePage(route: Route, doc: Document): ParseResult {
  const session = parseSession(doc);

  switch (route.kind) {
    case 'storylist': {
      // An empty list is a real page (a new account's favorites, say), not a
      // failure — the list view renders its own empty state.
      const { stories, moreUrl } = parseStoryList(doc);
      return { ok: true, page: { kind: 'storylist', stories, moreUrl }, session };
    }

    case 'item': {
      // /item?id= serves both stories and single comments, and the URL doesn't
      // say which — only the page does, so ask the comment parser first (it
      // returns null on a story page).
      const permalink = route.itemId ? parseCommentPage(route.itemId, doc) : null;
      if (permalink) return { ok: true, page: { kind: 'permalink', permalink }, session };

      const item = route.itemId ? parseItem(route.itemId, doc) : null;
      if (!item) return { ok: false, reason: 'no-item-head' };
      // A story page that parsed but produced no title means the head row wasn't
      // the story — the shape the comment/story mix-up used to fail as.
      if (!item.story.title) return { ok: false, reason: 'no-story-title' };
      return { ok: true, page: { kind: 'item', item }, session };
    }

    case 'user': {
      // /hidden carries no id — it's always the logged-in user's own page, which
      // only the session can tell us.
      const id = route.userId ?? (route.tab === 'hidden' ? session.username : undefined);
      if (!id) return { ok: false, reason: 'no-profile-id' };
      const profile = buildProfile(id, route.tab ?? 'about', session, doc);
      if (!profile) return { ok: false, reason: 'no-profile-data' };
      return { ok: true, page: { kind: 'profile', profile }, session };
    }

    default:
      // planTakeover rejected 'unknown' before a plan existed.
      return { ok: false, reason: 'no-item-head' };
  }
}

function buildProfile(
  id: string,
  tab: ProfileTab,
  session: Session,
  doc: Document,
): ProfilePage | null {
  const isSelf =
    session.loggedIn && !!session.username && session.username.toLowerCase() === id.toLowerCase();
  const page: ProfilePage = { id, tab, isSelf };

  if (tab === 'about') {
    const p = parseUser(id, doc);
    if (!p) return null;
    page.karma = p.karma;
    page.created = p.created;
    page.aboutHtml = p.aboutHtml;
  } else if (tab === 'comments') {
    page.comments = parseUserComments(doc);
  } else {
    // stories / favorites / upvoted / hidden are all standard story lists.
    const list = parseStoryList(doc);
    page.stories = list.stories;
    page.moreUrl = list.moreUrl;
  }
  return page;
}
