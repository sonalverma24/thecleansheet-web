import type { ProductScorecard } from "@/data/brands/types";
import { TIER_STYLES, resolveTier } from "@/components/scorecards/pillar-ui";

/* ────────────────────────────────────────────────────────────────
   HOME SHELF · the product cards on the home page.

   The cards are REAL stored reviews, shown with the real standing
   (Good Standing / Room to Improve / Not Recommended / Licensed Drug).
   Nothing here can produce a "certified" status: certification is a
   separate, not-yet-live programme, so the shelf never reads
   `certificationStatus` and never invents a verdict.

   A fixed list of seven products leads the shelf (matched by brand and
   name against the live repository). If fewer than MIN_CARDS of them have
   been reviewed yet, the newest real skincare reviews top the shelf up so
   it is never empty or lopsided.
──────────────────────────────────────────────────────────────── */

export type ShelfCategory = "Cleansers" | "Toners" | "Exfoliants" | "Serums" | "Moisturisers" | "Spot care";

export const CATEGORY_ORDER: readonly ShelfCategory[] = [
  "Cleansers", "Toners", "Exfoliants", "Serums", "Moisturisers", "Spot care",
];

/** Shown under "All" only: a top-up review whose type is not one of the filter groups. */
const OTHER = "Other";

export interface ShelfSeed {
  key: string;
  /** Lowercase brand as it appears in the stored review. */
  brand: string;
  /** Every fragment must appear in the normalised "brand + name" text. */
  mustContain: string[];
  category: ShelfCategory;
  /** Clean pack shot kept in /public (watermark-free). */
  image: string;
  /** The query used to generate the review (see scripts/home-shelf-reviews.mts). */
  reviewQuery: string;
  /** Short label for the hero's "Popular checks" links, when this product earns one. */
  popular?: string;
}

export const SHELF_SEEDS: readonly ShelfSeed[] = [
  { key: "anua-heartleaf-oil", brand: "anua", mustContain: ["heartleaf", "oil"], category: "Cleansers", image: "/images/home/products/anua-heartleaf-oil.webp", reviewQuery: "Anua Heartleaf Pore Control Cleansing Oil", popular: "Cleansing oil" },
  { key: "skin1004-centella-toner", brand: "skin1004", mustContain: ["tea trica", "toner"], category: "Toners", image: "/images/home/products/skin1004-centella-toner.webp", reviewQuery: "SKIN1004 Madagascar Centella Tea-Trica Purifying Toner" },
  { key: "cosrx-bha-liquid", brand: "cosrx", mustContain: ["bha", "blackhead"], category: "Exfoliants", image: "/images/home/products/cosrx-bha-liquid.webp", reviewQuery: "COSRX BHA Blackhead Power Liquid", popular: "BHA liquid" },
  { key: "iunik-centella-gel-cream", brand: "iunik", mustContain: ["calming gel cream"], category: "Moisturisers", image: "/images/home/products/iunik-centella-gel-cream.webp", reviewQuery: "iUNIK Centella Calming Gel Cream" },
  { key: "skin1004-centella-ampoule", brand: "skin1004", mustContain: ["tea trica", "ampoule"], category: "Serums", image: "/images/home/products/skin1004-centella-ampoule.webp", reviewQuery: "SKIN1004 Madagascar Centella Tea-Trica Relief Ampoule" },
  { key: "anua-heartleaf-foam", brand: "anua", mustContain: ["heartleaf", "foam"], category: "Cleansers", image: "/images/home/products/anua-heartleaf-foam.webp", reviewQuery: "Anua Heartleaf Quercetinol Pore Deep Cleansing Foam" },
  { key: "cosrx-master-patch", brand: "cosrx", mustContain: ["master patch"], category: "Spot care", image: "/images/home/products/cosrx-master-patch.webp", reviewQuery: "COSRX Master Patch Original Fit", popular: "Pimple patches" },
];

/** Fewer real matches than this and the shelf is topped up with the newest skincare reviews. */
export const MIN_CARDS = 4;

