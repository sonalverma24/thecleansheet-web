import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows CI/sandbox builds to write outside the project dir (defaults to .next)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Product photos come from many brand/retailer CDNs (beminimalist.co,
    // INCIDecoder, Nykaa, Shopify stores, …) — allow any https image host.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
