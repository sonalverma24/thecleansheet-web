import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildAnalyserReference } from "@/lib/analyser-reference";

/* ANALYSER-REFERENCE.md is generated from the code. When this test fails, the code changed and the file did not:
   run `npm run docs:analyser` and commit the result. */
describe("ANALYSER-REFERENCE.md", () => {
  const root = process.cwd();
  const generated = buildAnalyserReference(root);

  it("is up to date with the code (run `npm run docs:analyser` if this fails)", () => {
    const committed = readFileSync(join(root, "ANALYSER-REFERENCE.md"), "utf8");
    expect(committed).toBe(generated);
  });

  it("states the things another reader needs: versions, every flag, every decision, the prompt and the decision log", () => {
    expect(generated).toMatch(/Rubric revision \| r\d+/);
    for (const env of ["ANALYSER_PILLAR_STANDING", "ANALYSER_PILLS_PAGE"]) expect(generated).toContain(env);
    for (const key of ["good-choice", "buy-with-caution", "look-elsewhere", "not-enough-info", "medicinal-product"]) expect(generated).toContain(key);
    expect(generated).toContain("gap.acquisition");
    expect(generated).toContain("Precedence is fixed");
    expect(generated).toContain("support.claims_proportionate");
    expect(generated).toContain("## 9. Decision log");
  });

  it("holds no counts, dates of generation or commit hashes, so it only changes when the code does", () => {
    expect(generated).not.toMatch(/\b[0-9a-f]{40}\b/);
    expect(generated).not.toMatch(/generated (on|at) /i);
  });

  it("is the same every time it is built", () => {
    expect(buildAnalyserReference(root)).toBe(generated);
  });
});
