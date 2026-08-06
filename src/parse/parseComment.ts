import type { CommentPage } from '@/src/types';
import { parseReplyForm, toAbsolute } from './auth';
import { parseCommentRow, parseComments } from './parseItem';

/**
 * Parse an /item page whose id points at a *comment* instead of a story.
 *
 * Nothing in the URL distinguishes the two, so the shape of the page decides:
 * HN puts the comment itself in `table.fatitem` (a `tr.athing` with a
 * `.comhead`, and no `.titleline`), then renders only that comment's replies
 * below it. Returns null for a story page so the caller can fall back to
 * parseItem.
 */
export function parseCommentPage(itemId: string, doc: Document = document): CommentPage | null {
  const row = headRow(itemId, doc);
  if (!row) return null;

  const comment = parseCommentRow(row);
  if (!comment) return null;
  // Replies come from the comment tree below the fatitem; HN restarts their
  // indent at 0, so the subtree parses exactly like a story's comment list.
  comment.children = parseComments(doc);
  // Logged in, HN serves the reply box for this comment inline rather than a
  // "reply" link, so the form on the page belongs to the comment itself.
  comment.replyForm = parseReplyForm(doc.querySelector<HTMLFormElement>('form[action="comment"]'));

  // `.navs` holds HN's own way back: parent (one level up), context (the whole
  // thread anchored at this comment) and, in `.onstory`, the story itself.
  const comhead = row.querySelector('.comhead');
  const onStory = comhead?.querySelector<HTMLAnchorElement>('.onstory a');

  return {
    comment,
    // HN truncates the link text to ~50 chars but keeps the full title in the
    // tooltip, so prefer the attribute and fall back to the visible text.
    onStoryTitle: onStory?.getAttribute('title')?.trim() || onStory?.textContent?.trim() || undefined,
    onStoryUrl: toAbsolute(onStory?.getAttribute('href') ?? undefined),
    parentUrl: navUrl(comhead, 'parent'),
    contextUrl: navUrl(comhead, 'context'),
  };
}

/** The fatitem's own row, but only when it's a comment rather than a story. */
function headRow(itemId: string, doc: Document): HTMLTableRowElement | null {
  const fatitem = doc.querySelector('table.fatitem');
  if (!fatitem) return null;
  // getElementById avoids CSS-escaping numeric HN ids in a `#id` selector.
  const byId = doc.getElementById(itemId);
  const row =
    (byId?.matches('tr.athing') && fatitem.contains(byId) ? (byId as HTMLTableRowElement) : null) ??
    fatitem.querySelector<HTMLTableRowElement>('tr.athing');
  if (!row || row.querySelector('.titleline')) return null;
  // `.comhead` alone would miss nothing on live HN, but dead comments have no
  // `.commtext`, so check both rather than depending on the body being there.
  return row.querySelector('.comhead') || row.querySelector('.commtext') ? row : null;
}

/** Find one of HN's `.navs` links by its label ("parent", "context", …). */
function navUrl(scope: Element | null | undefined, label: string): string | undefined {
  const links = scope?.querySelectorAll<HTMLAnchorElement>('.navs a') ?? [];
  for (const a of links) {
    if (a.textContent?.trim().toLowerCase() === label) {
      return toAbsolute(a.getAttribute('href') ?? undefined);
    }
  }
  return undefined;
}
