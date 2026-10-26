/* ────────────────────────────────────────────────────────────────
   Analyser Version X1 · build the rule context from the fact store

   Chooses the ingredient list to judge (the highest-trust sane list), decides whether
   it is reliable, and gathers the other facts the rules read. All judgement about
   reliability lives here, in one place.
──────────────────────────────────────────────────────────────── */

import type { FactStore } from "./factstore";
import type {
  AcquisitionValue, BenchmarkValue, ClaimValue, ListState, ListValue, PageSignalValue, ProfileValue, RegisterEntryValue, RuleContext, ScreenValue, Trust,
} from "./types";

/** A list is reliable when it came from a reference database or a brand page (trust 3 or more), is not in conflict
    with another source, was not truncated, and passed the sanity check. Nothing less may support a negative outcome
    that depends on the list. */
export function buildListState(store: FactStore): ListState {
  const lists = store.byPredicate<ListValue>("inci.list");
  const conflictIds = new Set(store.conflicts().filter((c) => c.predicate === "inci.list").flatMap((c) => c.factIds));
  if (!lists.length) return { ingredients: [], source: "none", trust: 0, reliable: false, anchored: false, conflicting: false };

  const best = [...lists].sort((a, b) => b.trust - a.trust || b.value.ingredients.length - a.value.ingredients.length)[0];
  const conflicting = conflictIds.size > 0;
  const v = best.value;
  const reliable = best.trust >= 3 && v.sane && !v.truncated && !conflicting && v.ingredients.length >= 3;
  return {
    ingredients: v.ingredients,
    source: v.source,
    trust: best.trust as Trust,
    url: v.url,
    quote: v.quote,
    capturedAt: v.capturedAt,
    reliable,
    anchored: !!(v.quote && v.quote.trim()),
    conflicting,
    factId: best.id,
  };
}

export function buildContext(store: FactStore, now: string): RuleContext {
  const profiles = store.byPredicate<ProfileValue>("profile");
  if (!profiles.length) throw new Error("buildContext: no profile fact. A decision needs a product profile.");
  const acq = store.byPredicate<AcquisitionValue>("acquisition")[0];
  const screen = store.byPredicate<ScreenValue>("screen")[0];
  const signals = store.byPredicate<PageSignalValue>("page.signal");
  return {
    now,
    profile: profiles[0].value,
    list: buildListState(store),
    claims: store.byPredicate<ClaimValue>("claim").map((f) => ({ fact: f.id, value: f.value })),
    acquisition: acq ? acq.value : null,
    signals: { rxText: signals.some((s) => s.value.rxText === true) },
    screen: screen ? screen.value : null,
    benchmark: store.byPredicate<BenchmarkValue>("benchmark")[0]?.value ?? null,
    register: store.byPredicate<RegisterEntryValue>("register.entry")
      .filter((f) => f.origin === "source")
      .map((f) => ({ fact: f.id, value: f.value, trust: f.trust, url: f.value.url, capturedAt: f.value.capturedAt })),
  };
}
