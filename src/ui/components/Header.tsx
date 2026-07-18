import type { Route, Session } from '@/src/types';
import { useOpenSettings, useOpenAccount } from '../util';
import { Settings, UserIcon, YCombinator } from './icons';

const NAV: { label: string; path: string; list: string }[] = [
  { label: 'Top', path: 'news', list: 'news' },
  { label: 'New', path: 'newest', list: 'newest' },
  { label: 'Ask', path: 'ask', list: 'ask' },
  { label: 'Show', path: 'show', list: 'show' },
  { label: 'Jobs', path: 'jobs', list: 'jobs' },
];

export function Header({ route, session }: { route: Route; session: Session }) {
  const openSettings = useOpenSettings();
  const openAccount = useOpenAccount();
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
          <button
            className="ehn-iconbtn"
            title={session.loggedIn ? (session.username ?? 'Account') : 'Log in'}
            aria-label={session.loggedIn ? 'Account' : 'Log in'}
            onClick={openAccount}
          >
            <UserIcon />
          </button>
          <button
            className="ehn-iconbtn"
            title="Settings"
            aria-label="Settings"
            onClick={openSettings}
          >
            <Settings />
          </button>
        </div>
      </div>
    </header>
  );
}
