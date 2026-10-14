"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

/* Google Analytics + Meta Pixel. Skipped on the private retailer pitch demo
   (/x/*) and the private client previews (/preview/*): both tools record the
   page URL, which on those routes is the secret. */
export default function AnalyticsScripts() {
  const pathname = usePathname();
  if (pathname?.startsWith("/x/") || pathname?.startsWith("/preview/")) return null;

  return (
    <>
      {/* Google Analytics */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-DXHG8FBXQT" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-DXHG8FBXQT');
      `}</Script>

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
        fbq('init','1864272357580009');
        fbq('track','PageView');
      `}</Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1864272357580009&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </>
  );
}
