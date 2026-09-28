import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

// Routine builder is an unlinked, unfinished tool with no metadata. Remove this file to
// index it once it is linked from the site and has its own title and description.
export const metadata: Metadata = { robots: NOINDEX };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
