export type MatchResult = "match" | "close" | "no";

// Chrome writes numbers as digits ("satu" -> "1"), so number words never matched.
const NUMBERS = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh"];

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // café -> cafe
    .toLowerCase()
    .replace(/\d+/g, (d) => NUMBERS[Number(d)] ?? d)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Target said as whole word(s): "itu kucing" yes, "tapi" for "api" no. */
export function saysExactly(spoken: string, target: string): boolean {
  const s = normalize(spoken);
  const t = normalize(target);
  return !!s && !!t && ` ${s} `.includes(` ${t} `);
}

export type Judgement = { result: MatchResult | null; heard: string };

/**
 * Strict on uncertain input, lenient on the settled one:
 * - any alternative or interim guess counts only if it says the word exactly;
 * - the final top guess goes through the lenient isMatch (kids' speech is imprecise).
 * result null = no verdict yet (still listening).
 */
export function judge(top: string, alternatives: string[], target: string, isFinal: boolean): Judgement {
  const exact = [top, ...alternatives].find((g) => saysExactly(g, target));
  if (exact) return { result: "match", heard: exact };
  if (!isFinal) return { result: null, heard: top };
  return { result: isMatch(top, target), heard: top };
}

export function isMatch(spoken: string, target: string): MatchResult {
  const s = normalize(spoken);
  const t = normalize(target);

  if (!s) return "no";

  if (s === t) return "match";

  if (` ${s} `.includes(` ${t} `)) return "match";
  // A cut-off word counts only when most of it was said ("kuci" for "kucing", not "ku").
  if (t.startsWith(s) && s.length >= t.length * 0.6) return "match";

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
