/* A page must not tick what its own words dispute.

   The At a glance ticks ("Fragrance free", "Alcohol free", "Paraben free") are worked out by code from the ingredient list we hold. The summary, the biggest
   concern and the fit lists are written by the model, which can have read a different list. When the model's text says a claim is contradicted ("The
   'fragrance-free' claim is directly contradicted by the INCI") and the code would tick that same claim, the page says both. Seen live on 2026-11-04:
   Garnier Skin Naturals Micellar Oil-Infused Cleansing Water ticked Fragrance free under a summary calling its fragrance-free claim misleading.

   The rule: such a tick is not drawn, on any surface that draws ticks (product page and its FAQ, listing cards, compare, the older scorecard page). It is not
   turned into a cross either, because the cross would rest on the model's reading alone. The text stays as written. Detection is the review verifier's own
   (`proseDisputedClaims`: a quoted claim next to "contradict…", with its bound-negation rule), so the page and the verifier agree on what counts as disputed.
   Applied every time a page is drawn: a stored analysis is right the moment this rule is, with no re-run. */

import { proseDisputedClaims, reviewAnalysisTexts } from "@/lib/review-verifier";
import { claimKey } from "@/lib/claim-ontology";
import type { ProductReview } from "@/lib/product-review-types";

/** Every model-written text the page can show that may say a claim is contradicted: the verifier's analysis texts plus the fit lists ("Who it suits",
    "Who should be careful") and the sensitivity line. */
function pageTexts(review: ProductReview): string[] {
  const fit = review.consumerSuitability;
  const texts: unknown[] = [
    ...reviewAnalysisTexts(review),
    ...(Array.isArray(fit?.avoidIf) ? fit.avoidIf : []),
    ...(Array.isArray(fit?.bestFor) ? fit.bestFor : []),
    fit?.sensitivityRisk,
    review.verdict?.whoShouldBeCareful,
    review.verdict?.whoItMaySuit,
  ];
  return texts.filter((t): t is string => typeof t === "string" && t.trim().length > 0);
}

/* Words that name the same thing a tick names. A tick is "<thing> free" in the singular, and "fragrance" for perfume and parfum. */
const SAME_THING: [RegExp, string][] = [
  [/\b(?:perfumes?|parfums?|fragrances)\b/g, "fragrance"],
  [/\bparabens\b/g, "paraben"],
  [/\bsulfates\b/g, "sulfate"],
  [/\bsilicones\b/g, "silicone"],
  [/\balcohols\b/g, "alcohol"],
  [/\badded\s+/g, ""],
];

/** The "<thing> free" keys a disputed claim covers, however the label or the model worded it: "no alcohol, no perfume" covers "alcohol free" and
    "fragrance free"; "perfume free", "free from parabens" and "0% alcohol" likewise. A tick is withheld when its key is among them. Seen live on
    2026-11-04 after the Garnier re-run: its text disputed the marketplace claim 'no alcohol, no perfume' (the list holds Benzyl Alcohol and Parfum)
    while the page ticked Alcohol free. A shared "free" at the end covers the bare names before it ("sulphate and paraben free"). A part that
    names more than three words is not a "free" claim and gives nothing.

    A claim of two or more things can be disputed for one of them only: Scalpe Pro's text says 'Sulphate/Paraben Free' "is directly contradicted
    by the presence of Sodium Lauryl Ether Sulphate" and, next, that "'paraben free' is supported". Given the disputing sentence, such a claim
    covers only the things that sentence names outside the quote, or all of them when it says "both", "all", "each" or "neither". */
export function freeFromKeys(claim: string, sentence?: string): string[] {
  const fold = (s: string) => SAME_THING.reduce((x, [re, to]) => x.replace(re, to), s);
  const things = new Set<string>();
  const sharedFree = / free$/.test(claim);
  for (const raw of claim.split(/\s*(?:,|;|\/|&|\+|\band\b)\s*/)) {
    const part = fold(raw.trim());
    const thing = /^(?:no|zero|without|0%?)\s+(.+)$/.exec(part)?.[1] ?? /^free (?:from|of)\s+(.+)$/.exec(part)?.[1] ?? /^(.+?) free$/.exec(part)?.[1]
      ?? (sharedFree && part && !/\bfree\b/.test(part) ? part : undefined);
    if (thing && thing.split(" ").length <= 3) things.add(thing);
  }
  let covered = [...things];
  if (covered.length > 1 && sentence !== undefined) {
    const rest = fold(claimKey(sentence).split(claim).join(" "));
    if (!/\b(?:both|all|each|neither)\b/.test(rest)) covered = covered.filter((t) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(rest));
  }
  return covered.map((t) => `${t} free`).sort();
}

/** The claim keys this analysis's own text says are contradicted, with the "<thing> free" keys each covers (freeFromKeys), sorted. Empty when none.
    The surfaces test a tick against them with `isDisputedTick` (at-a-glance.ts, kept there so the page code does not pull in the verifier). */
export function disputedTicksOf(review: ProductReview): string[] {
  const keys = new Set<string>();
  for (const [claim, sentence] of proseDisputedClaims(pageTexts(review))) {
    keys.add(claim);
    for (const key of freeFromKeys(claim, sentence)) keys.add(key);
  }
  return [...keys].sort();
}
