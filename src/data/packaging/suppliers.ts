import type { Supplier } from "./types";

/* Real suppliers only. Add a record here once the company has agreed to be
   listed or is listed from public information we have recorded a source for.
   Never add placeholder or illustrative companies: a listing implies a real
   company, and every field must be something we actually know.

   Example shape (do not copy values):
   {
     id: "sup-001", slug: "example-packaging", name: "Example Packaging Pvt Ltd",
     businessType: "manufacturer", city: "Mumbai", state: "Maharashtra",
     credentials: [], listedOn: "2026-10-15",
   } */
export const SUPPLIERS: Supplier[] = [];
