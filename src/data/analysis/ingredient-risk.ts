/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Ingredient risk reference (starter set)
   Well-established, public facts used to turn an INCI list into
   safety/allergen findings deterministically. This is a STARTER
   reference - accurate for what it covers, deliberately not exhaustive.
   Expand from CosIng (EU), CIR, SCCS opinions, ECHA, IFRA over time.
   Matching is substring-on-lowercased-INCI, so entries are INCI stems.
──────────────────────────────────────────────────────────────── */

/** EU Cosmetics Regulation Annex III: the 26 fragrance allergens that must be
    declared. Presence isn't a failure - it's a heads-up for reactive skin. */
export const EU_FRAGRANCE_ALLERGENS_26: string[] = [
  "limonene", "linalool", "citronellol", "geraniol", "eugenol", "isoeugenol",
  "coumarin", "citral", "farnesol", "benzyl alcohol", "benzyl salicylate",
  "benzyl benzoate", "benzyl cinnamate", "cinnamal", "cinnamyl alcohol",
  "hydroxycitronellal", "amyl cinnamal", "amylcinnamyl alcohol", "hexyl cinnamal",
  "anise alcohol", "alpha-isomethyl ionone", "methyl 2-octynoate",
  "butylphenyl methylpropional", "evernia prunastri", "evernia furfuracea",
  "hydroxyisohexyl 3-cyclohexene carboxaldehyde",
];

/** EU Annex II (prohibited) / Annex III severely-restricted - a starter set of
    the ones that actually turn up in the Indian market. A hit here is ADVERSE.
    `banned: true` marks an ingredient PROHIBITED in cosmetics (not merely
    concentration-restricted) - only those hard-block the Clean Sheet stamp. */
export const RESTRICTED_OR_BANNED: { stem: string; note: string; banned: boolean }[] = [
  { stem: "hydroquinone", banned: true, note: "Prohibited in cosmetics (EU Annex II); permitted only as a regulated drug for skin lightening." },
  { stem: "butylphenyl methylpropional", banned: true, note: "Lilial - prohibited in EU cosmetics since 2022 (reprotoxic classification)." },
  { stem: "hydroxyisohexyl 3-cyclohexene carboxaldehyde", banned: true, note: "Lyral (HICC) - prohibited in EU cosmetics since 2021 (strong sensitiser)." },
  { stem: "mercury", banned: true, note: "Mercury compounds are prohibited in cosmetics (EU Annex II)." },
  { stem: "lead acetate", banned: true, note: "Lead acetate is prohibited in cosmetics (EU Annex II; withdrawn by US FDA)." },
  { stem: "triclosan", banned: false, note: "Restricted preservative - permitted only in specific products at low levels (EU Annex V)." },
];

/** Formaldehyde-releasing / high-sensitisation preservatives. Presence is INFO,
    a leave-on at meaningful level is worth a caution, not an automatic fail. */
export const SENSITISING_PRESERVATIVES: { stem: string; note: string }[] = [
  { stem: "methylisothiazolinone", note: "MI - a known contact sensitiser; EU bans it in leave-on products." },
  { stem: "methylchloroisothiazolinone", note: "MCI - sensitiser, tightly restricted to rinse-off at low levels." },
  { stem: "dmdm hydantoin", note: "Formaldehyde-releaser." },
  { stem: "imidazolidinyl urea", note: "Formaldehyde-releaser." },
  { stem: "diazolidinyl urea", note: "Formaldehyde-releaser." },
  { stem: "quaternium-15", note: "Formaldehyde-releaser (the most sensitising of the group)." },
];

/** Sulphate surfactants - relevant to "sulphate-free" claims and to surfactant
    irritation on the scalp/face. Deliberately specific (not "sulfate"). */
export const SULPHATE_SURFACTANTS: string[] = [
  "sodium lauryl sulfate", "sodium laureth sulfate", "ammonium lauryl sulfate",
  "ammonium laureth sulfate", "sodium coco sulfate", "tea-lauryl sulfate",
  "sodium myreth sulfate",
];

/** Denatured / short-chain drying alcohols (NOT fatty alcohols like cetyl). */
export const DRYING_ALCOHOLS: string[] = ["alcohol denat", "sd alcohol", "ethanol"];

/** Commonly comedogenic ingredients (rated 3+ on the standard scale). Relevant
    to acne-prone suitability and to "non-comedogenic" claims. */
export const COMEDOGENIC: string[] = [
  "cocos nucifera", "coconut oil", "isopropyl myristate", "isopropyl palmitate",
  "myristyl myristate", "theobroma cacao", "cocoa butter", "wheat germ",
  "lanolin", "algae extract", "laminaria", "linseed oil", "oleic acid",
  "isopropyl isostearate", "myristyl lactate", "cetyl acetate", "ethylhexyl palmitate",
];

/** Actives that raise photosensitivity - pairing with SPF matters, especially
    for India's year-round high UV. Presence is INFO/context, not a fault. */
export const PHOTOSENSITISING_ACTIVES: string[] = [
  "retinol", "retinal", "retinaldehyde", "tretinoin", "glycolic acid",
  "lactic acid", "salicylic acid", "ascorbic acid", "bakuchiol",
];

/** UV filters - presence supports an SPF claim's plausibility. */
export const UV_FILTERS: string[] = [
  "octinoxate", "ethylhexyl methoxycinnamate", "avobenzone",
  "butyl methoxydibenzoylmethane", "octocrylene", "homosalate", "octisalate",
  "ethylhexyl salicylate", "oxybenzone", "benzophenone", "zinc oxide",
  "titanium dioxide", "tinosorb", "uvinul", "bis-ethylhexyloxyphenol",
  "bemotrizinol", "bisoctrizole",
];

/** Whole-token presence test over a joined INCI string. Boundary-aware, so
    "oleic acid" no longer matches inside "linoleic acid", and "alcohol" does not
    match inside "cetearyl alcohol" unless it stands alone. Multi-word stems match
    as a contiguous run of whole tokens. */
export function inciHas(inciJoined: string, stems: string[]): string[] {
  const hay = ` ${inciJoined.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
  return stems.filter((s) => {
    const needle = ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
    return hay.includes(needle);
  });
}

/** Prohibited-in-cosmetics ingredients present in an INCI list. Boundary-safe.
    Used by the stamp's hard safety gate (a banned ingredient cannot be Approved). */
export function bannedIngredientsInInci(inci: string[]): { stem: string; note: string }[] {
  const joined = inci.join(" | ");
  return RESTRICTED_OR_BANNED
    .filter((r) => r.banned && inciHas(joined, [r.stem]).length > 0)
    .map(({ stem, note }) => ({ stem, note }));
}
