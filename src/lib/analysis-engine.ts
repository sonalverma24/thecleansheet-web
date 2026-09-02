/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Category-driven analysis engine (step 5)
   Deterministic. Takes a ProductReview (which already carries the
   retrieved INCI, the claim map, transparency flags and the regulatory
   screen) plus the product's category, runs a category-scoped checklist,
   and produces TWO axes + a coverage meter.

   Golden rule: a check that APPLIES but has no public evidence is
   "not-disclosed" - it lowers PROOF, never SAFETY. Only a confirmed
   problem ("adverse") lowers safety. Nothing is ever scored zero merely
   because a lab document isn't published.
──────────────────────────────────────────────────────────────── */

import type { ProductReview } from "@/lib/product-review-types";
import type { AnalysisReport, CheckResult, CheckState, AuditPillar, CheckAxis, Obtainability } from "@/lib/analysis-types";
import { categorise, categoryLabel } from "@/lib/product-categorise";
import type { ProductCategory } from "@/data/analysis/categories";
import { ingredientSafety } from "@/lib/ingredient-db";
import {
  EU_FRAGRANCE_ALLERGENS_26, RESTRICTED_OR_BANNED, SENSITISING_PRESERVATIVES,
  SULPHATE_SURFACTANTS, COMEDOGENIC, UV_FILTERS, inciHas,
} from "@/data/analysis/ingredient-risk";

/** Findings aggregated per-review from the 734-ingredient database, unioned with
    the curated starter lists so coverage is the best of both. */
interface DbFindings {
  prohibited: { name: string; note: string }[];
  endocrine: { name: string; note: string }[];
  cmr: { name: string; note: string }[];
  allergens: string[];   // ingredient names the DB or the EU-26 list flags as allergens
  found: number;         // how many INCI entries matched a trusted DB row (data coverage)
  total: number;
}

function collectDbFindings(inci: string[], allergens26: string[]): DbFindings {
  const f: DbFindings = { prohibited: [], endocrine: [], cmr: [], allergens: [...allergens26], found: 0, total: inci.length };
  const seenAllergen = new Set(allergens26.map((a) => a.toLowerCase()));
  for (const name of inci) {
    const s = ingredientSafety(name);
    if (s.found && s.valid) f.found++;
    if (s.prohibited) f.prohibited.push({ name, note: s.note || "Prohibited in cosmetics." });
    if (s.endocrine) f.endocrine.push({ name, note: s.note || "Flagged for endocrine activity." });
    if (s.cmr || s.iarc) f.cmr.push({ name, note: s.note || `IARC ${s.iarc ?? "carcinogenicity"} concern.` });
    if (s.allergen && !seenAllergen.has(name.toLowerCase())) { seenAllergen.add(name.toLowerCase()); f.allergens.push(name); }
  }
  // Union with the curated starter lists (catches names the DB may miss).
  const joined = inci.join(" | ");
  for (const r of RESTRICTED_OR_BANNED) if (r.banned && inciHas(joined, [r.stem]).length && !f.prohibited.some((p) => p.note === r.note)) f.prohibited.push({ name: r.stem, note: r.note });
  for (const e of EDC_CONCERNS) if (inciHas(joined, [e.stem]).length && !f.endocrine.some((p) => p.note === e.note)) f.endocrine.push({ name: e.stem, note: e.note });
  return f;
}

export const ANALYSIS_VERSION = "TCS-AX v1.0";

/* Endocrine-disruptor concerns that turn up in the Indian market (public
   classifications: ECHA / EU SCCS). Presence is a flagged finding. */
const EDC_CONCERNS: { stem: string; note: string }[] = [
  { stem: "benzophenone-3", note: "Oxybenzone - flagged endocrine-active; EU restricts concentration." },
  { stem: "oxybenzone", note: "Endocrine-active UV filter; concentration-restricted in the EU." },
  { stem: "butylparaben", note: "Longer-chain paraben with endocrine-activity concern." },
  { stem: "propylparaben", note: "Longer-chain paraben with endocrine-activity concern." },
  { stem: "triclosan", note: "Antimicrobial with endocrine-activity concern; tightly restricted." },
  { stem: "benzophenone-1", note: "Benzophenone-1 - flagged for endocrine activity." },
  { stem: "butylated hydroxyanisole", note: "BHA antioxidant - IARC possible carcinogen (2B) and endocrine concern." },
];

