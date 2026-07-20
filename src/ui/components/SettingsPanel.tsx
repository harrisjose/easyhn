import type { ComponentType, ReactNode } from 'react';
import {
  type Settings,
  type Theme,
  type FontFamily,
  type Width,
  type Density,
  FONT_STACK,
} from '@/src/settings/schema';
import { ThemeLight, ThemeDark, ThemeAuto } from './icons';

const THEMES: { value: Theme; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { value: 'light', label: 'Light', Icon: ThemeLight },
  { value: 'dark', label: 'Dark', Icon: ThemeDark },
  { value: 'auto', label: 'Auto', Icon: ThemeAuto },
];
const FONTS: FontFamily[] = ['sans', 'serif'];
const WIDTHS: Width[] = ['narrow', 'medium', 'wide'];
const DENSITIES: Density[] = ['compact', 'default', 'comfortable'];

/** The shared settings controls — reused by the popup, options page and the
 *  in-page settings popover. Pure presentational; persistence is the caller's. */
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
        <div className="ehn-seg">
          {THEMES.map((t) => (
            <button
              key={t.value}
              className={`ehn-seg-btn${settings.theme === t.value ? ' active' : ''}`}
              onClick={() => update({ theme: t.value })}
              aria-pressed={settings.theme === t.value}
            >
              <t.Icon className="ehn-seg-icon" />
              {t.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Font">
        <div className="ehn-fontcards">
          {FONTS.map((f) => (
            <button
              key={f}
              className={`ehn-fontcard${settings.font === f ? ' active' : ''}`}
              onClick={() => update({ font: f })}
              aria-pressed={settings.font === f}
            >
              <span className="ehn-fontcard-label">{cap(f)}</span>
              <span className="ehn-fontcard-aa" style={{ fontFamily: FONT_STACK[f] }}>
                Aa
              </span>
            </button>
          ))}
        </div>
      </Field>

      <Field label={`Font size — ${settings.fontSize}px`}>
        <div className="ehn-slider-row">
          <span className="ehn-slider-cap" style={{ fontSize: '0.85em' }}>
            A
          </span>
          <input
            type="range"
            min={12}
            max={20}
            step={1}
            value={settings.fontSize}
            onChange={(e) => update({ fontSize: Number(e.target.value) })}
          />
          <span className="ehn-slider-cap" style={{ fontSize: '1.3em' }}>
            A
          </span>
        </div>
      </Field>

      <Field label="Density">
        <div className="ehn-seg">
          {DENSITIES.map((d) => (
            <button
              key={d}
              className={`ehn-seg-btn${settings.density === d ? ' active' : ''}`}
              onClick={() => update({ density: d })}
              aria-pressed={settings.density === d}
            >
              {cap(d)}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Width">
        <div className="ehn-seg">
          {WIDTHS.map((w) => (
            <button
              key={w}
              className={`ehn-seg-btn${settings.width === w ? ' active' : ''}`}
              onClick={() => update({ width: w })}
              aria-pressed={settings.width === w}
            >
              {cap(w)}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Links">
        <label className="ehn-switch-row">
          <span>Open story links in a new tab</span>
          <input
            type="checkbox"
            className="ehn-switch"
            checked={settings.openInNewTab}
            onChange={(e) => update({ openInNewTab: e.target.checked })}
          />
        </label>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ehn-field">
      <div className="ehn-field-label">{label}</div>
      {children}
    </div>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
