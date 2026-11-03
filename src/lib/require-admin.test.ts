import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: h.getUser } }),
}));

import { requireAdmin } from "./admin-auth";

beforeEach(() => {
  vi.stubEnv("ADMIN_EMAILS", "Owner@Example.com, second@example.com");
  h.getUser.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("requireAdmin", () => {
  it("answers 401 when nobody is signed in", async () => {
    h.getUser.mockResolvedValue({ data: { user: null } });
    expect(await requireAdmin()).toEqual({ ok: false, status: 401 });
  });

  it("answers 401 for a session with no email", async () => {
    h.getUser.mockResolvedValue({ data: { user: { id: "u1", email: null } } });
    expect(await requireAdmin()).toEqual({ ok: false, status: 401 });
  });

  it("answers 403 for a signed-in user who is not on ADMIN_EMAILS", async () => {
    h.getUser.mockResolvedValue({ data: { user: { id: "u2", email: "shopper@example.com" } } });
    expect(await requireAdmin()).toEqual({ ok: false, status: 403 });
  });

  it("answers 403 for everyone when ADMIN_EMAILS is unset", async () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    h.getUser.mockResolvedValue({ data: { user: { id: "u1", email: "owner@example.com" } } });
    expect(await requireAdmin()).toEqual({ ok: false, status: 403 });
  });

  it("lets a listed email through, whatever its case, and returns that email", async () => {
    h.getUser.mockResolvedValue({ data: { user: { id: "u1", email: "owner@example.com" } } });
    expect(await requireAdmin()).toEqual({ ok: true, email: "owner@example.com" });
  });
});