const RETINOIDS = ["retinol", "retinal", "retinaldehyde", "retinyl", "tretinoin", "adapalene"];

interface Ctx {
  review: ProductReview;
  category: ProductCategory;
  inciJoined: string;
  hasInci: boolean;
  claimsText: string;
  isSunscreen: boolean;
  isBaby: boolean;
  isRinseOff: boolean;
  isOral: boolean;
  isEyeLip: boolean;
  isFacial: boolean;
  isColour: boolean;
  isFragranced: boolean;
  allergens: string[];
  db: DbFindings;
}

type Eval = { state: CheckState; detail: string; source?: string; penalty?: number };

interface CheckDef {
  id: string;
  pillar: AuditPillar;
  subCategory: string;
  label: string;
  axis: CheckAxis;
  obtainability: Obtainability;
  hard?: boolean;                  // an adverse result here is a genuine problem
  applies?: (c: Ctx) => boolean;   // default: always
  evaluate: (c: Ctx) => Eval;
}

/* Does a brand claim mention this, NOT under a negation? Guards against reading
   "no dermatologist test found" as "dermatologist tested". Only the marketing
   claim TEXT is searched (never our own evidence notes, which describe absences). */
const NEGATION_BEFORE = /\b(no|non|not|without|free|lacks?|missing|absent|un)\b[\s-]*$/i;
const claimsMention = (c: Ctx, re: RegExp): boolean => {
  const text = c.claimsText;
  const m = re.exec(text);
  if (!m) return false;
  const before = text.slice(Math.max(0, m.index - 16), m.index);
  return !NEGATION_BEFORE.test(before);
};

/* Small helpers for the common "brand only tells us if it claims it" pattern. */
const disclosedIf = (cond: boolean, yes: string, no: string): Eval =>
  cond ? { state: "disclosed", detail: yes } : { state: "not-disclosed", detail: no };
const verifiedIf = (cond: boolean, yes: string, no: string): Eval =>
  cond ? { state: "verified", detail: yes } : { state: "not-disclosed", detail: no };
const privateDoc = (what: string): Eval =>
  ({ state: "not-disclosed", detail: `${what} is not published for consumers (manufacturing/lab document).` });

