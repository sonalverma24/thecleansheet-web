/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ — INCI ground-truth fetcher
   Pulls a product's real ingredient list from INCIDecoder (via the
   keyless Jina reader) so the review engine grades "free-from" and
   ingredient-presence claims against fact, not the model's recall.
──────────────────────────────────────────────────────────────── */

import { fetchPageMarkdown as fetchMarkdown } from "@/lib/scrape";

export interface INCIResult {
  productName: string;
  slug: string;          // canonical INCIDecoder product slug (repository key)
  ingredients: string[];
  tags: string[];        // e.g. "alcohol-free", "fragrance-free" (as INCIDecoder labels them)
  source: string;        // INCIDecoder product URL
  imageUrl: string | null; // product front photo hosted by INCIDecoder (no API key needed)
}

function tokens(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter((t) => t.length > 1);
}

/* Confidence guards for resolveINCI — precision over coverage. Anchoring the
   review to the wrong product is worse than an honest "couldn't retrieve the
   INCI" (which the engine turns into a clearly limited review). */
const MIN_OVERLAP = 0.2;
// Leading words that are not brands (so the "brand slot" heuristic skips them).
const BRAND_SKIP = new Set(["the", "and", "for", "with", "new", "pro", "our"]);

/** Parse one INCIDecoder product page (Jina markdown) into its ingredient list. */
function parseProductPage(page: string, slug: string): INCIResult | null {
  const idx = page.indexOf("## Ingredients overview");
  if (idx === -1) return null;
  const section = page.slice(idx, idx + 8000);

  // The INCI line links each ingredient: [Name](…/ingredients/…)
  const inciLine = section
    .split("\n")
    .map((l) => l.trim())
    .find((l) => (l.match(/\/ingredients\//g) || []).length >= 3);
  if (!inciLine) return null;

  const ingredients = [...inciLine.matchAll(/\[([^\]]+)\]\([^)]*\/ingredients\/[^)]*\)/g)]
    .map((m) => m[1].replace(/​/g, "").replace(/\s+/g, " ").trim())
    .filter((name) => name && name.toLowerCase() !== "more");
  if (ingredients.length < 3) return null;

  const tags: string[] = [];
  if (/alcohol[\s-]?free/i.test(page)) tags.push("alcohol-free");
  if (/fragrance[\s&]*(?:and\s+)?(?:essential[\s-]?oil[\s-]?)?free/i.test(page)) tags.push("fragrance & essential-oil free");

  const titleMatch = page.match(/Title:\s*(.+?)\s+ingredients/i);
  const productName = titleMatch ? titleMatch[1].trim() : slug.replace(/-/g, " ");

  const imgMatch = page.match(/https:\/\/incidecoder-content[^\s)"']+?(?:photo|front)[^\s)"']*\.(?:jpe?g|png|webp)/i);
  const imageUrl = imgMatch ? imgMatch[0] : null;

  return { productName, slug, ingredients, tags, source: `https://incidecoder.com/products/${slug}`, imageUrl };
}

export interface ProductCandidate {
  name: string;      // display name, for a "did you mean" prompt
  slug: string;
  overlap: number;   // 0..1 token overlap with the query
}

export interface INCIResolution {
  chosen: INCIResult | null;    // INCI of the resolved product (name + ingredients from the SAME product)
  distinct: ProductCandidate[]; // distinct candidate products, best match first
  ambiguous: boolean;           // 2+ distinct products match about equally -> ask the user
}

/** Collapse near-duplicate INCIDecoder entries of one product (e.g. "... Serum" and "... Serum 2"). */
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+\d+$/, "").replace(/[^a-z0-9]+/g, " ").trim();
}

/** Resolve a free-text query to a single INCIDecoder product, or flag ambiguity.
    Never mixes one product's name with another's ingredients: the chosen INCI and its
    productName always come from the same entry. */
