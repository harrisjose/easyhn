import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { detectRoute } from '../src/parse/detectRoute';
import { parseStoryList } from '../src/parse/parseStoryList';
import { parseItem } from '../src/parse/parseItem';
import { parseCommentPage } from '../src/parse/parseComment';
import { parseUser } from '../src/parse/parseUser';

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

console.log('\n# Front page (/news)');
const list = parseStoryList(load('news.html'));
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
const item = parseItem(itemId, load('item.html'));
check(!!item?.story.title, `story title: "${item?.story.title?.slice(0, 40)}"`);
check((item?.comments.length ?? 0) > 0, `top-level comments: ${item?.comments.length}`);
const all = item ? flat(item.comments) : [];
check(!!all.find((c) => c.depth > 0), `found a nested comment`);
check(!!all.find((c) => c.html && c.author), `a comment has author + html`);
check(all.every((c) => typeof c.depth === 'number' && c.depth >= 0), `all depths valid`);

console.log('\n# Comment permalink (/item?id=<comment>)');
const commentId = readFileSync(new URL('./fixtures/commentid.txt', import.meta.url), 'utf8').trim();
const page = parseCommentPage(commentId, load('comment.html'));
check(!!page, `recognised as a comment page`);
check(page?.comment.id === commentId, `comment id = ${page?.comment.id}`);
check(!!page?.comment.author && !!page?.comment.html, `comment has author + html`);
check((page?.comment.children.length ?? 0) > 0, `replies: ${page?.comment.children.length}`);
check(!!page?.onStoryTitle, `on story: "${page?.onStoryTitle}"`);
// HN truncates the visible link text; the full title lives in the tooltip.
check(!page?.onStoryTitle?.endsWith('...'), `story title not truncated`);
check(!!page?.onStoryUrl?.includes('item?id='), `story url = ${page?.onStoryUrl}`);
check(!!page?.parentUrl, `parent url = ${page?.parentUrl}`);
check(!!page?.contextUrl?.includes(`#${commentId}`), `context anchors the comment`);
// The regression this replaces: a story page must not read as a comment page,
// or its title ends up being the first comment's body text.
check(parseCommentPage(itemId, load('item.html')) === null, `story page is not a comment page`);
check(!item?.story.title.includes('|'), `story title is a title, not comment chrome`);

console.log('\n# User page (/user)');
const profile = parseUser('pg', load('user.html'));
check((profile?.karma ?? 0) > 0, `karma = ${profile?.karma}`);
check(!!profile?.created, `created = ${profile?.created}`);

console.log('\n# Route detection');
const mk = (p: string, s = '') => ({ pathname: p, search: s }) as Location;
check(detectRoute(mk('/news')).kind === 'storylist', '/news -> storylist');
check(detectRoute(mk('/item', '?id=1')).kind === 'item', '/item -> item');
check(detectRoute(mk('/user', '?id=pg')).kind === 'user', '/user -> user');
check(detectRoute(mk('/submit')).kind === 'unknown', '/submit -> unknown');

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