/* ═══════════════ The checklist (category-scoped) ═══════════════ */
const CHECKS: CheckDef[] = [
  // ── Ingredient Safety & Toxicity ──
  { id: "inci_verified", pillar: "Ingredient Safety & Toxicity", subCategory: "Identity & Purity", label: "INCI verification", axis: "safety", obtainability: "public",
    evaluate: (c) => c.hasInci
      ? { state: "verified", detail: `Full ingredient list retrieved and verified against ${c.review.inciSourceUrl ? "INCIDecoder" : "the label"}.`, source: c.review.inciSourceUrl }
      : { state: "not-disclosed", detail: "A verified INCI list could not be retrieved from a public source." } },
  { id: "cas_synonyms", pillar: "Ingredient Safety & Toxicity", subCategory: "Identity & Purity", label: "CAS numbers & synonyms", axis: "proof", obtainability: "private",
    evaluate: () => ({ state: "not-disclosed", detail: "Per-ingredient CAS identity is not published on the product page (available in a full dossier)." }) },
  { id: "source_type", pillar: "Ingredient Safety & Toxicity", subCategory: "Identity & Purity", label: "Ingredient source (synthetic / natural / biotech)", axis: "proof", obtainability: "brand",
    evaluate: (c) => disclosedIf(claimsMention(c, /natural|plant|derived|biotech|fermented/i), "Brand describes ingredient origin in its claims.", "Ingredient origin is not disclosed.") },
  { id: "heavy_metals", pillar: "Ingredient Safety & Toxicity", subCategory: "Identity & Purity", label: "Contaminants / heavy-metals testing", axis: "safety", obtainability: "private",
    evaluate: () => privateDoc("Heavy-metal / contaminant testing") },
  { id: "annex_screen", pillar: "Ingredient Safety & Toxicity", subCategory: "Regulatory Compliance", label: "EU Annex II/III banned & restricted screen", axis: "safety", obtainability: "public", hard: true,
    evaluate: (c) => {
      if (!c.hasInci) return { state: "not-disclosed", detail: "No INCI to screen against the prohibited lists." };
      const hits = c.db.prohibited;
      return hits.length
        ? { state: "adverse", detail: hits.map((h) => `${h.name}: ${h.note}`).join(" "), penalty: 30 }
        : { state: "verified", detail: `Screened against the ingredient database (${c.db.found} of ${c.db.total} ingredients matched); no cosmetics-prohibited ingredient found.` };
    } },
  { id: "endocrine", pillar: "Ingredient Safety & Toxicity", subCategory: "Toxicology", label: "Endocrine-disruptor screen", axis: "safety", obtainability: "public",
    evaluate: (c) => {
      if (!c.hasInci) return { state: "not-disclosed", detail: "No INCI to screen." };
      const hits = c.db.endocrine;
      return hits.length
        ? { state: "adverse", detail: hits.map((h) => `${h.name}: ${h.note}`).join(" "), penalty: 15 }
        : { state: "verified", detail: "No ingredient with a recognised endocrine-activity concern found in the database." };
    } },
  { id: "carcinogenicity", pillar: "Ingredient Safety & Toxicity", subCategory: "Toxicology", label: "Carcinogenicity / formaldehyde-releaser screen", axis: "safety", obtainability: "public",
    evaluate: (c) => {
      if (!c.hasInci) return { state: "not-disclosed", detail: "No INCI to screen." };
      const formaldehyde = SENSITISING_PRESERVATIVES.filter((p) => /formaldehyde/i.test(p.note) && inciHas(c.inciJoined, [p.stem]).length > 0);
      const hits = [
        ...c.db.cmr.map((h) => `${h.name}: ${h.note}`),
        ...formaldehyde.map((f) => `Formaldehyde-releaser: ${f.stem}`),
      ];
      return hits.length
        ? { state: "adverse", detail: hits.join(" "), penalty: 12 }
        : { state: "verified", detail: "No IARC-classified or formaldehyde-releasing ingredient found in the database screen." };
    } },
  { id: "bioaccumulation", pillar: "Ingredient Safety & Toxicity", subCategory: "Toxicology", label: "Bioaccumulation potential", axis: "safety", obtainability: "private",
    evaluate: () => ({ state: "not-disclosed", detail: "No public bioaccumulation data for this formulation." }) },
  { id: "comedogenicity", pillar: "Ingredient Safety & Toxicity", subCategory: "Functional Safety", label: "Comedogenicity risk", axis: "safety", obtainability: "public",
    applies: (c) => c.isFacial || /acne|oil control/i.test(c.category.type),
    evaluate: (c) => {
      const hits = inciHas(c.inciJoined, COMEDOGENIC);
      if (!c.hasInci) return { state: "not-disclosed", detail: "No INCI to assess comedogenicity." };
      return hits.length
        ? { state: "adverse", detail: `Contains ingredient(s) commonly rated comedogenic: ${hits.join(", ")}. May not suit very acne-prone skin.`, penalty: 8 }
        : { state: "verified", detail: "No commonly-comedogenic ingredient found - a reasonable fit for acne-prone skin." };
    } },
  { id: "mutagenicity", pillar: "Ingredient Safety & Toxicity", subCategory: "Functional Safety", label: "Mutagenicity / genotoxicity report", axis: "safety", obtainability: "private",
    evaluate: () => privateDoc("Mutagenicity / genotoxicity testing") },

  // ── Irritation & Allergen Risk ──
  { id: "allergen_panel", pillar: "Irritation & Allergen Risk", subCategory: "Ingredient Level", label: "EU fragrance-allergen panel (26)", axis: "safety", obtainability: "public",
    evaluate: (c) => {
      if (!c.hasInci) return { state: "not-disclosed", detail: "No INCI to screen for declared allergens." };
      const a = c.db.allergens;
      if (a.length) return { state: "disclosed", detail: `Declares ${a.length} known allergen(s) (${a.slice(0, 6).join(", ")}${a.length > 6 ? "…" : ""}). Reactive skin should note these.` };
      return c.isFragranced
        ? { state: "not-disclosed", detail: "Fragranced, but individual allergens are hidden behind 'Parfum' rather than declared." }
        : { state: "verified", detail: "No EU-declarable or database-flagged allergen found in the list." };
    } },
  { id: "preservative_sensitivity", pillar: "Irritation & Allergen Risk", subCategory: "Ingredient Level", label: "Preservative sensitivity (MI / MCI etc.)", axis: "safety", obtainability: "public",
    evaluate: (c) => {
      if (!c.hasInci) return { state: "not-disclosed", detail: "No INCI to screen preservatives." };
      const hits = SENSITISING_PRESERVATIVES.filter((p) => inciHas(c.inciJoined, [p.stem]).length > 0);
      if (!hits.length) return { state: "verified", detail: "No high-sensitisation preservative (MI/MCI/formaldehyde-releaser) from our screen was found." };
      const leaveOnMI = !c.isRinseOff && hits.some((h) => /isothiazolinone/i.test(h.stem));
      return { state: "adverse", detail: hits.map((h) => h.note).join(" ") + (leaveOnMI ? " Notable in a leave-on product." : ""), penalty: leaveOnMI ? 12 : 6 };
    } },
  { id: "extract_allergens", pillar: "Irritation & Allergen Risk", subCategory: "Ingredient Level", label: "Essential-oil / extract allergen breakdown", axis: "proof", obtainability: "brand",
    applies: (c) => c.isFragranced || /oil|extract|essential/i.test(c.inciJoined),
    evaluate: () => ({ state: "not-disclosed", detail: "The allergen breakdown of essential oils / botanical extracts is not published." }) },
  { id: "surfactant_irritation", pillar: "Irritation & Allergen Risk", subCategory: "Ingredient Level", label: "Surfactant irritation potential", axis: "safety", obtainability: "public",
    applies: (c) => c.isRinseOff,
    evaluate: (c) => {
      const hits = inciHas(c.inciJoined, SULPHATE_SURFACTANTS);
      if (!c.hasInci) return { state: "not-disclosed", detail: "No INCI to assess the surfactant system." };
      return hits.length
        ? { state: "adverse", detail: `Built on a stronger sulphate surfactant (${hits.join(", ")}) - effective, but can feel stripping on sensitive skin or in hard water.`, penalty: 8 }
        : { state: "verified", detail: "Uses milder (non-sulphate) surfactants." };
    } },
  { id: "hript", pillar: "Irritation & Allergen Risk", subCategory: "Product Level", label: "HRIPT patch test", axis: "proof", obtainability: "brand",
    evaluate: (c) => disclosedIf(claimsMention(c, /hript|patch tested|patch test|repeat insult/i), "Brand states a patch test (HRIPT) was performed.", "No HRIPT patch-test result is published.") },
  { id: "derm_tested", pillar: "Irritation & Allergen Risk", subCategory: "Product Level", label: "Dermatologist-tested claim", axis: "proof", obtainability: "brand",
    evaluate: (c) => disclosedIf(claimsMention(c, /dermatologist|dermatologically/i), "Brand claims dermatologist testing (claim stated; underlying report not seen).", "No dermatologist-tested claim or report found.") },
  { id: "eye_lip_irritation", pillar: "Irritation & Allergen Risk", subCategory: "Product Level", label: "Eye / lip irritation testing", axis: "proof", obtainability: "brand",
    applies: (c) => c.isEyeLip,
    evaluate: () => ({ state: "not-disclosed", detail: "No ocular / lip-safe irritation testing is published for this eye/lip product." }) },
  { id: "oral_irritation", pillar: "Irritation & Allergen Risk", subCategory: "Product Level", label: "Oral-mucosa irritation testing", axis: "proof", obtainability: "brand",
    applies: (c) => c.isOral,
    evaluate: () => ({ state: "not-disclosed", detail: "No oral-mucosa safety testing is published for this oral-care product." }) },

  // ── Ingredient Transparency ──
  { id: "full_inci", pillar: "Ingredient Transparency", subCategory: "Disclosure Accuracy", label: "Full INCI vs marketing names", axis: "proof", obtainability: "public",
    evaluate: (c) => verifiedIf(!!c.review.ingredientTransparency?.fullInciAvailable, "The full INCI list is publicly available, not just hero ingredients.", "The full INCI is not clearly published for consumers.") },
  { id: "hero_pct", pillar: "Ingredient Transparency", subCategory: "Disclosure Accuracy", label: "Hero-active % vs claimed %", axis: "proof", obtainability: "public",
    evaluate: (c) => verifiedIf(!!c.review.ingredientTransparency?.activePercentagesDisclosed, "Active percentages are disclosed for the hero ingredient(s).", "Hero-active percentages are not disclosed, so strength can't be confirmed.") },
  { id: "proprietary_blends", pillar: "Ingredient Transparency", subCategory: "Disclosure Accuracy", label: "Proprietary blends broken down", axis: "proof", obtainability: "public",
    evaluate: (c) => verifiedIf(!!c.review.ingredientTransparency?.complexesExplained, "Any proprietary 'complex' is broken down into its actual ingredients.", "Proprietary blends (if any) are not broken down.") },
  { id: "inci_order", pillar: "Ingredient Transparency", subCategory: "Disclosure Accuracy", label: "INCI order vs actual %", axis: "proof", obtainability: "public",
    evaluate: (c) => verifiedIf(!!c.review.ingredientTransparency?.inciOrderCorrect, "Ingredients are listed in the descending order required by India Cosmetics Rules 2020.", "Ingredient ordering could not be confirmed as compliant.") },
  { id: "coa", pillar: "Ingredient Transparency", subCategory: "Supporting Documents", label: "Certificate of Analysis (CoA)", axis: "proof", obtainability: "private",
    evaluate: () => privateDoc("A per-ingredient Certificate of Analysis (CoA)") },
  { id: "tds_msds", pillar: "Ingredient Transparency", subCategory: "Supporting Documents", label: "TDS / MSDS", axis: "proof", obtainability: "private",
    evaluate: () => privateDoc("Technical & safety data sheets (TDS/MSDS)") },
  { id: "traceability", pillar: "Ingredient Transparency", subCategory: "Supporting Documents", label: "Origin / traceability certificates", axis: "proof", obtainability: "brand",
    evaluate: (c) => disclosedIf(claimsMention(c, /traceab|sourced from|origin/i), "Brand references ingredient origin / traceability.", "No origin / traceability certificate is published.") },

  // ── Standards & Compliance ──
  { id: "stability", pillar: "Standards & Compliance", subCategory: "Product Testing", label: "Stability testing", axis: "proof", obtainability: "private",
    evaluate: () => privateDoc("Accelerated / real-time stability testing") },
  { id: "challenge_test", pillar: "Standards & Compliance", subCategory: "Product Testing", label: "Preservative efficacy (challenge test)", axis: "proof", obtainability: "private",
    evaluate: () => privateDoc("Preservative-efficacy (challenge) testing") },
  { id: "microbial", pillar: "Standards & Compliance", subCategory: "Product Testing", label: "Microbial limits (ISO 17516)", axis: "proof", obtainability: "private",
    evaluate: () => privateDoc("Microbial-limits testing (ISO 17516)") },
  { id: "ph", pillar: "Standards & Compliance", subCategory: "Shelf-life & Process", label: "pH disclosed (where relevant)", axis: "proof", obtainability: "public",
    applies: (c) => /exfoliant|scrub|toner|serum|cleanser|moisturizer|sunscreen/i.test(c.category.type),
    evaluate: (c) => verifiedIf(!!c.review.ingredientTransparency?.phDisclosedWhereRelevant, "The product pH is disclosed - important for acids / vitamin C / cleansers.", "pH is not disclosed, though it matters for this product type.") },
  { id: "gmp", pillar: "Standards & Compliance", subCategory: "Process & Manufacturing", label: "GMP (ISO 22716) certification", axis: "proof", obtainability: "private",
    evaluate: () => privateDoc("GMP (ISO 22716) manufacturing certification") },
  { id: "batch_traceability", pillar: "Standards & Compliance", subCategory: "Process & Manufacturing", label: "Batch traceability & recall records", axis: "proof", obtainability: "private",
    evaluate: () => privateDoc("Batch-traceability / recall documentation") },
  { id: "label_compliance", pillar: "Standards & Compliance", subCategory: "Process & Manufacturing", label: "Label compliance (claims, allergens, warnings)", axis: "proof", obtainability: "public",
    evaluate: (c) => verifiedIf(!!c.review.ingredientTransparency?.usageWarningsClear, "Usage warnings and directions are clear on the label.", "Usage warnings / directions are not clearly stated.") },
  { id: "spf_testing", pillar: "Standards & Compliance", subCategory: "Product Testing", label: "SPF testing (ISO 24444)", axis: "proof", obtainability: "brand",
    applies: (c) => c.isSunscreen || /spf|moisturizer with spf|lip balm with spf/i.test(c.category.type),
    evaluate: (c) => {
      const filters = inciHas(c.inciJoined, UV_FILTERS);
      if (claimsMention(c, /iso 24444|spf test|clinically tested spf|broad.?spectrum tested/i))
        return { state: "disclosed", detail: "Brand references SPF/UV testing (method stated; certificate not independently seen)." };
      if (filters.length) return { state: "not-disclosed", detail: `UV filters are present (${filters.slice(0, 3).join(", ")}), which supports the SPF claim, but no ISO 24444 test evidence is published.` };
      return { state: "not-disclosed", detail: "No SPF (ISO 24444) test evidence is published." };
    } },
  { id: "pregnancy_safe", pillar: "Standards & Compliance", subCategory: "Special Categories", label: "Pregnancy-safe review", axis: "safety", obtainability: "public",
    applies: (c) => !c.isRinseOff && (c.isFacial || /serum|treatment|anti-aging|moisturizer/i.test(c.category.type)),
    evaluate: (c) => {
      const hits = inciHas(c.inciJoined, RETINOIDS);
      return hits.length
        ? { state: "adverse", detail: `Contains a retinoid (${hits.join(", ")}) - generally advised against during pregnancy. Not a general-safety issue.`, penalty: 6 }
        : { state: "verified", detail: "No retinoid or other pregnancy-cautioned active found in the screen." };
    } },
  { id: "baby_safe", pillar: "Standards & Compliance", subCategory: "Special Categories", label: "Baby-safe toxicology thresholds", axis: "safety", obtainability: "brand",
    applies: (c) => c.isBaby,
    evaluate: (c) => disclosedIf(claimsMention(c, /paediatric|pediatric|baby.safe|tear.?free|clinically tested on/i), "Brand states baby-specific safety testing.", "No baby-specific toxicology / lower-threshold evidence is published.") },
  { id: "vegan", pillar: "Standards & Compliance", subCategory: "Special Categories", label: "Vegan / vegetarian validation", axis: "proof", obtainability: "brand",
    evaluate: (c) => disclosedIf(claimsMention(c, /vegan|vegetarian/i), "Brand makes a vegan / vegetarian claim.", "No vegan / vegetarian validation stated.") },

  // ── Sustainability & Ethics ──
  { id: "sourcing_certs", pillar: "Sustainability & Ethics", subCategory: "Ingredient Level", label: "Sourcing certifications (RSPO / Fairtrade / COSMOS / USDA)", axis: "proof", obtainability: "brand",
    evaluate: (c) => disclosedIf(claimsMention(c, /rspo|fairtrade|cosmos|usda|organic certified|ecocert/i), "Brand states a recognised sourcing certification.", "No recognised sourcing certification (RSPO / Fairtrade / COSMOS / USDA) stated.") },
  { id: "biodegradability", pillar: "Sustainability & Ethics", subCategory: "Ingredient Level", label: "Biodegradability data", axis: "proof", obtainability: "brand",
    evaluate: (c) => disclosedIf(claimsMention(c, /biodegrad/i), "Brand references biodegradability.", "No biodegradability data published.") },
  { id: "recyclability", pillar: "Sustainability & Ethics", subCategory: "Packaging Level", label: "Recyclability / % PCR content", axis: "proof", obtainability: "brand",
    evaluate: (c) => disclosedIf(claimsMention(c, /recyclab|pcr|post.?consumer|recycled/i), "Brand references recyclable / PCR packaging.", "No recyclability or % post-consumer-recycled content stated.") },
  { id: "cruelty_free", pillar: "Sustainability & Ethics", subCategory: "Ethics & Social", label: "Cruelty-free validation", axis: "proof", obtainability: "brand",
    evaluate: (c) => disclosedIf(claimsMention(c, /cruelty.?free|peta|not tested on animals|leaping bunny/i), "Brand makes a cruelty-free / PETA claim.", "No cruelty-free validation stated.") },
  { id: "ethical_sourcing", pillar: "Sustainability & Ethics", subCategory: "Ethics & Social", label: "Ethical-sourcing / no-child-labour audit", axis: "proof", obtainability: "brand",
    evaluate: () => ({ state: "not-disclosed", detail: "No ethical-sourcing / labour-audit documentation is published." }) },
];

