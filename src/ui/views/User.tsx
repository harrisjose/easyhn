import type { UserProfile } from '@/src/types';
import { Prose } from '../components/Prose';

export function User({ profile }: { profile: UserProfile }) {
  return (
    <div className="ehn-profile">
      <h1>{profile.id}</h1>
      <div className="ehn-profile-stats">
        {profile.karma != null && <span>{profile.karma} karma</span>}
        {profile.created && <span>joined {profile.created}</span>}
      </div>

      {profile.aboutHtml && <Prose className="ehn-about" html={profile.aboutHtml} />}

      <div className="ehn-meta" style={{ marginTop: 16 }}>
        {profile.submissionsUrl && <a href={profile.submissionsUrl}>submissions</a>}
        {profile.commentsUrl && <a href={profile.commentsUrl}>comments</a>}
      </div>
    </div>
  );
}
