/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ — INCI ground-truth fetcher
   Pulls a product's real ingredient list from INCIDecoder (via the
   keyless Jina reader) so the review engine grades "free-from" and
   ingredient-presence claims against fact, not the model's recall.
──────────────────────────────────────────────────────────────── */

const JINA = "https://r.jina.ai/";

async function fetchMarkdown(url: string, limit = 60000): Promise<string | null> {
  try {
    const res = await fetch(JINA + url, {
      headers: { Accept: "text/plain", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return (await res.text()).slice(0, limit);
  } catch {
    return null;
  }
}

export interface INCIResult {
  productName: string;
  ingredients: string[];
  tags: string[];        // e.g. "alcohol-free", "fragrance-free" (as INCIDecoder labels them)
  source: string;        // INCIDecoder product URL
  imageUrl: string | null; // product front photo hosted by INCIDecoder (no API key needed)
}

/** Best-effort. Returns null if the ingredient list can't be confidently retrieved. */
export async function fetchINCI(query: string): Promise<INCIResult | null> {
  const q = query.trim();
  if (!q) return null;

  // 1 — find the product on INCIDecoder
  const search = await fetchMarkdown(`https://incidecoder.com/search?query=${encodeURIComponent(q)}`);
  if (!search) return null;
  const linkMatch = search.match(/\/products\/(?!create\b)[a-z0-9-]+/i);
  if (!linkMatch) return null;
  const slug = linkMatch[0];

  // 2 — read the product page
  const page = await fetchMarkdown(`https://incidecoder.com${slug}`);
  if (!page) return null;

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
  const productName = titleMatch ? titleMatch[1].trim() : q;

  // Real product front-photo hosted by INCIDecoder (no API key needed).
  const imgMatch = page.match(/https:\/\/incidecoder-content[^\s)"']+?(?:photo|front)[^\s)"']*\.(?:jpe?g|png|webp)/i);
  const imageUrl = imgMatch ? imgMatch[0] : null;

  return { productName, ingredients, tags, source: `https://incidecoder.com${slug}`, imageUrl };
}

/** Formats the retrieved INCI as a ground-truth block for the system prompt. */
export function inciGroundTruthBlock(inci: INCIResult | null): string {
  if (!inci || !inci.ingredients.length) {
    return `\n\nINGREDIENT LIST: could not be retrieved automatically. Do NOT assert which ingredients are present or absent from memory — search for the INCI, and if you still cannot confirm it, mark ingredient-dependent claims as unverified.`;
  }
  return `\n\nVERIFIED INGREDIENT LIST for ${inci.productName} (retrieved from INCIDecoder — ${inci.source}). This is GROUND TRUTH. Judge every ingredient-presence and "free-from" claim ONLY against this list. Do NOT claim the product contains any ingredient that is not listed here:\n${inci.ingredients.join(", ")}${inci.tags.length ? `\nINCIDecoder labels this product: ${inci.tags.join("; ")}.` : ""}`;
}
