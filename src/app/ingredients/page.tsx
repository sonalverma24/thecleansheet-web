import type { Metadata } from "next";
import IngredientDirectory from "./IngredientDirectory";
import BackButton from "@/components/BackButton";
import { getDirectoryIngredients } from "@/lib/ingredient-directory";

// The directory merges the curated core with ingredients discovered from every
// scanned product, so it must render server-side against the live table.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Cosmetic Ingredient Directory, 25,000+ Ingredients",
  description:
    "Search 25,000+ cosmetic ingredients. Get safety ratings, regulatory status across India, EU, US and Korea, allergen and CMR flags, all backed by science. Free to use.",
  keywords: [
    "cosmetic ingredient list", "INCI ingredient safety", "parabens in skincare India",
    "is niacinamide safe", "fragrance allergy ingredients", "CMR cosmetic ingredients",
    "EU cosmetics regulation India", "ingredient checker", "skin-safe ingredients",
  ],
  alternates: { canonical: "https://thecleansheet.in/ingredients" },
  openGraph: {
    title: "Cosmetic Ingredient Directory, 25,000+ Ingredients | The Clean Sheet™",
    description:
      "Check safety, regulatory status, and allergen flags for any cosmetic ingredient. India's most comprehensive ingredient database.",
    url: "https://thecleansheet.in/ingredients",
    type: "website",
  },
};

const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "The Clean Sheet Cosmetic Ingredient Directory",
  description:
    "A comprehensive database of cosmetic ingredients with safety ratings (TCS Concern Level), regulatory status across India, EU, US, and Korea, allergen flags, CMR classifications, and concentration limits.",
  url: "https://thecleansheet.in/ingredients",
  creator: {
    "@type": "Organization",
    name: "The Clean Sheet",
    url: "https://thecleansheet.in",
  },
  license: "https://thecleansheet.in/terms-of-use",
  keywords: [
    "cosmetic ingredients", "INCI names", "ingredient safety", "regulatory compliance",
    "India cosmetics", "EU cosmetics regulation", "allergen flags", "CMR ingredients",
  ],
  spatialCoverage: ["India", "EU", "US", "Korea"],
  variableMeasured: [
    "Concern Level", "EU Status", "India Status", "US FDA Status",
    "Allergen Flag", "CMR Flag", "Endocrine Flag", "Max Concentration",
  ],
};

export default async function IngredientsPage() {
  const ingredients = await getDirectoryIngredients();
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />

      {/* Page header */}
      <div className="bg-ink-950 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="max-w-2xl">
            <div className="text-teal-400 text-xs font-normal uppercase tracking-widest mb-3">
              Ingredient Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight mb-4">
              What&apos;s in your skincare?
            </h1>
            <p className="text-teal-200/70 text-base leading-relaxed">
              {ingredients.length.toLocaleString()} ingredients evaluated against EU, Indian, US and Korean regulations.
              Search by INCI name, CAS number, or function, then filter by concern level or flag type. Click any ingredient to see the full safety profile.
            </p>
          </div>
        </div>
      </div>

      <IngredientDirectory ingredients={ingredients} />
    </div>
  );
}
