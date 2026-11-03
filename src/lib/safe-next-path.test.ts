import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-next-path";

const ORIGIN = "https://thecleansheet.in";

describe("safeNextPath: where a sign-in sends the visitor back to", () => {
  it("keeps a path on this site, with its query and anchor", () => {
    expect(safeNextPath("/brands", ORIGIN)).toBe("/brands");
    expect(safeNextPath("/brands?standing=Green&q=spf", ORIGIN)).toBe("/brands?standing=Green&q=spf");
    expect(safeNextPath("/analysis/some-product#ingredients", ORIGIN)).toBe("/analysis/some-product#ingredients");
    expect(safeNextPath("/", ORIGIN)).toBe("/");
  });

  it("uses the fallback when there is no address", () => {
    expect(safeNextPath(null, ORIGIN)).toBe("/account");
    expect(safeNextPath(undefined, ORIGIN)).toBe("/account");
    expect(safeNextPath("", ORIGIN)).toBe("/account");
    expect(safeNextPath(null, ORIGIN, "/")).toBe("/");
  });

  it.each([
    ["a user-name trick: the part before @ is a user name", "@other-site.com"],
    ["a full address", "https://other-site.com/phish"],
    ["a protocol-relative address", "//other-site.com"],
    ["a backslash read as a slash", "/\\other-site.com"],
    ["a tab inside the slashes", "/\t/other-site.com"],
    ["a line break inside the slashes", "/\n/other-site.com"],
    ["a scheme with no slashes", "javascript:alert(1)"],
    ["a path with no leading slash", "brands"],
    ["a user-name trick after a slash", "/@other-site.com"],
  ])("refuses %s", (_what, next) => {
    const out = safeNextPath(next, ORIGIN);
    // Either the fallback, or (for "/@other-site.com") a path on this site: never another host.
    expect(new URL(`${ORIGIN}${out}`).origin).toBe(ORIGIN);
    if (next !== "/@other-site.com") expect(out).toBe("/account");
  });

  it("never lets the result be read as another site once it is put after the site's address", () => {
    for (const next of ["/.//other-site.com", "/%2F/other-site.com", "/a/../../other-site.com", "/\\/other-site.com"]) {
      const out = safeNextPath(next, ORIGIN);
      expect(out.startsWith("/")).toBe(true);
      expect(out.startsWith("//")).toBe(false);
      expect(new URL(`${ORIGIN}${out}`).origin).toBe(ORIGIN);
    }
  });

  it("works with a local address too", () => {
    expect(safeNextPath("/brands?q=a", "http://localhost:3000")).toBe("/brands?q=a");
    expect(safeNextPath("//other-site.com", "http://localhost:3000")).toBe("/account");
  });
});
