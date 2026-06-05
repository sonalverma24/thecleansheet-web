import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_BRANDS } from "@/data/brands";
import { AdminReviewsClient } from "./AdminReviewsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews | Admin",
  robots: { index: false, follow: false },
};

// Force dynamic rendering - this page must never be cached or statically generated
export const dynamic = "force-dynamic";

function formatDisplayName(anonymous: boolean, name: string | null): string {
  if (anonymous || !name) return "Verified user";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export default async function AdminReviewsPage() {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/");
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  if (!adminEmails.includes(user.email.toLowerCase())) {
    redirect("/");
  }

  // ── Fetch all reviews (admin client bypasses RLS) ───────────────────────────
  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from("reviews")
    .select("id, product_id, user_id, rating, review_text, display_anonymously, status, created_at, updated_at, users(name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin Reviews] Fetch failed:", error.message);
  }

  // ── Shape data ──────────────────────────────────────────────────────────────
  const reviews = (rows ?? []).map((r) => {
    const u = (r.users as unknown) as { name: string | null; email: string | null } | null;
    const [brandSlug, productSlug] = (r.product_id as string).split("/");

    // Look up the product name from static data
    const brand = ALL_BRANDS.find((b) => b.slug === brandSlug);
    const product = brand?.products.find((p) => p.slug === productSlug);
    const productName = product
      ? `${brand!.name} - ${product.productName}`
      : r.product_id as string;

    return {
      id: r.id as string,
      product_id: r.product_id as string,
      product_name: productName,
      user_name: u?.name ?? null,
      user_email: u?.email ?? null,
      rating: r.rating as number,
      review_text: r.review_text as string,
      display_anonymously: r.display_anonymously as boolean,
      public_display_name: formatDisplayName(r.display_anonymously as boolean, u?.name ?? null),
      status: r.status as string,
      created_at: r.created_at as string,
    };
  });

  // ── Build product filter options from reviews that exist ────────────────────
  const seenIds = new Set<string>();
  const productOptions = reviews
    .filter((r) => { if (seenIds.has(r.product_id)) return false; seenIds.add(r.product_id); return true; })
    .map((r) => ({ id: r.product_id, name: r.product_name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Admin nav bar */}
      <div className="bg-white border-b border-[#b0a8a4]/20 px-5 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-xs text-[#b0a8a4] hover:text-[#248179] transition-colors">
            ← The Clean Sheet
          </a>
          <span className="text-[#b0a8a4]/40">/</span>
          <span className="text-xs text-[#282828]">Admin</span>
          <span className="text-[#b0a8a4]/40">/</span>
          <span className="text-xs text-[#248179]">Reviews</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin/taxonomy"
            className="text-xs text-[#b0a8a4] hover:text-[#248179] transition-colors"
          >
            Taxonomy
          </a>
          <span
            className="text-[11px] bg-[#e3f1ef] text-[#248179] px-2 py-0.5 rounded-full"
            style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
          >
            {user.email}
          </span>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <AdminReviewsClient reviews={reviews} productOptions={productOptions} />
      </div>
    </div>
  );
}
