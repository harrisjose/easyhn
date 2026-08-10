import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { planTakeover, type ParseResult } from '../src/parse/takeover';
import { parseEpoch } from '../src/parse/auth';
import { newSince } from '../src/visits/newComments';
import { createLedger, inMemoryVisitStore, type Visits } from '../src/visits/ledger';
import { createPatcher, inMemorySettingsStore } from '../src/settings/patcher';
import { DEFAULT_SETTINGS, type Settings } from '../src/settings/schema';
import { PAGE_BG } from '../src/settings/applyTheme';
import { createHnClient } from '../src/hn/client';
import { LIST_PATHS, NAV, PROFILE_TABS, PROFILE_TAB_BY_PATH } from '../src/hn/urls';
import type { Comment, PageModel } from '../src/types';

// Fixtures are real Hacker News HTML captured under tests/fixtures. Refresh
// them with `pnpm test:fixtures` if HN's markup changes.
function load(file: string) {
  const html = readFileSync(new URL(`./fixtures/${file}`, import.meta.url), 'utf8');
  return new JSDOM(html).window.document;
}

let failures = 0;
const check = (cond: boolean, msg: string) => {
  console.log(`${cond ? '✓' : '✗ FAIL'}  ${msg}`);
  if (!cond) failures++;
};
const flat = (cs: any[]): any[] => cs.flatMap((c) => [c, ...flat(c.children)]);
/** A comment carrying only the fields the new-marking logic looks at. */
const stub = (id: string, time: number): Comment => ({
  id,
  time,
  html: '',
  depth: 0,
  vote: { canUpvote: false, upvoted: false },
  children: [],
  dead: false,
});

const mk = (p: string, s = '') => ({ pathname: p, search: s }) as Location;

/** Take a page over and parse it, failing the test if either phase gives up. */
function takeover(path: string, search: string, fixture: string): ParseResult {
  const plan = planTakeover(mk(path, search));
  if (!plan) throw new Error(`${path}${search} was treated as a native page`);
  return plan.parse(load(fixture));
}
/** The parsed page, narrowed to the kind the caller expects. */
function pageOf<K extends PageModel['kind']>(
  result: ParseResult,
  kind: K,
): Extract<PageModel, { kind: K }> {
  if (!result.ok) throw new Error(`parse failed: ${result.reason}`);
  if (result.page.kind !== kind) throw new Error(`expected ${kind}, got ${result.page.kind}`);
  return result.page as Extract<PageModel, { kind: K }>;
}

console.log('\n# Native pages (left alone)');
check(planTakeover(mk('/submit')) === null, '/submit is native');
check(planTakeover(mk('/item')) === null, '/item with no id is native');
check(planTakeover(mk('/user')) === null, '/user with no id is native');
check(planTakeover(mk('/news')) !== null, '/news is taken over');
check(planTakeover(mk('/hidden')) !== null, '/hidden is taken over without an id');

console.log('\n# Routes');
check(planTakeover(mk('/news'))?.route.kind === 'storylist', '/news -> storylist');
check(planTakeover(mk('/item', '?id=1'))?.route.kind === 'item', '/item -> item');
check(planTakeover(mk('/user', '?id=pg'))?.route.kind === 'user', '/user -> user');
check(planTakeover(mk('/threads', '?id=pg'))?.route.tab === 'comments', '/threads -> comments tab');
check(planTakeover(mk('/favorites', '?id=pg'))?.route.tab === 'favorites', '/favorites -> favorites tab');

console.log('\n# Front page (/news)');
const list = pageOf(takeover('/news', '', 'news.html'), 'storylist');
const s0 = list.stories[0];
check(list.stories.length >= 20, `parsed ${list.stories.length} stories`);
check(!!s0?.id && !!s0?.title, `first story id+title: "${s0?.title?.slice(0, 40)}"`);
check(s0?.rank === 1, `rank = ${s0?.rank}`);
check(s0?.score != null || s0?.isJob, `score = ${s0?.score}`);
check(!!s0?.author || s0?.isJob, `author = ${s0?.author}`);
check(s0?.commentCount != null || s0?.isJob, `comments = ${s0?.commentCount}`);
check(!!s0?.vote.upvoteUrl || s0?.isJob, `vote url present`);
check(!!list.moreUrl, `More link present`);
check(!!list.stories.find((s) => s.domain), `a story has a domain`);

