/* A stored review as the pills page needs it: the scorecard product, the brand and the page model. Pure. */

import type { DerivedVerdict, ProductReview } from "@/lib/product-review-types";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { buildPillsPage, type PillTone, type StandingView } from "@/lib/pills-page";
import { decideReview, type DecisionKey } from "@/lib/analyser-x";
import { TIER_STYLES } from "@/components/scorecards/pillar-ui";

/** Today's standing as the layout-only mode shows it: the old label, the tone of its colour, and whether it is a stored Licensed Drug. */
export function standingViewOf(tier: DerivedVerdict["tier"]): StandingView {
  const tone: PillTone = tier === "approved" || tier === "mostly-clean" ? "good" : tier === "can-do-better" ? "caution" : tier === "not-recommended" ? "look" : "med";
  return { label: TIER_STYLES[tier].label, tone, medicine: tier === "not-assessed" };
}

/** The page model for a stored review. With `standing`, the page is the same but its take card shows today's standing (ANALYSER_NEW_LAYOUT). */
export function pillsFor(review: ProductReview, verdict: DerivedVerdict, now: string = new Date().toISOString(), standing?: StandingView) {
  const mapped = reviewToScorecard(review, verdict);
  return { ...mapped, model: buildPillsPage(review, mapped.product, now, decideReview(review, now), standing) };
}

/** The layout-only view of a stored review: the new layout, today's standing. */
export const layoutFor = (review: ProductReview, verdict: DerivedVerdict, now?: string) => pillsFor(review, verdict, now, standingViewOf(verdict.tier));

/** The search-engine rating follows the visible pill, as the standing's did: Good choice 5, Buy with caution 3, Look elsewhere 1.5,
    and none for Not enough info and Medicinal product (a made-up number breaks structured-data rules). */
const RATING: Partial<Record<DecisionKey, number>> = { "good-choice": 5, "buy-with-caution": 3, "look-elsewhere": 1.5 };

export function pillRating(key: DecisionKey, label: string) {
  const ratingValue = RATING[key];
  return ratingValue === undefined ? null : { "@type": "Rating" as const, ratingValue, bestRating: 5, worstRating: 1, alternateName: label };
}

/** A Not enough info page is kept out of search while the cause is an unread page or an unreliable list. */
export const keepOutOfSearch = (key: DecisionKey): boolean => key === "not-enough-info";
