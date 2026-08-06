// Refresh the HN HTML fixtures used by parse.test.ts.
// Usage: pnpm test:fixtures
import { writeFileSync } from 'node:fs';

const UA = 'Mozilla/5.0';
const dir = new URL('./fixtures/', import.meta.url);

async function get(path: string): Promise<string> {
  const res = await fetch(`https://news.ycombinator.com/${path}`, {
    headers: { 'User-Agent': UA },
  });
  return res.text();
}

const news = await get('news');
writeFileSync(new URL('news.html', dir), news);

const itemId = news.match(/item\?id=(\d+)/)?.[1];
if (!itemId) throw new Error('could not find an item id on the front page');
writeFileSync(new URL('itemid.txt', dir), itemId);
const item = await get(`item?id=${itemId}`);
writeFileSync(new URL('item.html', dir), item);
writeFileSync(new URL('user.html', dir), await get('user?id=pg'));

// A comment from that thread, fetched as its own /item page — the permalink
// shape, which HN renders completely differently from a story. Prefer one that
// has replies, so the fixture also covers parsing the subtree below it.
const commentId = pickComment(item);
if (!commentId) throw new Error(`no comments on item ${itemId} to permalink`);
writeFileSync(new URL('commentid.txt', dir), commentId);
writeFileSync(new URL('comment.html', dir), await get(`item?id=${commentId}`));

console.log(`Fixtures refreshed (item ${itemId}, comment ${commentId}).`);

/** A comment with at least one reply (its successor is indented deeper). */
function pickComment(html: string): string | undefined {
  const rows = [...html.matchAll(/comtr['"] id=['"](\d+)['"][\s\S]*?indent=['"](\d+)['"]/g)].map(
    (m) => ({ id: m[1], indent: Number(m[2]) }),
  );
  const parent = rows.find((row, i) => rows[i + 1] && rows[i + 1].indent > row.indent);
  return (parent ?? rows[0])?.id;
}
