import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "User Acquisition | The Clean Sheet Admin",
  robots: { index: false, follow: false },
};

type AttributionRow = {
  user_id: string;
  first_seen_at: string | null;
  first_source: string | null;
  first_medium: string | null;
  first_campaign: string | null;
  first_landing_path: string | null;
  last_source: string | null;
  last_medium: string | null;
  last_campaign: string | null;
  signup_path: string | null;
  recorded_at: string | null;
};

const PAGE_SIZE = 1000;
const MAX_REPORT_ROWS = 10000;

function display(value: string | null | undefined): string {
  return value?.trim() || "Unknown";
}

function asDate(value: string | null): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

function countBy(rows: AttributionRow[], key: (item: AttributionRow) => string) {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const name = key(row);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white border border-[#b0a8a4]/25 p-5">
      <p className="text-3xl text-[#282828]" style={{ fontFamily: "Cooper BT, Georgia, serif" }}>{value.toLocaleString("en-IN")}</p>
      <p className="text-xs mt-1 text-[#555]">{label}</p>
    </div>
  );
}

function Ranking({ title, rows }: { title: string; rows: { name: string; count: number }[] }) {
  const max = rows[0]?.count || 1;
  return (
    <section className="rounded-2xl border border-[#b0a8a4]/25 bg-white p-5">
      <h2 className="text-lg text-[#282828] mb-4" style={{ fontFamily: "Cooper BT, Georgia, serif" }}>{title}</h2>
      {rows.length === 0 && <p className="text-sm text-[#555]">No signup attribution recorded yet.</p>}
      <div className="space-y-4">
        {rows.slice(0, 8).map(({ name, count }) => (
          <div key={name}>
            <div className="flex justify-between gap-3 mb-1 text-xs">
              <span className="text-[#282828] break-all">{name}</span>
              <span className="shrink-0 text-[#555]">{count.toLocaleString("en-IN")}</span>
            </div>
            <div className="h-2 rounded-full bg-[#e3f1ef] overflow-hidden">
              <div className="h-full rounded-full bg-[#248179]" style={{ width: String((count / max) * 100) + "%" }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function AcquisitionAdminPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.email) redirect("/account");

  // Authenticated is not sufficient: check the verified user's email against
  // the server environment allowlist, never user-editable profile metadata.
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((address) => address.trim().toLowerCase())
    .filter(Boolean);
  if (!admins.includes(user.email.toLowerCase())) redirect("/");

  const admin = createAdminClient();
  const { count, error: countError } = await admin
    .from("user_attribution")
    .select("user_id", { count: "exact", head: true });

  const rows: AttributionRow[] = [];
  let readError: string | null = countError?.message ?? null;

  for (let offset = 0; offset < MAX_REPORT_ROWS; offset += PAGE_SIZE) {
    const { data, error } = await admin
      .from("user_attribution")
      .select("user_id, first_seen_at, first_source, first_medium, first_campaign, first_landing_path, last_source, last_medium, last_campaign, signup_path, recorded_at")
      .order("recorded_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      readError = error.message;
      break;
    }
    const chunk = (data ?? []) as AttributionRow[];
    rows.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
  }

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recent = rows.filter((row) => row.recorded_at && Date.parse(row.recorded_at) >= thirtyDaysAgo);
  const known = recent.filter((row) => {
    const value = row.first_source?.toLowerCase().trim();
    return Boolean(value && value !== "direct / unknown" && value !== "unknown");
  });
  const sources = countBy(recent, (row) => display(row.first_source));
  const pages = countBy(recent, (row) => display(row.first_landing_path));
  const campaigns = countBy(recent.filter((row) => row.first_campaign), (row) => display(row.first_campaign));

  return (
    <main className="min-h-screen bg-white text-[#282828]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-9">
        <div className="flex flex-wrap justify-between gap-3 items-start mb-8">
          <div>
            <Link href="/admin" className="text-xs text-[#248179] hover:underline">Back to admin</Link>
            <h1 className="text-3xl mt-2" style={{ fontFamily: "Cooper BT, Georgia, serif" }}>User acquisition</h1>
            <p className="text-sm mt-2 text-[#555]">Registration attribution from the last 30 days</p>
          </div>
          <p className="text-xs text-[#555] border border-[#b0a8a4]/25 rounded-full px-3 py-2">Private admin report</p>
        </div>

        {readError && (
          <div role="alert" className="p-4 mb-6 rounded-xl border border-[#fd6158] text-sm">
            Unable to load all attribution records. {readError}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          <SummaryCard label="All recorded signups" value={count ?? rows.length} />
          <SummaryCard label="Last 30 days" value={recent.length} />
          <SummaryCard label="Known first source (30d)" value={known.length} />
          <SummaryCard label="Unknown source (30d)" value={recent.length - known.length} />
        </div>

        {(count ?? 0) > rows.length && (
          <p className="mb-6 text-sm text-[#555]">
            Report is limited to the latest {MAX_REPORT_ROWS.toLocaleString("en-IN")} records. Full history requires paginated export.
          </p>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Ranking title="First traffic source" rows={sources} />
          <Ranking title="First landing page" rows={pages} />
          <Ranking title="First campaign" rows={campaigns} />
        </div>

        <section className="rounded-2xl border border-[#b0a8a4]/25 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-[#b0a8a4]/20">
            <h2 className="text-xl" style={{ fontFamily: "Cooper BT, Georgia, serif" }}>Recent registered users</h2>
            <p className="text-xs text-[#555] mt-1">Attribution only. No emails or names are exposed in this report.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#e3f1ef] text-[#282828]">
                <tr>
                  <th className="p-3 font-semibold">User ID</th>
                  <th className="p-3 font-semibold">Recorded</th>
                  <th className="p-3 font-semibold">First source</th>
                  <th className="p-3 font-semibold">First page</th>
                  <th className="p-3 font-semibold">Latest identifiable source</th>
                  <th className="p-3 font-semibold">Signup page</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map((row) => (
                  <tr key={row.user_id} className="border-t border-[#b0a8a4]/20">
                    <td className="p-3 font-mono text-[#555]" title={row.user_id}>{row.user_id.slice(0, 8)}</td>
                    <td className="p-3 whitespace-nowrap">{asDate(row.recorded_at)}</td>
                    <td className="p-3">{display(row.first_source)}</td>
                    <td className="p-3 break-all max-w-72">{display(row.first_landing_path)}</td>
                    <td className="p-3">{display(row.last_source)}</td>
                    <td className="p-3 break-all">{display(row.signup_path)}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-[#555]">No attributed registrations yet. New signups will appear after tracking is deployed.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="text-xs text-[#555] mt-5 leading-relaxed">
          Source values are best effort, not proof of a person's origin. Private shares, blockers and signups
          completed in another browser can appear as unknown. Existing accounts are not retrospectively attributed.
          This report counts recorded signups, not all website visitors or a sitewide conversion rate.
        </p>
      </div>
    </main>
  );
}
