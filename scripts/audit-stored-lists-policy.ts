/* How a stored ingredient list compares with what the current reader finds on the same page. Pure functions, no network. */
export type ListVerdict =
  | "same"
  | "stored-missing-tail"   // the page reads longer and the stored list is its start: the last entries were lost (a glued last entry, a cut blend)
  | "stored-missing-head"   // the page reads longer and the stored list is its end: the first entries were lost
  | "stored-missing-middle" // every stored entry is on the page, but entries between them are not stored
  | "stored-has-extra"      // the page reads shorter and every live entry is stored: the stored list holds something the page does not (a menu, a key-actives line, another product)
  | "different"             // little in common: another page, another version, or a wrong list
  | "page-unreadable";      // the current reader finds no list on the page

/** The name as the comparison sees it: case, brackets and punctuation do not matter ("Water/Aqua" and "Aqua (Water)" are different strings but the same slot only by position, so they are not merged here). */
export const norm = (s: string): string => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "");

const dedupe = (xs: string[]): string[] => xs.filter((x, i) => x && x !== xs[i - 1]);

export interface ListComparison { verdict: ListVerdict; storedCount: number; liveCount: number; missingFromStored: string[]; missingFromLive: string[]; overlap: number }

export function compareLists(stored: string[], live: string[] | null): ListComparison {
  const s = dedupe(stored.map(norm));
  const l = live ? dedupe(live.map(norm)) : [];
  const base = { storedCount: stored.length, liveCount: live?.length ?? 0 };
  if (!live || !l.length) return { ...base, verdict: "page-unreadable", missingFromStored: [], missingFromLive: [], overlap: 0 };
  const inLive = new Set(l), inStored = new Set(s);
  const missingFromStored = live.filter((x) => !inStored.has(norm(x)));
  const missingFromLive = stored.filter((x) => !inLive.has(norm(x)));
  const overlap = s.filter((x) => inLive.has(x)).length / Math.max(1, Math.min(s.length, l.length));
  const out = (verdict: ListVerdict): ListComparison => ({ ...base, verdict, missingFromStored, missingFromLive, overlap });
  if (s.length === l.length && s.every((x, i) => x === l[i])) return out("same");
  if (l.length > s.length && s.every((x, i) => x === l[i])) return out("stored-missing-tail");
  if (l.length > s.length && s.every((x, i) => x === l[l.length - s.length + i])) return out("stored-missing-head");
  if (!missingFromLive.length && missingFromStored.length) return out("stored-missing-middle");
  if (!missingFromStored.length && missingFromLive.length) return out("stored-has-extra");
  return out("different");
}

/** Which kind of source a stored list came from, from the evidence it recorded. */
export function sourceKind(origin: string | undefined, url: string): "brand-page" | "decoder" | "nykaa" | "other" {
  if (origin === "nykaa" || /(^|\.)nykaa\.com\//i.test(url)) return "nykaa";
  if (origin === "decoder" || /incidecoder\.com|inkeedecoder\.com/i.test(url)) return "decoder";
  if (origin === "brand-page") return "brand-page";
  return "other";
}
