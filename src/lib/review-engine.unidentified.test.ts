import { beforeEach, describe, expect, it, vi } from "vitest";

/* runDeepScan (the engine behind /api/analyze, which needs no sign-in) when the input does not establish which product it is about.

   It must register a verified product only when the input names one: a pasted ingredient list identifies no product, in
   whatever format it arrives, and a scorecard the model could only title with a placeholder identifies none either.
   The person who pasted it still gets their analysis. Every outside dependency is replaced. */
const h = vi.hoisted(() => ({ generate: vi.fn(), upsert: vi.fn<(...args: unknown[]) => Promise<void>>(async () => undefined) }));

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({}) }));
vi.mock("@/lib/gemini", async (orig) => ({ ...(await orig<typeof import("@/lib/gemini")>()), generateResilient: (...a: unknown[]) => h.generate(...a) }));
vi.mock("@/lib/verified-store", async (orig) => ({ ...(await orig<typeof import("@/lib/verified-store")>()), upsertVerifiedProduct: (...a: unknown[]) => h.upsert(...a) }));
vi.mock("@/lib/verdict-engine", async (orig) => ({
  ...(await orig<typeof import("@/lib/verdict-engine")>()),
  computeVerdict: () => ({ status: "verified", gates: [], standard: "test" }),
}));

import { runDeepScan } from "@/lib/review-engine";

const scorecard = (over: Record<string, unknown> = {}) => JSON.stringify({
  productName: "Cetaphil Gentle Skin Cleanser", brand: "Cetaphil", score: 90, scoreLabel: "Excellent", summary: "A gentle cleanser.",
  pillars: [{ name: "Full Ingredient Disclosure", score: 18, max: 20, note: "Full list." }],
  ...over,
});

const LIST = ["Aqua", "Glycerin", "Niacinamide", "Sodium Hyaluronate", "Panthenol", "Allantoin", "Phenoxyethanol"];

beforeEach(() => {
  h.generate.mockReset();
  h.upsert.mockClear();
});

describe("runDeepScan: what joins the verified registry", () => {
  it("registers a typed product name the model names", async () => {
    h.generate.mockResolvedValue(scorecard());
    const out = await runDeepScan("Cetaphil Gentle Skin Cleanser", null);
    expect(out.type).toBe("single");
    expect(h.upsert).toHaveBeenCalledTimes(1);
  });

  const pastes: Record<string, string> = {
    "commas": LIST.join(", "),
    "bullets": LIST.map((x) => `• ${x}`).join(" "),
    "pipes": LIST.join(" | "),
    "slashes": LIST.join(" / "),
    "full stops": `${LIST.join(". ")}.`,
    "plain spaces": LIST.join(" "),
    "four items": LIST.slice(0, 4).join(", "),
    "an Ingredients: label and four items": `Ingredients: ${LIST.slice(0, 4).join(", ")}`,
  };
  for (const [format, paste] of Object.entries(pastes)) {
    it(`returns the analysis but registers nothing for a pasted list with ${format}, even when the model gives it a name`, async () => {
      h.generate.mockResolvedValue(scorecard({ productName: "Glow Lab Hydrating Gel Cream", brand: "Glow Lab" }));
      const out = await runDeepScan(paste, null);
      expect(out.type).toBe("single");
      expect(h.upsert).not.toHaveBeenCalled();
    });
  }

  it.each([
    ["a name and brand that say it was not identified", { productName: "Not Identified Product", brand: "Not Identified (Based on provided INCI)" }],
    ["a placeholder name", { productName: "Unknown Formulation", brand: "Glow Lab" }],
    ["an unknown brand", { productName: "Glow Lab Night Cream", brand: "Unknown" }],
  ])("returns the analysis but registers nothing when the model gives %s", async (_label, over) => {
    h.generate.mockResolvedValue(scorecard(over));
    const out = await runDeepScan("night cream formula", null);
    expect(out.type).toBe("single");
    expect(h.upsert).not.toHaveBeenCalled();
  });
});
