import {
  type Settings,
  type Theme,
  type Accent,
  type FontFamily,
  type Width,
  ACCENT_HEX,
} from '@/src/settings/schema';

const THEMES: Theme[] = ['light', 'dark', 'auto'];
const ACCENTS: Accent[] = ['orange', 'blue', 'green', 'purple', 'red'];
const FONTS: { value: FontFamily; label: string }[] = [
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
];
const WIDTHS: Width[] = ['narrow', 'medium', 'wide'];

/** The shared settings controls — reused by the popup, options page and the
 *  in-page settings drawer. Pure presentational; persistence is the caller's. */
export function SettingsPanel({
  settings,
  update,
}: {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}) {
  return (
    <div className="ehn-settings">
      <Field label="Theme">
        <Segmented
          options={THEMES.map((t) => ({ value: t, label: cap(t) }))}
          value={settings.theme}
          onChange={(v) => update({ theme: v as Theme })}
        />
      </Field>

      <Field label="Accent">
        <div style={{ display: 'flex', gap: 8 }}>
          {ACCENTS.map((a) => (
            <button
              key={a}
              aria-label={a}
              onClick={() => update({ accent: a })}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: ACCENT_HEX[a],
                border: settings.accent === a ? '2px solid var(--fg)' : '2px solid transparent',
                cursor: 'pointer',
                outline: settings.accent === a ? '2px solid var(--bg)' : 'none',
              }}
            />
          ))}
        </div>
      </Field>

      <Field label="Font">
        <Segmented
          options={FONTS}
          value={settings.font}
          onChange={(v) => update({ font: v as FontFamily })}
        />
      </Field>

      <Field label={`Font size — ${settings.fontSize}px`}>
        <input
          type="range"
          min={12}
          max={20}
          step={1}
          value={settings.fontSize}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </Field>

      <Field label="Width">
        <Segmented
          options={WIDTHS.map((w) => ({ value: w, label: cap(w) }))}
          value={settings.width}
          onChange={(v) => update({ width: v as Width })}
        />
      </Field>

      <Field label="Favicons">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.showFavicons}
            onChange={(e) => update({ showFavicons: e.target.checked })}
          />
          Show site favicons
        </label>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '0 0 16px' }}>
      <div style={{ fontSize: '0.82em', color: 'var(--fg-dim)', marginBottom: 6, fontWeight: 600 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'var(--bg-sunken)',
        borderRadius: 8,
        padding: 2,
        gap: 2,
      }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            border: 'none',
            cursor: 'pointer',
            padding: '5px 12px',
            borderRadius: 6,
            fontSize: '0.88em',
            background: value === o.value ? 'var(--bg-elev)' : 'transparent',
            color: value === o.value ? 'var(--fg)' : 'var(--fg-dim)',
            fontWeight: value === o.value ? 600 : 400,
            boxShadow: value === o.value ? 'var(--shadow)' : 'none',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
