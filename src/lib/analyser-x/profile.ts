/* ────────────────────────────────────────────────────────────────
   Analyser vX · the product profile

   Facts about WHAT the product is, derived by code from the name, the category and
   the stated target user. Mirrors the context built inside analysis-engine.ts so the
   two agree on rinse-off, facial, sunscreen and baby.
──────────────────────────────────────────────────────────────── */

import { categorise } from "@/lib/product-categorise";
import { BABY_RE, SENSITIVE_RE } from "./kb";
import type { ProfileValue } from "./types";

export interface ProfileInput {
  name: string;
  brand: string;
  category: string;
  targetUser: string;
  formulaPoints: number | null;
  overreach: boolean;
  analysedAt: string;
  identityFromTextOnly: boolean;
}

export function buildProfile(i: ProfileInput): ProfileValue {
  const cat = categorise(i.category, i.name);
  const t = cat.type.toLowerCase();
  const isRinseOff = /wash|cleanser|shampoo|soap|scrub|conditioner|shaving|bubble bath|body wash|face wash|remover|sanitizer/.test(t);
  const isFacial = /facial|face|serum|toner|moisturizer|exfoliant|eye|anti-aging|redness|scar|oil control/.test(t) && cat.family !== "Hair";
  const isSunscreen = cat.family === "Sunscreens" || /\bspf\b|sunscreen/.test(t) || /\bspf\s*\d/i.test(i.name);
  const isBaby = cat.family === "Baby" || /baby|kids/.test(t);

  const said = `${i.targetUser} ${i.name} ${i.category}`;
  const audience: string[] = [];
  if (isBaby || BABY_RE.test(said)) audience.push("baby");
  if (SENSITIVE_RE.test(said)) audience.push("sensitive");

  const spf = /\bspf\s*(\d{1,3})/i.exec(i.name)?.[1];
  return {
    name: i.name, brand: i.brand, category: i.category, family: cat.family, targetUser: i.targetUser,
    audience, isRinseOff, isFacial, isSunscreen, isBaby,
    spf: spf ? parseInt(spf, 10) : null,
    identityFromTextOnly: i.identityFromTextOnly,
    formulaPoints: i.formulaPoints,
    overreach: i.overreach,
    analysedAt: i.analysedAt,
  };
}
