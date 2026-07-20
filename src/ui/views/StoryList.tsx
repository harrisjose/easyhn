import { useEffect, useRef, useState } from 'react';
import type { Story } from '@/src/types';
import { itemUrl } from '../util';
import { StoryRow } from '../components/StoryRow';

export function StoryList({ stories, moreUrl }: { stories: Story[]; moreUrl?: string }) {
  const [selected, setSelected] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  // Read inside the keydown handler without re-binding the listener each move.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTyping(e)) return;
      switch (e.key) {
        case 'j':
          setSelected((i) => Math.min(stories.length - 1, i + 1));
          break;
        case 'k':
          setSelected((i) => Math.max(0, i - 1));
          break;
        case 'o':
        case 'Enter': {
          const s = stories[selectedRef.current];
          if (s) window.location.href = s.url ?? itemUrl(s.id);
          break;
        }
        case 'c': {
          const s = stories[selectedRef.current];
          if (s) window.location.href = itemUrl(s.id);
          break;
        }
        default:
          return;
      }
      e.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stories]);

  useEffect(() => {
    if (selected < 0) return;
    containerRef.current
      ?.querySelector(`[data-index="${selected}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (stories.length === 0) {
    return <div className="ehn-empty">No stories on this page.</div>;
  }

  // On the Jobs feed every post is a job, so the "JOB" tag is redundant — only
  // show it when jobs are mixed in among regular stories.
  const showJobBadge = !stories.every((s) => s.isJob);

  return (
    <div ref={containerRef} className="ehn-list">
      {stories.map((s, i) => (
        <StoryRow
          key={s.id}
          story={s}
          index={i}
          selected={i === selected}
          showJobBadge={showJobBadge}
        />
      ))}
      {moreUrl && (
        <a className="ehn-more" href={moreUrl}>
          More ↓
        </a>
      )}
    </div>
  );
}

function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable);
}
