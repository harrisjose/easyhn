import { useCallback, useRef, useState } from 'react';
import type { PageModel, Route, Session } from '@/src/types';
import type { Settings } from '@/src/settings/schema';
import type { VisitLedger } from '@/src/visits/ledger';
import type { HnClient } from '@/src/hn/client';
import { useSettings } from '@/src/settings/useSettings';
import { useApplyTheme } from '@/src/settings/useApplyTheme';
import {
  ToastContext,
  SettingsContext,
  SettingsUIContext,
  AccountUIContext,
  VisitLedgerContext,
  HnClientContext,
} from './util';
import { Header } from './components/Header';
import { SettingsPanel } from './components/SettingsPanel';
import { AccountPanel } from './components/AccountPanel';
import { Close } from './components/icons';
import { StoryList } from './views/StoryList';
import { Item } from './views/Item';
import { SingleComment } from './views/SingleComment';
import { Profile } from './views/Profile';

export function App({
  host,
  route,
  session,
  page,
  ledger,
  hn,
  initialSettings,
}: {
  host: HTMLElement;
  route: Route;
  session: Session;
  page: PageModel;
  /** Visit ledger, wired to extension storage by the content script. */
  ledger: VisitLedger;
  /** Everything we ask Hacker News to do, wired to fetch by the content script. */
  hn: HnClient;
  /** Settings read before mount, so the first paint is already the right size. */
  initialSettings?: Settings;
}) {
  const { settings, update } = useSettings(initialSettings);
  const [toast, setToast] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useApplyTheme(settings, host);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const openAccount = useCallback(() => setAccountOpen(true), []);

  return (
    <ToastContext.Provider value={notify}>
      <HnClientContext.Provider value={hn}>
      <VisitLedgerContext.Provider value={ledger}>
        <SettingsContext.Provider value={settings}>
          <SettingsUIContext.Provider value={openSettings}>
            <AccountUIContext.Provider value={openAccount}>
              <Header route={route} session={session} />
              <main className="ehn-container">
                {page.kind === 'storylist' && (
                  <StoryList stories={page.stories} moreUrl={page.moreUrl} />
                )}
                {page.kind === 'item' && <Item item={page.item} loggedIn={session.loggedIn} />}
                {page.kind === 'permalink' && (
                  <SingleComment page={page.permalink} loggedIn={session.loggedIn} />
                )}
                {page.kind === 'profile' && <Profile profile={page.profile} />}
              </main>

              {settingsOpen && (
                <SettingsPopover
                  settings={settings}
                  update={update}
                  onClose={() => setSettingsOpen(false)}
                />
              )}
              {accountOpen && (
                <AccountPanel session={session} onClose={() => setAccountOpen(false)} />
              )}
              {toast && <div className="ehn-toast">{toast}</div>}
            </AccountUIContext.Provider>
          </SettingsUIContext.Provider>
        </SettingsContext.Provider>
      </VisitLedgerContext.Provider>
      </HnClientContext.Provider>
    </ToastContext.Provider>
  );
}

/** Reads and writes App's settings — never its own copy, or the panel would
 *  edit one instance while the tree behind it renders another. */
function SettingsPopover({
  settings,
  update,
  onClose,
}: {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  onClose: () => void;
}) {
  return (
    <div className="ehn-overlay" onClick={onClose}>
      <div className="ehn-popover" onClick={(e) => e.stopPropagation()}>
        <div className="ehn-popover-head">
          <strong>Settings</strong>
          <button className="ehn-iconbtn" onClick={onClose} aria-label="Close">
            <Close />
          </button>
        </div>
        <SettingsPanel settings={settings} update={update} />
      </div>
    </div>
  );
}
