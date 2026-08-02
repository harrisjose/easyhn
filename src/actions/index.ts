import type { ReplyForm } from '@/src/types';
import { parseReplyForm } from '@/src/parse/auth';

// Every action here posts to the same endpoints HN's own UI does, carrying the
// user's existing session cookies. That is why voting and replying work without
// this extension ever seeing credentials.

export async function fetchDoc(url: string): Promise<Document | null> {
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return null;
    return new DOMParser().parseFromString(await res.text(), 'text/html');
  } catch {
    return null;
  }
}

/** The vote href carries HN's auth token, so fetching it is the whole action. */
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

/** `parent`/`goto`/`hmac` come from HN's own hidden form fields — see ReplyForm. */
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

/** Fallback for comments whose DOM didn't already carry a reply form. */
export async function fetchReplyForm(replyUrl: string): Promise<ReplyForm | null> {
  const doc = await fetchDoc(replyUrl);
  if (!doc) return null;
  return parseReplyForm(doc.querySelector<HTMLFormElement>('form[action="comment"]')) ?? null;
}
