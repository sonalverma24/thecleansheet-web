/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Image-published evidence reader
   Many Indian brands publish their test reports (SPF/PA, patch tests, vegan,
   blue light, water resistance...) as IMAGES in the product gallery or
   description. Those carry no alt text and no text layer, so the text scraper
   never sees them and the review wrongly reports "no evidence". This module
   pulls the page's raw HTML, finds the candidate graphics, and has a vision
   model TRANSCRIBE any that are test reports / certificates (verbatim numbers
   only, no inference). The result is fed to the review as BRAND-PUBLISHED
   EVIDENCE alongside the linked-document block.

   The same downloaded graphics are read a second time, with their own prompt, for label artwork that says the product is a DRUG (a "Drug Facts" panel, an Rx or
   Schedule H notice). That text is handed back through `out.labelText`; see src/lib/drug-signals.ts for what is made of it.
──────────────────────────────────────────────────────────────── */

import { GoogleGenerativeAI } from "@google/generative-ai";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const MAX_IMAGES = 24;
const MAX_BYTES = 4_000_000;
const BATCH = 5;

// Filenames/alt text that suggest proof; these are read first.
const PROOF_HINT = /report|test|lab|proof|cert|spf|derm|clinic|study|vegan|clean|blue|water|moistur|comed|como|ophth|patch|uva|\bpa\b/i;
// Never evidence: chrome, payment, social, review-widget graphics.
const JUNK = /logo|icon|sprite|payment|badge|favicon|avatar|judge\.?me|star|flag|banner-?bg|loader|spinner|\.svg|\.gif/i;

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, signal: AbortSignal.timeout(15000) });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

/** JS-rendered HTML via Firecrawl: sliders/accordions often inject their report
    graphics client-side, so the server HTML alone misses some. No-op ("") when
    FIRECRAWL_API_KEY is unset or the call fails. */
async function fetchRenderedHtml(url: string): Promise<string> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return "";
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["rawHtml"], waitFor: 2500 }),
      signal: AbortSignal.timeout(40000),
    });
    if (!res.ok) return "";
    const j = (await res.json()) as { data?: { rawHtml?: string } };
    return j.data?.rawHtml ?? "";
  } catch {
    return "";
  }
}

function absolutise(src: string, base: string): string | null {
  try {
    return new URL(src.startsWith("//") ? `https:${src}` : src, base).toString();
  } catch {
    return null;
  }
}

