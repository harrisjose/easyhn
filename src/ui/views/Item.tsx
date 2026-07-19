import { useState } from 'react';
import type { ItemPage } from '@/src/types';
import { upvote } from '@/src/actions';
import { userUrl, plural, newTab, useToast } from '../util';
import { useSettings } from '@/src/settings/useSettings';
import { CommentNode } from '../components/CommentNode';
import { Composer } from '../components/Composer';
import { Prose } from '../components/Prose';
import { UpArrow, Reply } from '../components/icons';

function totalComments(item: ItemPage): number {
  const count = (cs: ItemPage['comments']): number =>
    cs.reduce((n, c) => n + 1 + count(c.children), 0);
  return count(item.comments);
}

export function Item({ item, loggedIn }: { item: ItemPage; loggedIn: boolean }) {
  const { story } = item;
  const { settings } = useSettings();
  const toast = useToast();
  const [voted, setVoted] = useState(story.vote.upvoted);
  const [composing, setComposing] = useState(false);
  const total = totalComments(item);

  async function handleVote() {
    if (voted || !story.vote.upvoteUrl) return;
    setVoted(true);
    const ok = await upvote(story.vote.upvoteUrl);
    if (!ok) {
      setVoted(false);
      toast('Vote failed — are you logged in?');
    }
  }

  return (
    <div className="ehn-item">
      <div className="ehn-item-head">
        <h1 className="ehn-item-title">
          {story.url ? (
            <a href={story.url} {...newTab(settings.openInNewTab)}>
              {story.title}
            </a>
          ) : (
            story.title
          )}
        </h1>
        <div className="ehn-meta" style={{ marginTop: 10 }}>
          {story.domain && (
            <a
              className="ehn-domain"
              href={`https://news.ycombinator.com/from?site=${story.domain}`}
            >
              {story.domain}
            </a>
          )}
          {story.score != null && <span>{story.score} points</span>}
          {story.author && <a href={userUrl(story.author)}>{story.author}</a>}
          {story.ageText && <span title={story.ageTitle}>{story.ageText}</span>}
          <span className="ehn-item-actions">
            <button
              className={`ehn-vote ehn-vote-lg${voted ? ' voted' : ''}`}
              onClick={handleVote}
              disabled={!story.vote.canUpvote && !voted}
              title={voted ? 'Upvoted' : 'Upvote'}
              aria-label={voted ? 'Upvoted' : 'Upvote'}
            >
              <UpArrow filled={voted} />
            </button>
            {loggedIn && item.commentForm && (
              <button
                className={`ehn-vote ehn-vote-lg${composing ? ' voted' : ''}`}
                onClick={() => setComposing((c) => !c)}
                title="Add a comment"
                aria-label="Add a comment"
              >
                <Reply />
              </button>
            )}
          </span>
        </div>

        {item.textHtml && <Prose className="ehn-text" html={item.textHtml} />}
      </div>

      {/* The comment box stays hidden until the chat icon above is clicked,
          like the per-comment reply boxes. (HN serves the form to logged-out
          users too, but posting would just bounce to login, so it's gated.) */}
      {loggedIn && item.commentForm && composing && (
        <Composer
          form={item.commentForm}
          placeholder="Add a comment…"
          autoFocus
          onPosted={() => setComposing(false)}
          onCancel={() => setComposing(false)}
        />
      )}

      <div className="ehn-comments-count">
        {total > 0 ? plural(total, 'comment') : 'No comments yet'}
      </div>

      {item.comments.map((c) => (
        <CommentNode key={c.id} comment={c} loggedIn={loggedIn} />
      ))}
    </div>
  );
}
