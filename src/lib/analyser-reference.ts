/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · the generated analyser reference

   Builds ANALYSER-REFERENCE.md from the code, so the reference cannot drift from what the
   site does. Run `npm run docs:analyser` to rewrite the file; src/lib/analyser-reference.test.ts
   fails when the committed file is out of date, and CI runs that test on every pull request.

   Two kinds of input:
     read from the code     versions, flags, decisions, reason codes, thresholds, the model prompt, the file map
     written by a person    docs/analyser-decisions.md, the dated log of why choices were made

   Deliberately NOT included: counts of products or reviews, dates and commit hashes. They change without
   the code changing, and would make the file stale on every release.
──────────────────────────────────────────────────────────────── */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { ANALYSER_FLAGS } from "@/lib/analyser-flags";
import { PILLAR_STANDING_CONFIG } from "@/lib/pillar-standing";
import { PRODUCT_REVIEW_SYSTEM_PROMPT } from "@/lib/product-review-context";
import { ANALYSER_METHOD_VERSION, ANALYSER_RELEASE, ANALYSER_APPROVED_BASELINE } from "@/lib/analyser-x/version";
import { COPY_VERSION, MAX_REASON, PILLS } from "@/lib/analyser-x/copy";
import { INDEPENDENT_LABS } from "@/lib/analyser-x/ladder";

const read = (root: string, path: string): string => readFileSync(join(root, path), "utf8");
const oneLine = (s: string): string => s.replace(/\s*\n\s*\*?\s*/g, " ").replace(/\s+/g, " ").trim();

function must<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`analyser reference: could not find ${what}; the code changed shape, update src/lib/analyser-reference.ts`);
  return value;
}

/** `export const NAME = "value"; // comment` from a source file. */
function constLine(source: string, name: string): { value: string; comment: string } {
  const m = new RegExp(`export const ${name}\\s*=\\s*"([^"]*)";[ \\t]*(?://\\s*(.*))?`).exec(source);
  const hit = must(m, `the constant ${name}`);
  return { value: hit[1], comment: hit[2] ?? "" };
}

/** Each flag's environment variable and the comment written above it. */
function flagDocs(source: string): { env: string; doc: string }[] {
  const out: { env: string; doc: string }[] = [];
  for (const m of source.matchAll(/\/\*\*([\s\S]*?)\*\/\s*\w+:\s*"(ANALYSER_[A-Z_]+)"/g)) out.push({ env: m[2], doc: oneLine(m[1]) });
  return out;
}

/** The first sentence of a file's top comment, for the file map. */
function fileSummary(source: string): string {
  const m = /\/\*\s*[─\-=\s]*\n?([\s\S]*?)\*\//.exec(source);
  if (!m) return "";
  const lines = m[1].split("\n").map((l) => l.replace(/^[\s*─\-=]+/, "").trim()).filter(Boolean);
  return lines[0] ?? "";
}

