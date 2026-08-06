import { useState } from 'react';
import type { Comment, ReplyForm } from '@/src/types';
import { fetchReplyForm } from '@/src/actions';
import { userUrl, itemUrl, useToast } from '../util';
import { useUpvote } from '../useUpvote';
import { Composer } from './Composer';
import { Prose } from './Prose';
import { UpArrow, Chevron, Reply } from './icons';

export function CommentNode({ comment, loggedIn }: { comment: Comment; loggedIn: boolean }) {
  const toast = useToast();
  const { voted, canUpvote, handleVote } = useUpvote(comment.vote);
  const [collapsed, setCollapsed] = useState(false);
  const [replyForm, setReplyForm] = useState<ReplyForm | null>(comment.replyForm ?? null);
  const [replying, setReplying] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  async function openReply() {
    setReplying(true);
    if (replyForm || !comment.replyUrl) return;
    setLoadingForm(true);
    const form = await fetchReplyForm(comment.replyUrl);
    setLoadingForm(false);
    if (form) setReplyForm(form);
    else {
      setReplying(false);
      toast('Could not open reply — log in on Hacker News first.');
    }
  }

  return (
    <div className="ehn-comment" id={`ehn-c-${comment.id}`}>
      <div className="ehn-comment-body">
        <div className="ehn-comment-head">
          <button
            className={`ehn-collapse${collapsed ? ' collapsed' : ''}`}
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}
            aria-label={collapsed ? 'Expand thread' : 'Collapse thread'}
          >
            <Chevron />
          </button>
          {comment.author ? (
            <a className="ehn-comment-author" href={userUrl(comment.author)}>
              {comment.author}
            </a>
          ) : (
            <span className="ehn-dead">[deleted]</span>
          )}
          {comment.ageText && (
            <>
              <span className="sep">·</span>
              <a href={itemUrl(comment.id)} title={comment.ageTitle}>
                {comment.ageText}
              </a>
            </>
          )}
          <span className="ehn-comment-actions">
            {(canUpvote || voted) && (
              <button
                onClick={handleVote}
                className={voted ? 'voted' : ''}
                title={voted ? 'Upvoted' : 'Upvote'}
                aria-label={voted ? 'Upvoted' : 'Upvote'}
              >
                <UpArrow filled={voted} />
              </button>
            )}
            {/* Either a reply link to fetch the form from, or (on a comment
                permalink) the form HN already served on the page. */}
            {loggedIn && (comment.replyUrl || replyForm) && (
              <button
                onClick={openReply}
                disabled={loadingForm}
                title="Reply"
                aria-label="Reply"
              >
                <Reply />
              </button>
            )}
          </span>
        </div>

        {!collapsed && (
          <>
            {comment.dead ? (
              <div className="ehn-comment-text ehn-dead">[flagged or removed]</div>
            ) : (
              <Prose className="ehn-comment-text" html={comment.html} />
            )}

            {replying && replyForm && (
              <Composer
                form={replyForm}
                placeholder={`Reply to ${comment.author ?? 'comment'}…`}
                autoFocus
                onPosted={() => setReplying(false)}
                onCancel={() => setReplying(false)}
              />
            )}
          </>
        )}
      </div>

      {!collapsed && comment.children.length > 0 && (
        <div className="ehn-children">
          {comment.children.map((child) => (
            <CommentNode key={child.id} comment={child} loggedIn={loggedIn} />
          ))}
        </div>
      )}
    </div>
  );
}
