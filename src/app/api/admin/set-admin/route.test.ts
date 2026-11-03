import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  createAdminClient: vi.fn(),
  listUsers: vi.fn(),
  upsert: vi.fn(),
  tables: [] as string[],
}));

vi.mock("@/lib/admin-auth", () => ({ requireAdmin: h.requireAdmin }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: h.createAdminClient }));

import { POST } from "./route";

// The handler takes no request: nothing in the body can matter. Call it the way Next does,
// with a request, so the "the body picks nobody" tests are honest.
const post = POST as unknown as (req: Request) => Promise<Response>;
const call = (body?: unknown) =>
  post(new Request("http://localhost/api/admin/set-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }));

const OWNER = { id: "u-owner", email: "owner@example.com" };
const SECOND = { id: "u-second", email: "second@example.com" };
const SHOPPER = { id: "u-shopper", email: "shopper@example.com" };

beforeEach(() => {
  h.tables.length = 0;
  vi.stubEnv("ADMIN_EMAILS", "owner@example.com, second@example.com");
  h.requireAdmin.mockReset().mockResolvedValue({ ok: true, email: "owner@example.com" });
  h.listUsers.mockReset().mockResolvedValue({ data: { users: [OWNER, SECOND, SHOPPER] }, error: null });
  h.upsert.mockReset().mockResolvedValue({ error: null });
  h.createAdminClient.mockReset().mockImplementation(() => ({
    auth: { admin: { listUsers: h.listUsers } },
    from: (table: string) => {
      h.tables.push(table);
      return { upsert: h.upsert };
    },
  }));
  vi.spyOn(console, "info").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/admin/set-admin", () => {
  it("refuses a signed-out caller with 401 and writes nothing", async () => {
    h.requireAdmin.mockResolvedValueOnce({ ok: false, status: 401 });
    const res = await call();
    expect(res.status).toBe(401);
    expect(h.createAdminClient).not.toHaveBeenCalled();
    expect(h.listUsers).not.toHaveBeenCalled();
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it("refuses a signed-in non-admin with 403 and writes nothing", async () => {
    h.requireAdmin.mockResolvedValueOnce({ ok: false, status: 403 });
    const res = await call();
    expect(res.status).toBe(403);
    expect(h.createAdminClient).not.toHaveBeenCalled();
    expect(h.listUsers).not.toHaveBeenCalled();
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it("lets a listed admin grant the role to the listed emails, and nobody else", async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      results: [
        { email: "owner@example.com", status: "admin role granted" },
        { email: "second@example.com", status: "admin role granted" },
      ],
    });
    expect(h.upsert.mock.calls).toEqual([
      [{ id: "u-owner", role: "admin" }, { onConflict: "id" }],
      [{ id: "u-second", role: "admin" }, { onConflict: "id" }],
    ]);
    expect(new Set(h.tables)).toEqual(new Set(["profiles"]));
  });

  it("lets the body pick nobody: a token or an email in the request changes nothing", async () => {
    vi.stubEnv("ADMIN_BOOTSTRAP_TOKEN", "shared-secret");
    for (const body of [{ token: "shared-secret" }, { email: SHOPPER.email }, { emails: [SHOPPER.email], role: "admin" }]) {
      h.upsert.mockClear();
      expect((await call(body)).status).toBe(200);
      expect(h.upsert.mock.calls.map(c => c[0].id)).toEqual(["u-owner", "u-second"]);
    }
  });

  it("is not opened by a token in the body, or by the old ADMIN_BOOTSTRAP_TOKEN env var, when signed out", async () => {
    vi.stubEnv("ADMIN_BOOTSTRAP_TOKEN", "shared-secret");
    h.requireAdmin.mockResolvedValue({ ok: false, status: 401 });
    for (const body of [{ token: "shared-secret" }, { token: "" }, { token: null }]) {
      expect((await call(body)).status).toBe(401);
    }
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it("matches the listed email to the sign-in email whatever the case", async () => {
    vi.stubEnv("ADMIN_EMAILS", "Owner@Example.com");
    const res = await call();
    expect((await res.json()).results).toEqual([{ email: "Owner@Example.com", status: "admin role granted" }]);
    expect(h.upsert).toHaveBeenCalledWith({ id: "u-owner", role: "admin" }, { onConflict: "id" });
  });

  it("says so when a listed email has not signed in yet, and still grants the others", async () => {
    vi.stubEnv("ADMIN_EMAILS", "owner@example.com, never-signed-in@example.com");
    const res = await call();
    expect((await res.json()).results).toEqual([
      { email: "owner@example.com", status: "admin role granted" },
      { email: "never-signed-in@example.com", status: "user not found - must sign in first" },
    ]);
    expect(h.upsert).toHaveBeenCalledTimes(1);
  });

  it("reports a failed user lookup against every email it could not find, without writing", async () => {
    h.listUsers.mockResolvedValue({ data: { users: [] }, error: { message: "auth down" } });
    const res = await call();
    expect(res.status).toBe(200);
    expect((await res.json()).results).toEqual([
      { email: "owner@example.com", status: "list error: auth down" },
      { email: "second@example.com", status: "list error: auth down" },
    ]);
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it("reports a failed write per email and still tries the next one", async () => {
    h.upsert.mockResolvedValueOnce({ error: { message: "db down" } });
    const res = await call();
    expect(res.status).toBe(200);
    expect((await res.json()).results).toEqual([
      { email: "owner@example.com", status: "error: db down" },
      { email: "second@example.com", status: "admin role granted" },
    ]);
  });

  it("finds a listed admin who is not on the first page of users", async () => {
    // The site has more users than one page; the owner's older account is on page 2.
    const filler = Array.from({ length: 1000 }, (_, i) => ({ id: `u-${i}`, email: `shopper${i}@example.com` }));
    h.listUsers
      .mockResolvedValueOnce({ data: { users: filler }, error: null })
      .mockResolvedValueOnce({ data: { users: [OWNER, SECOND] }, error: null });
    const res = await call();
    expect((await res.json()).results).toEqual([
      { email: "owner@example.com", status: "admin role granted" },
      { email: "second@example.com", status: "admin role granted" },
    ]);
    expect(h.listUsers.mock.calls.map(c => c[0])).toEqual([
      { page: 1, perPage: 1000 },
      { page: 2, perPage: 1000 },
    ]);
  });

  it("stops paging as soon as every listed email is found", async () => {
    const full = Array.from({ length: 998 }, (_, i) => ({ id: `u-${i}`, email: `shopper${i}@example.com` }));
    h.listUsers.mockResolvedValueOnce({ data: { users: [...full, OWNER, SECOND] }, error: null });
    await call();
    expect(h.listUsers).toHaveBeenCalledTimes(1);
  });

  it("grants nobody when ADMIN_EMAILS is empty", async () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    const res = await call();
    expect(await res.json()).toEqual({ success: true, results: [] });
    expect(h.upsert).not.toHaveBeenCalled();
  });
});