/* ═══════════════ Build context ═══════════════ */
function buildContext(review: ProductReview): Ctx {
  const category = categorise(review.category, `${review.productName} ${review.heroPromise ?? ""}`);
  const inci = review.inciIngredients ?? [];
  const inciJoined = inci.join(" | ").toLowerCase();
  const hasInci = inci.length >= 3;
  // Only the brand's own claim text + hero promise. NOT evidenceNote (that is our
  // analysis, and often describes what is ABSENT, which must not read as a claim).
  const claimsText = (review.claimMap ?? []).map((c) => c.text).join(" ") + " " + (review.heroPromise ?? "");
  const t = category.type.toLowerCase();
  const isRinseOff = /wash|cleanser|shampoo|soap|scrub|conditioner|shaving|bubble bath|body wash|face wash|remover|sanitizer/.test(t);
  const isFacial = /facial|face|serum|toner|moisturizer|exfoliant|eye|anti-aging|redness|scar|oil control/.test(t) && category.family !== "Hair";
  const allergens = inciHas(inciJoined, EU_FRAGRANCE_ALLERGENS_26);
  const isFragranced = allergens.length > 0 || /\bparfum\b|\bfragrance\b/.test(inciJoined);
  const db = collectDbFindings(inci, allergens);
  return {
    db,
    review, category, inciJoined, hasInci, claimsText,
    isSunscreen: category.family === "Sunscreens" || /\bspf\b|sunscreen/.test(t),
    isBaby: category.family === "Baby" || /baby|kids/.test(t),
    isRinseOff,
    isOral: category.family === "Oral Care",
    isEyeLip: /eye|lip/.test(t),
    isFacial,
    isColour: category.family === "Makeup" || category.family === "Nail",
    isFragranced,
    allergens,
  };
}

