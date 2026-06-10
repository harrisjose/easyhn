import { useEffect, useRef, useState } from 'react';
import type { Story } from '@/src/types';
import { itemUrl } from '../util';
import { StoryRow } from '../components/StoryRow';

export function StoryList({ stories, moreUrl }: { stories: Story[]; moreUrl?: string }) {
  const [selected, setSelected] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

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
          const s = stories[selected];
          if (s) window.location.href = s.url ?? itemUrl(s.id);
          break;
        }
        case 'c': {
          const s = stories[selected];
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
  }, [stories, selected]);

  useEffect(() => {
    if (selected < 0) return;
    containerRef.current
      ?.querySelector(`[data-index="${selected}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (stories.length === 0) {
    return <div className="ehn-empty">No stories on this page.</div>;
  }

  return (
    <div ref={containerRef} className="ehn-list">
      {stories.map((s, i) => (
        <StoryRow key={s.id} story={s} index={i} selected={i === selected} />
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
