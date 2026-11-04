import { describe, expect, it, vi } from "vitest";

/* Retracted rows stay in the table but are suppressed on every read path (see RETRACTED_SLUGS). Every outside dependency of the engine is replaced. */
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => new Proxy(function () {}, { get: (_t, p) => (p === "then" ? (r: (v: unknown) => void) => r({ data: null, error: null }) : () => new Proxy(function () {}, {})), apply: () => ({}) }) }));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

describe("RETRACTED_SLUGS", () => {
  it("retires the Be Minimalist 6% oat cleanser row as a duplicate (2026-11-04) and keeps the row under the brand's current name", async () => {
    const { RETRACTED_SLUGS } = await import("@/lib/product-review-engine");
    expect(RETRACTED_SLUGS.has("be-minimalist-minimalist-oat-extract-6-gentle-cleanser")).toBe(true);
    expect(RETRACTED_SLUGS.has("be-minimalist-minimalist-b12-oat-extract-6-5-gentle-cleanser")).toBe(false);
  });
});
