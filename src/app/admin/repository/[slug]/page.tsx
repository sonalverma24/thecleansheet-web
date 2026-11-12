import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { AnalysisEditor } from "./AnalysisEditor";

export const metadata: Metadata = { title: "Edit analysis | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditAnalysisPage({ params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/");
  const { slug } = await params;
  return (
    <div className="min-h-screen bg-[#faf7f2] px-4 sm:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <AnalysisEditor slug={decodeURIComponent(slug)} />
      </div>
    </div>
  );
}