/** Candidate graphics from a product page's raw HTML, proof-looking ones first. */
export function candidateImageUrls(html: string, pageUrl: string): string[] {
  const found = new Map<string, { url: string; score: number }>();
  const add = (raw: string, alt = "") => {
    // srcset: take the last (largest) entry
    const first = raw.includes(",") && /\s\d+w/.test(raw) ? raw.split(",").pop()!.trim().split(/\s+/)[0] : raw.trim();
    const url = absolutise(first, pageUrl);
    if (!url || !/\.(png|jpe?g|webp)(\?|$)/i.test(url)) return;
    const key = url.replace(/\?.*$/, "").replace(/_\d+x(\d+)?(?=\.\w+$)/, "");
    if (JUNK.test(key) || JUNK.test(alt)) return;
    // Hotlinked Shopify/CDN images accept a width param; ask for a legible size.
    const sized = /\/cdn\/shop\//.test(url) || /cdn\.shopify\.com/.test(url)
      ? url.replace(/([?&])width=\d+/, "$1width=1400") + (/[?&]width=/.test(url) ? "" : `${url.includes("?") ? "&" : "?"}width=1400`)
      : url;
    const score = (PROOF_HINT.test(key) ? 2 : 0) + (PROOF_HINT.test(alt) ? 2 : 0) + (/\/(files|products)\//.test(key) ? 1 : 0);
    const prev = found.get(key);
    if (!prev || score > prev.score) found.set(key, { url: sized, score });
  };
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? "";
    for (const attr of ["data-src", "data-srcset", "srcset", "src", "data-zoom", "data-original"]) {
      const v = tag.match(new RegExp(`\\b${attr}=["']([^"']+)["']`, "i"))?.[1];
      if (v) add(v, alt);
    }
  }
  // Gallery images are often only in JSON (Shopify product media / lightbox).
  for (const m of html.matchAll(/["']((?:https?:)?\\?\/\\?\/[^"'\s]+?\.(?:png|jpe?g|webp)[^"'\s]*?)["']/gi)) {
    add(m[1].replace(/\\\//g, "/"));
  }
  return [...found.values()].sort((a, b) => b.score - a.score).slice(0, MAX_IMAGES).map((x) => x.url);
}

async function fetchImage(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 8000 || buf.length > MAX_BYTES) return null; // tiny = decoration, huge = skip
    const mimeType = (res.headers.get("content-type") ?? "").split(";")[0] || "image/png";
    if (!/^image\/(png|jpe?g|webp)$/.test(mimeType)) return null;
    return { mimeType, data: buf.toString("base64") };
  } catch {
    return null;
  }
}

const VISION_PROMPT = `You are reading graphics from a skincare/haircare brand's product page. For EACH image (in order) decide whether it shows a TEST REPORT or CERTIFICATE (lab report page, patch-test summary, clinical study, SPF/PA analysis, vegan/clean-beauty certificate, blue-light chart, water-resistance analysis, etc.).

For each image output exactly one block, separated by a line of ---:
IMAGE <n>: NOT_A_REPORT   (lifestyle photo, packshot, infographic with no test data, ingredient art)
or
IMAGE <n>: REPORT
Type: <e.g. in-vitro SPF/PA, patch test, non-comedogenicity, vegan conformity, ophthalmological, blue light, water resistance, clean-beauty panel, moisturisation>
Lab/issuer: <name as printed>
Date: <as printed, or unknown>
Product tested: <exact name/code as printed on the report>
Method/design: <e.g. in vitro vs in vivo, ISO standard if printed, panel size, duration, single/comparative>
Key results: <verbatim numbers and conclusion lines as printed; both the report's own values AND any marketing overlay text on the graphic, labelled which is which>
Caveats: <anything printed such as "results apply only to the test article", or a mismatch between the report body and the overlay headline>

Rules: transcribe ONLY what is legible. Never infer, round, or fill in a value you cannot read; write "illegible" instead. Do not judge the product.`;

const LABEL_PROMPT = `You are reading product pack and label artwork from a skincare, haircare or personal-care product page. For EACH image (in order) decide whether it shows printed text saying the product is a DRUG: a "Drug Facts" panel, an "Rx" or "Rx only" or "prescription only" notice, or a "Schedule H" or "Schedule H1" warning.

For each image output exactly one block, separated by a line of ---:
IMAGE <n>: DRUG_LABEL
Text: <the words that say so, exactly as printed>
or
IMAGE <n>: NONE

Rules: transcribe ONLY what is legible. Never infer. A cosmetic's ordinary directions, "for external use only", warnings and ingredient list are NONE. Do not judge the product.`;

/** The words printed on each image the model marked DRUG_LABEL, one per line. Anything else it wrote is ignored. */
export function parseLabelNotices(text: string): string[] {
  const out: string[] = [];
  for (const block of text.split(/\n-{3,}\n?/)) {
    if (!/IMAGE\s+\d+:\s*DRUG_LABEL/i.test(block)) continue;
    const printed = block.match(/Text:\s*([\s\S]+)/i)?.[1]?.trim().slice(0, 300);
    if (printed) out.push(printed);
  }
  return out;
}

async function transcribeBatch(key: string, imgs: { url: string; mimeType: string; data: string }[], prompt: string = VISION_PROMPT): Promise<string> {
  const model = new GoogleGenerativeAI(key).getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { temperature: 0 },
  });
  const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [{ text: prompt }];
  imgs.forEach((im, i) => {
    parts.push({ text: `IMAGE ${i + 1} (${im.url}):` });
    parts.push({ inlineData: { mimeType: im.mimeType, data: im.data } });
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const out = (await model.generateContent(parts)).response.text().trim();
      if (out) return out;
    } catch {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return "";
}

/** Read the page's graphics and return a BRAND-PUBLISHED EVIDENCE sub-block of
    transcribed test reports, or "" when none are found / no key / any failure. */
export async function imageEvidenceBlock(pageUrl: string, out?: { labelText?: string }): Promise<string> {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return "";
  const [raw, rendered] = await Promise.all([fetchHtml(pageUrl), fetchRenderedHtml(pageUrl)]);
  const html = `${raw ?? ""}\n${rendered}`;
  if (!html.trim()) return "";
  const urls = candidateImageUrls(html, pageUrl);
  if (!urls.length) return "";
  const loaded = (await Promise.all(urls.map(async (u) => { const i = await fetchImage(u); return i ? { url: u, ...i } : null; })))
    .filter((x): x is { url: string; mimeType: string; data: string } => x !== null);
  // Label artwork that says "drug": read once per analysis (the caller may come back for a retry), best-effort like the rest.
  if (out && out.labelText === undefined) {
    const batches: (typeof loaded)[] = [];
    for (let i = 0; i < loaded.length; i += BATCH) batches.push(loaded.slice(i, i + BATCH));
    const read = await Promise.all(batches.map(async (batch) => parseLabelNotices(await transcribeBatch(key, batch, LABEL_PROMPT))));
    out.labelText = read.flat().join("\n");
  }
  const reports: string[] = [];
  for (let i = 0; i < loaded.length; i += BATCH) {
    const batch = loaded.slice(i, i + BATCH);
    const text = await transcribeBatch(key, batch);
    for (const block of text.split(/\n-{3,}\n?/)) {
      const m = block.match(/IMAGE\s+(\d+):\s*REPORT/i);
      if (!m) continue;
      const src = batch[Number(m[1]) - 1]?.url ?? pageUrl;
      reports.push(`SOURCE (report graphic on the brand product page): ${src}\n${block.replace(/^\s*IMAGE\s+\d+:\s*/i, "").trim()}`);
    }
  }
  if (!reports.length) return "";
  return `\n\nBRAND-PUBLISHED TEST REPORTS (transcribed from graphics on the brand's own product page - ${reports.length} found). Treat each as brand-hosted finished-product evidence: Level 4, or Level 5 if an independent lab is named. Grade the SPECIFIC claim each covers and note its method. For sunscreens: an in-vitro SPF/PA report is real finished-product evidence but is NOT ISO 24444 in-vivo, and if the report's measured SPF/PA is LOWER than the label claim (e.g. report SPF 47 / PA+++ vs label SPF 50+ / PA++++), state the exact figures and flag the label as ahead of its proof.\n${reports.join("\n---\n")}`;
}
