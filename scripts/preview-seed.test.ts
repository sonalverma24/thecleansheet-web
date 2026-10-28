import { describe, expect, it } from "vitest";
import {
  INGREDIENT_COLUMNS, PRIVATE_COLUMNS, PRODUCT_REVIEW_COLUMNS,
  checkTarget, findPrivateKeys, jwtClaims, pickColumns, projectRefFromUrl,
} from "./preview-seed";

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = (claims: object) => `${b64({ alg: "HS256", typ: "JWT" })}.${b64(claims)}.signature`;

const PROD_URL = "https://prodprodprod.supabase.co";
const PROD_ANON = jwt({ ref: "prodprodprod", role: "anon" });
const source = { url: PROD_URL, anonKey: PROD_ANON };
const goodTarget = { url: "https://prevprevprev.supabase.co", serviceKey: jwt({ ref: "prevprevprev", role: "service_role" }) };

describe("checkTarget", () => {
  it("accepts a different project whose key belongs to it", () => {
    expect(checkTarget(source, goodTarget)).toEqual([]);
  });

  it.each([
    ["the same URL", { ...goodTarget, url: PROD_URL }],
    ["the same URL with a trailing slash and capitals", { ...goodTarget, url: "HTTPS://ProdProdProd.supabase.co/" }],
    ["the same host with a path", { ...goodTarget, url: `${PROD_URL}/rest/v1` }],
  ])("refuses %s", (_name, target) => {
    expect(checkTarget(source, target).join(" ")).toMatch(/same host as production/);
  });

  it("refuses a preview URL paired with the production service-role key", () => {
    const t = { url: goodTarget.url, serviceKey: jwt({ ref: "prodprodprod", role: "service_role" }) };
    const problems = checkTarget(source, t).join(" ");
    expect(problems).toMatch(/belongs to the production project/);
    expect(problems).toMatch(/different project than the preview URL/);
  });

  it("refuses a custom production domain hiding behind a preview-looking URL, by the key's project", () => {
    const customSource = { url: "https://db.example.com", anonKey: PROD_ANON };
    const t = { url: "https://prodprodprod.supabase.co", serviceKey: jwt({ ref: "prodprodprod", role: "service_role" }) };
    expect(checkTarget(customSource, t).join(" ")).toMatch(/belongs to the production project/);
  });

  it("refuses a target that is not a supabase.co or localhost host", () => {
    expect(checkTarget(source, { ...goodTarget, url: "https://db.example.com" }).join(" ")).toMatch(/not a \*\.supabase\.co host/);
  });

  it("refuses plain http for a hosted project but allows a local stack", () => {
    expect(checkTarget(source, { ...goodTarget, url: "http://prevprevprev.supabase.co" }).join(" ")).toMatch(/must be https/);
    expect(checkTarget(source, { url: "http://127.0.0.1:54321", serviceKey: jwt({ role: "service_role" }) })).toEqual([]);
  });

  it("refuses a key whose role is not service_role", () => {
    const t = { ...goodTarget, serviceKey: jwt({ ref: "prevprevprev", role: "anon" }) };
    expect(checkTarget(source, t).join(" ")).toMatch(/not service_role/);
  });

  it("refuses the production anon key as the preview key", () => {
    expect(checkTarget(source, { ...goodTarget, serviceKey: PROD_ANON }).join(" ")).toMatch(/production project|production anon key/);
  });

  it("accepts an opaque (non-JWT) key for a different project, since only the URL can be compared", () => {
    expect(checkTarget(source, { ...goodTarget, serviceKey: "sb_secret_abc123" })).toEqual([]);
  });

  it.each([
    ["no preview URL", { url: "", serviceKey: goodTarget.serviceKey }, /URL is missing/],
    ["an unparseable preview URL", { url: "not a url", serviceKey: goodTarget.serviceKey }, /not a valid URL/],
    ["no preview key", { url: goodTarget.url, serviceKey: " " }, /key is missing/],
  ])("refuses %s", (_name, target, re) => {
    expect(checkTarget(source, target).join(" ")).toMatch(re);
  });

  it("refuses when the source is unusable, so a comparison is never skipped", () => {
    expect(checkTarget({ url: "", anonKey: PROD_ANON }, goodTarget).join(" ")).toMatch(/source \(production\) URL/);
    expect(checkTarget({ url: PROD_URL, anonKey: "" }, goodTarget).join(" ")).toMatch(/anon key is missing/);
  });

  it("never puts a key in a message", () => {
    const t = { url: PROD_URL, serviceKey: jwt({ ref: "prodprodprod", role: "service_role" }) };
    for (const p of checkTarget(source, t)) {
      expect(p).not.toContain(t.serviceKey);
      expect(p).not.toContain(PROD_ANON);
    }
  });
});

describe("jwtClaims and projectRefFromUrl", () => {
  it("reads the reference and role, and returns null for anything that is not a JWT", () => {
    expect(jwtClaims(jwt({ ref: "abc", role: "service_role" }))).toEqual({ ref: "abc", role: "service_role" });
    expect(jwtClaims("sb_secret_x")).toBeNull();
    expect(jwtClaims("a.b.c")).toBeNull();
  });
  it("reads the project reference only from a hosted supabase.co URL", () => {
    expect(projectRefFromUrl("https://AbCd.supabase.co/")).toBe("abcd");
    expect(projectRefFromUrl("https://example.com")).toBeNull();
    expect(projectRefFromUrl("nope")).toBeNull();
  });
});

describe("pickColumns", () => {
  it("copies only allow-listed columns and drops requester columns and unknown ones", () => {
    const row = {
      product_slug: "a", product_name: "A", brand: "B", tier: "approved", image_url: null, result: { x: 1 },
      rubric_rev: "r7", reviewed_at: "2026-01-01",
      requested_by_email: "asha@example.com", requested_by_user_id: "u-1", some_future_column: "x",
    };
    const out = pickColumns(row, PRODUCT_REVIEW_COLUMNS);
    expect(Object.keys(out).sort()).toEqual([...PRODUCT_REVIEW_COLUMNS].sort());
    for (const c of PRIVATE_COLUMNS) expect(out).not.toHaveProperty(c);
    expect(out).not.toHaveProperty("some_future_column");
  });

  it("keeps a null value but never invents a missing column", () => {
    expect(pickColumns({ image_url: null }, PRODUCT_REVIEW_COLUMNS)).toEqual({ image_url: null });
  });

  it("allow-lists neither list with a private column", () => {
    for (const c of PRIVATE_COLUMNS) {
      expect(PRODUCT_REVIEW_COLUMNS as readonly string[]).not.toContain(c);
      expect(INGREDIENT_COLUMNS as readonly string[]).not.toContain(c);
    }
  });
});

describe("findPrivateKeys", () => {
  it("finds requester, user id and email keys at any depth", () => {
    const found = findPrivateKeys({ review: { notes: [{ requested_by_email: "x" }], userId: 1 }, ok: { score: 3 } });
    expect(found).toEqual(["review.notes[0].requested_by_email", "review.userId"]);
  });
  it("returns nothing for ordinary review content", () => {
    expect(findPrivateKeys({ type: "product-review", review: { brand: "B", scores: { total: 80 } }, verdict: { tier: "approved" } })).toEqual([]);
  });
  it("tolerates primitives and null", () => {
    expect(findPrivateKeys(null)).toEqual([]);
    expect(findPrivateKeys("a@b.com")).toEqual([]);
  });
});
