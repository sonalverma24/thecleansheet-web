import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SAMPLE_EXAMPLE_PROHIBITED } from "@/data/analysis/sample-reviews";
import { deriveVerdict } from "@/lib/product-review-engine";
import { BASE, rv } from "@/lib/analyser-x/test-helpers";
import { TEMPLATE_IDS, lint } from "@/lib/analyser-x/copy";
import { TAGGED_RULES, tagOf } from "@/lib/analyser-x/tags";
import type { DecisionReason, Finding } from "@/lib/analyser-x/types";
import { pillsFor } from "@/lib/pills-for-review";
import { ingredientConcerns, ingredientHref } from "@/lib/ingredient-concerns";
import { PillsPage } from "@/components/scorecards/PillsPage";
import { MARKER_COLOURS } from "@/components/scorecards/pill-palette";
import type { ProductReview } from "@/lib/product-review-types";

vi.mock("./HeroActions", () => ({ HeroActions: ({ productId }: { productId: string }) => <div data-hero-actions={productId} /> }));

const reason = (ruleId: string, ingredients: string[] | undefined, tag?: string): DecisionReason => ({
  ruleId, kind: ruleId.startsWith("block.") ? "block" : "caution", origin: "code", text: "x", ...(ingredients ? { evidence: { ingredients, ...(tag ? { tag } : {}) } } : {}),
});
const names = (...n: string[]) => n.map((name) => ({ name }));

describe("ingredientConcerns: which rows of the list a finding names", () => {
  it("a stem the check matched marks the entry that holds it, as a run of whole words", () => {
    const rows = ingredientConcerns(names("Aqua", "Laminaria Ochroleuca Extract"), [reason("caution.soft_adverse", ["laminaria"], "Comedogenicity risk")]);
    expect(rows).toEqual([{ index: 1, name: "Laminaria Ochroleuca Extract", tone: "yellow", tags: ["Comedogenicity risk"] }]);
  });

  it("matches the way the check does: 'oleic acid' is not found inside 'Linoleic Acid'", () => {
    const rows = ingredientConcerns(names("Linoleic Acid", "Oleic Acid"), [reason("caution.soft_adverse", ["oleic acid"], "Comedogenicity risk")]);
    expect(rows.map((r) => r.name)).toEqual(["Oleic Acid"]);
  });

  it("an unnamed entry is matched whole, so the other extracts in the list are not marked", () => {
    const rows = ingredientConcerns(names("Rose Extract", "Extract", "Aloe Extract"), [reason("caution.catch_all", ["Extract"], "Unnamed entry")]);
    expect(rows.map((r) => r.name)).toEqual(["Extract"]);
  });

  it("a blocking finding is red and wins over a caution on the same row; both labels are kept", () => {
    const rows = ingredientConcerns(names("Butylphenyl Methylpropional"), [
      reason("caution.audience", ["Butylphenyl Methylpropional"], "Caution for pregnancy use"),
      reason("block.prohibited", ["Butylphenyl Methylpropional"], "Prohibited in cosmetics"),
    ]);
    expect(rows).toEqual([{ index: 0, name: "Butylphenyl Methylpropional", tone: "red", tags: ["Caution for pregnancy use", "Prohibited in cosmetics"] }]);
  });

  it("a finding that names no ingredient, or is not a safety finding, marks nothing", () => {
    expect(ingredientConcerns(names("Aqua", "Glycerin"), [reason("block.pillars", undefined), reason("support.safety_clear", ["Aqua"], "x"), reason("caution.claim_gap", ["Glycerin"], "x")])).toEqual([]);
  });

  it("a name that matches no row marks none", () => {
    expect(ingredientConcerns(names("Aqua"), [reason("caution.soft_adverse", ["laminaria"], "Comedogenicity risk")])).toEqual([]);
  });
});

describe("the label a finding puts on an ingredient", () => {
  const finding = (ruleId: string, params: Finding["params"]): Finding => ({ ruleId, severity: ruleId.startsWith("block.") ? "block" : "caution", origin: "code", needsReliableList: false, params, derivedFrom: [] });
  const SAMPLES: Record<string, Finding["params"]> = {
    "block.prohibited": { ingredient: "Formaldehyde" },
    "block.contradicted": { claim: "Paraben free, with a claim that runs on far longer than a label ever should, to prove it is clipped", ingredient: "Propyl Paraben" },
    "caution.soft_adverse": { label: "Comedogenicity risk", detail: "x", ingredients: "laminaria" },
    "caution.audience": { ingredient: "Retinol", audience: "pregnancy" },
    "caution.catch_all": { entry: "Extract" },
    "caution.benchmark_gap": { kind: "prohibited", authority: "Canada", ingredient: "X" },
  };

  it("every rule with a label is a real rule, and every labelled rule has a sample here", () => {
    for (const id of TAGGED_RULES) expect(TEMPLATE_IDS, id).toContain(id);
    expect(Object.keys(SAMPLES).sort()).toEqual([...TAGGED_RULES].sort());
  });

  it("each label is short and passes the same language lint as the reasons", () => {
    for (const id of TAGGED_RULES) {
      const tag = tagOf(finding(id, SAMPLES[id]));
      expect(tag, id).toBeTruthy();
      expect(lint(tag!).problems, `${id}: ${tag}`).toEqual([]);
      expect(tag!.length, id).toBeLessThanOrEqual(90);
    }
  });

  it("a rule that names no ingredient has no label", () => {
    expect(tagOf(finding("block.pillars", {}))).toBeUndefined();
  });
});

