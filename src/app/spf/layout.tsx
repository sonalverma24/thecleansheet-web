import type { Metadata } from "next";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "SPF Proof Report for Sunscreen Brands",
  description:
    "Independent verification of SPF, UVA and water-resistance claims: an evidence audit and confirmatory laboratory testing, ending in a permanent public proof page.",
  alternates: { canonical: "https://thecleansheet.in/spf" },
};

export default function SpfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
