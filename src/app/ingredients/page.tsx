import type { Metadata } from "next";
import ingredientsData from "@/data/ingredients.json";
import IngredientDirectory from "./IngredientDirectory";
import type { Ingredient } from "./IngredientDirectory";

export const metadata: Metadata = {
  title: "Ingredient Directory | The Clean Sheet™",
  description:
    "Search 500+ cosmetic ingredients. See TCS concern level, regulatory status across EU, India, US and Korea, allergen and CMR flags, and safety notes.",
};

export default function IngredientsPage() {
  return (
    <div>
      {/* Page header */}
      <div className="bg-ink-950 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-teal-400 text-xs font-normal uppercase tracking-widest mb-3">
              Ingredient Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight mb-4">
              What's in your skincare?
            </h1>
            <p className="text-teal-200/70 text-base leading-relaxed">
              {(ingredientsData as Ingredient[]).length.toLocaleString()} ingredients evaluated against EU, Indian, US and Korean regulations.
              Search by INCI name, CAS number, or function, then filter by concern level or flag type.
            </p>
          </div>
        </div>
      </div>

      <IngredientDirectory ingredients={ingredientsData as Ingredient[]} />
    </div>
  );
}
