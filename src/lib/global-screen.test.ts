import { describe, expect, it } from "vitest";
import { globalScreenFor } from "@/lib/global-screen";
import { buildGlobalScreen } from "@/lib/inci-enrich";
import type { RegulatoryScreen } from "@/lib/product-review-types";

/* The helper was moved out of review-to-scorecard.ts. This is a copy of the ORIGINAL inline logic, so the
   move is proven to change nothing across every combination of screen and list. */
function legacy(rs: RegulatoryScreen | undefined, inci: string[]) {
  const pick = (r: RegulatoryScreen) => ({
    eu_1223_2009: r.eu_1223_2009, india_cr_2020: r.india_cr_2020, us_fda_21cfr: r.us_fda_21cfr,
    korea_mfds: r.korea_mfds, health_canada_hotlist: r.health_canada_hotlist, canada_nhpid: r.canada_nhpid,
    tga_australia: r.tga_australia, aicis_australia: r.aicis_australia, echa_svhc: r.echa_svhc, iarc: r.iarc,
  });
  const rsStale = !rs || Object.values(rs).some((v) => /missing inci|no inci\b|inci (?:not|un)available|not available.*inci/i.test(String(v)));
  return rs && !rsStale ? pick(rs) : inci.length >= 3 ? buildGlobalScreen(inci) : rs ? pick(rs) : undefined;
}

const screen = (over: Partial<RegulatoryScreen> = {}): RegulatoryScreen => ({
  eu_1223_2009: "No restriction", india_cr_2020: "No issues", us_fda_21cfr: "No concern", korea_mfds: "No concern",
  health_canada_hotlist: "Not listed", canada_nhpid: "Not applicable", tga_australia: "No concern",
  aicis_australia: "No concern", echa_svhc: "Not listed", iarc: "Not listed", ...over,
});
const LISTS: string[][] = [[], ["Aqua"], ["Aqua", "Glycerin", "Sodium Laureth Sulfate"], ["Aqua", "Glycerin", "Methylparaben", "Parfum", "Carbomer"]];
const SCREENS: (RegulatoryScreen | undefined)[] = [
  undefined,
  screen(),
  screen({ eu_1223_2009: "Restricted: max 0.5%" }),
  screen({ iarc: "not available: missing INCI" }),
  screen({ eu_1223_2009: "No INCI available" }),
];

describe("globalScreenFor", () => {
  it.each(SCREENS.flatMap((rs, i) => LISTS.map((l, j) => [i, j, rs, l] as const)))(
    "matches the original inline logic (screen %i, list %i)",
    (_i, _j, rs, inci) => {
      expect(globalScreenFor({ regulatoryScreen: rs }, inci)).toEqual(legacy(rs, inci));
    },
  );

  it("shows the model's screen when it was written with a list", () => {
    const rs = screen({ eu_1223_2009: "Restricted: max 0.5%" });
    expect(globalScreenFor({ regulatoryScreen: rs }, LISTS[3])?.eu_1223_2009).toBe("Restricted: max 0.5%");
  });

  it("rebuilds a stale 'missing INCI' screen from the ingredient database once a list is available", () => {
    const stale = screen({ iarc: "not available: missing INCI" });
    expect(globalScreenFor({ regulatoryScreen: stale }, LISTS[3])).toEqual(buildGlobalScreen(LISTS[3]));
  });

  it("has no screen when there is neither a screen nor a usable list", () => {
    expect(globalScreenFor({ regulatoryScreen: undefined }, ["Aqua"])).toBeUndefined();
  });
});
