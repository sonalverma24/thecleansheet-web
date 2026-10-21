/* Verifier census: run every stored review through the deterministic review verifier
   and the identity resolver, and report what turns up. READ-ONLY: one select on
   product_reviews, nothing is written to the database, no model is called.

   This is the "true defect census" the plan asks for before any policy changes. Its
   findings are LEADS for a person, never established defects. Two limits to keep in
   mind when reading it:
     - Reviews stored before evidence capture have no quoted source text, so they can
       never be anchored. They are reported as legacy, not as findings.
     - Precision and recall are unknown until a person clears a sample of the leads.
   The ticks it checks are the ones the pages show today (the legacy tick logic).

   Run: set -a; . ./.env.local; set +a; npx tsx --tsconfig tsconfig.json scripts/verifier-census.mts [--out reports/verifier-census.json] */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { deriveVerdict, RETRACTED_SLUGS, RUBRIC_REV } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { buildAtAGlance } from "@/lib/at-a-glance";
import { reviewInciList } from "@/lib/review-inci";
import { findCatchAllIngredients } from "@/lib/inci-catchall";
import { isSameProduct, brandKey } from "@/lib/product-identity";
import { identityDecision } from "@/lib/identity-resolution";
import { CaptureTrust, evidenceForReview, isAnchored, verifyReview, type Finding } from "@/lib/review-verifier";
import type { ProductReview, DerivedVerdict } from "@/lib/product-review-types";

const outArg = process.argv.indexOf("--out");
const OUT = outArg > -1 ? process.argv[outArg + 1] : "reports/verifier-census.json";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Load .env.local first (see the header).");
  process.exit(1);
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

interface Row { product_slug: string; product_name: string; brand: string; tier: string | null; rubric_rev: string | null; result: unknown }
const rows: Row[] = [];
for (let from = 0; ; from += 500) {
  const { data, error } = await db.from("product_reviews").select("product_slug, product_name, brand, tier, rubric_rev, result").order("product_slug").range(from, from + 499);
  if (error) { console.error("read failed:", error.message); process.exit(1); }
  rows.push(...(data as Row[]));
  if (!data || data.length < 500) break;
}

interface Reviewed { slug: string; name: string; brand: string; review: ProductReview; verdict: DerivedVerdict; inci: string[]; findings: Finding[] }
const reviews: Reviewed[] = [];
let skipped = 0, retracted = 0;
for (const row of rows) {
  if (RETRACTED_SLUGS.has(row.product_slug)) { retracted++; continue; }
  const result = row.result as { type?: string; review?: ProductReview } | null;
  if (!result?.review || result.type !== "product-review") { skipped++; continue; }
  const review = result.review;
  const verdict = deriveVerdict(review);
  const product = reviewToScorecard(review, verdict).product;
  const ticks = buildAtAGlance(product).filter((i) => i.value).map((i) => i.label);
  reviews.push({ slug: row.product_slug, name: row.product_name, brand: row.brand, review, verdict, inci: reviewInciList(review), findings: verifyReview(review, ticks) });
}

/* ── Rule counts ─────────────────────────────────────────────── */
const byRule: Record<string, { severity: string; reviews: number; sample: string[] }> = {};
for (const r of reviews) {
  for (const code of new Set(r.findings.map((f) => f.code))) {
    const sev = r.findings.find((f) => f.code === code)!.severity;
    const e = (byRule[code] ??= { severity: sev, reviews: 0, sample: [] });
    e.reviews++;
    if (e.sample.length < 12) e.sample.push(r.slug);
  }
}
const needsLook = reviews.filter((r) => r.findings.some((f) => f.severity !== "info"));

/* ── Claim disputes, split by strength. None of these is a confirmed defect. ── */
const disputes = reviews.flatMap((r) => r.findings.filter((f) => f.code === "CLAIM_DISPUTE").map((f) => ({ r, f })));
const disputeBuckets = {
  definitiveMatch: disputes.filter((d) => d.f.strength === "definitive_match"),
  leadQueued: disputes.filter((d) => d.f.strength === "lead" && d.f.severity === "review_required"),
  leadNotedOnly: disputes.filter((d) => d.f.strength === "lead" && d.f.severity === "info"),
};
const disputedGoodStanding = new Set(disputes.filter((d) => d.r.verdict.tierLabel === "Good Standing" && d.f.severity !== "info").map((d) => d.r.slug));

