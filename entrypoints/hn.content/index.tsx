import { createRoot, type Root } from 'react-dom/client';
import { defineContentScript, createShadowRootUi } from '#imports';
import { planTakeover } from '@/src/parse/takeover';
import { createLedger } from '@/src/visits/ledger';
import { createHnClient, fetchTransport } from '@/src/hn/client';
import { extensionVisitStore } from '@/src/visits/store';
import { getSettings } from '@/src/settings/store';
import { DEFAULT_SETTINGS } from '@/src/settings/schema';
import { applyPageBackground, applyTheme, PAGE_BG } from '@/src/settings/applyTheme';
import { App } from '@/src/ui/App';
import '@/assets/styles/theme.css';

export default defineContentScript({
  matches: ['*://news.ycombinator.com/*'],
  runAt: 'document_start',
  cssInjectionMode: 'ui',
  async main(ctx) {
    // Decided from the URL alone, before the DOM exists: a route we don't
    // redesign has to be left completely alone, so we can't wait to look.
    const plan = planTakeover(window.location);
    if (!plan) return;

    // Hide native HN as early as possible to avoid a flash of the old UI.
    const hideStyle = injectHideStyle();

    await domReady();

    const result = plan.parse(document);
    if (!result.ok) {
      // Parsing failed unexpectedly — restore the native page rather than
      // showing a blank screen, and name the markup that moved.
      hideStyle.remove();
      console.warn(`easyhn: could not read this page (${result.reason})`);
      return;
    }
    const { page, session } = result;
    const ledger = createLedger(extensionVisitStore);
    const hn = createHnClient(fetchTransport);

    // Read settings before the first paint. Applying them from an effect instead
    // re-wraps the column (font / font size) a frame in, which on a long thread
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
            route={plan.route}
            session={session}
            page={page}
            ledger={ledger}
            hn={hn}
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
