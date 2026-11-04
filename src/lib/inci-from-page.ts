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

   Some storefronts draw the full list in a popup from the page's own data (a
   Next.js flight chunk, __NEXT_DATA__, a Shopify product blob) and print only
   the key ingredients in the markup. That data is in the same response, inside
   a <script>, so it is read too (extractEmbeddedInci), under tighter rules.
──────────────────────────────────────────────────────────────── */

import { fetchPageMarkdown } from "@/lib/scrape";

export interface PageINCI {
  ingredients: string[];
  source: string; // the URL the list was read from
  /** The raw text span the accepted list was read from (whitespace collapsed). A quote
      proves the text was captured as stated, not that the formula is true or current. */
  quote?: string;
  /** The page's own titles (title tag, og:title, first heading), best first. Kept so a
      later re-anchor can check the page names the product the review is about. */
  pageTitles?: string[];
  /** The page's og:site_name, when it states one. */
  siteName?: string | null;
  /** How reliably the text was captured (see CaptureTrust): 4 a brand's own page, 3 INKEE Decoder or a Nykaa product page. */
  trust?: 3 | 4;
  /** Which kind of source the list came from. */
  origin?: InciOrigin;
  /** Other sources read for the same product whose list differs from this one, so a choice between sources is never silent. */
  alternatives?: InciAlternative[];
}

export type InciOrigin = "decoder" | "brand-page" | "nykaa" | "owner-supplied";
export interface InciAlternative { source: string; origin: InciOrigin; count: number }

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

/* Some storefronts (Shopify rich-text fields) print a field into the page as a data dump rather than as markup, often in a
   hidden element: {"type"=>"root", "children"=>[{"type"=>"paragraph", "children"=>[{"type"=>"text", "value"=>"Aqua, ..."}]}]}
   (Ruby style) or the same with colons (JSON). Left as it is, the dump's punctuation is glued to the first and last entries
   of the list inside it, those fail as ingredient names and are dropped, and the list comes back short. Each dump is replaced
   by the text it holds. Every paragraph, and the field as a whole, is set off by commas, the one boundary the list reader splits on:
   prose before the field can then no longer swallow its first entry, and a footnote line after it ("*Ingredient from Organic
   Farming") can no longer swallow its last. */
const RICH_TEXT_ROOT = /\{\s*"type"\s*(?:=>|:)\s*"root"/g;
const RICH_TEXT_BLOCK = /"type"\s*(?:=>|:)\s*"(?:paragraph|heading|list-item)"/;
const RICH_TEXT_VALUE = /"value"\s*(?:=>|:)\s*"((?:[^"\\]|\\.)*)"/g;

/** Index just past the brace that closes the object starting at `start`, or -1 if it never closes. Braces inside quoted strings do not count. */
function endOfObject(text: string, start: number): number {
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) { if (c === "\\") i++; else if (c === '"') inString = false; continue; }
    if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i + 1;
  }
  return -1;
}

