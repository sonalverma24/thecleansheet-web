import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import GateForm from "@/components/pitch/GateForm";
import NykaaListing, { type ListingProduct } from "@/components/pitch/NykaaListing";
import { LISTING_TITLE, LISTING_TOTAL, PRODUCTS } from "@/data/pitch/nykaa-baby";
import { VERIFICATIONS } from "@/data/pitch/verifications";
import { PITCH_COOKIE, isPitchToken, pitchEnabled, verifyPitchCookie } from "@/lib/pitch-gate";

export const dynamic = "force-dynamic";

export default async function PitchPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Wrong token, or feature switched off: indistinguishable from any missing page.
  if (!pitchEnabled() || !isPitchToken(token)) notFound();

  const jar = await cookies();
  if (!verifyPitchCookie(jar.get(PITCH_COOKIE)?.value)) return <GateForm token={token} />;

  // The product and verification data are only read here, after the gate, and
  // reach the browser only as props of the unlocked page.
  const products: ListingProduct[] = PRODUCTS.map((p) => ({ ...p, verification: VERIFICATIONS[p.id] ?? null }));
  return <NykaaListing products={products} title={LISTING_TITLE} total={LISTING_TOTAL} />;
}
