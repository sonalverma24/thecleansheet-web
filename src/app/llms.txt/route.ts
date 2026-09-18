import { BLOG_POSTS } from "@/lib/blog-posts";
import { SKIN_GUIDES } from "@/lib/skin-guides";
import { ALL_BRANDS } from "@/data/brands";

/**
 * /llms.txt — a curated, plain-text map of the site for AI answer engines
 * (ChatGPT, Claude, Gemini, Perplexity). Follows the emerging llms.txt
 * convention: an H1 name, a one-line summary, then linked sections. We link
 * curated hubs rather than dumping all 500+ ingredient pages — the full URL
 * inventory lives in /sitemap.xml, which we point to at the end.
 */

const BASE = "https://thecleansheet.in";

export const dynamic = "force-static";
export const revalidate = 86400; // rebuild daily

export function GET() {
  const lines: string[] = [];

  lines.push("# The Clean Sheet");
  lines.push("");
  lines.push(
    "> India's first independent, science-backed clean beauty standard. We check every marketing claim on a beauty product against real evidence and the actual INCI ingredient list, then give one clear verdict. Free AI ingredient analyser, a directory of independently reviewed products and brands, and a 25,000+ cosmetic ingredient safety database with India, EU, US and Korea regulatory status.",
  );
  lines.push("");
  lines.push(
    "The Clean Sheet is editorial and independent: verdicts are not paid placements. Reviews assess ingredient safety, regulatory compliance (India CDSCO / Cosmetics Rules 2020, EU 1223/2009), and whether each on-pack claim is publicly substantiated. Content is India-specific (climate, regulations, availability).",
  );
  lines.push("");

  lines.push("## Core tools");
  lines.push(
    `- [Ingredient Analyser](${BASE}/analyzer): Paste a product name, URL or INCI list to get a full ingredient safety breakdown.`,
  );
  lines.push(
    `- [Product Review](${BASE}/review): Get one clear Clean Sheet standing for any product, with every claim checked against evidence.`,
  );
  lines.push(
    `- [Ingredient Directory](${BASE}/ingredients): Search 25,000+ cosmetic ingredients for safety, allergen flags and regulatory limits.`,
  );
  lines.push(
    `- [Certified Products](${BASE}/certified): Products that have passed The Clean Sheet certification.`,
  );
  lines.push(
    `- [Brand Scorecards](${BASE}/brands): Independently reviewed beauty brands sold in India, ranked by verdict.`,
  );
  lines.push("");

  lines.push("## Brands reviewed");
  for (const brand of ALL_BRANDS) {
    lines.push(`- [${brand.name}](${BASE}/brands/${brand.slug}): ${brand.tagline}`);
    for (const p of brand.products) {
      lines.push(`  - [${p.productName}](${BASE}/brands/${brand.slug}/${p.slug})`);
    }
  }
  lines.push("");

  lines.push("## Articles");
  for (const post of BLOG_POSTS) {
    lines.push(`- [${post.title}](${BASE}/blog/${post.slug}): ${post.excerpt}`);
  }
  lines.push("");

  lines.push("## Skin guides");
  for (const guide of SKIN_GUIDES) {
    lines.push(`- [${guide.title}](${BASE}/learn/guides/${guide.slug})`);
  }
  lines.push("");

  lines.push("## About & method");
  lines.push(`- [About The Clean Sheet](${BASE}/about)`);
  lines.push(`- [Scoring methodology](${BASE}/methodology): How verdicts and the 5-pillar score are calculated.`);
  lines.push(`- [Certification standard](${BASE}/certification)`);
  lines.push("");

  lines.push("## Full index");
  lines.push(`- [Full content feed](${BASE}/llms-full.txt): The full text of every product verdict — claims checked, key actives and regulatory position — pre-extracted for AI answer engines.`);
  lines.push(`- [XML sitemap](${BASE}/sitemap.xml): Complete list of every page, including all individual ingredient pages.`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400",
    },
  });
}
