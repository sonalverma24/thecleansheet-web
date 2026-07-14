import { CLAIM_CHECK_SYSTEM_PROMPT } from "@/lib/claims-context";
import { generateResilient, TransientModelError, busyResponse } from "@/lib/gemini";
import { computeClaimIntegrity, METHODOLOGY_VERSION } from "@/lib/verdict-engine";
import { rateLimit, rateLimited } from "@/lib/rate-limit";
import type { CheckedClaim, ClaimCheckResult } from "@/lib/types";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

// Module-level cache: same product → same claim sheet within a server process.
const CACHE = new Map<string, ClaimCheckResult>();

const CACHE_VERSION = "v3";

function normalizeCacheKey(input: string): string {
  try {
    const url = new URL(input);
    return `${CACHE_VERSION}:${url.protocol}//${url.host}${url.pathname}`.toLowerCase().replace(/\/+$/, "");
  } catch {
    return `${CACHE_VERSION}:${input.toLowerCase().trim()}`;
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

const IMAGE_URL_BLOCKLIST = /logo|icon|sprite|favicon|banner|payment|whatsapp|instagram|facebook|youtube|twitter|pixel|badge|flag|arrow|star|rating|cart|search|menu|avatar|\.svg|\.gif/i;

// Pull the most likely product image from scraped markdown (![alt](url))
function extractProductImage(markdown: string): string | null {
  const matches = [...markdown.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)\s]+?\.(?:jpe?g|png|webp)[^)\s]*)\)/gi)];
  for (const m of matches) {
    const url = m[1];
    if (!IMAGE_URL_BLOCKLIST.test(url)) return url;
  }
  return null;
}

async function scrapeURL(url: string): Promise<{ text: string; imageUrl: string | null } | null> {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: "text/plain", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const content = await res.text();
    return { text: content.slice(0, 9000), imageUrl: extractProductImage(content) };
  } catch {
    return null;
  }
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

function isValidClaimCheck(parsed: Record<string, unknown> | null): boolean {
  if (!parsed) return false;
  return parsed.type === "claim_check" && Array.isArray(parsed.claims);
}

const VALID_VERDICTS = new Set(["verified", "qualified", "unverified", "not_permitted"]);
const VALID_LEVELS = new Set(["A", "B", "C", "D", "none"]);

// Sanitise LLM output field-by-field — never trust shape blindly
function sanitiseClaims(raw: unknown[]): CheckedClaim[] {
  return raw
    .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
    .filter((c) => typeof c.claim === "string" && (c.claim as string).trim().length > 0)
    .map((c) => ({
      claim: String(c.claim).slice(0, 300),
      category: (["efficacy", "safety", "concentration", "origin", "sun_protection", "regulated", "superlative"].includes(String(c.category))
        ? c.category : "efficacy") as CheckedClaim["category"],
      verdict: (VALID_VERDICTS.has(String(c.verdict)) ? c.verdict : "unverified") as CheckedClaim["verdict"],
      evidenceLevel: (VALID_LEVELS.has(String(c.evidenceLevel)) ? c.evidenceLevel : "D") as CheckedClaim["evidenceLevel"],
      requiredLevel: (VALID_LEVELS.has(String(c.requiredLevel)) ? c.requiredLevel : "B") as CheckedClaim["requiredLevel"],
      evidence: typeof c.evidence === "string" ? c.evidence : "No public evidence found",
      source: typeof c.source === "string" ? c.source : "none",
      explanation: typeof c.explanation === "string" ? c.explanation : "",
      regulatoryNote: typeof c.regulatoryNote === "string" ? c.regulatoryNote : "",
    }));
}

const outOfScope = () => Response.json({ type: "out_of_scope" });

export async function POST(req: Request) {
  try {
    if (!rateLimit(req, "claim-check", 8)) return rateLimited();

    const { query } = await req.json();
    if (!query?.trim()) {
      return Response.json({ error: "No query provided" }, { status: 400 });
    }

    const q: string = query.trim();
    const cacheKey = normalizeCacheKey(q);
    const cached = CACHE.get(cacheKey);
    if (cached) return Response.json(cached);

    let prompt: string;
    let scrapedImage: string | null = null;
    if (isURL(q)) {
      const scraped = await scrapeURL(q);
      scrapedImage = scraped?.imageUrl ?? null;
      prompt = `Run a full Claim Check on the product at this URL: ${q}

${scraped
  ? `Scraped page content below (partial — JavaScript-rendered sections may be missing; search the web to complete the claim list and find evidence):\n\n${scraped.text}`
  : `The page could not be scraped. Identify the product from the URL, then search the web for its official page and marketplace listings to extract its marketing claims.`}`;
    } else {
      prompt = `Run a full Claim Check on this product: ${q}

Search for its official product page and marketplace listings (Nykaa, Amazon.in, Flipkart, brand site), extract every marketing claim, then grade each claim against public evidence.`;
    }

    let parsed = parseJSON(await generateResilient(CLAIM_CHECK_SYSTEM_PROMPT, prompt));

    // One retry for malformed output
    if (!isValidClaimCheck(parsed) && parsed?.type !== "out_of_scope") {
      parsed = parseJSON(await generateResilient(
        CLAIM_CHECK_SYSTEM_PROMPT,
        `${prompt}\n\nReturn ONLY the claim_check JSON structure. Start directly with {`,
      ));
    }

    if (parsed?.type === "out_of_scope") return outOfScope();
    if (!isValidClaimCheck(parsed)) return outOfScope();

    // Deterministic layer: code computes the score, applies the prohibited-claim safety net
    const sanitised = sanitiseClaims(parsed.claims as unknown[]);
    const { claims, integrityScore, integrityLabel, verdictCounts } = computeClaimIntegrity(sanitised);

    const result: ClaimCheckResult = {
      type: "claim_check",
      productName: typeof parsed.productName === "string" ? parsed.productName : q,
      brand: typeof parsed.brand === "string" ? parsed.brand : "",
      sourceUrl: typeof parsed.sourceUrl === "string" ? parsed.sourceUrl : (isURL(q) ? q : ""),
      productFound: parsed.productFound !== false,
      claims,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      redFlags: Array.isArray(parsed.redFlags) ? (parsed.redFlags as unknown[]).filter((r): r is string => typeof r === "string") : [],
      chatOpener: typeof parsed.chatOpener === "string" ? parsed.chatOpener : "",
      integrityScore,
      integrityLabel,
      verdictCounts,
      methodologyVersion: METHODOLOGY_VERSION,
      checkedAt: new Date().toISOString(),
      imageUrl: scrapedImage,
    };

    CACHE.set(cacheKey, result);
    return Response.json(result);
  } catch (err: unknown) {
    console.error("[claim-check]", err instanceof Error ? err.message : err);
    if (err instanceof TransientModelError) return busyResponse();
    return Response.json({ error: "Claim check failed. Please try again." }, { status: 500 });
  }
}
