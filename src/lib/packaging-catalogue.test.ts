import { describe, expect, it } from "vitest";
import { PACKAGING_CATALOGUE } from "@/data/packaging";
import { ASSESSMENT_DIMENSIONS, EVIDENCE_TYPES, PUBLIC_SCORES_ENABLED } from "@/data/packaging/assessment";
import { PACKAGING_FAMILIES, PRODUCT_USES } from "@/data/packaging/families";
import type {
  PackagingCatalogue, PackagingProduct, Supplier, SupplierOffering, VerificationRecord,
} from "@/data/packaging/types";
import {
  evidenceCoverage, familyCoverage, isFamilyIndexable, pilotProgress, validateCatalogue,
  verificationSummary,
} from "@/lib/packaging-catalogue";
import { EMPTY_QUERY, QUANTITY_BANDS, buildShortlist, moqFit } from "@/lib/packaging-shortlist";

/* ── Fixtures: obviously fake, used only inside tests, never shipped ── */

const supplier = (id: string, over: Partial<Supplier> = {}): Supplier => ({
  id, slug: id, name: `Test ${id}`, businessType: "manufacturer", city: "Testville", state: "Testland",
  credentials: [], listedOn: "2026-01-01", ...over,
});

const product = (id: string, familyId: string, over: Partial<PackagingProduct> = {}): PackagingProduct => ({
  id, familyId, name: id, material: "glass", containerStyle: "round", closure: "dropper", ...over,
});

const offering = (id: string, supplierId: string, productId: string, over: Partial<SupplierOffering> = {}): SupplierOffering => ({
  id, supplierId, productId, moqPieces: 100, moqScope: "complete-assembly", branding: ["plain-stock"],
  stock: "ex-stock", samples: "on-request", repeatSupplyConfirmed: null, ...over,
});

const verification = (id: string, supplierId: string, over: Partial<VerificationRecord> = {}): VerificationRecord => ({
  id, supplierId, evidence: "material-identification", source: "supplier-provided", outcome: "confirmed",
  checkedOn: "2026-02-01", scope: "Test scope", limitations: "Test limits", reviewer: "Test reviewer", ...over,
});

const catalogue = (over: Partial<PackagingCatalogue> = {}): PackagingCatalogue => ({
  families: PACKAGING_FAMILIES, suppliers: [], products: [], offerings: [], verifications: [], ...over,
});

/* ── The shipped catalogue ───────────────────────────────── */

