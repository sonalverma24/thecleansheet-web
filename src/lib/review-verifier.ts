/* Review verifier: the symbolic half of the "AI proposes, code disposes" design.

   Deterministic checks over a stored or freshly produced review. No AI calls, no
   network. Every finding is a LEAD for a person, with a rule id and a severity; none
   is an auto-applied correction, and none is a claim that the product or the brand is
   at fault. Uncertainty becomes visible here instead of a silent assumption.

   Nothing in this file touches the verdict. Policy changes (should a catch-all gate
   the badge, should Good Standing need an anchored INCI) are separate owner decisions
   and live in the verdict code behind their own flags, not here. */

import { normaliseIngredient, type NormalisedIngredient } from "@/lib/inci-normalise";
import { reviewInciList } from "@/lib/review-inci";
import { classifySlashCell } from "@/lib/inci-cells";
import { claimKey, DEFAULT_ONTOLOGY, HAZARD_DISCLAIMER, ontologyTick, type Ontology } from "@/lib/claim-ontology";
import type { InciEvidence, ProductReview } from "@/lib/product-review-types";

/* ── Capture trust ────────────────────────────────────────────── */

/** How reliably the source TEXT is captured. It is NOT authority over the formula: a
    tier-3 INCIDecoder quote does not outrank a tier-4 brand page on what is chemically
    true, and a recorded quote proves only that the text was captured as stated. It does
    not prove the formula is true, current for this SKU, or valid for this region or
    version. Policy never does arithmetic on these numbers. */
export const CaptureTrust = {
  /** Model output with no quoted source. Never ships as fact. */
  AI_TRANSCRIPTION: 1,
  /** Marketplace listing text: marketing-adjacent and often copied between products. */
  RETAILER: 2,
  /** User-edited reference (INCIDecoder): a good anchor with its own typos and gaps. */
  REFERENCE_DB: 3,
  /** The brand's own web panel: may lag or differ from the current pack. */
  OFFICIAL_PAGE: 4,
  /** A photo or transcription of the physical label of the current batch. */
  OFFICIAL_PACK: 5,
} as const;
export type CaptureTrustValue = (typeof CaptureTrust)[keyof typeof CaptureTrust];

export interface Evidence {
  value: string;
  sourceUrl: string;
  /** Exact source text the value came from. Empty means unanchored. */
  quote: string;
  captureTrust: CaptureTrustValue;
  /** The source's own title for the product, kept so an identity mismatch is visible. */
  matchedTitle?: string;
  retrievedAt?: string;
  /** True when this was inferred from an older review that predates evidence capture. */
  legacy?: boolean;
}

/** Anchored means a quote was captured from a real source. Nothing more. */
export const isAnchored = (e: Evidence): boolean => e.quote.trim().length > 0 && e.captureTrust > CaptureTrust.AI_TRANSCRIPTION;

const RETAILER_HOST_RE =
  /(?:^|\.)(?:nykaa|amazon|flipkart|myntra|purplle|tirabeauty|tatacliq|ajio|meesho|shopsy|sephora|bigbasket|blinkit|zepto|swiggy|1mg|pharmeasy|smytten|nnnow)\./i;

/** The capture trust a source URL can claim. No URL means the model's own transcription. */
export function captureTrustForUrl(url: string | null | undefined): CaptureTrustValue {
  if (!url) return CaptureTrust.AI_TRANSCRIPTION;
  let host = "";
  try { host = new URL(url).hostname; } catch { return CaptureTrust.AI_TRANSCRIPTION; }
  if (/(?:^|\.)incidecoder\.com$/i.test(host)) return CaptureTrust.REFERENCE_DB;
  if (RETAILER_HOST_RE.test(`${host}.`)) return CaptureTrust.RETAILER;
  return CaptureTrust.OFFICIAL_PAGE;
}

/** The record stored on a review at extraction time. */
export function makeInciEvidence(
  sourceUrl: string | null | undefined,
  quote: string | null | undefined,
  retrievedAt: string,
  matchedTitle?: string,
): InciEvidence {
  return {
    sourceUrl: sourceUrl ?? "",
    captureTrust: captureTrustForUrl(sourceUrl),
    quote: (quote ?? "").trim(),
    retrievedAt,
    ...(matchedTitle ? { matchedTitle } : {}),
  };
}

