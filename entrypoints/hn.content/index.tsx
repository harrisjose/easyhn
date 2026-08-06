import { createRoot, type Root } from 'react-dom/client';
import { defineContentScript, createShadowRootUi } from '#imports';
import type { ProfilePage, Route, Session } from '@/src/types';
import { detectRoute } from '@/src/parse/detectRoute';
import { parseSession } from '@/src/parse/auth';
import { parseStoryList } from '@/src/parse/parseStoryList';
import { parseItem } from '@/src/parse/parseItem';
import { parseCommentPage } from '@/src/parse/parseComment';
import { parseUser } from '@/src/parse/parseUser';
import { parseUserComments } from '@/src/parse/parseUserComments';
import { getSettings } from '@/src/settings/store';
import { DEFAULT_SETTINGS } from '@/src/settings/schema';
import { applyPageBackground, applyTheme, PAGE_BG } from '@/src/settings/applyTheme';
import { App, type AppPayload } from '@/src/ui/App';
import '@/assets/styles/theme.css';

export default defineContentScript({
  matches: ['*://news.ycombinator.com/*'],
  runAt: 'document_start',
  cssInjectionMode: 'ui',
  async main(ctx) {
    const route = detectRoute();
    // Routes we don't redesign: leave the native page completely alone.
    if (route.kind === 'unknown') return;

    // Hide native HN as early as possible to avoid a flash of the old UI.
    const hideStyle = injectHideStyle();

    await domReady();

    const session = parseSession();
    const payload = buildPayload(route, session);
    if (!payload) {
      // Parsing failed unexpectedly — restore the native page rather than
      // showing a blank screen.
      hideStyle.remove();
      return;
    }

    // Read settings before the first paint. Applying them from an effect instead
    // re-wraps the column (width / font size) a frame in, which on a long thread
    // shifts the content by hundreds of pixels — a visible jump, and enough to
    // throw the comment anchor off its target.
    const settings = await getSettings().catch(() => DEFAULT_SETTINGS);

    const ui = await createShadowRootUi(ctx, {
      name: 'easyhn-root',
      position: 'inline',
      anchor: 'body',
      append: 'first',
      mode: 'open',
      onMount(container, _shadow, shadowHost) {
        // Make the host fill the page and host our CSS-variable scope.
        (shadowHost as HTMLElement).style.cssText =
          'display:block;position:relative;z-index:2147483646;';
        // After cssText, which would otherwise wipe the custom properties.
        applyTheme(shadowHost as HTMLElement, settings);
        applyPageBackground(settings);
        const wrapper = document.createElement('div');
        wrapper.className = 'ehn-root';
        container.append(wrapper);
        const root = createRoot(wrapper);
        root.render(
          <App
            host={shadowHost as HTMLElement}
            route={route}
            session={session}
            payload={payload}
            initialSettings={settings}
          />,
        );
        return root;
      },
      onRemove(root?: Root) {
        root?.unmount();
      },
    });

    ui.mount();
  },
});

function buildPayload(route: ReturnType<typeof detectRoute>, session: Session): AppPayload | null {
  if (route.kind === 'storylist') {
    return { kind: 'storylist', list: parseStoryList() };
  }
  if (route.kind === 'item' && route.itemId) {
    // /item?id= serves both stories and single comments, and the URL doesn't say
    // which — only the page does, so ask the comment parser first (it returns
    // null on a story page).
    const page = parseCommentPage(route.itemId);
    if (page) return { kind: 'comment', page };
    const item = parseItem(route.itemId);
    return item ? { kind: 'item', item } : null;
  }
  if (route.kind === 'user') {
    // /hidden has no id in the URL — it's the logged-in user's own page.
    const id = route.userId ?? (route.tab === 'hidden' ? session.username : undefined);
    if (!id) return null;
    const profile = buildProfile(id, route.tab ?? 'about', session);
    return profile ? { kind: 'profile', profile } : null;
  }
  return null;
}

function buildProfile(id: string, tab: NonNullable<Route['tab']>, session: Session): ProfilePage | null {
  const isSelf =
    session.loggedIn && !!session.username && session.username.toLowerCase() === id.toLowerCase();
  const page: ProfilePage = { id, tab, isSelf };

  if (tab === 'about') {
    const p = parseUser(id);
    if (!p) return null;
    page.karma = p.karma;
    page.created = p.created;
    page.aboutHtml = p.aboutHtml;
  } else if (tab === 'comments') {
    page.comments = parseUserComments();
  } else {
    // stories / favorites / upvoted / hidden are all standard story lists.
    const list = parseStoryList();
    page.stories = list.stories;
    page.moreUrl = list.moreUrl;
  }
  return page;
}

function injectHideStyle(): HTMLStyleElement {
  const style = document.createElement('style');
  style.id = 'ehn-hide-native';
  // Flush, edge-to-edge takeover. The html gets the panel color so overscroll
  // and the pre-mount moment never flash a different shade — applyPageBackground()
  // takes over with the user's theme once React mounts.
  style.textContent = `
    #hnmain, body > center, body > br { display: none !important; }
    html, body { margin: 0 !important; padding: 0 !important; }
    body { background: transparent !important; }
    html { background: ${PAGE_BG.light}; }
    @media (prefers-color-scheme: dark) { html { background: ${PAGE_BG.dark}; } }
  `;
  (document.head ?? document.documentElement).append(style);
  return style;
}

function domReady(): Promise<void> {
  if (document.readyState === 'loading') {
    return new Promise((resolve) =>
      document.addEventListener('DOMContentLoaded', () => resolve(), { once: true }),
    );
  }
  return Promise.resolve();
}
