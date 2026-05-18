import { GoogleGenerativeAI } from "@google/generative-ai";
import { CLEAN_SHEET_SYSTEM_PROMPT, COMPARISON_SYSTEM_PROMPT, EXPERT_ANSWER_SYSTEM_PROMPT } from "@/lib/scoring-context";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

// Module-level result cache, persists across requests within the same server process.
// Keyed by normalized query string so the same product always returns the same scorecard.
const RESULT_CACHE = new Map<string, object>();

function normalizeCacheKey(input: string): string {
  try {
    // For URLs: strip fragment + trailing slashes, lowercase
    const url = new URL(input);
    return `${url.protocol}//${url.host}${url.pathname}`.toLowerCase().replace(/\/+$/, "");
  } catch {
    return input.toLowerCase().trim();
  }
}

function isURL(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Strip UTM / ad-tracking params from e-commerce URLs so scrapers see the canonical page
function cleanURL(url: string): string {
  try {
    const u = new URL(url);
    const trackingParams = [
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
      "gclid", "gbraid", "wbraid", "fbclid", "gad_source", "gad_campaignid",
      "msclkid", "ttclid", "li_fat_id", "mc_cid", "mc_eid",
    ];
    trackingParams.forEach((p) => u.searchParams.delete(p));
    return u.toString();
  } catch {
    return url;
  }
}

// Known Indian/global e-commerce platforms where the URL slug IS the product name
const ECOM_PLATFORMS = new Set([
  "nykaa.com", "myntra.com", "amazon.in", "flipkart.com", "purplle.com",
  "tatacliq.com", "ajio.com", "bewakoof.com", "meesho.com", "jiomart.com",
]);

function isEcomPlatform(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return ECOM_PLATFORMS.has(host) || [...ECOM_PLATFORMS].some((p) => host.endsWith(`.${p}`));
  } catch {
    return false;
  }
}

