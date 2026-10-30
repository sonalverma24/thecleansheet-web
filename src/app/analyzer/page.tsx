import { redirect } from "next/navigation";
import { REVIEW_RUN_PARAM } from "@/lib/review-run";

// The analyser lives on /brands now. Old /analyzer?product=<query> links forward the
// query as ?analyse=<query>, which /brands runs on arrival, instead of dropping it.
export default async function AnalyzerRedirect({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  redirect(product ? `/products?${REVIEW_RUN_PARAM}=${encodeURIComponent(product)}` : "/products");
}
