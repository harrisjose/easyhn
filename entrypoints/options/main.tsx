import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useSettings } from '@/src/settings/useSettings';
import { applyTheme, watchSystemTheme } from '@/src/settings/applyTheme';
import { SettingsPanel } from '@/src/ui/components/SettingsPanel';
import '@/assets/styles/theme.css';

function Options() {
  const { settings, update } = useSettings();

  useEffect(() => {
    const el = document.documentElement;
    applyTheme(el, settings);
    return watchSystemTheme(() => applyTheme(el, settings));
  }, [settings]);

  return (
    <div className="ehn-root" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px' }}>
        <h1 className="ehn-logo" style={{ fontSize: '1.8em', marginBottom: 4 }}>
          easyhn
        </h1>
        <p style={{ color: 'var(--fg-dim)', marginTop: 0, marginBottom: 28 }}>
          A neat, modern interface for Hacker News. Open{' '}
          <a href="https://news.ycombinator.com/news">news.ycombinator.com</a> to see it in action.
        </p>

        <h2 style={{ fontSize: '1.1em', marginBottom: 14 }}>Appearance</h2>
        <SettingsPanel settings={settings} update={update} />

        <h2 style={{ fontSize: '1.1em', margin: '24px 0 10px' }}>Keyboard shortcuts</h2>
        <ul style={{ color: 'var(--fg-dim)', lineHeight: 1.9, paddingLeft: 18 }}>
          <li>
            <b>j</b> / <b>k</b> — move between stories
          </li>
          <li>
            <b>o</b> or <b>Enter</b> — open the selected story
          </li>
          <li>
            <b>c</b> — open the selected story's comments
          </li>
        </ul>

        <p className="ehn-kbd-hint" style={{ marginTop: 28 }}>
          Settings sync across your browsers and apply live to every open Hacker News tab.
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Options />);
