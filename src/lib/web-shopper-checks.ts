/**
 * Deterministic shopper checks over a captured product page.
 *
 * These checks are separate from certification and from the three-dot product
 * outcome. Positive findings are anchored to captured page text; ingredient
 * findings require a quoted, source-backed list. Missing wording is reported as
 * a page-text observation only when the capture was not clipped.
 */

export type ProductPageCheckKind = "caution" | "page-note";

export interface ProductPageCheck {
  code:
    | "pregnancy-retinol"
    | "pregnancy-oxybenzone"
    | "baby-age-ingredient"
    | "retinol-pregnancy-warning"
    | "retinoid-co-use-warning"
    | "aha-sun-warning"
    | "sunscreen-reapplication"
    | "baby-age-range";
  kind: ProductPageCheckKind;
  message: string;
  sourceUrl: string;
  capturedAt: string;
  sourceQuote: string;
}

export interface BuildProductPageChecksInput {
  pageText: string;
  pageTitle: string;
  productCategory: string;
  sourceUrl: string;
  capturedAt: string;
  completeCapture: boolean;
  ingredients: string[];
  reliableIngredientList: boolean;
}

type Match = { text: string; quote: string };

const SIGNALS = {
  pregnancyUse: /\b(?:for use during pregnancy|designed for (?:use )?during pregnancy|suitable for (?:use )?during pregnancy|safe for (?:use during )?pregnancy|pregnancy[- ]safe|for pregnant (?:women|people|individuals))\b/i,
  retinolPregnancyWarning: /\b(?:not recommended for use during pregnancy|not for use during pregnancy|avoid (?:use )?during pregnancy|do not use during pregnancy)\b/i,
  retinoidCoUseWarning: /\b(?:avoid|do not|should not)\s+(?:the\s+)?(?:simultaneous|concurrent|combined)\s+use\s+of\s+(?:other\s+)?retinoids?\b|\bavoid using (?:this|the product) with other retinoids?\b/i,
  ahaSunWarning: /\b(?:increased|increases?) sun sensitivity\b|\buse (?:a )?sun ?protection\b|\bapply sunscreen while using\b/i,
  sunscreenReapplication: /\breapply\b.{0,80}\b(?:every\s+(?:\d+|two|three|four)\s+hours?|after swimming|after sweating|after towelling|after towel drying)\b|\breapply sunscreen\b/i,
  under36: /\b(?:0\s*(?:[-–]|to)\s*(?:36\s*months?|3\s+years?)|under\s+(?:36\s+months?|3\s+years?(?:\s+old)?)|from\s+birth|newborn)\b/i,
  anyAgeRange: /\b(?:0\s*(?:[-–]|to)\s*(?:\d+\s*months?|\d+\s+years?)|under\s+\d+\s*(?:months?|years?)(?:\s+old)?|from\s+birth|newborn|from\s+\d+\s+months?|ages?\s+\d+\s*(?:\+|and up|plus))\b/i,
};

const BABY_PRODUCT = /\b(?:baby|babies|infant|newborn)\b/i;
const SUNSCREEN_PRODUCT = /\b(?:sunscreen|sun ?screen|sunblock|sun ?block|spf\s*\d*)\b/i;
const RINSE_OFF_PRODUCT = /\b(?:cleanser|face wash|body wash|shampoo|soap|rinse[- ]off)\b/i;
const FACE_LEAVE_ON_PRODUCT = /\b(?:face|facial)\b/i;
const RETINOIDS = /\b(?:retinol|retinaldehyde|retinyl\s+[a-z-]+)\b/i;
const BABY_RESTRICTIONS: { name: RegExp; leaveOnOnly?: boolean }[] = [
  { name: /\bretinol\b/i },
  { name: /\b(?:oxybenzone|benzophenone[- ]?3)\b/i },
  { name: /\b(?:methyl|ethyl|propyl|butyl)paraben\b/i },
  { name: /\bmethylisothiazolinone\b/i },
  { name: /\bformaldehyde\b/i, leaveOnOnly: true },
  { name: /\b(?:dmdm hydantoin|quaternium[- ]?15|imidazolidinyl urea|diazolidinyl urea|bronopol|sodium hydroxymethylglycinate|5-bromo-5-nitro-1,3-dioxane|paraformaldehyde|methenamine|glyoxal)\b/i, leaveOnOnly: true },
];
const AHA_NAMES = ["Glycolic Acid", "Lactic Acid", "Mandelic Acid", "Malic Acid", "Tartaric Acid", "Citric Acid"] as const;

