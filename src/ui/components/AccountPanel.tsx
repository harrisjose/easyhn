import type { Session } from '@/src/types';
import { userUrl } from '../util';
import { Close } from './icons';

const HN = 'https://news.ycombinator.com';

/** The header user button opens this: an account menu when signed in, or a
 *  login modal when signed out. */
export function AccountPanel({ session, onClose }: { session: Session; onClose: () => void }) {
  return session.loggedIn ? (
    <UserMenu session={session} onClose={onClose} />
  ) : (
    <LoginModal onClose={onClose} />
  );
}

function UserMenu({ session, onClose }: { session: Session; onClose: () => void }) {
  const u = session.username ?? '';
  const q = encodeURIComponent(u);
  const links = [
    { label: 'Stories', href: `${HN}/submitted?id=${q}` },
    { label: 'Comments', href: `${HN}/threads?id=${q}` },
    { label: 'Favorites', href: `${HN}/favorites?id=${q}` },
    { label: 'Upvoted', href: `${HN}/upvoted?id=${q}` },
    { label: 'Hidden', href: `${HN}/hidden` },
  ];
  return (
    <div className="ehn-overlay bare" onClick={onClose}>
      <div className="ehn-menu" onClick={(e) => e.stopPropagation()}>
        <a className="ehn-menu-head" href={userUrl(u)}>
          <strong>{u}</strong>
          {session.karma != null && <span>{session.karma.toLocaleString()} karma</span>}
        </a>
        <div className="ehn-menu-sep" />
        {links.map((l) => (
          <a key={l.label} className="ehn-menu-item" href={l.href}>
            {l.label}
          </a>
        ))}
        {session.logoutUrl && (
          <>
            <div className="ehn-menu-sep" />
            <a className="ehn-menu-item" href={session.logoutUrl}>
              Logout
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function LoginModal({ onClose }: { onClose: () => void }) {
  // Return to the current page after login. HN's `goto` is a path relative to
  // the site root (e.g. "item?id=1" or "news").
  const goto = location.href.slice(location.origin.length + 1) || 'news';
  return (
    <div className="ehn-overlay center" onClick={onClose}>
      <div className="ehn-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ehn-modal-head">
          <strong>Login</strong>
          <button className="ehn-iconbtn" onClick={onClose} aria-label="Close">
            <Close />
          </button>
        </div>
        {/* Native POST to HN's real login endpoint — the browser submits the
            password directly to Hacker News and sets the session cookie; our
            code never reads or forwards it. */}
        <form action={`${HN}/login`} method="post" autoComplete="on">
          <div className="ehn-modal-body">
            <input type="hidden" name="goto" value={goto} />
            <label className="ehn-login-row" htmlFor="ehn-login-acct">
              <span>Username</span>
              <input
                id="ehn-login-acct"
                name="acct"
                type="text"
                autoComplete="username"
                autoFocus
                required
              />
            </label>
            <label className="ehn-login-row" htmlFor="ehn-login-pw">
              <span>Password</span>
              <input
                id="ehn-login-pw"
                name="pw"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
          </div>
          <div className="ehn-modal-foot">
            <a className="ehn-login-create" href={`${HN}/login?goto=${encodeURIComponent(goto)}`}>
              Create account
            </a>
            <button type="submit" className="ehn-btn secondary">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
