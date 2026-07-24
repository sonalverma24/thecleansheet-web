import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
