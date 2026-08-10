import { useEffect, type RefObject } from 'react';

/** How long the anchored comment stays highlighted (matches `.ehn-flash`). */
const FLASH_MS = 2000;
/** Give up re-pinning after this long, even if nothing has settled. */
const SETTLE_MS = 3000;

/**
 * Scroll to the comment named by the URL fragment and flash it.
 *
 * HN's "context" links point at `item?id=<story>#<comment>`, but we render into
 * a shadow root under prefixed ids, so the browser can't resolve those anchors
 * itself — without this, following one lands you at the top of the thread.
 * `root` scopes the lookup to our own tree (document.querySelector can't reach
 * inside the shadow root).
 */
export function useCommentAnchor(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let flashed: HTMLElement | undefined;

    function go(flash: boolean) {
      const id = window.location.hash.replace(/^#/, '');
      if (!/^\d+$/.test(id)) return;
      const el = root.current?.querySelector<HTMLElement>(`#ehn-c-${id}`);
      if (!el) return;
      // Scroll its own row, not the whole element: `.ehn-comment` wraps the
      // entire reply subtree, so scrolling *that* box aims at the middle of the
      // replies — thousands of pixels past the comment on a busy thread.
      const row = el.querySelector<HTMLElement>(':scope > .ehn-comment-body') ?? el;
      row.scrollIntoView({ block: 'start' });
      if (!flash) return;
      flashed?.classList.remove('ehn-flash');
      el.classList.add('ehn-flash');
      flashed = el;
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove('ehn-flash'), FLASH_MS);
    }

    go(true);

    // The first scroll aims at a tree that may still be sizing, and any re-wrap
    // shifts a long thread by hundreds of pixels. Re-pin on every resize until
    // it settles — but never fight the reader, so the first real input ends it.
    let settling = true;
    const stop = () => {
      if (!settling) return;
      settling = false;
      observer.disconnect();
      clearTimeout(settleTimer);
      INPUT_EVENTS.forEach((type) => window.removeEventListener(type, stop));
    };
    const observer = new ResizeObserver(() => go(false));
    if (root.current) observer.observe(root.current);
    const settleTimer = setTimeout(stop, SETTLE_MS);
    INPUT_EVENTS.forEach((type) => window.addEventListener(type, stop, { passive: true }));

    // A context link to a comment on the page you're already on only changes
    // the fragment, so the page never reloads and we have to handle it here.
    const onHashChange = () => go(true);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      stop();
      clearTimeout(timer);
    };
  }, [root]);
}

/** Reader input that means "I'm driving now" — stop re-pinning the anchor. */
const INPUT_EVENTS = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;
