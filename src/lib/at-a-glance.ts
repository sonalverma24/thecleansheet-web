/* The "At a glance" ticks shown on a product page.

   Moved verbatim out of ProductScorecardView.tsx so server code can read the same
   ticks the page shows. The review verifier uses them to check that the page does not
   tick a claim its own analysis text says is contradicted. No behaviour change: the
   view imports this function instead of defining it. */

import type { ProductScorecard } from "@/data/brands/types";
import { DEFAULT_ONTOLOGY, ontologyTick, type Ontology } from "@/lib/claim-ontology";

export type GlanceItem = { label: string; value: boolean };

export type FragranceState = "clear" | "declared" | "essential-oil" | "aromatic-unknown" | "unknown";

export function fragranceFromCompleteInci(product: ProductScorecard): FragranceState {
  const complete = product.inciCompleteness?.status === "Full INCI on brand PDP" || product.inciCompleteness?.status === "Full INCI in reference database";
  if (!complete || !product.ingredients.length) return "unknown";
  const names = product.ingredients.map((i) => i.name.toLowerCase());
  if (names.some((n) => /\b(?:parfum|perfume|fragrance|aroma)\b/.test(n))) return "declared";
  if (names.some((n) => /\bessential\s+oil\b|\b(?:lavender|lavandula|rose|rosa|bergamot|citrus|rosemary|peppermint|eucalyptus|ylang ylang)\b.{0,35}\boil\b/i.test(n))) return "essential-oil";
  if (names.some((n) => /\b(?:lavender|lavandula|rose|rosa|jasmine|jasminum|geranium|pelargonium|ylang|citrus|bergamot|rosemary|rosmarinus|peppermint|mentha|eucalyptus|eugenia|clove|cinnamon|cananga)\b/i.test(n) && /\b(?:extract|water|distillate|hydrosol|oil|essence)\b/i.test(n))) return "aromatic-unknown";
  return "clear";
}

/** Labels the ontology takes over when ANALYSER_ONTOLOGY_TICKS is on. The rest of the
    strip is claim- and badge-derived and is left exactly as it was. */
const ONTOLOGY_LABELS = new Set(["Alcohol free", "Paraben free"]);

/** Re-decide the INCI-derived ticks from the claim ontology instead of substring logic.
    clear -> true, a reviewed member present -> false, only a qualified relation (or a
    model-written warning) -> the tick is dropped, because the strip should not assert
    what a person has not decided. Pure, and the identity function when no item is
    INCI-derived. Used by both copies of buildAtAGlance. */
export function applyOntologyTicks(items: GlanceItem[], product: ProductScorecard, ontology: Ontology = DEFAULT_ONTOLOGY): GlanceItem[] {
  const inci = product.ingredients.map((i) => i.name);
  const warns = product.warn_badges.map((b) => b.toLowerCase());
  const out: GlanceItem[] = [];
  for (const item of items) {
    if (!ONTOLOGY_LABELS.has(item.label)) { out.push(item); continue; }
    const t = ontologyTick(item.label, inci, ontology);
    if (!t) { out.push(item); continue; }
    const warned = item.label === "Alcohol free" && warns.some((b) => b.includes("denatured alcohol") || b.includes("alcohol denat"));
    if (t.outcome === "present") out.push({ label: item.label, value: false });
    else if (t.outcome === "clear" && !warned) out.push({ label: item.label, value: true });
    // unresolved, or clear but warned by the model: say nothing
  }
  return out;
}

export function buildAtAGlance(product: ProductScorecard, opts?: { ontology?: boolean; includeReefSafe?: boolean }): GlanceItem[] {
  const warn = product.warn_badges.map((b) => b.toLowerCase());
  const items: { label: string; value: boolean }[] = [];

  // Fragrance-free is derived from a complete captured INCI; unknown stays unlabelled.
  const fragrance = fragranceFromCompleteInci(product);
  if (fragrance === "clear") items.push({ label: "Fragrance free", value: true });
  else if (fragrance === "declared" || fragrance === "essential-oil") items.push({ label: "Fragrance free", value: false });

  if (fragrance === "clear") items.push({ label: "Essential oil free", value: true });
  else if (fragrance === "essential-oil") items.push({ label: "Essential oil free", value: false });

  // Alcohol free (check ingredient list)
  const hasAlcohol = product.ingredients.some((i) => {
    const n = i.name.toLowerCase();
    return n === "alcohol" || n.includes("alcohol denat");
  });
  const alcoholWarn = warn.some((b) => b.includes("denatured alcohol") || b.includes("alcohol denat"));
  if (hasAlcohol || alcoholWarn) items.push({ label: "Alcohol free", value: false });
  else items.push({ label: "Alcohol free", value: true });

  // Paraben free
  const hasParaben = product.ingredients.some((i) => i.name.toLowerCase().includes("paraben"));
  items.push({ label: "Paraben free", value: !hasParaben });

  // Brand claims stay in the claim evidence panel; they do not become positive ticks.
  if (product.productType === "sunscreen") {
    // No SPF tick without a structured TCS evidence record.
    const pass = product.pass_badges.map((b) => b.toLowerCase());
    const reefSafe = pass.some((b) => b.includes("reef-safe") || b.includes("reef safe"));
    if (opts?.includeReefSafe !== false && reefSafe) items.push({ label: "Reef safe", value: true });
  }

  return (opts?.ontology ? applyOntologyTicks(items, product) : items).slice(0, 8);
}

/* The /analyzed/[slug] page carried its own private copy of the ticks function, which
   predates the Reef safe tick above. A Next.js page file cannot export helpers, so the
   copy lives here, byte-for-byte except for the ontology branch, so the parity tests can
   cover it. Do not "fix" the difference without a preview: it changes a displayed tick. */
export function buildAtAGlanceAnalyzedPage(product: ProductScorecard, opts?: { ontology?: boolean }): GlanceItem[] {
  return buildAtAGlance(product, { ...opts, includeReefSafe: false });
}
