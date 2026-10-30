/* Imports the TCS packaging spreadsheet into the sourcing directory data files.

   Fill one sheet per record type, export each as CSV (comma separated, UTF-8)
   into one folder named suppliers.csv, products.csv, offerings.csv and
   verifications.csv, then run:

   npx tsx --tsconfig tsconfig.json scripts/packaging-import.mts <folder>
   npx tsx --tsconfig tsconfig.json scripts/packaging-import.mts <folder> --check
     (validate only, write nothing)
   npx tsx --tsconfig tsconfig.json scripts/packaging-import.mts <folder> --out <dir>
     (write the four files somewhere else, e.g. to look at them first)
   npx tsx --tsconfig tsconfig.json scripts/packaging-import.mts <folder> --allow-empty
     (needed to replace a store that has records with an empty one)

   The CSVs are the source of truth: every import REPLACES the four data files in
   src/data/packaging/, so keep the spreadsheet and re-export after any change.
   Nothing is written unless every row in every file is valid. Blank templates
   with one commented example row each are in scripts/packaging-templates/. */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PACKAGING_CATALOGUE } from "@/data/packaging";
import { pilotProgress } from "@/lib/packaging-catalogue";
import { formatIssue, runImport } from "@/lib/packaging-import";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const outIdx = args.indexOf("--out");
const outDir = outIdx >= 0 ? args[outIdx + 1] : undefined;
const inputDir = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--out");

if (!inputDir || (outIdx >= 0 && !outDir)) {
  console.error("Usage: npx tsx --tsconfig tsconfig.json scripts/packaging-import.mts <folder with the four CSVs> [--check] [--out <dir>] [--allow-empty]");
  process.exit(2);
}

const storeDir = fileURLToPath(new URL("../src/data/packaging/", import.meta.url));
const dryRun = flag("check");

// Pass 1: validate only, so the shrink guard can run before anything is written.
const checked = runImport(path.resolve(inputDir), { storeDir, outDir: outDir ? path.resolve(outDir) : undefined, dryRun: true });
if (!checked.ok) {
  console.error(`\n${checked.issues.length} problem${checked.issues.length === 1 ? "" : "s"} found. Nothing was written.\n`);
  for (const issue of checked.issues) console.error(`  ${formatIssue(issue)}`);
  console.error("\nFix the rows above in the spreadsheet, export the CSV again and re-run. Rows are numbered as the spreadsheet shows them (the header is row 1).");
  process.exit(1);
}

const before = {
  suppliers: PACKAGING_CATALOGUE.suppliers.length,
  products: PACKAGING_CATALOGUE.products.length,
  offerings: PACKAGING_CATALOGUE.offerings.length,
  verifications: PACKAGING_CATALOGUE.verifications.length,
};
const emptied = (Object.keys(before) as (keyof typeof before)[]).filter((k) => before[k] > 0 && checked.counts[k] === 0);
if (!dryRun && !outDir && emptied.length > 0 && !flag("allow-empty")) {
  console.error(`Refusing to empty ${emptied.join(", ")}: the data files hold records but the CSVs have none for them.`);
  console.error("Check that <folder> is the right one (not the blank templates). Pass --allow-empty if this is intended. Nothing was written.");
  process.exit(1);
}

const result = dryRun ? checked : runImport(path.resolve(inputDir), { storeDir, outDir: outDir ? path.resolve(outDir) : undefined });
if (!result.ok) throw new Error("import failed after validation passed");

const shown = (f: string) => { const rel = path.relative(process.cwd(), f); return rel.startsWith("..") ? f : rel; };
const progress = pilotProgress(result.catalogue);
console.table(
  (Object.keys(result.counts) as (keyof typeof result.counts)[]).map((k) => ({ records: k, current: before[k], imported: result.counts[k] })),
);
console.log(`Pilot progress: ${progress.suppliers} suppliers, ${progress.variants} variants, ${progress.familiesWithSupplier} of ${progress.families} families have a supplier, ${progress.familiesCovered} have three or more.`);
if (result.warnings.length > 0) {
  console.log(`\n${result.warnings.length} warning${result.warnings.length === 1 ? "" : "s"} (not blocking):`);
  for (const w of result.warnings) console.log(`  ${w}`);
}
console.log(dryRun ? "\nCheck only: nothing was written." : `\nWrote ${result.written.length} files:\n${result.written.map((f) => `  ${shown(f)}`).join("\n")}`);
process.exit(0);
