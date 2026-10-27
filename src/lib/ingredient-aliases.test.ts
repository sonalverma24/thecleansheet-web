import { afterEach, describe, expect, it, vi } from "vitest";
import { INGREDIENT_ALIASES, NOT_ALIASED, aliasKey, isSignedOff, type IngredientAlias } from "@/data/ingredient-aliases";
import { ANALYSER_FLAGS, isFlagOn } from "@/lib/analyser-flags";
import { activeAliasKeys, lookupIngredient, lookupKeys, normIngredient, rowLooksValid } from "@/lib/ingredient-db";
import { ALL_INGREDIENTS } from "@/lib/ingredient-utils";

const FLAG = ANALYSER_FLAGS.ingredientAliases;
const signed = (e: IngredientAlias): IngredientAlias => ({ ...e, signedOffBy: "Test Reviewer", signedOffOn: "2026-01-01" });
const brackets = (s: string) => [...s.matchAll(/\(([^)]*)\)/g)].map((m) => aliasKey(m[1]));

afterEach(() => vi.unstubAllEnvs());

describe("the alias table: every entry can be checked by a reviewer", () => {
  it.each(INGREDIENT_ALIASES.map((e) => [e.alias, e] as const))("%s: the target is an existing row, named exactly, and trusted", (_alias, e) => {
    expect(ALL_INGREDIENTS.filter((r) => r.INCI_Name === e.target).length, "no such row: an alias must never create an ingredient").toBeGreaterThanOrEqual(1);
    vi.stubEnv(FLAG, "0");
    const row = lookupIngredient(e.target);
    expect(row?.INCI_Name, "the lookup must reach the row the entry names").toBe(e.target);
    expect(rowLooksValid(row!), "a row the screen distrusts would make the alias pointless").toBe(true);
  });

  it.each(INGREDIENT_ALIASES.map((e) => [e.alias, e] as const))("%s: does not resolve on its own today, so the alias never overrides an exact match", (_alias, e) => {
    vi.stubEnv(FLAG, "0");
    expect(lookupIngredient(e.alias)).toBeUndefined();
  });

  it("no alias is repeated, equals its own target, or points at another alias (no chains)", () => {
    const keys = INGREDIENT_ALIASES.map((e) => aliasKey(e.alias));
    expect(new Set(keys).size).toBe(keys.length);
    const targets = new Set(INGREDIENT_ALIASES.map((e) => aliasKey(e.target)));
    for (const e of INGREDIENT_ALIASES) {
      expect(aliasKey(e.alias), e.alias).not.toBe(aliasKey(e.target));
      expect(targets.has(aliasKey(e.alias)), `${e.alias} is also a target`).toBe(false);
    }
  });

  it("each entry has exactly one line of reasoning", () => {
    for (const e of INGREDIENT_ALIASES) {
      expect(e.reason, e.alias).toMatch(/^[^\n]{20,260}$/);
      expect(e.reason.trim().endsWith("."), `${e.alias}: end the reasoning with a full stop`).toBe(true);
    }
  });

  it("each entry has one real source: a PubChem record that matches the row's own CAS, or the row's own name", () => {
    for (const e of INGREDIENT_ALIASES) {
      const s = e.source;
      expect(s.checkedOn, e.alias).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (s.kind === "pubchem") {
        expect(s.url, e.alias).toBe(`https://pubchem.ncbi.nlm.nih.gov/compound/${s.cid}`);
        const row = ALL_INGREDIENTS.find((r) => r.INCI_Name === e.target)!;
        expect(row.CAS_Number, `${e.alias}: the row's CAS must include ${s.cas}`).toContain(s.cas);
      } else {
        expect(s.url).toBeNull();
        expect(s.label, e.alias).toContain(e.target);
        expect(brackets(e.target), `${e.alias}: the row name must carry the alias in brackets`).toContain(aliasKey(e.alias));
      }
    }
  });

  it("an alias and its target agree on nano or not: nano and non-nano are different substances to the screen", () => {
    for (const e of INGREDIENT_ALIASES) expect(/nano/i.test(e.alias), e.alias).toBe(/nano/i.test(e.target));
  });

  it("no entry is half signed off", () => {
    for (const e of INGREDIENT_ALIASES) expect(Boolean(e.signedOffBy?.trim()), e.alias).toBe(Boolean(e.signedOffOn?.trim()));
  });
});

