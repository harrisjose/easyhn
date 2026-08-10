import type { Route, Session } from '@/src/types';
import { HN_ORIGIN, NAV } from '@/src/hn/urls';
import { useOpenSettings, useOpenAccount } from '../util';
import { Settings, UserIcon, YCombinator } from './icons';

export function Header({ route, session }: { route: Route; session: Session }) {
  const openSettings = useOpenSettings();
  const openAccount = useOpenAccount();
  return (
    <header className="ehn-header">
      <div className="ehn-header-inner">
        <a className="ehn-logo" href={`${HN_ORIGIN}/news`}>
          <span className="ehn-logo-mark">
            <YCombinator />
          </span>
          Hacker News
        </a>
        <nav className="ehn-nav">
          {NAV.map((n) => (
            <a
              key={n.path}
              href={`${HN_ORIGIN}/${n.path}`}
              className={route.kind === 'storylist' && route.list === n.slug ? 'active' : ''}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ehn-header-right">
          <button
            className="ehn-iconbtn"
            title="Settings"
            aria-label="Settings"
            onClick={openSettings}
          >
            <Settings />
          </button>
          <button
            className="ehn-iconbtn"
            title={session.loggedIn ? (session.username ?? 'Account') : 'Log in'}
            aria-label={session.loggedIn ? 'Account' : 'Log in'}
            onClick={openAccount}
          >
            <UserIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
