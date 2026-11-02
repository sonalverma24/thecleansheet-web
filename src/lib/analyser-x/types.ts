/* ────────────────────────────────────────────────────────────────
   Analyser Version X1 · shared types

   The artifacts of the neurosymbolic loop, in the order they are made:

     Observation  captured text from a tool, with provenance and a trust level
     Proposal     a NEURAL reading of an observation (typed, unverified)
     Fact         a proposal the verifier admitted, or a derived/human assertion
     Finding      a RULE's output over facts, with the facts it used
     Decision     the buying-decision pill, built only from findings

   Neural components may only produce proposals. Nothing neural reaches a
   Decision except through the verifier and the rules.
──────────────────────────────────────────────────────────────── */

import { ANALYSER_METHOD_VERSION } from "./version";

/** How reliably the source text was captured: 1 model transcription, 2 retailer,
    3 reference database, 4 brand page, 5 a label photograph published online and read legibly (never a physical
    sample: a public review works only from what is published). 0 means no source. */
export type Trust = 0 | 1 | 2 | 3 | 4 | 5;

/** Who asserted a fact: the source itself (verified quote), the code, a person, or an unverified model. */
export type Origin = "source" | "derived" | "human" | "model";

export interface Observation {
  id: string;
  tool: string;
  url?: string;
  fetchedAt: string;
  ok: boolean;
  /** Captured text. Always treated as untrusted data, never as instructions. */
  text: string;
  trust: Trust;
  error?: string;
  /** Set by hooks, for example "injection-suspected" or "truncated". */
  flags: string[];
}

export interface Span {
  observationId: string;
  quote: string;
}

export type ProposalKind = "claim" | "inci.list" | "evidence.record" | "price" | "page.signal" | "register.entry";

export interface Proposal {
  id: string;
  kind: ProposalKind;
  payload: Record<string, unknown>;
  /** Quotes from observations that support the payload. The verifier checks each one. */
  spans: Span[];
  /** The reader that produced it. The harness records model id and prompt hash separately. */
  producer: string;
}

export type Predicate =
  | "inci.list" | "claim" | "evidence.record" | "price" | "page.signal" | "register.entry"
  | "profile" | "acquisition" | "screen" | "benchmark";

export interface Fact<V = Record<string, unknown>> {
  id: string;
  predicate: Predicate;
  subject: string;
  value: V;
  trust: Trust;
  origin: Origin;
  spans: Span[];
  /** Ids of the facts or observations this one was derived from. */
  derivedFrom: string[];
}

export interface Conflict {
  predicate: Predicate;
  subject: string;
  factIds: string[];
}

/* ── Typed fact values the rules read ─────────────────────────── */

export type ListSource = "incidecoder" | "brand_page" | "retailer" | "model" | "pack" | "none";

export interface ListValue {
  ingredients: string[];
  source: ListSource;
  url?: string;
  quote?: string;
  capturedAt?: string;
  /** True when the source window or quote cap cut the list. */
  truncated?: boolean;
  /** Passed the INCI sanity check (no sentences, numbers or ad copy). */
  sane: boolean;
}

export interface ClaimValue {
  text: string;
  platforms: string[];
  types: string[];
  primaryType: string;
  emotional: boolean;
  /** Proposed by the model; the rules treat them as model-origin. */
  drugBoundary: boolean;
  asciConcern: boolean;
  /** True when the claim text was found in text we read; false when it was not; undefined when never checked. */
  corroborated?: boolean;
  /** 1 to 7. Derived from evidence records by the ladder for fresh runs; carried over for legacy rows. */
  evidenceLevel: number;
  /** Who set evidenceLevel: the ladder (code) or the model (a legacy row). Decides the origin of a finding built on it. */
  levelOrigin: "ladder" | "model";
}

export interface AcquisitionValue {
  /** null for a name query, where no page was requested. */
  pageFetched: boolean | null;
  /** null when unknown (an older row). */
  grounded: boolean | null;
  inciSource: ListSource;
  errors: string[];
  /** Whether any claim-bearing source (a product page or a search) was read. null when unknown (an older row).
      With nothing read, an empty claim map means "not examined", never "no claims". */
  claimsSourceRead: boolean | null;
}

export interface ProfileValue {
  name: string;
  brand: string;
  category: string;
  family: string;
  targetUser: string;
  audience: string[];
  isRinseOff: boolean;
  isFacial: boolean;
  isSunscreen: boolean;
  isBaby: boolean;
  spf: number | null;
  /** The product was identified only from the typed text: no INCIDecoder match, no fetched page. */
  identityFromTextOnly: boolean;
  formulaPoints: number | null;
  overreach: boolean;
  analysedAt: string;
}

export interface PageSignalValue {
  rxText: boolean;
}

export interface SoftFinding {
  label: string;
  pillar: string;
  detail: string;
  /** The ingredients the check matched (see CheckResult.ingredients), so the page can mark them in the list. */
  ingredients?: string[];
}

