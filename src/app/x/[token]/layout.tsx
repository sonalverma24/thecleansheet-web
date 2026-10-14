import type { Metadata } from "next";

// Private pitch demo. Neutral tab title (absolute, so the site's "| The Clean
// Sheet" template does not apply), never indexed, no link previews worth
// reading. The matching X-Robots-Tag header is set in next.config.ts.
export const metadata: Metadata = {
  title: { absolute: "Preview" },
  description: "Preview",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: { title: "Preview", description: "Preview", siteName: "Preview" },
  twitter: { card: "summary", title: "Preview", description: "Preview" },
};

export default function PitchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
