import { useEffect, useState } from 'react';
import type { ProfilePage, ProfileTab } from '@/src/types';
import { parseUser } from '@/src/parse/parseUser';
import { fetchDoc } from '@/src/actions';
import { PROFILE_TABS, userUrl } from '../util';
import { Prose } from '../components/Prose';
import { UserCommentList } from '../components/UserCommentList';
import { StoryList } from './StoryList';

const STORY_TABS: ProfileTab[] = ['stories', 'favorites', 'upvoted', 'hidden'];

export function Profile({ profile }: { profile: ProfilePage }) {
  const stats = useProfileStats(profile);
  const tabs = PROFILE_TABS.filter((t) => !t.selfOnly || profile.isSelf);

  // About and comments have no rank column, so indent them to share the
  // story-list titles' (and the nav's) left edge; the story tabs align via
  // their own rank column.
  const indentBody = profile.tab === 'about' || profile.tab === 'comments';

  return (
    <div className="ehn-profile">
      <div className="ehn-profile-head">
        <h1 className="ehn-profile-name">{profile.id}</h1>
        <div className="ehn-profile-stats">
          {stats.created && <span>Joined {stats.created}</span>}
          {stats.karma != null && <span>{stats.karma.toLocaleString()} karma</span>}
        </div>
        <nav className="ehn-tabbar">
          {tabs.map((t) => (
            <a key={t.tab} href={t.href(profile.id)} className={t.tab === profile.tab ? 'active' : ''}>
              {t.label}
            </a>
          ))}
        </nav>
      </div>

      <div className={indentBody ? 'ehn-profile-body' : undefined}>
        {profile.tab === 'about' &&
          (profile.aboutHtml ? (
            <Prose className="ehn-about" html={profile.aboutHtml} />
          ) : (
            <Empty />
          ))}

        {profile.tab === 'comments' &&
          (profile.comments && profile.comments.length ? (
            <UserCommentList comments={profile.comments} />
          ) : (
            <Empty />
          ))}

        {STORY_TABS.includes(profile.tab) &&
          (profile.stories && profile.stories.length ? (
            <StoryList stories={profile.stories} moreUrl={profile.moreUrl} />
          ) : (
            <Empty />
          ))}
      </div>
    </div>
  );
}

function Empty() {
  return <div className="ehn-empty">Nothing here yet.</div>;
}

/**
 * Karma and join date only live on the /user page. On other tabs we already
 * have the tab's content from the current page, so fetch just the header
 * details in the background rather than blocking the render.
 */
function useProfileStats(profile: ProfilePage) {
  const [stats, setStats] = useState<{ karma?: number; created?: string }>({
    karma: profile.karma,
    created: profile.created,
  });

  useEffect(() => {
    if (profile.tab === 'about' || profile.karma != null || profile.created) return;
    let cancelled = false;
    fetchDoc(userUrl(profile.id)).then((doc) => {
      if (cancelled || !doc) return;
      const p = parseUser(profile.id, doc);
      if (p) setStats({ karma: p.karma, created: p.created });
    });
    return () => {
      cancelled = true;
    };
  }, [profile.id, profile.tab, profile.karma, profile.created]);

  return stats;
}
