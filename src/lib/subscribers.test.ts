import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ result: { data: null as unknown, error: null as unknown }, calls: [] as unknown[][], throwOnUse: false }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      upsert: (row: unknown, opts: unknown) => {
        if (h.throwOnUse) throw new Error("db down");
        h.calls.push([table, row, opts]);
        return { select: async () => h.result };
      },
    }),
  }),
}));

import { cleanSource, escapeHtml, ownerNoteHtml, parseSubscriber, recordSubscriber, saveSubscriber } from "@/lib/subscribers";

describe("parseSubscriber", () => {
  it("lower-cases and trims a normal address and keeps a plain source", () => {
    expect(parseSubscriber("  Reader@Example.COM ", "Google sign-in")).toEqual({ email: "reader@example.com", source: "Google sign-in" });
  });

  it("defaults the source when none is given", () => {
    expect(parseSubscriber("reader@example.com")).toEqual({ email: "reader@example.com", source: "Blog page" });
  });

  it.each([
    ["not an email", "plainly-not-an-email"],
    ["no domain dot", "reader@localhost"],
    ["a space inside", "read er@example.com"],
    ["two @ signs", "a@b@example.com"],
    ["markup in the local part", "<script>@example.com"],
    ["a quote", `rea"der@example.com`],
    ["empty", ""],
    ["blank", "   "],
  ])("rejects %s", (_why, value) => {
    expect(parseSubscriber(value)).toBeNull();
  });

  it("rejects anything that is not a string", () => {
    for (const value of [undefined, null, 42, {}, ["a@b.co"]]) expect(parseSubscriber(value)).toBeNull();
  });

  it("rejects an address longer than 254 characters", () => {
    expect(parseSubscriber(`${"a".repeat(250)}@example.com`)).toBeNull();
  });
});

describe("cleanSource", () => {
  it("strips markup and punctuation down to a short label", () => {
    expect(cleanSource(`<img src=x onerror=alert(1)>Footer`)).toBe("img srcx onerroralert1Footer");
    expect(cleanSource("<script>")).toBe("script");
  });

  it("falls back when the label is empty after cleaning, or is not text", () => {
    expect(cleanSource("<>")).toBe("Blog page");
    expect(cleanSource(undefined)).toBe("Blog page");
    expect(cleanSource({ a: 1 })).toBe("Blog page");
  });

  it("caps the length", () => {
    expect(cleanSource("x".repeat(200))).toHaveLength(40);
  });
});

describe("the note to the owner", () => {
  it("escapes markup in every value", () => {
    expect(escapeHtml(`<b onclick="x">&'`)).toBe("&lt;b onclick=&quot;x&quot;&gt;&amp;&#39;");
    const html = ownerNoteHtml({ email: "a<i>@example.com", source: "<script>alert(1)</script>" }, "1 Jan, 10:00 am");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<i>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("saveSubscriber", () => {
  beforeEach(() => { h.calls.length = 0; h.throwOnUse = false; h.result = { data: null, error: null }; });

  it("reports a stored row as new, and asks the database to ignore duplicates", async () => {
    h.result = { data: [{ email: "reader@example.com" }], error: null };
    expect(await saveSubscriber({ email: "reader@example.com", source: "Blog page" })).toBe("new");
    expect(h.calls[0]).toEqual(["subscribers", { email: "reader@example.com", source: "Blog page" }, { onConflict: "email", ignoreDuplicates: true }]);
  });

  it("reports a conflict-ignored insert as existing", async () => {
    h.result = { data: [], error: null };
    expect(await saveSubscriber({ email: "reader@example.com", source: "Blog page" })).toBe("existing");
  });

  it("reports a database error, or a thrown error, as unsaved", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    h.result = { data: null, error: { message: "relation \"subscribers\" does not exist" } };
    expect(await saveSubscriber({ email: "reader@example.com", source: "Blog page" })).toBe("unsaved");
    h.throwOnUse = true;
    expect(await saveSubscriber({ email: "reader@example.com", source: "Blog page" })).toBe("unsaved");
  });
});

describe("recordSubscriber", () => {
  const sub = { email: "reader@example.com", source: "Blog page" };
  const sent = vi.fn();

  beforeEach(() => {
    h.calls.length = 0; h.throwOnUse = false; sent.mockReset();
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async (...args: unknown[]) => { sent(...args); return new Response("{}"); }));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("tells the owner about a new sign-up", async () => {
    h.result = { data: [{ email: sub.email }], error: null };
    expect(await recordSubscriber(sub)).toBe("new");
    expect(sent).toHaveBeenCalledTimes(1);
  });

  it("does not tell the owner again about a repeat sign-up", async () => {
    h.result = { data: [], error: null };
    expect(await recordSubscriber(sub)).toBe("existing");
    expect(sent).not.toHaveBeenCalled();
  });

  it("still tells the owner when the database could not be written, so a sign-up is never lost silently", async () => {
    h.result = { data: null, error: { message: "table missing" } };
    expect(await recordSubscriber(sub)).toBe("unsaved");
    expect(sent).toHaveBeenCalledTimes(1);
  });

  it("does not fail when the email service is down", async () => {
    h.result = { data: [{ email: sub.email }], error: null };
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("resend down"); }));
    await expect(recordSubscriber(sub)).resolves.toBe("new");
  });
});
