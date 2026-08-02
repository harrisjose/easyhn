/* Icon set — thin wrappers around Phosphor (https://phosphoricons.com), kept
   behind our own names so swapping sets stays a one-file change. Icons are
   bundled locally (tree-shaken ESM), so nothing is fetched at runtime.

   Sizing comes from CSS (`.ehn-vote svg { … }` etc.), which overrides the
   width/height attributes Phosphor sets. `weight` is chosen per slot: "fill"
   for the vote arrow (a solid affordance), "bold" for the small line icons so
   they hold up at 11–17px. */

import {
  ArrowFatUp,
  ArrowUpRight,
  CaretDown,
  ChatCircle,
  CircleHalf,
  Faders,
  Moon,
  Sun,
  UserCircle,
  X,
  XLogo,
} from '@phosphor-icons/react';

type IconProps = { className?: string };

/** Upvote arrow — outline at rest, filled once voted (pass `filled`). */
export function UpArrow({ className, filled = false }: IconProps & { filled?: boolean }) {
  return <ArrowFatUp className={className} weight={filled ? 'fill' : 'bold'} aria-hidden="true" />;
}

/** Comment collapse toggle (points down when open; CSS rotates it). */
export function Chevron({ className }: IconProps) {
  return <CaretDown className={className} weight="bold" aria-hidden="true" />;
}

/** Reply / comment bubble. */
export function Reply({ className }: IconProps) {
  return <ChatCircle className={className} weight="bold" aria-hidden="true" />;
}

/** Settings toggle — vertical faders / knobs. */
export function Settings({ className }: IconProps) {
  return <Faders className={className} weight="bold" aria-hidden="true" />;
}

/** Close (X). */
export function Close({ className }: IconProps) {
  return <X className={className} weight="bold" aria-hidden="true" />;
}

/** Theme: light / dark / auto. */
export function ThemeLight({ className }: IconProps) {
  return <Sun className={className} weight="bold" aria-hidden="true" />;
}
export function ThemeDark({ className }: IconProps) {
  return <Moon className={className} weight="bold" aria-hidden="true" />;
}
export function ThemeAuto({ className }: IconProps) {
  return <CircleHalf className={className} weight="bold" aria-hidden="true" />;
}

/** User circle — the logged-out login button. */
export function UserIcon({ className }: IconProps) {
  return <UserCircle className={className} weight="bold" aria-hidden="true" />;
}

/** X (formerly Twitter) logo. */
export function XLogoIcon({ className }: IconProps) {
  return <XLogo className={className} weight="bold" aria-hidden="true" />;
}

/** Outward arrow for external / new-tab links. */
export function ExternalArrow({ className }: IconProps) {
  return <ArrowUpRight className={className} weight="bold" aria-hidden="true" />;
}

/**
 * The easyhn app mark. Geometry is duplicated from scripts/gen-icons.mjs, which
 * renders the same path out to public/icon/*.png — edit both or the popup and
 * the toolbar icon drift apart.
 *
 * The gradient id is namespaced: this renders inside news.ycombinator.com's own
 * document, where a bare id="lit" could collide.
 */
export function EasyhnMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="ehn-mark-lit" x1="0.1" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#ff6600" />
          <stop offset="0.55" stopColor="#dd5a00" />
          <stop offset="1" stopColor="#c95000" />
        </linearGradient>
      </defs>
      <g transform="translate(-1.4 2.5)">
        <path
          d="M32 4C44.4 4 54.2 15.6 55.4 30.4C56 37.4 57.4 43 57.8 47.6C53.65 47.6 53.65 54.2 49.5 54.2C45.5 54.2 45.5 48.8 41.5 48.8C36.75 48.8 36.75 55 32 55C27.5 55 27.5 48.4 23 48.4C19.25 48.4 19.25 53.4 15.5 53.4C13.15 53.4 13.15 48.2 10.8 48.2C10.2 42.4 9.2 36.6 9 30.4C10.2 15.6 19.6 4 32 4Z"
          fill="url(#ehn-mark-lit)"
        />
        <ellipse cx="26.7" cy="27.6" rx="3.5" ry="4.7" transform="rotate(-8 26.7 27.6)" fill="#faf9f7" />
        <ellipse cx="40.2" cy="27.6" rx="3.5" ry="4.7" transform="rotate(8 40.2 27.6)" fill="#faf9f7" />
      </g>
    </svg>
  );
}

/** The Y Combinator "Y" letterform for the header logo mark. */
export function YCombinator({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 6.5 12 13l5-6.5M12 13v5" />
    </svg>
  );
}
