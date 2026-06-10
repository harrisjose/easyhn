import { useState } from 'react';
import type { ReplyForm } from '@/src/types';
import { postComment } from '@/src/actions';
import { useToast } from '../util';

/**
 * Inline comment/reply box. Posts to HN's /comment endpoint using the hidden
 * form fields scraped from the page (or fetched on demand for deep replies).
 */
export function Composer({
  form,
  placeholder = 'Add a comment…',
  onPosted,
  onCancel,
  autoFocus = false,
}: {
  form: ReplyForm;
  placeholder?: string;
  onPosted?: () => void;
  onCancel?: () => void;
  /** Focus on mount — for reply boxes the user just opened, never on load. */
  autoFocus?: boolean;
}) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!text.trim() || busy) return;
    setBusy(true);
    const ok = await postComment(form, text);
    setBusy(false);
    if (ok) {
      setText('');
      toast('Comment posted — reload to see it.');
      onPosted?.();
    } else {
      toast('Could not post — check that you are logged in.');
    }
  }

  return (
    <div className="ehn-composer">
      <textarea
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        autoFocus={autoFocus}
      />
      <div className="ehn-composer-actions">
        <button className="ehn-btn" onClick={submit} disabled={busy || !text.trim()}>
          {busy ? 'Posting…' : 'Post'}
        </button>
        {onCancel && (
          <button className="ehn-btn secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
