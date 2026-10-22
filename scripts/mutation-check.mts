/* Mutation sweep for the neuro-symbolic analyser's rules.

   Applies one small, deliberate break at a time to a rule file, runs the test suites
   that should notice, and records whether any test failed ("killed") or all stayed
   green ("survived"). A survivor is either a missing test or an EQUIVALENT mutant (a
   change that cannot alter behaviour), and an equivalent one must say why. This is a
   targeted sweep over the rules in this plan, not a full mutation-testing tool, so read
   its score as "these specific breaks are caught", not as proof of correctness.

   Every file is restored after each run, and on exit or interrupt. Run:
     npx tsx --tsconfig tsconfig.json scripts/mutation-check.mts [--only <id-prefix>] */
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

interface Mutation { id: string; file: string; find: string; replace: string; equivalent?: string }

const N = "src/lib/inci-normalise.ts";
const V = "src/lib/review-verifier.ts";
const I = "src/lib/identity-resolution.ts";
const O = "src/lib/claim-ontology.ts";
const A = "src/lib/at-a-glance.ts";
const CE = "src/lib/capture-evidence.ts";
const IC = "src/lib/inci-cells.ts";
const RA = "src/lib/reviewer-audit.ts";
const R = "src/lib/inci-reanchor.ts";
const F = "src/lib/inci-fetch.ts";
const P = "src/lib/inci-from-page.ts";
const PG = "src/lib/pillar-grade.ts";
const PS = "src/lib/pillar-standing.ts";
const CP = "src/lib/compliance-pillar.ts";
const GS = "src/lib/global-screen.ts";
const EN = "src/lib/product-review-engine.ts";
const SC = "src/lib/review-to-scorecard.ts";
const HR = "src/components/scorecards/ProductHero.tsx";
const XD = "extension/verdict-display.js";
const XP = "extension/popup.js";

