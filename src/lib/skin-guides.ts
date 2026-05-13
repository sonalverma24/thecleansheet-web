export type Routine = { step: number; action: string; detail: string };
export type IngredientTip = { category: string; items: string[] };
export type CauseItem = { label: string; items: string[] };

export type SkinGuide = {
  slug: string;
  title: string;
  skinType: string;
  tagline: string;
  silverLining: string;
  accentFrom: string;
  accentTo: string;
  causes: CauseItem[];
  habits: string[];
  mistakes: string[];
  ingredientSections: { heading: string; tips: string[] }[];
  morningRoutine: Routine[];
  nightRoutine: Routine[];
  checklist: string[];
};

export const SKIN_GUIDES: SkinGuide[] = [
  {
    slug: "oily-skin",
    title: "Oily Skin Care Guide",
    skinType: "Oily Skin",
    tagline: "Manage excess sebum, control shine, and build a minimal routine that keeps your skin balanced.",
    silverLining: "People with oily skin tend to age slower and look younger compared to those with dry skin because natural oils help maintain skin elasticity.",
    accentFrom: "from-teal-600",
    accentTo: "to-teal-800",
    causes: [
      {
        label: "Biological Causes",
        items: [
          "Biology: Larger sebaceous glands or a higher number of glands.",
          "Genetics: Predisposition inherited from parents.",
          "Hormones: Increases during specific phases of the menstrual cycle.",
          "Climate: Humidity and heat (summer/monsoon) increase oil production.",
        ],
      },
      {
        label: "Dietary Triggers",
        items: [
          "Sugar & High Glycemic Foods: Spikes insulin, leading to oil production.",
          "Dairy: Specifically straight milk, which can exacerbate acne.",
          "Processed Foods: Often high in salt and low in nutrients.",
        ],
      },
    ],
    habits: [
      "Clean Scalp: Oily scalp oils can trickle down, causing forehead acne. Wash regularly.",
      "Pillowcase Hygiene: Change every 2-3 days to avoid oil and bacteria buildup.",
      "Separate Face Towel: Use a soft, microfiber towel strictly for the face. Wash it every 1-2 days.",
      "Oil Control: Keep blotting papers handy for mid-day shine instead of rewashing.",
      "Clay Masks: Use Bentonite or Multani Mitti before events to tighten pores and reduce oil.",
    ],
    mistakes: [
      "Over-washing: Limit face wash to twice daily. Over-stripping causes rebound oiliness.",
      "Alcohol-based Toners: They provide instant dryness but irritate skin and trigger more oil.",
      "Physical Scrubs: Avoid gritty particles that abrade the skin. Opt for chemical exfoliants instead.",
      "Frequent Touching: Prevents the transfer of bacteria from hands to pores.",
      "Over-layering: Using too many products (essences, multiple serums) can occlude pores.",
    ],
    ingredientSections: [
      {
        heading: "Cleansers (Face Wash)",
        tips: [
          "Oily / Acne-Prone: Salicylic Acid",
          "Standard Oily: Glycolic Acid",
          "Oily / Sensitive: Mandelic Acid",
        ],
      },
      {
        heading: "Serums (Active Treatment)",
        tips: [
          "Oil Control: Niacinamide, Zinc PCA",
          "Pore Care: Salicylic Acid",
          "Soothing: Green Tea Extract",
        ],
      },
      {
        heading: "Moisturizers & Sunscreens",
        tips: [
          "Always choose Gel-based or Oil-free formulations. Avoid heavy occlusives.",
          "Moisturizer Ingredients: Hyaluronic Acid, Ceramide, Glycerin, Panthenol.",
          "Sunscreens: Hybrid or pure chemical sunscreens are better, they don't leave a heavy white cast.",
          "Special Note: If you have severe active acne, temporarily skip sunscreen to avoid over-layering.",
        ],
      },
    ],
    morningRoutine: [
      { step: 1, action: "Cleanser", detail: "Targeted face wash (Salicylic or Glycolic Acid)." },
      { step: 2, action: "Serum", detail: "Niacinamide or Green Tea to soothe and control oil." },
      { step: 3, action: "Sunscreen", detail: "SPF 30 indoors · SPF 50 outdoors or for pigmentation." },
    ],
    nightRoutine: [
      { step: 1, action: "Cleanser", detail: "Wash off the day's dirt and pollution." },
      { step: 2, action: "Serum", detail: "Active treatment, Retinoid or Acid-based serum." },
      { step: 3, action: "Moisturizer", detail: "Light gel-based formula to repair the skin." },
    ],
    checklist: [
      "Avoid sugar and milk to reduce internal oil triggers.",
      "Don't use face wash more than 2× a day.",
      "Stick to 3 steps in the morning and 3 steps at night.",
      "Prioritize gel formulations over creams.",
    ],
  },
  {
    slug: "dry-skin",
    title: "Dry Skin Care Guide",
    skinType: "Dry Skin",
    tagline: "Restore your moisture barrier, lock in hydration, and avoid the habits that strip your skin dry.",
    silverLining: "Dry skin tends to be less prone to acne and visible pores. With the right barrier-repair routine, it can maintain a naturally smooth, matte finish.",
    accentFrom: "from-teal-400",
    accentTo: "to-teal-600",
    causes: [
      {
        label: "Root Causes",
        items: [
          "Genetic Conditions: Atopic dermatitis or Ichthyosis.",
          "Barrier Damage: Deficiency in proteins and lipids on the skin's surface.",
          "Transepidermal Water Loss: Inability to retain moisture, leading to redness and itching.",
        ],
      },
      {
        label: "External Factors",
        items: [
          "Winter Climate: Lower humidity extracts moisture from the air.",
          "Hot Water: Strips natural oils more aggressively than cool water.",
          "Harsh Cleaning: Over-washing and physical tugging with towels.",
        ],
      },
    ],
    habits: [
      "Damp Skin Rule: Always apply moisturizer while the skin is still slightly damp to seal in hydration.",
      "The Morning Skip: If your skin is very dry, skip cleanser in the morning and wash with plain water only.",
      "Short Showers: Keep showers under 2 minutes, longer exposure to water dries the skin further.",
      "Night Baths: Showering at night removes dust and allergens that cause itching during sleep.",
      "Humidifier: Using one in winter helps maintain moisture levels, especially for those with dermatitis.",
    ],
    mistakes: [
      "Hot Water: Never wash your face or body with hot water, use lukewarm or room temperature water.",
      "Harsh Towel Use: Do not rub or pull at the skin. Gently pat dry with a soft towel.",
      "Multiple Products: Avoid skincare maximalism. A damaged barrier is easily irritated by too many actives.",
      "Over-exfoliating: Avoid strong AHAs/BHAs. If necessary, use a very mild lactic acid.",
      "Wool Sensitivity: Never let wool touch dry skin directly, always wear a cotton layer underneath.",
    ],
    ingredientSections: [
      {
        heading: "Cleansers & Serums",
        tips: [
          "Cleansers: Gentle, non-foaming formulas with Glycerin or Ceramides.",
          "Hydrating Serums: Niacinamide, Hyaluronic Acid, Panthenol, and Centella Asiatica.",
          "Brightening: Kojic Acid or Alpha Arbutin, must be mixed with moisturizers.",
        ],
      },
      {
        heading: "Heavy-Duty Hydration",
        tips: [
          "Sandwich Technique: Apply moisturizer, then your active (Retinol), then moisturizer again to prevent irritation.",
          "Slugging: Apply petroleum jelly over the eyes, nose, and mouth at night to lock in moisture.",
          "Hand/Foot Care: Use thicker creams containing Urea and Lactic Acid.",
        ],
      },
      {
        heading: "Moisturizers & Sunscreens",
        tips: [
          "Key Ingredients: Ceramides, Shea Butter, Cocoa Butter, Dimethicone, and Squalane.",
          "Body Care: Seal your body moisturizer with a layer of Coconut Oil for extra protection.",
          "Sunscreens: Creamy or lotion-based formulations, avoid gels that might be too drying.",
        ],
      },
    ],
    morningRoutine: [
      { step: 1, action: "Cleanse", detail: "Plain water, or a very gentle cleanser if needed." },
      { step: 2, action: "Serum", detail: "Hydrating serum, Hyaluronic Acid or Niacinamide." },
      { step: 3, action: "Sunscreen", detail: "Creamy SPF 30 or SPF 50." },
    ],
    nightRoutine: [
      { step: 1, action: "Cleanse", detail: "Gentle non-foaming cleanser or Cleansing Balm." },
      { step: 2, action: "Serum", detail: "Barrier-repairing serum." },
      { step: 3, action: "Moisturize", detail: "Thick cream, optionally sealed with petroleum jelly or oil." },
    ],
    checklist: [
      "Eat Omega-3 rich foods (flax seeds, chia seeds) to improve skin barrier from within.",
      "Always apply product on damp skin.",
      "Wear cotton socks over foot cream to heal cracked heels overnight.",
      "Patch test new products in the morning, never overnight.",
    ],
  },
  {
    slug: "combination-skin",
    title: "Combination Skin Care Guide",
    skinType: "Combination Skin",
    tagline: "Balance an oily T-zone and dry cheeks without compromising either area.",
    silverLining: "Combination skin gives you flexibility, you can use targeted treatments for different zones, which often leads to a more refined and balanced complexion over time.",
    accentFrom: "from-teal-500",
    accentTo: "to-teal-800",
    causes: [
      {
        label: "Typical Characteristics",
        items: [
          "Oily T-Zone: Prone to blackheads (especially on the nose) and whiteheads.",
          "Dry Cheeks: Can feel tight or flaky, especially in winter.",
          "Seasonal Shifts: Skin may feel oilier in summer and drier in winter.",
        ],
      },
      {
        label: "The Challenge",
        items: [
          "Oily skin products may make cheeks too dry.",
          "Dry skin products may make the T-zone too shiny and acne-prone.",
          "Requires 'titration', using different product types for different zones.",
        ],
      },
    ],
    habits: [
      "Zone Washing: Focus active cleansers on the oily T-zone first, leave for 30 seconds, then use the residue on cheeks before rinsing.",
      "Multi-Masking: Use clay masks (Multani Mitti) only on the T-zone and hydrating masks on the cheeks.",
      "Scalp Health: Wash your scalp at least 3× a week, scalp oil and dandruff often cause forehead and chin acne.",
      "Spot Treatment: Apply acne medication only to active spots, not the whole face.",
      "Pillow & Towel Care: Change pillowcases every 2-3 days and use a dedicated soft face towel.",
    ],
    mistakes: [
      "Over-washing: Limit face wash to twice daily, excessive washing triggers more oil production.",
      "Alcohol-based Toners: They offer a temporary matte look but eventually dehydrate the skin.",
      "Physical Scrubs: Avoid gritty scrubs that cause micro-tears and redness.",
      "Constant Touching: Bacteria cycle between your nails and pores, leading to more breakouts.",
      "Skincare Maximalism: Over-layering products clogs the oily zones.",
    ],
    ingredientSections: [
      {
        heading: "Cleansers & Serums",
        tips: [
          "Cleansers: Gentle formulas. For oily T-zones, use Mandelic or Lactic Acid based washes.",
          "Oil-Control Serums: Niacinamide or Zinc PCA regulate oil without severe drying.",
          "T-Zone Actives: Salicylic Acid, use primarily on the oily forehead and nose areas.",
        ],
      },
      {
        heading: "Moisturizers & Sunscreen",
        tips: [
          "The Hybrid Strategy: Gel-based moisturizer in the morning; creamy moisturizer at night.",
          "Application: Apply cream to cheeks first, then use the residue on fingers for the T-zone.",
          "Sunscreens: Oil-free, Gel-based sunscreens throughout the year for a lightweight feel.",
        ],
      },
      {
        heading: "Dietary Triggers",
        tips: [
          "Avoid high glycemic triggers, sugar, processed foods, and excessive dairy spike hormone levels (IGF-1), increasing oil and acne in the T-zone.",
        ],
      },
    ],
    morningRoutine: [
      { step: 1, action: "Cleanse", detail: "Gentle face wash, focus on the T-zone." },
      { step: 2, action: "Serum", detail: "Niacinamide or Zinc PCA." },
      { step: 3, action: "Sunscreen", detail: "Lightweight Gel-based SPF." },
    ],
    nightRoutine: [
      { step: 1, action: "Cleanse", detail: "Thorough wash to remove dirt and pollution." },
      { step: 2, action: "Serum", detail: "Treatment serum (if needed) or Niacinamide." },
      { step: 3, action: "Moisturize", detail: "Creamy moisturizer, focused on the cheeks." },
    ],
    checklist: [
      "Treat your T-zone and cheeks as two different skin types.",
      "Don't use face wash more than 2× a day.",
      "Use gel products for the day and creamier ones for the night.",
      "Avoid milk and sugar if you are prone to acne.",
      "Air-dry your face or pat very gently, never rub.",
    ],
  },
  {
    slug: "normal-skin",
    title: "Normal Skin Care Guide",
    skinType: "Normal Skin",
    tagline: "Maintain your skin's natural balance and protect it from premature ageing with a simple, consistent routine.",
    silverLining: "Normal skin is the most forgiving skin type, it responds well to a wide range of products and can achieve excellent long-term results with minimal effort.",
    accentFrom: "from-teal-300",
    accentTo: "to-teal-600",
    causes: [
      {
        label: "What Normal Skin Needs",
        items: [
          "Gentle Cleansing: Removing dirt and sunscreen without stripping.",
          "Hydration: Maintaining the natural glow and plumpness.",
          "Protection: Preventing UV damage and premature aging.",
        ],
      },
      {
        label: "Realistic Expectations",
        items: [
          "Achievable: Even skin tone, hydration, and slow aging.",
          "Not Achievable with Cream Alone: Deep acne scars, prominent open pores, hereditary dark circles.",
        ],
      },
    ],
    habits: [
      "Gentle Cleaning: Use non-foaming, creamy cleansers. Always dampen the face first with room-temperature water.",
      "The Coin Size Rule: Use a coin-sized amount of cleanser. Don't over-wash, twice a day is the limit.",
      "Sunscreen Re-application: Every 2 hours outdoors. Mostly indoors? Apply at 9-10 AM and again at 2-3 PM.",
      "Sleep & Diet: Skincare won't work effectively without 7-8 hours of sleep, regular exercise, and a balanced diet.",
      "Skip Morning Wash: If your skin feels balanced or slightly dry, skip cleanser in the morning and use water only.",
    ],
    mistakes: [
      "Starting with Serums: Never jump to serums before fixing your Cleanser-Moisturizer-Sunscreen pillars.",
      "Using Warm Water: Warm or hot water strips essential lipids even from normal skin.",
      "Skincare Overload: Using 10+ products is unnecessary. 3-4 well-chosen products are sufficient.",
      "Harsh Home Remedies: Avoid scrubbing your face with kitchen ingredients like lemon or gritty sugars.",
      "Giving Up Early: Real changes take at least 2 months. Peak results often take 3-4 months.",
    ],
    ingredientSections: [
      {
        heading: "Morning Actives",
        tips: [
          "Vitamin C: For brightness and antioxidant protection.",
          "Niacinamide: A multi-tasker for skin tone and texture.",
          "Hyaluronic Acid: To keep skin hydrated and plump.",
        ],
      },
      {
        heading: "Night Repairs",
        tips: [
          "Ceramides: To repair the skin barrier overnight.",
          "Retinol (30+): To increase cell turnover and reduce fine lines.",
          "Panthenol / Centella: To soothe any daily irritation.",
        ],
      },
      {
        heading: "Sunscreen Checklist",
        tips: [
          "SPF 30+: Minimum for daily use. SPF 50 for heavy sun exposure.",
          "PA Value: Look for PA+++ or PA++++ for high UVA protection.",
          "Tinted Formulas: Good for light makeup-like coverage and blue light protection.",
        ],
      },
    ],
    morningRoutine: [
      { step: 1, action: "Cleanse", detail: "Gentle non-foaming face wash." },
      { step: 2, action: "Serum", detail: "Vitamin C or Niacinamide (if staying indoors)." },
      { step: 3, action: "Moisturize", detail: "Light lotion or cream." },
      { step: 4, action: "Sunscreen", detail: "Essential final step, SPF 30 minimum." },
    ],
    nightRoutine: [
      { step: 1, action: "Cleanse", detail: "Thorough wash to remove daily pollution." },
      { step: 2, action: "Serum", detail: "Retinol (if 30+) or a hydrating serum." },
      { step: 3, action: "Moisturize", detail: "Barrier-repair cream with Ceramides." },
    ],
    checklist: [
      "Fix your Cleanser-Moisturizer-Sunscreen pillars first.",
      "Consistency is the most important ingredient.",
      "Use room temperature water for washing.",
      "Prioritize sleep and hydration as part of your beauty routine.",
    ],
  },
];

export function getGuideBySlug(slug: string): SkinGuide | undefined {
  return SKIN_GUIDES.find((g) => g.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return SKIN_GUIDES.map((g) => g.slug);
}
