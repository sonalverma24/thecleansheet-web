/* ────────────────────────────────────────────────────────────────
   Analyser vX · the verifier: the only door from neural to symbolic

   A proposal becomes a fact only if:
     1. its payload matches the schema for its kind;
     2. every quoted span appears in the observation it cites, and that observation
        was captured successfully;
     3. nothing it says is taken from an observation flagged as injection-suspected
        at more than the lowest trust.

   A proposal with no spans, or a span the text does not contain, is "unsupported":
   it is recorded in the run log and can appear only as an analyst note. It can never
   create a fact, so it can never reach a rule.

   The one exception is an ingredient list the model transcribed with no source. It is
   admitted at trust 1 with origin "model", which no rule treats as reliable.
──────────────────────────────────────────────────────────────── */

import type { ClaimValue, Fact, ListSource, ListValue, Observation, Origin, Proposal, ProposalKind, Trust } from "./types";
import { hashOf } from "./factstore";

export interface VerifyResult {
  status: "admitted" | "unsupported" | "rejected";
  reasons: string[];
  fact?: Omit<Fact, "id">;
}

const MIN_QUOTE = 12;

/** Case, spacing, quote style and punctuation do not decide whether a quote is present. */
export const squash = (s: string): string =>
  s.toLowerCase().normalize("NFKD").replace(/[‘’‚‛′`´]/g, "'").replace(/[“”„‟″]/g, '"').replace(/[^a-z0-9%]+/g, " ").trim();

export function spanHolds(quote: string, obs: Observation | undefined): boolean {
  if (!obs || !obs.ok) return false;
  const q = squash(quote);
  return q.length >= MIN_QUOTE && squash(obs.text).includes(q);
}

type Check = (p: Record<string, unknown>) => string[];
const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

const SCHEMAS: Record<ProposalKind, Check> = {
  claim: (p) => [
    ...(isStr(p.text) ? [] : ["claim.text must be a non-empty string"]),
    ...(isStrArr(p.platforms) ? [] : ["claim.platforms must be a string array"]),
    ...(isStr(p.primaryType) ? [] : ["claim.primaryType must be a string"]),
  ],
  "inci.list": (p) => [
    ...(isStrArr(p.ingredients) && (p.ingredients as string[]).length > 0 ? [] : ["inci.list.ingredients must be a non-empty string array"]),
    ...(["incidecoder", "brand_page", "retailer", "model", "pack"].includes(String(p.source)) ? [] : ["inci.list.source is not recognised"]),
  ],
  "evidence.record": (p) => [
    ...(isStr(p.docType) ? [] : ["evidence.docType must be a string"]),
    ...(typeof p.productMatches === "boolean" ? [] : ["evidence.productMatches must be a boolean"]),
    ...(p.endpoint === undefined || isStr(p.endpoint) ? [] : ["evidence.endpoint must be a string"]),
    ...(p.direction === undefined || ["improved", "no_change", "worse"].includes(String(p.direction)) ? [] : ["evidence.direction is not recognised"]),
    ...(p.significant === undefined || typeof p.significant === "boolean" ? [] : ["evidence.significant must be a boolean"]),
  ],
  "register.entry": (p) => [
    ...(isStr(p.register) ? [] : ["register.register must be a string"]),
    ...(isStr(p.identifier) ? [] : ["register.identifier must be a string"]),
    ...(isStr(p.productName) ? [] : ["register.productName must be a string"]),
    ...(["EU", "IN", "US", "KR", "AU", "CA"].includes(String(p.jurisdiction)) ? [] : ["register.jurisdiction is not recognised"]),
    ...(typeof p.productMatches === "boolean" ? [] : ["register.productMatches must be a boolean"]),
  ],
  price: (p) => [
    ...(isStr(p.platform) ? [] : ["price.platform must be a string"]),
    ...(typeof p.amount === "number" && p.amount > 0 ? [] : ["price.amount must be a positive number"]),
  ],
  "page.signal": (p) => (typeof p.rxText === "boolean" ? [] : ["page.signal.rxText must be a boolean"]),
};

const PREDICATE: Record<ProposalKind, Fact["predicate"]> = {
  claim: "claim", "inci.list": "inci.list", "evidence.record": "evidence.record", price: "price", "page.signal": "page.signal", "register.entry": "register.entry",
};

/** Sanity check mirroring sanitizeInciList in src/lib/product-identity.ts: no sentences, numbers or tiny lists. */
export function listLooksSane(items: string[]): boolean {
  if (items.length < 3) return false;
  const bad = items.filter((t) => t.length > 80 || t.split(/\s+/).length > 9 || /^[\d\s.%]+$/.test(t) || /^(free from|without|no|with|contains|made)\b/i.test(t));
  return bad.length <= Math.max(1, Math.floor(items.length * 0.1));
}

export function verifyProposal(
  p: Proposal,
  observations: ReadonlyMap<string, Observation>,
  opts: { subject: string },
): VerifyResult {
  const problems = SCHEMAS[p.kind]?.(p.payload) ?? [`unknown proposal kind ${String(p.kind)}`];
  if (problems.length) return { status: "rejected", reasons: problems };

  // The single exception: an unsourced ingredient list is admitted at the lowest trust, as the model's own reading.
  if (p.kind === "inci.list" && p.payload.source === "model" && p.spans.length === 0) {
    const ingredients = p.payload.ingredients as string[];
    const value: ListValue = { ingredients, source: "model", sane: listLooksSane(ingredients) };
    return { status: "admitted", reasons: ["model transcription, trust 1"], fact: { predicate: "inci.list", subject: opts.subject, value: value as unknown as Record<string, unknown>, trust: 1, origin: "model", spans: [], derivedFrom: [] } };
  }

  if (p.spans.length === 0) return { status: "unsupported", reasons: ["no supporting quote"] };

  const failed = p.spans.filter((s) => !spanHolds(s.quote, observations.get(s.observationId)));
  if (failed.length) {
    return { status: "unsupported", reasons: failed.map((s) => `quote not found in observation ${s.observationId}: "${s.quote.slice(0, 40)}"`) };
  }

  const cited = p.spans.map((s) => observations.get(s.observationId) as Observation);
  let trust = Math.min(...cited.map((o) => o.trust)) as Trust;
  const reasons: string[] = [];
  if (cited.some((o) => o.flags.includes("injection-suspected"))) {
    trust = Math.min(trust, 1) as Trust;
    reasons.push("cited text was flagged injection-suspected: trust capped at 1");
  }
  const origin: Origin = "source";
  const base = { predicate: PREDICATE[p.kind], subject: opts.subject, trust, origin, spans: p.spans, derivedFrom: cited.map((o) => o.id) };

  if (p.kind === "claim") {
    const c = p.payload;
    const value: ClaimValue = {
      text: String(c.text),
      platforms: c.platforms as string[],
      types: isStrArr(c.types) ? c.types : [String(c.primaryType)],
      primaryType: String(c.primaryType),
      emotional: c.primaryType === "emotional",
      drugBoundary: c.drugBoundary === true,
      asciConcern: c.asciConcern === true,
      corroborated: true, // its quote was found in text we read
      evidenceLevel: 1,   // set by the ladder from verified evidence records, never from the proposal
      levelOrigin: "ladder",
    };
    return { status: "admitted", reasons, fact: { ...base, value: value as unknown as Record<string, unknown> } };
  }

  if (p.kind === "register.entry") {
    return { status: "admitted", reasons, fact: { ...base, value: { ...p.payload, url: cited[0].url, capturedAt: cited[0].fetchedAt } } };
  }

  if (p.kind === "inci.list") {
    const ingredients = p.payload.ingredients as string[];
    const value: ListValue = {
      ingredients,
      source: p.payload.source as ListSource,
      url: cited[0].url,
      quote: p.spans[0].quote,
      capturedAt: cited[0].fetchedAt,
      truncated: p.payload.truncated === true,
      sane: listLooksSane(ingredients),
    };
    return { status: "admitted", reasons, fact: { ...base, value: value as unknown as Record<string, unknown> } };
  }

  return { status: "admitted", reasons, fact: { ...base, value: { ...p.payload, proposalId: p.id, h: hashOf(p.id) } } };
}
