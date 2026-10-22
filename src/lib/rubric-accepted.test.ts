import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ACCEPTED_RUBRIC_REVS, RUBRIC_REV, isAcceptedRubricRev } from "@/lib/product-review-engine";

describe("accepted rubric revisions", () => {
  it("always includes the current revision, so every row stamped with it is served", () => {
    expect(ACCEPTED_RUBRIC_REVS).toContain(RUBRIC_REV);
    expect(isAcceptedRubricRev(RUBRIC_REV)).toBe(true);
  });

  it("refuses a revision that is not listed, and anything that is not a string", () => {
    expect(isAcceptedRubricRev("r0-not-a-revision")).toBe(false);
    for (const bad of [undefined, null, 7, {}, ["r7"], ""]) expect(isAcceptedRubricRev(bad)).toBe(false);
  });

  it("is exact, not a prefix or substring match", () => {
    expect(isAcceptedRubricRev(`${RUBRIC_REV}x`)).toBe(false);
    expect(isAcceptedRubricRev(` ${RUBRIC_REV}`)).toBe(false);
  });

  /* The point of the list is that a revision change can be deployed before the backfill. That only holds
     while nothing compares a stored row's revision for equality with the current constant. */
  it("leaves no equality gate on a stored row's revision in the engine", () => {
    const src = readFileSync("src/lib/product-review-engine.ts", "utf8");
    expect(src).not.toMatch(/\.eq\(\s*"rubric_rev"/);
    expect(src).not.toMatch(/rubric_rev\s*===\s*RUBRIC_REV/);
  });
});
