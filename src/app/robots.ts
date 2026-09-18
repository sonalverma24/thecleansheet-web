import type { MetadataRoute } from "next";

// Paths kept out of every crawler's index (thin, gated, or print-only).
const DISALLOW = [
  "/courses/skincare-101/welcome-9x4k2mq7/",
  "/learn/guides/*/print/",
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