console.log('\n# Item page (/item)');
const itemId = readFileSync(new URL('./fixtures/itemid.txt', import.meta.url), 'utf8').trim();
const { item } = pageOf(takeover('/item', `?id=${itemId}`, 'item.html'), 'item');
check(!!item.story.title, `story title: "${item.story.title?.slice(0, 40)}"`);
check(item.comments.length > 0, `top-level comments: ${item.comments.length}`);
const all = flat(item.comments);
check(!!all.find((c) => c.depth > 0), `found a nested comment`);
check(!!all.find((c) => c.html && c.author), `a comment has author + html`);
check(all.every((c) => typeof c.depth === 'number' && c.depth >= 0), `all depths valid`);
// Timestamps drive the new-comment marks; without them nothing is ever new.
check(all.every((c) => (c.time ?? 0) > 1e9), `every comment has a unix time`);
check(!!all[0]?.ageTitle?.includes(String(all[0]?.time)), `time matches the age tooltip`);

console.log('\n# Comment permalink (/item?id=<comment>)');
const commentId = readFileSync(new URL('./fixtures/commentid.txt', import.meta.url), 'utf8').trim();
const { permalink } = pageOf(takeover('/item', `?id=${commentId}`, 'comment.html'), 'permalink');
check(permalink.comment.id === commentId, `comment id = ${permalink.comment.id}`);
check(!!permalink.comment.author && !!permalink.comment.html, `comment has author + html`);
check(permalink.comment.children.length > 0, `replies: ${permalink.comment.children.length}`);
check(!!permalink.onStoryTitle, `on story: "${permalink.onStoryTitle}"`);
// HN truncates the visible link text; the full title lives in the tooltip.
check(!permalink.onStoryTitle?.endsWith('...'), `story title not truncated`);
check(!!permalink.onStoryUrl?.includes('item?id='), `story url = ${permalink.onStoryUrl}`);
check(!!permalink.parentUrl, `parent url = ${permalink.parentUrl}`);
check(!!permalink.contextUrl?.includes(`#${commentId}`), `context anchors the comment`);

console.log('\n# Story vs comment dispatch');
// The regression this replaces: a story page must not read as a comment page,
// or its title ends up being the first comment's body text. Both URLs are
// /item?id=, so only the page itself decides — which is why this is asserted
// through the takeover rather than against either parser.
const asItem = takeover('/item', `?id=${itemId}`, 'item.html');
const asPermalink = takeover('/item', `?id=${commentId}`, 'comment.html');
check(asItem.ok && asItem.page.kind === 'item', `story page -> item`);
check(asPermalink.ok && asPermalink.page.kind === 'permalink', `comment page -> permalink`);
check(!item.story.title.includes('|'), `story title is a title, not comment chrome`);

console.log('\n# User page (/user)');
const { profile } = pageOf(takeover('/user', '?id=pg', 'user.html'), 'profile');
check((profile.karma ?? 0) > 0, `karma = ${profile.karma}`);
check(!!profile.created, `created = ${profile.created}`);
check(profile.tab === 'about', `tab = ${profile.tab}`);
check(!profile.isSelf, `pg is not the logged-out reader`);

console.log('\n# Failure reasons');
const empty = new JSDOM('<html><body></body></html>').window.document;
const itemFail = planTakeover(mk('/item', '?id=1'))!.parse(empty);
check(!itemFail.ok && itemFail.reason === 'no-item-head', `bare page -> ${!itemFail.ok && itemFail.reason}`);
// /hidden is the logged-in reader's own page, so logged out there is no id to use.
const hiddenFail = planTakeover(mk('/hidden'))!.parse(empty);
check(
  !hiddenFail.ok && hiddenFail.reason === 'no-profile-id',
  `/hidden logged out -> ${!hiddenFail.ok && hiddenFail.reason}`,
);
// An empty list is a real page, not a failure — the list view renders its own
// empty state, and failing here would restore native HN instead.
const emptyList = planTakeover(mk('/news'))!.parse(empty);
check(emptyList.ok && emptyList.page.kind === 'storylist', `empty story list still parses`);

console.log('\n# Age tooltip -> unix time');
check(parseEpoch('2026-08-10T06:16:42 1786342602') === 1786342602, 'reads the epoch half');
// Older HN markup carried only the ISO half, which is UTC with no zone on it.
check(parseEpoch('2026-08-10T06:16:42') === Date.UTC(2026, 7, 10, 6, 16, 42) / 1000, 'falls back to ISO, as UTC');
check(parseEpoch(undefined) === undefined, 'no tooltip -> no time');
check(parseEpoch('not a date') === undefined, 'unparseable -> no time');

