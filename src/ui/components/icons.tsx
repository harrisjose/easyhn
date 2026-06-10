/* Icon set — thin wrappers around Phosphor (https://phosphoricons.com), kept
   behind our own names so swapping sets stays a one-file change. Icons are
   bundled locally (tree-shaken ESM), so nothing is fetched at runtime.

   Sizing comes from CSS (`.ehn-vote svg { … }` etc.), which overrides the
   width/height attributes Phosphor sets. `weight` is chosen per slot: "fill"
   for the vote arrow (a solid affordance), "bold" for the small line icons so
   they hold up at 11–17px. */

import { ArrowFatUp, CaretDown, ChatCircle, GearSix, User, X } from '@phosphor-icons/react';

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

/** Settings gear. */
export function Cog({ className }: IconProps) {
  return <GearSix className={className} weight="bold" aria-hidden="true" />;
}

/** Close (X). */
export function Close({ className }: IconProps) {
  return <X className={className} weight="bold" aria-hidden="true" />;
}

/** Person — the logged-out login button. */
export function UserIcon({ className }: IconProps) {
  return <User className={className} weight="bold" aria-hidden="true" />;
}
