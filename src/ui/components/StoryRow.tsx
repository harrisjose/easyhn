import type { Story } from '@/src/types';
import { itemUrl, userUrl, fromSiteUrl } from '@/src/hn/urls';
import { plural, newTab, useAppSettings } from '../util';
import { useUpvote } from '../useUpvote';
import { UpArrow } from './icons';

export function StoryRow({
  story,
  index,
  selected,
  showJobBadge = true,
}: {
  story: Story;
  index: number;
  selected: boolean;
  showJobBadge?: boolean;
}) {
  const settings = useAppSettings();
  const { voted, disabled, onVote } = useUpvote(story.vote);

  const href = story.url ?? itemUrl(story.id);
  // Only external article links open in a new tab; self/Ask posts go to the
  // item page in place.
  const titleLinkProps = newTab(!!story.url && settings.openInNewTab);

  return (
    <article className={`ehn-story${selected ? ' selected' : ''}`} data-index={index}>
      <span className="ehn-rank">{story.rank ?? ''}</span>
      <div className="ehn-story-main">
        <div className="ehn-story-title">
          <a href={href} {...titleLinkProps}>
            {story.title}
          </a>
          {story.isJob && showJobBadge && (
            <>
              {' '}
              <span className="ehn-badge">JOB</span>
            </>
          )}
        </div>
        <div className="ehn-meta">
          {story.domain && (
            <a className="ehn-domain" href={fromSiteUrl(story.domain)}>
              {story.domain}
            </a>
          )}
          {story.score != null && <span>{story.score} points</span>}
          {story.author && <a href={userUrl(story.author)}>{story.author}</a>}
          {story.ageText && (
            <a href={itemUrl(story.id)} title={story.ageTitle}>
              {story.ageText}
            </a>
          )}
          {!story.isJob && (
            <a href={itemUrl(story.id)}>
              {story.commentCount != null ? plural(story.commentCount, 'comment') : 'discuss'}
            </a>
          )}
        </div>
      </div>
      <button
        className={`ehn-vote${voted ? ' voted' : ''}`}
        onClick={onVote}
        disabled={disabled}
        title={voted ? 'Upvoted' : 'Upvote'}
        aria-label={voted ? 'Upvoted' : 'Upvote'}
      >
        <UpArrow filled={voted} />
      </button>
    </article>
  );
}
