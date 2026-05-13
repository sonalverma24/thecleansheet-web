import { GoogleGenerativeAI } from "@google/generative-ai";
import { CLEAN_SHEET_SYSTEM_PROMPT, COMPARISON_SYSTEM_PROMPT, EXPERT_ANSWER_SYSTEM_PROMPT } from "@/lib/scoring-context";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

function isURL(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function scrapeURL(url: string): Promise<string | null> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const res = await fetch(jinaUrl, {
      headers: {
        Accept: "text/plain",
        "X-Return-Format": "markdown",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const content = await res.text();
    // Return first ~6000 chars to stay within token limits
    return content.slice(0, 6000);
  } catch {
    return null;
  }
}

const BOT_BLOCK_SIGNALS = [
  "access denied", "403 forbidden", "just a moment", "enable javascript",
  "security check", "please verify", "captcha", "cloudflare", "bot protection",
  "are you a human", "ddos protection", "checking your browser",
];

function isBlockedPage(content: string): boolean {
  const lower = content.toLowerCase().slice(0, 1000);
  return BOT_BLOCK_SIGNALS.some((signal) => lower.includes(signal));
}

// Try to extract a usable product name + brand from scraped content
// so Gemini can search for the INCI on external sources
function extractProductHint(content: string): string {
  if (isBlockedPage(content)) return "";
  // Grab the first non-empty lines, usually title + brand on product pages
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  // Take up to first 5 meaningful lines (skip very short ones)
  const hint = lines.filter((l) => l.length > 5).slice(0, 5).join(" | ");
  return hint.slice(0, 300);
}

// Fall back to extracting a human-readable product name from the URL slug
// e.g. /collections/all/products/facewash-clarifi → "facewash clarifi"
// e.g. /nat-habit-fresh-whipped-skin-malai-double-cocoa-body-butter/p/123 → full name
const SKIP_URL_SEGMENTS = new Set([
  "collections", "products", "pages", "categories", "category",
  "all", "shop", "store", "product", "items", "listing", "p", "dp",
]);

function productNameFromURL(url: string): string {
  try {
    // Strip fragment (#...) before parsing so it doesn't land in the path
    const cleanUrl = url.split("#")[0];
    const path = new URL(cleanUrl).pathname;
    const segments = path.split("/").filter(Boolean);
    // Pick the LAST segment that isn't a generic path keyword or a bare number
    const slug = [...segments].reverse().find(
      (seg) => seg.length > 3 && !seg.match(/^\d+$/) && !SKIP_URL_SEGMENTS.has(seg.toLowerCase())
    ) ?? "";
    return slug.replace(/-/g, " ").trim();
  } catch {
    return "";
  }
}

function isComparisonQuery(query: string): boolean {
  const q = query.toLowerCase();
  if (q.includes(" vs ") || q.includes(" versus ") || q.includes("compare")) return true;
  if (q.includes("better than") || q.includes("which is better") || q.includes("which one is")) return true;
  if (/better.{1,80}\bor\b/i.test(query) || /\bor\b.{1,80}better/i.test(query)) return true;
  return false;
}

// Queries that are questions about ingredients, safety, skin concerns, not a specific product to score
function isExpertQuestion(query: string): boolean {
  const q = query.toLowerCase().trim();
  const questionStarters = ["is ", "are ", "does ", "do ", "can ", "should ", "what is ", "what are ", "why is ", "why are ", "how does ", "how do ", "how safe ", "is it safe", "tell me about", "explain", "which is better", "which is safer", "which works"];
  const hasQuestionMark = q.includes("?");
  const startsLikeQuestion = questionStarters.some((s) => q.startsWith(s));

  // If query contains a specific product type word alongside a brand-sounding name,
  // route to scorecard not expert — e.g. "is ponds moisturiser good for oily skin"
  const productTypeWords = [
    "moisturiser", "moisturizer", "serum", "sunscreen", "spf", "face wash", "cleanser",
    "toner", "cream", "lotion", "gel", "oil", "mask", "sheet mask", "eye cream",
    "lip balm", "shampoo", "conditioner", "body wash", "scrub", "exfoliant",
    "primer", "foundation", "bb cream", "cc cream", "micellar", "mist", "essence",
    "ampoule", "retinol", "vitamin c", "niacinamide", "aha", "bha", "spf", "face cream",
  ];
  const containsProductType = productTypeWords.some((w) => q.includes(w));

  // Known Indian & global beauty brand names (lowercase)
  const knownBrands = [
    "ponds", "pond's", "lakme", "mamaearth", "minimalist", "cetaphil", "cerave",
    "the ordinary", "dot & key", "plum", "wow", "biotique", "himalaya", "neutrogena",
    "loreal", "l'oreal", "olay", "nivea", "garnier", "vaseline", "dove", "clinic plus",
    "head & shoulders", "pantene", "sunsilk", "tresemme", "fiama", "santoor",
    "vicco", "shahnaz", "forest essentials", "kama ayurveda", "beardo", "man matters",
    "sugar", "nykaa", "mcaffeine", "re'equil", "fixderma", "cosdna", "cosrx",
    "innisfree", "the face shop", "etude", "klairs", "pyunkang yul", "some by mi",
    "dermalogica", "paula's choice", "la roche-posay", "vichy", "avene", "eucerin",
    "aveeno", "bulldog", "jack black", "supergoop", "tatcha", "drunk elephant",
    "beauty of joseon", "anua", "isntree", "torriden", "skin1004",
  ];
  const containsBrand = knownBrands.some((b) => q.includes(b));

  // Has title-case multi-word or % signals — original product detector
  const looksLikeProduct = /\d+%/.test(q)
    || q.split(" ").filter((w) => /^[A-Z]/.test(w)).length >= 2
    || containsProductType
    || containsBrand;

  // "is [ingredient] safe?" type questions — pure ingredient queries → expert
  // "is ponds moisturiser good for oily skin?" → has product type → scorecard
  if (startsLikeQuestion && !looksLikeProduct) return true;
  return hasQuestionMark && !looksLikeProduct && !isComparisonQuery(query);
}

function isValidScorecard(parsed: Record<string, unknown> | null): boolean {
  if (!parsed) return false;
  return (
    typeof parsed.score === "number" &&
    typeof parsed.productName === "string" && parsed.productName.length > 0 &&
    Array.isArray(parsed.pillars) && (parsed.pillars as unknown[]).length > 0
  );
}

function parseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    try {
      return JSON.parse(stripped);
    } catch {
      const match = stripped.match(/\{[\s\S]*\}/);
      if (match) {
        try { return JSON.parse(match[0]); } catch { /* fall through */ }
      }
    }
  }
  return null;
}