/** The evidence behind a review's ingredient list. Reviews stored before evidence
    capture existed are rebuilt from `inciSourceUrl` and marked legacy: their source is
    known, but no quote was kept, so they can never count as anchored. */
export function evidenceForReview(review: Pick<ProductReview, "inciEvidence" | "inciSourceUrl" | "inciIngredients" | "ingredientReads">): Evidence {
  const list = reviewInciList(review).join(", ");
  const e = review.inciEvidence;
  if (e) return { value: list, sourceUrl: e.sourceUrl, quote: e.quote, captureTrust: e.captureTrust, matchedTitle: e.matchedTitle, retrievedAt: e.retrievedAt };
  return { value: list, sourceUrl: review.inciSourceUrl ?? "", quote: "", captureTrust: captureTrustForUrl(review.inciSourceUrl), legacy: true };
}

/* ── Findings ─────────────────────────────────────────────────── */

/** `hold` means eligible for a precautionary hold on a NEW review while it is checked.
    It is a precaution, never a finding of fault. */
export type Severity = "info" | "review_required" | "hold";

export type RuleCode =
  | "QUANTITY_UNSPECIFIED"
  | "CATCH_ALL"
  | "DUPLICATE_ENTRY"
  | "PROVENANCE_GAP"
  | "UNANCHORED_EVIDENCE"
  | "CLAIM_DISPUTE"
  | "PARSING_AMBIGUITY"
  | "MODEL_READ_MISMATCH"
  | "SOURCE_CONFLICT"
  | "ANCHOR_IDENTITY_MISMATCH"
  | "NORMALISATION_SUGGESTION";

/** How firmly a claim and the recorded list disagree. Neither is a confirmed product
    defect: confirming needs a person to check product and variant relevance and what
    the claim actually means.
      lead              the page and the recorded list or analysis text disagree.
      definitive_match  a REVIEWED ontology member is on an ANCHORED list. */
export type DisputeStrength = "lead" | "definitive_match";

export interface Finding {
  code: RuleCode;
  severity: Severity;
  message: string;
  strength?: DisputeStrength;
  /** The claim a CLAIM_DISPUTE is about, in claimKey form. */
  subject?: string;
}

/* ── Ingredient list checks ───────────────────────────────────── */

const wordIn = (needle: string, hay: string) =>
  new RegExp(`(?:^|[^a-z0-9])${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^a-z0-9])`, "i").test(hay);

/** How many entries of the official label name this ingredient. Two or more means the
    duplicate is the brand's own wording, not an ingestion error. */
function labelMentions(canonical: string, labelEcho: string[]): number {
  return labelEcho.filter((entry) => wordIn(canonical, entry)).length;
}

export interface InciVerification {
  findings: Finding[];
  normalised: NormalisedIngredient[];
}

/** Deterministic checks over one ingredient list. `labelEcho` is the official label's
    list for the same product when one is known: it is used only to mark which
    anomalies echo the brand's own wording. */