describe("the names left out of the table", () => {
  it("each has a reason and none of them is an alias", () => {
    const keys = new Set(INGREDIENT_ALIASES.map((e) => aliasKey(e.alias)));
    for (const n of NOT_ALIASED) {
      expect(n.why.length, n.name).toBeGreaterThan(20);
      expect(keys.has(aliasKey(n.name)), `${n.name} is both aliased and left out`).toBe(false);
    }
  });

  it("ingredients that cannot be aliased because no row exists (fragrance) are not smuggled in", () => {
    for (const e of INGREDIENT_ALIASES) expect(e.target, e.alias).not.toMatch(/parfum|fragrance|perfume/i);
  });
});

describe("the two gates: an alias applies only when the flag is on AND the pair is signed off", () => {
  const everythingSigned = activeAliasKeys(INGREDIENT_ALIASES.map(signed));
  const first = (name: string) => [normIngredient(name)];

  it("the flag is off by default", () => {
    const saved = process.env[FLAG];
    delete process.env[FLAG];
    try { expect(isFlagOn(FLAG)).toBe(false); } finally { if (saved !== undefined) process.env[FLAG] = saved; }
  });

  it("flag off: even a fully signed-off table changes nothing", () => {
    vi.stubEnv(FLAG, "0");
    for (const e of INGREDIENT_ALIASES) expect(lookupKeys(e.alias, everythingSigned), e.alias).toEqual(first(e.alias));
  });

  it("flag on: a pair that is not signed off changes nothing", () => {
    vi.stubEnv(FLAG, "1");
    const unsigned = INGREDIENT_ALIASES.filter((e) => !isSignedOff(e));
    expect(activeAliasKeys(unsigned).size).toBe(0);
    for (const e of unsigned) expect(lookupKeys(e.alias), e.alias).toEqual(first(e.alias));
  });

  it("flag on and signed off: the alias reaches its target row, after the exact key", () => {
    vi.stubEnv(FLAG, "1");
    expect(lookupKeys("Water", everythingSigned)).toEqual(["water", "aqua"]);
    for (const e of INGREDIENT_ALIASES) {
      const keys = lookupKeys(e.alias, everythingSigned);
      expect(keys.at(-1), e.alias).toBe(lookupKeys(e.target)[0]);
    }
  });

  it("brackets and a label's own common name do not stop an alias matching", () => {
    vi.stubEnv(FLAG, "1");
    expect(lookupKeys("Prunus Armeniaca (Apricot) Kernel Oil", everythingSigned).at(-1)).toBe("apricot kernel oil");
    expect(lookupKeys("PURIFIED  WATER", everythingSigned).at(-1)).toBe("aqua");
  });

  it("an alias never overrides a name that already resolves: the exact key is tried first", () => {
    vi.stubEnv(FLAG, "1");
    const wrong = activeAliasKeys([signed({ alias: "Glycerin", target: "Aqua", reason: "A deliberately wrong pair to prove the order of keys.", source: INGREDIENT_ALIASES[0].source })]);
    const keys = lookupKeys("Glycerin", wrong);
    expect(keys[0]).toBe("glycerin");
    expect(lookupIngredient("Glycerin")?.INCI_Name).toBe("Glycerin");
  });

  describe("the state the table ships in: reviewer TCS-P-024 signed 23 of 24 pairs on 2026-10-27", () => {
    const signedNow = INGREDIENT_ALIASES.filter(isSignedOff);

    it("every pair but CI 77891 is signed off, and CI 77891 is held until the colourant question is settled", () => {
      expect(signedNow).toHaveLength(23);
      expect(INGREDIENT_ALIASES.filter((e) => !isSignedOff(e)).map((e) => e.alias)).toEqual(["CI 77891"]);
    });

    it("a sign-off records only an opaque reviewer reference and a real past date, never a name", () => {
      for (const e of signedNow) {
        expect(e.signedOffBy, e.alias).toMatch(/^TCS-P-\d{3}$/);
        expect(Date.parse(e.signedOffOn!), e.alias).toBeLessThanOrEqual(Date.now());
      }
    });

    it("with the flag off, the shipped table changes no lookup at all", () => {
      vi.stubEnv(FLAG, "0");
      for (const e of INGREDIENT_ALIASES) expect(lookupKeys(e.alias), e.alias).toEqual(first(e.alias));
    });

    it("with the flag on, the shipped table reaches the target for every signed pair and still not for CI 77891", () => {
      vi.stubEnv(FLAG, "1");
      expect(lookupKeys("Water")).toEqual(["water", "aqua"]);
      expect(lookupKeys("Water/Aqua/Eau")).toEqual(["water", "aqua"]);
      for (const e of signedNow) expect(lookupKeys(e.alias).at(-1), e.alias).toBe(lookupKeys(e.target)[0]);
      expect(lookupKeys("CI 77891")).toEqual(first("CI 77891"));
    });
  });

  it("a half-filled or blank sign-off does not count", () => {
    expect(isSignedOff({ signedOffBy: "Owner" })).toBe(false);
    expect(isSignedOff({ signedOffOn: "2026-10-30" })).toBe(false);
    expect(isSignedOff({ signedOffBy: "  ", signedOffOn: "2026-10-30" })).toBe(false);
    expect(isSignedOff({ signedOffBy: "Owner", signedOffOn: "2026-10-30" })).toBe(true);
  });
});

