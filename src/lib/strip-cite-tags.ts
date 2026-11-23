/* The model sometimes leaves its own grounding markers in the text it writes, such as
   "[cite: REPORT_2]" or "[cite: Amazon India]". They mean nothing to a shopper, so they
   are removed from every string in a stored analysis: on save, and again on read so
   rows saved before this fix are clean without a backfill. */

const CITE_TAG = /\s*\[cite(?:_start|_end)?(?::[^\]]*)?\]/gi;

export function stripCiteTagsFromText(s: string): string {
  if (!s.includes("[")) return s;
  return s.replace(CITE_TAG, "").replace(/ {2,}/g, " ").replace(/ +([.,;:])/g, "$1");
}

/** A copy of `value` with cite markers removed from every string inside it. Values without any are returned as they are. */
export function stripCiteTags<T>(value: T): T {
  if (typeof value === "string") return stripCiteTagsFromText(value) as T;
  if (Array.isArray(value)) {
    let changed = false;
    const out = value.map((v) => { const c = stripCiteTags(v); if (c !== v) changed = true; return c; });
    return (changed ? out : value) as T;
  }
  if (value && typeof value === "object") {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) { const c = stripCiteTags(v); if (c !== v) changed = true; out[k] = c; }
    return (changed ? out : value) as T;
  }
  return value;
}
