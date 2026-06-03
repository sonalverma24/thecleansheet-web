/**
 * Product taxonomy used for filter categories and product-type classification.
 *
 * `category`    → top-level group (Baby, Hair, Skin, Sunscreens, …)
 * `subCategory` → specific product type within that group (Serum, Moisturizer, …)
 *
 * "Serum" is added under Skin — it is the most common Indian skincare product
 * type but absent from the original EWG/Cosmetics DB list.
 */
export const PRODUCT_TAXONOMY: Record<string, string[]> = {
  Baby: [
    "Baby Bubble Bath",
    "Baby Body Spray",
    "Diaper Cream",
    "Baby Lotion",
    "Baby Oil",
    "Baby Shampoo",
    "Baby Soap",
    "Baby Toothpaste",
    "Baby Wipes",
  ],
  Hair: [
    "Conditioner",
    "Detangler",
    "Hair Gel",
    "Hair Color",
    "Hair Spray",
    "Hair Removal Wax",
    "Hair Mousse",
    "Shampoo",
  ],
  Makeup: [
    "BB/CC Cream",
    "Blush",
    "Bronzer/Highlighter",
    "Body Art",
    "Brow Liner",
    "Concealer",
    "Eyeliner",
    "Eye Shadow",
    "Facial Powder",
    "Foundation",
    "Glitter (cosmetic)",
    "Lip Balm",
    "Lip Balm with SPF",
    "Lip Gloss",
    "Lip Liner",
    "Lip Plumper",
    "Lipstick",
    "Mascara",
    "Makeup Remover",
    "Makeup Remover Wipes",
  ],
  Nail: [
    "Cuticle Products",
    "Nail Polish",
    "Nail Polish Remover",
    "Nail Products (General)",
  ],
  Skin: [
    "Aftershave",
    "After-sun Products",
    "Antiperspirants & Deodorants",
    "Anti-aging Products",
    "Around-eye Creams",
    "Bath Oils/Salts/Soaks",
    "Body-cleansing Wipes",
    "Body-firming Lotion",
    "Body Powder",
    "Body Oil",
    "Body Wash/Cleanser",
    "Bubble Bath",
    "Callus Products",
    "Exfoliant/Scrub",
    "Facial Cleanser",
    "Facial-cleansing Wipes",
    "Facial Moisturizer",
    "Foot Cleanser",
    "Hand Cream",
    "Hand Sanitizer",
    "Liquid & Bar Soaps",
    "Lotion",
    "Masks",
    "Moisturizer",
    "Moisturizer with SPF",
    "Oil Controller",
    "Redness Products",
    "Scar Products",
    "Serum",
    "Shaving Cream",
    "Toner/Astringent",
  ],
  "Oral Care": [
    "Breath Freshener",
    "Mouthwash",
    "Toothpaste",
  ],
  "OTC (Eczema)": [
    "OTC Eczema Topicals",
  ],
  Other: [
    "Body Spray",
    "Foot Odor Control",
    "Fragrance (Perfume/EDT/EDP)",
    "Muscle/Joint Rub",
    "Vapor Rub",
  ],
  Sunscreens: [
    "Baby/Kids Sunscreens",
    "Recreational Sunscreens",
  ],
};

/** Ordered list of all top-level categories. */
export const PRODUCT_CATEGORIES = Object.keys(PRODUCT_TAXONOMY);

/** Flat list of every product type across all categories. */
export const ALL_PRODUCT_TYPES = Object.values(PRODUCT_TAXONOMY).flat();

/** Given a subCategory value, return its parent category (or null). */
export function getCategoryForType(subCategory: string): string | null {
  for (const [cat, types] of Object.entries(PRODUCT_TAXONOMY)) {
    if (types.includes(subCategory)) return cat;
  }
  return null;
}
