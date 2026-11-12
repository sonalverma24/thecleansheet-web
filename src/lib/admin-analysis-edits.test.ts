import { describe, expect, it } from "vitest";
import { cleanEdits, withColour, withTextEdits } from "./admin-analysis-edits";
import type { PillsPageModel } from "./pills-page";
import type { ReviewDecision } from "./analyser-x/adapter";

const model = {
  decision: { key: "buy-with-caution", label: "Buy with caution", meaning: "", confidence: "medium", reasons: [] },
  take: { summary: "machine summary", recommendation: "rec", reason: "why", confidence: { level: "medium", label: "", sentence: "" }, notes: ["n1"] },
  fit: { suits: ["a"], careful: ["b"], india: "in", price: "₹100" },
  claimCheck: { oneLiner: "claims" },
  regulatoryCheck: { oneLiner: "reg", panel: null },
  gaps: ["g"],
  cheatCode: null,
} as unknown as PillsPageModel;

describe("admin analysis edits", () => {
  it("replaces only the edited lines", () => {
    const m = withTextEdits(model, { "take.summary": "admin summary", "fit.suits": ["x", "y"] });
    expect(m.take.summary).toBe("admin summary");
    expect(m.take.reason).toBe("why");
    expect(m.fit.suits).toEqual(["x", "y"]);
    expect(model.take.summary).toBe("machine summary");
  });

  it("never adds a cheat code the page does not show", () => {
    expect(withTextEdits(model, { "cheatCode.text": "tip" }).cheatCode).toBeNull();
  });

  it("swaps the colour with its label", () => {
    const out = { decision: { key: "buy-with-caution", label: "Buy with caution", meaning: "m" } } as unknown as ReviewDecision;
    const r = withColour(out, "good-choice");
    expect(r.decision.key).toBe("good-choice");
    expect(r.decision.label).toBe("Good choice");
    expect(withColour(out, undefined)).toBe(out);
  });

  it("rejects unknown colours and fields", () => {
    expect(cleanEdits({ colour: "purple" }).ok).toBe(false);
    expect(cleanEdits({ text: { "take.nope": "x" } }).ok).toBe(false);
    const ok = cleanEdits({ colour: "look-elsewhere", text: { gaps: [" a ", ""] } });
    expect(ok).toEqual({ ok: true, colour: "look-elsewhere", text: { gaps: ["a"] } });
  });
});

describe("admin edits on a real stored analysis", () => {
  it("reach the product page, its listing card and the colour marker", async () => {
    const { SAMPLE_MINIMALIST_B5 } = await import("@/data/analysis/sample-reviews");
    const { pillsFor } = await import("@/lib/pills-for-review");
    const { listingPill } = await import("@/lib/listing-pill");
    const { deriveVerdict } = await import("@/lib/product-review-engine");
    const before = pillsFor(SAMPLE_MINIMALIST_B5, deriveVerdict(SAMPLE_MINIMALIST_B5)).model;
    const target = before.pill.key === "look-elsewhere" ? "good-choice" : "look-elsewhere";
    const edited = { ...SAMPLE_MINIMALIST_B5, adminEdits: { colour: target, text: { "take.summary": "Admin wrote this." }, editedBy: "a@b.c", editedAt: "2026-11-04T00:00:00Z" } } as typeof SAMPLE_MINIMALIST_B5;
    const verdict = deriveVerdict(edited);
    const after = pillsFor(edited, verdict).model;
    expect(after.pill.key).toBe(target);
    expect(after.decision.key).toBe(target);
    expect(after.take.summary).toBe("Admin wrote this.");
    expect(after.take.reason).toBe(before.take.reason);
    expect(listingPill(edited, verdict)?.pill?.key).toBe(target);
  });
});
