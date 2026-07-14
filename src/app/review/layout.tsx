import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Review — Claims, Proof & Price | The Clean Sheet™",
  description:
    "See whether a brand's claims match what the product can actually do. The Clean Sheet Product Review checks every claim, maps evidence levels, tracks prices across platforms, and gives you the real verdict.",
  keywords: [
    "beauty product claims review India", "is this claim true skincare",
    "product review evidence based India", "price comparison skincare India",
    "nykaa amazon price comparison beauty", "clean beauty claim check",
    "ingredient claim credibility", "the clean sheet product review",
  ],
  alternates: { canonical: "https://thecleansheet.in/review" },
  openGraph: {
    title: "Product Review — Claims, Proof & Price | The Clean Sheet™",
    description:
      "Every claim. Every platform. One honest verdict. The Clean Sheet Product Review.",
    url: "https://thecleansheet.in/review",
    type: "website",
  },
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
