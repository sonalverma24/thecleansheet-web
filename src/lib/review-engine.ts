/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ — Review Engine (the ONE pipeline)
   Every query takes exactly one route:

     classify → [claim check] → [deep scan] → verdict (in code)

   Classification, research, scoring, and caching all live here —
   never in the client, never duplicated across routes.
   The full result is cached as ONE unit, so the same query always
   returns the same review within a server session.

   The rating mechanism is defined in src/lib/verdict-engine.ts and
   documented in STANDARD.md at the repo root.
──────────────────────────────────────────────────────────────── */

import { CLAIM_CHECK_SYSTEM_PROMPT } from "@/lib/claims-context";
import { CLEAN_SHEET_SYSTEM_PROMPT, COMPARISON_SYSTEM_PROMPT, EXPERT_ANSWER_SYSTEM_PROMPT } from "@/lib/scoring-context";
import { generateResilient } from "@/lib/gemini";
import { validateScorecard, computeVerdict, computeClaimIntegrity, METHODOLOGY_VERSION } from "@/lib/verdict-engine";
import { upsertVerifiedProduct, slugify } from "@/lib/verified-store";
import { resolveProductImage, imageFromMarkdown, searchProductImage } from "@/lib/product-image";
import type {
  CheckedClaim, ClaimCheckResult, Scorecard, ComparisonResult, ExpertAnswer, FinalVerdict,
} from "@/lib/types";

/* ═══════════════ Result shape ═══════════════ */

export type ReviewResult =
  | {
      kind: "product";
      claimCheck: ClaimCheckResult | null;
      claimLayerDown: boolean;
      scorecard: Scorecard | null;
      verdict: FinalVerdict | null;
    }
  | { kind: "comparison"; comparison: ComparisonResult }
  | { kind: "answer"; answer: ExpertAnswer }
  | { kind: "out_of_scope" };

/* ═══════════════ One cache, one key, full results only ═══════════════ */

const CACHE_VERSION = "v5"; // v5: unified single-pipeline engine
const REVIEW_CACHE = new Map<string, ReviewResult>();

function cacheKey(input: string): string {
  try {
    const url = new URL(input);
    return `${CACHE_VERSION}:${url.protocol}//${url.host}${url.pathname}`.toLowerCase().replace(/\/+$/, "");
  } catch {
    return `${CACHE_VERSION}:${input.toLowerCase().trim().replace(/\s+/g, " ")}`;
  }
}

/* ═══════════════ Classification — decided ONCE, on the server ═══════════════ */

export type QueryKind = "url" | "comparison" | "question" | "product";

export function classifyQuery(q: string): QueryKind {
  if (isURL(q)) return "url";
  if (isComparisonQuery(q)) return "comparison";
  if (isExpertQuestion(q)) return "question";
  return "product";
}

