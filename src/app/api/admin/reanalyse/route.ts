/* Admin-only: re-analyse one stored product, optionally with an ingredient list the admin typed from the pack.
     POST { slug, list?, sourceUrl?, note?, publishAnyway? }
   The analysis runs fresh (the stored one is ignored) and nothing is saved by the engine. The result is checked the same way the batch re-run checks a
   replacement (scripts/approved-rerun-policy.ts); when it passes, or the admin chose to publish anyway, it replaces the product's own row, so the page
   keeps its address. The typed list is used only when no primary source (Decoder, the brand's page, Nykaa) gives one, and the page says it was owner-supplied. */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { deriveVerdict, invalidateReviewCache, runProductReview } from "@/lib/product-review-engine";
import { checkOwnerSupplied, ownerSuppliedPage, type OwnerSuppliedEntry } from "@/lib/owner-supplied-inci";
import { pillsFor } from "@/lib/pills-for-review";
import { TransientModelError } from "@/lib/gemini";
import { rerunQuery, validateReplacement, type RerunRow } from "../../../../../scripts/approved-rerun-policy";
import type { ProductReview } from "@/lib/product-review-types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** What each check failure means, in words an admin can act on. */
const PROBLEM_TEXT: Record<string, string> = {
  "unidentified-product": "The analysis could not tell which product this is.",
  "brand-changed": "The analysis came back for a different brand.",
  "product-identity-changed": "The analysis came back for a different product.",
  "primary-ingredient-source-missing": "No ingredient list from a source we accept was found (and your list was not used or not given).",
  "ingredient-source-not-primary": "The ingredient list came from a source we do not accept (not the brand's own site or Decoder).",
  "invalid-ingredient-list": "The ingredient list could not be read cleanly.",
  "implausible-ingredient-list": "The ingredient list does not look complete for this kind of product.",
  "ingredient-list-shorter": "The new ingredient list is much shorter than the one stored.",
  "web-search-missing": "The model answered without a web search, so its claims are not grounded.",
  "decision-lost": "The product had a colour before and would now be Grey (not enough info).",
};

const pillOf = (review: ProductReview) => {
  try { return pillsFor(review, deriveVerdict(review)).model.pill.key as string; } catch { return "not-enough-info"; }
};

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const body = (await req.json().catch(() => ({}))) as { slug?: unknown; list?: unknown; sourceUrl?: unknown; note?: unknown; publishAnyway?: unknown };
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const db = createAdminClient();
  const { data: row, error } = await db.from("product_reviews")
    .select("product_slug, product_name, brand, reviewed_at, result, rubric_rev, tier, image_url").eq("product_slug", slug).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const old = row as RerunRow | null;
  if (!old?.result?.review || old.result.type !== "product-review") return NextResponse.json({ error: "analysis not found" }, { status: 404 });
  const before = old.result.review;

  // The typed list, checked as strictly as an entry in src/data/inci/owner-supplied.ts.
  const listText = typeof body.list === "string" ? body.list.trim() : "";
  let entry: OwnerSuppliedEntry | null = null;
  if (listText) {
    entry = {
      brands: [before.brand],
      productNames: [before.productName],
      sourceUrl: typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "",
      quote: listText,
      suppliedOn: new Date().toISOString().slice(0, 10),
      note: typeof body.note === "string" && body.note.trim() ? `${body.note.trim()} (entered by ${auth.email})` : "",
    };
    const problems = checkOwnerSupplied(entry);
    if (problems.length) return NextResponse.json({ error: "The ingredient list cannot be used yet", listProblems: problems }, { status: 400 });
  }

  let result;
  try {
    result = await runProductReview(rerunQuery(old), { fresh: true, save: false, ...(entry ? { ownerList: ownerSuppliedPage(entry) } : {}) });
  } catch (e) {
    if (e instanceof TransientModelError) return NextResponse.json({ error: "The analysis model is busy. Nothing was changed; try again in a few minutes." }, { status: 503 });
    return NextResponse.json({ error: "The analysis failed. Nothing was changed." }, { status: 500 });
  }
  if (result.type !== "product-review") {
    return NextResponse.json({ error: `The analysis did not return a product (${result.type}). Nothing was changed.` }, { status: 422 });
  }

  const fresh: ProductReview = { ...result.review, productSlug: slug };
  // A pinned image stays pinned, as in the batch re-run.
  if (before.imageLocked && before.imageUrl) { fresh.imageUrl = before.imageUrl; fresh.imageSource = before.imageSource; fresh.imageLocked = true; }
  const oldPill = pillOf(before);
  const newPill = pillOf(fresh);
  const problems = validateReplacement(old, fresh, oldPill, newPill);
  const preview = {
    oldPill, newPill,
    ingredients: fresh.inciIngredients?.length ?? 0,
    listSource: fresh.inciEvidence?.origin ?? null,
    listSourceUrl: fresh.inciEvidence?.sourceUrl ?? null,
    usedYourList: fresh.inciEvidence?.origin === "owner-supplied",
    productName: fresh.productName,
  };
  const problemText = problems.map((p) => PROBLEM_TEXT[p] ?? p);
  if (problems.length && body.publishAnyway !== true) {
    return NextResponse.json({ published: false, problems: problemText, preview });
  }

  const verdict = deriveVerdict(fresh);
  const { error: upErr } = await db.from("product_reviews").update({
    product_name: fresh.productName,
    brand: fresh.brand,
    tier: verdict.tier,
    image_url: fresh.imageUrl ?? null,
    result: { type: "product-review", review: fresh, verdict },
    reviewed_at: fresh.reviewedAt ?? new Date().toISOString(),
  }).eq("product_slug", slug);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  invalidateReviewCache(slug);
  revalidatePath("/", "layout");
  return NextResponse.json({ published: true, problems: problemText, preview });
}
