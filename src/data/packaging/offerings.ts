import type { SupplierOffering } from "./types";

/* Which supplier sells which variant, at what MOQ, price and terms.
   MOQ, price and lead time belong here, never on the supplier. Leave a field
   null or absent when it has not been confirmed: the site shows "to confirm". */
export const SUPPLIER_OFFERINGS: SupplierOffering[] = [];