export function verifyInciList(rawList: string[], evidence: Evidence, labelEcho: string[] = []): InciVerification {
  const findings: Finding[] = [];
  const normalised = rawList.map(normaliseIngredient);

  const seen = new Set<string>();
  const reported = new Set<string>();
  for (const n of normalised) {
    const key = n.canonical.toLowerCase();
    if (seen.has(key) && !reported.has(key)) {
      reported.add(key);
      const echo = labelMentions(n.canonical, labelEcho) >= 2;
      findings.push({
        code: "DUPLICATE_ENTRY",
        severity: "review_required",
        message: `'${n.canonical}' appears more than once` +
          (echo ? " (echoes the source label itself; normalise with a source note, do not 'fix' the analyser's reading)" : ""),
      });
    }
    seen.add(key);

    if (n.quantityUnspecified) {
      findings.push({
        code: "QUANTITY_UNSPECIFIED",
        severity: "info",
        message: `'${n.canonical}' is a named ingredient with unspecified quantity (q.s.); this is NOT an undisclosed-base finding`,
      });
    }
    // Only the rubric's own definition. A fragrance declaration ("Parfum", "Sugandhit
    // Dravya") is deliberately not a catch-all: same disclosure, so same treatment.
    if (n.catchAll) {
      findings.push({
        code: "CATCH_ALL",
        severity: "review_required",
        message: `'${n.raw}' names no composition (${n.catchAll}). A disclosure gap under the rubric, not a safety finding`,
      });
    }
    for (const s of n.suggestions) {
      findings.push({ code: "NORMALISATION_SUGGESTION", severity: "info", message: `'${n.raw}': ${s}` });
    }
    const cell = classifySlashCell(n.raw);
    if (cell?.kind === "two_ingredients") {
      findings.push({
        code: "PARSING_AMBIGUITY",
        severity: "review_required",
        message: `'${n.raw}' reads as two known ingredients (${cell.halves.join(" and ")}) fused into one cell. Not split automatically: a person decides`,
      });
    } else if (cell) {
      findings.push({
        code: "PARSING_AMBIGUITY",
        severity: "info",
        message: `'${n.raw}' reads as an INCI name written with its common name (a display convention); matched on '${cell.halves[0]}'`,
      });
    }
  }

  if (normalised.length) {
    const caps = rawList.filter((x) => x.length > 3 && /[A-Z]/.test(x) && x === x.toUpperCase()).length;
    if (caps / normalised.length > 0.6 && evidence.captureTrust <= CaptureTrust.RETAILER) {
      findings.push({
        code: "PROVENANCE_GAP",
        severity: "review_required",
        message: `${caps}/${normalised.length} entries are ALL-CAPS from a capture-trust ${evidence.captureTrust} source: a formatting signal of unanchored transcription, not a chemistry defect`,
      });
    }
  }

  if (!isAnchored(evidence)) {
    findings.push({
      code: "UNANCHORED_EVIDENCE",
      // A review stored before evidence capture existed cannot be re-quoted, so it
      // is noted rather than queued: the census would otherwise flag every old row.
      severity: evidence.legacy ? "info" : "review_required",
      message: evidence.legacy
        ? "ingredient list predates evidence capture; no quoted source text was kept"
        : "ingredient list has no quoted source text; it cannot be audited after the fact",
    });
  }

  return { findings, normalised };
}

/* ── Claim disputes ───────────────────────────────────────────── */

/* The page must not tick a claim that the recorded list or its own analysis text puts
   in doubt. Two signals, and neither is allowed to clear the other:
   1. Structural: the tick against the claim ontology and the recorded list. This is
      the primary signal and does not depend on any wording.
   2. Prose: a quoted claim named next to "contradict..." in the analysis text. It can
      raise a lead. Nothing in the wording (hedges such as "technically") can lower or
      clear a structural finding, and prose is never used to dismiss a lead.
   Negation is honoured only when it is bound to the claim it governs: the negation
   phrase must follow that quoted claim in the same sentence ("'Paraben Free' is
   supported by the absence of contradictory evidence"). A negation elsewhere in the
   sentence or text leaves the claim a lead. Quote handling is deliberately permissive:
   an unusual quote shape yields a lead rather than silence. */
const QUOTED_RE = /[‘'"]([^'"‘’]{2,60}?)[’'"](?![a-z0-9])/gi;

const NEGATION_AFTER_CLAIM_RE =
  /^[^a-z0-9]*(?:(?:is|are|was|were|remains?|stays?|stands?|holds?)\s+)?(?:(?:fully|also|therefore)\s+)?(?:supported|upheld|consistent|valid|true|accurate)\b[^.]{0,60}?\b(?:absence|lack)\s+of\s+contradict/;

interface QuotedClaim { text: string; start: number; end: number }

function quotedClaims(sentence: string): QuotedClaim[] {
  return [...sentence.matchAll(QUOTED_RE)].map((m) => ({ text: m[1], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length }));
}

function negatedAndBound(lowerSentence: string, claim: QuotedClaim, next?: QuotedClaim): boolean {
  const tail = lowerSentence.slice(claim.end, next ? next.start : claim.end + 110);
  return NEGATION_AFTER_CLAIM_RE.test(tail);
}