const MUTATIONS: Mutation[] = [
  // normaliser
  { id: "N1 qs-lookbehind-removed", file: N, find: "(?<![a-z])q\\.?", replace: "q\\.?" },
  { id: "N2 water-synonyms-off", file: N, find: "parts.every((p) => WATER.has(p))", replace: "false" },
  { id: "N3 fragrance-fold-off", file: N, find: "parts.every((p) => FRAGRANCE.has(p))", replace: "false" },
  { id: "N4 hindi-suggestion-off", file: N, find: 'suggestions.push("possible INCI: Parfum - confirm against source");', replace: "void 0;" },
  { id: "N5 edta-reversal-off", file: N, find: "const edta = REVERSED_EDTA_RE.exec(stem);", replace: "const edta = null as RegExpExecArray | null;" },
  { id: "N6 shorthand-off", file: N, find: "SHORTHAND_BY_KEY.get(", replace: "new Map<string, string>().get(" },
  { id: "N7 qs-flag-forced-false", file: N, find: "const quantityUnspecified = QS_TAIL_RE.test(text);", replace: "const quantityUnspecified = false;" },
  { id: "N8 inci-key-slash-kept", file: N, find: 'canonical.split(" / ")[0] ?? canonical', replace: "canonical" },
  { id: "N9 fragrance-declaration-off", file: N, find: 'fragranceDeclaration: canonical === "Fragrance" || hindiFragrance,', replace: "fragranceDeclaration: false," },
  { id: "N10 catchall-off", file: N, find: "catchAll: catchAllKind(text),", replace: "catchAll: null," },
  // verifier
  { id: "V1 echo-threshold-1", file: V, find: "labelMentions(n.canonical, labelEcho) >= 2", replace: "labelMentions(n.canonical, labelEcho) >= 1" },
  { id: "V2 echo-threshold-3", file: V, find: "labelMentions(n.canonical, labelEcho) >= 2", replace: "labelMentions(n.canonical, labelEcho) >= 3" },
  { id: "V3 caps-ratio-ge", file: V, find: "caps / normalised.length > 0.6", replace: "caps / normalised.length >= 0.6" },
  { id: "V4 caps-ratio-high", file: V, find: "caps / normalised.length > 0.6", replace: "caps / normalised.length > 0.99" },
  { id: "V5 caps-length-2", file: V, find: "x.length > 3 && /[A-Z]/.test(x)", replace: "x.length > 2 && /[A-Z]/.test(x)" },
  { id: "V6 provenance-trust-widened", file: V, find: "evidence.captureTrust <= CaptureTrust.RETAILER", replace: "evidence.captureTrust <= CaptureTrust.OFFICIAL_PAGE" },
  { id: "V7 legacy-severity-review", file: V, find: 'severity: evidence.legacy ? "info" : "review_required",', replace: 'severity: "review_required",' },
  { id: "V8 anchored-ge", file: V, find: "e.captureTrust > CaptureTrust.AI_TRANSCRIPTION", replace: "e.captureTrust >= CaptureTrust.AI_TRANSCRIPTION" },
  { id: "V9 incidecoder-trust", file: V, find: "return CaptureTrust.REFERENCE_DB;", replace: "return CaptureTrust.OFFICIAL_PAGE;" },
  { id: "V10 dispute-ignores-anchoring", file: V, find: "definitive.length && anchored ?", replace: "definitive.length ?" },
  { id: "V11 qualified-alone-queued", file: V, find: 'hits.length && !snippet && !definitive.length ? "info" : "review_required"', replace: '"review_required"' },
  { id: "V12 negation-phrase-broken", file: V, find: "(?:absence|lack)\\s+of\\s+contradict", replace: "(?:zzzz)\\s+of\\s+contradict" },
  { id: "V13 window-before-0", file: V, find: "const lo = Math.max(0, at - 120)", replace: "const lo = Math.max(0, at - 0)" },
  { id: "V14 no-sentence-split", file: V, find: "text.split(/(?<=[.!?])\\s+/)", replace: "[text]" },
  { id: "V15 negation-slice-unbound", file: V, find: "lowerSentence.slice(claim.end, next ? next.start : claim.end + 110)", replace: "lowerSentence.slice(claim.end)",
    equivalent: "the negation regex is anchored at the start of the tail and its tail clause cannot span a full stop, so a longer slice cannot change a match the shorter one makes" },
  { id: "V16 verifyReview-anchored-true", file: V, find: "anchored: isAnchored(evidence), ontology", replace: "anchored: true, ontology" },
  { id: "V17 prose-never-leads", file: V, find: "if (!hits.length && !snippet) continue;", replace: "if (!hits.length) continue;" },
  { id: "V18 dispute-hold-severity", file: V, find: 'strength === "definitive_match" ? "hold"', replace: 'strength === "definitive_match" ? "review_required"' },
  // identity
  { id: "I1 formula-threshold-off", file: I, find: "inciJaccard >= t.inci", replace: "true" },
  { id: "I2 brand-check-off", file: I, find: "brandKey(a.brand) !== brandKey(b.brand)", replace: "false" },
  { id: "I3 nested-required-off", file: I, find: "if (!nested || nameJaccard < t.name)", replace: "if (nameJaccard < t.name)" },
  { id: "I4 name-floor-off", file: I, find: "if (!nested || nameJaccard < t.name)", replace: "if (!nested)" },
  { id: "I5 missing-list-ignored", file: I, find: "if (!a.inci?.length || !b.inci?.length) {", replace: "if (false) {" },
  { id: "I6 formula-threshold-95", file: I, find: "const DEFAULTS: IdentityThresholds = { name: 0.6, inci: 0.75 };", replace: "const DEFAULTS: IdentityThresholds = { name: 0.6, inci: 0.95 };" },
  { id: "I7 formula-threshold-50", file: I, find: "const DEFAULTS: IdentityThresholds = { name: 0.6, inci: 0.75 };", replace: "const DEFAULTS: IdentityThresholds = { name: 0.6, inci: 0.5 };" },
  // ontology
  { id: "O1 provenance-source-check-off", file: O, find: 'if (!isAuthoritativeSource(e.source)) out.push(', replace: "if (false) out.push(" },
  { id: "O2 provenance-reviewer-check-off", file: O, find: 'if (!isReviewRef(e.reviewRef)) out.push(', replace: "if (false) out.push(" },
  { id: "O3 provenance-date-check-off", file: O, find: 'if (!isReviewDate(e.reviewedAt, now)) out.push(', replace: "if (false) out.push(" },
  { id: "O11 declared-strength-ignored", file: O, find: 'return e.strength === "definitive" && provenanceProblems(e, now).length === 0 ? "definitive" : "qualified";', replace: 'return provenanceProblems(e, now).length === 0 ? "definitive" : "qualified";' },
  { id: "O12 cas-checksum-ignored", file: O, find: "return sum % 10 === Number(m[3]);", replace: "return true;" },
  { id: "O13 cas-digit-run-allowed", file: O, find: "(?<![\\d-])(\\d{2,7})", replace: "(\\d{2,7})" },
  { id: "O14 https-not-required", file: O, find: 'if (u.protocol !== "https:") return false;', replace: "" },
  { id: "O15 host-substring-match", file: O, find: "hosts.some((h) => host === h || host.endsWith(`.${h}`))", replace: "hosts.some((h) => host.includes(h))" },
  { id: "O19 future-date-allowed", file: O, find: "d.getTime() <= now.getTime()", replace: "true" },
  { id: "O20 impossible-date-allowed", file: O, find: "d.toISOString().slice(0, 10) === t", replace: "true" },
  { id: "O21 hazard-source-not-required", file: O, find: "isAuthoritativeSource(e.hazard.source) ? e.hazard : undefined", replace: "e.hazard" },
  { id: "O22 sulphate-entry-fold-off", file: O, find: 'n.replace(/\\bsulphate/g, "sulfate")', replace: "n" },
  { id: "O4 exact-becomes-word", file: O, find: 'e.match === "exact" ? n === form : containsWords(n, form)', replace: "containsWords(n, form)" },
  { id: "O5 word-boundary-before-off", file: O, find: "if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return true;", replace: "if (!/[a-z0-9]/.test(after)) return true;" },
  { id: "O6 word-boundary-after-off", file: O, find: "if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return true;", replace: "if (!/[a-z0-9]/.test(before)) return true;" },
  { id: "O7 first-occurrence-only", file: O, find: "for (let i = hay.indexOf(needle); i !== -1; i = hay.indexOf(needle, i + 1)) {", replace: "for (let i = hay.indexOf(needle); i !== -1; i = -1) {" },
  { id: "O8 sulphate-spelling-off", file: O, find: ".replace(/sulphate/g, \"sulfate\")", replace: "" },
  { id: "O9 definitive-wins-off", file: O, find: 'if (hits.some((h) => h.strength === "definitive")) return { outcome: "present", hits };', replace: "" },
  { id: "O10 all-hits-collected", file: O, find: "break; // one hit per INCI item is enough", replace: "" },
  // ticks
  { id: "A1 present-tick-true", file: A, find: 'if (t.outcome === "present") out.push({ label: item.label, value: false });', replace: 'if (t.outcome === "present") out.push({ label: item.label, value: true });' },
  { id: "A2 warned-ignored", file: A, find: 't.outcome === "clear" && !warned', replace: 't.outcome === "clear"' },
  { id: "A3 ontology-flag-ignored", file: A, find: "(opts?.ontology ? applyOntologyTicks(items, product) : items).slice(0, 8);\n}\n\n/* The /analyzed", replace: "applyOntologyTicks(items, product).slice(0, 8);\n}\n\n/* The /analyzed" },
  // re-anchoring (exact rules; no threshold approves)
  { id: "R1 list-subset-accepted", file: R, find: "const exact = at === sk.length && at === tk.length;", replace: "const exact = at === Math.min(sk.length, tk.length);" },
  { id: "R2 order-ignored", file: R, find: "const exact = at === sk.length && at === tk.length;", replace: "const exact = !onlyInStored.length && !onlyInSource.length;" },
  { id: "R3 duplicates-not-counted", file: R, find: "return n > (other.get(keys[i]) ?? 0);", replace: "return !other.has(keys[i]);" },
  { id: "R4 name-subset-accepted", file: R, find: "const wordsEqual = words.size > 0 && sameSet(words, wantWords);", replace: "const wordsEqual = words.size > 0 && [...words].every((w) => wantWords.has(w));" },
  { id: "R5 name-superset-accepted", file: R, find: "const wordsEqual = words.size > 0 && sameSet(words, wantWords);", replace: "const wordsEqual = words.size > 0 && [...wantWords].every((w) => words.has(w));" },
  { id: "R6 brand-check-off", file: R, find: "if (!brandOk) {", replace: "if (false) {" },
  { id: "R7 incidecoder-brand-any", file: R, find: "? source.brandNames.some((b) => brandKey(b) === wantBrand)", replace: "? true" },
  { id: "R8 variant-check-off", file: R, find: "const variantsEqual = sameList(got.variants, want.variants);", replace: "const variantsEqual = true;" },
  { id: "R9 title-not-required", file: R, find: "if (!source.titles.length) {", replace: "if (false) {" },
  { id: "R10 truncated-quote-accepted", file: R, find: "else if (!source.quoteComplete) fail(", replace: "else if (false) fail(" },
  { id: "R11 empty-quote-accepted", file: R, find: 'if (!source.quote.trim()) fail("NO_QUOTE"', replace: 'if (false) fail("NO_QUOTE"' },
  { id: "R12 quote-list-mismatch-accepted", file: R, find: "else if (!quoteHoldsList(source.quote, source.ingredients)) fail(", replace: "else if (false) fail(" },
  { id: "R13 unkeyed-entry-compared", file: R, find: "if (sk.some((k) => !k) || tk.some((k) => !k)) {", replace: "if (false) {" },
  { id: "R14 dry-run-writes", file: R, find: "if (opts.apply) {", replace: "if (true) {" },
  { id: "R15 stale-row-overwritten", file: R, find: "if (JSON.stringify(now.result) !== JSON.stringify(previous))", replace: "if (false)" },
  { id: "R16 anchored-rows-refetched", file: R, find: "if (isAnchored(evidenceForReview(review))) {", replace: "if (false) {" },
  { id: "R17 retailer-reanchorable", file: R, find: 'case CaptureTrust.RETAILER: return "retailer";', replace: 'case CaptureTrust.RETAILER: return "brand_page";' },
  { id: "R18 unit-spellings-not-folded", file: R, find: "UNIT[unit] ?? unit", replace: "unit" },
  { id: "R19 spf-plus-dropped", file: R, find: '${m[2] ? "+" : ""}', replace: "" },
  { id: "R20 brand-named-in-any-word", file: R, find: "containsRun(wordList(t), wantBrand.split(\" \"))", replace: "t.toLowerCase().includes(wantBrand)" },
  { id: "F1 window-cut-not-flagged", file: F, find: "quoteFull.length > QUOTE_CAP || windowCut", replace: "quoteFull.length > QUOTE_CAP" },
  { id: "F2 quote-cap-not-flagged", file: F, find: "quoteFull.length > QUOTE_CAP || windowCut", replace: "windowCut" },
  { id: "F3 slug-title-used", file: F, find: "pageTitle: titleMatch ? titleMatch[1].trim() || null : null,", replace: "pageTitle: productName," },
  { id: "P1 quote-is-whole-page", file: P, find: 'quote: text.slice(from, to).replace(/\\s+/g, " ").trim(),', replace: "quote: text," },
  { id: "P2 quote-starts-at-part", file: P, find: "if (at >= 0) pushEntry(p, at, p.text.length);\n      continue;", replace: "if (at >= 0) pushEntry(p, 0, p.text.length);\n      continue;" },
  // sentence ends inside an accepted entry
  { id: "P3 sentence-end-never-splits", file: P, find: "if (sentences.length === 1) {", replace: "if (true) {" },
  { id: "P4 run-not-ended-at-stop", file: P, find: "if (k > 0) {\n        flush();\n        const lm = LABEL.exec(sentence.text);", replace: "if (k > 0) {\n        const lm = LABEL.exec(sentence.text);" },
  { id: "P5 label-after-stop-ignored", file: P, find: "if (lm && looksLikeIngredient(lm[1])) {\n          const at =", replace: "if (false) {\n          const at =" },
  { id: "P6 abbreviation-set-ignored", file: P, find: "DOT_ABBREVIATIONS.has(word.toLowerCase())", replace: "false" },
  { id: "P7 dotted-abbreviation-split", file: P, find: 'word.includes(".") || ', replace: "" },
  { id: "P8 lower-case-starts-sentence", file: P, find: "\\.\\s+(?=[A-Z])/g", replace: "\\.\\s+(?=[A-Za-z])/g" },
  { id: "P9 closing-bracket-not-a-stop", file: P, find: "(?<=[A-Za-z0-9)])\\.\\s+", replace: "(?<=[A-Za-z0-9])\\.\\s+" },
  { id: "P10 short-sentence-kept", file: P, find: "if (looksLikeIngredient(entry.text)) push(cleanTok(entry.text)", replace: "if (true) push(cleanTok(entry.text)" },
  { id: "P11 sentence-offsets-from-piece-start", file: P, find: "map: p.map.slice(a, b) }))", replace: "map: p.map.slice(0, b - a) }))" },
  ...["sect", "subsp", "ssp", "spp", "sp", "var", "cv", "f", "ext", "eq", "denat", "st"].map((w, i) => (
    { id: `P${12 + i} abbreviation-${w}-removed`, file: P, find: `"${w}",`, replace: "" }
  )),
  // a list's last entry printed with a full stop (closingEntryEnd, pushClosing)
  { id: "P24 closing-entry-never-kept", file: P, find: "if (end > 0) push(cleanTok(p.text.slice(0, end)), spanOf(p, 0, end));", replace: "void end;" },
  { id: "P25 closing-not-tried-at-header", file: P, find: "else pushClosing(p, head.length);", replace: ";" },
  { id: "P26 closing-not-tried-at-rejected-piece", file: P, find: "pushClosing(p, p.text.length);\n    flush();", replace: "flush();" },
  { id: "P27 closing-reads-past-the-header", file: P, find: "else pushClosing(p, head.length);", replace: "else pushClosing(p, p.text.length);" },
  { id: "P28 run-continues-after-closing-entry", file: P, find: "pushClosing(p, p.text.length);\n    flush();", replace: "pushClosing(p, p.text.length);" },
  { id: "P29 first-sentence-not-checked", file: P, find: "return looksLikeIngredient(t.slice(0, end)) ? end : 0;", replace: "return end;" },
  { id: "P30 trailing-entry-not-checked", file: P, find: "if (stop === undefined || !looksLikeIngredient(t.slice(0, stop))) return 0;", replace: "if (stop === undefined) return 0;" },
  { id: "P31 abbreviation-stop-dropped", file: P, find: "return endsInAbbreviation(t.slice(0, stop)) ? t.length : stop;", replace: "return stop;" },
  { id: "P32 sentence-stop-kept", file: P, find: "return endsInAbbreviation(t.slice(0, stop)) ? t.length : stop;", replace: "return t.length;" },
  { id: "P33 one-sentence-split-first", file: P, find: "if (spans.length > 1) {", replace: "if (spans.length > 0) {" },
  { id: "P34 last-sentence-taken", file: P, find: "const end = spans[0][1];", replace: "const end = spans[spans.length - 1][1];" },
  { id: "P35 trailing-bracket-not-a-stop", file: P, find: "(?<=[A-Za-z0-9)])\\.$", replace: "(?<=[A-Za-z0-9])\\.$" },
  { id: "P36 trailing-digit-not-a-stop", file: P, find: "(?<=[A-Za-z0-9)])\\.$", replace: "(?<=[A-Za-z)])\\.$" },
  { id: "P37 closing-entry-span-includes-stop", file: P, find: "spanOf(p, 0, end));", replace: "spanOf(p, 0, Math.min(end + 1, p.text.length)));" },
  { id: "P38 closing-entry-not-tidied", file: P, find: "push(cleanTok(p.text.slice(0, end)), spanOf(p, 0, end));", replace: "push(p.text.slice(0, end), spanOf(p, 0, end));" },
  // the first entry when an earlier "ingredients" word makes the label capture too long (labelledEntryStart)
  { id: "P39 later-label-words-not-tried", file: P, find: "label.lastIndex = m.index + 1;", replace: "break;" },
  { id: "P40 label-capture-not-checked", file: P, find: "if (looksLikeIngredient(m[1])) return m.index", replace: "if (true) return m.index" },
  { id: "P41 label-search-case-sensitive", file: P, find: 'new RegExp(LABEL.source, "gi")', replace: 'new RegExp(LABEL.source, "g")' },
  { id: "P42 header-piece-first-label-only", file: P, find: "const at = labelledEntryStart(p.text);\n      if (at >= 0) pushEntry(p, at, p.text.length);\n      continue;",
    replace: "const lm = LABEL.exec(p.text);\n      const at = lm && looksLikeIngredient(lm[1]) ? lm.index + lm[0].length - lm[1].length : -1;\n      if (at >= 0) pushEntry(p, at, p.text.length);\n      continue;" },
  { id: "P43 rejected-piece-first-label-only", file: P, find: "const at = labelledEntryStart(p.text);\n    if (at >= 0) pushEntry(p, at, p.text.length);\n  }\n  flush();",
    replace: "const lm = LABEL.exec(p.text);\n    const at = lm && looksLikeIngredient(lm[1]) ? lm.index + lm[0].length - lm[1].length : -1;\n    if (at >= 0) pushEntry(p, at, p.text.length);\n  }\n  flush();" },
  { id: "P44 header-piece-no-label-pushed", file: P, find: "if (at >= 0) pushEntry(p, at, p.text.length);\n      continue;", replace: "if (true) pushEntry(p, at, p.text.length);\n      continue;" },
  { id: "P45 rejected-piece-no-label-pushed", file: P, find: "if (at >= 0) pushEntry(p, at, p.text.length);\n  }\n  flush();", replace: "if (true) pushEntry(p, at, p.text.length);\n  }\n  flush();" },
  { id: "P46 last-accepted-label-taken", file: P,
    find: `const label = new RegExp(LABEL.source, "gi");\n  for (let m = label.exec(text); m; m = label.exec(text)) {\n    if (looksLikeIngredient(m[1])) return m.index + m[0].length - m[1].length;\n    label.lastIndex = m.index + 1;\n  }\n  return -1;`,
    replace: `const label = new RegExp(LABEL.source, "gi");\n  let last = -1;\n  for (let m = label.exec(text); m; m = label.exec(text)) {\n    if (looksLikeIngredient(m[1])) last = m.index + m[0].length - m[1].length;\n    label.lastIndex = m.index + 1;\n  }\n  return last;` },
  { id: "P47 entry-starts-at-label-word", file: P, find: "if (looksLikeIngredient(m[1])) return m.index + m[0].length - m[1].length;", replace: "if (looksLikeIngredient(m[1])) return m.index;" },
  { id: "P48 rejected-piece-entry-from-part-start", file: P, find: "if (at >= 0) pushEntry(p, at, p.text.length);\n  }\n  flush();", replace: "if (at >= 0) pushEntry(p, 0, p.text.length);\n  }\n  flush();" },
  // capture outcomes
  { id: "C1 formula-conflict-keeps-status", file: CE, find: 'if (outcome === "formula_conflict") return "conflicting";', replace: 'if (outcome === "formula_conflict") return current;' },
  { id: "C2 match-clears-conflict", file: CE, find: 'if (outcome === "matches") return current === "conflicting" ? "conflicting" : "anchored";', replace: 'if (outcome === "matches") return "anchored";' },
  { id: "C3 identity-failure-changes-status", file: CE, find: 'if (outcome === "formula_conflict") return "conflicting";\n  return current;', replace: 'if (outcome === "formula_conflict") return "conflicting";\n  return "unverified";' },
  { id: "C4 identity-not-checked-first", file: CE, find: 'if ([...codes].some((c) => IDENTITY_CODES.has(c))) return "identity_failed";', replace: "" },
  { id: "C5 unkeyed-is-a-conflict", file: CE, find: ' || d.diff.kind === "unkeyed"', replace: "" },
  { id: "C6 model-read-always-anchored", file: CE, find: 'status: outcome === "matches" ? "anchored" : "unverified"', replace: 'status: "anchored"' },
  { id: "C7 never-queue", file: CE, find: 'queue: outcome !== "matches"', replace: "queue: false" },
  { id: "C8 conflict-wording-softened", file: CE, find: "Conflicting ingredient sources - assessment under review", replace: "Ingredient source not yet verified." },
  { id: "C9 model-mismatch-uses-source-code", file: CE, find: 'proposer === "model"\n      ?', replace: 'false\n      ?' },
  { id: "C10 unusable-codes-empty", file: CE, find: 'const UNUSABLE_CODES = new Set(["NO_STORED_LIST", "NO_SOURCE_LIST"]);', replace: "const UNUSABLE_CODES = new Set<string>();",
    equivalent: "a capture with no list fails with NO_SOURCE_LIST plus a quote failure only, which falls through every other branch to the final 'unusable' return" },
  { id: "C11 provisional-copy-changed", file: CE, find: "Provisional assessment. Based on the ingredient list currently recorded", replace: "Provisional. Based on the list recorded" },
  // slash cells
  { id: "K1 known-halves-not-required", file: IC, find: 'allKnown && slugs.size > 1', replace: "slugs.size > 1" },
  { id: "K2 same-substance-not-checked", file: IC, find: 'allKnown && slugs.size > 1', replace: "allKnown" },
  { id: "K3 unspaced-slash-split", file: IC, find: "if (!/ \\/ /.test(raw)) return null;", replace: "if (!/\\//.test(raw)) return null;",
    equivalent: "splitting an unspaced slash on ' / ' yields a single part, and the next line returns null for fewer than two parts, so the precheck cannot change the result" },
  { id: "K4 two-ingredients-never", file: IC, find: '"two_ingredients" : "display_convention"', replace: '"display_convention" : "display_convention"' },
  { id: "V19 slash-lead-demoted", file: V, find: 'if (cell?.kind === "two_ingredients") {', replace: "if (false) {" },
  { id: "V20 disclaimer-dropped", file: V, find: "const context = hits.length\n      ?", replace: "const context = false\n      ?" },
  { id: "V21 hazard-text-without-source", file: V, find: "const hazards = [...new Map(hits.filter((h) => h.hazard)", replace: "const hazards = [...new Map(hits.filter((h) => !h.hazard)" },
  { id: "O23 ref-pattern-unanchored", file: O, find: "/^TCS-P-\\d{3,6}$/", replace: "/TCS-P-\\d{3,6}/" },
  { id: "O24 ref-min-digits-relaxed", file: O, find: "TCS-P-\\d{3,6}", replace: "TCS-P-\\d{1,6}" },
  { id: "O25 attribution-ungated", file: O, find: 'return effectiveStrength(e, now) === "definitive" ? PANEL_ATTRIBUTION : null;', replace: "return PANEL_ATTRIBUTION;" },
  // reviewer register audit
  { id: "RA1 bad-ref-not-flagged", file: RA, find: "if (!isReviewRef(ref)) {", replace: "if (false) {" },
  { id: "RA2 missing-register-ignored", file: RA, find: "if (register === null) {", replace: "if (false) {" },
  { id: "RA3 unknown-ref-ignored", file: RA, find: "if (records.length === 0) {", replace: "if (false) {" },
  { id: "RA4 duplicate-ref-ignored", file: RA, find: "if (records.length > 1) {", replace: "if (false) {" },
  { id: "RA5 inactive-ignored", file: RA, find: "if (!rec.active)", replace: "if (false)" },
  { id: "RA6 owner-ignored", file: RA, find: "if (rec.isSiteOwner)", replace: "if (false)" },
  { id: "RA7 credential-ignored", file: RA, find: "if (!rec.credential?.trim())", replace: "if (false)" },
  { id: "RA8 qualified-entries-audited", file: RA, find: 'entry.strength === "definitive" && (entry.reviewRef', replace: "(entry.reviewRef" },

  // pillar grading and thresholds
  { id: "PGR1 hard-adverse-ignored", file: PG, find: "if (c.hard) hardFail = true;", replace: "if (false) hardFail = true;" },
  { id: "PGR2 soft-adverse-free", file: PG, find: "points: params.deductSoft", replace: "points: 0" },
  { id: "PGR3 brand-stated-free", file: PG, find: "if (params.deductDisclosed > 0) deductions.push(", replace: "if (false) deductions.push(" },
  { id: "PGR4 not-disclosed-one-rate", file: PG, find: "const pts = params.deductNotDisclosed[c.obtainability];", replace: "const pts = params.deductNotDisclosed.public;" },
  { id: "PGR5 not-applicable-counted", file: PG, find: 'c.pillar === pillar && c.state !== "not-applicable"', replace: "c.pillar === pillar" },
  { id: "PGR6 empty-pillar-zero", file: PG, find: "mine.length === 0 ? 100 :", replace: "mine.length === 0 ? 0 :" },
  { id: "PGR7 score-floor-unclamped", file: PG, find: "Math.max(0, Math.min(100,", replace: "Math.max(-100, Math.min(100," },
  { id: "PGR8 hard-fail-keeps-score", file: PG, find: "score: hardFail ? 0 : score,", replace: "score," },
  { id: "PGR9 well-cutoff-exclusive", file: PG, find: "!g.hardFail && g.score >= cutoff", replace: "!g.hardFail && g.score > cutoff" },
  { id: "PGR10 well-ignores-hard-fail", file: PG, find: "!g.hardFail && g.score >= cutoff", replace: "g.score >= cutoff" },
  { id: "PGR11 floor-inclusive", file: PG, find: ": boolean => g.hardFail || g.score < floor;", replace: ": boolean => g.hardFail || g.score <= floor;" },
  { id: "PGR12 guard-adverse-dropped", file: PG, find: 'g.score < floor && g.deductions.some((d) => d.why === "soft-adverse")', replace: "g.score < floor" },
  { id: "PGR13 one-failing-is-enough", file: PG, find: '.length >= 2) return "Not Recommended";', replace: '.length >= 1) return "Not Recommended";' },
  { id: "PGR14 three-failing-needed", file: PG, find: '.length >= 2) return "Not Recommended";', replace: '.length >= 3) return "Not Recommended";' },
  { id: "PGR15 any-well-is-enough", file: PG, find: "if (grades.every((g) => scoresWell(g, t.well))) return o.boundaryOnly", replace: "if (grades.some((g) => scoresWell(g, t.well))) return o.boundaryOnly" },
  { id: "PGR16 boundary-cap-removed", file: PG, find: 'if (grades.every((g) => scoresWell(g, t.well))) return o.boundaryOnly ? "Room to Improve" : "Good Standing";', replace: 'if (grades.every((g) => scoresWell(g, t.well))) return "Good Standing";' },
  { id: "PGR17 guard-option-ignored", file: PG, find: "const fails = opts.requireAdverse ? failsWithAdverse : failsPillar;", replace: "const fails = failsPillar;" },
  { id: "PGR18 floor-above-well-allowed", file: PG, find: "if (t.floor > t.well) throw", replace: "if (false) throw" },
  // pillar standing (the live composition)
  { id: "PST1 no-list-guard-removed", file: PS, find: 'if (i.inci.length === 0 && !i.hardOverride) standing = "Room to Improve";', replace: 'if (false) standing = "Room to Improve";' },
  { id: "PST2 no-list-guard-beats-hard-flag", file: PS, find: "if (i.inci.length === 0 && !i.hardOverride)", replace: "if (i.inci.length === 0)" },
  { id: "PST3 failing-without-adverse", file: PS, find: "{ requireAdverse: true }", replace: "{ requireAdverse: false }" },
  { id: "PST4 catchall-check-always-added", file: PS, find: "const extra: CheckLike[] = catchAll.length", replace: "const extra: CheckLike[] = 1" },
  { id: "PST5 catchall-is-hard", file: PS, find: 'label: "Unnamed catch-all entries", state: "adverse", obtainability: "public"', replace: 'label: "Unnamed catch-all entries", state: "adverse", obtainability: "public", hard: true' },
  { id: "PST6 reason-on-hard-flag", file: PS, find: 'standing === "Not Recommended" && !i.hardOverride && failing.length', replace: 'standing === "Not Recommended" && failing.length' },
  { id: "PST7 status-ignores-guard", file: PS, find: 'failsWithAdverse(g, floor) ? "failing"', replace: 'g.score < floor ? "failing"' },
  { id: "PST8 well-cutoff-60", file: PS, find: "  well: 70,", replace: "  well: 60," },
  { id: "PST9 floor-40", file: PS, find: "  floor: 50,", replace: "  floor: 40," },
  // the four compliance items
  { id: "CMP1 banned-not-hard", file: CP, find: 'i.bannedCount > 0 ? mk("Regulatory screen", "adverse", true)', replace: 'i.bannedCount > 0 ? mk("Regulatory screen", "adverse")' },
  { id: "CMP2 no-list-reads-clear", file: CP, find: ': !i.hasInci || !i.globalScreen ? mk("Regulatory screen", "not-disclosed")', replace: ': false ? mk("Regulatory screen", "not-disclosed")' },
  { id: "CMP3 asci-always-applicable", file: CP, find: 'i.claimsAnalysed === 0 ? mk("ASCI screen", "not-applicable")', replace: 'false ? mk("ASCI screen", "not-applicable")' },
  { id: "CMP4 contradiction-not-hard", file: CP, find: 'i.claimsOutcome === "hard" ? mk("Claims screen", "adverse", true)', replace: 'i.claimsOutcome === "hard" ? mk("Claims screen", "adverse")' },
  { id: "CMP5 no-prefix-not-clear", file: CP, find: 't === "" || /^no\\b/.test(t) ||', replace: 't === "" ||' },
  { id: "CMP6 label-unclear-is-adverse", file: CP, find: 'i.usageWarningsClear ? "verified" : "not-disclosed"', replace: 'i.usageWarningsClear ? "verified" : "adverse"' },
  // the shared regulatory screen
  { id: "GSC1 stale-screen-served", file: GS, find: "const stale = !rs || Object.values(rs).some((v) => STALE_RE.test(String(v)));", replace: "const stale = !rs;" },
  { id: "GSC2 rebuild-from-one-ingredient", file: GS, find: "if (inci.length >= 3) return buildGlobalScreen(inci);", replace: "if (inci.length >= 1) return buildGlobalScreen(inci);" },
  { id: "GSC3 model-screen-dropped", file: GS, find: "return rs ? fromReview(rs) : undefined;", replace: "return undefined;" },
  // the engine wiring and stamping
  { id: "ENG1 flag-always-on", file: EN, find: "  if (isFlagOn(ANALYSER_FLAGS.pillarStanding)) {", replace: "  if (true) {" },
  { id: "ENG2 strict-bar-dropped", file: EN, find: "const strictBar = hardFlags === 0 && total >= APPROVAL_BAR && claimsHoldUp && safetyVerifiable && !hasEndocrineFlag;", replace: "const strictBar = true;" },
  { id: "ENG3 hard-override-dropped", file: EN, find: "const hardOverride = contradictionFlags > 0 || fairnessFlags > 0 || hasBannedIngredient;", replace: "const hardOverride = false;" },
  { id: "ENG4 boundary-cap-dropped", file: EN, find: "boundaryOnly: !hardOverride && boundaryFlags > 0,", replace: "boundaryOnly: false," },
  { id: "ENG5 stamp-ignores-flag", file: EN, find: "(isFlagOn(ANALYSER_FLAGS.pillarStanding) ? PILLAR_RUBRIC_REV : RUBRIC_REV)", replace: "(false ? PILLAR_RUBRIC_REV : RUBRIC_REV)" },
  { id: "ENG6 r9-not-accepted", file: EN, find: "[RUBRIC_REV, PILLAR_RUBRIC_REV];", replace: "[RUBRIC_REV];" },
  { id: "ENG7 any-revision-accepted", file: EN, find: 'typeof rev === "string" && ACCEPTED_RUBRIC_REVS.includes(rev)', replace: "true" },
  { id: "ENG8 store-stamps-constant", file: EN, find: "rubric_rev: activeRubricRev(),", replace: "rubric_rev: RUBRIC_REV," },
  { id: "ENG9 evidence-pct-wrong-scale", file: EN, find: "claimEvidencePct: Math.round((evidencePts / 20) * 100)", replace: "claimEvidencePct: Math.round(evidencePts * 20)" },
  { id: "ENG10 evidence-pct-with-flag-off", file: EN, find: "...(pillars ? { pillars, claimEvidencePct: Math.round((evidencePts / 20) * 100) } : {}),", replace: "...(pillars ? { pillars } : {}), claimEvidencePct: Math.round((evidencePts / 20) * 100)," },
  // the two surfaces that read the total
  { id: "SRF1 scorecard-key-always-present", file: SC, find: "...(typeof verdict.claimEvidencePct === \"number\" ? { claimEvidencePct: verdict.claimEvidencePct } : {}),", replace: "claimEvidencePct: verdict.claimEvidencePct," },
  { id: "SRF2 scorecard-drops-the-field", file: SC, find: "? { claimEvidencePct: verdict.claimEvidencePct } : {}", replace: "? {} : {}" },
  { id: "SRF3 hero-ignores-evidence-pct", file: HR, find: "const basis = product.claimEvidencePct ?? product.score;", replace: "const basis = product.score;" },
  { id: "SRF4 hero-zero-falls-back", file: HR, find: "const basis = product.claimEvidencePct ?? product.score;", replace: "const basis = product.claimEvidencePct || product.score;" },
  { id: "SRF5 hero-good-band-60", file: HR, find: "} else if (basis >= 70) {", replace: "} else if (basis >= 60) {" },
  { id: "SRF6 hero-strong-band-reads-total", file: HR, find: "} else if (basis >= 85) {", replace: "} else if (product.score >= 85) {" },
  { id: "SRF7 popup-total-ignores-pillars", file: XD, find: " && !(verdict && Array.isArray(verdict.pillars))", replace: "" },
  { id: "SRF8 popup-total-without-number", file: XD, find: 'return typeof total === "number" && !(verdict', replace: "return !(verdict" },
  { id: "SRF9 popup-pillars-truthy-check", file: XD, find: "Array.isArray(verdict.pillars)", replace: "verdict.pillars" },
  { id: "SRF10 popup-asks-with-no-verdict", file: XP, find: "TCSVerdictDisplay.showTotal(review, verdict)", replace: "TCSVerdictDisplay.showTotal(review, null)" },
  { id: "SRF11 popup-fallback-removed", file: XP, find: ": typeof total === \"number\";", replace: ": false;" },
  // the calm line for Good Standing with thin claim evidence (the 70 cutoff is the Good band's own, covered by SRF5)
  { id: "SRF12 calm-for-every-standing", file: HR, find: '(product.scoreLabel === "Excellent" || product.scoreLabel === "Good")', replace: "true" },
  { id: "SRF13 calm-excludes-good", file: HR, find: ' || product.scoreLabel === "Good")', replace: ")" },
  { id: "SRF14 calm-excludes-excellent", file: HR, find: '(product.scoreLabel === "Excellent" || ', replace: "(" },
  { id: "SRF15 calm-without-evidence-field", file: HR, find: "product.claimEvidencePct !== undefined && (product.scoreLabel", replace: "(product.scoreLabel" },
  { id: "SRF16 calm-field-truthy-check", file: HR, find: "product.claimEvidencePct !== undefined && (product.scoreLabel", replace: "!!product.claimEvidencePct && (product.scoreLabel" },
  { id: "SRF17 calm-wording-changed", file: HR, find: '"Claims rest on ingredient research, not finished-product tests"', replace: '"Claims rest on ingredient research"' },
  { id: "SRF18 calm-eats-the-good-band", file: HR, find: "} else if (basis >= 85) {", replace: '} else if (pillarGoodStanding && basis < 85) { evidence = "x"; } else if (basis >= 85) {' },
  { id: "SRF19 calm-ahead-of-badges", file: HR, find: 'if (pass.some((b) => b.includes("published spf")', replace: 'if (pillarGoodStanding) { evidence = "x"; } else if (pass.some((b) => b.includes("published spf")' },
  { id: "SRF20 calm-line-removed", file: HR, find: "} else if (pillarGoodStanding) {", replace: "} else if (false) {" },
];