/* ═══════════════ Run ═══════════════ */
export function runAnalysis(review: ProductReview): AnalysisReport {
  const ctx = buildContext(review);

  // Evaluate every check EXACTLY ONCE. Each result carries the penalty it would
  // apply to the safety axis, so nothing is re-evaluated downstream.
  const evaluated = CHECKS.map((def) => {
    const base = { id: def.id, pillar: def.pillar, subCategory: def.subCategory, label: def.label, axis: def.axis, obtainability: def.obtainability, hard: def.hard };
    if (def.applies && !def.applies(ctx)) {
      return { result: { ...base, state: "not-applicable" as CheckState, detail: "Not applicable to this product type." }, penalty: 0 };
    }
    const ev = def.evaluate(ctx);
    const result: CheckResult = { ...base, state: ev.state, detail: ev.detail, source: ev.source };
    const penalty = ev.state === "adverse" && def.axis === "safety" && def.obtainability !== "private" ? (ev.penalty ?? 15) : 0;
    return { result, penalty };
  });

  const checks: CheckResult[] = evaluated.map((e) => e.result);

  // The page shows the stamp (from deriveVerdict, which owns the safety gate),
  // the flags, and the qualitative findings - no numeric axis scores - so the
  // report carries exactly those: the category, the findings, and the flags.
  return {
    category: categoryLabel(ctx.category),
    categoryId: ctx.category.id,
    checks,
    // Only genuine problems lead the page. Legal-but-flagged concerns (endocrine-
    // active-but-permitted filters, comedogenic oils) stay as context in the screen.
    redFlags: checks.filter((c) => c.state === "adverse" && c.hard),
    methodologyVersion: ANALYSIS_VERSION,
  };
}
