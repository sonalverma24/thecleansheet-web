/* " / " inside one ingredient cell: two ingredients, or one name written two ways?

   INCI lists use "/" in two different ways and a substring rule cannot tell them apart:
     - inside a single name with no spaces ("Cetyl PEG/PPG-10/1 Dimethicone"): never matched here;
     - between a name and its common name ("Zea Mays Starch / Corn Starch",
       "Aqua / Water"): a display convention, one ingredient;
     - between two genuinely different ingredients ("Sodium Lauroyl Sarcosinate /
       Sodium Laureth Sulfate"): a parsing slip that fused two entries.
   Decided by identity, not by punctuation: it is two ingredients only when EVERY half is
   a known INCI name in the ingredient database and the halves are not the same
   substance. A half the database does not know ("Corn Starch") makes it a display
   convention. Never split automatically: a person decides. The one known blind spot is
   two valid names for one substance that the database lists separately; that surfaces as
   a lead rather than being silently passed. */

import { lookupIngredient } from "@/lib/ingredient-db";
import { canonicalIngredientSlug } from "@/lib/ingredient-canonical";
import { toSlug } from "@/lib/ingredient-utils";

export interface SlashCell {
  kind: "two_ingredients" | "display_convention";
  halves: string[];
}

/* Each half is resolved to its curated profile row BEFORE comparing, so "Sweet Almond Oil"
   is compared as the profile it names ("Sweet Almond Oil (Prunus Amygdalus Dulcis Oil)"),
   not as the text it was written with. Two profiles are the same substance when they share
   a canonical slug (a reviewed merge in ingredient-canonical.ts, or the same row). */
export function classifySlashCell(raw: string): SlashCell | null {
  if (!/ \/ /.test(raw)) return null;
  const halves = raw.split(" / ").map((h) => h.trim()).filter(Boolean);
  if (halves.length < 2) return null;
  const rows = halves.map((h) => lookupIngredient(h));
  const allKnown = rows.every((r) => !!r);
  const slugs = new Set(rows.map((r) => (r ? canonicalIngredientSlug(toSlug(r.INCI_Name)) : "")));
  return { kind: allKnown && slugs.size > 1 ? "two_ingredients" : "display_convention", halves };
}
