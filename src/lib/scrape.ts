/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Shared page scraper (keyless Jina reader)
   Used for product pages, INCIDecoder, and brand-published evidence.
──────────────────────────────────────────────────────────────── */

const JINA = "https://r.jina.ai/";

export async function fetchPageMarkdown(url: string, limit = 60000): Promise<string | null> {
  try {
    const res = await fetch(JINA + url, {
      headers: { Accept: "text/plain", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return (await res.text()).slice(0, limit);
  } catch {
    return null;
  }
}

/** Page title from a Jina markdown scrape ("Title: ..." first line). */
export function titleFromMarkdown(md: string): string | null {
  const m = md.match(/^Title:\s*(.+)$/m);
  if (!m) return null;
  // Strip storefront boilerplate: "Buy X Online at Best Price | Store" → "X"
  return m[1]
    .replace(/^buy\s+/i, "")
    .replace(/\s*(online.*|at best price.*)$/i, "")
    .split("|")[0]
    .split("–")[0]
    .trim() || null;
}

/** Trim nav/menu boilerplate from a scraped product page, keep the body. */
export function productBodyExcerpt(md: string, limit = 9000): string {
  const lines = md.split("\n");
  // Body usually starts at the first H1 after the link-heavy header block.
  let start = lines.findIndex((l) => /^#\s+\S/.test(l.trim()));
  if (start === -1) start = 0;
  return lines
    .slice(start)
    .filter((l) => {
      const t = l.trim();
      if (!t) return false;
      // Drop pure-link nav rows and image rows
      const links = (t.match(/\]\(/g) || []).length;
      if (links >= 3 && t.replace(/\[[^\]]*\]\([^)]*\)/g, "").trim().length < 10) return false;
      if (/^!\[/.test(t)) return false;
      return true;
    })
    .join("\n")
    .slice(0, limit);
}

const EVIDENCE_LINK_RE = /report|study|clinical|certificate|certif|test(?:ed|ing)?|proof|evidence|dermat/i;

/** Candidate brand-published evidence links from a scraped page (same/brand domain, PDF or page). */
export function evidenceLinksFromMarkdown(md: string, pageUrl: string, max = 3): string[] {
  let host = "";
  try { host = new URL(pageUrl).hostname.replace(/^www\./, ""); } catch { /* keep "" */ }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of md.matchAll(/\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g)) {
    const [, text, href] = m;
    if (seen.has(href)) continue;
    seen.add(href);
    if (!EVIDENCE_LINK_RE.test(text) && !EVIDENCE_LINK_RE.test(href)) continue;
    // Stay on the store/brand ecosystem; skip socials and app links
    try {
      const h = new URL(href).hostname.replace(/^www\./, "");
      if (/facebook|instagram|twitter|youtube|linkedin|wa\.me|whatsapp|apple|google/.test(h)) continue;
      if (host && h !== host && !h.includes(host.split(".")[0])) continue;
    } catch { continue; }
    if (href === pageUrl) continue;
    out.push(href);
    if (out.length >= max) break;
  }
  return out;
}
