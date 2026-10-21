/* Audit the reviewer references used by the claim ontology against the PRIVATE register.

   The register maps a panel reference (TCS-P-014) to a person. It must live outside this
   repository: the whole point is that no name ships with the code or reaches the site.
   Output lists references and alias forms only. It never prints a name or a credential.

   Run: ANALYSER_REVIEWER_REGISTER=/path/outside/the/repo/register.json \
        npx tsx --tsconfig tsconfig.json scripts/audit-reviewer-register.mts
   Or:  ... audit-reviewer-register.mts --register /path/to/register.json

   Register format: [{ "ref": "TCS-P-014", "name": "...", "credential": "...", "active": true }]
   Exit code: 0 when every definitive alias is backed by a valid reference, 1 otherwise. */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CLAIM_CLASSES } from "@/data/ingredients/claim-ontology";
import { auditReviewerRefs, type ReviewerRecord } from "@/lib/reviewer-audit";

const argIdx = process.argv.indexOf("--register");
const path = argIdx > -1 ? process.argv[argIdx + 1] : process.env.ANALYSER_REVIEWER_REGISTER;

const entries = CLAIM_CLASSES.flatMap((c) => c.entries.map((entry) => ({ classId: c.id, entry })));
const declared = entries.filter(({ entry }) => entry.strength === "definitive" && (entry.reviewRef ?? "").trim());

if (!declared.length) {
  console.log("No alias declares a reviewer reference yet, so there is nothing to audit.");
  console.log("Every alias is therefore qualified: none can be shown as reviewed by the TCS Panel.");
  process.exit(0);
}

let register: ReviewerRecord[] | null = null;
if (path) {
  const full = resolve(path);
  if (!existsSync(full)) { console.error(`Register not found at ${full}`); process.exit(1); }
  if (full.startsWith(process.cwd() + "/")) {
    console.warn("WARNING: the register is inside the repository folder. Keep it outside, or make sure it is gitignored, or a name could be committed.");
  }
  try { register = JSON.parse(readFileSync(full, "utf8")) as ReviewerRecord[]; }
  catch (e) { console.error("Register is not valid JSON:", (e as Error).message); process.exit(1); }
}

const problems = auditReviewerRefs(entries, register);
console.log(`${declared.length} alias(es) declare a reviewer reference; ${problems.length} problem(s).`);
for (const p of problems) console.log(`  ${p.code.padEnd(14)} ${p.ref.padEnd(11)} ${p.form}: ${p.detail}`);
process.exit(problems.length ? 1 : 0);
