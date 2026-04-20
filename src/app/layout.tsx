import type { Metadata } from "next";
import { Playfair_Display, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import FormModal from "@/components/FormModal";

/* Playfair Display, fallback for Cooper BT if browser hasn't loaded
   the self-hosted font yet (flash prevention). Cooper BT woff2 files
   are in /public/fonts/ and declared via @font-face in globals.css.    */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

/* Geist Mono, for INCI lists and technical data */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Clean Sheet™, India's Clean Beauty Standard",
  description:
    "Science-backed certification and AI-powered ingredient analysis for beauty and personal care products. Know exactly what's in your products.",
  keywords: "clean beauty, ask clean, ingredient analysis, cosmetic safety, INCI, India, certification",
  openGraph: {
    title: "The Clean Sheet™",
    description: "India's first science-backed clean beauty certification.",
    siteName: "The Clean Sheet",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-screen flex flex-col antialiased">
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','1267735408908348');
          fbq('track','PageView');
        `}</Script>
        <noscript>
          <img height="1" width="1" style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1267735408908348&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppBubble />
        <FormModal />
      </body>
    </html>
  );
}
