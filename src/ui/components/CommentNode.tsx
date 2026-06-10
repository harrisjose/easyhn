import { useState } from 'react';
import type { Comment, ReplyForm } from '@/src/types';
import { upvote, fetchReplyForm } from '@/src/actions';
import { userUrl, itemUrl, useToast } from '../util';
import { Composer } from './Composer';
import { Prose } from './Prose';
import { UpArrow, Chevron, Reply } from './icons';

function countDescendants(c: Comment): number {
  return c.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

export function CommentNode({ comment }: { comment: Comment }) {
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [voted, setVoted] = useState(comment.vote.upvoted);
  const [replyForm, setReplyForm] = useState<ReplyForm | null>(comment.replyForm ?? null);
  const [replying, setReplying] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  const hidden = countDescendants(comment);

  async function handleVote() {
    if (voted || !comment.vote.upvoteUrl) return;
    setVoted(true);
    const ok = await upvote(comment.vote.upvoteUrl);
    if (!ok) {
      setVoted(false);
      toast('Vote failed — are you logged in?');
    }
  }

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
            {collapsed && hidden > 0 && <span className="ehn-collapse-count">{hidden}</span>}
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
            {(comment.vote.canUpvote || voted) && (
              <button
                onClick={handleVote}
                className={voted ? 'voted' : ''}
                title={voted ? 'Upvoted' : 'Upvote'}
                aria-label={voted ? 'Upvoted' : 'Upvote'}
              >
                <UpArrow filled={voted} />
              </button>
            )}
            {comment.replyUrl && (
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
            <CommentNode key={child.id} comment={child} />
          ))}
        </div>
      )}
    </div>
  );
}
