/* An admin's edits to one stored analysis: a colour that replaces the rules' colour, and wording that replaces lines
   of the page. They are kept inside the stored review (review.adminEdits), so a re-run of the analysis replaces them:
   the editor says so on screen. Applied in pillsFor, which every product page, listing card and comparison is built
   from, so the page, its card and a comparison always agree. Pure. */

import type { DecisionKey } from "@/lib/analyser-x";
import { PILLS } from "@/lib/analyser-x/copy";
import type { ReviewDecision } from "@/lib/analyser-x/adapter";
import type { PillsPageModel } from "@/lib/pills-page";

export const COLOUR_CHOICES: { key: DecisionKey; label: string; colour: string }[] = [
  { key: "good-choice", label: "Green", colour: "#248179" },
  { key: "buy-with-caution", label: "Yellow", colour: "#D97706" },
  { key: "look-elsewhere", label: "Red", colour: "#fd6158" },
  { key: "not-enough-info", label: "Grey", colour: "#8a817c" },
  { key: "medicinal-product", label: "Grey (medicinal product)", colour: "#8a817c" },
];

/** The lines of a product page an admin can rewrite. `list` fields are one line per entry. */
export const EDITABLE_FIELDS = [
  { id: "take.summary", label: "Our take: summary", kind: "text" },
  { id: "take.recommendation", label: "Our take: recommendation", kind: "text" },
  { id: "take.reason", label: "Our take: reason", kind: "text" },
  { id: "take.notes", label: "Our take: notes", kind: "list" },
  { id: "fit.suits", label: "Who it suits", kind: "list" },
  { id: "fit.careful", label: "Who should be careful", kind: "list" },
  { id: "fit.india", label: "India context", kind: "text" },
  { id: "fit.price", label: "Price line", kind: "text" },
  { id: "claimCheck.oneLiner", label: "Claim check one-liner", kind: "text" },
  { id: "regulatoryCheck.oneLiner", label: "Regulatory check one-liner", kind: "text" },
  { id: "gaps", label: "Gaps", kind: "list" },
  { id: "cheatCode.text", label: "Cheat code", kind: "text" },
] as const;

export type EditableFieldId = (typeof EDITABLE_FIELDS)[number]["id"];
export type TextEdits = Partial<Record<EditableFieldId, string | string[]>>;

export interface AdminAnalysisEdits {
  colour?: DecisionKey;
  text?: TextEdits;
  editedBy: string;
  editedAt: string;
}

const COLOUR_KEYS = new Set<string>(COLOUR_CHOICES.map((c) => c.key));
const FIELD_KIND = new Map<string, "text" | "list">(EDITABLE_FIELDS.map((f) => [f.id, f.kind]));

/** The current value of one editable line on a page model. */
export function fieldValue(model: PillsPageModel, id: EditableFieldId): string | string[] {
  switch (id) {
    case "take.summary": return model.take.summary;
    case "take.recommendation": return model.take.recommendation;
    case "take.reason": return model.take.reason;
    case "take.notes": return model.take.notes;
    case "fit.suits": return model.fit.suits;
    case "fit.careful": return model.fit.careful;
    case "fit.india": return model.fit.india;
    case "fit.price": return model.fit.price ?? "";
    case "claimCheck.oneLiner": return model.claimCheck.oneLiner;
    case "regulatoryCheck.oneLiner": return model.regulatoryCheck.oneLiner;
    case "gaps": return model.gaps;
    case "cheatCode.text": return model.cheatCode?.text ?? "";
  }
}

/** The decision with the admin's colour in place of the rules' colour (label and meaning follow the colour). */
export function withColour(out: ReviewDecision, colour: DecisionKey | undefined): ReviewDecision {
  if (!colour || !COLOUR_KEYS.has(colour) || colour === out.decision.key) return out;
  return { ...out, decision: { ...out.decision, key: colour, label: PILLS[colour].label, meaning: PILLS[colour].meaning } };
}

/** The page model with the admin's wording in place. A line the page does not show (a missing cheat code) stays hidden. */
export function withTextEdits(model: PillsPageModel, text: TextEdits | undefined): PillsPageModel {
  if (!text) return model;
  const m: PillsPageModel = { ...model, take: { ...model.take }, fit: { ...model.fit }, claimCheck: { ...model.claimCheck }, regulatoryCheck: { ...model.regulatoryCheck } };
  const str = (v: unknown) => (typeof v === "string" ? v : null);
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : null);
  for (const [id, raw] of Object.entries(text)) {
    switch (id as EditableFieldId) {
      case "take.summary": { const v = str(raw); if (v !== null) m.take.summary = v; break; }
      case "take.recommendation": { const v = str(raw); if (v !== null) m.take.recommendation = v; break; }
      case "take.reason": { const v = str(raw); if (v !== null) m.take.reason = v; break; }
      case "take.notes": { const v = list(raw); if (v) m.take.notes = v; break; }
      case "fit.suits": { const v = list(raw); if (v) m.fit.suits = v; break; }
      case "fit.careful": { const v = list(raw); if (v) m.fit.careful = v; break; }
      case "fit.india": { const v = str(raw); if (v !== null) m.fit.india = v; break; }
      case "fit.price": { const v = str(raw); if (v !== null) m.fit.price = v || null; break; }
      case "claimCheck.oneLiner": { const v = str(raw); if (v !== null) m.claimCheck.oneLiner = v; break; }
      case "regulatoryCheck.oneLiner": { const v = str(raw); if (v !== null) m.regulatoryCheck.oneLiner = v; break; }
      case "gaps": { const v = list(raw); if (v) m.gaps = v; break; }
      case "cheatCode.text": { const v = str(raw); if (v !== null && m.cheatCode) m.cheatCode = { ...m.cheatCode, text: v }; break; }
    }
  }
  return m;
}

/** A submitted set of edits, cleaned, or the reason it cannot be saved. */
export function cleanEdits(input: unknown): { ok: true; colour?: DecisionKey; text: TextEdits } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "edits required" };
  const { colour, text } = input as { colour?: unknown; text?: unknown };
  if (colour !== undefined && colour !== null && (typeof colour !== "string" || !COLOUR_KEYS.has(colour))) return { ok: false, error: "unknown colour" };
  const out: TextEdits = {};
  if (text !== undefined && text !== null) {
    if (typeof text !== "object") return { ok: false, error: "text must be an object" };
    for (const [id, v] of Object.entries(text as Record<string, unknown>)) {
      const kind = FIELD_KIND.get(id);
      if (!kind) return { ok: false, error: `unknown field ${id}` };
      if (kind === "text") {
        if (typeof v !== "string" || v.length > 2000) return { ok: false, error: `${id} must be text under 2000 characters` };
        out[id as EditableFieldId] = v.trim();
      } else {
        if (!Array.isArray(v) || v.length > 20 || v.some((x) => typeof x !== "string" || x.length > 600)) return { ok: false, error: `${id} must be up to 20 lines` };
        out[id as EditableFieldId] = (v as string[]).map((x) => x.trim()).filter(Boolean);
      }
    }
  }
  return { ok: true, ...(typeof colour === "string" ? { colour: colour as DecisionKey } : {}), text: out };
}
