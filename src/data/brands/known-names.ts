/* Brand names a search can consist of, for src/lib/specific-product.ts.

   The hand-written catalogue in ./index.ts is empty (removed 2026-10-28), so on its own it names no brand. The brands we hold analyses of come from the database
   (src/lib/brand-catalogue.ts). This is the short list that stands behind both: widely sold brands in India, so that a search for just one of them ("CeraVe") is
   caught even when the database cannot be read or holds nothing of that brand yet. It is a list of names only: nothing here is shown to a shopper, rated, or listed.
   Add a brand when a search for it alone is not asked about. A brand missing here is still caught once it has an analysis, or when the model returns it. */

export const KNOWN_BRAND_NAMES: readonly string[] = [
  "Aveeno", "Avène", "Beardo", "Bella Vita", "Bioderma", "Biotique", "Bombay Shaving Company", "CeraVe", "Cetaphil", "Clean & Clear", "Clinique", "COSRX", "Dove",
  "Dr Sheth's", "Earth Rhythm", "Estée Lauder", "Eucerin", "Fixderma", "Forest Essentials", "Garnier", "Himalaya", "Innisfree", "Jovees", "Juicy Chemistry",
  "Kama Ayurveda", "Khadi Natural", "Kiehl's", "La Roche-Posay", "Lakmé", "Laneige", "L'Oréal Paris", "Lotus Herbals", "Mamaearth", "Maybelline", "mCaffeine", "Minimalist",
  "Neutrogena", "Nivea", "Olay", "Paula's Choice", "Patanjali", "Pond's", "Re'equil", "Sebamed", "Suganda", "The Man Company", "The Ordinary",
  "Vaseline", "VLCC", "WOW Skin Science",
];
