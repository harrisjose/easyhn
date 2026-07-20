import type { UserComment } from '@/src/types';
import { parseVote, parseAge, toAbsolute } from './auth';
import { stripReply } from './parseItem';

/**
 * Parse a /threads?id= page (a user's own comments) into a flat list. Each
 * comment row carries its story context in the `.onstory` part of the header.
 */
export function parseUserComments(doc: Document = document): UserComment[] {
  const out: UserComment[] = [];

  doc.querySelectorAll<HTMLTableRowElement>('tr.athing.comtr').forEach((row) => {
    const id = row.id;
    if (!id) return;

    const comhead = row.querySelector('.comhead');
    const author = comhead?.querySelector('.hnuser')?.textContent?.trim() || undefined;

    const { ageText, ageTitle } = parseAge(comhead);

    const onStory = comhead?.querySelector<HTMLAnchorElement>('.onstory a');
    const onStoryTitle = onStory?.textContent?.trim() || undefined;
    const onStoryUrl = toAbsolute(onStory?.getAttribute('href') ?? undefined);

    const commtext = row.querySelector('.commtext');
    const dead = !commtext;
    const html = commtext ? stripReply(commtext) : '';

    out.push({
      id,
      author,
      ageText,
      ageTitle,
      html,
      onStoryTitle,
      onStoryUrl,
      dead,
      vote: parseVote(id, row),
    });
  });

  return out;
}
