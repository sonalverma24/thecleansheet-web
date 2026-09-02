/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Page-level INCI extractor
   INCIDecoder is the preferred INCI source, but most Indian brands
   (and any product launched in the last few weeks) are not on it. Their
   full ingredient list, however, is usually printed on the brand's own
   PDP — inside a "Product Ingredients" / "Full Ingredient List" accordion.
   The keyless Jina reader collapses those accordions and drops the list,
   so a review of such a product would report "INCI not available" even
   though it is plainly on the website.

   This module reads the product page's RAW HTML (accordions and all) and
   deterministically parses the INCI out of it — no model, no fabrication,
   just the comma-separated list the brand published. It is the fallback
   the review engine uses whenever INCIDecoder cannot resolve the product.
──────────────────────────────────────────────────────────────── */

import { fetchPageMarkdown } from "@/lib/scrape";

export interface PageINCI {
  ingredients: string[];
  source: string; // the URL the list was read from
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

/** Fetch a page's raw server-rendered HTML (browser UA). Returns null on any
    failure — the caller then falls back to the keyless Jina reader. */
async function fetchRawHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** HTML → flat text, keeping ingredient punctuation (/, -, parentheses, commas). */
function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ndash;|&mdash;/g, "-")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* Section headers that mark the END of an ingredient list (the accordion item
   that follows it), and address/regulatory boilerplate that can precede it. */
const STOP =
  /\b(how to use|directions?|benefits?|precautions?|storage|warnings?|key ingredients|about the brand|why (?:you'?ll|we) love|frequently asked|reviews?|country of origin|shelf life|net (?:wt|weight)|manufactured|marketed by|imported by|importer|customer care|expiry|best before)\b/i;

/* An "Ingredients:" label; the capture group is whatever ingredient text
   trails it on the same comma-token (e.g. "Product Ingredients Water"). */
const LABEL =
  /\b(?:full ingredients?|product ingredients?|ingredients?|inci)\b\s*[:\-]?\s*(.+)$/i;

/* At least one of these must appear in a candidate list for it to be accepted
   as an INCI — a plain comma-separated marketing sentence will not contain them. */
const ANCHOR =
  /\b(aqua|water|glycerin|glycerine|butylene glycol|niacinamide|cetearyl alcohol|phenoxyethanol|dimethicone|centella|sodium|tocopherol|caprylic\/capric|cetyl)\b/i;

function looksLikeIngredient(t: string): boolean {
  const s = t.trim();
  if (s.length < 2 || s.length > 70) return false;
  if (!/[a-z]/i.test(s)) return false; // must carry letters (drops "36", "007")
  if (/[.!?;:]$/.test(s)) return false; // sentence fragment, not an INCI item
  if ((s.match(/\s+/g) || []).length > 7) return false; // too many words for one item
  if (/https?:|@|www\.|\bpvt\b|\bltd\b|road|marg|compound|©|®™?/i.test(s)) return false;
  // Letters, digits, spaces and INCI punctuation only.
  return /^[A-Za-z0-9][A-Za-z0-9 ,\-\/().'’+&*]*$/.test(s);
}

const cleanTok = (s: string): string =>
  s.replace(/\s+/g, " ").replace(/\s*\/\s*/g, "/").replace(/\s*-\s*/g, "-").trim();

/** Parse the longest INCI-looking comma list out of flat page text. Empty if
    no confident list is found. Deterministic — never invents an ingredient. */
export function extractInciFromText(text: string): string[] {
  // Comma-split, re-joining numeric CAS-style fragments ("1" + "2-Hexanediol").
  const rawParts = text.split(",");
  const parts: string[] = [];
  for (let i = 0; i < rawParts.length; i++) {
    let p = rawParts[i].trim();
    while (/^[0-9]+$/.test(p) && i + 1 < rawParts.length) p = `${p},${rawParts[++i].trim()}`;
    parts.push(p);
  }

  // Walk the tokens, keeping the longest contiguous run of ingredient-like items.
  let best: string[] = [];
  let cur: string[] = [];
  const flush = () => {
    if (cur.length > best.length) best = cur.slice();
    cur = [];
  };

  for (const p of parts) {
    const stopM = STOP.exec(p);
    if (stopM) {
      // A section header ends the current list. Keep any ingredient text before
      // it; a fresh "Ingredients:" label after it can start a new run.
      const head = p.slice(0, stopM.index).trim();
      if (looksLikeIngredient(head)) cur.push(cleanTok(head));
      flush();
      const lm = LABEL.exec(p);
      if (lm && looksLikeIngredient(lm[1])) cur.push(cleanTok(lm[1]));
      continue;
    }
    if (looksLikeIngredient(p)) {
      cur.push(cleanTok(p));
      continue;
    }
    // Rejected token: if it ends with an "Ingredients:" label, begin the run at
    // the trailing ingredient (so a leading "Water" glued to the label survives).
    const lm = LABEL.exec(p);
    if (lm && looksLikeIngredient(lm[1])) {
      flush();
      cur.push(cleanTok(lm[1]));
    } else {
      flush();
    }
  }
  flush();

  if (best.length < 5) return [];
  if (!best.some((x) => ANCHOR.test(x))) return [];
  // De-dupe consecutive repeats (some pages print the list twice back-to-back).
  return best.filter((x, i) => i === 0 || x.toLowerCase() !== best[i - 1].toLowerCase());
}

/** Extract the INCI from a page's HTML. */
export function extractInciFromHtml(html: string): string[] {
  return extractInciFromText(stripTags(html));
}

/** Resolve a product page URL to its published INCI. Tries the raw HTML first
    (keeps accordion content the Jina reader collapses), then the keyless Jina
    reader as a fallback for bot-protected storefronts. Null if neither yields a
    confident list. */
export async function fetchInciFromProductPage(url: string): Promise<PageINCI | null> {
  const html = await fetchRawHtml(url);
  if (html) {
    const ingredients = extractInciFromHtml(html);
    if (ingredients.length >= 5) return { ingredients, source: url };
  }
  // Fallback: the Jina reader (handles pages a plain fetch is blocked from).
  const md = await fetchPageMarkdown(url);
  if (md) {
    const ingredients = extractInciFromText(md);
    if (ingredients.length >= 5) return { ingredients, source: url };
  }
  return null;
}
