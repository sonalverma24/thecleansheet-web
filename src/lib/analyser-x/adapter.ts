/* ────────────────────────────────────────────────────────────────
   Analyser vX · the v3.0 adapter (strangler)

   Turns a stored v3.0 ProductReview into facts, so the new decision can run over
   every existing analysis without calling a model. This is the shadow-mode path:
   decide on the old data, compare with the old tier, sign the preview.

   What a legacy row cannot supply is marked as such. Its claims have model-set
   evidence levels (levelOrigin "model"). Its corroboration flag is whatever the old
   engine recorded; unknown means "never checked", and a block needs it to be true.
──────────────────────────────────────────────────────────────── */

import { reviewInciList } from "@/lib/review-inci";
import { evidenceForReview } from "@/lib/review-verifier";
import type { ProductReview } from "@/lib/product-review-types";
import { FactStore } from "./factstore";
import { buildContext } from "./context";
import { claimFlags } from "./claimflags";
import { computeScreen } from "./screen";
import { buildProfile } from "./profile";
import { listLooksSane } from "./verifier";
import { computeBenchmark } from "./regulatory";
import { decide, type DecideOutput } from "./decision";
import type { AcquisitionValue, ClaimValue, ListSource, ListValue, RuleContext, Trust } from "./types";

function sourceOf(url: string | undefined, trust: Trust, hasList: boolean): ListSource {
  if (!hasList) return "none";
  if (url && /incidecoder\.com/i.test(url)) return "incidecoder";
  if (trust >= 5) return "pack";
  if (trust === 4) return "brand_page";
  if (trust === 2) return "retailer";
  return "model";
}

const clampPts = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(15, v)) : null);

/** What a legacy row cannot know, supplied by a test or by a live run. */
export interface AdapterOverrides {
  acquisition?: Partial<AcquisitionValue>;
  rxText?: boolean;
  identityFromTextOnly?: boolean;
}

export function factsFromReview(review: ProductReview, now: string, over: AdapterOverrides = {}): FactStore {
  const store = new FactStore();
  const subject = review.productSlug ?? `${review.brand}-${review.productName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const inci = reviewInciList(review);
  const ev = evidenceForReview(review);
  const trust: Trust = inci.length >= 1 ? (ev.captureTrust as Trust) : 0;

  const listValue: ListValue = {
    ingredients: inci,
    source: sourceOf(ev.sourceUrl || undefined, trust, inci.length > 0),
    url: ev.sourceUrl || undefined,
    quote: ev.quote || undefined,
    capturedAt: ev.retrievedAt ?? review.reviewedAt,
    sane: listLooksSane(inci),
  };
  const listFact = inci.length
    ? store.add({ predicate: "inci.list", subject, value: listValue as unknown as Record<string, unknown>, trust, origin: trust <= 1 ? "model" : "source", spans: [], derivedFrom: [] })
    : undefined;

  const claimValues: ClaimValue[] = (review.claimMap ?? []).map((c) => ({
    text: c.text,
    platforms: [c.source],
    types: c.types ?? [c.primaryType],
    primaryType: c.primaryType,
    emotional: c.primaryType === "emotional",
    drugBoundary: c.drugBoundaryRisk === true,
    asciConcern: c.asciConcern === true,
    corroborated: c.corroborated,
    evidenceLevel: typeof c.evidenceLevel === "number" ? c.evidenceLevel : 1,
    levelOrigin: "model",
  }));
  for (const v of claimValues) {
    store.add({ predicate: "claim", subject, value: v as unknown as Record<string, unknown>, trust: 2, origin: "model", spans: [], derivedFrom: [] });
  }

  const acq: AcquisitionValue = {
    pageFetched: null,
    grounded: review.researchLog ? review.researchLog.grounded : null,
    inciSource: listValue.source,
    errors: [],
    claimsSourceRead: null,
    ...over.acquisition,
  };
  store.add({ predicate: "acquisition", subject, value: acq as unknown as Record<string, unknown>, trust: 5, origin: "derived", spans: [], derivedFrom: [] });

  const profile = buildProfile({
    name: review.productName, brand: review.brand, category: review.category ?? "", targetUser: review.targetUser ?? "",
    formulaPoints: clampPts(review.scores?.formulaLogic), overreach: review.formulaLogic?.claimOverreach === true,
    analysedAt: review.reviewedAt ?? now, identityFromTextOnly: over.identityFromTextOnly === true,
  });
  store.add({ predicate: "profile", subject, value: profile as unknown as Record<string, unknown>, trust: 5, origin: "derived", spans: [], derivedFrom: [] });

  if (over.rxText) store.add({ predicate: "page.signal", subject, value: { rxText: true }, trust: 4, origin: "source", spans: [], derivedFrom: [] });

  if (inci.length) {
    const screen = computeScreen(review, inci, claimFlags(claimValues, inci));
    store.add({ predicate: "screen", subject, value: screen as unknown as Record<string, unknown>, trust: 5, origin: "derived", spans: [], derivedFrom: listFact ? [listFact.id] : [] });
    store.add({ predicate: "benchmark", subject, value: computeBenchmark(inci, review.productName, undefined, screen.prohibited) as unknown as Record<string, unknown>, trust: 5, origin: "derived", spans: [], derivedFrom: listFact ? [listFact.id] : [] });
  }
  return store;
}

export type ReviewDecision = DecideOutput & { ctx: RuleContext };

/** Decide on a stored v3.0 analysis. No network, no model. */
export function decideReview(review: ProductReview, now: string = new Date().toISOString(), over: AdapterOverrides = {}): ReviewDecision {
  const ctx = buildContext(factsFromReview(review, now, over), now);
  return { ...decide(ctx), ctx };
}
