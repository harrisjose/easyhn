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
