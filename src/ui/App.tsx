import { useCallback, useEffect, useRef, useState } from 'react';
import type { ItemPage, Route, Session, UserProfile } from '@/src/types';
import type { StoryListResult } from '@/src/parse/parseStoryList';
import { useSettings } from '@/src/settings/useSettings';
import { applyTheme, applyPageBackground, watchSystemTheme } from '@/src/settings/applyTheme';
import { ToastContext, SettingsUIContext } from './util';
import { Header } from './components/Header';
import { SettingsPanel } from './components/SettingsPanel';
import { Close } from './components/icons';
import { StoryList } from './views/StoryList';
import { Item } from './views/Item';
import { User } from './views/User';

export type AppPayload =
  | { kind: 'storylist'; list: StoryListResult }
  | { kind: 'item'; item: ItemPage }
  | { kind: 'user'; profile: UserProfile };

export function App({
  host,
  route,
  session,
  payload,
}: {
  host: HTMLElement;
  route: Route;
  session: Session;
  payload: AppPayload;
}) {
  const { settings } = useSettings();
  const [toast, setToast] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Keep the shadow host's CSS variables / data-theme in sync with settings,
  // re-applying when the OS theme flips while on "auto". The page background
  // behind us lives outside the shadow root and is synced alongside.
  useEffect(() => {
    const sync = () => {
      applyTheme(host, settings);
      applyPageBackground(settings);
    };
    sync();
    return watchSystemTheme(sync);
  }, [host, settings]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);

  return (
    <ToastContext.Provider value={notify}>
      <SettingsUIContext.Provider value={openSettings}>
        <Header route={route} session={session} />
        <main className="ehn-container">
          {payload.kind === 'storylist' && (
            <StoryList stories={payload.list.stories} moreUrl={payload.list.moreUrl} />
          )}
          {payload.kind === 'item' && <Item item={payload.item} loggedIn={session.loggedIn} />}
          {payload.kind === 'user' && <User profile={payload.profile} />}
        </main>

        {settingsOpen && (
          <SettingsPopover onClose={() => setSettingsOpen(false)} />
        )}
        {toast && <div className="ehn-toast">{toast}</div>}
      </SettingsUIContext.Provider>
    </ToastContext.Provider>
  );
}

function SettingsPopover({ onClose }: { onClose: () => void }) {
  const { settings, update } = useSettings();
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
