import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

// Mobile app shell (a tool UI, not content): never indexable.
export const metadata: Metadata = { robots: NOINDEX };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
