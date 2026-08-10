import { storage } from '#imports';
import { DEFAULT_SETTINGS, type Settings } from './schema';
import { createPatcher, type SettingsStore } from './patcher';

/**
 * Settings live in `storage.sync` so a change in one place reaches every open HN
 * tab. This is the browser's own sync area, not a sync layer of ours: it carries
 * nothing between Chrome and Firefox, so don't promise that in user-facing copy.
 * See ADR-0002.
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

/** The only binding between the settings patcher and the extension runtime. */
const extensionSettingsStore: SettingsStore = {
  read: () => settingsItem.getValue(),
  write: (settings) => settingsItem.setValue(settings),
};

const patcher = createPatcher(extensionSettingsStore);

export function getSettings(): Promise<Settings> {
  return patcher.read();
}

export function patchSettings(patch: Partial<Settings>): Promise<Settings> {
  return patcher.patch(patch);
}

export function watchSettings(cb: (s: Settings) => void): () => void {
  return settingsItem.watch((value) => cb({ ...DEFAULT_SETTINGS, ...value }));
}
