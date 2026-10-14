import type { PitchVerification } from "./types";

/* Verification records, keyed by retailer product id. A product appears with the
   stamp ONLY if it has an entry here.

   Entries must come from a real assessment (source "engine"), generated from the
   stored review plus the baby lens. The three below are placeholders so the
   popup can be designed and tested: they are marked source "sample", which makes
   the dialog show a red warning banner. Replace them before any meeting. */

const sample = (details: string[], claim: string): PitchVerification => ({
  source: "sample",
  updated: "14 Oct 26",
  details,
  ingredients: {
    screened: 24,
    total: 24,
    checks: [
      { text: "No regulatory restrictions", note: "Screened against 10 regulatory frameworks" },
      { text: "Baby and pregnancy safe", note: "Assessed for the age stated on the label" },
      { text: "Fragrance-free" },
    ],
  },
  claims: {
    assessed: 3,
    supported: 3,
    checks: [
      { text: claim, note: "Supported by a finished-product study" },
      { text: "Gentle on sensitive skin", note: "Supported by a dermatological tolerance test" },
    ],
  },
  reviews: {
    indianMarketplaces: "Sample figure",
    globalMarketplaces: "Sample figure",
    communities: "Sample figure",
  },
});

export const VERIFICATIONS: Record<string, PitchVerification> = {
  "17889837": sample(["From birth", "Rinse-off", "Wash and shampoo"], "Hydration supported"),
  "181560": sample(["From birth", "Leave-on", "Face and body lotion"], "Barrier repair supported"),
  "278742": sample(["Infants and children", "Rinse-off", "Foaming gel"], "Soothing supported"),
};
