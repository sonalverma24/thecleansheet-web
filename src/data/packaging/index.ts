import type { PackagingCatalogue } from "./types";
import { PACKAGING_FAMILIES } from "./families";
import { SUPPLIERS } from "./suppliers";
import { PACKAGING_PRODUCTS } from "./products";
import { SUPPLIER_OFFERINGS } from "./offerings";
import { VERIFICATION_RECORDS } from "./verifications";

export const PACKAGING_CATALOGUE: PackagingCatalogue = {
  families: PACKAGING_FAMILIES,
  suppliers: SUPPLIERS,
  products: PACKAGING_PRODUCTS,
  offerings: SUPPLIER_OFFERINGS,
  verifications: VERIFICATION_RECORDS,
};
