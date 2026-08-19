import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { RepositoryAdminClient } from "./RepositoryAdminClient";

export const metadata: Metadata = {
  title: "Repository | Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RepositoryAdminPage() {
  // Auth: must be signed in AND on the ADMIN_EMAILS allowlist.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  if (!user?.email || !admins.includes(user.email.toLowerCase())) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] px-4 sm:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl text-[#282828] mb-1" style={{ fontFamily: "Cooper BT, Georgia, serif" }}>
          Review repository
        </h1>
        <p className="text-sm text-[#b0a8a4] mb-6">
          Fix a missing/wrong product image, or remove a review. Changes hit the live site
          (a redeploy clears all caches immediately).
        </p>
        <RepositoryAdminClient />
      </div>
    </div>
  );
}
