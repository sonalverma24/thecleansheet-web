/**
 * Canonical pillar display names.
 *
 * One source of truth so the radar dots, the score breakdown, and the
 * analyzed-page all label the same pillar identically. Previously each surface
 * carried its own mapper and they disagreed (e.g. a pillar shown as
 * "Transparency" in the radar but "Ingredient Safety" in the breakdown).
 */
export function simplifyPillarName(name: string): string {
  const n = name.toLowerCase();
  // New 5-pillar names
  if (n.includes("inci safety") || n.includes("public inci")) return "Ingredient Safety";
  if (n.includes("formula logic") || n.includes("formula inference")) return "Formula Logic";
  if (n.includes("claim support") || n.includes("public claim")) return "Claims Evidence";
  if (n.includes("test result") || n.includes("transparency")) return "Test Transparency";
  if (n.includes("consumer clarity") || n.includes("clarity")) return "Consumer Clarity";
  // Legacy 4-pillar names
  if (n.includes("ingredient") || n.includes("safety") || n.includes("toxicity")) return "Ingredient Safety";
  if (n.includes("formula") || n.includes("formulation") || n.includes("quality")) return "Formula Design";
  if (n.includes("claims") || n.includes("disclosure")) return "Claims Evidence";
  if (n.includes("ethics") || n.includes("sustain")) return "Ethics";
  return name;
}
