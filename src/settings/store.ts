import { storage } from '#imports';
import { DEFAULT_SETTINGS, type Settings } from './schema';

/**
 * Settings live in `storage.sync` so a change in one place reaches every open HN
 * tab. This is the browser's own sync area, not a sync layer of ours: it carries
 * nothing between Chrome and Firefox, so don't promise that in user-facing copy.
 */
export const settingsItem = storage.defineItem<Settings>('sync:settings', {
  fallback: DEFAULT_SETTINGS,
  version: 2,
  migrations: {
    // Nothing reads the dropped `width` key, but every patch would keep
    // re-writing it into sync storage. Strip it once.
    2: ({ width: _width, ...rest }: Settings & { width?: string }) => rest,
  },
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