console.log('\n# New since last visit');
// A synthetic tree: the fixture is whatever story was hot when it was captured,
// so it can't be relied on to contain comments either side of a cutoff.
const tree = (): Comment[] => [
  { ...stub('1', 100), children: [stub('2', 300), { ...stub('3', 50), children: [stub('4', 400)] }] },
  stub('5', 200),
];
check(newSince(tree(), 150).join() === '2,4,5', `ids after the cutoff, in render order`);
check(newSince(tree(), null).length === 0, `first visit marks nothing`);
check(newSince(tree(), 1000).length === 0, `nothing newer than the cutoff`);
// Undated comments must fail closed, or a markup change lights up whole threads.
check(newSince([{ ...stub('9', 0), time: undefined }], 1).length === 0, `no timestamp -> not new`);

console.log('\n# Visit ledger');
{
  // The ordering this module exists for: read the stored visit, THEN re-stamp
  // it. Written the other way round, the read returns the timestamp just
  // written and a returning reader is told nothing is new.
  const store = inMemoryVisitStore({ '42': { seenAt: 150 } });
  const ledger = createLedger(store);

  const first = await ledger.openThread('42', tree());
  check(first.order.join() === '2,4,5', `marks against the stored visit, not the new one`);
  check(first.newIds.has('4') && !first.newIds.has('1'), `newIds agrees with order`);

  // The visit was re-stamped, so coming straight back finds nothing new.
  const second = await ledger.openThread('42', tree());
  check(second.order.length === 0, `re-opening marks nothing`);

  const fresh = createLedger(inMemoryVisitStore());
  check((await fresh.openThread('99', tree())).order.length === 0, `first visit marks nothing`);

  // A thread with no new comments shares one empty set rather than allocating.
  const a = await fresh.openThread('1', []);
  const b = await fresh.openThread('2', []);
  check(a.newIds === b.newIds, `empty marks share one set`);
}

{
  // Pruning keeps the most recent threads and drops the oldest.
  const seeded: Visits = {};
  for (let i = 0; i < 405; i++) seeded[`t${i}`] = { seenAt: i };
  const store = inMemoryVisitStore(seeded);
  await createLedger(store).openThread('new', []);
  const kept = await store.read();
  check(Object.keys(kept).length === 400, `pruned to 400, kept ${Object.keys(kept).length}`);
  check(!!kept['new'], `the thread just opened survives`);
  check(!kept['t0'] && !!kept['t404'], `oldest dropped, newest kept`);
}

console.log('\n# Settings patches');
{
  // Two toggles in quick succession, against a store whose writes take time to
  // commit — as a real one does. Unserialised, both patches read before either
  // write lands, the second clobbers the first, and the reader watches their
  // change revert when the storage watcher fires.
  const store = inMemorySettingsStore();
  const slow = {
    read: store.read,
    write: async (s: Settings) => {
      await new Promise((r) => setTimeout(r, 0));
      return store.write(s);
    },
  };
  const { patch, read } = createPatcher(slow);

  await Promise.all([patch({ theme: 'dark' }), patch({ font: 'serif' })]);
  const after = await read();
  check(after.theme === 'dark' && after.font === 'serif', `concurrent patches both land`);
  check(after.fontSize === DEFAULT_SETTINGS.fontSize, `untouched keys keep their defaults`);
}

{
  // A write that throws must not stall the queue behind it.
  let failNext = true;
  const store = inMemorySettingsStore();
  const flaky = {
    read: store.read,
    write: async (s: Settings) => {
      if (failNext) throw new Error('storage full');
      return store.write(s);
    },
  };
  const { patch, read } = createPatcher(flaky);

  let rejected = false;
  await patch({ theme: 'dark' }).catch(() => {
    rejected = true;
  });
  check(rejected, `a failed write rejects rather than resolving`);

  failNext = false;
  await patch({ font: 'serif' });
  check((await read()).font === 'serif', `a failed write doesn't stall later ones`);
}

