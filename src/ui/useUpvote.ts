import { useState } from 'react';
import type { VoteState } from '@/src/types';
import { useToast, useHn } from './util';

/**
 * Optimistic upvote for any votable item (story or comment). Flips to voted
 * immediately, follows HN's vote link, and rolls back with a toast if the write
 * fails (usually because the reader isn't logged in).
 *
 * Returns a rendered decision, not the raw VoteState: callers used to each
 * re-derive "can I vote" from `story.vote`, and disagreed four ways about it.
 */
export interface UpvoteControl {
  /** Show the voted (filled) arrow. */
  voted: boolean;
  /** Whether HN offers a vote here at all — comments hide the button entirely. */
  available: boolean;
  /** Offered, but not actionable right now. Lists disable rather than hide. */
  disabled: boolean;
  onVote: () => void;
}

export function useUpvote(vote: VoteState): UpvoteControl {
  const toast = useToast();
  const hn = useHn();
  const [voted, setVoted] = useState(vote.upvoted);
  const [busy, setBusy] = useState(false);

  // The vote link IS the vote — an arrow with no link behind it can never do
  // anything, so it must never render as an actionable button.
  const actionable = vote.canUpvote && !!vote.upvoteUrl;

  async function onVote() {
    if (voted || busy || !vote.upvoteUrl) return;
    setVoted(true);
    setBusy(true);
    const ok = await hn.upvote(vote.upvoteUrl);
    setBusy(false);
    if (!ok) {
      setVoted(false);
      toast('Vote failed — are you logged in?');
    }
  }

  return {
    voted,
    available: actionable || voted,
    disabled: !actionable || voted || busy,
    onVote,
  };
}
