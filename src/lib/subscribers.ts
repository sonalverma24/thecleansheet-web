/* Newsletter sign-ups: what is accepted, how it is stored, and the note sent to the owner.

   Shared by POST /api/subscribe (the newsletter form) and the sign-in callback (the "subscribe"
   checkbox in the login modal), so a sign-in never makes an HTTP call back to its own site.

   Both entry points are reachable by anyone, so nothing the caller sends is trusted: the email must
   look like an email, the source is cut down to a short plain label, and everything is escaped
   before it goes into the HTML note. */

import { createAdminClient } from "@/lib/supabase/admin";

export const DEFAULT_SOURCE = "Blog page";
const MAX_EMAIL = 254;
const MAX_SOURCE = 40;
// Deliberately plain: one "@", a dot in the domain, no whitespace and nothing that can open a tag.
const EMAIL_SHAPE = /^[^\s@<>"'`,;()[\]\\]+@[^\s@<>"'`,;()[\]\\]+\.[^\s@<>"'`,;()[\]\\.]{2,}$/;

export interface Subscriber { email: string; source: string }

/** A short plain label for where the sign-up came from; anything else falls back to the default. */
export function cleanSource(source: unknown): string {
  if (typeof source !== "string") return DEFAULT_SOURCE;
  const label = source.replace(/[^A-Za-z0-9 _.-]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_SOURCE);
  return label || DEFAULT_SOURCE;
}

/** The sign-up to record, or null when the email is missing or does not look like one. */
export function parseSubscriber(email: unknown, source?: unknown): Subscriber | null {
  if (typeof email !== "string") return null;
  const address = email.trim().toLowerCase();
  if (!address || address.length > MAX_EMAIL || !EMAIL_SHAPE.test(address)) return null;
  return { email: address, source: cleanSource(source) };
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** The HTML note to the owner. Every value is escaped; `when` is passed in so the output is stable. */
export function ownerNoteHtml(sub: Subscriber, when: string): string {
  const email = escapeHtml(sub.email);
  const source = escapeHtml(sub.source);
  return `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
              <p style="font-size:12px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.1em;margin:0 0 8px">The Clean Sheet™ · New Subscriber</p>
              <h2 style="font-size:20px;font-weight:800;color:#0a1f16;margin:0 0 20px">Newsletter Sign-up</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr>
                  <td style="padding:10px 12px;background:#f0fdfa;border-radius:8px 8px 0 0;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Email</td>
                  <td style="padding:10px 12px;background:#f0fdfa;border-radius:8px 8px 0 0;font-size:14px;color:#0a1f16;font-weight:600">${email}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 0 8px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Source</td>
                  <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-left:none;border-radius:0 0 8px 0;font-size:14px;color:#0a1f16">${source}</td>
                </tr>
              </table>
              <p style="font-size:11px;color:#9ca3af;margin:20px 0 0">Submitted at ${escapeHtml(when)} IST</p>
            </div>
          `;
}

/** "new" = stored now, "existing" = already subscribed, "unsaved" = the database could not be written. */
export type SaveOutcome = "new" | "existing" | "unsaved";

export async function saveSubscriber(sub: Subscriber): Promise<SaveOutcome> {
  try {
    // ON CONFLICT DO NOTHING returns only the rows it inserted, so an empty result means a repeat.
    const { data, error } = await createAdminClient()
      .from("subscribers")
      .upsert(sub, { onConflict: "email", ignoreDuplicates: true })
      .select("email");
    if (error) {
      console.error("[subscribe] db", error.message);
      return "unsaved";
    }
    return data && data.length > 0 ? "new" : "existing";
  } catch (err) {
    console.error("[subscribe] db", err);
    return "unsaved";
  }
}

async function notifyOwner(sub: Subscriber): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: "The Clean Sheet™ <onboarding@resend.dev>",
        to: "sonal@thecleansheet.in",
        subject: `New Newsletter Subscriber: ${sub.email}`,
        html: ownerNoteHtml(sub, new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })),
      }),
    });
  } catch (err) {
    console.error("[subscribe] notify", err);
  }
}

/** Store the sign-up and tell the owner. A repeat sign-up is not announced again, but when the
    database could not be written the owner is still told, so no sign-up is lost silently. */
export async function recordSubscriber(sub: Subscriber): Promise<SaveOutcome> {
  const outcome = await saveSubscriber(sub);
  if (outcome !== "existing") await notifyOwner(sub);
  return outcome;
}
