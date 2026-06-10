import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { browser } from '#imports';
import { useSettings } from '@/src/settings/useSettings';
import { applyTheme, watchSystemTheme } from '@/src/settings/applyTheme';
import { SettingsPanel } from '@/src/ui/components/SettingsPanel';
import '@/assets/styles/theme.css';

function Popup() {
  const { settings, update } = useSettings();

  useEffect(() => {
    const el = document.documentElement;
    applyTheme(el, settings);
    return watchSystemTheme(() => applyTheme(el, settings));
  }, [settings]);

  return (
    <div className="ehn-root" style={{ width: 300, padding: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <span className="ehn-logo" style={{ fontSize: '1.15em' }}>
          easyhn
        </span>
        <a href="https://news.ycombinator.com/news" target="_blank" rel="noopener">
          Open HN ↗
        </a>
      </div>
      <SettingsPanel settings={settings} update={update} />
      <button
        className="ehn-btn secondary"
        style={{ width: '100%', marginTop: 4 }}
        onClick={() => browser.runtime.openOptionsPage()}
      >
        All settings
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Popup />);
