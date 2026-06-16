import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/analyser", destination: "/analyzer", permanent: true },
      { source: "/analyser/:path*", destination: "/analyzer/:path*", permanent: true },
    ];
  },
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
      { protocol: "https", hostname: "mamaearth.in" },
      { protocol: "https", hostname: "images.mamaearth.in" },
      { protocol: "https", hostname: "codeskin.in" },
      { protocol: "https", hostname: "thedeconstruct.in" },
      { protocol: "https", hostname: "aqualogica.in" },
      { protocol: "https", hostname: "thedermaco.com" },
      { protocol: "https", hostname: "lotusherbals.com" },
      { protocol: "https", hostname: "www.lotus.in" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "lh4.googleusercontent.com" },
      { protocol: "https", hostname: "lh5.googleusercontent.com" },
      { protocol: "https", hostname: "lh6.googleusercontent.com" },
    ],
    dangerouslyAllowSVG: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
