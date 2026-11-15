// Pure helpers for the parent report (Duolingo-style streak + weekly recap).

const MILESTONES = [3, 7, 14, 30, 60, 100];

/** Next streak milestone above the current streak, or null past the last one. */
export function nextMilestone(streak: number): number | null {
  return MILESTONES.find((m) => m > streak) ?? null;
}

/** Index of the day with the most minutes, or -1 when nothing was played. */
export function bestDayIndex(minutes: number[]): number {
  let best = -1;
  minutes.forEach((m, i) => {
    if (m > 0 && (best < 0 || m >= minutes[best])) best = i;
  });
  return best;
}
