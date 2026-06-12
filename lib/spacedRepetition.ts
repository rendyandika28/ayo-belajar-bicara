// Simplified SM-2 Spaced Repetition Algorithm
// Reference: https://super-memory.com/english/ol/sm2.htm

export interface SRState {
  /** Number of consecutive correct answers */
  reps: number;
  /** Ease factor (1.3 - 2.5+) */
  ease: number;
  /** Days until next review */
  interval: number;
  /** Last reviewed timestamp (ms) */
  lastReviewed: number;
  /** Next review timestamp (ms) */
  nextReview: number;
}

export type SRQuality = 0 | 1 | 2 | 3 | 4 | 5;

export const defaultSRState = (): SRState => ({
  reps: 0,
  ease: 2.5,
  interval: 0,
  lastReviewed: 0,
  nextReview: 0,
});

/**
 * Update SR state after a review.
 * Quality scale (0-5):
 *   0 = complete blackout
 *   1 = wrong, but recognized correct answer
 *   2 = wrong, but answer felt easy
 *   3 = correct with serious difficulty
 *   4 = correct after hesitation
 *   5 = perfect recall
 *
 * For child speech therapy, we simplify to:
 *   0 = forgot (re-attempt soon)
 *   1 = recalled (continue spaced)
 *   2 = easy (stretch interval)
 */
export function updateSR(state: SRState, quality: SRQuality): SRState {
  const now = Date.now();
  const ms = 86400000; // 1 day in ms
  const next = { ...state, lastReviewed: now };

  if (quality < 1) {
    // Failed: reset reps but keep ease
    next.reps = 0;
    next.interval = 0.5; // 12 hours (re-attempt same/next day)
  } else {
    // Successful
    if (state.reps === 0) {
      next.interval = 1; // 1 day
    } else if (state.reps === 1) {
      next.interval = 3; // 3 days
    } else {
      next.interval = Math.round(state.interval * state.ease);
    }
    next.reps = state.reps + 1;
    next.ease = Math.max(
      1.3,
      state.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
    if (quality === 2) {
      // Easy: stretch the interval a bit
      next.interval = Math.round(next.interval * 1.3);
    }
  }

  next.nextReview = now + next.interval * ms;
  return next;
}

/**
 * Pick words that are due for review today.
 * Includes:
 *   - Words that are new (never reviewed)
 *   - Words whose nextReview is today or earlier
 *   - Plus some easy words for variety
 */
export function pickWordsForReview(
  allWords: { id: string }[],
  srMap: Record<string, SRState>,
  count: number,
  options: { includeNewRatio?: number; shuffle?: boolean } = {}
): string[] {
  const { shuffle = true } = options;
  const now = Date.now();

  const due: string[] = [];
  const newWords: string[] = [];

  for (const word of allWords) {
    const sr = srMap[word.id];
    if (!sr || sr.reps === 0) {
      newWords.push(word.id);
    } else if (sr.nextReview <= now) {
      due.push(word.id);
    }
  }

  const result: string[] = [];

  // Pick from due words first
  for (const id of due.slice(0, count)) {
    result.push(id);
  }

  // Fill the rest with new words
  const needed = count - result.length;
  for (const id of newWords.slice(0, needed)) {
    result.push(id);
  }

  // If still not enough, fill with already-learned words for practice
  if (result.length < count) {
    const learned = allWords
      .filter((w) => srMap[w.id] && srMap[w.id].reps > 0)
      .map((w) => w.id);
    for (const id of learned.slice(0, count - result.length)) {
      result.push(id);
    }
  }

  if (shuffle) {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
  }

  return result;
}

/**
 * Mastery level for display purposes
 */
export function getMasteryLevel(state: SRState | undefined): "new" | "learning" | "familiar" | "mastered" {
  if (!state || state.reps === 0) return "new";
  if (state.reps < 3) return "learning";
  if (state.reps < 6) return "familiar";
  return "mastered";
}
