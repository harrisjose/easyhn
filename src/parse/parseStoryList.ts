import type { Story } from '@/src/types';
import { parseVote, toAbsolute } from './auth';

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

  const ageEl = subtext?.querySelector('.age');
  const ageText = ageEl?.querySelector('a')?.textContent?.trim() || ageEl?.textContent?.trim();
  const ageTitle = ageEl?.getAttribute('title') ?? undefined;

  const { commentCount, favoriteUrl, flagUrl } = parseSubLinks(subtext, id);

  return {
    id,
    rank,
    title,
    url,
    domain,
    isSelf,
    score: hasScore ? score : undefined,
    author,
    ageText,
    ageTitle,
    commentCount,
    isJob: !hasScore && commentCount === undefined,
    vote: parseVote(id, row.parentElement ?? document),
    favoriteUrl,
    flagUrl,
  };
}

function parseSubLinks(subtext: Element | undefined, id: string) {
  let commentCount: number | undefined;
  let favoriteUrl: string | undefined;
  let flagUrl: string | undefined;
  if (!subtext) return { commentCount, favoriteUrl, flagUrl };

  subtext.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => {
    const text = a.textContent?.trim().toLowerCase() ?? '';
    const hrefAttr = a.getAttribute('href') ?? '';
    if (/comment|discuss/.test(text) && hrefAttr.includes(`item?id=${id}`)) {
      const n = parseInt(text, 10);
      commentCount = Number.isNaN(n) ? 0 : n;
    } else if (hrefAttr.startsWith('fave')) {
      favoriteUrl = toAbsolute(hrefAttr);
    } else if (hrefAttr.startsWith('flag')) {
      flagUrl = toAbsolute(hrefAttr);
    }
  });

  // "discuss" link with no count means zero comments.
  if (commentCount === undefined && subtext.querySelector(`a[href*="item?id=${id}"]`)) {
    const itemLinks = subtext.querySelectorAll<HTMLAnchorElement>(`a[href*="item?id=${id}"]`);
    itemLinks.forEach((a) => {
      if (/discuss/.test(a.textContent?.toLowerCase() ?? '')) commentCount = 0;
    });
  }

  return { commentCount, favoriteUrl, flagUrl };
}

function domainOf(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}
