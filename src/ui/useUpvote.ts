import { useState } from 'react';
import type { VoteState } from '@/src/types';
import { upvote } from '@/src/actions';
import { useToast } from './util';

/**
 * Optimistic upvote state for any votable item (story or comment). Flips to
 * voted immediately, fires HN's vote link, and rolls back with a toast if the
 * write fails (usually because the user isn't logged in).
 */
export function useUpvote(vote: VoteState) {
  const toast = useToast();
  const [voted, setVoted] = useState(vote.upvoted);

  async function handleVote() {
    if (voted || !vote.upvoteUrl) return;
    setVoted(true);
    const ok = await upvote(vote.upvoteUrl);
    if (!ok) {
      setVoted(false);
      toast('Vote failed — are you logged in?');
    }
  }

  return { voted, canUpvote: vote.canUpvote, handleVote };
}
