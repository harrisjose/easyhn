# Read Hacker News's served HTML, not its API

easyhn parses the HTML Hacker News already served to the page rather than fetching from Hacker News's public API. The API is anonymous and read-only, so it cannot supply the three things easyhn depends on most: the Reader's Session, the Vote link behind each upvote arrow, and the hidden fields of a Reply form. Parsing the served page gets all three for free, with no extra request and no credentials of our own.

## Considered options

**The public Firebase API.** Clean, stable, documented — and unusable here. It serves anonymous data only: no logged-in state, no per-Reader vote links, no reply-form hmacs. An extension built on it could display Hacker News but could not act as the Reader, which is most of the point. It would also cost a network round-trip for content the browser has already downloaded.

**Parsing the served HTML.** Chosen. The page the Reader was already sent carries everything, including the parts that only exist because they are logged in.

## Consequences

- **Hacker News's markup is a dependency.** A layout change on their side can break parsing, and there is no version or contract to rely on. This is the cost we accepted, and it is why HTML fixtures are captured from live Hacker News and checked by a parse test suite rather than hand-written.
- **Writes reuse Hacker News's own endpoints and the Reader's existing cookies**, which is why voting and commenting work without easyhn ever handling a password.
- **Fixtures captured anonymously cannot cover logged-in parsing.** Vote state, Session details and Reply forms only appear in HTML served to a signed-in Reader, so those paths need a different way to get exercised.
