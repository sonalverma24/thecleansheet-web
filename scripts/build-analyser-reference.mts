/* Rewrite ANALYSER-REFERENCE.md from the code.  Run: npm run docs:analyser
   (src/lib/analyser-reference.test.ts fails when the committed file differs from what this writes.)
   Nothing is read from a database or the network, and no key is needed. */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildAnalyserReference } from "@/lib/analyser-reference";

const root = process.cwd();
const text = buildAnalyserReference(root);
writeFileSync(join(root, "ANALYSER-REFERENCE.md"), text);
console.log(`wrote ANALYSER-REFERENCE.md (${text.split("\n").length} lines)`);
