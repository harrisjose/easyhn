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
writeFileSync(new URL('item.html', dir), await get(`item?id=${itemId}`));
writeFileSync(new URL('user.html', dir), await get('user?id=pg'));

console.log(`Fixtures refreshed (item ${itemId}).`);
