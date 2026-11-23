import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { watchLineOf, type WatchRow } from "./yellow-watch-line";
import type { Finding } from "@/lib/analyser-x/types";
import { PillTake } from "@/components/scorecards/pills-ui";

const caution = (ruleId: string, params: Finding["params"] = {}): Finding => ({ ruleId, severity: "caution", origin: "code", needsReliableList: false, params, derivedFrom: [] });
const support = (ruleId: string): Finding => ({ ruleId, severity: "support", origin: "code", needsReliableList: false, params: {}, derivedFrom: [] });

const row = (title: string, marker: WatchRow["marker"]): WatchRow => ({ title, marker, oneLiner: "" });
/** Every row Strong except the ones named. */
const rows = (over: Record<string, WatchRow["marker"]> = {}): WatchRow[] =>
  ["Ingredient safety", "Formula logic", "Claims evidence", "Test transparency", "Consumer clarity"].map((t) => row(t, t in over ? over[t] : "green"));

const fragrance = caution("caution.audience", { ingredient: "Parfum (Fragrance)", audience: "sensitive", audienceRule: "aud.sensitive.fragrance" });
const twoClaims = caution("caution.claim_gap", { claim: "provides up to 12 hours of hydration", count: 2 });

describe("the Watch for line on a nearly-Green Yellow", () => {
  it("names added fragrance on a sensitive-skin product held back only by Ingredient safety (the ISDIN case)", () => {
    expect(watchLineOf("buy-with-caution", [fragrance, twoClaims, support("support.list_verified")], rows({ "Ingredient safety": "yellow" })))
      .toBe("Watch for: added fragrance, if your skin is sensitive; and 2 claims with no public test.");
  });

  it("quotes the claim when it is the only caution, without its full stop", () => {
    expect(watchLineOf("buy-with-caution", [caution("caution.claim_gap", { claim: "Clinically proven.", count: 1 })], rows({ "Consumer clarity": "yellow" })))
      .toBe("Watch for: “Clinically proven”, a claim with no public test.");
  });

  it("says wording a cosmetic cannot use in India (the ASCI case)", () => {
    expect(watchLineOf("buy-with-caution", [caution("caution.boundary", { claim: "treats acne", count: 1 })], rows()))
      .toBe("Watch for: some wording goes further than a cosmetic may claim in India.");
  });

  it("names comedogenic ingredients, at most two", () => {
    const f = caution("caution.soft_adverse", { label: "Comedogenicity risk", ingredients: "coconut oil | theobroma cacao | laminaria" });
    expect(watchLineOf("buy-with-caution", [f], rows({ "Ingredient safety": "yellow" })))
      .toBe("Watch for: coconut oil and theobroma cacao, which may not suit very acne-prone skin.");
  });

  it("counts a Fair Test transparency as part of the Green set", () => {
    expect(watchLineOf("buy-with-caution", [fragrance], rows({ "Ingredient safety": "yellow", "Test transparency": "yellow" }))).not.toBeNull();
  });

  it("stays silent when two rows are short of Green", () => {
    expect(watchLineOf("buy-with-caution", [fragrance], rows({ "Ingredient safety": "yellow", "Consumer clarity": "yellow" }))).toBeNull();
  });

  it("stays silent when any row is Concern or Not rated", () => {
    expect(watchLineOf("buy-with-caution", [fragrance], rows({ "Claims evidence": "red" }))).toBeNull();
    expect(watchLineOf("buy-with-caution", [fragrance], rows({ "Test transparency": null }))).toBeNull();
  });

  it("stays silent with more than two cautions", () => {
    expect(watchLineOf("buy-with-caution", [fragrance, twoClaims, caution("caution.formula")], rows())).toBeNull();
  });

  it("stays silent when the only reason is a row that is not Strong yet: nothing to watch for", () => {
    expect(watchLineOf("buy-with-caution", [caution("caution.rows", { rows: "Consumer clarity" })], rows({ "Consumer clarity": "yellow" }))).toBeNull();
  });

  it("stays silent when one of the cautions has no phrase, so the line never tells half the story", () => {
    expect(watchLineOf("buy-with-caution", [fragrance, caution("caution.unknown_rule")], rows())).toBeNull();
  });

  it("is only for Yellow", () => {
    for (const key of ["good-choice", "look-elsewhere", "not-enough-info", "medicinal-product"] as const) expect(watchLineOf(key, [fragrance], rows())).toBeNull();
    expect(watchLineOf("buy-with-caution", [fragrance], null)).toBeNull();
  });
});

describe("the Yellow badge", () => {
  it("prints the line under the Yellow meaning, and nothing when there is none", () => {
    const withLine = renderToStaticMarkup(<PillTake marker="yellow" watch="Watch for: added fragrance, if your skin is sensitive." />);
    expect(withLine).toContain('class="cs-verdict__watch"');
    expect(withLine).toContain("Watch for: added fragrance, if your skin is sensitive.");
    expect(renderToStaticMarkup(<PillTake marker="yellow" />)).not.toContain("cs-verdict__watch");
  });
});
