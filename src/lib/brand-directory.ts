import type { ProductScorecard } from "@/data/brands/types";
import { listRepositoryCatalogueProducts } from "@/lib/product-review-engine";
import { canonicalizeBrand } from "@/lib/verified-store";
import { createAdminClient } from "@/lib/supabase/admin";

export type StandingColor = "green" | "yellow" | "red" | "unrated";
export type PortfolioStanding = "green" | "yellow" | "red" | "mixed" | "limited" | "unrated";
export type StandingCounts = Record<StandingColor, number>;

export interface ManufacturerDisclosure {
  id: string;
  productSlug: string | null;
  manufacturerName: string;
  location: string | null;
  sourceUrl: string | null;
  checkedAt: string | null;
}

export interface BrandSentiment {
  standing: "positive" | "negative" | "mixed" | "insufficient";
  discussionCount: number;
  periodStart: string | null;
  periodEnd: string | null;
  checkedAt: string | null;
  praise: string[];
  complaints: string[];
  sourceUrls: string[];
}

export interface BrandDirectoryEntry {
  slug: string;
  name: string;
  description: string | null;
  founded: string | null;
  headquarters: string | null;
  website: string | null;
  countryOfOrigin: string | null;
  indiaPresence: string | null;
  globalPresence: string | null;
  sourceUrl: string | null;
  products: ProductScorecard[];
  counts: StandingCounts;
  ratedCount: number;
  standing: PortfolioStanding;
  leadingColor: StandingColor | null;
  manufacturers: ManufacturerDisclosure[];
  sentiment: BrandSentiment | null;
}

type Row = Record<string, unknown>;

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeUrl(value: unknown): string | null {
  const url = optionalText(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

export function brandSlug(name: string): string {
  return canonicalizeBrand(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Match the live product page marker first. Never treat an unrated pill as a positive result. */
export function standingForProduct(product: ProductScorecard): StandingColor {
  if (product.pill) return product.pill.marker ?? "unrated";
  switch (product.reviewTier) {
    case "approved":
    case "mostly-clean": return "green";
    case "can-do-better": return "yellow";
    case "not-recommended": return "red";
    default: return "unrated";
  }
}

export function portfolioFromCounts(counts: StandingCounts): {
  standing: PortfolioStanding;
  leadingColor: StandingColor | null;
  ratedCount: number;
} {
  const ratedCount = counts.green + counts.yellow + counts.red;
  if (!ratedCount) return { standing: "unrated", leadingColor: null, ratedCount };
  const maximum = Math.max(counts.green, counts.yellow, counts.red);
  const leaders = (["green", "yellow", "red"] as const).filter((color) => counts[color] === maximum);
  const leadingColor = leaders.length === 1 ? leaders[0] : null;
  if (ratedCount < 3) return { standing: "limited", leadingColor, ratedCount };
  return { standing: leadingColor ?? "mixed", leadingColor, ratedCount };
}

async function publishedRows(table: string): Promise<Row[]> {
  try {
    const { data, error } = await createAdminClient()
      .from(table)
      .select("*")
      .eq("is_published", true)
      .limit(2000);
    if (error) return [];
    return (data ?? []) as Row[];
  } catch {
    // Brand intelligence tables are optional until the migration has been applied.
    return [];
  }
}

/**
 * Only analysed products create brands. Old hand-written catalogue data is excluded.
 * Brand facts and sentiment are read only from published, editorially verified records.
 */
export async function getBrandDirectory(): Promise<BrandDirectoryEntry[]> {
  const [products, existingBrands, intelligence, manufacturers, sentiment] = await Promise.all([
    listRepositoryCatalogueProducts(1000),
    publishedRows("brands"),
    publishedRows("brand_intelligence"),
    publishedRows("brand_manufacturer_records"),
    publishedRows("brand_reddit_sentiment"),
  ]);
  const bySlug = new Map<string, BrandDirectoryEntry>();
  for (const product of products) {
    const name = canonicalizeBrand(product.brand || "").trim();
    const slug = brandSlug(name);
    if (!slug || !name) continue;
    let entry = bySlug.get(slug);
    if (!entry) {
      entry = {
        slug, name, description: null, founded: null, headquarters: null, website: null,
        countryOfOrigin: null, indiaPresence: null, globalPresence: null, sourceUrl: null,
        products: [], counts: { green: 0, yellow: 0, red: 0, unrated: 0 },
        ratedCount: 0, standing: "unrated", leadingColor: null, manufacturers: [], sentiment: null,
      };
      bySlug.set(slug, entry);
    }
    // Reviews should already be unique by slug; protect brand counts from duplicates.
    if (entry.products.some((p) => p.slug === product.slug)) continue;
    entry.products.push(product);
    entry.counts[standingForProduct(product)]++;
  }

  const fallbackBySlug = new Map<string, Row>();
  for (const row of existingBrands) {
    const key = brandSlug(String(row.name ?? ""));
    if (key) fallbackBySlug.set(key, row);
  }
  const intelligenceBySlug = new Map(intelligence.map((row) => [brandSlug(String(row.brand_slug ?? "")), row]));

  for (const entry of bySlug.values()) {
    const fallback = fallbackBySlug.get(entry.slug);
    const facts = intelligenceBySlug.get(entry.slug);
    entry.description = optionalText(facts?.summary) ?? optionalText(fallback?.description) ?? optionalText(fallback?.tagline);
    entry.founded = optionalText(facts?.founded_year) ?? optionalText(fallback?.founded);
    entry.headquarters = optionalText(fallback?.headquarters) ?? optionalText(fallback?.headquarters);
    entry.website = safeUrl(fallback?.website_url);
    entry.countryOfOrigin = optionalText(facts?.country_of_origin);
    entry.indiaPresence = optionalText(facts?.india_presence);
    entry.globalPresence = optionalText(facts?.global_presence);
    entry.sourceUrl = safeUrl(facts?.source_url);
    entry.manufacturers = manufacturers.filter((row) => brandSlug(String(row.brand_slug ?? "")) === entry.slug)
      .map((row) => ({
        id: String(row.id ?? ""),
        productSlug: optionalText(row.product_slug),
        manufacturerName: String(row.manufacturer_name ?? ""),
        location: optionalText(row.facility_location),
        sourceUrl: safeUrl(row.source_url),
        checkedAt: optionalText(row.checked_at),
      }))
      .filter((row) => row.manufacturerName);
    const reddit = sentiment.find((row) => brandSlug(String(row.brand_slug ?? "")) === entry.slug);
    if (reddit) {
      const standing = String(reddit.standing ?? "insufficient");
      entry.sentiment = {
        standing: (["positive", "negative", "mixed", "insufficient"].includes(standing) ? standing : "insufficient") as BrandSentiment["standing"],
        discussionCount: Number(reddit.discussion_count ?? 0),
        periodStart: optionalText(reddit.period_start),
        periodEnd: optionalText(reddit.period_end),
        checkedAt: optionalText(reddit.checked_at),
        praise: stringList(reddit.praise_themes),
        complaints: stringList(reddit.complaint_themes),
        sourceUrls: stringList(reddit.source_urls).map(safeUrl).filter((url): url is string => !!url),
      };
    }
    const summary = portfolioFromCounts(entry.counts);
    entry.ratedCount = summary.ratedCount;
    entry.standing = summary.standing;
    entry.leadingColor = summary.leadingColor;
    entry.products.sort((a, b) => {
      const order = { green: 0, yellow: 1, red: 2, unrated: 3 };
      return order[standingForProduct(a)] - order[standingForProduct(b)] || a.productName.localeCompare(b.productName);
    });
  }
  return Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name));
}
