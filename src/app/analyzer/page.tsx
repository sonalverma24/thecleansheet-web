import { redirect } from "next/navigation";

// The claims-first analyzer now lives at /review — the single canonical tool.
// /brands links here as /analyzer?product=<query> for its "no scorecard yet"
// CTA; /review reads the query as ?q=, so forward it under that name instead
// of dropping it.
export default async function AnalyzerRedirect({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  redirect(product ? `/review?q=${encodeURIComponent(product)}` : "/review");
}
