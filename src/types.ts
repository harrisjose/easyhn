// Shared types for the parsed Hacker News model.

export type RouteKind =
  | 'storylist' // /news, /newest, /ask, /show, /jobs, /front, /best, etc.
  | 'item' // /item?id=
  | 'user' // /user?id=
  | 'unknown'; // anything we don't redesign — fall back to native page

export interface Route {
  kind: RouteKind;
  /** The HN list slug for story lists (news, newest, ask, show, jobs, front, best). */
  list?: string;
  /** Item id for item routes. */
  itemId?: string;
  /** Username for user routes. */
  userId?: string;
}

/** Logged-in session info scraped from the page header. */
export interface Session {
  loggedIn: boolean;
  username?: string;
  karma?: number;
  logoutUrl?: string;
}

export interface Story {
  id: string;
  rank?: number;
  title: string;
  /** External URL, or undefined for text/Ask posts. */
  url?: string;
  /** Display domain, e.g. "github.com". */
  domain?: string;
  /** True for Ask/Show/text posts that link to their own item page. */
  isSelf: boolean;
  score?: number;
  author?: string;
  ageText?: string;
  ageTitle?: string;
  commentCount?: number;
  /** Whether this is a job posting (no score / no comments / no vote). */
  isJob: boolean;
  vote: VoteState;
  /** "favorite" / "hide" / "flag" links available on the row, if any. */
  favoriteUrl?: string;
  flagUrl?: string;
}

export interface VoteState {
  /** Whether an upvote arrow is present (i.e. votable + not yet voted). */
  canUpvote: boolean;
  /** href for the upvote action (carries the auth token). */
  upvoteUrl?: string;
  /** href for the unvote action, present when the user has already upvoted. */
  unvoteUrl?: string;
  /** Whether the user has already upvoted this item. */
  upvoted: boolean;
}

export interface ItemPage {
  story: Story;
  /** Rendered HTML body for text/Ask posts. */
  textHtml?: string;
  comments: Comment[];
  /** Top-level comment form (for adding a comment to the story). */
  commentForm?: ReplyForm;
}

export interface Comment {
  id: string;
  author?: string;
  ageText?: string;
  ageTitle?: string;
  /** Rendered comment HTML (sanitised subset HN produces). */
  html: string;
  depth: number;
  vote: VoteState;
  /** href to HN's reply page (fallback) — carries goto/parent context. */
  replyUrl?: string;
  /** Inline reply form fields if HN exposed them on this comment. */
  replyForm?: ReplyForm;
  children: Comment[];
  /** "[flagged]" / "[dead]" style placeholders have no author. */
  dead: boolean;
}

/** Hidden fields needed to POST a comment/reply to HN's /comment endpoint. */
export interface ReplyForm {
  parent: string;
  goto: string;
  hmac: string;
}

export interface UserProfile {
  id: string;
  created?: string;
  karma?: number;
  aboutHtml?: string;
  submissionsUrl?: string;
  commentsUrl?: string;
  /** True if viewing one's own (editable) profile. */
  isSelf: boolean;
}
