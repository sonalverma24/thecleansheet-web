/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Product type, and which regulatory statuses apply to it

   A regulator's words are often about a kind of product, not every product: "EU BANNED in rinse-off products", "restricted in rinse-off
   at or above 0.1%", "regulated as a primary sunscreen active when SPF claims are made". Read without the product, a rinse-off ban becomes
   "Polyethylene is prohibited in cosmetics" on a leave-on lipstick, which is false. The owner's rule: a status is read by product type.

   This file does two small things and decides nothing else:
     productScopeOf(name, category)   what kind of product this is (rinse-off or leave-on, a sunscreen, hair, nail, spray, lip, eye, oral, baby)
     statusAppliesTo(text, scope)     whether a status text speaks to that kind of product

   A status that names no product type applies to every product. A status that names types applies to a product of any of those types. A type
   named after "except", "excluding" or "other than" is an exclusion. When the product's type is not known (no scope given) every status applies,
   which is today's behaviour. Pure; no database.
──────────────────────────────────────────────────────────────── */

import { categorise } from "@/lib/product-categorise";

export interface ProductScope {
  rinseOff: boolean;
  leaveOn: boolean;
  sunscreen: boolean;
  hair: boolean;
  nail: boolean;
  lip: boolean;
  eye: boolean;
  oral: boolean;
  spray: boolean;
  baby: boolean;
}

type ScopeKey = keyof ProductScope;

/** What the product is, from its name and its category. Rinse-off and sunscreen and baby read exactly as the decision core's profile reads them
    (src/lib/analyser-x/profile.ts), so the two cannot disagree; the rest are plain words in the name or category. */
export function productScopeOf(name: string, category: string): ProductScope {
  const cat = categorise(category, name);
  const type = cat.type.toLowerCase();
  const said = `${name} ${category}`.toLowerCase();
  const rinseOff = /wash|cleanser|shampoo|soap|scrub|conditioner|shaving|bubble bath|body wash|face wash|remover|sanitizer/.test(type);
  return {
    rinseOff,
    leaveOn: !rinseOff,
    sunscreen: cat.family === "Sunscreens" || /\bspf\b|sunscreen/.test(type) || /\bspf\s*\d/i.test(name),
    hair: cat.family === "Hair",
    nail: /\bnail\b/.test(said),
    lip: /\blip(?:stick|s|gloss|liner|balm|care|tint)?\b/.test(said),
    eye: /\beye(?:liner|shadow|lash|brow|s)?\b|\bmascara\b|\bkajal\b/.test(said),
    oral: /\b(?:toothpaste|mouthwash|mouth wash|oral)\b/.test(said),
    spray: /\b(?:spray|aerosol|mist)\b/.test(said),
    baby: cat.family === "Baby" || /baby|kids/.test(type),
  };
}

/** The words that name a product type inside a status text. */
const NAMES: [ScopeKey, RegExp][] = [
  ["rinseOff", /\brinse[- ]?off\b/gi],
  ["leaveOn", /\bleave[- ]?on\b/gi],
  // "Regulated as a primary sunscreen active ... when SPF claims are made"; "may require NPN registration if drug (sunscreen) claims are made".
  ["sunscreen", /\b(?:primary )?sunscreen actives?\b|\bspf claims?\b|\(sunscreen\) claims?\b/gi],
  ["hair", /\bhair (?:dyes?|colou?rants?|products?|care|straighteners?)\b/gi],
  ["nail", /\bnail (?:products?|polish|enamel|hardeners?)\b/gi],
  ["spray", /\b(?:sprays?|aerosols?)\b/gi],
  ["lip", /\blip (?:products?|care|balms?|sticks?)\b/gi],
  ["eye", /\beye (?:products?|area|make-?up|cosmetics)\b/gi],
  ["oral", /\b(?:oral (?:hygiene|care|products?)|mouth ?wash|toothpastes?|dentifrices?)\b/gi],
  ["baby", /\b(?:children|child|infants?|babies|baby|nappy|nappies|diapers?)\b/gi],
];

const EXCLUDES = /\b(?:except|excluding|other than|not (?:for|in)|outside|avoid)\b[^.;,]{0,30}$/i;

/** Which product types a status text names, and which of them it excludes. */
export function scopesNamedIn(text: string): { includes: ScopeKey[]; excludes: ScopeKey[] } {
  const includes = new Set<ScopeKey>();
  const excludes = new Set<ScopeKey>();
  for (const [key, re] of NAMES) {
    for (const m of text.matchAll(re)) {
      const before = text.slice(Math.max(0, (m.index ?? 0) - 40), m.index ?? 0);
      (EXCLUDES.test(before) ? excludes : includes).add(key);
    }
  }
  return { includes: [...includes], excludes: [...excludes] };
}

/** Does this status text speak to a product of this kind? No scope given, or no type named, means yes. */
export function statusAppliesTo(text: string | undefined, scope: ProductScope | undefined): boolean {
  if (!scope || !text) return true;
  const { includes, excludes } = scopesNamedIn(text);
  if (excludes.some((k) => scope[k])) return false;
  return includes.length === 0 || includes.some((k) => scope[k]);
}
