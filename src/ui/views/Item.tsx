import { useCallback, useMemo, useRef, useState } from 'react';
import type { ItemPage } from '@/src/types';
import { userUrl, fromSiteUrl } from '@/src/hn/urls';
import { plural, newTab, useAppSettings } from '../util';
import { useUpvote } from '../useUpvote';
import { useCommentAnchor } from '../useCommentAnchor';
import { useNewComments } from '../useNewComments';
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
  const settings = useAppSettings();
  const { voted, disabled, onVote } = useUpvote(story.vote);
  const [composing, setComposing] = useState(false);
  const total = useMemo(() => totalComments(item), [item]);
  const containerRef = useRef<HTMLDivElement>(null);
  // Comment permalinks link back here as item?id=<story>#<comment>.
  useCommentAnchor(containerRef);
  const { newIds, order: newOrder } = useNewComments(
    story.id,
    item.comments,
    settings.highlightNew,
  );
  const nextNew = useRef(0);

  const jumpToNew = useCallback(() => {
    if (!newOrder.length) return;
    const id = newOrder[nextNew.current % newOrder.length];
    nextNew.current += 1;
    const el = containerRef.current?.querySelector<HTMLElement>(`#ehn-c-${id}`);
    // Scroll the comment's own row, not the element: `.ehn-comment` wraps its
    // whole reply subtree (same reasoning as useCommentAnchor).
    const row = el?.querySelector<HTMLElement>(':scope > .ehn-comment-body') ?? el;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row?.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' });
  }, [newOrder]);

  return (
    <div className="ehn-item" ref={containerRef}>
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
            <a className="ehn-domain" href={fromSiteUrl(story.domain)}>
              {story.domain}
            </a>
          )}
          {story.score != null && <span>{story.score} points</span>}
          {story.author && <a href={userUrl(story.author)}>{story.author}</a>}
          {story.ageText && <span title={story.ageTitle}>{story.ageText}</span>}
          <span className="ehn-item-actions">
            <button
              className={`ehn-vote ehn-vote-lg${voted ? ' voted' : ''}`}
              onClick={onVote}
              disabled={disabled}
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
        <span>{total > 0 ? plural(total, 'comment') : 'No comments yet'}</span>
        {newOrder.length > 0 && (
          <button
            className="ehn-newjump"
            onClick={jumpToNew}
            title="Jump to the next comment added since your last visit"
          >
            {newOrder.length} new
          </button>
        )}
      </div>

      {item.comments.map((c) => (
        <CommentNode key={c.id} comment={c} loggedIn={loggedIn} newIds={newIds} />
      ))}
    </div>
  );
}
