import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/courses/skincare-101/welcome-9x4k2mq7/",
          "/learn/guides/*/print/",
        ],
      },
    ],
    sitemap: "https://thecleansheet.in/sitemap.xml",
  };
}
