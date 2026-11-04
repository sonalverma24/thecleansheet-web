import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ row: vi.fn(), source: vi.fn(), process: vi.fn() }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => h.row() }) }) }) }),
}));
vi.mock("@/lib/tile-processing", () => ({ fetchTileSource: (...a: unknown[]) => h.source(...a), processTile: (...a: unknown[]) => h.process(...a) }));

import { GET } from "./route";

const call = (slug: string) => GET(new Request(`https://thecleansheet.in/api/tile/${slug}?v=abc`), { params: Promise.resolve({ slug }) });
const ORIGINAL = "https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/8/b/x.jpg";

beforeEach(() => {
  h.row.mockReset().mockResolvedValue({ data: { image_url: ORIGINAL }, error: null });
  h.source.mockReset().mockResolvedValue(Buffer.from("bytes"));
  h.process.mockReset().mockResolvedValue(Buffer.from("webp-bytes"));
});

describe("GET /api/tile/<slug>", () => {
  it("serves the cleaned-up picture of the stored address as a WebP, cacheable for a year", async () => {
    const res = await call("foxtale-brightening-moisturiser");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/webp");
    expect(res.headers.get("cache-control")).toContain("max-age=31536000");
    expect(Buffer.from(await res.arrayBuffer()).toString()).toBe("webp-bytes");
    expect(h.source).toHaveBeenCalledWith(ORIGINAL); // the address comes from the row, never from the request
  });

  it("refuses a slug that is not a slug, without touching the database or the network", async () => {
    for (const bad of ["Bad Slug", "../etc/passwd", "a".repeat(300), "-leading"]) expect((await call(bad)).status).toBe(404);
    expect(h.row).not.toHaveBeenCalled();
    expect(h.source).not.toHaveBeenCalled();
  });

  it("answers 404 when there is no stored picture for the slug", async () => {
    h.row.mockResolvedValue({ data: null, error: null });
    expect((await call("no-such-product")).status).toBe(404);
    h.row.mockResolvedValue({ data: { image_url: null }, error: null });
    expect((await call("no-picture")).status).toBe(404);
    h.row.mockRejectedValue(new Error("db down"));
    expect((await call("db-down")).status).toBe(404);
    expect(h.source).not.toHaveBeenCalled();
  });

  it("answers 404 for a review pulled from the site, even though its row still has a picture", async () => {
    h.row.mockResolvedValue({ data: { image_url: ORIGINAL }, error: null });
    expect((await call("be-minimalist-minimalist-oat-extract-6-gentle-cleanser")).status).toBe(404);
    expect(h.row).not.toHaveBeenCalled(); // not even looked up
    expect(h.source).not.toHaveBeenCalled();
  });

  it("sends the browser to the original picture when it cannot be fetched, so a tile is never blank because of this route", async () => {
    h.source.mockResolvedValue(null);
    const res = await call("foxtale-brightening-moisturiser");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(ORIGINAL);
    expect(res.headers.get("cache-control")).toContain("max-age=300");
  });

  it("does the same when the bytes are not a picture it can read", async () => {
    h.process.mockRejectedValue(new Error("Input buffer contains unsupported image format"));
    const res = await call("foxtale-brightening-moisturiser");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(ORIGINAL);
  });
});
