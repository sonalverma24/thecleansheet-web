import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SAMPLE_EXAMPLE_MEDICINAL, SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED, SAMPLE_EXAMPLE_SUNSCREEN, SAMPLE_MINIMALIST_B5 } from "@/data/analysis/sample-reviews";
import { ANALYSER_FLAGS } from "@/lib/analyser-flags";
import { pillsFor } from "@/lib/pills-for-review";
import type { ProductReview } from "@/lib/product-review-types";

/* listRepositoryCatalogueProducts with only the database replaced: the rows it reads are the fixtures. */
const h = vi.hoisted(() => {
  const state: { rows: unknown[] } = { rows: [] };
  const chain: unknown = new Proxy(function () {}, {
    get: (_t, prop) => (prop === "then" ? (resolve: (v: unknown) => void) => resolve({ data: state.rows, error: null }) : () => chain),
    apply: () => chain,
  });
  return { state, chain };
});
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => h.chain }));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

import { deriveVerdict, listRepositoryCatalogueProducts } from "@/lib/product-review-engine";

const REVIEWS: ProductReview[] = [SAMPLE_MINIMALIST_B5, SAMPLE_EXAMPLE_SUNSCREEN, SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED, SAMPLE_EXAMPLE_MEDICINAL];

beforeEach(() => {
  h.state.rows = REVIEWS.map((review, i) => ({ product_slug: `tile-fixture-${i}`, reviewed_at: "2026-10-20T00:00:00Z", result: { review, verdict: deriveVerdict(review) } }));
});
afterEach(() => vi.unstubAllEnvs());

describe("the tiles of the stored reviews", () => {
  it("flag off: a tile is exactly today's, with no pill and no ticks on it at all", async () => {
    vi.stubEnv(ANALYSER_FLAGS.pillsPage, "0");
    const tiles = await listRepositoryCatalogueProducts(10);
    expect(tiles).toHaveLength(REVIEWS.length);
    for (const t of tiles) {
      expect("pill" in t, t.productName).toBe(false);
      expect("glance" in t, t.productName).toBe(false);
    }
  });

  it("flag on: each tile also carries the pill and the ticks of its own page, and nothing else about it changes", async () => {
    vi.stubEnv(ANALYSER_FLAGS.pillsPage, "0");
    const off = await listRepositoryCatalogueProducts(10);
    vi.stubEnv(ANALYSER_FLAGS.pillsPage, "1");
    const on = await listRepositoryCatalogueProducts(10);
    expect(on).toHaveLength(off.length);
    on.forEach((tile, i) => {
      const { model } = pillsFor(REVIEWS[i], deriveVerdict(REVIEWS[i]));
      expect(tile.pill, tile.productName).toEqual({ key: model.pill.key, marker: model.pill.marker });
      expect(tile.glance, tile.productName).toEqual(model.highlights.map((x) => ({ label: x.label, state: x.state })));
      const rest = { ...tile };
      delete rest.pill;
      delete rest.glance;
      expect(rest, `${tile.productName} is otherwise today's tile`).toEqual(off[i]);
    });
  });

  it("flag on: a review that cannot be turned into a pill still gets its tile, with the standing as before", async () => {
    vi.stubEnv(ANALYSER_FLAGS.pillsPage, "1");
    const broken = { ...SAMPLE_MINIMALIST_B5, inciIngredients: null as unknown as string[] };
    h.state.rows = [{ product_slug: "tile-broken", reviewed_at: "2026-10-20T00:00:00Z", result: { review: broken, verdict: deriveVerdict(SAMPLE_MINIMALIST_B5) } }];
    const [tile] = await listRepositoryCatalogueProducts(10);
    expect(tile).toBeDefined();
    expect(tile.reviewTier).toBeDefined();
  });
});
