import type { ReplyForm } from '@/src/types';

/**
 * All write actions reuse the user's existing HN session cookies. We hit the
 * very same endpoints HN's own UI does, so logged-in users keep full account
 * features without us ever handling credentials ourselves.
 */

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
  try {
    const res = await fetch(replyUrl, { credentials: 'include' });
    if (!res.ok) return null;
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const form = doc.querySelector('form[action="comment"]');
    const get = (name: string) =>
      form?.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value;
    const parent = get('parent');
    const hmac = get('hmac');
    if (!parent || !hmac) return null;
    return { parent, goto: get('goto') ?? '', hmac };
  } catch {
    return null;
  }
}