console.log('\n# Hacker News client');
{
  // A transport that records what it was asked to do and answers as told.
  function fakeTransport(opts: { ok?: boolean; doc?: Document | null } = {}) {
    const calls: { kind: string; url: string; body?: string }[] = [];
    return {
      calls,
      transport: {
        getDocument: async (url: string) => {
          calls.push({ kind: 'getDocument', url });
          return opts.doc ?? null;
        },
        get: async (url: string) => {
          calls.push({ kind: 'get', url });
          return opts.ok ?? true;
        },
        postForm: async (url: string, body: URLSearchParams) => {
          calls.push({ kind: 'postForm', url, body: body.toString() });
          return opts.ok ?? true;
        },
      },
    };
  }

  const voteLink = 'https://news.ycombinator.com/vote?id=1&how=up&auth=abc';
  const f = fakeTransport({ ok: true });
  const client = createHnClient(f.transport);

  check(await client.upvote(voteLink), `upvote reports success`);
  check(f.calls[0]?.url === voteLink, `the vote link is followed verbatim, auth and all`);

  const failing = fakeTransport({ ok: false });
  check(
    !(await createHnClient(failing.transport).upvote(voteLink)),
    `a rejected vote reports failure, so the ui can roll back`,
  );

  const posting = fakeTransport({ ok: true });
  await createHnClient(posting.transport).postComment(
    { parent: '42', goto: 'item?id=42', hmac: 'deadbeef' },
    'hello',
  );
  const post = posting.calls[0];
  check(post?.url === 'https://news.ycombinator.com/comment', `comments post to /comment`);
  check(
    ['parent=42', 'goto=item%3Fid%3D42', 'hmac=deadbeef', 'text=hello'].every((p) =>
      post?.body?.includes(p),
    ),
    `HN's own hidden fields are re-submitted alongside the text`,
  );

  // The reply form is scraped out of the page HN serves at the reply link.
  const replyDoc = new JSDOM(
    `<form action="comment"><input name="parent" value="7"><input name="goto" value="item?id=7"><input name="hmac" value="cafe"></form>`,
  ).window.document;
  const withDoc = createHnClient(fakeTransport({ doc: replyDoc }).transport);
  const form = await withDoc.fetchReplyForm('https://news.ycombinator.com/reply?id=7');
  check(form?.parent === '7' && form?.hmac === 'cafe', `reply form read from the fetched page`);

  const noDoc = createHnClient(fakeTransport({ doc: null }).transport);
  check((await noDoc.fetchReplyForm('x')) === null, `a failed fetch yields no form`);

  // The profile fetch the Profile view used to do for itself.
  const profileDoc = load('user.html');
  const withProfile = fakeTransport({ doc: profileDoc });
  const p = await createHnClient(withProfile.transport).fetchProfile('pg');
  check((p?.karma ?? 0) > 0, `profile stats fetched and parsed: karma ${p?.karma}`);
  check(
    withProfile.calls[0]?.url === 'https://news.ycombinator.com/user?id=pg',
    `profile fetched from its own page`,
  );
}

console.log('\n# Theme palette');
{
  // PAGE_BG is painted onto <html>, which sits outside the shadow root and so
  // can't read --bg. The two must agree or the pre-mount flash and the
  // overscroll rubber-band show last month's colour.
  const css = readFileSync(new URL('../assets/styles/theme.css', import.meta.url), 'utf8');
  const bgAfter = (from: number) => css.slice(from).match(/--bg:\s*([^;]+);/)?.[1].trim();
  const light = bgAfter(0);
  const dark = bgAfter(css.indexOf('[data-theme="dark"]'));

  check(light === PAGE_BG.light, `--bg light ${light} matches PAGE_BG.light ${PAGE_BG.light}`);
  check(dark === PAGE_BG.dark, `--bg dark ${dark} matches PAGE_BG.dark ${PAGE_BG.dark}`);
}

console.log('\n# Site tables agree');
{
  // The header used to keep its own list of slugs; a drift silently stopped the
  // active tab highlighting, because Header compares route.list to its own copy.
  check(
    NAV.every((n) => LIST_PATHS[n.path] === n.slug),
    `every nav entry resolves to the slug it highlights on`,
  );
  check(
    PROFILE_TABS.every((t) => PROFILE_TAB_BY_PATH[t.path]?.tab === t.tab),
    `every profile tab round-trips through its HN path`,
  );
  check(
    planTakeover(mk('/hidden'))?.route.tab === 'hidden',
    `the idless tab is routed without an id`,
  );
}

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
