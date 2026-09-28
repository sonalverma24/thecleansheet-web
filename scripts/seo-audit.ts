/**
 * SEO health check for The Clean Sheet (or any site).
 *
 * Zero dependencies. Runs on Node 22.6+ (native TypeScript type stripping):
 *
 *   node scripts/seo-audit.ts                          # audit production sitemap (all URLs)
 *   node scripts/seo-audit.ts --base http://localhost:3000
 *   node scripts/seo-audit.ts --sample 5               # 5 URLs per route group (fast smoke test)
 *   node scripts/seo-audit.ts --paths /about,/brands   # audit specific paths (also adds them to the run)
 *   node scripts/seo-audit.ts --discover               # also check internal links not in the sitemap
 *   node scripts/seo-audit.ts --csv out.csv --json out.json
 *   node scripts/seo-audit.ts --fail-on high           # exit 1 if any HIGH/CRITICAL issue (CI use)
 *
 * Flags:
 *   --base <url>        Site origin (default https://thecleansheet.in)
 *   --canon-origin <u>  Expected canonical origin (default: --base). Use with a local --base:
 *                       node scripts/seo-audit.ts --base http://localhost:3000 --canon-origin https://thecleansheet.in
 *   --sample <n>        Only audit n URLs per first-path-segment group
 *   --limit <n>         Hard cap on URLs audited
 *   --concurrency <n>   Parallel requests (default 6)
 *   --ua <string>       User agent (default: Googlebot-style, see note in source)
 *   --paths <a,b,c>    Extra/explicit paths to audit
 *   --only-paths        With --paths: audit ONLY those paths, skip the sitemap
 *   --discover          Follow internal links found on audited pages; report those not in the sitemap
 *   --csv <file>        Write a CSV report
 *   --json <file>       Write a JSON report
 *   --fail-on <level>   critical | high | medium | low; exit code 1 if an issue at/above that level exists
 *
 * What is checked, per URL: HTTP status + redirects, indexability (meta robots,
 * X-Robots-Tag, robots.txt block), canonical (present / self-referencing / matches
 * the URL), title, meta description, H1 count, internal link count, JSON-LD
 * presence and types, sitemap membership, and cross-URL duplicate titles /
 * descriptions / canonicals.
 */

import { writeFileSync } from "node:fs";

// ---------- types ----------
type Level = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
const LEVEL_RANK: Record<Level, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

interface Issue { level: Level; code: string; detail: string }

interface PageResult {
  url: string;
  status: number;
  finalUrl: string;
  redirected: boolean;
  indexable: boolean;
  robotsMeta: string;
  xRobotsTag: string;
  blockedByRobotsTxt: boolean;
  canonical: string;
  title: string;
  description: string;
  h1: string[];
  internalLinks: number;
  jsonLdTypes: string[];
  inSitemap: boolean;
  canonicalElsewhere?: boolean;
  ms: number;
  issues: Issue[];
  links: string[];
}

// ---------- args ----------
const argv = process.argv.slice(2);
function arg(name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
}
const flag = (name: string) => argv.includes(`--${name}`);

const BASE = (arg("base") ?? "https://thecleansheet.in").replace(/\/+$/, "");
// Origin the pages' canonicals should point at. Defaults to --base; set it to the
// production origin when auditing a local build (--base http://localhost:3000).
const CANON = (arg("canon-origin") ?? BASE).replace(/\/+$/, "");
const SAMPLE = arg("sample") ? Number(arg("sample")) : 0;
const LIMIT = arg("limit") ? Number(arg("limit")) : 0;
const CONCURRENCY = Number(arg("concurrency") ?? 6);
const EXTRA_PATHS = (arg("paths") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const ONLY_PATHS = flag("only-paths");
const DISCOVER = flag("discover");
const FAIL_ON = (arg("fail-on") ?? "").toUpperCase() as Level | "";
// Default to a Googlebot user agent: Next.js serves different metadata placement
// (blocking <head> vs streamed into <body>) depending on the UA, and Googlebot is
// the one that matters. Override with --ua.
const UA = arg("ua") ?? "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) TheCleanSheet-SEO-Audit/1.0";

// ---------- helpers ----------
async function get(url: string, redirect: "manual" | "follow" = "manual") {
  return fetch(url, { redirect, headers: { "user-agent": UA, accept: "text/html,application/xml" } });
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}
const strip = (s: string) => decode(s.replace(/<[^>]+>/g, " "));

function attr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? decode(m[2] ?? m[3] ?? "") : "";
}

