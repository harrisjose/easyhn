import type { ReplyForm } from '@/src/types';
import { parseReplyForm } from '@/src/parse/auth';

/**
 * All write actions reuse the user's existing HN session cookies. We hit the
 * very same endpoints HN's own UI does, so logged-in users keep full account
 * features without us ever handling credentials ourselves.
 */

/** Fetch an HN page (with the user's cookies) and parse it into a Document. */
export async function fetchDoc(url: string): Promise<Document | null> {
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return null;
    return new DOMParser().parseFromString(await res.text(), 'text/html');
  } catch {
    return null;
  }
}

/** Upvote by firing HN's vote link (it carries the auth token). */
export async function upvote(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      redirect: 'follow',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Post a comment/reply. HN's /comment endpoint expects a urlencoded body with
 * the hidden `parent`, `goto`, `hmac` fields plus the comment `text`.
 */
export async function postComment(form: ReplyForm, text: string): Promise<boolean> {
  const body = new URLSearchParams({
    parent: form.parent,
    goto: form.goto,
    hmac: form.hmac,
    text,
  });
  try {
    const res = await fetch('https://news.ycombinator.com/comment', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      redirect: 'follow',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch HN's reply page for a comment and extract its hidden form fields.
 * Used to enable inline replies when the list/item DOM didn't already expose a
 * form for that comment.
 */
export async function fetchReplyForm(replyUrl: string): Promise<ReplyForm | null> {
  const doc = await fetchDoc(replyUrl);
  if (!doc) return null;
  return parseReplyForm(doc.querySelector<HTMLFormElement>('form[action="comment"]')) ?? null;
}
