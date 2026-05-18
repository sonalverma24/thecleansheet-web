import { minimalistBrand } from "./minimalist";
import type { Brand, BrandSummary } from "./types";

export type { Brand, BrandSummary, ProductScorecard, ScorePillar, IngredientEntry, KeyActive } from "./types";

export const ALL_BRANDS: Brand[] = [minimalistBrand];

export function getBrandBySlug(slug: string): Brand | undefined {
  return ALL_BRANDS.find((b) => b.slug === slug);
}

export function getProductBySlug(brandSlug: string, productSlug: string) {
  const brand = getBrandBySlug(brandSlug);
  return brand?.products.find((p) => p.slug === productSlug);
}

export function getAllBrandSummaries(): BrandSummary[] {
  return ALL_BRANDS.map((b) => ({
    name: b.name,
    slug: b.slug,
    logo: b.logo,
    tagline: b.tagline,
    avgScore: b.avgScore,
    verdict: b.verdict,
    founded: b.founded,
    headquarters: b.headquarters,
    productCount: b.products.length,
  }));
}

export function scoreLabel(score: number): "Excellent" | "Good" | "Fair" | "Concern" {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Concern";
}

export function scoreColors(score: number) {
  if (score >= 90) return { ring: "#0d9488", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" };
  if (score >= 70) return { ring: "#2563eb", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
  if (score >= 50) return { ring: "#d97706", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  return { ring: "#dc2626", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
}
