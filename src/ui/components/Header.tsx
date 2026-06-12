import type { Route, Session } from '@/src/types';
import { useOpenSettings } from '../util';
import { TextSize, UserIcon, YCombinator } from './icons';

const NAV: { label: string; path: string; list: string }[] = [
  { label: 'Top', path: 'news', list: 'news' },
  { label: 'New', path: 'newest', list: 'newest' },
  { label: 'Ask', path: 'ask', list: 'ask' },
  { label: 'Show', path: 'show', list: 'show' },
  { label: 'Jobs', path: 'jobs', list: 'jobs' },
];

export function Header({ route, session }: { route: Route; session: Session }) {
  const openSettings = useOpenSettings();
  return (
    <header className="ehn-header">
      <div className="ehn-header-inner">
        <a className="ehn-logo" href="https://news.ycombinator.com/news">
          <span className="ehn-logo-mark">
            <YCombinator />
          </span>
          Hacker News
        </a>
        <nav className="ehn-nav">
          {NAV.map((n) => (
            <a
              key={n.path}
              href={`https://news.ycombinator.com/${n.path}`}
              className={route.kind === 'storylist' && route.list === n.list ? 'active' : ''}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ehn-header-right">
          {session.loggedIn ? (
            <a
              className="ehn-user"
              href={`https://news.ycombinator.com/user?id=${session.username}`}
            >
              <b>{session.username}</b>
              {session.karma != null ? session.karma.toLocaleString() : ''}
            </a>
          ) : (
            <a
              className="ehn-iconbtn"
              href="https://news.ycombinator.com/login"
              title="Log in"
              aria-label="Log in"
            >
              <UserIcon />
            </a>
          )}
          <button
            className="ehn-iconbtn ehn-iconbtn-aa"
            title="Settings"
            aria-label="Settings"
            onClick={openSettings}
          >
            <TextSize />
          </button>
        </div>
      </div>
    </header>
  );
}
