import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (...a: unknown[]) => revalidatePath(...a) }));

import { refreshAfterNewAnalysis, targetsAfterNewAnalysis } from "./site-refresh";

beforeEach(() => revalidatePath.mockReset());

describe("what is refreshed when an analysis is saved", () => {
  it("covers every place that shows analyses: home, the lists, brand pages, ingredient pages, the product's page and the sitemap", () => {
    refreshAfterNewAnalysis("orimii-pure-mineral-watery-sunscreen-spf-50");
    const calls = revalidatePath.mock.calls.map((c) => c.join(" "));
    expect(calls).toEqual(expect.arrayContaining([
      "/", "/products", "/brands", "/sitemaps/reviews.xml",
      "/analysis/orimii-pure-mineral-watery-sunscreen-spf-50",
      "/brands/[brand] page", "/ingredients/[slug] page",
    ]));
  });

  it("refreshes the dynamic pages by pattern, never one call per ingredient", () => {
    expect(targetsAfterNewAnalysis("x").length).toBeLessThan(10);
  });

  it("never throws, and never skips the rest, when one refresh fails", () => {
    revalidatePath.mockImplementationOnce(() => { throw new Error("no static generation store"); });
    expect(() => refreshAfterNewAnalysis("x")).not.toThrow();
    expect(revalidatePath.mock.calls.length).toBe(targetsAfterNewAnalysis("x").length);
  });
});
