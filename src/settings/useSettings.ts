import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, type Settings } from './schema';
import { getSettings, patchSettings, watchSettings } from './store';

/**
 * React hook exposing the current settings plus an `update` patcher. Stays in
 * sync across tabs/pages via the storage watcher.
 *
 * Pass `initial` when the caller already read storage (the content script does,
 * before mounting) — starting from the defaults and correcting on the first
 * effect re-wraps the whole page one frame in.
 */
export function useSettings(initial: Settings = DEFAULT_SETTINGS) {
  const [settings, setSettings] = useState<Settings>(initial);

  useEffect(() => {
    let active = true;
    getSettings().then((s) => active && setSettings(s));
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

  return { settings, update };
}