export interface ScreenValue {
  /** `authorities` names who prohibits it (from the database row, or the backstop note). */
  prohibited: { name: string; note: string; authorities: Authority[] }[];
  endocrine: { name: string; note: string }[];
  softAdverse: SoftFinding[];
  /** Share of ingredients the database recognised, 0 to 1, and the counts behind it. */
  coverage: number;
  recognised: number;
  total: number;
  /** Declared ingredients the database does not resolve. A screen is complete only when this is empty. */
  unresolved: string[];
  catchAll: string[];
  failingPillars: { pillar: string; score: number; hardFail: boolean }[];
}

/* ── The regulatory benchmark ──────────────────────────────────── */

export type Authority = "EU" | "IN" | "US" | "KR" | "AU" | "CA";

export type RegStatus =
  | "prohibited" | "restricted_exceeded" | "restricted_ok" | "restricted_unverifiable"
  | "permitted" | "not_covered" | "low_confidence";

export interface AuthorityResult {
  /** meets: every ingredient resolved and clear. falls_short: prohibited or over a stated limit. unverified: no failure, but not fully checked. */
  verdict: "meets" | "falls_short" | "unverified";
  prohibited: string[];
  exceeded: { name: string; limit: number; declared: number }[];
  unverifiable: string[];
  notCovered: string[];
  lowConfidence: string[];
}

/** One authority's result in a form that is small enough to store with a decision and show on a page. */
export interface BenchmarkSummary {
  verdict: AuthorityResult["verdict"];
  prohibited: number;
  exceeded: number;
  unverifiable: number;
  notCovered: number;
  lowConfidence: number;
}

export interface BenchmarkValue {
  authorities: Record<Authority, AuthorityResult>;
  resolved: number;
  total: number;
}

/** A medicine register's entry for a product (ARTG, DailyMed, a national register), verified from its page. */
export interface RegisterEntryValue {
  register: string;
  identifier: string;
  productName: string;
  brand?: string;
  jurisdiction: Authority;
  /** Decided by code: the entry is about THIS product (brand, name key and variant key). */
  productMatches: boolean;
  url?: string;
  capturedAt?: string;
}

/* ── Rules, findings and decisions ─────────────────────────────── */

export type Severity = "medicinal" | "block" | "gap" | "caution" | "support" | "note";

export interface Finding {
  ruleId: string;
  severity: Severity;
  /** "code" findings are derived from facts by code; "model" findings rest on a model's judgement. */
  origin: "code" | "model";
  /** True when the finding is only trustworthy if the ingredient list is reliable. */
  needsReliableList: boolean;
  gapKind?: "acquisition" | "disclosure";
  params: Record<string, string | number | boolean | undefined>;
  derivedFrom: string[];
}

export interface ListState {
  ingredients: string[];
  source: ListSource;
  trust: Trust;
  url?: string;
  quote?: string;
  capturedAt?: string;
  reliable: boolean;
  /** A quote was captured from the source. A reliable list without one is usable but never earns high confidence. */
  anchored: boolean;
  conflicting: boolean;
  factId?: string;
}

export interface RuleContext {
  now: string;
  profile: ProfileValue;
  list: ListState;
  claims: { fact: string; value: ClaimValue }[];
  acquisition: AcquisitionValue | null;
  signals: PageSignalValue;
  screen: ScreenValue | null;
  /** What each authority says about the declared ingredients. Null when never computed. */
  benchmark: BenchmarkValue | null;
  /** Medicine-register entries read from official pages. Absence from a register is never evidence. */
  register: { fact: string; value: RegisterEntryValue; trust: Trust; url?: string; capturedAt?: string }[];
  /** The colours of the four product-page sections that come from the stored analysis (see sections.ts). Absent when a context is built without them; the
      decision then makes no use of the sections. */
  sections?: { formula: "green" | "yellow" | "red" | null; claims: "green" | "yellow" | "red" | null; tests: "green" | "yellow" | "red" | null; clarity: "green" | "yellow" | "red" | null };
}

export interface Rule {
  id: string;
  severity: Severity;
  origin: "code" | "model";
  needsReliableList?: boolean;
  /** Evaluation order: lower strata run first. */
  stratum: number;
  evaluate(ctx: RuleContext): Finding[];
}

export type DecisionKey = "good-choice" | "buy-with-caution" | "look-elsewhere" | "not-enough-info" | "medicinal-product";

export interface DecisionReason {
  ruleId: string;
  kind: Severity;
  origin: "code" | "model";
  text: string;
  evidence?: {
    ingredient?: string; claim?: string; source?: string; capturedAt?: string;
    /** Every ingredient the finding names, as the check matched it: a list entry, or a stem found inside one. */
    ingredients?: string[];
    /** The short label the finding puts beside each ingredient it names ("Comedogenicity risk"). */
    tag?: string;
  };
}

export interface Decision {
  key: DecisionKey;
  label: string;
  meaning: string;
  reasons: DecisionReason[];
  confidence: "high" | "medium" | "low";
  gapKind?: "acquisition" | "disclosure";
  basis: {
    listSource: ListSource;
    listTrust: Trust;
    listAnchored: boolean;
    claimsChecked: number;
    claimsCorroborated: number;
    grounded: boolean | null;
    screenCoverage: number;
    analysedAt: string;
    /** The global benchmark: each authority's result for the declared ingredients. Null when not computed. */
    benchmark: Record<Authority, BenchmarkSummary> | null;
  };
  version: typeof ANALYSER_METHOD_VERSION;
}
