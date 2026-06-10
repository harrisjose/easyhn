import type { UserProfile } from '@/src/types';
import { toAbsolute } from './auth';

/**
 * Parse a /user?id= page. HN renders a small <table> of labelled rows
 * ("user:", "created:", "karma:", "about:"). For one's own profile those
 * become editable inputs, which we read by `.value` instead of text.
 */
export function parseUser(userId: string, doc: Document = document): UserProfile | null {
  const main = doc.querySelector('#hnmain') ?? doc.body;
  if (!main) return null;

  const fields = new Map<string, HTMLTableCellElement>();
  main.querySelectorAll<HTMLTableRowElement>('tr').forEach((tr) => {
    const cells = tr.querySelectorAll('td');
    if (cells.length < 2) return;
    const label = cells[0].textContent?.trim().replace(/:$/, '').toLowerCase();
    if (label && !fields.has(label)) fields.set(label, cells[1] as HTMLTableCellElement);
  });

  const readText = (key: string): string | undefined => {
    const cell = fields.get(key);
    if (!cell) return undefined;
    const input = cell.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    const value = input ? input.value : cell.textContent;
    return value?.trim() || undefined;
  };

  const isSelf = !!main.querySelector('input[name="hmac"], form[action="xuser"]');

  const created = fields.get('created')?.querySelector('a')?.textContent?.trim() || readText('created');
  const karmaText = readText('karma');

  const aboutCell = fields.get('about');
  const aboutInput = aboutCell?.querySelector<HTMLTextAreaElement>('textarea');
  const aboutHtml = aboutInput ? escapeHtml(aboutInput.value) : aboutCell?.innerHTML.trim();

  return {
    id: userId,
    created,
    karma: karmaText ? parseInt(karmaText, 10) : undefined,
    aboutHtml: aboutHtml || undefined,
    submissionsUrl: toAbsolute(`submitted?id=${encodeURIComponent(userId)}`),
    commentsUrl: toAbsolute(`threads?id=${encodeURIComponent(userId)}`),
    isSelf,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}
