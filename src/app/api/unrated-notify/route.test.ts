import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ upsert: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: () => ({ upsert: db.upsert }) }) }));

import { POST } from "./route";

let n = 0;
/** Each call comes from its own address, so the rate limit (5 a minute per address) does not bleed between tests. */
const call = (body: unknown) =>
  POST(new Request("http://localhost/api/unrated-notify", { method: "POST", headers: { "x-forwarded-for": `10.0.0.${++n}`, "content-type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) }));
const good = { email: "Sonal@Example.com ", kind: "nutraceutical", productName: "H2Glow Drink Mix", brand: "H2Glow", productSlug: "h2glow-drink-mix" };

const fetchMock = vi.fn();
beforeEach(() => {
  db.upsert.mockReset().mockResolvedValue({ error: null });
  fetchMock.mockReset().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("POST /api/unrated-notify", () => {
  it("keeps the email, lower-cased, once per email and category", async () => {
    const res = await call(good);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(db.upsert).toHaveBeenCalledWith(
      { email: "sonal@example.com", category: "nutraceutical", product_name: "H2Glow Drink Mix", brand: "H2Glow", product_slug: "h2glow-drink-mix" },
      { onConflict: "email,category", ignoreDuplicates: true },
    );
  });

  it("refuses a missing or malformed email, and bad JSON", async () => {
    for (const email of ["", "   ", "not-an-email", "a@b", "a b@c.com", undefined]) expect((await call({ ...good, email })).status, String(email)).toBe(400);
    expect((await call("{not json")).status).toBe(400);
    expect(db.upsert).not.toHaveBeenCalled();
  });

  it("has no list for anything but a nutraceutical: we do not plan to rate prescription drugs", async () => {
    expect((await call({ ...good, kind: "prescription-drug" })).status).toBe(400);
    expect((await call({ ...good, kind: undefined })).status).toBe(400);
    expect(db.upsert).not.toHaveBeenCalled();
  });

  it("still succeeds when the table is not there but the owner was emailed", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    db.upsert.mockResolvedValue({ error: { message: 'relation "category_waitlist" does not exist' } });
    expect((await call(good)).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("says so when neither held it, rather than pretending", async () => {
    db.upsert.mockResolvedValue({ error: { message: "down" } });
    const res = await call(good); // no RESEND_API_KEY in the test environment
    expect(res.status).toBe(503);
  });

  it("escapes what it puts in the owner's email", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    await call({ ...good, brand: "<script>alert(1)</script>", productName: "A & B" });
    const html = JSON.parse(fetchMock.mock.calls[0][1].body).html as string;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("A &amp; B");
  });

  it("limits how often one address can sign up", async () => {
    const headers = { "x-forwarded-for": "10.9.9.9", "content-type": "application/json" };
    const send = () => POST(new Request("http://localhost/api/unrated-notify", { method: "POST", headers, body: JSON.stringify(good) }));
    for (let i = 0; i < 5; i++) expect((await send()).status).toBe(200);
    expect((await send()).status).toBe(429);
  });
});
