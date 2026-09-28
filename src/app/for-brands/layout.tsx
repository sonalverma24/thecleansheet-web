import type { Metadata } from "next";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "For Brands: Certify Your Product",
  description:
    "Apply to have your beauty or personal care product assessed against The Clean Sheet Standard: formula, testing, manufacturing, label and claims, with an independent decision and a public proof page.",
  alternates: { canonical: "https://thecleansheet.in/for-brands" },
};

export default function ForBrandsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