/* ── What the policies would touch ───────────────────────────── */
const goodStanding = reviews.filter((r) => r.verdict.tierLabel === "Good Standing");
const sourceClass = (r: Reviewed) => {
  if (!r.inci.length) return "no ingredient list";
  const e = evidenceForReview(r.review);
  if (!r.review.inciSourceUrl && !r.review.inciEvidence) return "model-reported, unverified (no URL or quote)";
  if (e.captureTrust === CaptureTrust.REFERENCE_DB) return "INCIDecoder";
  if (e.captureTrust === CaptureTrust.OFFICIAL_PAGE) return "brand or other page";
  if (e.captureTrust === CaptureTrust.RETAILER) return "retailer page";
  return "model-reported, unverified (no URL or quote)";
};
const tally = (rs: Reviewed[]) => rs.reduce<Record<string, number>>((m, r) => ((m[sourceClass(r)] = (m[sourceClass(r)] ?? 0) + 1), m), {});
const modelReportedSources = reviews.filter((r) => sourceClass(r).startsWith("model-reported")).reduce<Record<string, number>>((m, r) => {
  const k = String(r.review.dataSource?.inciSource ?? "(none stated)").toLowerCase().replace(/https?:\/\/(www\.)?/, "").slice(0, 36);
  m[k] = (m[k] ?? 0) + 1; return m;
}, {});
/* Anchored = a quote was captured from a real source. It says nothing about whether the
   formula is true, current for the SKU, or valid for a region or version. */
const anchoredRows = reviews.filter((r) => isAnchored(evidenceForReview(r.review)));
const goodStandingNotAnchored = goodStanding.filter((r) => !isAnchored(evidenceForReview(r.review)));
const anchoring = {
  reviewsAnchored: anchoredRows.length,
  reviewsNotAnchored: reviews.length - anchoredRows.length,
  goodStandingAnchored: goodStanding.length - goodStandingNotAnchored.length,
  goodStandingNotAnchored: goodStandingNotAnchored.length,
  goodStandingNotAnchoredBySource: tally(goodStandingNotAnchored),
};
const policyPreview = {
  goodStanding: goodStanding.length,
  goodStandingWithNoIngredientList: goodStanding.filter((r) => !r.inci.length).map((r) => r.slug),
  goodStandingWithRubricCatchAll: goodStanding.filter((r) => findCatchAllIngredients(r.inci).length > 0).map((r) => r.slug),
  goodStandingWithUnresolvedDispute: [...disputedGoodStanding],
  goodStandingByInciSource: tally(goodStanding),
};

/* ── Identity: same-brand pairs. Probable duplicates are leads, never merges. ── */
const byBrand = new Map<string, Reviewed[]>();
for (const r of reviews) { const k = brandKey(r.review.brand || r.brand); (byBrand.get(k) ?? byBrand.set(k, []).get(k)!).push(r); }
const probable: unknown[] = [], quarantine: unknown[] = [];
let pairs = 0, liveWouldServeOther = 0;
for (const group of byBrand.values()) {
  for (let i = 0; i < group.length; i++) for (let j = i + 1; j < group.length; j++) {
    pairs++;
    const a = group[i], b = group[j];
    const ca = { productName: a.review.productName, brand: a.review.brand, inci: a.inci };
    const cb = { productName: b.review.productName, brand: b.review.brand, inci: b.inci };
    const d = identityDecision(ca, cb);
    if (d.verdict === "DISTINCT") continue;
    const liveSame = isSameProduct(ca, cb);
    if (d.verdict === "CONFLICT_QUARANTINE" && liveSame) liveWouldServeOther++;
    (d.verdict === "PROBABLE_DUPLICATE" ? probable : quarantine).push({ a: a.slug, b: b.slug, ...d, liveIsSameProduct: liveSame });
  }
}

