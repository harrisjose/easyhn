import type { ReplyForm, UserProfile } from '@/src/types';
import { parseReplyForm } from '@/src/parse/auth';
import { parseUser } from '@/src/parse/parseUser';
import { HN_ORIGIN, userUrl } from './urls';

/**
 * Everything easyhn asks Hacker News to do. Every call goes to the same
 * endpoints HN's own UI uses, carrying the reader's existing session cookies —
 * which is why voting and replying work without easyhn ever seeing credentials.
 *
 * Nothing in here may import `#imports`: the transport is passed in, so the
 * optimistic-write paths above it can be tested against a fake.
 */

/** How to talk to HN in this environment. Two adapters: fetch, and a fake. */
export interface HnTransport {
  /** GET a page and parse it. Null when the request failed. */
  getDocument(url: string): Promise<Document | null>;
  /** GET, following redirects. True when HN accepted it. */
  get(url: string): Promise<boolean>;
  /** POST form-encoded. True when HN accepted it. */
  postForm(url: string, body: URLSearchParams): Promise<boolean>;
}

export interface HnClient {
  /** The vote link carries the authorisation, so following it is the vote. */
  upvote(voteLink: string): Promise<boolean>;
  postComment(form: ReplyForm, text: string): Promise<boolean>;
  /** For comments whose DOM didn't already carry a reply form. */
  fetchReplyForm(replyUrl: string): Promise<ReplyForm | null>;
  /** Karma and join date, which only live on a profile's About page. */
  fetchProfile(id: string): Promise<UserProfile | null>;
}

export function createHnClient(transport: HnTransport): HnClient {
  return {
    upvote(voteLink) {
      return transport.get(voteLink);
    },

    postComment(form, text) {
      // `parent`/`goto`/`hmac` come from HN's own hidden form fields.
      return transport.postForm(
        `${HN_ORIGIN}/comment`,
        new URLSearchParams({ parent: form.parent, goto: form.goto, hmac: form.hmac, text }),
      );
    },

    async fetchReplyForm(replyUrl) {
      const doc = await transport.getDocument(replyUrl);
      if (!doc) return null;
      return parseReplyForm(doc.querySelector<HTMLFormElement>('form[action="comment"]')) ?? null;
    },

    async fetchProfile(id) {
      const doc = await transport.getDocument(userUrl(id));
      if (!doc) return null;
      return parseUser(id, doc);
    },
  };
}

/** The real transport: fetch, with the reader's cookies. */
export const fetchTransport: HnTransport = {
  async getDocument(url) {
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return null;
      return new DOMParser().parseFromString(await res.text(), 'text/html');
    } catch {
      return null;
    }
  },

  async get(url) {
    try {
      const res = await fetch(url, { method: 'GET', credentials: 'include', redirect: 'follow' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async postForm(url, body) {
    try {
      const res = await fetch(url, {
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
  },
};