/** Claims the analysis prose says are contradicted, with the sentence they came from. */
export function proseDisputedClaims(analysisTexts: string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const text of analysisTexts) {
    for (const sentence of text.split(/(?<=[.!?])\s+/)) {
      const lower = sentence.toLowerCase();
      const quotes = quotedClaims(lower);
      if (!quotes.length) continue;
      for (const m of lower.matchAll(/contradict\w*/g)) {
        const at = m.index ?? 0;
        // Quoted claims attach just before ("'X' claims are contradicted") or just
        // after ("contradicts the 'X' claim"). A wider window pulls in unrelated claims.
        const lo = Math.max(0, at - 120), hi = at + m[0].length + 40;
        quotes.forEach((q, i) => {
          if (q.end < lo || q.start > hi) return;
          if (negatedAndBound(lower, q, quotes[i + 1])) return;
          const key = claimKey(q.text);
          if (!out.has(key)) out.set(key, sentence.trim().slice(0, 220));
        });
      }
    }
  }
  return out;
}

export interface DisputeInput {
  /** Labels of the ticks the page SHOWS as true. */
  ticks: string[];
  inci: string[];
  analysisTexts: string[];
  /** Whether the ingredient list is anchored (a quote was captured). */
  anchored: boolean;
  ontology?: Ontology;
}

export function verifyClaimDisputes({ ticks, inci, analysisTexts, anchored, ontology = DEFAULT_ONTOLOGY }: DisputeInput): Finding[] {
  const prose = proseDisputedClaims(analysisTexts);
  const findings: Finding[] = [];
  for (const tick of ticks) {
    const subject = claimKey(tick);
    const structural = ontologyTick(tick, inci, ontology);
    const hits = structural?.hits ?? [];
    const snippet = prose.get(subject);
    if (!hits.length && !snippet) continue;

    const definitive = hits.filter((h) => h.strength === "definitive");
    const strength: DisputeStrength = definitive.length && anchored ? "definitive_match" : "lead";
    // A qualified relation alone is noted, not queued: a person has to decide what the
    // claim means, and queueing every benzyl-alcohol product would bury the real leads.
    const severity: Severity = strength === "definitive_match" ? "hold" : hits.length && !snippet && !definitive.length ? "info" : "review_required";

    const parts: string[] = [];
    if (hits.length) parts.push(`the recorded list names ${[...new Set(hits.map((h) => h.ingredient))].join(", ")} (${definitive.length ? "a reviewed member" : "a relation that needs a person's call"} of this claim class)`);
    if (snippet) parts.push(`the analysis text disputes it: "${snippet}"`);
    const hazards = [...new Map(hits.filter((h) => h.hazard).map((h) => [h.hazard!.text, h.hazard!])).values()];
    const context = hits.length
      ? ` ${HAZARD_DISCLAIMER}${hazards.map((h) => ` Hazard context (${h.source}): ${h.text}.`).join("")}`
      : "";
    findings.push({
      code: "CLAIM_DISPUTE",
      severity,
      strength,
      subject,
      message: `At a glance ticks '${tick.trim()}', but ${parts.join(" and ")}. A lead about the recorded list, not a confirmed product defect.${context}` +
        (strength === "definitive_match" ? " Precautionary hold eligible on a new review." : ""),
    });
  }
  return findings;
}

/** The review's own analysis prose: every field where the model may have written that a
    claim is contradicted. Brand wording (claim text) is left out on purpose. */
export function reviewAnalysisTexts(review: ProductReview): string[] {
  const texts: (string | null | undefined)[] = [];
  for (const c of review.claimMap ?? []) texts.push(c.evidenceNote, c.asciNote, c.drugBoundaryNote);
  texts.push(review.formulaLogic?.claimOverreachNote, review.formulaLogic?.note);
  texts.push(review.verdict?.biggestConcern, review.verdict?.bestThing, review.verdict?.cleanSheetTakeaway);
  texts.push(...(review.ingredientTransparency?.issues ?? []), ...(review.platformParity?.issues ?? []));
  return texts.filter((t): t is string => typeof t === "string" && t.trim().length > 0);
}

/** Every check that can run on a review. `glanceTicks` are the labels the page shows as
    true (see at-a-glance.ts); pass none to skip the claim-dispute check. */
export function verifyReview(review: ProductReview, glanceTicks: string[] = [], ontology: Ontology = DEFAULT_ONTOLOGY): Finding[] {
  const inci = reviewInciList(review);
  const evidence = evidenceForReview(review);
  const findings = inci.length ? verifyInciList(inci, evidence).findings : [];
  if (glanceTicks.length) {
    findings.push(...verifyClaimDisputes({ ticks: glanceTicks, inci, analysisTexts: reviewAnalysisTexts(review), anchored: isAnchored(evidence), ontology }));
  }
  return findings;
}
