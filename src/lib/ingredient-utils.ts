import ingredientsData from "@/data/ingredients.json";

export type Ingredient = {
  INCI_Name: string;
  CAS_Number: string;
  EC_Number: string;
  Chemical_Name: string;
  Function: string;
  Category_Code: string;
  Category_Name: string;
  Ingredient_Origin: string;
  Concern_Level_TCS: string;
  EU_Status: string;
  EU_Annex: string;
  India_Status: string;
  US_FDA_Status: string;
  Korea_Status: string;
  Australia_TGA_Status?: string;
  Canada_NHPID_Status?: string;
  Vegan: string;
  Natural_ISO16128: string;
  SVHC_Flag: string;
  CMR_Flag: string;
  IARC_Group?: string;
  Allergen_Flag: string;
  Endocrine_Flag: string;
  Max_Concentration_EU: string;
  Max_Concentration_India: string;
  Max_Concentration_US?: string;
  Max_Concentration_Korea?: string;
  Format_Restriction: string;
  Baby_Restriction: string;
  Pregnancy_Restriction?: string;
  IFRA_Restriction?: string;
  Common_Products: string;
  Key_Safety_Notes: string;
  TCS_Evaluator_Flag: string;
  Data_Confidence?: string;
  Verification_Notes?: string;
  Source_Reference: string;
  Last_Updated: string;
};

export const ALL_INGREDIENTS: Ingredient[] = ingredientsData as Ingredient[];

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function getIngredientBySlug(slug: string): Ingredient | undefined {
  return ALL_INGREDIENTS.find((i) => toSlug(i.INCI_Name) === slug);
}

export function getAllIngredientSlugs(): string[] {
  return ALL_INGREDIENTS.map((i) => toSlug(i.INCI_Name));
}

export function concernColor(level: string): { badge: string; dot: string; label: string } {
  switch (level?.toLowerCase()) {
    case "low":
      return { badge: "bg-green-100 text-green-800 border-green-200", dot: "bg-green-500", label: "Low Concern" };
    case "medium":
      return { badge: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500", label: "Medium Concern" };
    case "high":
      return { badge: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-500", label: "High Concern" };
    default:
      return { badge: "bg-ink-100 text-ink-700 border-ink-200", dot: "bg-ink-400", label: level || "Unknown" };
  }
}

export function statusBadge(status: string): string {
  const s = status?.toLowerCase();
  if (s === "permitted" || s === "approved") return "bg-green-100 text-green-800";
  if (s === "banned" || s === "prohibited" || s === "restricted") return "bg-red-100 text-red-800";
  if (s === "restricted" || s?.includes("limit")) return "bg-amber-100 text-amber-800";
  return "bg-ink-100 text-ink-700";
}
