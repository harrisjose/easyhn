import type { UserComment } from '@/src/types';
import { itemUrl } from '../util';
import { Prose } from './Prose';

/** A flat list of a user's own comments (the profile "Comments" tab). */
export function UserCommentList({ comments }: { comments: UserComment[] }) {
  return (
    <div className="ehn-usercomments">
      {comments.map((c) => (
        <div key={c.id} className="ehn-comment-body">
          <div className="ehn-comment-head">
            {c.ageText && (
              <a href={itemUrl(c.id)} title={c.ageTitle}>
                {c.ageText}
              </a>
            )}
            {c.onStoryTitle && (
              <>
                <span className="sep">·</span>
                {/* Anchored at the comment so the thread opens where it sits,
                    rather than at the top of a page of hundreds. */}
                <a className="ehn-oncomment" href={c.onStoryUrl && `${c.onStoryUrl}#${c.id}`}>
                  {c.onStoryTitle}
                </a>
              </>
            )}
          </div>
          {c.dead ? (
            <div className="ehn-comment-text ehn-dead">[flagged or removed]</div>
          ) : (
            <Prose className="ehn-comment-text" html={c.html} />
          )}
        </div>
      ))}
    </div>
  );
}
