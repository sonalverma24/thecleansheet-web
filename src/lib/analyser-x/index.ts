/* ────────────────────────────────────────────────────────────────
   Analyser Version X1 · the buying decision, as used by the product page

   The decision core of the Version X1 decision core: the facts, the 34 named rules, the five pills and the reasons behind them.
   It is pure: no network, no database, no model, no clock (the date is passed in). `decideReview` reads a stored
   ProductReview, so nothing new is written anywhere.

   These files are a snapshot of analyser/vx/src (adapter, claimflags, context, copy, decision, factstore, invariants, kb,
   ladder, profile, regulatory, rules, screen, types, verifier). The agent, hooks, queue, email and evidence vault of the
   reference core are not part of the page and are not here. panel.ts is new (it lifts benchmarkPanel out of respond.ts).
──────────────────────────────────────────────────────────────── */

export { decideReview } from "./adapter";
export { benchmarkPanel, type BenchmarkPanel } from "./panel";
export { AUTHORITIES, AUTHORITY_LABEL, AUTHORITY_SHORT, shortList } from "./regulatory";
export { PILLS, sourceName } from "./copy";
export { STALE_DAYS } from "./kb";
export type { Authority, Decision, DecisionKey, DecisionReason } from "./types";

export { ANALYSER_RELEASE, ANALYSER_METHOD_VERSION } from "./version";
