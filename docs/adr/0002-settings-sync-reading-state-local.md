# Settings go in sync storage, reading state stays local

Settings live in the browser's sync storage area so a change reaches every open Hacker News tab at once and follows the Reader between their own browser profiles. Visits stay in local storage, deliberately, because they are written on every Thread opened and would otherwise exhaust the sync quota and take the Settings writes down with them.

## Consequences

- **Reading state does not follow the Reader between machines.** Marks for what is new in a Thread are per-browser. This is the accepted price of keeping Settings writes reliable.
- Chrome caps sync storage at roughly 100KB across 512 items. A Reader who opens a few hundred Threads would blow past that, and the failures would land on whichever write came next — including the one carrying their actual Settings. Visits are additionally capped and pruned to the most recent few hundred.
- **Sync here is the browser's own sync, not a service easyhn runs.** It carries nothing between Chrome and Firefox, so user-facing copy must not promise that it does.
