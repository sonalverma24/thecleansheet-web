import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

// Hard-coded placeholder product page (returns 200 for any id): never indexable.
export const metadata: Metadata = { robots: NOINDEX };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
