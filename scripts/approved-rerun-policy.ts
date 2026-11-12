import type { ProductReview } from "@/lib/product-review-types";
import { brandKey, isSameProduct, titleIdentifiesProduct, sanitizeInciList } from "@/lib/product-identity";
import { isSourceBackedInci } from "@/lib/inci-source-backing";
import { isPrimaryIngredientUrl } from "@/lib/brand-inci";
import { listPlausibleFor } from "@/lib/inci-plausibility";

export interface RerunRow {
  product_slug: string; product_name: string; brand: string;
  reviewed_at: string | null; result: { type?: string; review?: ProductReview };
  rubric_rev: string | null; tier: string; image_url: string | null;
  [key: string]: unknown;
}

/** A re-run refreshes the ingredients and the rating, not the tile picture: the picture the page already shows stays (owner, 2026-11-04: "the earlier image was right";
    a Decoder photo found under the new name had replaced a Nykaa one). A new picture is used only where the page had none. Changes `fresh` in place. */
export function keepStoredImage(fresh: ProductReview, old: RerunRow): void {
  const before = old.result.review;
  const kept = before?.imageUrl || old.image_url;
  if (!kept) return;
  fresh.imageUrl = kept;
  if (before?.imageSource) fresh.imageSource = before.imageSource;
  if (before?.imageConfidence != null) fresh.imageConfidence = before.imageConfidence;
  if (before?.imageLocked) fresh.imageLocked = true;
}

export function newestFirst(rows: RerunRow[]): RerunRow[] {
  return [...rows].sort((a, b) => (Date.parse(b.reviewed_at ?? "") || 0) - (Date.parse(a.reviewed_at ?? "") || 0) || a.product_slug.localeCompare(b.product_slug));
}

export function rerunQuery(row: RerunRow): string {
  const review = row.result.review;
  const url = review?.productPageUrl;
  if (url && /^https:\/\//i.test(url)) return url;
  const brand = review?.brand ?? row.brand;
  const name = review?.productName ?? row.product_name;
  return name.toLowerCase().includes(brand.toLowerCase()) ? name : `${brand} ${name}`;
}

/** Validation happens before any production write; a changed score is allowed. */
export function validateReplacement(old: RerunRow, fresh: ProductReview, oldPill: string, newPill: string): string[] {
  const errors: string[] = [];
  const before = old.result.review;
  const oldName = before?.productName ?? old.product_name;
  const oldBrand = before?.brand ?? old.brand;
  if (!fresh.productName || /^(unknown|unidentified|n\/a)$/i.test(fresh.productName.trim())) errors.push("unidentified-product");
  if (brandKey(oldBrand) !== brandKey(fresh.brand)) errors.push("brand-changed");
  const a = { productName: oldName, brand: oldBrand, inci: before?.inciIngredients };
  const b = { productName: fresh.productName, brand: fresh.brand, inci: fresh.inciIngredients };
  let urlIdentity = "";
  try {
    urlIdentity = new URL(before?.productPageUrl ?? "").pathname.split("/").filter(Boolean)
      .filter(part => !/^(?:products?|p|dp|collections?|shop|[0-9]+)$/i.test(part))
      .sort((x, y) => y.length - x.length)[0]?.replace(/[-_]+/g, " ") ?? "";
  } catch { /* No saved product URL. */ }
  const sameUrlIdentity = !!urlIdentity && titleIdentifiesProduct(fresh.productName, fresh.brand, urlIdentity) && titleIdentifiesProduct(urlIdentity, fresh.brand, fresh.productName);
  const sameSource = !!before?.inciSourceUrl && before.inciSourceUrl === fresh.inciEvidence?.sourceUrl;
  // The brand's own catalogue identified the page the fresh list came from: the product now carries the brand's name for it (owner rule, 2026-11-12), so a new name is
  // expected, not a sign of another product.
  const brandCatalogue = fresh.inciEvidence?.identity === "brand-catalogue" && fresh.inciEvidence.origin === "brand-page";
  if (!brandCatalogue && !isSameProduct(a, b) && !sameUrlIdentity && !sameSource && !(titleIdentifiesProduct(fresh.productName, oldBrand, oldName) && titleIdentifiesProduct(oldName, fresh.brand, fresh.productName))) errors.push("product-identity-changed");
  const list = fresh.inciIngredients ?? [];
  if (!isSourceBackedInci(fresh, list)) errors.push("primary-ingredient-source-missing");
  const url = fresh.inciEvidence?.sourceUrl ?? "";
  if (!isPrimaryIngredientUrl(url, fresh.brand)) errors.push("ingredient-source-not-primary");
  if (!sanitizeInciList(list).ok) errors.push("invalid-ingredient-list");
  if (!listPlausibleFor(list, fresh.productName).ok) errors.push("implausible-ingredient-list"); // a water-based product whose list has no water is not its whole list
  const priorCount = before?.inciIngredients?.length ?? 0;
  // A shorter list from the brand's own page is the brand's word on what the product holds now (the stored one may be another source's older or other version): not held for its length.
  if (priorCount && before && isSourceBackedInci(before, before.inciIngredients ?? []) && list.length < Math.ceil(priorCount * 0.9) && fresh.inciEvidence?.origin !== "brand-page") errors.push("ingredient-list-shorter");
  if (!fresh.researchLog?.grounded) errors.push("web-search-missing");
  if (oldPill !== "not-enough-info" && newPill === "not-enough-info") errors.push("decision-lost");
  return errors;
}

/** Postgres returns +00:00 while JavaScript emits Z for the same instant. */
export function sameReviewTime(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return a === b;
  const left = Date.parse(a), right = Date.parse(b);
  return Number.isFinite(left) && Number.isFinite(right) && left === right;
}
