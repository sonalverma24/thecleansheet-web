/* The 10-authority regulatory screen as a review page DISPLAYS it.

   One definition, used by the scorecard mapper (review-to-scorecard.ts) and by the pillar standing
   (pillar-standing.ts), so the standing and the page can never disagree about what the screen says.

   A screen the model wrote without an ingredient list holds "missing INCI" placeholders. Once the list is
   recovered (INCIDecoder, the brand page, the model's own reads), the screen is rebuilt from the ingredient
   database instead of serving those stale rows. With fewer than 3 ingredients there is nothing to rebuild
   from, so the model's screen is shown as it is. Moved verbatim from review-to-scorecard.ts; its test pins
   it against the original inline logic. */

import type { ProductReview } from "@/lib/product-review-types";
import type { GlobalScreen } from "@/data/brands/types";
import { buildGlobalScreen } from "@/lib/inci-enrich";
import { productScopeOf } from "@/lib/product-scope";

const STALE_RE = /missing inci|no inci\b|inci (?:not|un)available|not available.*inci/i;

function fromReview(rs: NonNullable<ProductReview["regulatoryScreen"]>): GlobalScreen {
  return {
    eu_1223_2009: rs.eu_1223_2009, india_cr_2020: rs.india_cr_2020, us_fda_21cfr: rs.us_fda_21cfr,
    korea_mfds: rs.korea_mfds, health_canada_hotlist: rs.health_canada_hotlist, canada_nhpid: rs.canada_nhpid,
    tga_australia: rs.tga_australia, aicis_australia: rs.aicis_australia, echa_svhc: rs.echa_svhc, iarc: rs.iarc,
  };
}

export function globalScreenFor(review: Pick<ProductReview, "regulatoryScreen"> & Partial<Pick<ProductReview, "productName" | "category">>, inci: string[]): GlobalScreen | undefined {
  const rs = review.regulatoryScreen;
  const stale = !rs || Object.values(rs).some((v) => STALE_RE.test(String(v)));
  if (rs && !stale) return fromReview(rs);
  if (inci.length >= 3) return buildGlobalScreen(inci, review.productName ? productScopeOf(review.productName, review.category ?? "") : undefined);
  return rs ? fromReview(rs) : undefined;
}