function findMatch(text: string, pattern: RegExp, skipNegated = false): Match | null {
  const re = new RegExp(pattern.source, pattern.flags.replace("g", ""));
  for (const match of text.matchAll(new RegExp(re.source, `${re.flags}g`))) {
    const start = match.index ?? 0;
    const prefix = text.slice(Math.max(0, start - 40), start);
    if (skipNegated && /\b(?:not|never|isn't|is not|not marketed as|not described as)\s*$/i.test(prefix)) continue;
    const end = start + match[0].length;
    const quote = text.slice(Math.max(0, start - 55), Math.min(text.length, end + 75)).replace(/\s+/g, " ").trim();
    return { text: match[0], quote };
  }
  return null;
}

function hasIngredient(ingredients: string[], pattern: RegExp): string | undefined {
  return ingredients.find((name) => pattern.test(name));
}

function ahaAtThreePercentOrMore(title: string): string | undefined {
  for (const acid of AHA_NAMES) {
    const escaped = acid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    const near = new RegExp(`${escaped}[^%\\d]{0,30}(\\d{1,2}(?:\\.\\d+)?)\\s*%`, "i");
    const before = new RegExp(`(\\d{1,2}(?:\\.\\d+)?)\\s*%[^%]{0,30}${escaped}`, "i");
    const match = title.match(near) ?? title.match(before);
    if (match && Number(match[1]) >= 3) return acid;
  }
  return undefined;
}

export function buildProductPageChecks(input: BuildProductPageChecksInput): ProductPageCheck[] {
  const { pageText, pageTitle, productCategory, sourceUrl, capturedAt, completeCapture, ingredients } = input;
  if (!pageText.trim() || !/^https?:\/\//i.test(sourceUrl)) return [];
  const checks: ProductPageCheck[] = [];
  const title = `${pageTitle} ${productCategory}`;
  const babyProduct = BABY_PRODUCT.test(`${pageTitle} ${pageText.slice(0, 1200)}`);
  const ageMatch = findMatch(pageText, SIGNALS.under36);
  const pregnancyClaim = findMatch(pageText, SIGNALS.pregnancyUse, true);
  const retinol = input.reliableIngredientList ? hasIngredient(ingredients, /\bretinol\b/i) : undefined;
  const oxybenzone = input.reliableIngredientList ? hasIngredient(ingredients, /\b(?:oxybenzone|benzophenone[- ]?3)\b/i) : undefined;

  const add = (check: Omit<ProductPageCheck, "sourceUrl" | "capturedAt">) => {
    checks.push({ ...check, sourceUrl, capturedAt });
  };

  if (pregnancyClaim && retinol) {
    add({ code: "pregnancy-retinol", kind: "caution", message: "The product page promotes use during pregnancy, and Retinol appears on the source-backed ingredient list. The page text alone cannot establish pregnancy safety.", sourceQuote: pregnancyClaim.quote });
  }
  if (pregnancyClaim && oxybenzone && FACE_LEAVE_ON_PRODUCT.test(title) && !RINSE_OFF_PRODUCT.test(title)) {
    add({ code: "pregnancy-oxybenzone", kind: "caution", message: "The product page promotes use during pregnancy, and Oxybenzone appears on the source-backed ingredient list. The page text alone cannot establish pregnancy safety.", sourceQuote: pregnancyClaim.quote });
  }

  if (ageMatch && input.reliableIngredientList) {
    for (const restriction of BABY_RESTRICTIONS) {
      const titleIndicatesLeaveOn = /\b(?:lotion|cream|oil|wipes|leave[- ]?on|moisturi[sz]er)\b/i.test(title) && !RINSE_OFF_PRODUCT.test(title);
      if (restriction.leaveOnOnly && !titleIndicatesLeaveOn) continue;
      const ingredient = hasIngredient(ingredients, restriction.name);
      if (!ingredient) continue;
      add({ code: "baby-age-ingredient", kind: "caution", message: `The page states an intended age under 36 months, and ${ingredient} appears on the source-backed ingredient list. This is a shopper caution based on those captured details.`, sourceQuote: ageMatch.quote });
    }
  }

  if (!completeCapture) return checks;
  const identityQuote = pageTitle.trim() || pageText.slice(0, 130).replace(/\s+/g, " ").trim();
  if (input.reliableIngredientList && retinol && !findMatch(pageText, SIGNALS.retinolPregnancyWarning)) {
    add({ code: "retinol-pregnancy-warning", kind: "page-note", message: "The pregnancy warning for Retinol was not found in the captured product-page text. Check the full product page and packaging.", sourceQuote: identityQuote });
  }
  if (input.reliableIngredientList && RETINOIDS.test(ingredients.join(" · ")) && !findMatch(pageText, SIGNALS.retinoidCoUseWarning)) {
    add({ code: "retinoid-co-use-warning", kind: "page-note", message: "A warning against combining retinoid products was not found in the captured product-page text. Check the full product page and packaging.", sourceQuote: identityQuote });
  }
  const aha = input.reliableIngredientList && !RINSE_OFF_PRODUCT.test(title) ? ahaAtThreePercentOrMore(pageTitle) : undefined;
  if (aha && !findMatch(pageText, SIGNALS.ahaSunWarning)) {
    add({ code: "aha-sun-warning", kind: "page-note", message: `${aha} is stated at 3% or more in the product title, but a sun-sensitivity warning was not found in the captured page text.`, sourceQuote: identityQuote });
  }
  if (SUNSCREEN_PRODUCT.test(pageTitle) && !findMatch(pageText, SIGNALS.sunscreenReapplication)) {
    add({ code: "sunscreen-reapplication", kind: "page-note", message: "Sunscreen reapplication directions were not found in the captured product-page text. Check the full product page and packaging.", sourceQuote: identityQuote });
  }
  if (babyProduct && !SIGNALS.anyAgeRange.test(pageText)) {
    add({ code: "baby-age-range", kind: "page-note", message: "An intended age range was not found in the captured text for this baby product. Check the full product page and packaging.", sourceQuote: identityQuote });
  }
  return checks;
}
