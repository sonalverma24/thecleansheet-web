import { describe, expect, it } from "vitest";
import { auditReviewerRefs, type AuditedEntry, type ReviewerRecord } from "@/lib/reviewer-audit";
import { CLAIM_CLASSES, type OntologyEntry } from "@/data/ingredients/claim-ontology";

const entry = (over: Partial<OntologyEntry> = {}): AuditedEntry => ({
  classId: "paraben",
  entry: { form: "methylparaben", strength: "definitive", source: "CAS 64-17-5", reviewedAt: "2026-01-15", reviewRef: "TCS-P-014", ...over },
});
const rec = (over: Partial<ReviewerRecord> = {}): ReviewerRecord =>
  ({ ref: "TCS-P-014", name: "Private Person Name", credential: "Cosmetic chemist, PhD", active: true, ...over });

describe("auditReviewerRefs", () => {
  it("passes a definitive alias whose reference is an active, credentialed, non-owner reviewer", () => {
    expect(auditReviewerRefs([entry()], [rec()])).toEqual([]);
  });

  it("has nothing to audit when no alias declares a reference, and the shipped ontology declares none", () => {
    expect(auditReviewerRefs([entry({ reviewRef: undefined })], null)).toEqual([]);
    const shipped = CLAIM_CLASSES.flatMap((c) => c.entries.map((e) => ({ classId: c.id, entry: e })));
    expect(auditReviewerRefs(shipped, null)).toEqual([]);
  });

  it("ignores a qualified alias even if it carries a reference", () => {
    expect(auditReviewerRefs([entry({ strength: "qualified" })], [])).toEqual([]);
  });

  it.each([
    ["no register supplied", null, "NO_REGISTER"],
    ["a reference not in the register", [rec({ ref: "TCS-P-015" })], "UNKNOWN_REF"],
    ["an inactive reviewer", [rec({ active: false })], "INACTIVE"],
    ["the site owner", [rec({ isSiteOwner: true })], "SITE_OWNER"],
    ["no credential", [rec({ credential: "  " })], "NO_CREDENTIAL"],
    ["a duplicated reference", [rec(), rec()], "DUPLICATE_REF"],
  ] as const)("flags %s", (_label, register, code) => {
    expect(auditReviewerRefs([entry()], register as ReviewerRecord[] | null).map((p) => p.code)).toEqual([code]);
  });

  it("flags a name or placeholder used where a reference belongs", () => {
    expect(auditReviewerRefs([entry({ reviewRef: "Asha Rao" })], [rec()]).map((p) => p.code)).toEqual(["BAD_REF"]);
    expect(auditReviewerRefs([entry({ reviewRef: "qualified reviewer TBD" })], [rec()]).map((p) => p.code)).toEqual(["BAD_REF"]);
  });

  it("reports several problems for one reviewer", () => {
    const codes = auditReviewerRefs([entry()], [rec({ active: false, isSiteOwner: true, credential: "" })]).map((p) => p.code).sort();
    expect(codes).toEqual(["INACTIVE", "NO_CREDENTIAL", "SITE_OWNER"]);
  });

  it("never puts a name or a credential in its output", () => {
    const out = JSON.stringify(auditReviewerRefs([entry()], [rec({ active: false, isSiteOwner: true, credential: "" })]));
    expect(out).not.toContain("Private Person Name");
    expect(out).not.toContain("Cosmetic chemist");
  });
});
