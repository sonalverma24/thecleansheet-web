/* ────────────────────────────────────────────────────────────────
   /api/unrated-notify - "write to me when you can rate this".

   The popup for a nutraceutical asks for an email. It is kept in public.category_waitlist (one row per email and category) so it can be written to later, and
   also sent to the owner by email, like the other lead forms, so a signup is not lost if the table is not there yet. It answers success when either held it.
──────────────────────────────────────────────────────────────── */

import { rateLimit, rateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Only a nutraceutical has a list to join: we do not plan to rate prescription drugs. */
const WAITLIST_KIND = "nutraceutical";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  if (!rateLimit(req, "unrated-notify", 5)) return rateLimited();

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }

  const email = text(body.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return Response.json({ error: "A valid email is required" }, { status: 400 });
  if (body.kind !== WAITLIST_KIND) return Response.json({ error: "Nothing to sign up for" }, { status: 400 });

  const productName = text(body.productName, 300);
  const brand = text(body.brand, 120);
  const productSlug = text(body.productSlug, 300);

  let stored = false;
  try {
    const { error } = await createAdminClient()
      .from("category_waitlist")
      .upsert({ email, category: WAITLIST_KIND, product_name: productName, brand, product_slug: productSlug || null }, { onConflict: "email,category", ignoreDuplicates: true });
    if (error) throw error;
    stored = true;
  } catch (e) {
    console.error("[unrated-notify] could not store the signup", e instanceof Error ? e.message : e);
  }

  let notified = false;
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from: "The Clean Sheet™ <onboarding@resend.dev>",
          to: "sonal@thecleansheet.in",
          subject: `Nutraceutical waitlist: ${email}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
              <p style="font-size:12px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.1em;margin:0 0 8px">The Clean Sheet™ · Waitlist</p>
              <h2 style="font-size:20px;font-weight:800;color:#0a1f16;margin:0 0 16px">Wants to know when we rate nutraceuticals</h2>
              <p style="font-size:14px;color:#0a1f16;margin:0 0 6px"><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p style="font-size:14px;color:#0a1f16;margin:0 0 6px"><strong>Came from:</strong> ${escapeHtml([brand, productName].filter(Boolean).join(" ") || "a search")}</p>
              <p style="font-size:11px;color:#9ca3af;margin:16px 0 0">Submitted at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
            </div>
          `,
        }),
      });
      notified = res.ok;
    } catch (e) {
      console.error("[unrated-notify] could not send the notification", e instanceof Error ? e.message : e);
    }
  }

  if (!stored && !notified) return Response.json({ error: "Could not save your email" }, { status: 503 });
  return Response.json({ success: true });
}
