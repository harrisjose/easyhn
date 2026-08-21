/* Two-state theme toggle, per Lea Verou's "Dark mode toggles: two states are
 * enough". The button shows the resolved theme and offers only its opposite.
 * The model underneath keeps three states: no stored value means the page
 * follows the OS, a stored light/dark is an explicit override. Storage is
 * only ever evaluated at click time, so an override that later coincides
 * with the OS setting is kept rather than tidied away. */
(() => {
  const storageKey = 'easyhn-theme';
  const root = document.documentElement;
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const themeColor = document.querySelector('[data-theme-color]');
  const toggles = document.querySelectorAll('[data-theme-toggle]');

  const systemThemeName = () => systemTheme.matches ? 'dark' : 'light';

  const readOverride = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved === 'light' || saved === 'dark' ? saved : null;
    } catch (_) {
      return null;
    }
  };

  const applyTheme = () => {
    const theme = readOverride() ?? systemThemeName();
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    if (themeColor) themeColor.content = theme === 'dark' ? '#151618' : '#faf9f7';

    const next = theme === 'dark' ? 'light' : 'dark';
    for (const toggle of toggles) {
      toggle.setAttribute('aria-label', `Switch to ${next} mode`);
      toggle.title = `Switch to ${next} mode`;
    }
  };

  for (const toggle of toggles) {
    toggle.addEventListener('click', () => {
      const target = root.dataset.theme === 'dark' ? 'light' : 'dark';
      /* Pressing toward what the OS already says hands control back to the
         system default, so the stored override comes out. */
      if (target === systemThemeName()) {
        try { localStorage.removeItem(storageKey); } catch (_) {}
      } else {
        try { localStorage.setItem(storageKey, target); } catch (_) {}
      }
      applyTheme();
    });
  }

  systemTheme.addEventListener('change', applyTheme);

  applyTheme();
})();
