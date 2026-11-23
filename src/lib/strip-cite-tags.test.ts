import { describe, expect, it } from "vitest";
import { stripCiteTags, stripCiteTagsFromText } from "./strip-cite-tags";

describe("stripCiteTags", () => {
  it("removes the markers seen on live analyses", () => {
    expect(stripCiteTagsFromText("and 'Improved skin barrier function'. [cite: REPORT_2]")).toBe("and 'Improved skin barrier function'.");
    expect(stripCiteTagsFromText("Listed on Amazon [cite: Amazon Product Page, 7].")).toBe("Listed on Amazon.");
    expect(stripCiteTagsFromText("A [cite: REPORT] B [cite: INCI provided] C")).toBe("A B C");
    expect(stripCiteTagsFromText("[cite_start]Hydrates skin.")).toBe("Hydrates skin.");
  });
  it("leaves other brackets and plain text alone", () => {
    const s = "Ceramide NP [1%] and (citric acid)";
    expect(stripCiteTagsFromText(s)).toBe(s);
  });
  it("cleans nested objects and keeps untouched ones identical", () => {
    const clean = { a: ["x"], n: 3 };
    const input = { review: { claims: [{ evidenceNote: "Backed by a lab test. [cite: REPORT_2]", level: 4 }] }, clean };
    const out = stripCiteTags(input);
    expect(out.review.claims[0].evidenceNote).toBe("Backed by a lab test.");
    expect(out.review.claims[0].level).toBe(4);
    expect(out.clean).toBe(clean);
    expect(stripCiteTags(clean)).toBe(clean);
  });
});
