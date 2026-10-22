import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { showTotal } = require("../../extension/verdict-display.js") as { showTotal: (review: unknown, verdict: unknown) => boolean };
const review = (total: unknown) => ({ scores: { total } });

describe("extension popup: the total out of 100", () => {
  it("is shown when the verdict has no pillars, exactly as before", () => {
    expect(showTotal(review(72), { tier: "approved" })).toBe(true);
    expect(showTotal(review(0), { tier: "can-do-better" })).toBe(true);
    expect(showTotal(review(72), undefined)).toBe(true);
    expect(showTotal(review(72), null)).toBe(true);
  });

  it("is left out when the verdict carries the four pillar results", () => {
    const pillars = [{}, {}, {}, {}];
    expect(showTotal(review(72), { tier: "approved", pillars })).toBe(false);
    expect(showTotal(review(40), { tier: "mostly-clean", pillars })).toBe(false);
  });

  it("is never shown when there is no numeric total", () => {
    for (const bad of [undefined, null, "72", {}, true]) expect(showTotal(review(bad), {})).toBe(false);
    expect(showTotal({}, {})).toBe(false);
    expect(showTotal(undefined, {})).toBe(false);
  });

  it("a verdict whose pillars field is not an array does not hide the total", () => {
    expect(showTotal(review(72), { pillars: "yes" })).toBe(true);
  });

  it("registers itself on the page as TCSVerdictDisplay when there is no module system", () => {
    const sandbox: { TCSVerdictDisplay?: { showTotal: unknown } } = {};
    runInNewContext(readFileSync("extension/verdict-display.js", "utf8"), { self: sandbox });
    expect(typeof sandbox.TCSVerdictDisplay?.showTotal).toBe("function");
  });
});

describe("extension popup wiring", () => {
  const html = readFileSync("extension/popup.html", "utf8");
  const js = readFileSync("extension/popup.js", "utf8");

  it("loads the helper before the popup script", () => {
    const helper = html.indexOf('src="verdict-display.js"');
    const popup = html.indexOf('src="popup.js"');
    expect(helper).toBeGreaterThan(-1);
    expect(popup).toBeGreaterThan(helper);
  });

  it("asks the helper whether to show the total, and falls back to the old rule if it is missing", () => {
    expect(js).toContain("TCSVerdictDisplay.showTotal(review, verdict)");
    expect(js).toMatch(/:\s*typeof total === "number"/);
  });
});