/** Returns the path+query, normalised to the audited origin, or null when external. */
function toInternal(href: string, from: string): string | null {
  try {
    const u = new URL(href, from);
    if (u.origin !== BASE) return null;
    u.hash = "";
    return u.pathname + u.search;
  } catch { return null; }
}

// ---------- robots.txt ----------
interface RobotsRules { disallow: RegExp[]; allow: RegExp[]; sitemaps: string[] }

function ruleToRegex(rule: string): RegExp {
  const esc = rule.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp("^" + esc.replace(/\\\$$/, "$"));
}

async function loadRobots(): Promise<RobotsRules> {
  const out: RobotsRules = { disallow: [], allow: [], sitemaps: [] };
  try {
    const txt = await (await get(`${BASE}/robots.txt`, "follow")).text();
    let applies = false; let prevWasUA = false;
    for (const raw of txt.split(/\r?\n/)) {
      const line = raw.split("#")[0].trim();
      if (!line) continue;
      const [k, ...rest] = line.split(":");
      const key = k.trim().toLowerCase(); const val = rest.join(":").trim();
      if (key === "user-agent") {
        applies = prevWasUA ? applies || val === "*" : val === "*";
        prevWasUA = true; continue;
      }
      prevWasUA = false;
      if (key === "sitemap") out.sitemaps.push(val);
      else if (applies && key === "disallow" && val) out.disallow.push(ruleToRegex(val));
      else if (applies && key === "allow" && val) out.allow.push(ruleToRegex(val));
    }
  } catch { /* leave empty */ }
  return out;
}

function blocked(path: string, r: RobotsRules): boolean {
  return r.disallow.some((d) => d.test(path)) && !r.allow.some((a) => a.test(path) && a.source.length > 0 && !r.disallow.some((d) => d.source.length > a.source.length && d.test(path)));
}

// ---------- sitemap ----------
/** Sitemaps list production URLs; when auditing another origin (a local build), fetch them from there. */
function rebase(href: string): string {
  const u = new URL(href);
  return u.origin === BASE ? href.replace(/\/$/, "") : BASE + (u.pathname === "/" ? "" : u.pathname) + u.search;
}

async function loadSitemapUrls(url: string, seen = new Set<string>()): Promise<string[]> {
  if (seen.has(url)) return [];
  seen.add(url);
  const res = await get(url, "follow");
  if (!res.ok) { console.error(`! sitemap ${url} -> HTTP ${res.status}`); return []; }
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => rebase(decode(m[1])));
  if (/<sitemapindex/i.test(xml)) {
    const nested = await Promise.all(locs.map((l) => loadSitemapUrls(l, seen)));
    return nested.flat();
  }
  return locs;
}

