import type {
  BrandingOption, MaterialGroup, PackagingCatalogue, PackagingFamily, ProductUseId,
} from "@/data/packaging/types";
import { joinOfferings, type OfferingRow } from "@/lib/packaging-catalogue";

/* The founder's sourcing shortlist: what are you packaging, how many per SKU,
   which material, how much branding. Pure logic over the catalogue so the
   client filter and the tests share it.

   A supplier whose MOQ is not yet confirmed is never silently dropped and never
   presented as a match: it goes in its own "MOQ to confirm" group. */

export type QuantityBandId = "1-49" | "50-99" | "100-499" | "500-999" | "1000+";

export interface QuantityBand {
  id: QuantityBandId;
  label: string;
  min: number;
  /** null = open ended. */
  max: number | null;
}

export const QUANTITY_BANDS: QuantityBand[] = [
  { id: "1-49", label: "1 to 49 pieces", min: 1, max: 49 },
  { id: "50-99", label: "50 to 99 pieces", min: 50, max: 99 },
  { id: "100-499", label: "100 to 499 pieces", min: 100, max: 499 },
  { id: "500-999", label: "500 to 999 pieces", min: 500, max: 999 },
  { id: "1000+", label: "1,000 or more", min: 1000, max: null },
];

export interface ShortlistQuery {
  use: ProductUseId | null;
  band: QuantityBandId | null;
  material: MaterialGroup | null;
  branding: BrandingOption | null;
}

export const EMPTY_QUERY: ShortlistQuery = { use: null, band: null, material: null, branding: null };

/** How a supplier's MOQ sits against the founder's quantity.
    within  = MOQ is no more than the lowest quantity in the band
    stretch = MOQ is above the lowest quantity but still inside the band
    over    = MOQ is above the whole band (excluded from matches)
    confirm = MOQ not yet confirmed */
export type MoqFit = "within" | "stretch" | "over" | "confirm";

export function moqFit(moqPieces: number | null, band: QuantityBand | null): MoqFit {
  if (moqPieces === null) return "confirm";
  if (!band) return "within";
  if (moqPieces <= band.min) return "within";
  if (band.max === null || moqPieces <= band.max) return "stretch";
  return "over";
}

export interface ShortlistRow {
  row: OfferingRow;
  fit: Exclude<MoqFit, "over">;
}

export interface FamilyShortlist {
  family: PackagingFamily;
  matches: ShortlistRow[];
  toConfirm: ShortlistRow[];
  /** Offerings dropped because their MOQ is above the whole quantity band. */
  overQuantity: number;
}

export function familyMatchesQuery(family: PackagingFamily, query: ShortlistQuery): boolean {
  if (query.use && !family.appliesToAllProducts && !family.uses.includes(query.use)) return false;
  if (query.material && !family.materials.includes(query.material)) return false;
  return true;
}

export function buildShortlist(cat: PackagingCatalogue, query: ShortlistQuery): FamilyShortlist[] {
  const band = query.band ? QUANTITY_BANDS.find((b) => b.id === query.band) ?? null : null;
  const rows = joinOfferings(cat);

  const results: FamilyShortlist[] = cat.families
    .filter((f) => familyMatchesQuery(f, query))
    .map((family) => {
      const matches: ShortlistRow[] = [];
      const toConfirm: ShortlistRow[] = [];
      let overQuantity = 0;
      for (const row of rows) {
        if (row.product.familyId !== family.id) continue;
        if (query.material && row.product.material !== query.material) continue;
        if (query.branding && !row.offering.branding.includes(query.branding)) continue;
        const fit = moqFit(row.offering.moqPieces, band);
        if (fit === "over") overQuantity++;
        else if (fit === "confirm") toConfirm.push({ row, fit });
        else matches.push({ row, fit });
      }
      // Closest to the founder's quantity first.
      matches.sort((a, b) => (a.row.offering.moqPieces ?? 0) - (b.row.offering.moqPieces ?? 0));
      return { family, matches, toConfirm, overQuantity };
    });

  const weight = (r: FamilyShortlist) => r.matches.length * 2 + r.toConfirm.length;
  return results.sort((a, b) => weight(b) - weight(a) || a.family.order - b.family.order);
}
