import { useRef } from 'react';
import type { CommentPage } from '@/src/types';
import { useCommentAnchor } from '../useCommentAnchor';
import { CommentNode } from '../components/CommentNode';
import { BackArrow } from '../components/icons';

function replyCount(page: CommentPage): number {
  const count = (cs: CommentPage['comment']['children']): number =>
    cs.reduce((n, c) => n + 1 + count(c.children), 0);
  return count(page.comment.children);
}

/**
 * A permalink to one comment. HN gives this page no story header at all, so the
 * thread it came from is the first thing we show — the title links into the full
 * discussion at this comment, with "parent" for one level up.
 */
export function SingleComment({ page, loggedIn }: { page: CommentPage; loggedIn: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useCommentAnchor(containerRef);
  const replies = replyCount(page);
  const threadUrl = page.contextUrl ?? page.onStoryUrl;

  return (
    <div className="ehn-item" ref={containerRef}>
      <div className="ehn-item-head">
        {page.onStoryTitle && (
          <h1 className="ehn-item-title ehn-crumb">
            <a href={threadUrl}>
              <BackArrow className="ehn-crumb-arrow" />
              {page.onStoryTitle}
            </a>
          </h1>
        )}
        <div className="ehn-meta" style={{ marginTop: 10 }}>
          <span>A single comment</span>
          {replies > 0 && <span>{replies === 1 ? '1 reply' : `${replies} replies`}</span>}
          {page.parentUrl && <a href={page.parentUrl}>parent</a>}
          {/* The title above is the way into the thread; this is the fallback
              for the rare page that carries no "on:" title to hang it on. */}
          {!page.onStoryTitle && threadUrl && <a href={threadUrl}>whole thread</a>}
        </div>
      </div>

      <CommentNode comment={page.comment} loggedIn={loggedIn} />
    </div>
  );
}
