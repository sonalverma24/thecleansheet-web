import { GoogleGenerativeAI } from "@google/generative-ai";
import { PRODUCT_REVIEW_SYSTEM_PROMPT } from "@/lib/product-review-context";

export const maxDuration = 180;
export const dynamic = "force-dynamic";

// ── Helpers shared with /api/analyze ─────────────────────────────────────────

function isURL(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function cleanURL(url: string): string {
  try {
    const u = new URL(url);
    const trackingParams = [
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
      "gclid", "gbraid", "wbraid", "fbclid", "gad_source", "gad_campaignid",
      "msclkid", "ttclid", "li_fat_id", "mc_cid", "mc_eid",
      "ptype", "skuId", "skuid", "pps", "ref", "s", "tag",
      "affid", "aff_id", "affiliate", "offer_id", "network",
      "productId",
    ];
    trackingParams.forEach((p) => u.searchParams.delete(p));
    return u.toString();
  } catch {
    return url;
  }
}

const SHORTLINK_HOSTS = new Set([
  "share.google", "bit.ly", "t.co", "tinyurl.com", "goo.gl",
  "short.io", "ow.ly", "rb.gy", "cutt.ly", "tiny.cc", "is.gd",
]);

async function resolveShortLink(url: string): Promise<string> {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const isShort = [...SHORTLINK_HOSTS].some((h) => host === h || host.endsWith(`.${h}`));
    if (!isShort) return url;
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    return res.url && res.url !== url ? res.url : url;
  } catch {
    return url;
  }
}