describe("a slash label: an alias matches its first part, never a later one", () => {
  const all = activeAliasKeys(INGREDIENT_ALIASES.map(signed));

  it("'Water/Aqua' and 'Glycerine/Glycerin' reach their targets; 'Aqua/Water' needs no alias", () => {
    vi.stubEnv(FLAG, "1");
    expect(lookupKeys("Water/Aqua", all)).toEqual(["water", "aqua"]);
    expect(lookupKeys("Glycerine/Glycerin", all)).toEqual(["glycerine", "glycerin"]);
    expect(lookupKeys("Purified Water/Eau", all).at(-1)).toBe("aqua");
    expect(lookupKeys("Aqua/Water", all)).toEqual(["aqua"]);
  });

  it("for every entry, '<alias>/<anything>' reaches the same row as the alias on its own", () => {
    vi.stubEnv(FLAG, "1");
    for (const e of INGREDIENT_ALIASES) expect(lookupKeys(`${e.alias}/Zorbaflux`, all).at(-1), e.alias).toBe(lookupKeys(e.target)[0]);
  });

  it("case, spacing and brackets on the first part do not matter", () => {
    vi.stubEnv(FLAG, "1");
    expect(lookupKeys("WATER (Aqua) / Eau", all).at(-1)).toBe("aqua");
    expect(lookupKeys("  glycerine  /Glycerin", all).at(-1)).toBe("glycerin");
  });

  it("never a later part: a first part we do not know is not rescued by an alias after the slash", () => {
    vi.stubEnv(FLAG, "1");
    expect(lookupKeys("Zorbaflux/Water", all)).toEqual(["zorbaflux"]);
    expect(lookupKeys("Zorbaflux/Glycerine/Purified Water", all)).toEqual(["zorbaflux"]);
  });

  it("flag off, or nothing signed off: a slash label is read exactly as before", () => {
    vi.stubEnv(FLAG, "0");
    expect(lookupKeys("Water/Aqua", all)).toEqual(["water"]);
    vi.stubEnv(FLAG, "1");
    const unsigned = INGREDIENT_ALIASES.filter((e) => !isSignedOff(e));
    expect(unsigned.length).toBeGreaterThan(0);
    // The baseline is the lookup with no aliases at all (the colour-index rule may keep a part after the slash, which is its own, older rule).
    for (const e of unsigned) expect(lookupKeys(`${e.alias}/Zorbaflux`), e.alias).toEqual(lookupKeys(`${e.alias}/Zorbaflux`, new Map()));
  });

  it("an exact first part still wins: a name that resolves on its own is never redirected", () => {
    vi.stubEnv(FLAG, "1");
    const wrong = activeAliasKeys([signed({ alias: "Glycerin", target: "Aqua", reason: "A deliberately wrong pair to prove the order of keys.", source: INGREDIENT_ALIASES[0].source })]);
    expect(lookupKeys("Glycerin/Glycerine", wrong)[0]).toBe("glycerin");
    expect(lookupIngredient("Glycerin/Glycerine")?.INCI_Name).toBe("Glycerin");
  });

  it("the colour-index fall-through and the alias on its first part do not double up", () => {
    vi.stubEnv(FLAG, "1");
    expect(lookupKeys("CI 77891/Titanium Dioxide", all)).toEqual(["ci 77891", "titanium dioxide"]);
  });
});
