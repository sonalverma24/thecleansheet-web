import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask Clean — AI Ingredient Analyzer",
  description:
    "Paste any skincare or beauty product URL or ingredient list. Our AI checks every ingredient for safety, regulatory compliance (India, EU, US), and gives you a science-backed Clean Sheet Score — free.",
  keywords: [
    "ingredient checker India", "is this product safe", "skincare ingredient analysis",
    "cosmetic safety checker", "INCI analysis tool", "product ingredient scanner India",
    "clean beauty analyzer", "Ask Clean", "check product ingredients online",
  ],
  alternates: { canonical: "https://thecleansheet.in/analyzer" },
  openGraph: {
    title: "Ask Clean — AI Beauty Ingredient Analyzer | The Clean Sheet™",
    description:
      "Instantly check if any skincare product is safe. Paste a URL or ingredient list — our AI scans every ingredient and gives you a Clean Sheet Score.",
    url: "https://thecleansheet.in/analyzer",
    type: "website",
    images: [{ url: "/images/hero-illustration.jpg", width: 1200, height: 630, alt: "Ask Clean AI Ingredient Analyzer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask Clean — AI Beauty Ingredient Analyzer",
    description:
      "Instantly check if any skincare product is safe. Paste a URL or ingredient list — our AI scans every ingredient.",
    images: ["/images/hero-illustration.jpg"],
  },
};

export default function AnalyzerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
