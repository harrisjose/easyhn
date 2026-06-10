import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, type Settings } from './schema';
import { getSettings, patchSettings, watchSettings } from './store';

/**
 * React hook exposing the current settings plus an `update` patcher. Stays in
 * sync across tabs/pages via the storage watcher.
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getSettings().then((s) => {
      if (!active) return;
      setSettings(s);
      setLoaded(true);
    });
    const unwatch = watchSettings((s) => active && setSettings(s));
    return () => {
      active = false;
      unwatch();
    };
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    // Optimistic local update; storage watcher will reconcile.
    setSettings((prev) => ({ ...prev, ...patch }));
    void patchSettings(patch);
  }, []);

  return { settings, update, loaded };
}