const outOfScope = () => Response.json({ type: "out_of_scope" });

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) {
      return Response.json({ error: "No query provided" }, { status: 400 });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return outOfScope();
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    let q = query.trim();
    let scrapedContext = "";

    let urlInput = "";

    // If the query is a URL, scrape the page and build the product context
    if (isURL(q)) {
      urlInput = q;
      const pageContent = await scrapeURL(q);
      if (pageContent) {
        scrapedContext = pageContent;
        q = extractProductHint(pageContent) || productNameFromURL(q);
      } else {
        // Scraping failed, fall back to product name extracted from the URL slug
        q = productNameFromURL(q);
        if (!q) return outOfScope();
      }
    }

    // For URL inputs always use the product scorecard path, never route to expert/comparison
    // based on whatever text happened to come out of the scraped page hint.
    const isExpert = !urlInput && isExpertQuestion(q);
    const isComparison = !urlInput && !isExpert && isComparisonQuery(q);

    const systemInstruction = isComparison
      ? COMPARISON_SYSTEM_PROMPT
      : isExpert
        ? EXPERT_ANSWER_SYSTEM_PROMPT
        : CLEAN_SHEET_SYSTEM_PROMPT;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ googleSearch: {} } as any],
      systemInstruction,
      generationConfig: { temperature: 0.2 },
    });

    let prompt: string;
    if (urlInput) {
      // URL flow: tell Gemini to extract product identity from the scraped page
      // and then actively search for the INCI on external sources (IncIDecoder,
      // Open Beauty Facts, Amazon, Nykaa) since e-commerce pages often render
      // ingredient lists via JavaScript that the scraper cannot capture.
      prompt = `The user submitted a product page URL: ${urlInput}

This is a beauty/personal care product page URL. You MUST produce a full scorecard, never return {"type":"out_of_scope"} for a product URL. If you cannot find INCI data, score Full Ingredient Disclosure at 0, note it as unavailable, cap the total score at 50, and complete all other pillars with whatever data you can find.

Below is the scraped content from that page. Use it to identify the product name and brand.
Then, regardless of whether ingredients appear in the scraped content, run your full RESEARCH PROTOCOL:
- Search for the full INCI list on incidecoder.com, openbeautyfacts.org, amazon.in, nykaa.com, and the brand website
- Search for the price and reviews
- Apply the full scoring framework

IMPORTANT: Do not rely solely on the scraped content for ingredients, most e-commerce pages load ingredient lists dynamically via JavaScript and they will be missing from the scrape. Always search externally for the INCI.

Scraped page content (use for product identity only):
${scrapedContext}`;
    } else {
      prompt = isComparison
        ? `Compare these two products: ${q}`
        : isExpert
          ? q
          : `Analyze this product: ${q}`;
    }

    const result = await model.generateContent(prompt);
    const finalText = result.response.text().trim();

    if (!finalText) {
      return outOfScope();
    }

    // Expert answer, plain text response, no JSON parsing needed
    if (isExpert) {
      const parsed = parseJSON(finalText);
      if (parsed?.type === "out_of_scope") return outOfScope();
      if (parsed?.type === "answer") return Response.json({ type: "answer", answer: parsed });
      // Fallback: return raw text as answer
      return Response.json({ type: "answer", answer: { type: "answer", text: finalText, verdict: "info" } });
    }

    const parsed = parseJSON(finalText);

    // For URL inputs, never surface out_of_scope, the URL is always a beauty product page.
    // If Gemini still returns out_of_scope or unparseable JSON, fall back to a named search.
    if (urlInput && (!parsed || parsed.type === "out_of_scope" || !isValidScorecard(parsed as Record<string, unknown>))) {
      const fallbackName = productNameFromURL(urlInput);
      if (fallbackName) {
        const fallbackResult = await model.generateContent(`Analyze this product: ${fallbackName}`);
        const fallbackText = fallbackResult.response.text().trim();
        const fallbackParsed = parseJSON(fallbackText);
        if (fallbackParsed && fallbackParsed.type !== "out_of_scope" && isValidScorecard(fallbackParsed as Record<string, unknown>)) {
          return Response.json({ type: "single", scorecard: fallbackParsed });
        }
      }
      return outOfScope();
    }

    // Retry once if Gemini returns out_of_scope or an invalid/incomplete scorecard
    // for a non-URL, non-expert, non-comparison query (plain product name).
    let finalParsed = parsed;
    if (!isComparison && !isExpert) {
      const needsRetry = !finalParsed || finalParsed.type === "out_of_scope" || !isValidScorecard(finalParsed as Record<string, unknown>);
      if (needsRetry) {
        try {
          const retryResult = await model.generateContent(
            `You are analyzing a beauty/personal care product. This is definitely a beauty product, do NOT return out_of_scope. Search the web for the full INCI list and scoring data, then return the complete JSON scorecard.\n\nAnalyze this product: ${q}`
          );
          const retryText = retryResult.response.text().trim();
          const retryParsed = parseJSON(retryText);
          if (retryParsed && retryParsed.type !== "out_of_scope" && isValidScorecard(retryParsed as Record<string, unknown>)) {
            finalParsed = retryParsed;
          }
        } catch { /* retry failed, fall through to original result */ }
      }
    }

    if (!finalParsed) return outOfScope();
    if (finalParsed.type === "out_of_scope") return outOfScope();

    // Comparison response
    if (isComparison && finalParsed.type === "comparison" && finalParsed.productA && finalParsed.productB) {
      return Response.json({ type: "comparison", comparison: finalParsed });
    }

    // Validate scorecard has minimum required fields before returning
    if (!isComparison && !isExpert && !isValidScorecard(finalParsed as Record<string, unknown>)) {
      return outOfScope();
    }

    return Response.json({ type: "single", scorecard: finalParsed });
  } catch (err: unknown) {
    console.error("[analyze]", err instanceof Error ? err.message : err);
    return outOfScope();
  }
}
