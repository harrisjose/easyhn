// Shared types for the parsed Hacker News model.

export type RouteKind =
  | 'storylist' // /news, /newest, /ask, /show, /jobs, /front, /best, etc.
  | 'item' // /item?id=
  | 'user' // /user?id=
  | 'unknown'; // anything we don't redesign — fall back to native page

export type ProfileTab = 'about' | 'stories' | 'comments' | 'favorites' | 'upvoted' | 'hidden';

/**
 * One Hacker News page, as easyhn models it. Produced by the Takeover module
 * and rendered as-is — nothing downstream touches HN's markup.
 */
export type PageModel =
  | { kind: 'storylist'; stories: Story[]; moreUrl?: string }
  | { kind: 'item'; item: ItemPage }
  | { kind: 'permalink'; permalink: CommentPage }
  | { kind: 'profile'; profile: ProfilePage };

export interface Route {
  kind: RouteKind;
  /** The HN list slug for story lists (news, newest, ask, show, jobs, front, best). */
  list?: string;
  /** Item id for item routes. */
  itemId?: string;
  /** Username for user routes. */
  userId?: string;
  /** Which profile tab a user route is showing. */
  tab?: ProfileTab;
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
  score?: number;
  author?: string;
  ageText?: string;
  ageTitle?: string;
  commentCount?: number;
  /** Whether this is a job posting (no score / no comments / no vote). */
  isJob: boolean;
  vote: VoteState;
}

export interface VoteState {
  /** Whether an upvote arrow is present (i.e. votable + not yet voted). */
  canUpvote: boolean;
  /** href for the upvote action (carries the auth token). */
  upvoteUrl?: string;
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

/**
 * A permalink to a single comment (`/item?id=` pointing at a comment rather
 * than a story). HN renders the comment in place of the story header and only
 * its own replies below, so the thread it belongs to has to come from the
 * navigation links in its header.
 */
export interface CommentPage {
  /** The linked comment, with its reply subtree as children. */
  comment: Comment;
  /** Title of the story the thread belongs to (HN's "on:" link). */
  onStoryTitle?: string;
  onStoryUrl?: string;
  /** One level up — the parent comment, or the story for a top-level comment. */
  parentUrl?: string;
  /** The whole thread anchored at this comment (HN's "context" link). */
  contextUrl?: string;
}

export interface Comment {
  id: string;
  author?: string;
  ageText?: string;
  ageTitle?: string;
  /** Posted-at in unix seconds, read off the age tooltip. Undefined if HN's
   *  markup didn't carry one — see parseEpoch. */
  time?: number;
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
}

/** One of a user's own comments, as shown on the /threads page. */
export interface UserComment {
  id: string;
  author?: string;
  ageText?: string;
  ageTitle?: string;
  html: string;
  /** The story this comment was posted on. */
  onStoryTitle?: string;
  onStoryUrl?: string;
  vote: VoteState;
  dead: boolean;
}

/** A user profile with the content of the active tab. */
export interface ProfilePage {
  id: string;
  tab: ProfileTab;
  isSelf: boolean;
  karma?: number;
  created?: string;
  /** about tab */
  aboutHtml?: string;
  /** story-list tabs: stories / favorites / upvoted / hidden */
  stories?: Story[];
  moreUrl?: string;
  /** comments tab */
  comments?: UserComment[];
}
