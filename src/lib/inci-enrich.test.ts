import { describe, expect, it } from "vitest";
import { buildGlobalScreen, restricted } from "@/lib/inci-enrich";

describe("restricted() - negation handling (Regulatory screen / 10-authority check)", () => {
  it("does not flag a status that negates 'restricted' and 'prohibited' in the same clause", () => {
    expect(restricted("Permitted; listed in EU CosIng; not restricted or prohibited")).toBe(false);
  });

  it("does not flag the common Canada NHPID negated phrasing", () => {
    expect(restricted("Not specifically listed as restricted cosmetic ingredient in NHPID source checked; standard Health Canada cosmetic notification applies")).toBe(false);
  });

  it("does not flag the common Korea MFDS negated phrasing", () => {
    expect(restricted("Not listed as restricted or prohibited by MFDS; permitted cosmetic ingredient")).toBe(false);
  });

  it("does not flag the common US FDA negated phrasing", () => {
    expect(restricted("Permitted cosmetic ingredient; not listed as prohibited or restricted in 21 CFR")).toBe(false);
  });

  it("still flags a genuinely restricted preservative even though 'permitted' also appears", () => {
    expect(restricted("Restricted preservative - permitted only in specific products at low levels (EU Annex V)")).toBe(true);
  });

  it("still flags an explicit EU Annex II prohibition", () => {
    expect(restricted("Prohibited in cosmetics (EU Annex II); permitted only as a regulated drug for skin lightening.")).toBe(true);
  });

  it("still flags an explicit 'not permitted for' restriction", () => {
    expect(restricted("Not permitted for use in leave-on facial products above 2%")).toBe(true);
  });
});

describe("buildGlobalScreen - real-world regression (Moxie Beauty Deep Dive Hair Mask)", () => {
  it("Tripeptide-1 reads clear across every authority, not flagged as restricted/prohibited", () => {
    const screen = buildGlobalScreen(["Tripeptide-1"]);
    expect(screen.eu_1223_2009).not.toContain("Tripeptide-1");
    expect(screen.india_cr_2020).not.toContain("Tripeptide-1");
    expect(screen.us_fda_21cfr).not.toContain("Tripeptide-1");
    expect(screen.korea_mfds).not.toContain("Tripeptide-1");
  });
});