function textOfRichText(dump: string): string {
  const unescape = (v: string) => v
    .replace(/\\u([0-9a-f]{4})/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\([\\"/])/g, "$1")
    .replace(/\\[nrt]/g, " ");
  return dump.split(RICH_TEXT_BLOCK).slice(1)
    .map((block) => [...block.matchAll(RICH_TEXT_VALUE)].map((m) => unescape(m[1])).join(""))
    .filter((line) => line.trim())
    .join(" , ");
}

export function flattenRichTextDumps(html: string): string {
  let out = "";
  let from = 0;
  RICH_TEXT_ROOT.lastIndex = 0;
  for (let m = RICH_TEXT_ROOT.exec(html); m; m = RICH_TEXT_ROOT.exec(html)) {
    const end = endOfObject(html, m.index);
    if (end < 0) break; // cut off: leave the rest as it is
    out += `${html.slice(from, m.index)} , ${textOfRichText(html.slice(m.index, end))} , `;
    from = end;
    RICH_TEXT_ROOT.lastIndex = end;
  }
  return out + html.slice(from);
}

/** HTML → flat text, keeping ingredient punctuation (/, -, parentheses, commas). */
function stripTags(rawHtml: string): string {
  return flattenRichTextDumps(rawHtml)
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

/* A water-free formula (a dry shampoo, a balm, an oil, a powder) has none of the words above: Antinorm's High & Dry is "Zea Mays (Corn) Starch, Bentonite,
   Oryza Sativa (Rice) Starch, Magnesium Aluminum Silicate, Kaolin Powder, ...". What marks it as an ingredient list is the botanical INCI form: a Latin name, the
   common name in brackets, then the part used ("Zea Mays (Corn) Starch", "Cocos Nucifera (Coconut) Oil", "Maranta Arundinacea (Arrowroot) Root Powder"). Marketing
   copy does not write that, and a bracket with nothing after it ("Salicylic Acid (BHA)") is not it. Two such entries stand in for the word above. */
const BOTANICAL_INCI = /^[A-Za-z]{3,} [A-Za-z]{3,}(?: [A-Za-z]{3,})? \([A-Za-z][A-Za-z '\-]{1,38}\) [A-Za-z]{3,}/;

/* A retailer feature bullet ("8 Hours Water Resistant", "Dermatologically
   Tested") can satisfy ANCHOR by accident - "water" is a substring of a claim,
   not a real "Water"/"Aqua" ingredient entry. If most of the accepted run
   reads like ad copy rather than ingredient names, it is rejected outright
   rather than mis-stored as the product's INCI. */
const MARKETING_PHRASE_RE =
  /\b(free|resistant|protection|enriched|tested|proven|clinically|dermatologically|hours?|finish|non[\s-]?comedogenic|hypoallergenic|broad[\s-]spectrum|all skin types|suitable for)\b/i;

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

/** The accepted list together with the raw text it was read from. */
export interface InciExtraction {
  /** Exactly what extractInciFromText returns for the same text. */
  ingredients: string[];
  /** The text span from the first to the last accepted entry, whitespace collapsed. */
  quote: string;
}

/* One comma-separated piece of the page text, with the offset in the ORIGINAL text of
   each of its characters. A numeric fragment re-joined across a comma ("1" + "2-Hexanediol")
   keeps the original offsets, so the quote is always a real slice of the page text. */
interface Part { text: string; map: number[] }

/* A fragment of a locant name that a comma cut off from the rest: "1" of "1,2-Hexanediol", "3-0" or
   "3-O" of "3-O-Ethyl Ascorbic Acid" printed as "3-0, ethyl ascorbic acid". No letters (or one letter
   after a hyphen), so it is never an entry itself, and it is re-joined to the piece after it. */
const LOCANT_FRAGMENT = /^[0-9]+(?:-[0-9A-Za-z])*$/;

function splitParts(text: string): Part[] {
  const pieces: { t: string; start: number; comma: number }[] = [];
  let pos = 0;
  for (const piece of text.split(",")) {
    const lead = piece.length - piece.trimStart().length;
    pieces.push({ t: piece.trim(), start: pos + lead, comma: pos + piece.length });
    pos += piece.length + 1;
  }
  const mapOf = (t: string, start: number) => Array.from({ length: t.length }, (_, k) => start + k);
  const parts: Part[] = [];
  for (let i = 0; i < pieces.length; i++) {
    let text0 = pieces[i].t;
    let map = mapOf(pieces[i].t, pieces[i].start);
    let lastComma = pieces[i].comma;
    while (LOCANT_FRAGMENT.test(text0) && i + 1 < pieces.length) {
      const next = pieces[++i];
      text0 = `${text0},${next.t}`;
      map = [...map, lastComma, ...mapOf(next.t, next.start)];
      lastComma = next.comma;
    }
    parts.push({ text: text0, map });
  }
  return parts;
}

/* Words that end in a full stop inside an INCI name, so the stop is not the end of a sentence:
   botanical ranks ("Vaccinum Sect. Cyanococcus", "Subsp.", "Ssp.", "Var.", "Spp.", "Sp.",
   "Cv.", "F."), colour index and strength wording ("Ci 60730/Ext. Violet 2", "Eq. To 15%
   Vitamin C"), "St. John's Wort", and the INCI name "Alcohol Denat.". A dotted abbreviation
   such as "q.s." is recognised by its inner stop. */
const DOT_ABBREVIATIONS = new Set([
  "sect", "subsp", "ssp", "spp", "sp", "var", "cv", "f", "ext", "eq", "denat", "st",
]);

/** Whether the text before a full stop ends in a word whose stop is part of the name: one of the
    abbreviations above, or a dotted form such as "q.s.". */
function endsInAbbreviation(beforeStop: string): boolean {
  const word = /([A-Za-z]+(?:\.[A-Za-z]+)*)$/.exec(beforeStop)?.[1];
  return !!word && (word.includes(".") || DOT_ABBREVIATIONS.has(word.toLowerCase()));
}

/** The [start, end) ranges of the sentences in a piece of text. A full stop ends a
    sentence only when it follows a letter, digit or closing bracket, is followed by
    whitespace and a capital letter, and the word before it is not an abbreviation. The
    stop and the whitespace after it belong to no range. Decimals ("0.5") and a lower case
    word after the stop never split. Empty text has no sentences. */
export function sentenceSpans(text: string): [number, number][] {
  const spans: [number, number][] = [];
  let start = 0;
  for (const m of text.matchAll(/(?<=[A-Za-z0-9)])\.\s+(?=[A-Z])/g)) {
    const stop = m.index;
    if (endsInAbbreviation(text.slice(start, stop))) continue;
    spans.push([start, stop]);
    start = stop + m[0].length;
  }
  if (text.length > 0) spans.push([start, text.length]);
  return spans;
}

/* A piece split at its sentence ends, each sentence keeping the original offsets of its
   characters, so the quote is still a real slice of the page text. */
function splitSentences(p: Part): Part[] {
  const spans = sentenceSpans(p.text);
  if (spans.length < 2) return [p];
  return spans.map(([a, b]) => ({ text: p.text.slice(a, b), map: p.map.slice(a, b) }));
}

/** Where the last entry of a list ends inside text the entry rules reject whole, or 0 when the
    text holds none. Such text is a list's last entry printed with a full stop and followed by a
    sentence or a section header ("Citric Acid, Phenoxyethanol. How to Use ..."), or closing the
    page. The entry is the text before the first sentence end, or all of the text but a final
    stop. A final stop that belongs to an abbreviation ("Alcohol Denat.", "Aqua q.s.") stays in
    the entry. The entry must still pass looksLikeIngredient, so prose is not taken for one. */
function closingEntryEnd(t: string): number {
  const spans = sentenceSpans(t);
  if (spans.length > 1) {
    const end = spans[0][1];
    return looksLikeIngredient(t.slice(0, end)) ? end : 0;
  }
  const stop = /(?<=[A-Za-z0-9)])\.$/.exec(t)?.index;
  if (stop === undefined || !looksLikeIngredient(t.slice(0, stop))) return 0;
  return endsInAbbreviation(t.slice(0, stop)) ? t.length : stop;
}

/** Where the entry after an "Ingredients" label starts in text, or -1 when no label is followed by
    something that can be an entry. LABEL alone takes the first label word of the text, so an earlier
    "ingredient(s)" word in the same piece ("Every ingredient serves a function. ... View all other
    ingredients Glycerin") makes the capture long and looksLikeIngredient rejects it, and the real first
    entry is lost. The next label words are tried in turn, nearest first, and the first capture that can
    be an entry is the one taken. A first capture that can be an entry is used as before. */
function labelledEntryStart(text: string): number {
  const label = new RegExp(LABEL.source, "gi");
  for (let m = label.exec(text); m; m = label.exec(text)) {
    if (looksLikeIngredient(m[1])) return m.index + m[0].length - m[1].length;
    label.lastIndex = m.index + 1;
  }
  return -1;
}

/* A gap: an empty piece (a doubled comma), or a piece with digits and a dash and no letters that the locant
   rule could not re-join ("3–0" with an en dash). Plain numbers ("36", "400072") are not a gap, and neither
   is a "+/-" separator, a bullet or a trailing comma. */
const isGap = (p: Part | undefined): boolean =>
  !!p && (p.text === "" || (!/[a-z]/i.test(p.text) && /[0-9]/.test(p.text) && /[-\u2010-\u2015\u2212]/.test(p.text)));

/** Whether the run that starts at piece `first` is the second half of a list cut in two by a gap: the pieces
    before the gap are three or more ingredient entries that open with Aqua or Water, the head of a list. The
    longer half would win and be published as the whole list, without its water base and actives. A label
    glued to the first entry ("Ingredients: Aqua") is looked through. Only a gap before the run counts: a
    secondary list after the main one ("... Parfum, , CI 77891, CI 77492") leaves the main list as read. */
function cutAtStart(parts: Part[], first: number): boolean {
  if (!isGap(parts[first - 1])) return false;
  const entry = (t: string) => looksLikeIngredient(t) && !STOP.test(t) && !MARKETING_PHRASE_RE.test(t);
  let n = 0;
  let opening = "";
  for (let i = first - 2; i >= 0; i--) {
    const t = parts[i].text;
    const at = labelledEntryStart(t);
    const labelled = at >= 0 && entry(t.slice(at));
    if (!labelled && !entry(t)) break;
    n++;
    opening = labelled ? t.slice(at) : t;
    if (labelled) break; // the label opens the list
  }
  return n >= 3 && /^(?:aqua|water|eau)\b/i.test(opening);
}

/** Parse the longest INCI-looking comma list out of flat page text, and the raw text
    span it came from. Null if no confident list is found. Deterministic, never invents
    an ingredient. This is the single decision procedure: extractInciFromText below is
    a thin wrapper, so the quote can never come from a different list than the one
    accepted. */
export function extractInciWithQuote(text: string): InciExtraction | null {
  const parts = splitParts(text);

  // Walk the tokens, keeping the longest contiguous run of ingredient-like items.
  let best: string[] = [];
  let bestSpan: [number, number] | null = null;
  let cur: string[] = [];
  let curSpan: [number, number] | null = null;
  // The piece each run starts at, so a gap right before the accepted run can be seen afterwards.
  let pieceNo = 0, curFirst = 0, bestFirst = 0;
  const push = (token: string, span: [number, number]) => {
    if (!cur.length) curFirst = pieceNo;
    cur.push(token);
    curSpan = curSpan ? [curSpan[0], span[1]] : span;
  };
  const flush = () => {
    if (cur.length > best.length) { best = cur.slice(); bestSpan = curSpan; bestFirst = curFirst; }
    cur = [];
    curSpan = null;
  };
  // Original-text span of p.text[from, to).
  const spanOf = (p: Part, from: number, to: number): [number, number] => [p.map[from], p.map[to - 1] + 1];

  /* Take p.text[from, to), which the rules above already accepted as one entry, into the run.
     When it holds a sentence end, the entry is page prose glued to ingredient text ("Xanthan
     Gum. Care Instructions Store in a cool", "especially after bathing. Ingredients Aqua"). A
     full stop that starts a new sentence ends the entry: each sentence is its own entry, the
     run ends at the stop, and the sentence after it starts a new candidate run (the longest
     run still wins, so prose never rides along with a list). A sentence after a stop that
     carries an "Ingredients" label starts at the ingredient after the label. Only entries
     accepted whole are looked at here; a piece the rules reject is rejected as before, apart
     from the last entry it may close the run with (pushClosing). */
  const pushEntry = (p: Part, from: number, to: number) => {
    const whole: Part = { text: p.text.slice(from, to), map: p.map.slice(from, to) };
    const sentences = splitSentences(whole);
    if (sentences.length === 1) {
      push(cleanTok(whole.text), spanOf(p, from, to));
      return;
    }
    sentences.forEach((sentence, k) => {
      let entry = sentence;
      if (k > 0) {
        flush();
        const lm = LABEL.exec(sentence.text);
        if (lm && looksLikeIngredient(lm[1])) {
          const at = lm.index + lm[0].length - lm[1].length;
          entry = { text: sentence.text.slice(at), map: sentence.map.slice(at) };
        }
      }
      if (looksLikeIngredient(entry.text)) push(cleanTok(entry.text), spanOf(entry, 0, entry.text.length));
    });
  };

  /* p.text[0, to) was rejected whole by the rules above. When it holds the last entry of the run
     in progress printed with a full stop ("Phenoxyethanol. How to Use ..."), the entry joins the
     run; the caller then ends the run, as a stop ends a list. */
  const pushClosing = (p: Part, to: number) => {
    const end = closingEntryEnd(p.text.slice(0, to));
    if (end > 0) push(cleanTok(p.text.slice(0, end)), spanOf(p, 0, end));
  };

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    pieceNo = i;
    const stopM = STOP.exec(p.text);
    if (stopM) {
      // A section header ends the current list. Keep any ingredient text before
      // it; a fresh "Ingredients:" label after it can start a new run.
      const head = p.text.slice(0, stopM.index).trim();
      if (looksLikeIngredient(head)) pushEntry(p, 0, head.length);
      else pushClosing(p, head.length);
      flush();
      const at = labelledEntryStart(p.text);
      if (at >= 0) pushEntry(p, at, p.text.length);
      continue;
    }
    if (looksLikeIngredient(p.text)) {
      pushEntry(p, 0, p.text.length);
      continue;
    }
    // Rejected token: a last entry printed with a full stop closes the run. If it ends
    // with an "Ingredients:" label, begin the next run at the trailing ingredient (so a
    // leading "Water" glued to the label survives).
    pushClosing(p, p.text.length);
    flush();
    const at = labelledEntryStart(p.text);
    if (at >= 0) pushEntry(p, at, p.text.length);
  }
  flush();

  if (best.length < 5 || !bestSpan) return null;
  if (!best.some((x) => ANCHOR.test(x)) && best.filter((x) => BOTANICAL_INCI.test(x)).length < 2) return null;
  const marketingHits = best.filter((x) => MARKETING_PHRASE_RE.test(x)).length;
  if (marketingHits / best.length >= 0.5) return null;
  if (cutAtStart(parts, bestFirst)) return null;
  const [from, to] = bestSpan as [number, number];
  // De-dupe consecutive repeats (some pages print the list twice back-to-back).
  return {
    ingredients: best.filter((x, i) => i === 0 || x.toLowerCase() !== best[i - 1].toLowerCase()),
    quote: text.slice(from, to).replace(/\s+/g, " ").trim(),
  };
}

/** Parse the longest INCI-looking comma list out of flat page text. Empty if
    no confident list is found. Deterministic, never invents an ingredient. */
export function extractInciFromText(text: string): string[] {
  return extractInciWithQuote(text)?.ingredients ?? [];
}

/** Extract the INCI from a page's HTML. */
export function extractInciFromHtml(html: string): string[] {
  return extractInciFromText(stripTags(html));
}

/* ── A list that runs on from the page copy before it ──────────── */

/* Tags that start or end a block of text. The ones after the tag name are a space, "/" or ">", so a custom element such as <p-icon> is not one. */
const BLOCK_TAG = /<\/?(?:address|article|aside|blockquote|br|dd|details|dialog|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|summary|table|tbody|td|tfoot|th|thead|tr|ul)(?=[\s/>])[^>]*>/gi;

/** The longest list found inside a single block of the page: the text between two block tags, with inline tags stripped. When
    the tags are stripped from the whole page the blocks run together, and a list that follows a heading or a paragraph with no
    punctuation between them ("... Clinically Tested Brands That Lead Aqua, Niacinamide, ...") has its first entry swallowed
    by the copy before it; as page copy that piece is far too long to be an entry and is dropped. Read on its own, the block
    holds the list and nothing else. A block that is not a list, or a list that a block boundary cuts in two, gives nothing or a
    shorter list: this is only ever consulted through extendFromBlocks. */
export function extractInciFromBlocks(rawHtml: string): InciExtraction | null {
  const html = flattenRichTextDumps(rawHtml).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  let best: InciExtraction | null = null;
  for (const chunk of html.split(BLOCK_TAG)) {
    if ((chunk.match(/,/g)?.length ?? 0) < 4) continue; // five entries need four commas
    const ex = extractInciWithQuote(stripTags(chunk));
    if (ex && (!best || ex.ingredients.length > best.ingredients.length)) best = ex;
  }
  return best;
}

const sameEntry = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

/** Whether `longer` holds `base`, entry for entry and in order, with more entries before it or after it. */
function containsRun(longer: string[], base: string[]): boolean {
  if (longer.length <= base.length) return false;
  for (let at = 0; at + base.length <= longer.length; at++) {
    if (base.every((entry, i) => sameEntry(longer[at + i], entry))) return true;
  }
  return false;
}

/** Whether the block reading `blocks` is the same list as `base` with the text a run-on glued to its two ends taken off: the same number of entries, the same
    entries between the first and the last, and a first entry that ends with the block's first (a label before it: "FULL INGREDIENTS Zea Mays (Corn) Starch") and a
    last entry that starts with the block's last (the next accordion's title after it: "Maize Starch MORE"). Identical lists are not "refined": nothing to change. */
function trimsEdges(blocks: string[], base: string[]): boolean {
  const n = base.length;
  if (blocks.length !== n || n < 3) return false;
  for (let i = 1; i < n - 1; i++) if (!sameEntry(blocks[i], base[i])) return false;
  const [first, last, blockFirst, blockLast] = [base[0].toLowerCase(), base[n - 1].toLowerCase(), blocks[0].toLowerCase(), blocks[n - 1].toLowerCase()];
  const firstOk = first === blockFirst || first.endsWith(` ${blockFirst}`);
  const lastOk = last === blockLast || last.startsWith(`${blockLast} `);
  return firstOk && lastOk && !(first === blockFirst && last === blockLast);
}

/** The list read from the page's visible text, put right by the list read in its own block. The block reading is used when it holds the visible list whole and in
    order with more entries (the page copy swallowed some), or when it is the same list with the text glued to its first and last entries taken off. It never
    replaces, reorders or shortens a list otherwise, and never supplies a list the visible reading refused (a list cut in two by a gap, or none). */
export function extendFromBlocks(visible: InciExtraction | null, html: string): InciExtraction | null {
  if (!visible) return null;
  const blocks = extractInciFromBlocks(html);
  return blocks && (containsRun(blocks.ingredients, visible.ingredients) || trimsEdges(blocks.ingredients, visible.ingredients)) ? blocks : visible;
}

/* ── A list printed one ingredient to a bullet ───────────────────── */

/* A list the page itself labels as its ingredients, an element with "ingredient" in its id or class: <ul id="custom_ingredients">. */
const LABELLED_LIST = /<(ul|ol)\b[^>]*\b(?:id|class)\s*=\s*"[^"]*ingredient[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi;

/* Menus and filters say "ingredient" too. Be Minimalist's header carries <ul id="SiteNavLabel-shop-by-ingredients-sidebar"> with "Back, Vitamin C, BHA / Salicylic Acid, Retinoid / Retinol,
   Niacinamide, UV Filters, Ceramide" (and a second, "Capixyl, Maleic Acid, Peptide, Carnitine"), which the reader took for the product's ingredients (2026-11-04). Such a list is
   refused when its own tag marks it as navigation, when most of its items are links (an ingredient list is plain text), or when an item is a menu control ("Back"). */
const MENU_TAG = /nav|menu|filter|facet|shop-?by|dropdown|drop-down|breadcrumb/i;
const MENU_CONTROL = /^(?:back|close|menu|more|next|previous|view all|shop all|see all|show all)$/i;

/** Lakme's product page prints its 40 ingredients as <li>Water</li><li>Paraffinum Liquidum</li>..., twice (a tab for each screen size), with no comma anywhere. The list reader
    splits on commas, so it saw none. A bulleted list that the page labels as its ingredients is read item by item, and the items are put in the one form the rules above read
    (joined with ", "; the quote is that text). It is taken only when it has five or more items, none of them holds a comma (a comma list in a bullet is read as text already),
    and the rules accept EVERY item as an entry, so a list with something else among the ingredients is refused whole, never read in part. A menu is never read (see MENU_TAG). Lists the page does not label, and
    bullets that carry only the key ingredients (under five), are never read this way. */
export function extractInciFromListItems(rawHtml: string): InciExtraction | null {
  const html = rawHtml.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  let best: InciExtraction | null = null;
  for (const list of html.matchAll(LABELLED_LIST)) {
    if (MENU_TAG.test(list[0].slice(0, list[0].indexOf(">") + 1))) continue; // the element's own tag marks it as a menu or a filter
    const rawItems = [...list[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => li[1]);
    const items = rawItems.map((li) => stripTags(li)).filter(Boolean);
    if (items.length < 5 || items.some((item) => item.includes(",") || MENU_CONTROL.test(item))) continue;
    if (rawItems.filter((li) => /<a\b[^>]*\bhref\s*=/i.test(li)).length * 2 > rawItems.length) continue; // mostly links: a menu, not a list
    const ex = extractInciWithQuote(items.join(", "));
    const wanted = items.filter((item, i) => i === 0 || item.toLowerCase() !== items[i - 1].toLowerCase()).length; // the extractor drops a repeat of the entry before
    if (ex && ex.ingredients.length === wanted && (!best || ex.ingredients.length > best.ingredients.length)) best = ex;
  }
  return best;
}

/* ── Lists the page ships in its own data ─────────────────────── */

/* Names storefronts give the full ingredient text in their page data. Only a STRING value counts: the
   same payload carries "keyIngredients":[...] and "ingredients":[{...}] arrays for every product it links. */
const EMBEDDED_KEY =
  "(?:ingredients?_?list|ingredient_?text|full_?ingredients?(?:_?list)?|inci(?:_?list|_?ingredients?)?|ingredients?)";
/* Inside a JS string literal, as a Next.js flight chunk carries it: \"key\":\"value\", with < as <. The
   field must end at a \" that is followed by more JSON, so a value cut by an inner quote is skipped. */
const ESCAPED_FIELD = new RegExp(String.raw`\\"${EMBEDDED_KEY}\\"\s*:\s*\\"((?:\\u[0-9a-fA-F]{4}|\\[\\/bfnrt]|[^"\\])*)\\"(?=\s*[,}\]])`, "gi");
/* Plain JSON: __NEXT_DATA__, JSON-LD, a Shopify product blob. */
const PLAIN_FIELD = new RegExp(String.raw`"${EMBEDDED_KEY}"\s*:\s*"((?:[^"\\]|\\.)*)"`, "gi");

/** How far before a field its product's own handle must appear. A page's data names its product (slug,
    handle) right before the fields that belong to it; the nearest sat 858 characters before on Alteryst. */
const EMBEDDED_REACH = 6000;

/** The last path segment of a product URL when it names the product ("vitamin-c-e-mineral-sunscreen"),
    which is how a storefront's data names it too. Null for a bare domain or a short id. */
function productHandle(url: string): string | null {
  try {
    const last = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
    const handle = decodeURIComponent(last).toLowerCase().replace(/\.html?$/, "");
    return handle.split("-").length >= 3 ? handle : null;
  } catch {
    return null;
  }
}

/** The full ingredient list a page keeps in its own data and draws in a popup, with the text it was read
    from. It goes through the same list rules as page text (extractInciWithQuote), and is used only when:
      - the URL names the product, and that name appears within EMBEDDED_REACH characters before the field,
        so a list belonging to a product the page merely links to is not taken;
      - the page holds exactly one distinct list, so a page that ships several is never guessed at.
    Null otherwise. Deterministic, never invents an ingredient. */
export function extractEmbeddedInci(html: string, pageUrl: string): InciExtraction | null {
  const handle = productHandle(pageUrl);
  if (!handle) return null;
  const found = new Map<string, InciExtraction>();
  for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    const body = script[1];
    for (const field of [ESCAPED_FIELD, PLAIN_FIELD]) {
      for (const m of body.matchAll(field)) {
        const at = m.index ?? 0;
        if (!body.slice(Math.max(0, at - EMBEDDED_REACH), at).toLowerCase().includes(handle)) continue;
        let value: string;
        try { value = JSON.parse(`"${m[1]}"`) as string; } catch { continue; }
        const ex = extractInciWithQuote(stripTags(value));
        if (ex && ex.ingredients.length >= 5) found.set(ex.ingredients.join("\n").toLowerCase(), ex);
      }
    }
  }
  return found.size === 1 ? [...found.values()][0] : null;
}

/* ── The page's own titles ────────────────────────────────────── */

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "-", mdash: "-",
  rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', trade: "", reg: "", copy: "",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, body: string) => {
    if (body[0] === "#") {
      const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : " ";
    }
    return ENTITIES[body.toLowerCase()] ?? m;
  });
}

