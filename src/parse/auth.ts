import type { Session, VoteState, ReplyForm } from '@/src/types';

/** Resolve an HN-relative href (e.g. "vote?id=1") to an absolute URL. */
export function toAbsolute(href: string | null | undefined): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href, 'https://news.ycombinator.com/').href;
  } catch {
    return undefined;
  }
}

/**
 * Read the logged-in session from the page header.
 * When logged in, HN renders `<a id="me">username</a> (karma)` and a logout link.
 */
export function parseSession(doc: Document = document): Session {
  const me = doc.querySelector<HTMLAnchorElement>('a#me');
  if (!me) {
    return { loggedIn: false };
  }
  const username = me.textContent?.trim() || undefined;

  // Karma sits in the same header cell, in the form "user (1234)".
  let karma: number | undefined;
  const cellText = me.parentElement?.textContent ?? '';
  const karmaMatch = cellText.match(/\((\d+)\)/);
  if (karmaMatch) karma = Number(karmaMatch[1]);

  const logout = doc.querySelector<HTMLAnchorElement>('a#logout');

  return {
    loggedIn: true,
    username,
    karma,
    logoutUrl: toAbsolute(logout?.getAttribute('href')),
  };
}

/**
 * Derive vote state for an item from its `#up_<id>` / `#un_<id>` vote links.
 * HN hides the unvote link until you've voted (class "nosee"), and shows the
 * upvote arrow only when an unvoted, votable item is present.
 */
export function parseVote(id: string, scope: ParentNode = document): VoteState {
  const up = scope.querySelector<HTMLAnchorElement>(`#up_${cssEscape(id)}`);
  const un = scope.querySelector<HTMLAnchorElement>(`#un_${cssEscape(id)}`);

  const upHidden = !up || up.classList.contains('nosee');
  const unHidden = !un || un.classList.contains('nosee');

  return {
    canUpvote: !upHidden,
    upvoteUrl: toAbsolute(up?.getAttribute('href')),
    unvoteUrl: toAbsolute(un?.getAttribute('href')),
    upvoted: !unHidden,
  };
}

/**
 * Pull the hidden fields out of an HN comment/reply <form> so we can re-POST it.
 */
export function parseReplyForm(form: HTMLFormElement | null): ReplyForm | undefined {
  if (!form) return undefined;
  const get = (name: string) =>
    form.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value;
  const parent = get('parent');
  const hmac = get('hmac');
  if (!parent || !hmac) return undefined;
  return { parent, goto: get('goto') ?? '', hmac };
}

/** Minimal CSS.escape fallback (ids on HN are numeric, but be safe). */
function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(value);
  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}
