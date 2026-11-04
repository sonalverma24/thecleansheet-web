/** Ingredient lists typed in by the owner from a product's own pack, or from the pack photo shown on the brand's own page, for products whose brand
 *  and INKEE Decoder print no list we can read as text (Humuss's sunscreen shows three key-ingredient icons and its gallery has no ingredient panel; the only composition on the page is a manufacturer's safety data sheet of raw-material trade names, which is not an INCI list, so the list has to come from the pack itself).
 *
 *  This is a decision, so it lives in the repository and not in the database: every entry is a reviewed change with its date and where the list was read,
 *  and the frozen re-run runner, whose child process cannot reach the database, reads exactly the same entries as the live site.
 *
 *  An entry is used only when no primary source (Decoder, the brand's page, Nykaa) gave a list for the product. It is matched on the brand and an exact,
 *  order-insensitive product name: never by containment, so a variant (another shade, size or SPF) never borrows another product's list. Each entry
 *  is checked by `checkOwnerSupplied` in the tests, so a malformed one fails CI rather than publishing.
 *
 *  Never add a list from memory, a retailer listing, or a model. Copy it letter for letter from the pack or the pack photo.
 *
 *  An entry looks like:
 *    {
 *      brands: ["Humuss Beauty", "Humuss"],
 *      productNames: ["Sun-sational - SPF 50 Hyaluronic Acid Sunscreen", "<the retailer title the shopper searched, if different>"],
 *      sourceUrl: "https://humussbeauty.com/products/sun-sational-spf-50-sunscreen",
 *      quote: "Aqua, ...",             // the list exactly as printed, commas and all
 *      suppliedOn: "2026-11-01",
 *      note: "Back-of-pack photo sent by the owner, 2026-11-01",
 *    }
 */
import type { OwnerSuppliedEntry } from "@/lib/owner-supplied-inci";

export const OWNER_SUPPLIED_INCI: OwnerSuppliedEntry[] = [
  {
    brands: ["Biotique"],
    productNames: ["Biotique Morning Nectar Nourish & Hydrate Moisturizer"],
    sourceUrl: "https://www.biotique.com/products/morning-nectar-nourish-hydrate-moisturizer",
    quote: "Aloe Barbadensis Leaf Juice (Ghritkumari), Trigonella Foenum-Graecum Seed Extract (Methi), Honey (Madhu), Triticum Vulgare Germ Extract (Ankurit Gehun / Wheatgerm), Carthamus Tinctorius Extract (Kusumbhi), Prunus Amygdalus Dulcis Oil (Almond Oil), Arachis Hypogaea Oil (Peanut Oil), Aloe Barbadensis Leaf, Azadirachta Indica Leaf Extract (Neem Leaves), Curcuma Longa Root Powder (Wild Turmeric), Withania Somnifera Root Extract (Ashwagandha), Zingiber Officinale Root Extract (Ginger), Laminaria Digitata Extract (Seaweed), Lotion Base (q.s.)",
    suppliedOn: "2026-11-04",
    note: "Pasted by the owner in chat on 2026-11-04 as the product's ingredient list, in Biotique's own label style (Ayurvedic names in brackets); the source was not stated, and it was not read from a pack photo. Biotique's page for the product shows only three hero ingredients (Morning Nectar, Honey, Ashwagandha), so the page neither confirms nor contradicts it. Bullets were joined with commas; no word was changed.",
  },
];
