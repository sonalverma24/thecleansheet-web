import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import GateForm from "@/components/pitch/GateForm";
import { PITCH_COOKIE, pitchEnabled, verifyPitchCookie } from "@/lib/pitch-gate";

/* Every private client preview under /preview/* sits behind the same password
   as the retailer pitch demo, on top of its unguessable URL. Fails CLOSED: if
   the PITCH_* env vars are not set the previews 404 instead of being public. */
export default async function PreviewGateLayout({ children }: { children: React.ReactNode }) {
  if (!pitchEnabled()) notFound();
  const jar = await cookies();
  if (!verifyPitchCookie(jar.get(PITCH_COOKIE)?.value)) return <GateForm scope="preview" />;
  return <>{children}</>;
}
