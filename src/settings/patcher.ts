import { DEFAULT_SETTINGS, type Settings } from './schema';

/**
 * Where settings are kept. Two adapters: the extension's sync area, and a fake.
 *
 * Nothing in here may import `#imports` — the ordering below is only testable
 * because this module can be imported outside the extension runtime.
 */
export interface SettingsStore {
  read(): Promise<Partial<Settings> | undefined>;
  write(settings: Settings): Promise<void>;
}

export function createPatcher(store: SettingsStore) {
  // Patches run one at a time. Each one re-reads first, so a change made in
  // another tab isn't clobbered — but that read has to happen after the
  // previous write has landed, or two quick toggles both read the old value
  // and the first one is silently lost.
  let tail: Promise<unknown> = Promise.resolve();

  return {
    /** Merged over the defaults, so keys added since the last write still resolve. */
    async read(): Promise<Settings> {
      return { ...DEFAULT_SETTINGS, ...(await store.read()) };
    },

    patch(patch: Partial<Settings>): Promise<Settings> {
      const apply = async (): Promise<Settings> => {
        const next = { ...DEFAULT_SETTINGS, ...(await store.read()), ...patch };
        await store.write(next);
        return next;
      };
      // Runs whether or not the previous patch succeeded: one failed write
      // must not stall every write after it.
      const result = tail.then(apply, apply);
      tail = result.catch(() => undefined);
      return result;
    },
  };
}

/** An in-memory settings store, for tests. */
export function inMemorySettingsStore(initial: Partial<Settings> = {}): SettingsStore {
  let stored: Partial<Settings> = { ...initial };
  return {
    read: async () => ({ ...stored }),
    write: async (settings) => {
      stored = { ...settings };
    },
  };
}
