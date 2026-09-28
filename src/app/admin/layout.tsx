import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

// Internal admin tools: never indexable.
export const metadata: Metadata = { robots: NOINDEX };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
