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

/** Display domain for an external story URL, e.g. "github.com". */
export function domainOf(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

/**
 * Read the "N minutes ago" age from an `.age` element inside `scope`. HN renders
 * it as a link with the relative text and an absolute timestamp `title`.
 */
export function parseAge(scope: Element | null | undefined): {
  ageText?: string;
  ageTitle?: string;
  time?: number;
} {
  const ageEl = scope?.querySelector('.age');
  const ageText = ageEl?.querySelector('a')?.textContent?.trim() || ageEl?.textContent?.trim();
  const ageTitle = ageEl?.getAttribute('title') ?? undefined;
  return { ageText, ageTitle, time: parseEpoch(ageTitle) };
}

/**
 * Unix seconds out of an `.age` title. HN writes both forms in the one
 * attribute — "2026-08-10T06:16:42 1786341758" — so take the epoch it hands us
 * and fall back to the ISO half, which is UTC but written without a zone: hence
 * the appended Z, without which it parses as local time and lands hours out.
 */
export function parseEpoch(ageTitle: string | undefined): number | undefined {
  if (!ageTitle) return undefined;
  const epoch = ageTitle.match(/\b(\d{9,})\b/);
  if (epoch) return Number(epoch[1]);
  const iso = ageTitle.match(/^\d{4}-\d{2}-\d{2}T[\d:]+/);
  if (!iso) return undefined;
  const ms = Date.parse(`${iso[0]}Z`);
  return Number.isNaN(ms) ? undefined : Math.floor(ms / 1000);
}

/**
 * Comment count from a story's `.subtext`. HN links it as "N comments" (or
 * "discuss" for zero) to the item page; returns undefined when absent (jobs).
 */
export function parseCommentCount(subtext: Element | undefined, id: string): number | undefined {
  if (!subtext) return undefined;
  let count: number | undefined;
  subtext.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => {
    const text = a.textContent?.trim().toLowerCase() ?? '';
    const hrefAttr = a.getAttribute('href') ?? '';
    if (/comment|discuss/.test(text) && hrefAttr.includes(`item?id=${id}`)) {
      const n = parseInt(text, 10);
      // "discuss" (no number) means zero comments.
      count = Number.isNaN(n) ? 0 : n;
    }
  });
  return count;
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
