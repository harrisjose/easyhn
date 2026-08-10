import type { Story } from '@/src/types';
import { toAbsolute } from '@/src/hn/urls';
import { parseVote, parseAge, parseCommentCount, domainOf } from './auth';

export interface StoryListResult {
  stories: Story[];
  /** Absolute URL of the "More" paginator link, if present. */
  moreUrl?: string;
}

/** Parse a front-page / list page into structured stories. */
export function parseStoryList(doc: Document = document): StoryListResult {
  const stories: Story[] = [];

  // Story rows are `tr.athing` carrying a `.titleline` (excludes comment rows).
  const rows = doc.querySelectorAll<HTMLTableRowElement>('tr.athing');
  rows.forEach((row) => {
    const titleline = row.querySelector('.titleline');
    if (!titleline) return; // not a story row (e.g. a comment athing)
    const story = parseStoryRow(row, titleline);
    if (story) stories.push(story);
  });

  const more = doc.querySelector<HTMLAnchorElement>('a.morelink');
  return { stories, moreUrl: toAbsolute(more?.getAttribute('href')) };
}

function parseStoryRow(row: HTMLTableRowElement, titleline: Element): Story | null {
  const id = row.id;
  if (!id) return null;

  const titleAnchor = titleline.querySelector<HTMLAnchorElement>('a');
  if (!titleAnchor) return null;
  const title = titleAnchor.textContent?.trim() ?? '';
  const href = titleAnchor.getAttribute('href') ?? '';
  const isSelf = href.startsWith('item?id=') || href.startsWith('/item?id=');
  const url = isSelf ? undefined : toAbsolute(href);

  const rankText = row.querySelector('.rank')?.textContent ?? '';
  const rank = parseInt(rankText, 10) || undefined;

  const domain =
    titleline.querySelector('.sitestr')?.textContent?.trim() || domainOf(url);

  // The metadata lives in the following row's `.subtext`.
  const subtext = row.nextElementSibling?.querySelector('.subtext') ?? undefined;

  const scoreText = subtext?.querySelector('.score')?.textContent ?? '';
  const score = parseInt(scoreText, 10);
  const hasScore = !!subtext?.querySelector('.score');

  const author = subtext?.querySelector('.hnuser')?.textContent?.trim() || undefined;

  const { ageText, ageTitle } = parseAge(subtext);

  const commentCount = parseCommentCount(subtext, id);

  return {
    id,
    rank,
    title,
    url,
    domain,
    score: hasScore ? score : undefined,
    author,
    ageText,
    ageTitle,
    commentCount,
    isJob: !hasScore && commentCount === undefined,
    vote: parseVote(id, row),
  };
}
