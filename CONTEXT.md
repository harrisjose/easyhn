# easyhn

easyhn replaces Hacker News's interface with its own, in the page, using the reader's existing Hacker News session. It renders what Hacker News already served and writes back through Hacker News's own endpoints — it has no server and no account of its own.

## Language

### Hacker News

**Item**:
Anything Hacker News gives an id to — a Story or a Comment. Both are addressed at the same URL and the URL does not say which, so only the page itself distinguishes them.
_Avoid_: post, entry, node, thing

**Story**:
A submission: a title with either an external link or its own text. Job postings are Stories that carry no score and take no vote.
_Avoid_: post, article, link, submission

**Comment**:
A reply in a Story's discussion. Comments nest, and a deleted or flagged one survives as a placeholder with no author and no body.
_Avoid_: reply (that is the act, not the thing), message

**Thread**:
One Story's whole tree of Comments.
_Avoid_: discussion, conversation

**Permalink**:
A view of a single Comment addressed as an Item in its own right. Hacker News shows that Comment where the Story would go and only its own replies beneath, so the surrounding Thread is reachable only through the links in its header.
_Avoid_: single comment page, deep link, focused view

**Session**:
The reader's logged-in state, as Hacker News reports it on the page it served. easyhn shows its own login form, but it submits straight to Hacker News — the password is never read or stored by easyhn.
_Avoid_: auth, credentials, login, account

**Vote link**:
The URL Hacker News puts behind an upvote arrow. It carries the reader's authorisation, so following it *is* the vote — there is no separate vote request to construct.
_Avoid_: vote endpoint, vote action, vote token

**Reply form**:
The hidden fields Hacker News includes in its own comment form. Posting a Comment means re-submitting them, so a Comment cannot be replied to until easyhn holds them.
_Avoid_: comment payload, post body

### Pages

**Route**:
Which kind of Hacker News page the reader is on, decided from the URL alone.
_Avoid_: page type, view, screen

**Takeover**:
Replacing a Hacker News page with easyhn's own rendering of it. Whether a page is taken over is decided from its Route alone, before the page has been read — so the decision can be made without ever interfering with a page easyhn will not redesign.
_Avoid_: injection, override, mount

**Native page**:
A Hacker News page easyhn leaves entirely alone. Any Route easyhn does not redesign stays native rather than being partly redesigned, and a Takeover that cannot be completed gives the page back rather than showing nothing.
_Avoid_: fallback, original, vanilla, passthrough

**Story list**:
A Route showing ranked Stories — the front page, New, Best, Ask, Show, Jobs, and the Story-shaped Profile tabs.
_Avoid_: feed, index, listing

**Profile**:
A user's page. Its tabs — About, Stories, Comments, Favorites, Upvoted, Hidden — are separate Hacker News pages that easyhn presents as one.
_Avoid_: user page, account page

### Reading state

**Visit**:
The record that the reader opened a Thread, and when. Opening a Thread counts as having read it, even if it is closed again immediately.
_Avoid_: view, seen, history entry

**New since last visit**:
Comments posted after the reader's last Visit to that Thread. A Thread with no recorded Visit has nothing new — a first read is not an unread pile.
_Avoid_: unread, updates, changes

### The reader

**Reader**:
The person using easyhn. Distinct from a Hacker News *user*, which is any account whose Profile can be viewed — the Reader is a user only when signed in, and only on their own Profile.
_Avoid_: current user, viewer, me

**Settings**:
The Reader's display preferences. They are carried by the browser's own sync between the Reader's browser profiles and reach every open Hacker News tab at once.
_Avoid_: config, options, preferences
