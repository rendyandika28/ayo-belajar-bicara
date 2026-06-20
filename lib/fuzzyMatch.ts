export type MatchResult = "match" | "close" | "no";

export function isMatch(spoken: string, target: string): MatchResult {
  const s = spoken.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (!s) return "no";

  if (s === t) return "match";

  if (s.includes(t) || t.includes(s)) return "match";

  const tChars = t.split("");
  let matchCount = 0;
  const sCopy = s.split("");

  for (const char of tChars) {
    const idx = sCopy.indexOf(char);
    if (idx !== -1) {
      matchCount++;
      sCopy.splice(idx, 1);
    }
  }

  const overlapRatio = matchCount / tChars.length;

  if (overlapRatio >= 0.7) return "match";
  if (overlapRatio >= 0.5) return "close";

  return "no";
}