describe("ingredientHref: a link only where the safety screen resolved the row to a page", () => {
  it("a held ingredient links to its page, also when the label adds a slash, brackets or a strength", () => {
    expect(ingredientHref("Niacinamide")).toBe("/ingredients/niacinamide");
    expect(ingredientHref("Niacinamide (10%)")).toBe("/ingredients/niacinamide");
    expect(ingredientHref("Aqua/Water/Eau")).toMatch(/^\/ingredients\/[a-z0-9-]+$/);
  });

  it("an ingredient we hold no row for is not linked", () => {
    expect(ingredientHref("Zorbaflux Glycoside")).toBeNull();
  });
});

const between = (html: string, from: string, to: string): string => {
  const start = html.indexOf(from);
  expect(start, `${from} is on the page`).toBeGreaterThanOrEqual(0);
  return html.slice(start, html.indexOf(to, start + from.length));
};
const pageOf = (review: ProductReview) => {
  const built = pillsFor(review, deriveVerdict(review));
  return { model: built.model, html: renderToStaticMarkup(<PillsPage product={built.product} brand={built.brand} model={built.model} />) };
};
const listRow = (html: string, name: string): string => {
  const list = between(html, 'data-list="ingredients"', "</ul>");
  const at = list.indexOf(`>${name}<`);
  expect(at, `${name} is in the list`).toBeGreaterThanOrEqual(0);
  return list.slice(list.lastIndexOf("<li ", at), list.indexOf("</li>", at));
};

describe("a yellow Ingredient safety line points at the rows it is about", () => {
  const review = rv({ productName: "Gel Cream", category: "Moisturizer", inciIngredients: [...BASE, "Isopropyl Myristate", "Laminaria Ochroleuca Extract", "Zorbaflux Glycoside"] });
  const { model, html } = pageOf(review);
  const safety = model.details?.find((d) => d.title === "Ingredient safety");

  it("the line names the comedogenic ingredient, and the model names the same rows", () => {
    expect(safety?.oneLiner).toMatch(/comedogenic/i);
    expect(model.ingredientConcerns.map((c) => c.name)).toEqual(["Isopropyl Myristate", "Laminaria Ochroleuca Extract"]);
    expect(model.ingredientConcerns.every((c) => c.tone === "yellow" && c.tags.includes("Comedogenicity risk"))).toBe(true);
    expect(safety?.named?.map((c) => c.name)).toEqual(["Isopropyl Myristate", "Laminaria Ochroleuca Extract"]);
  });

  it("each row carries the finding's colour and label, not a green 'no concern'", () => {
    for (const n of ["Isopropyl Myristate", "Laminaria Ochroleuca Extract"]) {
      const row = listRow(html, n);
      expect(row, n).toContain(`background-color:${MARKER_COLOURS.yellow.ring}`);
      expect(row, n).toContain('data-marker="yellow"');
      expect(row, n).toContain("Comedogenicity risk");
      expect(row, n).toContain("worth noting in Ingredient safety");
      expect(row, n).not.toContain("(no concern)");
    }
  });

  it("a row nothing names keeps its own dot and carries no label", () => {
    const row = listRow(html, "Glycerin");
    expect(row).toContain("(no concern)");
    expect(row).not.toContain("data-marker");
  });

  it("the closed Ingredient safety row lists the named ingredients, and the open row links to each in the list", () => {
    const details = between(html, 'id="details"', 'id="gaps"');
    expect(details).toContain('aria-label="Ingredients named in this line"');
    const rowIds = model.ingredientConcerns.map((c) => c.index);
    for (const i of rowIds) {
      expect(details).toContain(`href="#ing-${i}"`);
      expect(html).toContain(`id="ing-${i}"`);
    }
  });

  it("the pills above the list jump to the same rows", () => {
    const pills = between(html, 'aria-label="Key and flagged ingredients"', "</ul>");
    for (const c of model.ingredientConcerns) expect(pills).toContain(`href="#ing-${c.index}"`);
  });

  it("a held ingredient's name is a link to its page; one we hold no row for is plain text", () => {
    expect(listRow(html, "Niacinamide")).toContain('href="/ingredients/niacinamide"');
    expect(listRow(html, "Zorbaflux Glycoside")).not.toContain("<a ");
  });
});

describe("a prohibited ingredient is red in the list, with the reason beside it", () => {
  const { model, html } = pageOf(SAMPLE_EXAMPLE_PROHIBITED);
  const red = model.ingredientConcerns.filter((c) => c.tone === "red");

  it("the model has at least one red row, labelled as prohibited", () => {
    expect(red.length).toBeGreaterThan(0);
    expect(red[0].tags).toContain("Prohibited in cosmetics");
  });

  it("the row is drawn red, with the label", () => {
    const row = listRow(html, red[0].name);
    expect(row).toContain(`background-color:${MARKER_COLOURS.red.ring}`);
    expect(row).toContain('data-marker="red"');
    expect(row).toContain("Prohibited in cosmetics");
  });
});

describe("a clean product marks no row", () => {
  const { model, html } = pageOf(rv({ productName: "Gel Cream", category: "Moisturizer", inciIngredients: BASE }));

  it("nothing is named, so the list and the Ingredient safety row are as they were", () => {
    expect(model.ingredientConcerns).toEqual([]);
    expect(html).not.toContain("Ingredients named in this line");
    expect(between(html, 'data-list="ingredients"', "</ul>")).not.toContain("data-marker");
  });
});