async function scrapeURL(url: string): Promise<string | null> {
  try {
    const cleanedUrl = cleanURL(url);
    const jinaUrl = `https://r.jina.ai/${cleanedUrl}`;
    const res = await fetch(jinaUrl, {
      headers: { Accept: "text/plain", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const content = await res.text();
    return content.replace(/blob:https?:\/\/[^\s)"\]]+/g, "").slice(0, 20000);
  } catch {
    return null;
  }
}

async function searchWeb(query: string): Promise<string | null> {
  try {
    const enc = encodeURIComponent(query);
    const res = await fetch(`https://s.jina.ai/${enc}`, {
      headers: { Accept: "text/plain", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return (await res.text()).slice(0, 10000);
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

const ECOM_PLATFORMS = new Set([
  "nykaa.com", "myntra.com", "amazon.in", "flipkart.com", "purplle.com",
  "tatacliq.com", "ajio.com", "meesho.com", "jiomart.com",
]);

function isEcomPlatform(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return ECOM_PLATFORMS.has(host) || [...ECOM_PLATFORMS].some((p) => host.endsWith(`.${p}`));
  } catch {
    return false;
  }
}

function brandHintFromURL(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const name = host.split(".")[0];
    return name.replace(/^(discover|get|shop|try|buy|use|my)/, "").trim();
  } catch {
    return "";
  }
}

const SKIP_URL_SEGMENTS = new Set([
  "collections", "products", "pages", "categories", "category",
  "all", "shop", "store", "product", "items", "listing", "p", "dp",
]);

function isOpaqueID(seg: string): boolean {
  if (/^B[A-Z0-9]{9}$/i.test(seg)) return true;
  if (/^itm[a-z0-9]+$/i.test(seg)) return true;
  if (/^[A-Z0-9]{8,}$/.test(seg) && !seg.includes("-")) return true;
  return false;
}

function productNameFromURL(url: string): string {
  try {
    const cleanUrl = url.split("#")[0];
    const path = new URL(cleanUrl).pathname;
    const segments = path.split("/").filter(Boolean);
    const slug = [...segments].reverse().find(
      (seg) => seg.length > 3
        && !seg.match(/^\d+$/)
        && !SKIP_URL_SEGMENTS.has(seg.toLowerCase())
        && !isOpaqueID(seg)
    ) ?? "";
    return slug.replace(/-/g, " ").trim();
  } catch {
    return "";
  }
}

function parseJSON(text: string): Record<string, unknown> | null {
  try { return JSON.parse(text); } catch { /* fall through */ }
  const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try { return JSON.parse(stripped); } catch { /* fall through */ }
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "{") continue;
    let depth = 0;
    let end = -1;
    for (let j = i; j < text.length; j++) {
      if (text[j] === "{") depth++;
      else if (text[j] === "}") {
        depth--;
        if (depth === 0) { end = j; break; }
      }
    }
    if (end > i) {
      try { return JSON.parse(text.slice(i, end + 1)); } catch { /* keep scanning */ }
    }
  }
  return null;
}

function isValidProductReview(parsed: Record<string, unknown> | null): boolean {
  if (!parsed) return false;
  if (parsed.type !== "product-review") return false;
  if (typeof parsed.productName !== "string" || !parsed.productName) return false;
  if (!Array.isArray(parsed.claimMap)) return false;
  if (!parsed.scores || typeof (parsed.scores as Record<string, unknown>).total !== "number") return false;
  return true;
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
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

  // Handle mixed text+URL input — strip URL if text is also present
  {
    const urlsFound = rawQuery.match(/https?:\/\/\S+/g) ?? [];
    const textOnly = rawQuery.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
    if (urlsFound.length > 0 && textOnly.length > 3) {
      rawQuery = textOnly;
    }
  }

  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      return Response.json({ error: "Service unavailable" }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

    // Resolve short links
    const rawTrimmed = isURL(rawQuery.trim())
      ? await resolveShortLink(rawQuery.trim())
      : rawQuery.trim();

    const q = rawTrimmed;
    let scrapedContext = "";
    let urlInput = "";

    if (isURL(q)) {
      urlInput = q;
      const slugFromURL = productNameFromURL(q);
      const isEcom = isEcomPlatform(q);
      const brandHint = isEcom ? "" : brandHintFromURL(q);
      const productQuery = [brandHint, slugFromURL].filter(Boolean).join(" ").trim() || slugFromURL;
      const enc = encodeURIComponent(productQuery);

      // Scrape brand page + cross-platform price & claim sources in parallel
      const [
        pageContent,
        nykaaContent,
        amazonContent,
        flipkartContent,
        brandWebSearch,
      ] = await Promise.all([
        scrapeURL(q),
        scrapeURL(`https://www.nykaa.com/search/result/?q=${enc}`),
        scrapeURL(`https://www.amazon.in/s?k=${enc}`),
        scrapeURL(`https://www.flipkart.com/search?q=${enc}`),
        isEcom ? Promise.resolve(null) : searchWeb(`${productQuery} ingredients claims`),
      ]);

      const contextParts: string[] = [];
      if (pageContent && !isBlockedPage(pageContent)) {
        const label = isEcom
          ? `--- ${new URL(urlInput).hostname.replace(/^www\./, "")} marketplace listing ---`
          : "--- Brand website (official product page) ---";
        contextParts.push(`${label}\n${pageContent}`);
      }
      if (nykaaContent && !isBlockedPage(nykaaContent)) {
        contextParts.push(`--- Nykaa listing (price, claims, rating) ---\n${nykaaContent.slice(0, 5000)}`);
      }
      if (amazonContent && !isBlockedPage(amazonContent)) {
        contextParts.push(`--- Amazon India listing (title claims, price, rating) ---\n${amazonContent.slice(0, 5000)}`);
      }
      if (flipkartContent && !isBlockedPage(flipkartContent)) {
        contextParts.push(`--- Flipkart listing (price, claims) ---\n${flipkartContent.slice(0, 4000)}`);
      }
      if (brandWebSearch && !isBlockedPage(brandWebSearch)) {
        contextParts.push(`--- Web search (brand page + ingredients) ---\n${brandWebSearch}`);
      }
      scrapedContext = contextParts.join("\n\n");
    } else {
      // Text query — scrape all major Indian platforms in parallel
      const enc = encodeURIComponent(q);

      const [nykaaContent, amazonContent, flipkartContent, brandWebSearch] = await Promise.all([
        scrapeURL(`https://www.nykaa.com/search/result/?q=${enc}`),
        scrapeURL(`https://www.amazon.in/s?k=${enc}`),
        scrapeURL(`https://www.flipkart.com/search?q=${enc}`),
        searchWeb(`${q} ingredients claims official site`),
      ]);

      const contextParts: string[] = [];
      if (nykaaContent && !isBlockedPage(nykaaContent)) {
        contextParts.push(`--- Nykaa listing (price, claims, rating) ---\n${nykaaContent.slice(0, 5000)}`);
      }
      if (amazonContent && !isBlockedPage(amazonContent)) {
        contextParts.push(`--- Amazon India listing (title claims, price, rating) ---\n${amazonContent.slice(0, 5000)}`);
      }
      if (flipkartContent && !isBlockedPage(flipkartContent)) {
        contextParts.push(`--- Flipkart listing (price, claims) ---\n${flipkartContent.slice(0, 4000)}`);
      }
      if (brandWebSearch && !isBlockedPage(brandWebSearch)) {
        contextParts.push(`--- Web search (brand page + ingredients) ---\n${brandWebSearch}`);
      }
      scrapedContext = contextParts.join("\n\n");
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ googleSearch: {} } as any],
      systemInstruction: PRODUCT_REVIEW_SYSTEM_PROMPT,
      generationConfig: { temperature: 0 },
    });

    const prompt = urlInput
      ? `The user submitted a product page URL for a Clean Sheet Product Review.

URL: ${urlInput}
${isEcomPlatform(urlInput) ? `Source: ${new URL(urlInput).hostname.replace(/^www\./, "")} marketplace listing` : `Brand domain: ${brandHintFromURL(urlInput)}`}

TASK: Produce a complete Clean Sheet Product Review JSON. Focus on:
1. Mapping ALL claims — on the brand website, Nykaa, Amazon, and product pack
2. Classifying each claim by type, risk level, and evidence level
3. Checking whether platform claims differ (especially Amazon and Nykaa titles vs. brand website)
4. Price across all Indian platforms
5. Ingredient transparency assessment
6. Formula logic for the product category
7. Consumer suitability

MANDATORY SEARCHES before scoring:
1. Search brand website for full claim list: "${productNameFromURL(urlInput)} site:${isEcomPlatform(urlInput) ? "" : brandHintFromURL(urlInput)}"
2. Search for clinical/test evidence: "${productNameFromURL(urlInput)} clinical study test certificate"
3. Search for ingredient list: "${productNameFromURL(urlInput)} ingredients INCI"
4. Search Nykaa: "${productNameFromURL(urlInput)} site:nykaa.com"
5. Search Amazon: "${productNameFromURL(urlInput)} site:amazon.in"
6. Search Blinkit/Zepto for quick commerce claims: "${productNameFromURL(urlInput)} blinkit OR zepto"

--- Pre-fetched platform data (brand page, Nykaa, Amazon, Flipkart) ---
${scrapedContext || "(scraping returned no content — rely entirely on Google Search)"}

Return ONLY the complete Product Review JSON. Start directly with {`
      : `The user wants a Clean Sheet Product Review for: ${q}

TASK: Produce a complete Clean Sheet Product Review JSON. Focus on:
1. Mapping ALL claims — on the brand website, Nykaa, Amazon, and product pack
2. Classifying each claim by type, risk level, and evidence level
3. Checking whether platform claims differ (Amazon titles vs. brand website vs. Nykaa listing)
4. Price across all Indian platforms
5. Ingredient transparency assessment
6. Formula logic for the product category
7. Consumer suitability

MANDATORY SEARCHES before scoring:
1. Search brand website for full claim list: "${q} official site"
2. Search for clinical/test evidence: "${q} clinical study test certificate"
3. Search for ingredient list: "${q} ingredients"
4. Search Nykaa: "${q} site:nykaa.com"
5. Search Amazon India: "${q} site:amazon.in"
6. Search Blinkit/Zepto for quick commerce claims: "${q} blinkit OR zepto"
7. Search for ASCI complaints if any: "${q} ASCI complaint OR misleading"

--- Pre-fetched platform data (Nykaa, Amazon, Flipkart, web search) ---
${scrapedContext || "(no pre-fetched data — rely entirely on Google Search)"}

Return ONLY the complete Product Review JSON. Start directly with {`;

    let result: Awaited<ReturnType<typeof model.generateContent>>;
    try {
      result = await model.generateContent(prompt);
    } catch (geminiErr: unknown) {
      const msg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
      console.error("[review] Gemini API error:", msg);
      return Response.json({ type: "error", message: "Review service temporarily unavailable. Please try again." }, { status: 503 });
    }

    const finalText = result.response.text().trim();
    if (!finalText) {
      return Response.json({ type: "error", message: "No response generated." }, { status: 500 });
    }

    const parsed = parseJSON(finalText);

    if (!parsed || parsed.type === "out_of_scope") {
      return Response.json({ type: "out_of_scope" });
    }

    if (!isValidProductReview(parsed)) {
      console.error("[review] Invalid product review structure:", JSON.stringify(parsed).slice(0, 500));
      return Response.json({ type: "error", message: "Could not generate a complete product review. Please try again." }, { status: 500 });
    }

    return Response.json({ type: "product-review", review: parsed });
  } catch (err: unknown) {
    console.error("[review]", err instanceof Error ? err.message : err);
    return Response.json({ type: "error", message: "An unexpected error occurred." }, { status: 500 });
  }
}