export async function resolveINCI(query: string): Promise<INCIResolution> {
  const empty: INCIResolution = { chosen: null, distinct: [], ambiguous: false };
  const q = query.trim();
  if (!q) return empty;

  const search = await fetchMarkdown(`https://incidecoder.com/search?query=${encodeURIComponent(q)}`);
  if (!search) return empty;

  // Candidate products with their display names, from the search results.
  const raw = [...search.matchAll(/\[([^\]]+)\]\((?:https:\/\/incidecoder\.com)?\/products\/([a-z0-9-]+)\)/gi)]
    .map((m) => ({ name: m[1].replace(/\s+/g, " ").trim(), slug: m[2] }))
    .filter((c) => c.slug !== "create" && c.name && !/^more$/i.test(c.name));
  if (!raw.length) return empty;

  const qTok = tokens(q);
  const overlapOf = (s: string) => {
    const st = new Set(tokens(s));
    return qTok.filter((t) => st.has(t)).length / Math.max(qTok.length, 1);
  };

  // Group duplicate entries of the same product; keep every slug so we can pick the
  // most complete entry WITHIN that one product later.
  const groups = new Map<string, { name: string; slugs: string[]; overlap: number }>();
  for (const c of raw) {
    const key = normalizeName(c.name);
    const ov = Math.max(overlapOf(c.slug), overlapOf(c.name));
    const g = groups.get(key);
    if (g) { g.slugs.push(c.slug); g.overlap = Math.max(g.overlap, ov); }
    else groups.set(key, { name: c.name, slugs: [c.slug], overlap: ov });
  }

  const rankedAll = [...groups.values()].sort((a, b) => b.overlap - a.overlap);
  const strong = rankedAll.filter((d) => d.overlap >= 0.5);
  const ranked = strong.length ? strong : rankedAll;
  const distinct: ProductCandidate[] = ranked.slice(0, 5).map((d) => ({ name: d.name, slug: d.slugs[0], overlap: d.overlap }));

  // Exact name match wins outright — this is what a click on a "did you mean?"
  // option sends back, so it must never re-trigger the question.
  const exact = ranked.find((d) => normalizeName(d.name) === normalizeName(q));

  // Ambiguous when the top two distinct products match about equally: ask, don't guess.
  if (!exact && ranked.length >= 2 && ranked[0].overlap - ranked[1].overlap < 0.2) {
    return { chosen: null, distinct, ambiguous: true };
  }

  // One clear product: pull ITS ingredients (most complete among its own duplicate entries).
  const top = exact ?? ranked[0];

  // Confidence + brand guard: if the best match is weak, or does not carry the
  // query's brand (its first distinctive token), do NOT anchor to it — return
  // unresolved so the engine runs an honest limited-INCI review instead of, say,
  // reviewing a Dot & Key product for a "Uriage …" query.
  if (!exact) {
    const qWords = q.toLowerCase().match(/[a-z0-9]+/g) || [];
    const brandTok = qWords.find((t) => t.length >= 3 && !BRAND_SKIP.has(t)) || "";
    const topTokens = new Set([...tokens(top.name), ...top.slugs[0].split("-")]);
    const hasBrand = !brandTok || topTokens.has(brandTok);
    if (top.overlap < MIN_OVERLAP || !hasBrand) {
      return { chosen: null, distinct, ambiguous: false };
    }
  }
  let chosen: INCIResult | null = null;
  for (const slug of top.slugs.slice(0, 2)) {
    const page = await fetchMarkdown(`https://incidecoder.com/products/${slug}`);
    if (!page) continue;
    const parsed = parseProductPage(page, slug);
    if (parsed && (!chosen || parsed.ingredients.length > chosen.ingredients.length)) chosen = parsed;
  }
  return { chosen, distinct, ambiguous: false };
}

/** Back-compat convenience: just the resolved product's INCI (no disambiguation surfaced). */
export async function fetchINCI(query: string): Promise<INCIResult | null> {
  return (await resolveINCI(query)).chosen;
}

/** Formats the retrieved INCI as a ground-truth block for the system prompt. */
export function inciGroundTruthBlock(inci: INCIResult | null): string {
  if (!inci || !inci.ingredients.length) {
    return `\n\nINGREDIENT LIST: could not be retrieved automatically. Do NOT assert which ingredients are present or absent from memory — search for the INCI, and if you still cannot confirm it, mark ingredient-dependent claims as unverified.`;
  }
  return `\n\nRETRIEVED INGREDIENT LIST for "${inci.productName}" (from INCIDecoder, ${inci.source}). Use it as follows:
- Anti-fabrication: do NOT state the product contains an ingredient (e.g. Parfum, Alcohol) unless it appears in this list.
- "Free-from X" claim: if X is NOT in this list, the claim is SUPPORTED. Only flag a conflict if you can QUOTE X in this list.
- "Contains active X" claim: FIRST map the marketing name to its INCI name, THEN check. Common maps: Pro-Vitamin B5 = Panthenol / D-Panthenol; Black Seed / Black Cumin Oil = Nigella Sativa Seed Oil; Onion = Allium Cepa; Hyaluronic Acid = Sodium Hyaluronate; Vitamin C = Ascorbic Acid or Sodium Ascorbyl Phosphate or Ethyl Ascorbic Acid; Vitamin E = Tocopherol; Vitamin B3 = Niacinamide; Aloe = Aloe Barbadensis. If the mapped ingredient is present, the claim is SUPPORTED.
- If a claimed active is genuinely absent AFTER name-mapping, mark it UNVERIFIED (could not confirm from the retrieved list), NOT contradicted and NOT "misleading". This list can be for a different size or variant, truncated, or outdated, so absence here is not proof of absence. Never accuse the brand of misleading advertising or an ASCI violation on the basis of this list alone.
INGREDIENTS: ${inci.ingredients.join(", ")}${inci.tags.length ? `\nINCIDecoder labels this product: ${inci.tags.join("; ")}.` : ""}`;
}