describe("shipped packaging catalogue", () => {
  it("has no integrity problems", () => {
    expect(validateCatalogue(PACKAGING_CATALOGUE)).toEqual([]);
  });

  it("holds the 20 pilot families in pilot order", () => {
    expect(PACKAGING_FAMILIES).toHaveLength(20);
    expect(PACKAGING_FAMILIES.map((f) => f.order)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(PACKAGING_FAMILIES[0].name).toBe("Glass dropper bottles");
    expect(PACKAGING_FAMILIES[19].name).toBe("Waterproof labels");
  });

  it("lets a founder reach a family from every product type", () => {
    for (const use of PRODUCT_USES) {
      const hits = buildShortlist(PACKAGING_CATALOGUE, { ...EMPTY_QUERY, use: use.id });
      expect(hits.length, `no family for ${use.id}`).toBeGreaterThan(0);
    }
  });

  it("never uses an em dash in catalogue text", () => {
    expect(JSON.stringify(PACKAGING_CATALOGUE)).not.toContain("\u2014");
  });
});

describe("assessment model", () => {
  it("has five dimensions weighted to 100", () => {
    expect(ASSESSMENT_DIMENSIONS).toHaveLength(5);
    expect(ASSESSMENT_DIMENSIONS.reduce((n, d) => n + d.weight, 0)).toBe(100);
  });

  it("maps every evidence type to a real dimension", () => {
    const ids = new Set(ASSESSMENT_DIMENSIONS.map((d) => d.id));
    for (const [type, meta] of Object.entries(EVIDENCE_TYPES)) {
      expect(ids.has(meta.dimension), `${type} -> ${meta.dimension}`).toBe(true);
    }
  });

  it("keeps public scores off", () => {
    expect(PUBLIC_SCORES_ENABLED).toBe(false);
  });
});

/* ── Coverage ────────────────────────────────────────────── */

describe("coverage", () => {
  const fam = "glass-dropper-bottles";
  const build = (n: number) => catalogue({
    suppliers: Array.from({ length: n }, (_, i) => supplier(`s${i}`)),
    products: [product("p1", fam)],
    offerings: Array.from({ length: n }, (_, i) => offering(`o${i}`, `s${i}`, "p1")),
  });

  it("marks none, single source, limited and covered honestly", () => {
    expect(familyCoverage(build(0), fam).level).toBe("none");
    expect(familyCoverage(build(1), fam).level).toBe("single-source");
    expect(familyCoverage(build(2), fam).level).toBe("limited");
    expect(familyCoverage(build(3), fam).level).toBe("covered");
  });

  it("counts a supplier once however many variants it offers", () => {
    const cat = catalogue({
      suppliers: [supplier("s1")],
      products: [product("p1", fam), product("p2", fam), product("p3", fam)],
      offerings: [offering("o1", "s1", "p1"), offering("o2", "s1", "p2"), offering("o3", "s1", "p3")],
    });
    expect(familyCoverage(cat, fam)).toMatchObject({ supplierCount: 1, variantCount: 3, level: "single-source" });
  });

  it("reports pilot progress and only indexes families that have suppliers", () => {
    expect(pilotProgress(catalogue())).toMatchObject({ families: 20, familiesWithSupplier: 0, variants: 0, suppliers: 0 });
    const cat = build(1);
    expect(pilotProgress(cat)).toMatchObject({ familiesWithSupplier: 1, familiesCovered: 0, variants: 1, suppliers: 1 });
    expect(isFamilyIndexable(cat, fam)).toBe(true);
    expect(isFamilyIndexable(cat, "waterproof-labels")).toBe(false);
  });
});

/* ── Verification ────────────────────────────────────────── */

describe("verification summary", () => {
  it("says a supplier is unverified when no evidence is on file", () => {
    expect(verificationSummary(catalogue({ suppliers: [supplier("s1")] }), "s1")).toBe("Listed, not yet verified");
  });

  it("groups evidence by dimension without producing a score", () => {
    const cat = catalogue({
      suppliers: [supplier("s1")],
      verifications: [
        verification("v1", "s1", { evidence: "technical-drawing" }),
        verification("v2", "s1", { evidence: "certificate", outcome: "not-provided" }),
      ],
    });
    const cov = evidenceCoverage(cat, "s1");
    expect(cov.find((d) => d.dimension === "specifications")).toMatchObject({ supportive: 1 });
    expect(cov.find((d) => d.dimension === "quality")).toMatchObject({ supportive: 0 });
    expect(cov.find((d) => d.dimension === "quality")?.records).toHaveLength(1);
    expect(verificationSummary(cat, "s1")).toBe("2 evidence items checked across 2 of 5 areas");
  });
});

/* ── Integrity checks ────────────────────────────────────── */

describe("validateCatalogue", () => {
  it("accepts a sound catalogue", () => {
    const cat = catalogue({
      suppliers: [supplier("s1")],
      products: [product("p1", "glass-dropper-bottles")],
      offerings: [offering("o1", "s1", "p1")],
      verifications: [verification("v1", "s1", { offeringId: "o1" })],
    });
    expect(validateCatalogue(cat)).toEqual([]);
  });

  it("rejects dangling references", () => {
    const cat = catalogue({
      products: [product("p1", "no-such-family")],
      offerings: [offering("o1", "ghost", "ghost-product")],
      verifications: [verification("v1", "ghost")],
    });
    const out = validateCatalogue(cat).join("\n");
    expect(out).toContain("unknown family no-such-family");
    expect(out).toContain("unknown supplier ghost");
    expect(out).toContain("unknown product ghost-product");
  });

  it("will not store an MOQ without saying what it covers", () => {
    const cat = catalogue({
      suppliers: [supplier("s1")],
      products: [product("p1", "glass-dropper-bottles"), product("p2", "glass-dropper-bottles")],
      offerings: [
        offering("o1", "s1", "p1", { moqPieces: 500, moqScope: "unconfirmed" }),
        offering("o2", "s1", "p2", { moqPieces: null, moqScope: "complete-assembly" }),
      ],
    });
    const out = validateCatalogue(cat).join("\n");
    expect(out).toContain("o1: MOQ given without saying what it covers");
    expect(out).toContain("o2: no MOQ but a scope is claimed");
  });

  it("requires limitations and a reviewer on every verification record", () => {
    const cat = catalogue({
      suppliers: [supplier("s1")],
      verifications: [verification("v1", "s1", { limitations: " ", reviewer: "" })],
    });
    const out = validateCatalogue(cat).join("\n");
    expect(out).toContain("limitations is empty");
    expect(out).toContain("reviewer is empty");
  });

  it("will not mark a credential verified without a confirmed certificate record", () => {
    const cat = catalogue({ suppliers: [supplier("s1", { credentials: [{ kind: "iso-9001", verified: true }] })] });
    expect(validateCatalogue(cat).join("\n")).toContain("credential iso-9001 is marked verified");
    const ok = catalogue({
      suppliers: [supplier("s1", { credentials: [{ kind: "iso-9001", verified: true }] })],
      verifications: [verification("v1", "s1", { evidence: "certificate" })],
    });
    expect(validateCatalogue(ok)).toEqual([]);
  });

  it("rejects an offering attached to another supplier's verification", () => {
    const cat = catalogue({
      suppliers: [supplier("s1"), supplier("s2")],
      products: [product("p1", "glass-dropper-bottles")],
      offerings: [offering("o1", "s1", "p1")],
      verifications: [verification("v1", "s2", { offeringId: "o1" })],
    });
    expect(validateCatalogue(cat).join("\n")).toContain("offering belongs to a different supplier");
  });

  it("rejects bad dates and prices", () => {
    const cat = catalogue({
      suppliers: [supplier("s1", { listedOn: "yesterday" })],
      products: [product("p1", "glass-dropper-bottles")],
      offerings: [offering("o1", "s1", "p1", { price: { perPieceInr: { min: 10, max: 5 }, atQuantity: 100, quotedOn: "15/10/2026", gstIncluded: false } })],
    });
    const out = validateCatalogue(cat).join("\n");
    expect(out).toContain("listedOn is not an ISO date");
    expect(out).toContain("price max below min");
    expect(out).toContain("price needs an ISO quotedOn date");
  });
});

/* ── Sourcing shortlist ──────────────────────────────────── */

describe("moqFit", () => {
  const band = (id: string) => QUANTITY_BANDS.find((b) => b.id === id)!;

  it("compares the MOQ against the founder's quantity band", () => {
    expect(moqFit(100, band("100-499"))).toBe("within");
    expect(moqFit(300, band("100-499"))).toBe("stretch");
    expect(moqFit(500, band("100-499"))).toBe("over");
    expect(moqFit(5000, band("1000+"))).toBe("stretch");
    expect(moqFit(1000, band("1000+"))).toBe("within");
  });

  it("never treats an unconfirmed MOQ as a match", () => {
    expect(moqFit(null, band("1-49"))).toBe("confirm");
    expect(moqFit(null, null)).toBe("confirm");
  });
});

describe("buildShortlist", () => {
  const fam = "glass-dropper-bottles";
  const cat = catalogue({
    suppliers: [supplier("s1"), supplier("s2"), supplier("s3")],
    products: [
      product("glass", fam, { material: "glass" }),
      product("plastic", "airless-serum-pumps", { material: "plastic" }),
    ],
    offerings: [
      offering("small", "s1", "glass", { moqPieces: 50, branding: ["plain-stock", "label-ready"] }),
      offering("big", "s2", "glass", { moqPieces: 1000, branding: ["plain-stock"] }),
      offering("unknown", "s3", "glass", { moqPieces: null, moqScope: "unconfirmed", branding: ["plain-stock"] }),
      offering("airless", "s1", "plastic", { moqPieces: 100 }),
    ],
  });
  const find = (results: ReturnType<typeof buildShortlist>, id: string) => results.find((r) => r.family.id === id)!;

  it("matches only families that suit the product", () => {
    const ids = buildShortlist(cat, { ...EMPTY_QUERY, use: "serum" }).map((r) => r.family.id);
    expect(ids).toContain("glass-dropper-bottles");
    expect(ids).toContain("airless-serum-pumps");
    expect(ids).not.toContain("lipstick-cases");
  });

  it("always includes cartons and labels, which fit any product", () => {
    const ids = buildShortlist(cat, { ...EMPTY_QUERY, use: "mascara" }).map((r) => r.family.id);
    expect(ids).toContain("cosmetic-cartons");
    expect(ids).toContain("waterproof-labels");
  });

  it("keeps MOQs above the quantity band out of matches and counts them", () => {
    const r = find(buildShortlist(cat, { ...EMPTY_QUERY, use: "serum", band: "50-99" }), fam);
    expect(r.matches.map((m) => m.row.offering.id)).toEqual(["small"]);
    expect(r.overQuantity).toBe(1);
  });

  it("puts unconfirmed MOQs in their own group", () => {
    const r = find(buildShortlist(cat, { ...EMPTY_QUERY, use: "serum", band: "100-499" }), fam);
    expect(r.matches.map((m) => m.row.offering.id)).toEqual(["small"]);
    expect(r.toConfirm.map((m) => m.row.offering.id)).toEqual(["unknown"]);
    expect(r.overQuantity).toBe(1);
  });

  it("filters by material and branding", () => {
    const glassOnly = buildShortlist(cat, { ...EMPTY_QUERY, use: "serum", material: "glass" }).map((r) => r.family.id);
    expect(glassOnly).toContain(fam);
    expect(glassOnly).not.toContain("airless-serum-pumps");
    const labelled = find(buildShortlist(cat, { ...EMPTY_QUERY, use: "serum", branding: "label-ready" }), fam);
    expect(labelled.matches.map((m) => m.row.offering.id)).toEqual(["small"]);
  });

  it("ranks families with suppliers ahead of empty ones", () => {
    const results = buildShortlist(cat, { ...EMPTY_QUERY, use: "serum" });
    expect(results[0].family.id).toBe(fam);
    expect(find(results, "roll-on-bottles").matches).toHaveLength(0);
  });

  it("returns every family for an empty query", () => {
    expect(buildShortlist(cat, EMPTY_QUERY)).toHaveLength(20);
  });
});
