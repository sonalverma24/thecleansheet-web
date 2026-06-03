/**
 * Synonym map for scorecard search.
 * Keys are canonical terms; values are alternate phrasings users may type.
 * Matching is case-insensitive substring.
 */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
  "vitamin c": [
    "vit c", "ascorbic acid", "l-ascorbic acid", "ethyl ascorbic acid",
    "3-o-ethyl ascorbic acid", "eaa", "ascorbyl glucoside", "sap",
    "map", "magnesium ascorbyl phosphate", "sodium ascorbyl phosphate",
  ],
  "retinoid": [
    "retinol", "retinal", "retinaldehyde", "retinyl palmitate",
    "0.3% retinol", "0.2% retinol", "bakuchiol",
  ],
  "niacinamide": [
    "niacin", "vitamin b3", "nicotinamide", "b3",
  ],
  "sunscreen": [
    "spf", "sunblock", "uv protection", "broad spectrum",
    "pa++++", "pa+++", "uv filter", "sun protection",
  ],
  "acne": [
    "pimples", "breakouts", "acne prone", "acne-prone",
    "blemishes", "spot treatment", "bha", "salicylic",
  ],
  "pigmentation": [
    "dark spots", "tanning", "melasma", "uneven tone",
    "hyperpigmentation", "brightening", "dullness",
    "dark spot", "pih", "post-inflammatory",
  ],
  "barrier": [
    "damaged barrier", "barrier repair", "redness",
    "irritation", "sensitive skin", "ceramide",
  ],
  "baby": [
    "infant", "toddler", "kids", "child safe", "baby safe",
  ],
  "hyaluronic acid": [
    "ha", "sodium hyaluronate", "hyaluron", "hyaluronan",
  ],
  "salicylic acid": [
    "bha", "salicylate", "2% bha", "sa", "beta hydroxy",
  ],
  "glycolic acid": [
    "aha", "alpha hydroxy", "alpha-hydroxy", "exfoliant", "peel",
  ],
  "azelaic acid": ["azelaic", "azelic"],
  "tranexamic acid": ["tranexamic", "txa"],
  "peptide": ["peptides", "matrixyl", "argireline", "palmitoyl"],
  "ceramide": ["ceramides", "barrier lipid", "sphingosine"],
};

/**
 * Expand a raw user query into a deduplicated array of search terms,
 * including canonical synonyms where relevant.
 */
export function expandQuery(raw: string): string[] {
  const input = raw.toLowerCase().trim();
  const inputTerms = input.split(/\s+/).filter(Boolean);
  const expanded = new Set<string>([input, ...inputTerms]);

  for (const [canonical, synonyms] of Object.entries(SEARCH_SYNONYMS)) {
    const allVariants = [canonical, ...synonyms];
    const hit = allVariants.some(
      (v) => input.includes(v) || v.includes(input)
    );
    if (hit) {
      expanded.add(canonical);
      synonyms.forEach((s) => expanded.add(s));
    }
  }

  return Array.from(expanded);
}
