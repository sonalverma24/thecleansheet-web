import type { NextConfig } from "next";

// Next.js streams <title>/<meta>/canonical into <body> for user agents that are
// not on its "limited bots" list, and Googlebot is (by design) not on the default
// list. For dynamic pages (notably /analysis/[slug]) that pushes the canonical
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
  // The skin-type guide PDFs live in /private/guides (not /public) and are read from disk by
  // /api/guides/[slug]; tell the file tracer to ship them with that route.
  outputFileTracingIncludes: {
    "/api/guides/[slug]": ["./private/guides/**/*"],
  },
  async redirects() {
    return [
      // The skin-type guide PDFs moved behind a Google sign-in (/api/guides/[slug]). Old direct
      // links land on the guide page, where signing in unlocks the download.
      { source: "/guides/Oily_Skin_Care_Revised_v2.pdf", destination: "/learn/guides/oily-skin", permanent: true },
      { source: "/guides/Dry_Skin_Care_Guide.pdf", destination: "/learn/guides/dry-skin", permanent: true },
      { source: "/guides/Combination_Skin_Care_Guide.pdf", destination: "/learn/guides/combination-skin", permanent: true },
      { source: "/guides/Normal_Skin_Care_Guide.pdf", destination: "/learn/guides/normal-skin", permanent: true },
      // Retired CodeSkin certification-style demo pages, superseded by the new registry.
      // Redirected (not deleted) so no page presents a product as certified.
      { source: "/verify/codeskin-ultralite-certified-8f3t2p9x", destination: "/verify", permanent: true },
      { source: "/verify/codeskin-ultralite-evidence-r4t8w2k6", destination: "/verify", permanent: true },
      { source: "/verify/codeskin-ultralite-proof-q3w5e7r2", destination: "/verify", permanent: true },
      { source: "/verify/codeskin-ultralite-full-v2-p5r7k2", destination: "/verify", permanent: true },
      { source: "/verify/tcs-in-2026-048291-b7f2a9c1e5d3", destination: "/verify", permanent: true },
      // Duplicate Conscious Chemist Ultra Light Fluid reviews merged into one.
      { source: "/reviews/conscious-chemist-100-mineral-sunscreen-spf-50-pa", destination: "/analysis/conscious-chemist-100-mineral-sunscreen-spf-50-pa-ultra-light-fluid", permanent: true },
      { source: "/reviews/conscious-chemist-100-mineral-sunscreen-ultra-light-fluid-spf-50-pa", destination: "/analysis/conscious-chemist-100-mineral-sunscreen-spf-50-pa-ultra-light-fluid", permanent: true },
      { source: "/reviews/conscious-chemist-conscious-chemist-100-mineral-sunscreen-spf-50-pa-ultra-light-", destination: "/analysis/conscious-chemist-100-mineral-sunscreen-spf-50-pa-ultra-light-fluid", permanent: true },
      { source: "/reviews/conscious-chemist-mineral-sunscreen", destination: "/analysis/conscious-chemist-100-mineral-sunscreen-spf-50-pa-ultra-light-fluid", permanent: true },
      // Legacy pages retired into the new information architecture (Standard | Education | Verify | About).
      { source: "/certification", destination: "/standard", permanent: true },
      { source: "/methodology", destination: "/standard", permanent: true },
      { source: "/services", destination: "/for-brands", permanent: true },
      { source: "/certified", destination: "/verify", permanent: true },
      { source: "/consumers", destination: "/verify", permanent: true },
      // The analyser lives on /products: searching a product there runs the review in place and
      // opens its review page, so the old middle page (/review) is gone. Permanent (308) so
      // Google consolidates onto /products; a search in the old link (?q= / ?product=) is forwarded
      // as ?analyse=<query>, which /products runs on arrival.
      { source: "/review", has: [{ type: "query", key: "q", value: "(?<q>.+)" }], destination: "/products?analyse=:q", permanent: true },
      { source: "/review", destination: "/products", permanent: true },
      { source: "/analyzer", has: [{ type: "query", key: "product", value: "(?<product>.+)" }], destination: "/products?analyse=:product", permanent: true },
      { source: "/analyzer", destination: "/products", permanent: true },
      { source: "/analyser", destination: "/products", permanent: true },
      // Retracted duplicate review (doubled brand prefix in the slug) -> the kept review of the same product.
      { source: "/reviews/kay-beauty-kay-beauty-hydra-creme-lipstick", destination: "/analysis/kay-beauty-hydra-creme-lipstick", permanent: true },
      { source: "/reviews/codeskin-ultramatte-mineral-gel-sunscreen-spf-50-pa", destination: "/analysis/codeskin-ultramatte-mineral-gel-sunscreen", permanent: true },
      // The hand-written catalogue pages (19 brands, 115 products; src/data/brands before 2026-10-28) were removed: they were never run through the analyser.
      // Their URLs go to the product directory. Temporary (307) for now so the target can be refined per product (for example to /analysis/<slug> once a product
      // has an analysis); make these permanent (308) after review.
      { source: "/brands/:brand(minimalist|dot-and-key|kiehls|pilgrim|hyphen|plum|antinorm|simple|mamaearth|codeskin|deconstruct|aqualogica|foxtale|dermaco|lotus-herbals|cerave|dove|himalaya|mcaffeine)/:product", destination: "/products", permanent: false },
      // The product analysis pages moved from /reviews/<slug> to /analysis/<slug>. Permanent (308) so Google
      // carries the ranking over. The specific merges above come first so they reach the kept page in one hop.
      { source: "/reviews/:slug", destination: "/analysis/:slug", permanent: true },
      { source: "/reviews", destination: "/products", permanent: true },
    ];
  },
};

export default nextConfig;
