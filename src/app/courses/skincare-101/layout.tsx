import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

// Registrations for this session are closed: an expired event page has no search value.
// Remove this file if the course reopens.
export const metadata: Metadata = { robots: NOINDEX };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
