import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "beminimalist.co" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "adn-static1.nykaa.com" },
      { protocol: "https", hostname: "www.dotandkey.com" },
      { protocol: "https", hostname: "incidecoder-content.storage.googleapis.com" },
      { protocol: "https", hostname: "discoverpilgrim.com" },
      { protocol: "https", hostname: "letshyphen.com" },
      { protocol: "https", hostname: "plumgoodness.com" },
      { protocol: "https", hostname: "antinorm.co" },
      { protocol: "https", hostname: "www.simpleskincare.in" },
    ],
    dangerouslyAllowSVG: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
