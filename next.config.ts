import type { NextConfig } from "next";

// Next.js streams <title>/<meta>/canonical into <body> for user agents that are
// not on its "limited bots" list, and Googlebot is (by design) not on the default
// list. For dynamic pages (notably /reviews/[slug]) that pushes the canonical
// hundreds of KB into the document. Add Googlebot so it always gets metadata in
// <head>. This is Next's own default list (next/dist/shared/lib/router/utils/html-bots)
// plus Googlebot; re-check it when upgrading Next.
const HTML_LIMITED_BOTS =
  /Googlebot|[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i;

const nextConfig: NextConfig = {
  htmlLimitedBots: HTML_LIMITED_BOTS,
  // Allows CI/sandbox builds to write outside the project dir (defaults to .next)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Product photos come from many brand/retailer CDNs (beminimalist.co,
    // INCIDecoder, Nykaa, Shopify stores, and so on) allow any https image host.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async redirects() {
    return [
      // Retired CodeSkin certification-style demo pages, superseded by the new registry.
      // Redirected (not deleted) so no page presents a product as certified.
      { source: "/verify/codeskin-ultralite-certified-8f3t2p9x", destination: "/verify", permanent: true },
      { source: "/verify/codeskin-ultralite-evidence-r4t8w2k6", destination: "/verify", permanent: true },
      { source: "/verify/codeskin-ultralite-proof-q3w5e7r2", destination: "/verify", permanent: true },
      { source: "/verify/codeskin-ultralite-full-v2-p5r7k2", destination: "/verify", permanent: true },
      { source: "/verify/tcs-in-2026-048291-b7f2a9c1e5d3", destination: "/verify", permanent: true },
      // Legacy pages retired into the new information architecture (Standard | Education | Verify | About).
      { source: "/certification", destination: "/standard", permanent: true },
      { source: "/methodology", destination: "/standard", permanent: true },
      { source: "/services", destination: "/for-brands", permanent: true },
      { source: "/certified", destination: "/verify", permanent: true },
      { source: "/consumers", destination: "/verify", permanent: true },
      // The analyzer moved to /review. Permanent (308) so Google consolidates onto
      // /review; /brands still links here as /analyzer?product=<query>, which /review
      // reads as ?q=.
      { source: "/analyzer", has: [{ type: "query", key: "product", value: "(?<product>.+)" }], destination: "/review?q=:product", permanent: true },
      { source: "/analyzer", destination: "/review", permanent: true },
      { source: "/analyser", destination: "/review", permanent: true },
      // Retracted duplicate review (doubled brand prefix in the slug) -> the kept review of the same product.
      { source: "/reviews/kay-beauty-kay-beauty-hydra-creme-lipstick", destination: "/reviews/kay-beauty-hydra-creme-lipstick", permanent: true },
    ];
  },
};

export default nextConfig;