async function scrapeURL(url: string): Promise<string | null> {
  try {
    const cleanedUrl = cleanURL(url);
    const jinaUrl = `https://r.jina.ai/${cleanedUrl}`;
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
  "javascript required", "javascript is required", "javascript is disabled",
  "please enable js", "this page requires javascript",
  "sign in to continue", "login to continue", "please log in",
];

// Navigation-noise signals: if first lines look like site nav rather than product content
const NAV_NOISE_SIGNALS = [
  "log in", "sign up", "register", "cart", "wishlist", "offers", "beauty",
  "fashion", "wellness", "electronics", "all categories", "my orders",
  "track order", "help center", "contact us", "download app",
];

function isBlockedPage(content: string): boolean {
  const lower = content.toLowerCase().slice(0, 1000);
  return BOT_BLOCK_SIGNALS.some((signal) => lower.includes(signal));
}

// Returns true if the scraped content looks like site navigation rather than product info
function isNavNoise(hint: string): boolean {
  if (!hint) return true;
  const lower = hint.toLowerCase();
  const noiseCount = NAV_NOISE_SIGNALS.filter((s) => lower.includes(s)).length;
  return noiseCount >= 2; // 2+ nav signals = likely nav page, not product
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

// Extract a rough brand hint from the domain (e.g. "discoverpilgrim.com" → "pilgrim",
// "codeskin.in" → "codeskin", "mamaearth.in" → "mamaearth")
function brandHintFromURL(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const name = host.split(".")[0]; // "discoverpilgrim", "codeskin", etc.
    // Strip common prefixes like "discover", "get", "shop", "try", "buy"
    return name.replace(/^(discover|get|shop|try|buy|use|my)/, "").trim();
  } catch {
    return "";
  }
}

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
  // route to scorecard not expert, e.g. "is ponds moisturiser good for oily skin"
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

  // Has title-case multi-word or % signals, original product detector
  const looksLikeProduct = /\d+%/.test(q)
    || q.split(" ").filter((w) => /^[A-Z]/.test(w)).length >= 2
    || containsProductType
    || containsBrand;

  // "is [ingredient] safe?" type questions, pure ingredient queries → expert
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

      // For known e-commerce platforms, the URL slug is always a reliable product name.
      // Prefer it over scraped content (which is often nav noise on JS-heavy apps).
      const slugFromURL = productNameFromURL(q);
      const isEcom = isEcomPlatform(q);

      const pageContent = await scrapeURL(q);
      if (pageContent) {
        scrapedContext = pageContent;
        const hint = extractProductHint(pageContent);
        // Use scraped hint only if it looks like real product content (not nav noise)
        // For e-com platforms: trust the URL slug, it's always SEO-accurate
        if (isEcom || !hint || isNavNoise(hint)) {
          q = slugFromURL || hint || q;
        } else {
          q = hint;
        }
      } else {
        // Scraping failed, fall back to product name extracted from the URL slug
        q = slugFromURL;
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

    // Check cache before calling Gemini, same product always returns the same scorecard
    const cacheKey = normalizeCacheKey(urlInput || q);
    const cached = RESULT_CACHE.get(cacheKey);
    if (cached) {
      return Response.json(cached);
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ googleSearch: {} } as any],
      systemInstruction,
      generationConfig: { temperature: 0 },
    });

    let prompt: string;
    if (urlInput) {
      // Extract brand domain for targeted test search
      let brandDomain = "";
      try { brandDomain = new URL(urlInput).hostname; } catch { /* ignore */ }

      prompt = `The user submitted a product page URL: ${urlInput}

This is a beauty/personal care product page URL. You MUST produce a full scorecard, never return {"type":"out_of_scope"} for a product URL. If you cannot find INCI data, score Full Ingredient Disclosure at 0, note it as unavailable, cap the total score at 50, and complete all other pillars with whatever data you can find.

Below is scraped content from that page. E-commerce pages render most content (ingredients, test certificates, lab PDFs) via JavaScript which the scraper CANNOT capture. Treat the scraped content as a partial snapshot only.

RESEARCH PROTOCOL for this URL:
1. Use scraped content to identify product name and brand.
2. Search externally for the full INCI: incidecoder.com, openbeautyfacts.org, amazon.in, nykaa.com, brand website.
3. Search for price and reviews.
4. CRITICAL, search for lab tests and certifications directly on the brand website: site:${brandDomain} lab OR test OR certificate OR study OR "clinically tested" OR "dermatologist tested". Also search "[brand name] lab test certificate" and "[brand name] clinical study". The brand may have a dedicated tests/certifications page. If the scraped content mentions test reports, certifications, or lab results even partially, treat this as CONFIRMED evidence of published tests and award full transparency marks, do NOT flag as unsubstantiated.
5. Only assign the "Unsubstantiated Claims" warn badge if the product uses "chemical-free" or "toxin-free" language WITHOUT any certification or proof. Do NOT assign this badge merely because the scraper could not capture JavaScript-rendered test PDFs.

Scraped page content (partial, JavaScript-rendered sections will be missing):
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
      // For e-com platforms the domain (nykaa.com) is useless as brand, skip it
      const fallbackBrand = isEcomPlatform(urlInput) ? "" : brandHintFromURL(urlInput);
      const fallbackQuery = [fallbackBrand, fallbackName].filter(Boolean).join(" ").trim();
      if (fallbackQuery) {
        const fallbackResult = await model.generateContent(
          `Analyze this beauty/cosmetic product for The Clean Sheet™ scorecard. This is definitely a beauty/personal care product, do NOT return out_of_scope. Search the web for the full INCI ingredient list, price in India, and reviews, then produce the complete JSON scorecard.\n\nProduct: ${fallbackQuery}`
        );
        const fallbackText = fallbackResult.response.text().trim();
        const fallbackParsed = parseJSON(fallbackText);
        if (fallbackParsed && fallbackParsed.type !== "out_of_scope" && isValidScorecard(fallbackParsed as Record<string, unknown>)) {
          const body = { type: "single", scorecard: fallbackParsed };
          RESULT_CACHE.set(cacheKey, body);
          return Response.json(body);
        }
      }
      // Last-resort retry: use the full product name from URL slug with explicit instruction
      if (fallbackName) {
        try {
          const lastResort = await model.generateContent(
            `You are The Clean Sheet™ product analyzer. Analyze this skincare/beauty product and return a complete scorecard JSON. Product name extracted from URL: "${fallbackName}". Search the web for ingredients, price, and reviews. This is a beauty product, always return a scorecard, never out_of_scope.`
          );
          const lastText = lastResort.response.text().trim();
          const lastParsed = parseJSON(lastText);
          if (lastParsed && lastParsed.type !== "out_of_scope" && isValidScorecard(lastParsed as Record<string, unknown>)) {
            const body = { type: "single", scorecard: lastParsed };
            RESULT_CACHE.set(cacheKey, body);
            return Response.json(body);
          }
        } catch { /* fall through */ }
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
      const body = { type: "comparison", comparison: finalParsed };
      RESULT_CACHE.set(cacheKey, body);
      return Response.json(body);
    }

    // Validate scorecard has minimum required fields before returning
    if (!isComparison && !isExpert && !isValidScorecard(finalParsed as Record<string, unknown>)) {
      return outOfScope();
    }

    const body = { type: "single", scorecard: finalParsed };
    RESULT_CACHE.set(cacheKey, body);
    return Response.json(body);
  } catch (err: unknown) {
    console.error("[analyze]", err instanceof Error ? err.message : err);
    return outOfScope();
  }
}