/* ── Report ─────────────────────────────────────────────────── */
const report = {
  generatedAt: new Date().toISOString(),
  note: "Findings are leads for human review, not established defects. A match against an unverified list is a lead; even an anchored quote proves only capture. Legacy reviews predate evidence capture and have no quoted source text.",
  rubricRev: RUBRIC_REV,
  rowsRead: rows.length, reviewsAnalysed: reviews.length, retractedExcluded: retracted, skippedNonReview: skipped,
  reviewsWithAtLeastOneLead: needsLook.length,
  byRule,
  claimDisputes: {
    definitiveMatch: disputeBuckets.definitiveMatch.map((d) => ({ slug: d.r.slug, subject: d.f.subject })),
    leadQueued: disputeBuckets.leadQueued.map((d) => ({ slug: d.r.slug, standing: d.r.verdict.tierLabel, subject: d.f.subject, message: d.f.message })),
    leadNotedOnly: disputeBuckets.leadNotedOnly.length,
  },
  standings: reviews.reduce<Record<string, number>>((m, r) => ((m[r.verdict.tierLabel] = (m[r.verdict.tierLabel] ?? 0) + 1), m), {}),
  inciSources: tally(reviews),
  modelReportedSources,
  anchoring,
  policyPreview,
  identity: { sameBrandPairsCompared: pairs, probableDuplicates: probable, conflictQuarantine: quarantine, quarantinePairsLiveIsSameProductWouldServeOneAsTheOther: liveWouldServeOther },
  perReview: reviews.filter((r) => r.findings.length).map((r) => ({ slug: r.slug, standing: r.verdict.tierLabel, findings: r.findings })),
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(report, null, 2));

const pad = (s: string | number, n: number) => String(s).padEnd(n);
console.log(`\nVerifier census (rubric ${RUBRIC_REV}): ${reviews.length} reviews analysed of ${rows.length} rows (${retracted} retracted excluded, ${skipped} not reviews)`);
console.log(`${needsLook.length} carry at least one lead needing a look (review_required or hold); the rest are info only or clean.\n`);
console.log(pad("rule", 28) + pad("severity", 18) + "reviews");
for (const [code, e] of Object.entries(byRule).sort((a, b) => b[1].reviews - a[1].reviews)) console.log(pad(code, 28) + pad(e.severity, 18) + e.reviews);
console.log(`\nClaim disputes (none is a confirmed defect): ${disputes.length} findings`);
console.log(`  definitive match on an anchored list (hold-eligible on a NEW review) ... ${disputeBuckets.definitiveMatch.length}`);
console.log(`  leads queued for a person (analysis text disputes the tick) ............. ${disputeBuckets.leadQueued.length}`);
console.log(`  qualified relations noted only (no queue) ............................... ${disputeBuckets.leadNotedOnly.length}`);
for (const d of disputeBuckets.leadQueued) console.log(`    ${pad(d.r.verdict.tierLabel, 16)}${d.r.slug.slice(0, 56)} [${d.f.subject}]`);
console.log(`  of the queued leads, on a Good Standing review (endorsement at stake) ... ${policyPreview.goodStandingWithUnresolvedDispute.length}`);
console.log("\nStandings:", JSON.stringify(report.standings));
console.log("Ingredient list sources:", JSON.stringify(report.inciSources));
const topSources = Object.entries(modelReportedSources).sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log(`Model-reported lists, top self-stated sources (free text, unverified; full list in the report): ${JSON.stringify(Object.fromEntries(topSources))}`);
console.log(`\nAnchored (a quote was captured; not a claim the formula is true): ${anchoring.reviewsAnchored} of ${reviews.length} reviews`);
console.log(`  Good Standing anchored ......... ${anchoring.goodStandingAnchored} of ${goodStanding.length}`);
console.log(`  Good Standing NOT anchored ..... ${anchoring.goodStandingNotAnchored}   by source: ${JSON.stringify(anchoring.goodStandingNotAnchoredBySource)}`);
console.log(`\nWhat the policies would touch (of ${goodStanding.length} Good Standing reviews):`);
console.log(`  no ingredient list at all ....... ${policyPreview.goodStandingWithNoIngredientList.length}`);
console.log(`  rubric catch-all entry present .. ${policyPreview.goodStandingWithRubricCatchAll.length}`);
console.log(`  by ingredient source: ${JSON.stringify(policyPreview.goodStandingByInciSource)}`);
console.log(`\nIdentity: ${pairs} same-brand pairs compared`);
console.log(`  PROBABLE_DUPLICATE ..... ${probable.length}   (a lead: never serves another product's review, never merged on a dry run)`);
console.log(`  CONFLICT_QUARANTINE .... ${quarantine.length}   (${liveWouldServeOther} of these the live isSameProduct would treat as one product)`);
console.log(`\nFull report: ${OUT}`);
