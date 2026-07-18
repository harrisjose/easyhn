import { useState } from 'react';
import type { Story } from '@/src/types';
import { upvote } from '@/src/actions';
import { itemUrl, useToast } from '../util';
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
  const toast = useToast();
  const [voted, setVoted] = useState(story.vote.upvoted);

  const href = story.url ?? itemUrl(story.id);

  async function handleVote() {
    if (voted || !story.vote.upvoteUrl) return;
    setVoted(true); // optimistic
    const ok = await upvote(story.vote.upvoteUrl);
    if (!ok) {
      setVoted(false);
      toast('Vote failed — are you logged in?');
    }
  }

  return (
    <article className={`ehn-story${selected ? ' selected' : ''}`} data-index={index}>
      <span className="ehn-rank">{story.rank ?? ''}</span>
      <div className="ehn-story-main">
        <div className="ehn-story-title">
          <a href={href} rel="noopener">
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
            <a className="ehn-domain" href={`https://news.ycombinator.com/from?site=${story.domain}`}>
              {story.domain}
            </a>
          )}
          {story.score != null && <span>{story.score} points</span>}
          {story.author && (
            <a href={`https://news.ycombinator.com/user?id=${story.author}`}>{story.author}</a>
          )}
          {story.ageText && (
            <a href={itemUrl(story.id)} title={story.ageTitle}>
              {story.ageText}
            </a>
          )}
          {!story.isJob && (
            <a href={itemUrl(story.id)}>
              {story.commentCount != null
                ? `${story.commentCount} comment${story.commentCount === 1 ? '' : 's'}`
                : 'discuss'}
            </a>
          )}
        </div>
      </div>
      <button
        className={`ehn-vote${voted ? ' voted' : ''}`}
        onClick={handleVote}
        disabled={!story.vote.canUpvote && !voted}
        title={voted ? 'Upvoted' : 'Upvote'}
        aria-label={voted ? 'Upvoted' : 'Upvote'}
      >
        <UpArrow filled={voted} />
      </button>
    </article>
  );
}
