/* Audit of the reviewer references used by the claim ontology.

   The ontology stores only an opaque reference (TCS-P-014) for the TCS Panel expert who
   reviewed an alias. The name lives in a private register OUTSIDE this repository. The
   shape of a reference proves nothing about the person, so this audit is what checks that
   each reference a "definitive" alias relies on belongs to a real, active reviewer who has a
   recorded credential and is not the site owner.

   Pure: the register is passed in. Findings carry the reference and the entry's form, and
   never a name or a credential, so the output is safe to paste into a ticket or a chat. */

import type { OntologyEntry } from "@/data/ingredients/claim-ontology";
import { isReviewRef } from "@/lib/claim-ontology";

export interface ReviewerRecord {
  ref: string;
  name: string;
  /** What qualifies this person (for the owner's substantiation file, never printed here). */
  credential: string;
  active: boolean;
  isSiteOwner?: boolean;
}

export type AuditCode =
  | "NO_REGISTER" | "BAD_REF" | "UNKNOWN_REF" | "DUPLICATE_REF" | "INACTIVE" | "SITE_OWNER" | "NO_CREDENTIAL";

export interface AuditProblem { ref: string; form: string; code: AuditCode; detail: string }

export interface AuditedEntry { classId: string; entry: OntologyEntry }

export function auditReviewerRefs(entries: AuditedEntry[], register: ReviewerRecord[] | null): AuditProblem[] {
  const problems: AuditProblem[] = [];
  const used = entries.filter(({ entry }) => entry.strength === "definitive" && (entry.reviewRef ?? "").trim());
  const byRef = new Map<string, ReviewerRecord[]>();
  for (const r of register ?? []) byRef.set(r.ref, [...(byRef.get(r.ref) ?? []), r]);

  for (const { classId, entry } of used) {
    const ref = (entry.reviewRef ?? "").trim();
    const form = `${classId}: ${entry.form}`;
    const add = (code: AuditCode, detail: string) => problems.push({ ref, form, code, detail });

    if (!isReviewRef(ref)) { add("BAD_REF", "not a panel reference of the form TCS-P-014"); continue; }
    if (register === null) { add("NO_REGISTER", "no register was supplied, so this reference cannot be checked"); continue; }
    const records = byRef.get(ref) ?? [];
    if (records.length === 0) { add("UNKNOWN_REF", "the reference is not in the register"); continue; }
    if (records.length > 1) { add("DUPLICATE_REF", "the reference appears more than once in the register"); continue; }
    const rec = records[0];
    if (!rec.active) add("INACTIVE", "the reviewer is marked inactive");
    if (rec.isSiteOwner) add("SITE_OWNER", "the reviewer is the site owner, who sets policy and cannot also review");
    if (!rec.credential?.trim()) add("NO_CREDENTIAL", "no credential is recorded for this reviewer");
  }
  return problems;
}
