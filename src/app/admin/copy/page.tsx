import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { CopyAdminClient } from "./CopyAdminClient";

export const metadata: Metadata = { title: "Site wording | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CopyAdminPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/");
  return (
    <div className="min-h-screen bg-[#faf7f2] px-4 sm:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl text-[#282828] mb-1" style={{ fontFamily: "Cooper BT, Georgia, serif" }}>Site wording</h1>
        <p className="text-sm text-[#4a4a4a] mb-2">
          To change wording, open any page of the site while signed in as admin and press <b>Edit text</b> at the bottom left.
          Every line you can change gets a dashed outline: click it, type, and press Save and publish.
        </p>
        <p className="text-sm text-[#8a817c] mb-6">
          Editable now: the home page, the footer, About and Methodology. Below is every line that has been changed so far.
        </p>
        <CopyAdminClient />
      </div>
    </div>
  );
}
