import type { User } from "@supabase/supabase-js";

/** The four free skin-type guides. `slug` matches the guide pages under /learn/guides/[slug].
    `pdf` is the file name inside /private/guides: it is NOT in /public, so the only way to
    get it is the Google-checked route at /api/guides/[slug]. */
export const SKIN_TYPE_GUIDES = [
  { slug: "oily-skin", label: "Oily Skin", desc: "Manage sebum, minimise pores, pick non-comedogenic actives.", accent: "#14b8a6", pdf: "Oily_Skin_Care_Revised_v2.pdf" },
  { slug: "dry-skin", label: "Dry Skin", desc: "Restore the moisture barrier and lock in lasting hydration.", accent: "#3b82f6", pdf: "Dry_Skin_Care_Guide.pdf" },
  { slug: "combination-skin", label: "Combination", desc: "Balance an oily T-zone and dry cheeks without compromise.", accent: "#a855f7", pdf: "Combination_Skin_Care_Guide.pdf" },
  { slug: "normal-skin", label: "Normal Skin", desc: "Maintain your skin's natural balance and protect from ageing.", accent: "#22c55e", pdf: "Normal_Skin_Care_Guide.pdf" },
] as const;

export type SkinGuideSlug = (typeof SKIN_TYPE_GUIDES)[number]["slug"];

export function findSkinGuide(slug: string) {
  return SKIN_TYPE_GUIDES.find((g) => g.slug === slug);
}

/** Query flag that reopens the guides popup after the Google sign-in round trip. */
export const GUIDES_OPEN_PARAM = "guides";

/** True only when the person signed in through Google (not email). */
export function isGoogleUser(user: Pick<User, "app_metadata" | "identities"> | null | undefined): boolean {
  if (!user) return false;
  const meta = user.app_metadata as { provider?: string; providers?: string[] } | undefined;
  if (meta?.provider === "google") return true;
  if (Array.isArray(meta?.providers) && meta.providers.includes("google")) return true;
  return (user.identities ?? []).some((i) => i.provider === "google");
}

export type GuideDownloadResult = { ok: true } | { ok: false; reason: "signin" | "google" | "error" };

/** Browser side: ask the gated route for the PDF and hand it to the browser as a download.
    The route answers 401 (not signed in) or 403 (signed in, but not with Google). */
export async function downloadSkinGuide(slug: string, label: string): Promise<GuideDownloadResult> {
  try {
    const res = await fetch(`/api/guides/${slug}`, { credentials: "same-origin" });
    if (res.status === 401) return { ok: false, reason: "signin" };
    if (res.status === 403) return { ok: false, reason: "google" };
    if (!res.ok) return { ok: false, reason: "error" };
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = `The Clean Sheet - ${label} Guide.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}