const TESTS = [
  "src/lib/inci-normalise.test.ts", "src/lib/review-verifier.test.ts", "src/lib/identity-resolution.test.ts",
  "src/lib/claim-ontology.test.ts", "src/lib/verdict-parity.test.ts",
  "src/lib/inci-reanchor.test.ts", "src/lib/inci-from-page.test.ts", "src/lib/capture-evidence.test.ts", "src/lib/reviewer-audit.test.ts",
  "src/lib/pillar-grade.test.ts", "src/lib/pillar-standing.test.ts", "src/lib/compliance-pillar.test.ts", "src/lib/global-screen.test.ts",
  "src/lib/verdict-pillar.test.ts", "src/lib/rubric-accepted.test.ts",
  "src/lib/hero-score-meaning.test.ts", "src/lib/pillar-surfaces.test.ts", "src/lib/extension-verdict-display.test.ts",
];

const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : "";
const originals = new Map<string, string>();
const restoreAll = () => { for (const [f, s] of originals) writeFileSync(f, s); };
process.on("exit", restoreAll);
for (const sig of ["SIGINT", "SIGTERM"] as const) process.on(sig, () => { restoreAll(); process.exit(130); });

const runSuite = () => {
  const r = spawnSync("npx", ["vitest", "run", ...TESTS], { encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout}\n${r.stderr}` };
};

const base = runSuite();
if (base.code !== 0) { console.error("Baseline suite is not green. Fix that before mutating.\n" + base.out.slice(-1500)); process.exit(1); }

const rows: { id: string; result: string; note?: string }[] = [];
for (const m of MUTATIONS.filter((x) => !only || x.id.startsWith(only))) {
  if (!originals.has(m.file)) originals.set(m.file, readFileSync(m.file, "utf8"));
  const src = originals.get(m.file)!;
  const count = src.split(m.find).length - 1;
  if (count !== 1) { rows.push({ id: m.id, result: "NOT APPLIED", note: `pattern found ${count} times` }); continue; }
  writeFileSync(m.file, src.replace(m.find, () => m.replace));
  const { code, out } = runSuite();
  writeFileSync(m.file, src);
  if (code === 0) rows.push({ id: m.id, result: m.equivalent ? "equivalent" : "SURVIVED", note: m.equivalent });
  else if (/Transform failed|SyntaxError|Cannot find module/.test(out) && !/AssertionError|expected/.test(out)) rows.push({ id: m.id, result: "invalid", note: "did not compile" });
  else rows.push({ id: m.id, result: "killed" });
  process.stdout.write(`${m.id.padEnd(36)} ${rows[rows.length - 1].result}\n`);
}

const killed = rows.filter((r) => r.result === "killed").length;
const survived = rows.filter((r) => r.result === "SURVIVED");
const equiv = rows.filter((r) => r.result === "equivalent");
const bad = rows.filter((r) => r.result === "invalid" || r.result === "NOT APPLIED");
console.log(`\n${rows.length} mutations: ${killed} killed, ${survived.length} survived, ${equiv.length} equivalent (reasoned), ${bad.length} invalid or not applied`);
for (const r of survived) console.log(`  SURVIVED: ${r.id}`);
for (const r of equiv) console.log(`  equivalent: ${r.id}: ${r.note}`);
for (const r of bad) console.log(`  ${r.result}: ${r.id} ${r.note ?? ""}`);
process.exit(survived.length || bad.length ? 1 : 0);
