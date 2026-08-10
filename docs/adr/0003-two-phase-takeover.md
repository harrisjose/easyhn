# Deciding a Takeover happens in two phases

Whether to take a page over is decided from the Route alone, before the document exists; the page is only parsed once the DOM is ready. The Takeover module therefore has a two-phase interface — `planTakeover(location)` returns null for a Native page, and only a non-null plan can go on to `parse(document)`.

The obvious shape, a single `readPage(document, location)`, cannot work: the content script runs at `document_start`, and easyhn must know whether it is taking the page over *before* it hides Hacker News's own markup. By the time a `document` exists, the chance to leave a Native page untouched has already been missed.

## Consequences

- The ordering is carried by the type rather than by convention: there is no way to reach the parse phase without having passed the Native-page check.
- A parse failure happens *after* Hacker News has been hidden, so `parse()` returns a tagged result naming where it gave up, and the caller restores the native page. Recovery lives with the entrypoint that hid the page; the reason lives with the module that read it.
- The module must never import WXT's `#imports`. That is the whole reason it is testable — the previous home for this logic called `defineContentScript` at module scope and could not be imported by the test runner at all.
