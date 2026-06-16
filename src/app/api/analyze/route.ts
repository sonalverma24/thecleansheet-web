import { GoogleGenerativeAI } from "@google/generative-ai";
import { CLEAN_SHEET_SYSTEM_PROMPT, COMPARISON_SYSTEM_PROMPT, EXPERT_ANSWER_SYSTEM_PROMPT } from "@/lib/scoring-context";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 180;
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
      // Ad tracking
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
      "gclid", "gbraid", "wbraid", "fbclid", "gad_source", "gad_campaignid",
      "msclkid", "ttclid", "li_fat_id", "mc_cid", "mc_eid",
      // E-commerce platform-specific params that don't affect page content
      "ptype", "skuId", "skuid", "pps", "ref", "s", "tag",
      "affid", "aff_id", "affiliate", "offer_id", "network",
      // Nykaa-specific
      "productId", "skuId",
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
    // Strip blob: URLs that waste token budget
    const cleaned = content.replace(/blob:https?:\/\/[^\s)"\]]+/g, "");
    // Return up to 25000 chars — Gemini 2.5 Flash has a 1M context window
    return cleaned.slice(0, 25000);
  } catch {
    return null;
  }
}

async function scrapeShopifyJSON(url: string): Promise<string | null> {
  try {
    // Only applies to Shopify product URLs
    const parsed = new URL(url);
    if (!parsed.pathname.includes("/products/")) return null;
    const jsonUrl = url.split("?")[0].replace(/\/$/, "") + ".json";
    const res = await fetch(jsonUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const product = data?.product;
    if (!product) return null;
    const title: string = product.title ?? "";
    const vendor: string = product.vendor ?? "";
    const price: string = product.variants?.[0]?.price ?? "";
    const bodyHtml: string = product.body_html ?? "";
    const description = bodyHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(); // No truncation — full Shopify product description
    return `[Shopify Product Data]\nBrand: ${vendor}\nTitle: ${title}\nPrice: Rs.${price}\nDescription: ${description}`;
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
// so Gemini can search for the INCI on external sources.
// Jina AI always emits a "Title: ..." line first; use that as the primary signal.
function extractProductHint(content: string): string {
  if (isBlockedPage(content)) return "";
  // Prefer Jina's "Title:" line; it's always the exact page title, cleanest signal
  const titleMatch = content.match(/^Title:\s*(.+)$/m);
  if (titleMatch) return titleMatch[1].trim().slice(0, 300);
  // Fallback: first 5 non-empty lines
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
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

const VALID_PILLAR_NAMES = new Set([
  "Public INCI Safety Screen",
  "Formula Logic Inference",
  "Public Claim Support",
  "Test Result Transparency",
  "Consumer Clarity",
]);

function isValidScorecard(parsed: Record<string, unknown> | null): boolean {
  if (!parsed) return false;
  if (typeof parsed.score !== "number") return false;
  // Score must be an integer 0-100 (not a /10 scale like 9.2)
  if (parsed.score < 0 || parsed.score > 100) return false;
  if (!Number.isInteger(parsed.score)) return false;
  if (typeof parsed.productName !== "string" || parsed.productName.length === 0) return false;
  if (!Array.isArray(parsed.pillars) || (parsed.pillars as unknown[]).length === 0) return false;
  // Validate at least one pillar uses the correct 5-pillar naming
  const pillars = parsed.pillars as Array<{ name?: unknown }>;
  const hasValidPillar = pillars.some(p => typeof p.name === "string" && VALID_PILLAR_NAMES.has(p.name));
  return hasValidPillar;
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

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function generateSlug(brand: string, productName: string): string {
  const b = slugify(brand || 'unknown');
  const p = slugify(productName || 'product');
  return `${b}-${p}`.slice(0, 120);
}

const outOfScope = () => Response.json({ type: "out_of_scope" });
const noDataFound = (productHint?: string) => Response.json({ type: "no_data_found", productHint });

export async function POST(req: Request) {
  // Parse the body before the try block so we can reference rawQuery in the catch
  let rawQuery = "";
  try {
    const body = await req.json();
    rawQuery = (body?.query ?? "").trim();
  } catch {
    return Response.json({ error: "No query provided" }, { status: 400 });
  }
  if (!rawQuery) {
    return Response.json({ error: "No query provided" }, { status: 400 });
  }

  try {
    const query = rawQuery;
    if (!process.env.GOOGLE_AI_API_KEY) {
      return outOfScope();
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    let q = query.trim();
    let scrapedContext = "";

    let urlInput = "";

    // If the query is a URL, scrape the page and build the product context
    let inciDecoderContext = "";

    if (isURL(q)) {
      urlInput = q;

      const slugFromURL = productNameFromURL(q);
      const isEcom = isEcomPlatform(q);
      const brandHint = brandHintFromURL(q);

      // For e-commerce platforms (nykaa, amazon, purplle etc.) the domain name is the
      // MARKETPLACE, not the product brand — don't pollute search queries with "nykaa"
      const searchBrand = isEcom ? "" : brandHint;
      const productQuery = [searchBrand, slugFromURL].filter(Boolean).join(" ").trim() || slugFromURL;
      const enc = encodeURIComponent(productQuery);
      const encReview = encodeURIComponent(productQuery + " review india");

      // Fire all 7 sources in parallel — brand page + Shopify JSON + 5 discovery platforms
      const [
        pageContent,
        shopifyData,
        inciContent,
        nykaaContent,
        amazonContent,
        purplleContent,
        redditContent,
      ] = await Promise.all([
        scrapeURL(q),
        scrapeShopifyJSON(q),
        scrapeURL(`https://incidecoder.com/search?query=${enc}`),
        scrapeURL(`https://www.nykaa.com/search/result/?q=${enc}`),
        scrapeURL(`https://www.amazon.in/s?k=${enc}`),
        scrapeURL(`https://www.purplle.com/search?q=${enc}`),
        scrapeURL(`https://www.reddit.com/search/?q=${encReview}&sort=relevance`),
      ]);

      // Extract product hint from brand page for query refinement
      if (pageContent) {
        const hint = extractProductHint(pageContent);
        if (isEcom || !hint || isNavNoise(hint)) {
          q = slugFromURL || hint || q;
        } else {
          q = hint;
        }
      } else {
        q = slugFromURL;
        if (!q) return outOfScope();
      }

      // Assemble context from all sources — labelled so Gemini knows provenance
      const contextParts: string[] = [];
      if (shopifyData) contextParts.push(shopifyData);
      if (pageContent && !isBlockedPage(pageContent)) {
        contextParts.push(`--- Brand website (PDP) ---\n${pageContent}`);
      }
      if (nykaaContent && !isBlockedPage(nykaaContent)) {
        contextParts.push(`--- Nykaa search results ---\n${nykaaContent.slice(0, 5000)}`);
      }
      if (amazonContent && !isBlockedPage(amazonContent)) {
        contextParts.push(`--- Amazon India search results ---\n${amazonContent.slice(0, 5000)}`);
      }
      if (purplleContent && !isBlockedPage(purplleContent)) {
        contextParts.push(`--- Purplle search results ---\n${purplleContent.slice(0, 5000)}`);
      }
      if (redditContent && !isBlockedPage(redditContent)) {
        contextParts.push(`--- Reddit reviews and discussions ---\n${redditContent.slice(0, 5000)}`);
      }
      scrapedContext = contextParts.join("\n\n");

      if (inciContent && !isBlockedPage(inciContent)) {
        inciDecoderContext = inciContent.slice(0, 5000);
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

    // Check persistent Supabase cache before calling Gemini
    try {
      const db = createAdminClient();
      const { data: cached_db } = await db
        .from('scorecard_cache')
        .select('slug, scorecard, hit_count')
        .eq('cache_key', cacheKey)
        .maybeSingle();
      if (cached_db) {
        // Validate the cached scorecard uses the current 5-pillar format before returning.
        // Old-format entries (e.g. 4-pillar, /10 scoring) are deleted and re-fetched from Gemini.
        const cachedSc = cached_db.scorecard as Record<string, unknown>;
        if (isValidScorecard(cachedSc)) {
          // Update hit count + last_hit_at
          await db.from('scorecard_cache')
            .update({ hit_count: (cached_db as any).hit_count + 1, last_hit_at: new Date().toISOString() })
            .eq('cache_key', cacheKey);
          const body = { type: "single", scorecard: cached_db.scorecard, slug: cached_db.slug };
          RESULT_CACHE.set(cacheKey, body);
          return Response.json(body);
        } else {
          // Stale cache entry - delete it so Gemini re-generates with current format
          await db.from('scorecard_cache').delete().eq('cache_key', cacheKey);
        }
      }
    } catch { /* non-fatal: fall through to Gemini */ }

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
      const brandHintForPrompt = isEcomPlatform(urlInput) ? "" : brandHintFromURL(urlInput);

      const isEcommInput = isEcomPlatform(urlInput);
      const marketplaceName = isEcommInput ? new URL(urlInput).hostname.replace(/^www\./, "") : "";

      prompt = `The user submitted a product page URL: ${urlInput}
Product URL: ${urlInput}
${isEcommInput
  ? `Source: ${marketplaceName} (this is a MARKETPLACE listing, not the brand's own website)
Product name extracted from URL slug: "${q}"
IMPORTANT: Identify the actual product brand from the product name above. For example, "l occitane almond delicious hands" → brand is L'Occitane; "venusia max intensive moisturizing cream" → brand is Venusia (by Win-Medicare). Do NOT use "${marketplaceName}" as the brand name.`
  : `Brand (from domain): ${brandHintForPrompt || "Unknown"}`}

This is a beauty/personal care product page URL. You MUST produce a full scorecard. Never return {"type":"out_of_scope"} for a product URL. If INCI data cannot be found after all searches, score Ingredient Disclosure & Transparency at 0, note it as unavailable, cap the total score at 50, and complete all other pillars with whatever data you can find.

MANDATORY RESEARCH  -  execute ALL of these searches before scoring:
1. Identify product name and brand from the URL slug and scraped content below. ${isEcommInput ? `The brand is NOT "${marketplaceName}" — identify the real manufacturer.` : `Brand hint from domain: ${brandHintForPrompt || "see domain"}.`}
2. Search InciDecoder: "[brand] [product name] site:incidecoder.com" to get the full INCI list. InciDecoder search results are also included below if available.
3. Search brand's own website for ingredients: "[brand] [product name] ingredients"${!isEcommInput ? ` site:${brandDomain}` : ""}
4. Search Nykaa: "[brand] [product name] site:nykaa.com" to get price, rating, review count, and any INCI shown.
5. Search Amazon India: "[brand] [product name] site:amazon.in" to get price, rating, review count, and ingredients if listed.
6. Search Flipkart: "[brand] [product name] site:flipkart.com" for additional price/review data.
7. Search for lab tests and certifications: "[brand] lab test certificate India" OR "[brand] [product name] clinically tested dermatologist tested".${!isEcommInput ? ` Also try site:${brandDomain} lab OR certificate.` : ""}
8. Search for controversies: "[brand] [product name] India controversy banned recall CDSCO"

Use ALL sources found. Combine INCI data across sources: if brand PDP shows partial INCI and InciDecoder shows full INCI, use the fuller list and note the source difference in inciSource.

If the scraped content mentions test reports, certifications, or lab results even partially, treat this as CONFIRMED evidence of published tests  -  do NOT flag as unsubstantiated merely because JavaScript-rendered PDFs are missing from the scrape.
Only assign the "Unsubstantiated Claims" warn badge if the product uses "chemical-free" or "toxin-free" language WITHOUT any certification.

--- Pre-fetched data from multiple sources (brand page, Nykaa, Amazon, Purplle, Reddit) ---
${scrapedContext || "(scraping returned no content; rely entirely on web search)"}

--- InciDecoder search results ---
${inciDecoderContext || "(not pre-fetched; search InciDecoder manually: \"[brand] [product] site:incidecoder.com\")"}

NICHE BRAND NOTE: If this is a small/emerging Indian brand not well indexed on Google, check Purplle.com and Nykaa.com first — they index niche Indian brands comprehensively. Search "[brand] site:purplle.com" and "[brand] site:nykaa.com" before concluding data is unavailable.`;
    } else {
      prompt = isComparison
        ? `Compare these two products: ${q}`
        : isExpert
          ? q
          : `You are analyzing a beauty/personal care product for The Clean Sheet™.

Product: ${q}

MANDATORY RESEARCH  -  execute ALL of these before scoring:
1. Search Google for the product: "[product name]" to find the brand's official product page and open it.
2. Search InciDecoder: "[product name] site:incidecoder.com" to get the full INCI ingredient list.
3. Search Nykaa: "[product name] site:nykaa.com" to get price, rating, review count, and INCI if available.
4. Search Amazon India: "[product name] site:amazon.in" to get price, rating, and reviews.
5. Search Purplle: "[product name] site:purplle.com" — essential for niche Indian brands.
6. Search Flipkart for additional price/review data.
7. Search Reddit: "[brand] [product name] review india" for authentic user experiences.
8. Search for lab tests: "[brand] lab test certificate" and "[brand] clinical study".
9. Search for controversies: "[product name] India banned recalled CDSCO controversy".

Use ALL sources. Combine INCI data across brand page, InciDecoder, and marketplaces. This is definitely a beauty product; produce a complete scorecard JSON. Never return out_of_scope.`;
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
          const body: { type: string; scorecard: unknown; slug?: string } = { type: "single", scorecard: fallbackParsed };
          // Persist to Supabase
          try {
            const sc = fallbackParsed as any;
            const slug = generateSlug(sc.brand ?? '', sc.productName ?? '');
            const db = createAdminClient();
            await db.from('scorecard_cache').upsert({
              cache_key: cacheKey,
              source_url: urlInput || null,
              slug,
              product_name: sc.productName ?? '',
              brand_name: sc.brand ?? '',
              scorecard: sc,
              hit_count: 1,
              created_at: new Date().toISOString(),
              last_hit_at: new Date().toISOString(),
            }, { onConflict: 'cache_key' });
            body.slug = slug;
          } catch { /* non-fatal */ }
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
            const body: { type: string; scorecard: unknown; slug?: string } = { type: "single", scorecard: lastParsed };
            // Persist to Supabase
            try {
              const sc = lastParsed as any;
              const slug = generateSlug(sc.brand ?? '', sc.productName ?? '');
              const db = createAdminClient();
              await db.from('scorecard_cache').upsert({
                cache_key: cacheKey,
                source_url: urlInput || null,
                slug,
                product_name: sc.productName ?? '',
                brand_name: sc.brand ?? '',
                scorecard: sc,
                hit_count: 1,
                created_at: new Date().toISOString(),
                last_hit_at: new Date().toISOString(),
              }, { onConflict: 'cache_key' });
              body.slug = slug;
            } catch { /* non-fatal */ }
            RESULT_CACHE.set(cacheKey, body);
            return Response.json(body);
          }
        } catch { /* fall through */ }
      }
      // All attempts exhausted for a URL input - it's definitely a beauty product
      // but we couldn't get ingredient data. Return no_data_found rather than out_of_scope.
      return noDataFound(fallbackName || productNameFromURL(urlInput));
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

    const body: { type: string; scorecard: unknown; slug?: string } = { type: "single", scorecard: finalParsed };
    // Persist to Supabase
    try {
      const sc = finalParsed as any;
      const slug = generateSlug(sc.brand ?? '', sc.productName ?? '');
      const db = createAdminClient();
      await db.from('scorecard_cache').upsert({
        cache_key: cacheKey,
        source_url: urlInput || null,
        slug,
        product_name: sc.productName ?? '',
        brand_name: sc.brand ?? '',
        scorecard: sc,
        hit_count: 1,
        created_at: new Date().toISOString(),
        last_hit_at: new Date().toISOString(),
      }, { onConflict: 'cache_key' });
      body.slug = slug;
    } catch { /* non-fatal */ }
    RESULT_CACHE.set(cacheKey, body);
    return Response.json(body);
  } catch (err: unknown) {
    console.error("[analyze]", err instanceof Error ? err.message : err);
    // For URL inputs the query is definitely a beauty product page; don't mislead with out_of_scope.
    if (isURL(rawQuery)) {
      return noDataFound(productNameFromURL(rawQuery));
    }
    return outOfScope();
  }
}
