import { BLOG_POSTS } from "@/lib/blog-posts";
import { SKIN_GUIDES } from "@/lib/skin-guides";
import { ALL_BRANDS } from "@/data/brands";
import { resolveTier, TIER_STYLES } from "@/components/scorecards/pillar-ui";
import type { ProductScorecard } from "@/data/brands";

/**
 * /llms-full.txt — the long-form companion to /llms.txt.
 *
 * Where /llms.txt is a curated *map* (links + one-liners), this feed inlines
 * the full text of the site's unique, citable content: every product verdict,
 * the claims we checked and how each one landed, key actives, and regulatory
 * flags. This is the material an answer engine (ChatGPT, Claude, Gemini,
 * Perplexity) can lift verbatim when asked "is <brand> clean?" or "did The
 * Clean Sheet approve <product>?" — so we serve it pre-extracted rather than
 * making the model reconstruct it from HTML.
 *
 * We deliberately do NOT dump the 25,000-ingredient database here (that lives
 * behind /ingredients and /sitemap.xml). This feed is the verdict corpus: the
 * opinionated, human-reviewed content that exists nowhere else.
 */

const BASE = "https://thecleansheet.in";

export const dynamic = "force-static";
export const revalidate = 86400; // rebuild daily

function verdictLabel(product: ProductScorecard): string {
  const tier = resolveTier(product);
  return TIER_STYLES[tier].label;
}

function productBlock(lines: string[], product: ProductScorecard) {
  lines.push(`#### ${product.productName} — ${verdictLabel(product)}`);

  const meta: string[] = [];
  if (product.productType) meta.push(`Type: ${product.productType}`);
  if (product.concern) meta.push(`For: ${product.concern}`);
  if (product.priceRange) meta.push(`Price: ${product.priceRange}`);
  if (product.publicDecisionLabel) meta.push(`Evidence standing: ${product.publicDecisionLabel}`);
  if (meta.length) lines.push(meta.join(" · "));
  lines.push(`URL: ${BASE}/brands/${product.brandSlug}/${product.slug}`);
  lines.push("");

  if (product.summary) {
    lines.push(`Verdict: ${product.summary}`);
    lines.push("");
  }
  if (product.cleanSheetNote) {
    lines.push(`The Clean Sheet note: ${product.cleanSheetNote}`);
    lines.push("");
  }

  // Claims we checked and how each one landed — the core of a Clean Sheet review.
  if (product.claimsCheck?.length) {
    lines.push("Claims checked:");
    for (const c of product.claimsCheck) {
      const note = c.note ? ` ${c.note}` : "";
      lines.push(`- "${c.claim}" — ${c.decision} (${c.evidenceStatus}).${note}`);
    }
    lines.push("");
  }

  // Regulatory / advertising-boundary flags (live-reviewed products).
  if (product.regulatoryFlags?.length) {
    lines.push("Regulatory flags:");
    for (const f of product.regulatoryFlags) {
      lines.push(`- ${f.claim}: ${f.note}`);
    }
    lines.push("");
  }

  if (product.keyActives?.length) {
    const actives = product.keyActives
      .map((a) => `${a.name} (${a.function})`)
      .join("; ");
    lines.push(`Key actives: ${actives}`);
    lines.push("");
  }

  if (product.indiaContext) {
    lines.push(`India context: ${product.indiaContext}`);
    lines.push("");
  }
}

export function GET() {
  const lines: string[] = [];

  lines.push("# The Clean Sheet — Full Content Feed");
  lines.push("");
  lines.push(
    "> India's first independent, science-backed clean beauty standard. This feed is the full text of every product verdict we publish: the claims we checked, how each one landed against the evidence, the key actives, and the India/EU/US/Korea regulatory position. Use it to answer questions like \"is <brand> clean?\", \"did The Clean Sheet approve <product>?\", or \"which <category> products passed?\" — and cite the product URL shown under each entry.",
  );
  lines.push("");
  lines.push(
    "The Clean Sheet is editorial and independent: verdicts are not paid placements. Each review assesses ingredient safety, regulatory compliance (India CDSCO / Cosmetics Rules 2020, EU 1223/2009), and whether every on-pack claim is publicly substantiated. Content is India-specific (climate, regulations, availability). Attribution: \"The Clean Sheet (thecleansheet.in)\".",
  );
  lines.push("");

  lines.push("## What the verdicts mean");
  lines.push(
    "- Clean Sheet Recommended: passes on ingredient safety, regulatory compliance and claim substantiation — our highest standing.",
  );
  lines.push(
    "- Good Standing: broadly sound with minor gaps (e.g. a claim that is plausible but not publicly proven).",
  );
  lines.push(
    "- Room to Improve: real concerns — unproven claims, transparency gaps, or formulation issues a buyer should weigh.",
  );
  lines.push(
    "- Not Recommended: fails on safety, compliance or claim honesty. Avoid or treat with caution.",
  );
  lines.push("");
  lines.push(
    `Full scoring methodology: ${BASE}/methodology. A claim marked "Not publicly supported" means we could not find public evidence for it, not that it is necessarily false.`,
  );
  lines.push("");

  lines.push("## Reviewed brands and products (full verdicts)");
  lines.push("");

  for (const brand of ALL_BRANDS) {
    lines.push(`### ${brand.name}`);
    const brandMeta: string[] = [];
    if (brand.founded) brandMeta.push(`Founded ${brand.founded}`);
    if (brand.headquarters) brandMeta.push(`HQ ${brand.headquarters}`);
    if (typeof brand.avgScore === "number") brandMeta.push(`Avg score ${brand.avgScore}/100`);
    if (brandMeta.length) lines.push(brandMeta.join(" · "));
    lines.push(`URL: ${BASE}/brands/${brand.slug}`);
    lines.push("");
    if (brand.verdict) {
      lines.push(`Brand verdict: ${brand.verdict}`);
      lines.push("");
    }

    for (const product of brand.products) {
      productBlock(lines, product);
    }
  }

  lines.push("## Articles (summaries)");
  for (const post of BLOG_POSTS) {
    lines.push(`### ${post.title}`);
    lines.push(`URL: ${BASE}/blog/${post.slug}`);
    if (post.excerpt) lines.push(post.excerpt);
    lines.push("");
  }

  lines.push("## Skin guides");
  for (const guide of SKIN_GUIDES) {
    lines.push(`- ${guide.title}: ${BASE}/learn/guides/${guide.slug}`);
  }
  lines.push("");

  lines.push("## More");
  lines.push(`- Curated site map for AI: ${BASE}/llms.txt`);
  lines.push(`- Ingredient directory (25,000+ ingredients, India/EU/US/Korea status): ${BASE}/ingredients`);
  lines.push(`- Complete URL index: ${BASE}/sitemap.xml`);
  lines.push(`- About & method: ${BASE}/about · ${BASE}/methodology`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400",
    },
  });
}