function isURL(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/* A bare INCI paste (an ingredient list on its own) identifies no product - only
   its formula, with no brand or product name - so its review is never registered
   in the directory. Heuristic: not a URL, and five or more comma / newline /
   semicolon-separated tokens; a typed product name has none. */
function looksLikeInciList(text: string): boolean {
  if (isURL(text)) return false;
  const parts = text.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
  return parts.length >= 5;
}

function isComparisonQuery(query: string): boolean {
  const q = query.toLowerCase();
  if (q.includes(" vs ") || q.includes(" versus ") || q.includes("compare")) return true;
  if (q.includes("better than") || q.includes("which is better") || q.includes("which one is")) return true;
  if (/better.{1,80}\bor\b/i.test(query) || /\bor\b.{1,80}better/i.test(query)) return true;
  return false;
}

// Questions about ingredients/safety/concerns — not a specific product to score
function isExpertQuestion(query: string): boolean {
  const q = query.toLowerCase().trim();
  const questionStarters = ["is ", "are ", "does ", "do ", "can ", "should ", "what is ", "what are ", "why is ", "why are ", "how does ", "how do ", "how safe ", "is it safe", "tell me about", "explain", "which is better", "which is safer", "which works"];
  const hasQuestionMark = q.includes("?");
  const startsLikeQuestion = questionStarters.some((s) => q.startsWith(s));

  const productTypeWords = [
    "moisturiser", "moisturizer", "serum", "sunscreen", "spf", "face wash", "cleanser",
    "toner", "cream", "lotion", "gel", "oil", "mask", "sheet mask", "eye cream",
    "lip balm", "shampoo", "conditioner", "body wash", "scrub", "exfoliant",
    "primer", "foundation", "bb cream", "cc cream", "micellar", "mist", "essence",
    "ampoule", "retinol", "vitamin c", "niacinamide", "aha", "bha", "face cream",
  ];
  const containsProductType = productTypeWords.some((w) => q.includes(w));

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

  const looksLikeProduct = /\d+%/.test(q)
    || q.split(" ").filter((w) => /^[A-Z]/.test(w)).length >= 2
    || containsProductType
    || containsBrand;

  if (startsLikeQuestion && !looksLikeProduct) return true;
  return hasQuestionMark && !looksLikeProduct && !isComparisonQuery(query);
}

/* ═══════════════ Shared research helpers ═══════════════ */

async function scrapeURL(url: string, limit: number): Promise<string | null> {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: "text/plain", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return (await res.text()).slice(0, limit);
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

function extractProductHint(content: string): string {
  if (isBlockedPage(content)) return "";
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.filter((l) => l.length > 5).slice(0, 5).join(" | ").slice(0, 300);
}

const SKIP_URL_SEGMENTS = new Set([
  "collections", "products", "pages", "categories", "category",
  "all", "shop", "store", "product", "items", "listing", "p", "dp",
]);

function brandHintFromURL(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.split(".")[0].replace(/^(discover|get|shop|try|buy|use|my)/, "").trim();
  } catch {
    return "";
  }
}

function productNameFromURL(url: string): string {
  try {
    const path = new URL(url.split("#")[0]).pathname;
    const segments = path.split("/").filter(Boolean);
    const slug = [...segments].reverse().find(
      (seg) => seg.length > 3 && !seg.match(/^\d+$/) && !SKIP_URL_SEGMENTS.has(seg.toLowerCase())
    ) ?? "";
    return slug.replace(/-/g, " ").trim();
  } catch {
    return "";
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

/* ═══════════════ Layer 1 — Claim Check ═══════════════ */

const VALID_VERDICTS = new Set(["verified", "qualified", "unverified", "not_permitted"]);
const VALID_LEVELS = new Set(["A", "B", "C", "D", "none"]);

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

function isValidClaimCheck(parsed: Record<string, unknown> | null): boolean {
  if (!parsed) return false;
  return parsed.type === "claim_check" && Array.isArray(parsed.claims);
}

/** Runs Layer 1. Returns null when the product genuinely has no claim sheet (out of scope). Throws TransientModelError when the layer is unavailable. */
export async function runClaimCheck(query: string): Promise<ClaimCheckResult | null> {
  const q = query.trim();
  let prompt: string;
  let scrapedImage: string | null = null;

  if (isURL(q)) {
    const [directImage, pageText] = await Promise.all([resolveProductImage(q), scrapeURL(q, 9000)]);
    scrapedImage = directImage ?? (pageText ? imageFromMarkdown(pageText) : null);
    prompt = `Run a full Claim Check on the product at this URL: ${q}

${pageText
  ? `Scraped page content below (partial — JavaScript-rendered sections may be missing; search the web to complete the claim list and find evidence):\n\n${pageText}`
  : `The page could not be scraped. Identify the product from the URL, then search the web for its official page and marketplace listings to extract its marketing claims.`}`;
  } else {
    prompt = `Run a full Claim Check on this product: ${q}

Search for its official product page and marketplace listings (Nykaa, Amazon.in, Flipkart, brand site), extract every marketing claim, then grade each claim against public evidence.`;
  }

  let parsed = parseJSON(await generateResilient(CLAIM_CHECK_SYSTEM_PROMPT, prompt));
  if (!isValidClaimCheck(parsed) && parsed?.type !== "out_of_scope") {
    parsed = parseJSON(await generateResilient(
      CLAIM_CHECK_SYSTEM_PROMPT,
      `${prompt}\n\nReturn ONLY the claim_check JSON structure. Start directly with {`,
    ));
  }
  if (parsed?.type === "out_of_scope" || !isValidClaimCheck(parsed)) return null;

  if (!scrapedImage && typeof parsed.sourceUrl === "string" && /^https?:\/\//.test(parsed.sourceUrl)) {
    scrapedImage = await resolveProductImage(parsed.sourceUrl);
  }
  if (!scrapedImage) {
    const imgQuery = [parsed.brand, parsed.productName].filter((s) => typeof s === "string" && s).join(" ");
    scrapedImage = await searchProductImage(imgQuery || q);
  }

  const sanitised = sanitiseClaims(parsed.claims as unknown[]);
  const { claims, integrityScore, integrityLabel, verdictCounts } = computeClaimIntegrity(sanitised);

  return {
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
}

/* ═══════════════ Layer 2 — Deep scan / comparison / expert answer ═══════════════ */

export function compactClaimFindings(cf: ClaimCheckResult | null | undefined) {
  if (!cf || cf.type !== "claim_check" || !Array.isArray(cf.claims)) return null;
  return {
    claims: cf.claims,
    verdictCounts: cf.verdictCounts,
    integrityScore: cf.integrityScore,
    imageUrl: typeof cf.imageUrl === "string" ? cf.imageUrl : null,
  };
}

type Compact = ReturnType<typeof compactClaimFindings>;

function isValidScorecard(parsed: Record<string, unknown> | null): boolean {
  if (!parsed) return false;
  return (
    typeof parsed.score === "number" &&
    typeof parsed.productName === "string" && (parsed.productName as string).length > 0 &&
    Array.isArray(parsed.pillars) && (parsed.pillars as unknown[]).length > 0
  );
}

function claimFindingsBlock(cf: Compact): string {
  if (!cf) return "";
  return `

CLAIM CHECK FINDINGS (already adjudicated by The Clean Sheet™ Claim Check engine — treat these verdicts as final; use them for the Regulatory Compliance and Transparency Practices pillars and for badge assignment; do not re-litigate them):
${JSON.stringify(cf.claims.map((c) => ({ claim: c.claim, verdict: c.verdict, evidenceLevel: c.evidenceLevel, explanation: c.explanation })))}`;
}

async function registerIfVerified(card: Scorecard, verdict: FinalVerdict, cf: Compact, identified: boolean) {
  try {
    if (verdict.status !== "verified" || !card.productName || !identified) return;
    await upsertVerifiedProduct({
      slug: slugify(card.productName, card.brand || ""),
      productName: card.productName,
      brand: card.brand || "",
      score: card.score,
      scoreLabel: card.scoreLabel,
      integrityScore: cf?.integrityScore ?? null,
      imageUrl: cf?.imageUrl ?? null,
      summary: card.summary || "",
      usageGuidance: card.usageGuidance ?? null,
      verifiedAt: new Date().toISOString(),
      methodologyVersion: METHODOLOGY_VERSION,
    });
  } catch { /* registry failure must never break a review */ }
}

export type DeepScanResult =
  | { type: "single"; scorecard: Scorecard; verdict: FinalVerdict }
  | { type: "comparison"; comparison: ComparisonResult }
  | { type: "answer"; answer: ExpertAnswer }
  | { type: "out_of_scope" };

/** Runs Layer 2 (or comparison/expert path). Throws TransientModelError when the model is unavailable. */
export async function runDeepScan(query: string, claimFindings: Compact): Promise<DeepScanResult> {
  let q = query.trim();
  let scrapedContext = "";
  let urlInput = "";

  if (isURL(q)) {
    urlInput = q;
    const pageContent = await scrapeURL(q, 6000);
    if (pageContent) {
      scrapedContext = pageContent;
      q = extractProductHint(pageContent) || productNameFromURL(q);
    } else {
      q = productNameFromURL(q);
      if (!q) return { type: "out_of_scope" };
    }
  }

  const kind = classifyQuery(urlInput || q);
  const isExpert = !urlInput && kind === "question";
  const isComparison = !urlInput && !isExpert && kind === "comparison";

  const systemInstruction = isComparison
    ? COMPARISON_SYSTEM_PROMPT
    : isExpert
      ? EXPERT_ANSWER_SYSTEM_PROMPT
      : CLEAN_SHEET_SYSTEM_PROMPT;

  let prompt: string;
  if (urlInput) {
    let brandDomain = "";
    try { brandDomain = new URL(urlInput).hostname; } catch { /* ignore */ }
    prompt = `The user submitted a product page URL: ${urlInput}

This is a beauty/personal care product page URL. You MUST produce a full scorecard, never return {"type":"out_of_scope"} for a product URL. If you cannot find INCI data, score Full Ingredient Disclosure at 0, note it as unavailable, cap the total score at 50, and complete all other pillars with whatever data you can find.

Below is scraped content from that page. E-commerce pages render most content (ingredients, test certificates, lab PDFs) via JavaScript which the scraper CANNOT capture. Treat the scraped content as a partial snapshot only.

RESEARCH PROTOCOL for this URL:
1. Use scraped content to identify product name and brand.
2. Search externally for the full INCI: incidecoder.com, openbeautyfacts.org, amazon.in, nykaa.com, brand website.
3. Search for price and reviews.
4. Search for lab tests and certifications directly on the brand website: site:${brandDomain} lab OR test OR certificate OR study. Also search "[brand name] lab test certificate" and "[brand name] clinical study". Award transparency marks only for evidence you actually locate (a study, certificate, registry entry, or published data). A marketing mention of "tested" is a claim, not evidence — do not treat it as confirmation.
5. If the scraper missed JavaScript-rendered content, note data gaps honestly in pillar notes rather than assuming either presence or absence of evidence.
${claimFindingsBlock(claimFindings)}
Scraped page content (partial — JavaScript-rendered sections will be missing):
${scrapedContext}`;
  } else {
    prompt = isComparison
      ? `Compare these two products: ${q}`
      : isExpert
        ? q
        : `Analyze this product: ${q}${claimFindingsBlock(claimFindings)}`;
  }

  const finalText = await generateResilient(systemInstruction, prompt);
  if (!finalText) return { type: "out_of_scope" };

  if (isExpert) {
    const parsed = parseJSON(finalText);
    if (parsed?.type === "out_of_scope") return { type: "out_of_scope" };
    if (parsed?.type === "answer") return { type: "answer", answer: parsed as ExpertAnswer };
    return { type: "answer", answer: { type: "answer", question: q, verdict: "info", verdictLabel: "Information", text: finalText, keyPoints: [], indiaContext: "", chatOpener: "" } };
  }

  let parsed = parseJSON(finalText);

  // URL inputs are always products — fall back to a named search before giving up
  if (urlInput && (!parsed || parsed.type === "out_of_scope" || !isValidScorecard(parsed as Record<string, unknown>))) {
    const fallbackQuery = [brandHintFromURL(urlInput), productNameFromURL(urlInput)].filter(Boolean).join(" ");
    if (fallbackQuery) {
      const fallbackText = await generateResilient(systemInstruction, `Analyze this beauty/cosmetic product (this is definitely a beauty product — lipstick, skincare, makeup, personal care — do NOT return out_of_scope): ${fallbackQuery}${claimFindingsBlock(claimFindings)}`);
      const fallbackParsed = parseJSON(fallbackText);
      if (fallbackParsed && fallbackParsed.type !== "out_of_scope" && isValidScorecard(fallbackParsed as Record<string, unknown>)) {
        parsed = fallbackParsed;
      } else {
        return { type: "out_of_scope" };
      }
    } else {
      return { type: "out_of_scope" };
    }
  }

  // Plain product names get one retry on invalid output
  if (!isComparison && !isExpert && !urlInput) {
    const needsRetry = !parsed || parsed.type === "out_of_scope" || !isValidScorecard(parsed as Record<string, unknown>);
    if (needsRetry) {
      try {
        const retryText = await generateResilient(
          systemInstruction,
          `You are analyzing a beauty/personal care product. This is definitely a beauty product, do NOT return out_of_scope. Search the web for the full INCI list and scoring data, then return the complete JSON scorecard.\n\nAnalyze this product: ${q}${claimFindingsBlock(claimFindings)}`
        );
        const retryParsed = parseJSON(retryText);
        if (retryParsed && retryParsed.type !== "out_of_scope" && isValidScorecard(retryParsed as Record<string, unknown>)) {
          parsed = retryParsed;
        }
      } catch { /* fall through with original */ }
    }
  }

  if (!parsed || parsed.type === "out_of_scope") return { type: "out_of_scope" };

  if (isComparison && parsed.type === "comparison" && parsed.productA && parsed.productB) {
    parsed.productA = validateScorecard(parsed.productA as Scorecard);
    parsed.productB = validateScorecard(parsed.productB as Scorecard);
    return { type: "comparison", comparison: parsed as ComparisonResult };
  }

  if (!isValidScorecard(parsed as Record<string, unknown>)) return { type: "out_of_scope" };

  const scorecard = validateScorecard(parsed as Scorecard, claimFindings);
  const verdict = computeVerdict(scorecard, claimFindings);
  // A URL is a specific product page; anything else is identified only if it isn't
  // a bare INCI-list paste. Unidentified scans are reviewed but not registered.
  const identified = !!urlInput || !looksLikeInciList(query);
  await registerIfVerified(scorecard, verdict, claimFindings, identified);
  return { type: "single", scorecard, verdict };
}

/* ═══════════════ The one pipeline ═══════════════ */

export async function runFullReview(query: string): Promise<ReviewResult> {
  const key = cacheKey(query);
  const cached = REVIEW_CACHE.get(key);
  if (cached) return cached;

  const kind = classifyQuery(query.trim());

  // Comparisons and questions skip the claim layer by design
  if (kind === "comparison" || kind === "question") {
    const deep = await runDeepScan(query, null);
    let result: ReviewResult;
    if (deep.type === "comparison") result = { kind: "comparison", comparison: deep.comparison };
    else if (deep.type === "answer") result = { kind: "answer", answer: deep.answer };
    else if (deep.type === "single") result = { kind: "product", claimCheck: null, claimLayerDown: false, scorecard: deep.scorecard, verdict: deep.verdict };
    else result = { kind: "out_of_scope" };
    if (result.kind !== "out_of_scope") REVIEW_CACHE.set(key, result);
    return result;
  }

  // Products and URLs: claims first, always
  let claimCheck: ClaimCheckResult | null = null;
  let claimLayerDown = false;
  try {
    claimCheck = await runClaimCheck(query);
  } catch {
    claimLayerDown = true; // transient failure — verdict will be provisional
  }

  const cf = compactClaimFindings(claimCheck);
  const deep = await runDeepScan(query, cf);

  if (deep.type === "single") {
    const result: ReviewResult = { kind: "product", claimCheck, claimLayerDown, scorecard: deep.scorecard, verdict: deep.verdict };
    REVIEW_CACHE.set(key, result);
    return result;
  }
  if (deep.type === "comparison") {
    const result: ReviewResult = { kind: "comparison", comparison: deep.comparison };
    REVIEW_CACHE.set(key, result);
    return result;
  }
  if (deep.type === "answer") {
    const result: ReviewResult = { kind: "answer", answer: deep.answer };
    REVIEW_CACHE.set(key, result);
    return result;
  }

  // Deep scan out of scope — the claim sheet may still stand on its own
  if (claimCheck) {
    const result: ReviewResult = { kind: "product", claimCheck, claimLayerDown, scorecard: null, verdict: null };
    REVIEW_CACHE.set(key, result);
    return result;
  }
  return { kind: "out_of_scope" };
}
