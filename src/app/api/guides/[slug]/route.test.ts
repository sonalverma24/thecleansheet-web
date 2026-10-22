import { existsSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SKIN_TYPE_GUIDES } from "@/lib/skin-guide-downloads";

const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser } }),
}));

import { GET } from "./route";

const call = (slug: string) => GET(new Request(`http://localhost/api/guides/${slug}`), { params: Promise.resolve({ slug }) });
const googleUser = { id: "u1", app_metadata: { provider: "google", providers: ["google"] }, identities: [] };
const emailUser = { id: "u2", app_metadata: { provider: "email", providers: ["email"] }, identities: [] };

beforeEach(() => getUser.mockReset());

describe("GET /api/guides/[slug]", () => {
  it("refuses with 401 when nobody is signed in", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await call("oily-skin");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "signin_required" });
    expect(res.headers.get("content-type")).not.toMatch(/pdf/);
  });

  it("refuses with 403 when the sign-in is email, not Google", async () => {
    getUser.mockResolvedValue({ data: { user: emailUser } });
    const res = await call("oily-skin");
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "google_required" });
  });

  it("serves each of the four guides as a PDF download to a Google user", async () => {
    getUser.mockResolvedValue({ data: { user: googleUser } });
    for (const g of SKIN_TYPE_GUIDES) {
      const res = await call(g.slug);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("application/pdf");
      expect(res.headers.get("content-disposition")).toContain("attachment");
      expect(res.headers.get("cache-control")).toBe("private, no-store");
      const bytes = new Uint8Array(await res.arrayBuffer());
      expect(String.fromCharCode(...bytes.slice(0, 4))).toBe("%PDF");
    }
  });

  it("returns 404 for an unknown slug, even for a Google user, and never builds a path from it", async () => {
    getUser.mockResolvedValue({ data: { user: googleUser } });
    for (const slug of ["nope", "../../package.json", "oily-skin.pdf"]) {
      expect((await call(slug)).status).toBe(404);
    }
  });
});

describe("the PDFs are not public files", () => {
  it("are not in /public, and are in /private/guides", () => {
    for (const g of SKIN_TYPE_GUIDES) {
      expect(existsSync(path.join(process.cwd(), "public", "guides", g.pdf))).toBe(false);
      expect(existsSync(path.join(process.cwd(), "private", "guides", g.pdf))).toBe(true);
    }
  });
});