// ---------- page audit ----------
async function auditPage(url: string, sitemapSet: Set<string>, robots: RobotsRules): Promise<PageResult> {
  const t0 = Date.now();
  const path = toInternal(url, BASE) ?? "/";
  const r: PageResult = {
    url, status: 0, finalUrl: url, redirected: false, indexable: false, robotsMeta: "", xRobotsTag: "",
    blockedByRobotsTxt: blocked(path, robots), canonical: "", title: "", description: "", h1: [],
    internalLinks: 0, jsonLdTypes: [], inSitemap: sitemapSet.has(url), ms: 0, issues: [], links: [],
  };
  const add = (level: Level, code: string, detail = "") => r.issues.push({ level, code, detail });

  try {
    let res = await get(url, "manual");
    if (res.status >= 300 && res.status < 400) {
      r.redirected = true;
      const loc = res.headers.get("location") ?? "";
      r.finalUrl = new URL(loc, url).toString();
      r.status = res.status;
      add(r.inSitemap ? "HIGH" : "LOW", "REDIRECT", `${res.status} -> ${r.finalUrl}${r.inSitemap ? " (redirecting URL is in sitemap)" : ""}`);
      res = await get(r.finalUrl, "follow"); // still inspect the target
    }
    const finalStatus = res.status;
    if (!r.redirected) r.status = finalStatus;
    else if (finalStatus !== 200) add("HIGH", "REDIRECT_TARGET_NOT_200", `target returned ${finalStatus}`);

    r.xRobotsTag = res.headers.get("x-robots-tag") ?? "";
    const ct = res.headers.get("content-type") ?? "";
    if (finalStatus !== 200) {
      add(r.inSitemap ? "CRITICAL" : "MEDIUM", "NON_200", `HTTP ${finalStatus}`);
    } else if (ct.includes("html")) {
      const html = await res.text();
      // Next.js can stream metadata into <body> for some user agents, so parse the
      // whole document (scripts stripped) and separately flag metadata outside <head>.
      const headEnd = html.search(/<\/head>/i);
      const head = html.replace(/<script[\s\S]*?<\/script>/gi, "");

      const robotsTag = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0])
        .filter((t) => /name\s*=\s*["'](robots|googlebot)["']/i.test(t));
      r.robotsMeta = robotsTag.map((t) => attr(t, "content")).join(", ");
      r.canonical = attr(head.match(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i)?.[0] ?? "", "href");
      r.title = strip(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
      const descTag = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0])
        .find((t) => /name\s*=\s*["']description["']/i.test(t));
      r.description = descTag ? attr(descTag, "content") : "";

      const body = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
      r.h1 = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => strip(m[1])).filter(Boolean);

      const links = new Set<string>();
      for (const m of body.matchAll(/<a\b[^>]*href\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
        const p = toInternal(decode(m[2] ?? m[3] ?? ""), r.finalUrl);
        if (p) links.add(p);
      }
      r.links = [...links];
      r.internalLinks = links.size;

      for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
        try {
          const walk = (n: unknown) => {
            if (Array.isArray(n)) return n.forEach(walk);
            if (n && typeof n === "object") {
              const o = n as Record<string, unknown>;
              if (o["@type"]) [o["@type"]].flat().forEach((t) => r.jsonLdTypes.push(String(t)));
              if (o["@graph"]) walk(o["@graph"]);
            }
          };
          walk(JSON.parse(m[1]));
        } catch { add("MEDIUM", "JSONLD_INVALID", "unparseable JSON-LD block"); }
      }
      r.jsonLdTypes = [...new Set(r.jsonLdTypes)];
      const titleAt = html.search(/<title[\s>]/i);
      const canonAt = html.search(/<link\b[^>]*rel\s*=\s*["']canonical["']/i);
      const inBody = headEnd >= 0 && ((titleAt > headEnd) || (canonAt > headEnd));

      // ---- rules ----
      const noindex = /noindex/i.test(r.robotsMeta) || /noindex/i.test(r.xRobotsTag);
      r.indexable = !noindex && !r.blockedByRobotsTxt;
      if (inBody) add("HIGH", "METADATA_IN_BODY", "title/canonical streamed after </head> (some crawlers ignore metadata outside <head>)");
      if (noindex && r.inSitemap) add("CRITICAL", "NOINDEX_IN_SITEMAP", "noindex page listed in sitemap");
      if (r.blockedByRobotsTxt && r.inSitemap) add("CRITICAL", "BLOCKED_IN_SITEMAP", "robots.txt-blocked URL listed in sitemap");
      if (!noindex) {
        if (!r.canonical) add("HIGH", "CANONICAL_MISSING");
        else {
          const canon = r.canonical.replace(/\/+$/, "");
          const selfPath = toInternal(r.redirected ? r.finalUrl : url, BASE) ?? "/";
          const self = (CANON + (selfPath === "/" ? "" : selfPath)).replace(/\/+$/, "");
          if (canon !== self) {
            r.canonicalElsewhere = true;
            if (canon === CANON) add("CRITICAL", "CANONICAL_MISMATCH", `canonical ${r.canonical} is the homepage, page is ${self}`);
            else if (r.inSitemap) add("HIGH", "CANONICAL_MISMATCH", `in sitemap but canonical is ${r.canonical} != ${self}`);
            else add("LOW", "CANONICALISED_ELSEWHERE", `canonical ${r.canonical} (fine if intentional duplicate handling)`);
          }
        }
        if (!r.title) add("HIGH", "TITLE_MISSING");
        else if (r.title.length > 70) add("LOW", "TITLE_LONG", `${r.title.length} chars`);
        if (!r.description) add("MEDIUM", "DESCRIPTION_MISSING");
        else if (r.description.length > 175) add("LOW", "DESCRIPTION_LONG", `${r.description.length} chars`);
        else if (r.description.length < 50) add("LOW", "DESCRIPTION_SHORT", `${r.description.length} chars`);
        if (r.h1.length === 0) add("MEDIUM", "H1_MISSING");
        else if (r.h1.length > 1) add("LOW", "H1_MULTIPLE", `${r.h1.length} H1s`);
        if (r.internalLinks < 3) add("LOW", "FEW_INTERNAL_LINKS", `${r.internalLinks} links`);
        if (r.jsonLdTypes.length === 0) add("LOW", "NO_STRUCTURED_DATA");
        if (!r.inSitemap && !r.redirected && !r.canonicalElsewhere) add("MEDIUM", "INDEXABLE_NOT_IN_SITEMAP");
      }
    }
  } catch (e) {
    add("CRITICAL", "FETCH_FAILED", String(e));
  }
  r.ms = Date.now() - t0;
  return r;
}

async function pool<T, R>(items: T[], n: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); }
  }));
  return out;
}

