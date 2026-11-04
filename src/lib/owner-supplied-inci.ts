/** Ingredient lists the owner typed in from a product's own pack (see src/data/inci/owner-supplied.ts). The list is never taken from a model or a retailer:
 *  the entry's `quote` is the text as printed, and the ingredients are parsed from it here, so the quote and the list cannot disagree.
 *
 *  An entry stands in only where the primary sources (Decoder, the brand's page, Nykaa) found no list. It is recorded at capture trust 3 with the origin
 *  "owner-supplied", so the page says where it came from and the rules treat it as a quoted, complete source, like a Nykaa page. */
import { OWNER_SUPPLIED_INCI } from "@/data/inci/owner-supplied";
import { isBrandIngredientUrl } from "./brand-inci";
import { incidecoderProductSlug } from "./inci-fetch";
import type { PageINCI } from "./inci-from-page";
import { brandKey, nameTokens, sanitizeInciList } from "./product-identity";

export interface OwnerSuppliedEntry {
  /** The brand as the analysis may name it ("Humuss Beauty", "Humuss"); matched on the same key the engine uses for a brand. */
  brands: string[];
  /** Every product name this list is for: the brand's own name for it, and the retailer title a shopper searched. Matched exactly, in any word order. */
  productNames: string[];
  /** A page on the brand's own site or an INKEE Decoder product page that shows the product (and, for a pack photo, the photo). */
  sourceUrl: string;
  /** The list exactly as printed. The ingredients are parsed from this text. */
  quote: string;
  /** YYYY-MM-DD. */
  suppliedOn: string;
  /** Where it was read: which photo, which side of the pack. */
  note: string;
}

/** A real list is not a handful of words; below this the text is more likely a fragment than the whole list. */
const MIN_INGREDIENTS = 5;
const MAX_QUOTE_CHARS = 4000;

/** The ingredient names in a pasted list. Splits on commas, semicolons and bullets outside brackets ("Aqua (Water, Eau)" stays one name); a paste with
 *  no commas and one name per line is split on its lines. The "Ingredients:" label and the final full stop are dropped. */
export function parsePastedInci(text: string): string[] {
  const oneLine = (/[,;]/.test(text) ? text : text.replace(/\r?\n+/g, ", ")).replace(/\s+/g, " ").trim();
  const body = oneLine.replace(/^ingredients?\s*[:\-–]?\s*/i, "").replace(/[.\s]+$/, "");
  const items: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of body) {
    if (ch === "(" || ch === "[") depth++;
    else if ((ch === ")" || ch === "]") && depth > 0) depth--;
    if (depth === 0 && (ch === "," || ch === ";" || ch === "•" || ch === "·" || ch === "|")) { items.push(current); current = ""; } else current += ch;
  }
  items.push(current);
  return items.map((s) => s.trim()).filter(Boolean);
}

/** What is wrong with an entry; empty when it can be used. Strict on purpose: a list that needed repairing is a list that was mistyped. */
export function checkOwnerSupplied(entry: OwnerSuppliedEntry): string[] {
  const problems: string[] = [];
  const brands = entry.brands.map((b) => b.trim()).filter(Boolean);
  const names = entry.productNames.map((n) => n.trim()).filter(Boolean);
  if (!brands.length) problems.push("no brand");
  if (!names.length) problems.push("no product name");
  if (names.some((n) => !nameTokens(n, brands[0] ?? "").size)) problems.push("a product name has no words besides the brand");
  const urlOk = !!entry.sourceUrl && (!!incidecoderProductSlug(entry.sourceUrl) || brands.some((b) => isBrandIngredientUrl(entry.sourceUrl, b)));
  if (!urlOk) problems.push("the source URL is neither a page on the brand's own site nor a Decoder product page");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.suppliedOn)) problems.push("suppliedOn must be YYYY-MM-DD");
  if (!entry.note.trim()) problems.push("say where the list was read (note)");
  const quote = entry.quote.replace(/\s+/g, " ").trim();
  if (!quote || quote.length > MAX_QUOTE_CHARS) problems.push("the quote is empty or longer than a pack could print");
  const parsed = parsePastedInci(entry.quote);
  const check = sanitizeInciList(parsed);
  if (parsed.length < MIN_INGREDIENTS) problems.push(`only ${parsed.length} ingredients; a pack list has at least ${MIN_INGREDIENTS}`);
  if (!check.ok || check.issues.length) problems.push(`the list needs repair, so it was mistyped: ${check.issues.slice(0, 3).join("; ") || "too few usable names"}`);
  if (check.list.length !== parsed.length) problems.push("the list repeats an ingredient or lost one in cleaning");
  return problems;
}

/** The entry as a candidate list: the same shape the engine gets from the brand's page, with the origin that says who typed it. */
export function ownerSuppliedPage(entry: OwnerSuppliedEntry): PageINCI {
  return {
    ingredients: sanitizeInciList(parsePastedInci(entry.quote)).list,
    source: entry.sourceUrl,
    quote: entry.quote.replace(/\s+/g, " ").trim(),
    pageTitles: entry.productNames,
    siteName: "The Clean Sheet",
    trust: 3,
    origin: "owner-supplied",
  };
}

const sameWords = (a: Set<string>, b: Set<string>): boolean => a.size > 0 && a.size === b.size && [...a].every((w) => b.has(w));

/** The owner-supplied list for this product, or null. The brand must be the same brand and the name must have exactly the same words (any order, the
 *  brand's own words and filler ignored). Two usable entries that disagree on the list are ambiguous and give nothing. */
export function findOwnerSupplied(brand: string, productName: string, entries: OwnerSuppliedEntry[] = OWNER_SUPPLIED_INCI): PageINCI | null {
  const key = brandKey(brand);
  if (!key) return null;
  const wanted = nameTokens(productName, brand);
  const hits = entries.filter((e) =>
    e.brands.some((b) => brandKey(b) === key)
    && e.productNames.some((n) => sameWords(nameTokens(n, brand), wanted))
    && checkOwnerSupplied(e).length === 0);
  if (!hits.length) return null;
  const pages = hits.map(ownerSuppliedPage);
  const first = pages[0].ingredients.join("|").toLowerCase();
  return pages.every((p) => p.ingredients.join("|").toLowerCase() === first) ? pages[0] : null;
}
