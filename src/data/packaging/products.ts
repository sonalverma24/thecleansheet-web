import type { PackagingProduct } from "./types";

/* One record per specific variant: a combination of capacity, material,
   container style and closure. A supplier offering three sizes of a bottle
   contributes three variants. Variants are shared across suppliers when the
   specification is genuinely the same; otherwise keep them separate. */
export const PACKAGING_PRODUCTS: PackagingProduct[] = [];