/** The top comment of a file, with the decoration removed and its paragraphs kept. */
function topComment(source: string): string {
  const m = must(/\/\*\s*[─\-=\s]*\n([\s\S]*?)\*\//.exec(source), "a top comment");
  return m[1].split("\n").map((l) => l.replace(/^[\s─\-=]+$/, "").replace(/\s+$/, "")).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** The copy templates exactly as written, one line per rule id. */
function templateLines(source: string): { id: string; line: string }[] {
  const out: { id: string; line: string }[] = [];
  for (const m of source.matchAll(/^ {2}"([a-z_]+\.[a-z_]+)":\s*(.*)$/gm)) out.push({ id: m[1], line: m[2].replace(/,\s*$/, "") });
  return out;
}

const GROUPS: Record<string, string> = {
  med: "severity medicinal: the decision is Medicinal product (highest precedence)",
  block: "severity block: the decision is Look elsewhere (only a finding made by code counts, never one resting on the model's judgement)",
  gap: "severity gap: the decision is Not enough info",
  caution: "severity caution: the decision is Buy with caution",
  support: "severity support: positive evidence; Good choice needs the three core supports listed below",
  note: "severity note: rides along under any outcome except Not enough info",
};

const ROOT_DOCS: [string, string][] = [
  ["ANALYSER-X1.md", "what Version X1 is, its evidence rules, reference data, and what is held or open"],
  ["PRODUCT-ANALYSIS-LOGIC.md", "the end-to-end flow of one analysis: scraping, ingredient lookup, the rubric, scoring, the verdict"],
  ["HOW-THE-ANALYSER-WORKS.md", "a plain-language overview"],
  ["ANALYSER-ROLLOUT.md", "what is live, what is behind a flag, and the release history"],
  ["STAMPS.md", "what each standing and stamp means, and the four-pillar standing"],
];

/** Fingerprint the rule, acquisition, reference-data and display sources too:
 * changing executable logic must make the reference freshness test fail. */
export function analyserSourceManifest(root: string): { path: string; sha256: string }[] {
  const paths = new Set<string>();
  const walk = (dir: string, include: (path: string) => boolean) => {
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(path, include);
      else if (!/\.test\.|__snapshots__/.test(path) && include(path)) paths.add(path);
    }
  };
  walk("src/lib", (path) => /\.(?:ts|json)$/.test(path) && /analyser|inci|ingredient|review|pill|analysis|claim|verdict|pregnancy|product-(?:identity|scope|image|photo)|gemini|scrape|evidence|web-shopper|unrated|drug|compliance|text-negation/.test(path));
  walk("src/components/scorecards", (path) => /\.(?:tsx?|css)$/.test(path));
  walk("src/data", (path) => /\.(?:ts|json)$/.test(path) && /ingredient|taxonomy/.test(path));
  for (const path of ["src/app/analysis/[slug]/page.tsx", "src/app/api/review/route.ts", "src/app/api/analyser-version/route.ts", "next.config.ts"]) paths.add(path);
  return [...paths].sort().map((path) => ({ path, sha256: createHash("sha256").update(read(root, path)).digest("hex") }));
}

export function buildAnalyserReference(root: string = process.cwd()): string {
  const engine = read(root, "src/lib/product-review-engine.ts");
  const rubric = constLine(engine, "RUBRIC_REV");
  const pillarRubric = constLine(engine, "PILLAR_RUBRIC_REV");
  const flags = flagDocs(read(root, "src/lib/analyser-flags.ts"));
  const copySource = read(root, "src/lib/analyser-x/copy.ts");
  const templates = templateLines(copySource);
  const decisionSource = read(root, "src/lib/analyser-x/decision.ts");
  const coreSupports = must(/const core = \[([^\]]*)\]/.exec(decisionSource), "the core supports in decision.ts")[1].split(",").map((x) => x.trim().replace(/^"|"$/g, "")).filter(Boolean);
  if (coreSupports.length < 2) throw new Error("analyser reference: the core supports in decision.ts could not be read");
  const xFiles = readdirSync(join(root, "src/lib/analyser-x")).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts")).sort();
  const decisions = existsSync(join(root, "docs/analyser-decisions.md")) ? read(root, "docs/analyser-decisions.md").trim() : "(docs/analyser-decisions.md is missing)";

  const flagEnvs = Object.values(ANALYSER_FLAGS) as string[];
  for (const env of flagEnvs) must(flags.find((f) => f.env === env), `the comment above flag ${env}`);
  if (PRODUCT_REVIEW_SYSTEM_PROMPT.includes("~~~~")) throw new Error("analyser reference: the model prompt contains ~~~~, which would break the code fence");

  const out: string[] = [];
  const add = (...lines: string[]) => out.push(...lines);

  add(
    "# The Clean Sheet analyser: reference",
    "",
    "> **Generated file. Do not edit it by hand.** It is built from the code by `npm run docs:analyser`, and `npm test` fails when it is out of date.",
    "> The only hand-written part is the decision log at the end (`docs/analyser-decisions.md`).",
    "> It states how the analyser works as the code stands. It holds no product counts, dates or commit hashes: those change without the code changing.",
    "",
    "## 1. Versions",
    "",
    "| What | Value | Note |",
    "|---|---|---|",
    `| Release line | ${ANALYSER_RELEASE} | |`,
    `| Approved baseline | ${ANALYSER_APPROVED_BASELINE} | Owner-approved local and production behaviour. |`,
    `| Stored decision method | ${ANALYSER_METHOD_VERSION} | |`,
    `| Copy templates | ${COPY_VERSION} | Every reason sentence is built from a template; the maximum reason length is ${MAX_REASON} characters. |`,
    `| Rubric revision | ${rubric.value} | ${rubric.comment} |`,
    `| Pillar rubric revision | ${pillarRubric.value} | ${pillarRubric.comment} |`,
    "",
    "A new analysis is stamped with the rubric revision above, or with the pillar revision when `ANALYSER_PILLAR_STANDING` is on. The site shows analyses stamped with either.",
    "",
    "## 2. Flags",
    "",
    "Each behaviour that changes what a shopper sees has its own flag, read from the server environment, off unless set to `1` or `true`.",
    "",
    "| Environment variable | What it does |",
    "|---|---|",
    ...flags.map((f) => `| \`${f.env}\` | ${f.doc.replace(/\|/g, "\\|")} |`),
    "",
    "## 3. The decisions a shopper sees",
    "",
    "| Key | Label | Meaning |",
    "|---|---|---|",
    ...Object.entries(PILLS).map(([key, v]) => `| \`${key}\` | ${v.label} | ${v.meaning} |`),
    "",
    "## 4. How a decision is made",
    "",
    "From `src/lib/analyser-x/decision.ts`:",
    "",
    "~~~~text",
    topComment(decisionSource),
    "~~~~",
    "",
    `Good choice needs all of these supports: ${coreSupports.map((c) => `\`${c}\``).join(", ")}. Without them the decision is Not enough info (\`gap.support_insufficient\`).`,
    "The third, `support.claims_proportionate`, can be replaced by `support.sections_green` (owner decision, 2026-10-30): all five sections of the product page are green (Ingredient safety, Formula logic, Claims evidence, Test transparency, Consumer clarity; `src/lib/analyser-x/sections.ts`), and the only cautions are ones those sections already measure, a claim without a test on this product (`caution.claim_gap`) or a formula that may not deliver (`caution.formula`). Those two then ride along as notes and are listed under Gaps. Any other caution is a flag and still decides Buy with caution.",
    "",
    "## 5. Reasons",
    "",
    "A decision is built only from findings. Each finding has a rule id, the facts it used, and a sentence made from a fixed template; no model text appears in a reason.",
    "The prefix of a rule id says what kind of reason it is:",
    "",
    ...Object.entries(GROUPS).map(([g, meaning]) => `- \`${g}.*\`: ${meaning}`),
    "",
    "The templates, exactly as written in `src/lib/analyser-x/copy.ts` (`p` holds the finding's parameters):",
    "",
    "~~~~ts",
    ...templates.map((t) => `${t.id}: ${t.line}`),
    "~~~~",
    "",
    "## 6. Thresholds and reference lists",
    "",
    "Four-pillar standing (`src/lib/pillar-standing.ts`):",
    "",
    "~~~~json",
    JSON.stringify(PILLAR_STANDING_CONFIG, null, 2),
    "~~~~",
    "",
    "Independent testing houses (`src/lib/analyser-x/ladder.ts`). A lab not on this list is \"named\" but not \"independent\", which caps the evidence level at 4. Changing this list changes brands' evidence levels:",
    "",
    INDEPENDENT_LABS.map((l) => `\`${l}\``).join(", "),
    "",
    "## 7. The model prompt, exactly as sent",
    "",
    "`PRODUCT_REVIEW_SYSTEM_PROMPT` in `src/lib/product-review-context.ts`. The model reads and proposes; the verdict, the evidence level and the decision are computed in code (sections 3 to 5).",
    "",
    "~~~~text",
    PRODUCT_REVIEW_SYSTEM_PROMPT.trim(),
    "~~~~",
    "",
    "## 8. Where things are",
    "",
    "Longer hand-written documents (they can lag the code; this file cannot):",
    "",
    ...ROOT_DOCS.map(([f, what]) => `- \`${f}\`: ${what}`),
    "",
    "Core code:",
    "",
    "- `src/lib/product-review-engine.ts`: `runProductReview` (one analysis, start to finish) and `deriveVerdict`",
    "- `src/lib/product-review-context.ts`: the model prompt",
    "- `src/lib/review-checks.ts`: the checks a fresh analysis must pass before it is kept (the live search and the re-runs both apply them)",
    "- `src/lib/pillar-standing.ts`, `src/lib/pills-page.ts`, `src/lib/pills-for-review.ts`: standing, and the page built from a stored analysis",
    "- `src/lib/analyser-flags.ts`: the flags above",
    "",
    "Version X1 decision layer, `src/lib/analyser-x/`:",
    "",
    ...xFiles.map((f) => {
      const summary = fileSummary(read(root, `src/lib/analyser-x/${f}`));
      return `- \`${f}\`${summary ? `: ${summary}` : ""}`;
    }),
    "",
    "## 9. Decision log",
    "",
    "Written by a person, newest first. It records what was decided about the analyser or the site's content, the reason given, and how to undo it.",
    "",
    decisions,
    "",
    "## 10. Ingredient-source policy",
    "",
    read(root, "docs/ingredient-sources.md").trim(),
    "",
    "## 11. Approved source fingerprints",
    "",
    "CI compares these SHA-256 fingerprints with the source. Any change in these files requires regenerating this reference and reviewing the change against the approved baseline in docs/ANALYSER-APPROVED.md.",
    "",
    "| Source | SHA-256 |",
    "|---|---|",
    ...analyserSourceManifest(root).map((item) => `| \`${item.path}\` | \`${item.sha256}\` |`),
    "",
  );
  return out.join("\n");
}
