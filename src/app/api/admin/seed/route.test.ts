import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  createAdminClient: vi.fn(),
  upserts: [] as { table: string; row: Record<string, unknown> }[],
}));

vi.mock("@/lib/admin-auth", () => ({ requireAdmin: h.requireAdmin }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: h.createAdminClient }));
// One tiny brand with one product, so the run is quick and the counts are known.
vi.mock("@/data/brands", () => ({
  ALL_BRANDS: [
    {
      name: "Test Brand",
      slug: "test-brand",
      products: [
        { slug: "gentle-cleanser", productName: "Gentle Cleanser", ingredients: [{ name: "Aqua" }], score: 80, scoreLabel: "Good" },
      ],
    },
  ],
}));

import { POST } from "./route";

// The handler takes no request: nothing in the body can matter. Call it the way Next does,
// with a request, so the "a body token opens nothing" tests are honest.
const post = POST as unknown as (req: Request) => Promise<Response>;
const call = (body?: unknown) =>
  post(new Request("http://localhost/api/admin/seed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }));

beforeEach(() => {
  h.upserts.length = 0;
  h.requireAdmin.mockReset().mockResolvedValue({ ok: true, email: "owner@example.com" });
  h.createAdminClient.mockReset().mockImplementation(() => ({
    from: (table: string) => ({
      upsert: (row: Record<string, unknown>) => {
        h.upserts.push({ table, row });
        // brands and products chain .select().single(); product_scores is awaited directly.
        return Object.assign(Promise.resolve({ error: null }), {
          select: () => ({ single: () => Promise.resolve({ data: { id: `${table}-id` }, error: null }) }),
        });
      },
    }),
  }));
  vi.spyOn(console, "info").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/admin/seed", () => {
  it("refuses a signed-out caller with 401 and never opens the database", async () => {
    h.requireAdmin.mockResolvedValueOnce({ ok: false, status: 401 });
    const res = await call();
    expect(res.status).toBe(401);
    expect(h.createAdminClient).not.toHaveBeenCalled();
    expect(h.upserts).toEqual([]);
  });

  it("refuses a signed-in non-admin with 403 and never opens the database", async () => {
    h.requireAdmin.mockResolvedValueOnce({ ok: false, status: 403 });
    const res = await call();
    expect(res.status).toBe(403);
    expect(h.createAdminClient).not.toHaveBeenCalled();
    expect(h.upserts).toEqual([]);
  });

  it("lets a signed-in admin seed, writing brands, products and scores", async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, brands: 1, products: 1, errors: 0 });
    expect(h.upserts.map(u => u.table)).toEqual(["brands", "products", "product_scores"]);
    expect(h.upserts[1].row.slug).toBe("test-brand--gentle-cleanser");
  });

  it("is not opened by a token in the body, or by the old ADMIN_BOOTSTRAP_TOKEN env var", async () => {
    vi.stubEnv("ADMIN_BOOTSTRAP_TOKEN", "shared-secret");
    h.requireAdmin.mockResolvedValue({ ok: false, status: 401 });
    for (const body of [{ token: "shared-secret" }, { token: "" }, { token: null }, "shared-secret"]) {
      expect((await call(body)).status).toBe(401);
    }
    expect(h.createAdminClient).not.toHaveBeenCalled();
    expect(h.upserts).toEqual([]);
  });
});
