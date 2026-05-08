import { GoogleGenerativeAI } from "@google/generative-ai";
import { CLEAN_SHEET_SYSTEM_PROMPT, COMPARISON_SYSTEM_PROMPT, EXPERT_ANSWER_SYSTEM_PROMPT } from "@/lib/scoring-context";

export const maxDuration = 120;

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
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    const content = await res.text();
    // Return first ~6000 chars to stay within token limits
    return content.slice(0, 6000);
  } catch {
    return null;
  }
}

// Try to extract a usable product name + brand from scraped content
// so Gemini can search for the INCI on external sources
function extractProductHint(content: string): string {
  // Grab the first non-empty lines — usually title + brand on product pages
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  // Take up to first 5 meaningful lines (skip very short ones)
  const hint = lines.filter((l) => l.length > 5).slice(0, 5).join(" | ");
  return hint.slice(0, 300);
}

// Extract a human-readable product name from the URL slug.
// Handles Shopify /collections/.../products/slug and similar patterns.
function productNameFromURL(url: string): string {
  try {
    const path = new URL(url).pathname;
    const segments = path.split("/").filter(Boolean);

    // Prefer the segment immediately after /products/, /product/, or /p/
    const productIdx = segments.findIndex((s) => s === "products" || s === "product" || s === "p");
    if (productIdx !== -1 && segments[productIdx + 1] && !segments[productIdx + 1].match(/^\d+$/)) {
      return segments[productIdx + 1].replace(/-/g, " ").trim();
    }

    // Fallback: last non-numeric, non-empty segment of any length
    const slug = [...segments].reverse().find((s) => s.length >= 2 && !s.match(/^\d+$/)) ?? "";
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

// Queries that are questions about ingredients, safety, skin concerns — not a specific product to score
function isExpertQuestion(query: string): boolean {
  const q = query.toLowerCase().trim();
  const questionStarters = ["is ", "are ", "does ", "do ", "can ", "should ", "what is ", "what are ", "why is ", "why are ", "how does ", "how do ", "how safe ", "is it safe", "tell me about", "explain", "which is better", "which is safer", "which works"];
  const hasQuestionMark = q.includes("?");
  const startsLikeQuestion = questionStarters.some((s) => q.startsWith(s));
  // Has no brand/product signals (no title-case multi-word, no % signs for serums, no brand-style formatting)
  const looksLikeProduct = /\d+%/.test(q) || q.split(" ").filter((w) => /^[A-Z]/.test(w)).length >= 2;
  // If the query starts with a question word (is/are/does/etc.), treat as expert even if it
  // also matches a comparison pattern — "is keratin better or smoothening" is a general
  // haircare question, not a branded product comparison.
  if (startsLikeQuestion && !looksLikeProduct) return true;
  return hasQuestionMark && !looksLikeProduct && !isComparisonQuery(query);
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
        q = extractProductHint(pageContent) || productNameFromURL(q) || urlInput;
      } else {
        // Scraping failed — fall back to slug extraction; URL itself is passed as context
        q = productNameFromURL(q) || urlInput;
      }
    }

    // For URL inputs always use the product scorecard path — never route to expert/comparison
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
      // (or from the URL itself when scraping failed) and actively search for
      // the INCI on external sources since e-commerce pages often render
      // ingredient lists via JavaScript that the scraper cannot capture.
      const scrapedSection = scrapedContext
        ? `Below is the scraped content from that page. Use it to identify the product name and brand.\n\nScraped page content (use for product identity only):\n${scrapedContext}`
        : `The page could not be scraped (JavaScript-rendered or blocked). Use the URL and any product name you can infer from it to identify the product, then search externally.`;

      prompt = `The user submitted a product page URL: ${urlInput}

This is a beauty/personal care product page URL. You MUST produce a full scorecard — never return {"type":"out_of_scope"} for a product URL. If you cannot find INCI data, score Full Ingredient Disclosure at 0, note it as unavailable, cap the total score at 50, and complete all other pillars with whatever data you can find.

${scrapedSection}

Regardless of whether ingredients appear in the scraped content, run your full RESEARCH PROTOCOL:
- Visit the brand's own website by searching for "${q} ingredients site:${new URL(urlInput).hostname}"
- Search for the full INCI list on incidecoder.com, openbeautyfacts.org, amazon.in, nykaa.com
- Search for the price and reviews
- Apply the full scoring framework

IMPORTANT: Do not rely solely on the scraped content for ingredients — most e-commerce pages load ingredient lists dynamically via JavaScript and they will be missing from the scrape. Always search externally for the INCI.`;
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

    // Expert answer — plain text response, no JSON parsing needed
    if (isExpert) {
      const parsed = parseJSON(finalText);
      if (parsed?.type === "out_of_scope") return outOfScope();
      if (parsed?.type === "answer") return Response.json({ type: "answer", answer: parsed });
      // Fallback: return raw text as answer
      return Response.json({ type: "answer", answer: { type: "answer", text: finalText, verdict: "info" } });
    }

    const parsed = parseJSON(finalText);

    // For URL inputs, never surface out_of_scope — the URL is always a beauty product page.
    // If Gemini still returns out_of_scope or unparseable JSON, retry with a direct brand-site search.
    if (urlInput && (!parsed || parsed.type === "out_of_scope")) {
      const fallbackName = productNameFromURL(urlInput);
      const hostname = (() => { try { return new URL(urlInput).hostname; } catch { return ""; } })();
      const fallbackPrompt = fallbackName
        ? `Search for "${fallbackName}" by ${hostname} and analyze this beauty product. Produce a full scorecard.`
        : `Search the web for the beauty product at ${urlInput} and produce a full ingredient scorecard.`;
      const fallbackResult = await model.generateContent(fallbackPrompt);
      const fallbackText = fallbackResult.response.text().trim();
      const fallbackParsed = parseJSON(fallbackText);
      if (fallbackParsed && fallbackParsed.type !== "out_of_scope") {
        return Response.json({ type: "single", scorecard: fallbackParsed });
      }
      return Response.json({ type: "url_fetch_failed" });
    }

    if (!parsed) return outOfScope();
    if (parsed.type === "out_of_scope") return outOfScope();

    // Comparison response
    if (isComparison && parsed.type === "comparison" && parsed.productA && parsed.productB) {
      return Response.json({ type: "comparison", comparison: parsed });
    }

    // Single product response (existing behaviour unchanged)
    return Response.json({ type: "single", scorecard: parsed });
  } catch (err: unknown) {
    console.error("[analyze]", err instanceof Error ? err.message : err);
    return outOfScope();
  }
}
