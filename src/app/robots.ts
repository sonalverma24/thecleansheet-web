import type { MetadataRoute } from "next";

// Paths crawlers should not waste requests on: the admin area and gated/private
// URLs. /api/ is deliberately NOT blanket-blocked: public pages fetch
// /api/reviews and /api/verified-products while rendering, and Googlebot needs
// those to render them. Pages that must stay OUT OF THE INDEX are handled with a
// noindex meta tag instead (see src/lib/seo.ts), never robots.txt alone: Google
// cannot see a noindex on a blocked URL and may still list it URL-only. That is
// why the guide print pages (/learn/guides/*/print) are deliberately not listed
// here: they carry noindex and must stay crawlable so Google can read it.
const DISALLOW = [
  "/admin/",
  "/api/admin/",
  "/courses/skincare-101/welcome-9x4k2mq7/",
  "/preview/",
];

// AI answer engines we explicitly welcome. Listing them keeps The Clean Sheet
// citable inside ChatGPT, Claude, Gemini, Perplexity and Google's AI Overviews.
// (The "*" rule already permits them; being explicit guards against a future
// blanket block and documents intent. Blocking Google-Extended, for instance,
// would silently drop us out of Gemini.)
const AI_CRAWLERS = [
  "GPTBot",          // OpenAI training
  "OAI-SearchBot",   // ChatGPT Search
  "ChatGPT-User",    // ChatGPT live browsing
  "ClaudeBot",       // Anthropic training
  "Claude-Web",      // Claude live browsing
  "anthropic-ai",    // Anthropic (legacy)
  "PerplexityBot",   // Perplexity index
  "Perplexity-User", // Perplexity live browsing
  "Google-Extended", // Gemini / Vertex grounding
  "Applebot-Extended",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      // Same access as everyone else, stated by name for the AI engines.
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: "https://thecleansheet.in/sitemap.xml",
    host: "https://thecleansheet.in",
  };
}