// ---------- main ----------
async function main() {
  console.log(`SEO audit: ${BASE}\n`);
  const robots = await loadRobots();
  const declared = robots.sitemaps.length > 0;
  console.log(`robots.txt: ${robots.disallow.length} disallow rule(s) for *, sitemap declared: ${declared ? robots.sitemaps.join(", ") : "NO"}`);

  let sitemapUrls: string[] = [];
  if (!ONLY_PATHS) sitemapUrls = await loadSitemapUrls(rebase(robots.sitemaps[0] ?? `${BASE}/sitemap.xml`));
  const sitemapSet = new Set(sitemapUrls);
  console.log(`sitemap: ${sitemapUrls.length} URLs`);
  const dupSitemap = sitemapUrls.length - sitemapSet.size;

  let targets = [...sitemapUrls];
  if (SAMPLE) {
    const groups = new Map<string, string[]>();
    for (const u of targets) {
      const seg = (toInternal(u, BASE) ?? "/").split("/")[1] || "(home)";
      groups.set(seg, [...(groups.get(seg) ?? []), u]);
    }
    targets = [...groups.values()].flatMap((g) => g.slice(0, SAMPLE));
  }
  for (const p of EXTRA_PATHS) targets.push(BASE + p);
  targets = [...new Set(targets)];
  if (LIMIT) targets = targets.slice(0, LIMIT);
  console.log(`auditing ${targets.length} URL(s), concurrency ${CONCURRENCY}\n`);

  let done = 0;
  const results = await pool(targets, CONCURRENCY, async (u) => {
    const r = await auditPage(u, sitemapSet, robots);
    if (++done % 50 === 0) process.stdout.write(`  ...${done}/${targets.length}\n`);
    return r;
  });

  // cross-URL duplicates (indexable pages only)
  const idx = results.filter((r) => r.status === 200 && r.indexable && !r.canonicalElsewhere);
  const dupes = (key: "title" | "description" | "canonical", code: string, level: Level) => {
    const m = new Map<string, PageResult[]>();
    for (const r of idx) if (r[key]) m.set(r[key], [...(m.get(r[key]) ?? []), r]);
    for (const [v, rs] of m) if (rs.length > 1) for (const r of rs) r.issues.push({ level, code, detail: `shared by ${rs.length} URLs: "${v.slice(0, 70)}"` });
  };
  dupes("title", "DUPLICATE_TITLE", "MEDIUM");
  dupes("description", "DUPLICATE_DESCRIPTION", "LOW");
  dupes("canonical", "DUPLICATE_CANONICAL", "HIGH");

  // discovery: internal links not in sitemap
  let discovered: { path: string; status: number; robotsMeta: string; canonical: string; from: string }[] = [];
  if (DISCOVER) {
    const known = new Set(results.map((r) => toInternal(r.url, BASE)));
    const found = new Map<string, string>();
    for (const r of results) for (const l of r.links) {
      if (!known.has(l) && !sitemapSet.has(BASE + l) && !found.has(l) && !/^\/(_next|api)\b/.test(l)) found.set(l, r.url);
    }
    console.log(`\ndiscover: ${found.size} internal link target(s) not in the audited set, checking...`);
    discovered = await pool([...found], CONCURRENCY, async ([p, from]) => {
      const r = await auditPage(BASE + p, sitemapSet, robots);
      return { path: p, status: r.status, robotsMeta: r.robotsMeta || r.xRobotsTag, canonical: r.canonical, from };
    });
  }

  // ---------- report ----------
  const counts: Record<string, number> = {};
  const byCode = new Map<string, { level: Level; urls: string[] }>();
  for (const r of results) for (const i of r.issues) {
    counts[i.level] = (counts[i.level] ?? 0) + 1;
    const e = byCode.get(i.code) ?? { level: i.level, urls: [] };
    e.urls.push(r.url); byCode.set(i.code, e);
  }

  console.log("\n=== SUMMARY ===");
  console.log(`URLs audited:        ${results.length}`);
  console.log(`HTTP 200:            ${results.filter((r) => r.status === 200 && !r.redirected).length}`);
  console.log(`Redirects:           ${results.filter((r) => r.redirected).length}`);
  console.log(`Non-200/errors:      ${results.filter((r) => r.status !== 200 && !r.redirected).length}`);
  console.log(`Indexable:           ${results.filter((r) => r.indexable && r.status === 200).length}`);
  console.log(`noindex / blocked:   ${results.filter((r) => !r.indexable && r.status === 200).length}`);
  console.log(`In sitemap:          ${results.filter((r) => r.inSitemap).length}${dupSitemap ? `  (${dupSitemap} duplicate sitemap entries!)` : ""}`);
  console.log(`With JSON-LD:        ${results.filter((r) => r.jsonLdTypes.length).length}`);
  console.log(`Issues:              ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join("  ") || "none"}`);

  console.log("\n=== ISSUES BY TYPE ===");
  [...byCode].sort((a, b) => LEVEL_RANK[b[1].level] - LEVEL_RANK[a[1].level] || b[1].urls.length - a[1].urls.length)
    .forEach(([code, e]) => {
      const sample = e.urls.slice(0, 3).map((u) => toInternal(u, BASE) ?? u).join(", ");
      console.log(`[${e.level.padEnd(8)}] ${code.padEnd(24)} x${String(e.urls.length).padEnd(5)} e.g. ${sample}`);
    });

  if (discovered.length) {
    console.log("\n=== INTERNAL LINKS NOT IN SITEMAP ===");
    for (const d of discovered) console.log(`${String(d.status).padEnd(4)} ${d.path.padEnd(50)} robots=[${d.robotsMeta}] canonical=${d.canonical ? "yes" : "NO"}  (linked from ${toInternal(d.from, BASE)})`);
  }

  console.log("\n=== PER-URL (URLs with HIGH/CRITICAL issues) ===");
  for (const r of results.filter((x) => x.issues.some((i) => LEVEL_RANK[i.level] >= 3))) {
    console.log(`${r.status} ${toInternal(r.url, BASE)}`);
    for (const i of r.issues.filter((x) => LEVEL_RANK[x.level] >= 3)) console.log(`     ${i.level} ${i.code} ${i.detail}`);
  }

  const csvEsc = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const csvPath = arg("csv");
  if (csvPath) {
    const head = ["url", "status", "indexable", "canonical", "title", "description", "h1", "robots", "in_sitemap", "internal_links", "jsonld", "issues"];
    const rows = results.map((r) => [r.url, r.status, r.indexable, r.canonical, r.title, r.description, r.h1.join(" | "), r.robotsMeta || r.xRobotsTag, r.inSitemap, r.internalLinks, r.jsonLdTypes.join(";"), r.issues.map((i) => `${i.level}:${i.code}`).join(";")]);
    writeFileSync(csvPath, [head, ...rows].map((row) => row.map(csvEsc).join(",")).join("\n"));
    console.log(`\nCSV written: ${csvPath}`);
  }
  const jsonPath = arg("json");
  if (jsonPath) {
    writeFileSync(jsonPath, JSON.stringify({ base: BASE, sitemapCount: sitemapUrls.length, results: results.map(({ links: _l, ...rest }) => rest), discovered }, null, 2));
    console.log(`JSON written: ${jsonPath}`);
  }

  if (FAIL_ON && results.some((r) => r.issues.some((i) => LEVEL_RANK[i.level] >= LEVEL_RANK[FAIL_ON as Level]))) {
    console.error(`\nFAIL: issues at or above ${FAIL_ON} found`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(2); });