export interface ShelfCard {
  /** Which seeded product this is, or null for a top-up review. */
  seedKey: string | null;
  slug: string;
  href: string;
  brand: string;
  name: string;
  category: string;
  image: string | null;
  /** The real standing label, e.g. "Good Standing". */
  standing: string;
  pill: { bg: string; fg: string; border: string };
  note: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function matchSeed(seed: ShelfSeed, tile: Pick<ProductScorecard, "brand" | "productName">): boolean {
  const brand = norm(tile.brand ?? "");
  if (!brand.includes(seed.brand)) return false;
  const text = norm(`${tile.brand} ${tile.productName}`);
  return seed.mustContain.every((frag) => text.includes(frag));
}

/** The clean pack shot kept for this product, when it is one of the seeded shelf products. */
export function seedImageFor(tile: Pick<ProductScorecard, "brand" | "productName">): string | null {
  return SHELF_SEEDS.find((seed) => matchSeed(seed, tile))?.image ?? null;
}

/** Filter group for a stored review's type, or null when it is not a skincare group on the shelf. */
export function categoryFor(tile: Pick<ProductScorecard, "category" | "productName">): ShelfCategory | null {
  const text = norm(`${tile.category ?? ""} ${tile.productName ?? ""}`);
  // Hair, bath and body products are reviewed too, but the shelf is skincare.
  if (/\b(hair|shampoo|conditioner|scalp|bath|bathing|body|soap|deodorant|perfume|fragrance)\b/.test(text)) return null;
  if (/\b(patch|patches|spot treatment|pimple)\b/.test(text)) return "Spot care";
  if (/\b(cleanser|cleansing|face wash|facewash|foam|micellar)\b/.test(text)) return "Cleansers";
  if (/\b(toner|essence|mist)\b/.test(text)) return "Toners";
  if (/\b(exfoliant|exfoliator|exfoliating|peel|aha|bha|salicylic)\b/.test(text)) return "Exfoliants";
  if (/\b(serum|ampoule)\b/.test(text)) return "Serums";
  if (/\b(moisturi[sz]er|cream|lotion|gel)\b/.test(text)) return "Moisturisers";
  return null;
}

/** One short line for the card, from the review's own takeaway (never invented). */
export function shelfNote(summary: string | undefined): string {
  const s = (summary ?? "").replace(/\s+/g, " ").trim();
  if (!s) return "Every claim graded against the evidence.";
  const MAX = 150;
  if (s.length <= MAX) return s;
  const cut = s.slice(0, MAX);
  const at = cut.lastIndexOf(" ");
  return `${cut.slice(0, at > 80 ? at : MAX).replace(/[,;:.\s]+$/, "")}…`;
}

function toCard(tile: ProductScorecard, seedKey: string | null, category: string, image: string | null): ShelfCard {
  const tier = resolveTier({ reviewTier: tile.reviewTier, score: tile.score });
  const style = TIER_STYLES[tier];
  return {
    seedKey,
    slug: tile.slug,
    href: `/reviews/${tile.slug}`,
    brand: tile.brand,
    name: tile.productName,
    category,
    image,
    standing: style.label,
    pill: { bg: style.bg, fg: style.fg, border: style.border },
    note: shelfNote(tile.summary),
  };
}

/** `tiles` are stored reviews, newest first (listRepositoryCatalogueProducts). */
export function buildShelf(tiles: ProductScorecard[], min: number = MIN_CARDS): ShelfCard[] {
  const used = new Set<string>();
  const cards: ShelfCard[] = [];

  for (const seed of SHELF_SEEDS) {
    const tile = tiles.find((t) => !used.has(t.slug) && matchSeed(seed, t));
    if (!tile) continue;
    used.add(tile.slug);
    cards.push(toCard(tile, seed.key, seed.category, seed.image));
  }

  if (cards.length >= min) return cards;

  const rest = tiles.filter((t) => !used.has(t.slug));
  const skincare = rest.filter((t) => categoryFor(t) !== null);
  const pool = skincare.length >= min - cards.length ? skincare : [...skincare, ...rest.filter((t) => categoryFor(t) === null)];
  for (const tile of pool) {
    if (cards.length >= min) break;
    cards.push(toCard(tile, null, categoryFor(tile) ?? OTHER, tile.image || null));
  }
  return cards;
}

/** Filter chips: only groups that actually have a card, in display order. */
export function shelfCategories(cards: ShelfCard[]): string[] {
  const present = new Set(cards.map((c) => c.category));
  return CATEGORY_ORDER.filter((c) => present.has(c));
}

/** Hero "Popular checks": links to reviews that actually exist (never a fresh paid review run). */
export function popularChecks(cards: ShelfCard[]): { label: string; href: string }[] {
  return SHELF_SEEDS.flatMap((seed) => {
    const card = seed.popular ? cards.find((c) => c.seedKey === seed.key) : undefined;
    return card && seed.popular ? [{ label: seed.popular, href: card.href }] : [];
  });
}
