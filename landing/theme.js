(() => {
  const storageKey = 'easyhn-theme';
  const root = document.documentElement;
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const themeColor = document.querySelector('[data-theme-color]');
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  const modes = ['system', 'light', 'dark'];

  const readPreference = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return modes.includes(saved) ? saved : 'system';
    } catch (_) {
      return 'system';
    }
  };

  const resolveTheme = (mode) => mode === 'system'
    ? systemTheme.matches ? 'dark' : 'light'
    : mode;

  const applyMode = (mode) => {
    const theme = resolveTheme(mode);
    root.dataset.themeMode = mode;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    if (themeColor) themeColor.content = theme === 'dark' ? '#151618' : '#faf9f7';

    for (const toggle of toggles) {
      const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
      const currentLabel = mode[0].toUpperCase() + mode.slice(1);
      toggle.setAttribute('aria-label', `Theme: ${currentLabel}. Switch to ${nextMode} mode`);
      toggle.title = `Theme: ${currentLabel}`;
    }
  };

  for (const toggle of toggles) {
    toggle.addEventListener('click', () => {
      const currentIndex = modes.indexOf(root.dataset.themeMode);
      const mode = modes[(currentIndex + 1) % modes.length];
      try { localStorage.setItem(storageKey, mode); } catch (_) {}
      applyMode(mode);
    });
  }

  systemTheme.addEventListener('change', () => {
    if (root.dataset.themeMode === 'system') applyMode('system');
  });

  applyMode(root.dataset.themeMode || readPreference());
})();
