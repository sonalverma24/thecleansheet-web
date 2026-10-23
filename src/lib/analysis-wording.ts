/* The site calls its own work an analysis, not a review. Analyses stored before that
   wording was settled carry the old word in their boilerplate note ("This review
   evaluates brand claims…"), so that note is shown in today's wording. Only our own
   noun and verb forms change; "peer-reviewed" and similar compounds are left alone. */

const WORDS: [RegExp, string][] = [
  [/(?<![\w-])re-review(s?)\b/gi, "re-analysis"],
  [/(?<![\w-])reviews\b/gi, "analyses"],
  [/(?<![\w-])reviewed\b/gi, "analysed"],
  [/(?<![\w-])reviewing\b/gi, "analysing"],
  [/(?<![\w-])review\b/gi, "analysis"],
];

function matchCase(from: string, to: string): string {
  if (from === from.toUpperCase() && from.length > 1) return to.toUpperCase();
  return from[0] === from[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to;
}

export function analysisWording(text: string): string {
  let out = text;
  for (const [re, to] of WORDS) out = out.replace(re, (m) => matchCase(m, to));
  // "a review" became "a analysis".
  return out.replace(/\b(a) analysis\b/gi, (_m, a: string) => `${matchCase(a, "an")} analysis`);
}
