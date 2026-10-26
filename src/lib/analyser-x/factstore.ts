/* ────────────────────────────────────────────────────────────────
   Analyser Version X1 · the fact store

   Facts are append-only and carry their provenance. Two sources that disagree are
   a CONFLICT, never a winner: the store records both and lets the rules decide what
   a conflict means (it makes the ingredient list unreliable, never "the newer one").
──────────────────────────────────────────────────────────────── */

import type { Conflict, Fact, Predicate } from "./types";

/** Small deterministic hash (FNV-1a, 32 bit) so fact ids are stable without a crypto import. */
export function hashOf(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

const stable = (v: unknown): string =>
  JSON.stringify(v, (_k, x) =>
    x && typeof x === "object" && !Array.isArray(x)
      ? Object.fromEntries(Object.entries(x as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1)))
      : x);

const normInci = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "");

/** What "the same value" means for a predicate. An ingredient list is compared as an ordered sequence. */
function valueKey(f: Fact): string {
  if (f.predicate === "inci.list") {
    const list = ((f.value as { ingredients?: string[] }).ingredients ?? []).map(normInci).filter(Boolean);
    return list.join("|");
  }
  return stable(f.value);
}

export type NewFact = Omit<Fact, "id"> & { id?: string };

export class FactStore {
  private readonly byId = new Map<string, Fact>();

  /** Adds a fact. Adding the same fact twice returns the first one. */
  add(input: NewFact): Fact {
    const id = input.id ?? `f_${hashOf(`${input.predicate}|${input.subject}|${input.origin}|${stable(input.value)}`)}`;
    const existing = this.byId.get(id);
    if (existing) return existing;
    const fact: Fact = { ...input, id };
    this.byId.set(id, fact);
    return fact;
  }

  get(id: string): Fact | undefined {
    return this.byId.get(id);
  }

  all(): Fact[] {
    return [...this.byId.values()];
  }

  byPredicate<V = Record<string, unknown>>(p: Predicate): Fact<V>[] {
    return this.all().filter((f) => f.predicate === p) as Fact<V>[];
  }

  /** Predicates where two source facts for one subject disagree. Only facts from a source count: a model's
      unverified reading never creates a conflict, because it never creates a fact that can be believed. */
  conflicts(): Conflict[] {
    const groups = new Map<string, Fact[]>();
    for (const f of this.all()) {
      if (f.origin !== "source" || f.trust < 2) continue;
      const k = `${f.predicate}|${f.subject}`;
      groups.set(k, [...(groups.get(k) ?? []), f]);
    }
    const out: Conflict[] = [];
    for (const facts of groups.values()) {
      if (facts.length < 2) continue;
      if (new Set(facts.map(valueKey)).size > 1) {
        out.push({ predicate: facts[0].predicate, subject: facts[0].subject, factIds: facts.map((f) => f.id) });
      }
    }
    return out;
  }
}
