import { useEffect, useState } from 'react';
import type { ProfilePage, ProfileTab } from '@/src/types';
import { parseUser } from '@/src/parse/parseUser';
import { Prose } from '../components/Prose';
import { UserCommentList } from '../components/UserCommentList';
import { StoryList } from './StoryList';

const HN = 'https://news.ycombinator.com';

const STORY_TABS: ProfileTab[] = ['stories', 'favorites', 'upvoted', 'hidden'];

export function Profile({ profile }: { profile: ProfilePage; loggedIn: boolean }) {
  const stats = useProfileStats(profile);
  const q = encodeURIComponent(profile.id);

  const allTabs: { tab: ProfileTab; label: string; href: string; selfOnly?: boolean }[] = [
    { tab: 'about', label: 'About', href: `${HN}/user?id=${q}` },
    { tab: 'stories', label: 'Stories', href: `${HN}/submitted?id=${q}` },
    { tab: 'comments', label: 'Comments', href: `${HN}/threads?id=${q}` },
    { tab: 'favorites', label: 'Favorites', href: `${HN}/favorites?id=${q}` },
    { tab: 'upvoted', label: 'Upvoted', href: `${HN}/upvoted?id=${q}`, selfOnly: true },
    { tab: 'hidden', label: 'Hidden', href: `${HN}/hidden`, selfOnly: true },
  ];
  const tabs = allTabs.filter((t) => !t.selfOnly || profile.isSelf);

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
            <a key={t.tab} href={t.href} className={t.tab === profile.tab ? 'active' : ''}>
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
    fetch(`${HN}/user?id=${encodeURIComponent(profile.id)}`, { credentials: 'include' })
      .then((r) => r.text())
      .then((html) => {
        if (cancelled) return;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const p = parseUser(profile.id, doc);
        if (p) setStats({ karma: p.karma, created: p.created });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [profile.id, profile.tab, profile.karma, profile.created]);

  return stats;
}
