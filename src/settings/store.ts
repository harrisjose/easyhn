import { storage } from '#imports';
import { DEFAULT_SETTINGS, type Settings } from './schema';

/**
 * Settings live in `storage.sync` so they follow the user across devices and
 * stay consistent across every open HN tab. WXT's storage API gives us typed
 * get/set plus a change watcher used by the React hook.
 */
export const settingsItem = storage.defineItem<Settings>('sync:settings', {
  fallback: DEFAULT_SETTINGS,
  version: 1,
});

export async function getSettings(): Promise<Settings> {
  // Merge so newly-added keys always have their defaults.
  const stored = await settingsItem.getValue();
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function patchSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch };
  await settingsItem.setValue(next);
  return next;
}

export function watchSettings(cb: (s: Settings) => void): () => void {
  return settingsItem.watch((value) => cb({ ...DEFAULT_SETTINGS, ...value }));
}
