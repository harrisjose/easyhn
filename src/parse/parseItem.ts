import type { Comment, ItemPage, Story } from '@/src/types';
import { parseVote, parseReplyForm, parseAge, parseCommentCount, domainOf, toAbsolute } from './auth';

/** Parse an /item page: the story header + its full comment tree. */
export function parseItem(itemId: string, doc: Document = document): ItemPage | null {
  const fatitem = doc.querySelector('table.fatitem');
  // getElementById avoids CSS-escaping numeric HN ids in a `#id` selector.
  const byId = doc.getElementById(itemId);
  const headRow =
    (byId?.matches('tr.athing') ? (byId as HTMLTableRowElement) : null) ??
    (fatitem ?? doc).querySelector<HTMLTableRowElement>('tr.athing');
  if (!headRow) return null;

  const story = parseHeader(headRow, itemId);
  const textHtml = parseSelfText(fatitem);
  const commentForm = parseReplyForm(
    (fatitem ?? doc).querySelector<HTMLFormElement>('form[action="comment"]'),
  );

  const comments = parseComments(doc);

  return { story, textHtml, comments, commentForm };
}

function parseHeader(row: HTMLTableRowElement, id: string): Story {
  const titleline = row.querySelector('.titleline');
  const titleAnchor = titleline?.querySelector<HTMLAnchorElement>('a');
  const title = titleAnchor?.textContent?.trim() ?? row.textContent?.trim() ?? '';
  const href = titleAnchor?.getAttribute('href') ?? '';
  const isSelf = !href || href.startsWith('item?id=') || href.startsWith('/item?id=');
  const url = isSelf ? undefined : toAbsolute(href);

  const subtext = row.nextElementSibling?.querySelector('.subtext') ?? undefined;
  const scoreText = subtext?.querySelector('.score')?.textContent ?? '';
  const hasScore = !!subtext?.querySelector('.score');
  const author = subtext?.querySelector('.hnuser')?.textContent?.trim() || undefined;
  const { ageText, ageTitle } = parseAge(subtext);
  const commentCount = parseCommentCount(subtext, id);

  return {
    id,
    title,
    url,
    domain: titleline?.querySelector('.sitestr')?.textContent?.trim() || domainOf(url),
    score: hasScore ? parseInt(scoreText, 10) : undefined,
    author,
    ageText,
    ageTitle,
    commentCount,
    isJob: !hasScore,
    vote: parseVote(id, row),
  };
}

/** Self/Ask text lives in `.toptext` on modern HN; fall back to a content scan. */
function parseSelfText(fatitem: Element | null): string | undefined {
  if (!fatitem) return undefined;
  const toptext = fatitem.querySelector('.toptext');
  if (toptext && toptext.textContent?.trim()) return toptext.innerHTML.trim();
  return undefined;
}

function parseComments(doc: Document): Comment[] {
  const rows = Array.from(doc.querySelectorAll<HTMLTableRowElement>('tr.comtr'));
  const roots: Comment[] = [];
  // Stack of [depth, comment] used to attach each row under its parent.
  const stack: Comment[] = [];

  for (const row of rows) {
    const comment = parseCommentRow(row);
    if (!comment) continue;

    while (stack.length && stack[stack.length - 1].depth >= comment.depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      roots.push(comment);
    } else {
      stack[stack.length - 1].children.push(comment);
    }
    stack.push(comment);
  }

  return roots;
}

function parseCommentRow(row: HTMLTableRowElement): Comment | null {
  const id = row.id;
  if (!id) return null;

  const ind = row.querySelector('.ind');
  const depth =
    Number(ind?.getAttribute('indent')) ||
    Math.round(Number(ind?.querySelector('img')?.getAttribute('width') ?? 0) / 40);

  const author = row.querySelector('.hnuser')?.textContent?.trim() || undefined;
  const { ageText, ageTitle } = parseAge(row);

  const commtext = row.querySelector('.commtext');
  const dead = !commtext;
  // Strip HN's trailing inline "reply" widget from the captured HTML — we render our own.
  const html = commtext ? stripReply(commtext) : '';

  const replyUrl = toAbsolute(
    row.querySelector<HTMLAnchorElement>('.reply a[href^="reply"]')?.getAttribute('href') ?? undefined,
  );

  return {
    id,
    author,
    ageText,
    ageTitle,
    html,
    depth: Number.isFinite(depth) ? depth : 0,
    vote: parseVote(id, row),
    replyUrl,
    children: [],
    dead,
  };
}

export function stripReply(commtext: Element): string {
  const clone = commtext.cloneNode(true) as Element;
  clone.querySelector('.reply')?.remove();
  return clone.innerHTML.trim();
}