const tidy = (s: string): string => decodeEntities(s).replace(/\s+/g, " ").trim();

function metaContent(html: string, key: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs: Record<string, string> = {};
    for (const a of tag.matchAll(/([a-zA-Z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? "";
    if ((attrs.property ?? attrs.name ?? "").toLowerCase() === key && attrs.content) return tidy(attrs.content) || null;
  }
  return null;
}

/** The titles a product page gives itself, best first (title tag, og:title, first
    h1), and its og:site_name. Markup only: nothing is guessed from the body text. */
export function extractPageMeta(html: string): { titles: string[]; siteName: string | null } {
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const titles = [titleTag ? tidy(titleTag) : "", metaContent(html, "og:title") ?? "", h1 ? stripTags(h1) : ""].filter(Boolean);
  return { titles: [...new Set(titles)], siteName: metaContent(html, "og:site_name") };
}

/** The same, from a markdown scrape: its "Title:" line and the first heading. */
export function extractMarkdownTitles(md: string): string[] {
  const titleLine = md.match(/^Title:\s*(.+)$/m)?.[1];
  const heading = md.match(/^#\s+(.+)$/m)?.[1]?.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  return [...new Set([titleLine, heading].map((t) => (t ? tidy(t) : "")).filter(Boolean))];
}

/** "Full Ingredient List", "Ingredients:" or "Key ingredients" standing inside one of the first entries, with the first ingredient after it. */
const GLUED_LABEL = /\b(?:full\s+)?ingredients?(?:\s+list)?\s*:?\s+/i;

/** A page that prints no line break between its copy and the list label ("...and address uneven texture Full Ingredient List Water, Glycerin") glues the copy and the
    label onto the first entries: Beauty of Joseon's list began "soothe", "and address uneven texture Full Ingredient List Water". The list starts after the label; the
    entries before it are page copy. Applied to a page read, not to extractInciWithQuote, which must keep agreeing with the extractor it replaced. */
export function startAtListLabel(ex: InciExtraction | null): InciExtraction | null {
  if (!ex) return ex;
  const at = ex.ingredients.slice(0, 3).findIndex((x) => GLUED_LABEL.test(x));
  if (at < 0) return ex;
  const inItem = GLUED_LABEL.exec(ex.ingredients[at])!;
  const first = ex.ingredients[at].slice(inItem.index + inItem[0].length).trim();
  const inQuote = GLUED_LABEL.exec(ex.quote);
  if (!first || !looksLikeIngredient(first) || !inQuote) return ex;
  return { ingredients: [first, ...ex.ingredients.slice(at + 1)], quote: ex.quote.slice(inQuote.index + inQuote[0].length).trim() };
}

/** Resolve a product page URL to its published INCI. Tries the raw HTML first
    (keeps accordion content the Jina reader collapses), then the keyless Jina
    reader as a fallback for bot-protected storefronts. Null if neither yields a
    confident list. Also returns the raw text span the list was read from and the
    page's own titles; neither changes which list is accepted. */
export async function fetchInciFromProductPage(url: string): Promise<PageINCI | null> {
  const html = await fetchRawHtml(url);
  if (html) {
    // The visible text first, with any entry a run-on from the copy before the list hid put back (the list read on its own, in its block), then started after a label glued to the copy;
    // the page's own data wins only when it holds a longer list (the markup shows the key ingredients, or a list cut short, and the popup shows the whole).
    const visible = startAtListLabel(extendFromBlocks(extractInciWithQuote(stripTags(html)), html));
    // A list the page labels as its ingredients and prints one to a bullet, and the page's own data, each win only when they hold a longer list than the visible text.
    let ex = visible;
    for (const other of [extractInciFromListItems(html), extractEmbeddedInci(html, url)]) if (other && (!ex || other.ingredients.length > ex.ingredients.length)) ex = other;
    if (ex && ex.ingredients.length >= 5) {
      const meta = extractPageMeta(html);
      return { ingredients: ex.ingredients, source: url, quote: ex.quote, pageTitles: meta.titles, siteName: meta.siteName };
    }
  }
  // Fallback: the Jina reader (handles pages a plain fetch is blocked from).
  const md = await fetchPageMarkdown(url);
  if (md) {
    const ex = startAtListLabel(extractInciWithQuote(md));
    if (ex && ex.ingredients.length >= 5) {
      return { ingredients: ex.ingredients, source: url, quote: ex.quote, pageTitles: extractMarkdownTitles(md), siteName: null };
    }
  }
  return null;
}
