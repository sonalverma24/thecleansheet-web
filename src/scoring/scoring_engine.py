"""
The Clean Sheet - Scoring Engine v2
Calculates certification scores based on the 4-pillar evaluation framework,
with INCI hierarchy-based claim validation.

Regulatory basis:
  - EU Cosmetics Regulation 1223/2009 (and all amendments)
  - SCCS Notes of Guidance, 12th revision (SCCS/1647/22, December 2023)
  - EU Regulation 2022/1176 (UV filter concentration limits)
  - EU Regulation 2023/1545 (expanded fragrance allergen declaration list)
  - ISO 11930:2019+A1:2022 (preservative efficacy / challenge test)
  - ISO 29621 (microbiological risk assessment via water activity)

INCI Hierarchy basis:
  - EU Cosmetics Regulation 1223/2009, Article 19(1)(g): ingredients listed in
    descending order of weight at time of incorporation, except ingredients below
    1% may be listed in any order after those above 1%.
  - The "1% anchor" method uses known preservative concentration ranges to
    identify the approximate 1% threshold position. Ingredients appearing before
    the first recognised preservative are inferred to be above 1%. Ingredients
    appearing after are inferred to be below 1%.
  - Claim validity is assessed by comparing brand-stated concentrations and hero
    active INCI positions against the anchor and known functional minimums.

Pillar weights (total = 100):
  Pillar 1 - Safety & Toxicity          50 pts
  Pillar 2 - Formulation Quality        20 pts
  Pillar 3 - Claims & Transparency      20 pts
  Pillar 4 - Ethics & Sustainability    10 pts

Certification tiers:
  90-100  Clean Sheet Gold      (consumer label: Excellent)
  75-89   Clean Sheet Silver    (consumer label: Good)
  60-74   Clean Sheet Certified (consumer label: Fair)
  <60     Not Certified         (consumer label: Concern)

Usage:
    from scoring_engine import CleanSheetScorer, INCIHierarchyAnalyzer
    scorer = CleanSheetScorer()
    analyzer = INCIHierarchyAnalyzer()
    result = scorer.calculate(evaluation_data)
    print(scorer.format_report(result))
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class CertificationTier(str, Enum):
    GOLD      = "Clean Sheet Gold"       # 90-100  (consumer: Excellent)
    SILVER    = "Clean Sheet Silver"     # 75-89   (consumer: Good)
    CERTIFIED = "Clean Sheet Certified"  # 60-74   (consumer: Fair)
    FAIL      = "Not Certified"          # <60     (consumer: Concern)


class Layer1Result(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"


class ProductType(str, Enum):
    LEAVE_ON  = "leave-on"
    RINSE_OFF = "rinse-off"
    SUNSCREEN = "sunscreen"
    TREATMENT = "treatment"   # weekly peels, masks


class ClaimValidity(str, Enum):
    """
    Outcome of INCI-hierarchy-based claim validation for a specific ingredient.

    CONFIRMED:    Brand-stated concentration is consistent with INCI position
                  (ingredient above the 1% anchor, claimed % plausible).
    PLAUSIBLE:    No concentration claimed, but INCI position is above the 1%
                  anchor, indicating a functionally relevant amount.
    DOUBTFUL:     Brand claims a meaningful concentration OR positions ingredient
                  as hero, but INCI position is at or below the 1% anchor - or
                  brand-stated % is higher than position implies.
    UNVERIFIABLE: Insufficient information to assess (e.g. no anchor identified,
                  ingredient not found, INCI not fully disclosed).
    """
    CONFIRMED    = "confirmed"
    PLAUSIBLE    = "plausible"
    DOUBTFUL     = "doubtful"
    UNVERIFIABLE = "unverifiable"


# ---------------------------------------------------------------------------
# INCI Hierarchy Reference Data
# ---------------------------------------------------------------------------

# Known preservatives and their typical concentration range as fractions.
# The LOWEST member of a pair is what they realistically contribute at cosmetic use.
# Presence in INCI before these = likely above 1%; after = likely below 1%.
# Source: regulatory maximums (EU Annex V) and formulation practice literature.
KNOWN_PRESERVATIVES: dict[str, tuple[float, float]] = {
    "phenoxyethanol":               (0.005, 0.010),  # 0.5-1.0%; max 1.0% EU
    "methylparaben":                (0.001, 0.004),  # 0.1-0.4%; max 0.4% EU
    "ethylparaben":                 (0.001, 0.004),
    "propylparaben":                (0.001, 0.002),  # max 0.14% in face (EU 2014)
    "butylparaben":                 (0.001, 0.002),
    "benzyl alcohol":               (0.005, 0.010),  # 0.5-1.0%
    "chlorphenesin":                (0.002, 0.003),  # max 0.3% EU
    "potassium sorbate":            (0.005, 0.010),
    "sodium benzoate":              (0.005, 0.010),
    "dehydroacetic acid":           (0.005, 0.006),  # max 0.6% EU
    "sodium dehydroacetate":        (0.005, 0.006),
    "caprylyl glycol":              (0.003, 0.008),
    "1,2-hexanediol":               (0.003, 0.010),
    "ethylhexylglycerin":           (0.001, 0.005),  # typically 0.1-0.5% as booster
    "polyaminopropyl biguanide":    (0.0001, 0.0003),
    "polyhexamethylene biguanide":  (0.0001, 0.0003),
    "imidazolidinyl urea":          (0.001, 0.003),
    "diazolidinyl urea":            (0.001, 0.003),
    "bronopol":                     (0.001, 0.002),
}

# Chemical penetration enhancers (CPEs).
# Co-formulation invalidates the default 50% dermal absorption assumption.
# Reference: SCCS Notes of Guidance 12th revision, Section 3.
KNOWN_PENETRATION_ENHANCERS: set[str] = {
    "dimethyl isosorbide",           # broad-spectrum CPE; functional at 1-10%
    "ethoxydiglycol",                # strong CPE; reduces SC diffusional resistance
    "propylene glycol",              # CPE at >5%; intercalates SC lipid bilayers
    "alcohol denat.",                # >20%: lipophilic enhancement; >40%: SC extraction
    "ethanol",
    "isopropyl alcohol",
    "oleic acid",                    # disrupts ceramide bilayers; comedogenic risk
    "olea europaea fruit oil",       # high oleic (70-80%); CPE + comedogenic
    "prunus amygdalus dulcis oil",   # ~70% oleic; moderate CPE
    "dimethyl sulfoxide",            # pharmaceutical CPE; not common in cosmetics
}

# Functional minimum concentrations for hero actives, as fractions.
# Format: name_lower -> (min_fraction, rationale)
# References: peer-reviewed literature, SCCS opinions, clinical studies.
FUNCTIONAL_MINIMUMS: dict[str, tuple[float, str]] = {
    # --- Vitamin C forms ---
    "ascorbic acid":                 (0.05,   "5%+ for antioxidant; 10%+ for brightening (Pinnell 2001, BJD)"),
    "l-ascorbic acid":               (0.05,   "5%+ for antioxidant; 10%+ for brightening"),
    "3-o-ethyl ascorbic acid":       (0.02,   "2%+ for brightening; stable derivative"),
    "sodium ascorbyl phosphate":     (0.03,   "3%+ (partial conversion to L-AA reduces yield)"),
    "ascorbyl glucoside":            (0.03,   "3%+ (two enzymatic steps to active form)"),
    "magnesium ascorbyl phosphate":  (0.03,   "3%+; limited penetration vs L-AA"),
    "ascorbyl tetraisopalmitate":    (0.02,   "2%+ as oil-soluble stable derivative"),

    # --- Vitamin B3 ---
    "niacinamide":                   (0.02,   "2%+ for PIH inhibition (Bissett 2004); 5%+ for pore/sebum"),

    # --- Retinoids ---
    "retinol":                       (0.0003, "0.025%+ clinical effect; 0.1-0.3% OTC standard"),
    "retinyl palmitate":             (0.001,  "0.1%+ but 2 enzymatic conversions to retinoic acid; much less potent than retinol"),
    "retinal":                       (0.0002, "0.02%+ (1 step to retinoic acid; more potent than retinol)"),
    "hydroxypinacolone retinoate":   (0.0001, "0.01%+ as ester prodrug"),

    # --- Bakuchiol ---
    "bakuchiol":                     (0.005,  "0.5%+ (Dhaliwal 2019, BJD: 0.5% twice daily)"),

    # --- AHAs ---
    "glycolic acid":                 (0.05,   "5%+ for exfoliation; 10%+ for clinical effect"),
    "lactic acid":                   (0.05,   "5%+ as functional exfoliant"),
    "mandelic acid":                 (0.05,   "5%+ as functional exfoliant"),
    "tartaric acid":                 (0.05,   "5%+ as functional exfoliant"),
    "malic acid":                    (0.05,   "5%+ as functional exfoliant"),

    # --- BHAs ---
    "salicylic acid":                (0.005,  "0.5%+ for acne; 2% max OTC India/EU"),
    "betahydroxy acid":              (0.005,  "0.5%+"),

    # --- PHAs ---
    "gluconolactone":                (0.02,   "2%+ as functional exfoliant/antioxidant"),
    "lactobionic acid":              (0.02,   "2%+"),

    # --- Brightening ---
    "alpha arbutin":                 (0.01,   "1%+ (2%+ for clinical melanin inhibition)"),
    "beta arbutin":                  (0.03,   "3%+ (less potent than alpha arbutin)"),
    "4-butylresorcinol":             (0.001,  "0.1%+ (highly potent tyrosinase inhibitor)"),
    "kojic acid":                    (0.01,   "1%+ for brightening"),
    "kojic dipalmitate":             (0.01,   "1%+; prodrug of kojic acid"),
    "tranexamic acid":               (0.02,   "2%+ topical (3-5% in clinical studies)"),
    "azelaic acid":                  (0.05,   "5%+ clinical; 10-15% prescription"),

    # --- Hyaluronic Acid ---
    "hyaluronic acid":               (0.001,  "0.1%+ surface hydration; MW determines depth"),
    "sodium hyaluronate":            (0.001,  "0.1%+"),
    "hydrolyzed sodium hyaluronate": (0.001,  "0.1%+; lower MW penetrates deeper"),
    "hydrolyzed hyaluronic acid":    (0.001,  "0.1%+"),
    "sodium hyaluronate crosspolymer":(0.001, "0.1%+"),

    # --- Peptides ---
    "palmitoyl tripeptide-1":        (0.0005, "0.05%+ (Matrixyl component)"),
    "palmitoyl tetrapeptide-7":      (0.0005, "0.05%+"),
    "acetyl hexapeptide-3":          (0.0005, "0.05%+ (Argireline)"),
    "acetyl hexapeptide-8":          (0.0005, "0.05%+"),
    "copper tripeptide-1":           (0.0003, "0.03%+"),

    # --- Antioxidants ---
    "tocopherol":                    (0.005,  "0.5%+ for antioxidant protection"),
    "tocopheryl acetate":            (0.005,  "0.5%+ (must convert to tocopherol on skin)"),
    "resveratrol":                   (0.001,  "0.1%+"),
    "ubiquinone":                    (0.001,  "0.1%+ (CoQ10)"),
    "ferulic acid":                  (0.005,  "0.5%+ as antioxidant and synergist"),

    # --- Actives with broad ranges ---
    "centella asiatica extract":     (0.005,  "0.5%+ for anti-inflammatory"),
    "panthenol":                     (0.001,  "0.1%+ moisturising; 5%+ for barrier repair"),
    "caffeine":                      (0.01,   "1%+ for visible effect (de-puffing, antioxidant)"),
    "zinc pca":                      (0.003,  "0.3%+ for sebum regulation"),
    "zinc oxide":                    (0.01,   "1%+ as UV filter; 25% max EU"),
    "titanium dioxide":              (0.01,   "1%+ as UV filter; 25% max EU"),
}


# ---------------------------------------------------------------------------
# INCI Ingredient dataclass
# ---------------------------------------------------------------------------

@dataclass
class INCIIngredient:
    """
    A single ingredient entry in an INCI list.

    Args:
        position:      1-indexed position in the INCI list (1 = first, highest concentration).
        name:          INCI name exactly as written on packaging (case-insensitive in analysis).
        category:      Optional classification: "solvent", "active", "emollient", "preservative",
                       "emulsifier", "thickener", "penetration_enhancer", "uv_filter", etc.
        claimed_pct:   Brand-stated concentration as a fraction (e.g. 0.10 for 10%).
                       None if not disclosed by brand.
        flag:          Consumer-facing flag: "ok", "info", "warn" - as used in the TypeScript
                       IngredientEntry type.
    """
    position: int
    name: str
    category: str = ""
    claimed_pct: Optional[float] = None
    flag: str = "ok"   # "ok" | "info" | "warn"

    @property
    def name_lower(self) -> str:
        return self.name.lower().strip()


# ---------------------------------------------------------------------------
# Claim validation result
# ---------------------------------------------------------------------------

@dataclass
class ClaimValidationResult:
    """
    Result of INCI-hierarchy validation for a specific ingredient claim.

    Fields:
        ingredient_name:    INCI name of the assessed ingredient.
        validity:           ClaimValidity enum outcome.
        anchor_position:    The 1% anchor position (preservative position) in the INCI list.
                            None if no anchor was found.
        ingredient_position: The ingredient's position in the INCI list.
        claimed_pct:        Brand-stated concentration as fraction, or None.
        above_anchor:       True if ingredient appears before (above) the 1% anchor.
        functional_min:     Known functional minimum as fraction, or None.
        above_functional_min: True/False/None (None if functional min unknown).
        pillar2_deduction:  Recommended deduction from Pillar 2 formulation_logic_supports_claims.
        pillar3_deduction:  Recommended deduction from Pillar 3 claims_match_ingredient_profile.
        note:               Internal evaluator note (not for consumer display).
        consumer_note:      Plain English note for consumer-facing scorecard.
    """
    ingredient_name: str
    validity: ClaimValidity
    anchor_position: Optional[int]
    ingredient_position: int
    claimed_pct: Optional[float]
    above_anchor: bool
    functional_min: Optional[float]
    above_functional_min: Optional[bool]
    pillar2_deduction: float = 0.0
    pillar3_deduction: float = 0.0
    note: str = ""
    consumer_note: str = ""


# ---------------------------------------------------------------------------
# INCI Hierarchy Analyzer
# ---------------------------------------------------------------------------

class INCIHierarchyAnalyzer:
    """
    Analyses INCI ingredient lists to:
    1. Identify the approximate 1% concentration threshold ("1% anchor").
    2. Determine whether hero actives are positioned above or below that threshold.
    3. Validate brand concentration claims against INCI position evidence.
    4. Identify chemical penetration enhancers and their relative positions.
    5. Flag claims that are inconsistent with INCI position evidence.

    The 1% anchor method:
        EU Cosmetics Regulation allows ingredients below 1% to be listed in any order
        after the above-1% ingredients. In practice, cosmetic preservatives appear at
        well-established concentration ranges (phenoxyethanol: 0.5-1.0%; ethylhexylglycerin:
        0.1-0.5%). The first recognised preservative in an INCI list therefore marks the
        approximate 1% threshold: everything before it is likely above 1%; everything after
        is likely below 1%.

    Limitations:
        - The anchor is probabilistic, not certain. Some formulas have unusual structures.
        - When no preservative is found (e.g. anhydrous formulas, water-free formulas),
          the anchor cannot be identified and claims are flagged as UNVERIFIABLE.
        - Fragrance ingredients (Parfum) may follow preservatives at any position.
        - pH adjusters (Sodium Hydroxide, Citric Acid) almost always appear sub-1%.
    """

    def find_one_percent_anchor(self, ingredients: list[INCIIngredient]) -> Optional[int]:
        """
        Find the 1-indexed position of the first recognised preservative in the INCI list.
        This position is the approximate 1% threshold: ingredients at earlier positions are
        likely above 1%; ingredients at later positions are likely below 1%.

        Returns None if no preservative is identified (anchor cannot be established).
        """
        for ing in ingredients:
            if ing.name_lower in KNOWN_PRESERVATIVES:
                return ing.position
        return None

    def identify_penetration_enhancers(
        self, ingredients: list[INCIIngredient]
    ) -> list[tuple[INCIIngredient, bool]]:
        """
        Identify all chemical penetration enhancers in the INCI list.
        Returns a list of (ingredient, is_above_anchor) tuples.
        CPEs above the anchor are at functionally relevant concentrations.
        """
        anchor = self.find_one_percent_anchor(ingredients)
        results = []
        for ing in ingredients:
            if ing.name_lower in KNOWN_PENETRATION_ENHANCERS:
                above = anchor is None or ing.position < anchor
                results.append((ing, above))
        return results

    def validate_claim(
        self,
        target_name: str,
        ingredients: list[INCIIngredient],
        claimed_pct: Optional[float] = None,
    ) -> ClaimValidationResult:
        """
        Validate a concentration or hero-active claim for a specific ingredient.

        Args:
            target_name:  INCI name of the ingredient to assess.
            ingredients:  Full ordered INCI ingredient list.
            claimed_pct:  Brand-stated concentration as a fraction, or None.

        Returns:
            ClaimValidationResult with validity, deductions, and notes.
        """
        target_lower = target_name.lower().strip()

        # Find ingredient in list
        target: Optional[INCIIngredient] = None
        for ing in ingredients:
            if ing.name_lower == target_lower:
                target = ing
                # Use claimed_pct from ingredient entry if not passed explicitly
                if claimed_pct is None and ing.claimed_pct is not None:
                    claimed_pct = ing.claimed_pct
                break

        if target is None:
            return ClaimValidationResult(
                ingredient_name=target_name,
                validity=ClaimValidity.UNVERIFIABLE,
                anchor_position=None,
                ingredient_position=0,
                claimed_pct=claimed_pct,
                above_anchor=False,
                functional_min=None,
                above_functional_min=None,
                pillar2_deduction=0.0,
                pillar3_deduction=0.0,
                note="Ingredient not found in INCI list.",
                consumer_note="",
            )

        anchor_position = self.find_one_percent_anchor(ingredients)
        above_anchor = anchor_position is None or target.position < anchor_position

        # Functional minimum
        func_min_entry = FUNCTIONAL_MINIMUMS.get(target_lower)
        functional_min = func_min_entry[0] if func_min_entry else None
        func_min_desc  = func_min_entry[1] if func_min_entry else None

        above_functional_min: Optional[bool] = None
        if functional_min is not None:
            if above_anchor:
                # Above anchor means >1%; check if functional minimum is below 1%
                if functional_min <= 0.01:
                    above_functional_min = True   # if >1% and functional min <=1%, clearly above
                else:
                    above_functional_min = None   # might or might not be above functional min - uncertain
            else:
                # Below anchor means <1%; check if functional minimum is achievable below 1%
                if functional_min <= 0.005:       # functional min is <=0.5% - could still work
                    above_functional_min = None   # uncertain
                else:
                    above_functional_min = False  # below anchor and functional min >1% - almost certainly sub-functional

        # Determine validity
        p2_deduct = 0.0
        p3_deduct = 0.0

        if anchor_position is None:
            validity = ClaimValidity.UNVERIFIABLE
            note = (
                f"Cannot validate: no 1% anchor identified in INCI list "
                f"(no recognised preservative found). INCI may be anhydrous formula."
            )
            consumer_note = ""

        elif claimed_pct is not None:
            # Brand has made a specific concentration claim
            if above_anchor:
                if claimed_pct >= 0.01:
                    # Ingredient above anchor and claim is >1%: consistent
                    validity = ClaimValidity.CONFIRMED
                    note = (
                        f"INCI position {target.position} (before anchor at {anchor_position}) "
                        f"is consistent with claimed {claimed_pct*100:.1f}%."
                    )
                    consumer_note = ""
                else:
                    # Claimed <1% but above anchor - unusual but not a problem (understatement)
                    validity = ClaimValidity.CONFIRMED
                    note = f"Claimed {claimed_pct*100:.2f}% consistent with above-anchor INCI position."
                    consumer_note = ""
            else:
                # Below anchor but brand claims >1% concentration - mismatch
                if claimed_pct >= 0.01:
                    validity = ClaimValidity.DOUBTFUL
                    p2_deduct = 1.0   # deduct formulation_logic_supports_claims
                    p3_deduct = 1.0   # deduct claims_match_ingredient_profile
                    note = (
                        f"MISMATCH: Brand claims {claimed_pct*100:.1f}% but ingredient appears at "
                        f"INCI position {target.position}, after the 1% anchor at position "
                        f"{anchor_position}. Per EU 1223/2009 Art.19(1)(g), ingredients below 1% "
                        f"appear after the 1% threshold. Claimed concentration is inconsistent "
                        f"with INCI hierarchy evidence."
                    )
                    consumer_note = (
                        f"The brand claims {claimed_pct*100:.0f}% {target_name}, but its position "
                        f"in the ingredient list suggests it may be below 1% - which would be "
                        f"significantly less than claimed."
                    )
                else:
                    # Claimed <1% and is below anchor - consistent
                    validity = ClaimValidity.CONFIRMED
                    note = f"Claimed {claimed_pct*100:.2f}% consistent with below-anchor INCI position."
                    consumer_note = ""

        else:
            # No concentration claimed - infer from position
            if above_anchor:
                if above_functional_min is False:
                    # Above anchor but functional min > 1%: uncertain
                    validity = ClaimValidity.PLAUSIBLE
                    note = (
                        f"No concentration claimed. Position {target.position} is above the "
                        f"1% anchor at {anchor_position}. Functional minimum for "
                        f"{target_name}: {functional_min*100:.1f}% ({func_min_desc}). "
                        f"Cannot confirm functional adequacy without stated concentration."
                    )
                    consumer_note = (
                        f"{target_name} appears in a meaningful amount in this formula, "
                        f"but no concentration is stated - the level may or may not reach "
                        f"the threshold needed for visible results."
                    )
                    p3_deduct = 0.5
                else:
                    validity = ClaimValidity.PLAUSIBLE
                    note = (
                        f"No concentration claimed. Position {target.position} is above the "
                        f"1% anchor at {anchor_position}, suggesting >1% concentration."
                    )
                    consumer_note = ""
            else:
                # Below anchor, no claim - likely sub-1%
                if above_functional_min is False:
                    validity = ClaimValidity.DOUBTFUL
                    p2_deduct = 0.5
                    p3_deduct = 0.5
                    note = (
                        f"No concentration claimed. Position {target.position} is below the "
                        f"1% anchor at {anchor_position}, suggesting <1% concentration. "
                        f"Functional minimum for {target_name}: {functional_min*100:.1f}% "
                        f"({func_min_desc}). Ingredient is likely below functional threshold."
                    )
                    consumer_note = (
                        f"{target_name} appears near the end of the ingredient list, suggesting "
                        f"it is present at a very low level - likely too low to deliver the "
                        f"results associated with this ingredient."
                    )
                else:
                    # Below anchor but functional min is low enough it might still work
                    validity = ClaimValidity.DOUBTFUL
                    note = (
                        f"No concentration claimed. Position {target.position} is below the "
                        f"1% anchor at {anchor_position}. "
                        f"Functional minimum is low ({functional_min*100:.2f}% if known), "
                        f"so sub-1% may still be functional - but cannot confirm."
                    )
                    consumer_note = (
                        f"The concentration of {target_name} is not disclosed and its position "
                        f"in the list suggests a small amount. Effect at this level is uncertain."
                    )
                    p3_deduct = 0.25

        return ClaimValidationResult(
            ingredient_name=target_name,
            validity=validity,
            anchor_position=anchor_position,
            ingredient_position=target.position,
            claimed_pct=claimed_pct,
            above_anchor=above_anchor,
            functional_min=functional_min,
            above_functional_min=above_functional_min,
            pillar2_deduction=p2_deduct,
            pillar3_deduction=p3_deduct,
            note=note,
            consumer_note=consumer_note,
        )

    def bulk_validate(
        self,
        hero_actives: list[str],
        ingredients: list[INCIIngredient],
    ) -> list[ClaimValidationResult]:
        """
        Validate INCI position claims for all listed hero actives.
        """
        return [self.validate_claim(name, ingredients) for name in hero_actives]

    def inci_summary(self, ingredients: list[INCIIngredient]) -> dict:
        """
        Return a summary dictionary useful for logging and reporting.
        """
        anchor = self.find_one_percent_anchor(ingredients)
        cpes = self.identify_penetration_enhancers(ingredients)
        return {
            "total_ingredients": len(ingredients),
            "one_percent_anchor_position": anchor,
            "penetration_enhancers_identified": [
                {"name": ing.name, "position": ing.position, "above_anchor": above}
                for ing, above in cpes
            ],
        }


# ---------------------------------------------------------------------------
# SED / MoS Calculation Model
#
# Reference: SCCS Notes of Guidance 12th revision, Section 3 (Risk Characterisation)
#
# When a CPE is co-formulated, the default 50% DAp assumption is invalid for
# co-formulated actives. Per SCCS Notes of Guidance: the full formulation matrix
# alters dermal absorption and must be reassessed.
# ---------------------------------------------------------------------------

@dataclass
class SEDCalculation:
    """
    Systemic Exposure Dose (SED) and Margin of Safety (MoS) per SCCS methodology.

    Formula:
        SED (mg/kg bw/day) = (A x C x DAp x F) / BW
        MoS = NOAEL / SED
        Pass threshold: MoS >= 100

    The 100-fold MoS threshold incorporates:
        10x inter-species extrapolation (animal to human)
        10x intra-species variation (human population variability)
    """
    ingredient_name: str
    A: float                        # g/application (SCCS Table 3-1 defaults by product category)
    C: float                        # concentration as fraction
    DAp: float = 0.50               # SCCS conservative default; override with measured data
    F: float = 1.0                  # applications/day
    BW: float = 60.0                # kg (adult default)
    NOAEL: Optional[float] = None   # mg/kg bw/day; None if unavailable
    noael_source: str = ""
    penetration_enhancer_present: bool = False

    def sed(self) -> float:
        return (self.A * self.C * self.DAp * self.F) / self.BW

    def mos(self) -> Optional[float]:
        if self.NOAEL is None:
            return None
        s = self.sed()
        if s == 0:
            return None
        return self.NOAEL / s

    def passes(self) -> Optional[bool]:
        m = self.mos()
        if m is None:
            return None
        return m >= 100

    def summary(self) -> str:
        s = self.sed()
        m = self.mos()
        cpe_warning = ""
        if self.penetration_enhancer_present:
            cpe_warning = (
                " [CPE CO-FORMULATED: DAp may be underestimated; MoS may be lower than "
                "calculated - full formulation matrix reassessment required]"
            )
        if m is not None:
            status = "PASS" if m >= 100 else "FAIL"
            return (
                f"{self.ingredient_name}: "
                f"SED={s:.5f} mg/kg bw/day | "
                f"NOAEL={self.NOAEL} mg/kg bw/day | "
                f"MoS={m:.1f} [{status}]{cpe_warning}"
            )
        return (
            f"{self.ingredient_name}: "
            f"SED={s:.5f} mg/kg bw/day | "
            f"NOAEL not available - MoS cannot be assessed{cpe_warning}"
        )


# ---------------------------------------------------------------------------
# Pillar 1: Safety & Toxicity (max 50 points)
# ---------------------------------------------------------------------------

@dataclass
class Pillar1Scores:
    """
    Pillar 1 - Safety & Toxicity (50 pts)

    Sections:
        A. Ingredient Hazard Assessment  25 pts
        B. Exposure Assessment           15 pts
        C. Sensitisation & Irritation    10 pts

    Auto-fail triggers (any True zeroes the pillar score):
        - EU Annex II prohibited substance
        - SVHC above 0.1% w/w without exemption
        - Confirmed undisclosed fragrance allergens above threshold
        - IFRA standard exceeded
        - Formaldehyde-releasing preservative in baby/children product
        - Any prohibited paraben (iso/isobutyl/phenyl/benzyl/pentyl)
    """

    # --- A. Ingredient Hazard Assessment (25 pts) ---
    carcinogenicity: float = 5.0
    mutagenicity_genotoxicity: float = 5.0
    reproductive_developmental: float = 5.0
    endocrine_disruption: float = 5.0
    organ_systemic_toxicity: float = 5.0

    # --- B. Exposure Assessment (15 pts) ---
    product_type_factor: float = 5.0
    concentration_limit_compliance: float = 5.0
    aggregate_daily_exposure: float = 5.0

    # --- C. Sensitisation & Irritation (10 pts) ---
    skin_sensitisation: float = 5.0
    eye_irritation: float = 3.0
    respiratory_irritation: float = 2.0

    # -------------------------------------------------------------------------
    # Endocrine disruption flags
    # -------------------------------------------------------------------------
    contains_benzophenone_3: bool = False
    contains_propyl_or_butyl_paraben: bool = False

    # -------------------------------------------------------------------------
    # Prohibited paraben flags (any True = auto-fail)
    # -------------------------------------------------------------------------
    contains_isopropylparaben: bool = False
    contains_isobutylparaben: bool = False
    contains_phenylparaben: bool = False
    contains_benzylparaben: bool = False
    contains_pentylparaben: bool = False

    # -------------------------------------------------------------------------
    # Penetration enhancer flags
    # Presence at a meaningful INCI position triggers:
    #   1. Mandatory deduction in aggregate_daily_exposure
    #   2. Mandatory scorecard note
    #   3. Flag in all SEDCalculation entries
    # -------------------------------------------------------------------------
    contains_dmi: bool = False
    contains_transcutol: bool = False
    contains_high_propylene_glycol: bool = False
    contains_high_oleic_oil: bool = False
    contains_high_ethanol: bool = False

    # -------------------------------------------------------------------------
    # Fragrance allergen flags (EU Regulation 2023/1545)
    # -------------------------------------------------------------------------
    undisclosed_fragrance_allergens_confirmed: bool = False
    parfum_without_named_allergens_leave_on: bool = False

    # -------------------------------------------------------------------------
    # Hard auto-fail flags
    # -------------------------------------------------------------------------
    contains_eu_annex_ii_substance: bool = False
    contains_svhc_above_threshold: bool = False
    ifra_above_limits: bool = False
    formaldehyde_releaser_in_baby_product: bool = False

    sed_calculations: list[SEDCalculation] = field(default_factory=list)

    def has_prohibited_paraben(self) -> bool:
        return any([
            self.contains_isopropylparaben, self.contains_isobutylparaben,
            self.contains_phenylparaben, self.contains_benzylparaben,
            self.contains_pentylparaben,
        ])

    def has_auto_fail(self) -> bool:
        return any([
            self.contains_eu_annex_ii_substance,
            self.contains_svhc_above_threshold,
            self.undisclosed_fragrance_allergens_confirmed,
            self.ifra_above_limits,
            self.formaldehyde_releaser_in_baby_product,
            self.has_prohibited_paraben(),
        ])

    def penetration_enhancer_present(self) -> bool:
        return any([
            self.contains_dmi, self.contains_transcutol,
            self.contains_high_propylene_glycol,
            self.contains_high_oleic_oil, self.contains_high_ethanol,
        ])

    def section_a_score(self) -> float:
        return (
            self.carcinogenicity + self.mutagenicity_genotoxicity
            + self.reproductive_developmental + self.endocrine_disruption
            + self.organ_systemic_toxicity
        )

    def section_b_score(self) -> float:
        return (
            self.product_type_factor + self.concentration_limit_compliance
            + self.aggregate_daily_exposure
        )

    def section_c_score(self) -> float:
        return self.skin_sensitisation + self.eye_irritation + self.respiratory_irritation

    def total(self) -> float:
        if self.has_auto_fail():
            return 0.0
        return max(0.0, min(50.0,
            self.section_a_score() + self.section_b_score() + self.section_c_score()
        ))

    def auto_fail_reasons(self) -> list[str]:
        reasons = []
        if self.contains_eu_annex_ii_substance:
            reasons.append("Contains EU Annex II prohibited substance")
        if self.contains_svhc_above_threshold:
            reasons.append("Contains SVHC above 0.1% w/w without exemption")
        if self.undisclosed_fragrance_allergens_confirmed:
            reasons.append("Confirmed undisclosed fragrance allergen(s) above regulatory threshold")
        if self.ifra_above_limits:
            reasons.append("Fragrance material exceeds IFRA category limit")
        if self.formaldehyde_releaser_in_baby_product:
            reasons.append("Formaldehyde-releasing preservative in baby/children product")
        for name, flag in [
            ("isopropylparaben", self.contains_isopropylparaben),
            ("isobutylparaben",  self.contains_isobutylparaben),
            ("phenylparaben",    self.contains_phenylparaben),
            ("benzylparaben",    self.contains_benzylparaben),
            ("pentylparaben",    self.contains_pentylparaben),
        ]:
            if flag:
                reasons.append(f"Contains {name} (EU-prohibited paraben)")
        return reasons

    def advisory_notes(self) -> list[str]:
        notes = []
        if self.contains_benzophenone_3:
            notes.append(
                "Contains Benzophenone-3 (oxybenzone): classified by ECHA as an endocrine disruptor "
                "for human health (2025). Active EU restriction process underway. Current concentration "
                "limits apply but deduction applied for established ED classification."
            )
        if self.contains_propyl_or_butyl_paraben:
            notes.append(
                "Contains propylparaben/butylparaben: regulatory body notes possible endocrine signals "
                "at permitted concentrations. Currently considered safe at limits; minor deduction applied."
            )
        if self.parfum_without_named_allergens_leave_on:
            notes.append(
                "Fragrance blend (Parfum) listed in a leave-on product without individually named allergen "
                "components. EU regulation expanding mandatory allergen declaration to 80+ substances "
                "(compliance deadline July 2026). Allergen status cannot be confirmed from INCI alone."
            )
        cpe_names = []
        if self.contains_dmi:
            cpe_names.append("Dimethyl Isosorbide (broad-spectrum CPE; functional at 1-10%)")
        if self.contains_transcutol:
            cpe_names.append("Ethoxydiglycol (strong CPE; reduces SC diffusional resistance)")
        if self.contains_high_propylene_glycol:
            cpe_names.append("Propylene Glycol above ~5% (intercalates SC lipid bilayers)")
        if self.contains_high_oleic_oil:
            cpe_names.append("High-oleic oil above 1% position (disrupts ceramide bilayers)")
        if self.contains_high_ethanol:
            cpe_names.append("Alcohol Denat./Ethanol above ~20%")
        if cpe_names:
            notes.append(
                "Chemical penetration enhancer(s) identified: "
                + "; ".join(cpe_names)
                + ". These ingredients increase how deeply other actives absorb into skin - "
                "a positive for efficacy but means the default absorption safety model may "
                "underestimate exposure. Full formulation reassessment required per SCCS guidance."
            )
        return notes


# ---------------------------------------------------------------------------
# Pillar 2: Formulation Quality (max 20 points)
# ---------------------------------------------------------------------------

@dataclass
class Pillar2Scores:
    """
    Pillar 2 - Formulation Quality (20 pts)

    Scored exclusively from publicly available information.
    INCI hierarchy validation feeds directly into Section A.

    Sections:
        A. Claim Substantiation          8 pts
        B. Formulation Stability         6 pts
        C. Manufacturing Quality Signal  6 pts
    """

    # --- A. Claim Substantiation (8 pts) ---
    evidence_exists_for_claims: float = 4.0
    # 0-4: published evidence for primary claim at INCI-hierarchy-confirmed concentration

    evidence_from_credible_source: float = 3.0
    # 0-3: SCCS opinions, peer-reviewed pharmacology/dermatology journals; not brand whitepapers

    formulation_logic_supports_claims: float = 1.0
    # 0-1: INCI position places hero actives above 1% anchor (functional concentration)
    # Automatically reduced by INCIHierarchyAnalyzer.validate_claim() output
    # Full deduction (1.0) when hero active positioned BELOW 1% anchor for >1% claim

    # --- B. Formulation Stability (6 pts) ---
    microbiological_stability: float = 2.0
    chemical_physical_stability: float = 2.0
    packaging_compatibility: float = 2.0

    # Stability flags (see below for deduction logic)
    preservative_ph_mismatch: bool = False
    no_chelator_with_weak_acid_preservatives: bool = False
    formula_is_anhydrous: bool = False
    avobenzone_without_photostabilizer: bool = False
    oxidation_sensitive_in_inadequate_packaging: bool = False

    # --- C. Manufacturing Quality Signal (6 pts) ---
    gmp_compliance_evidence: float = 3.0
    stability_testing_transparency: float = 2.0
    batch_traceability_evidence: float = 1.0
    no_gmp_documentation: bool = False

    # -------------------------------------------------------------------------
    # INCI hierarchy claim validation results
    # Populated by running INCIHierarchyAnalyzer.bulk_validate() and applying
    # recommended deductions to formulation_logic_supports_claims above.
    # -------------------------------------------------------------------------
    inci_claim_validations: list[ClaimValidationResult] = field(default_factory=list)

    def section_a_score(self) -> float:
        return (
            self.evidence_exists_for_claims
            + self.evidence_from_credible_source
            + self.formulation_logic_supports_claims
        )

    def section_b_score(self) -> float:
        return (
            self.microbiological_stability
            + self.chemical_physical_stability
            + self.packaging_compatibility
        )

    def section_c_score(self) -> float:
        if self.no_gmp_documentation:
            return 0.0
        return (
            self.gmp_compliance_evidence
            + self.stability_testing_transparency
            + self.batch_traceability_evidence
        )

    def total(self) -> float:
        return max(0.0, min(20.0,
            self.section_a_score() + self.section_b_score() + self.section_c_score()
        ))

    def stability_advisory_notes(self) -> list[str]:
        notes = []
        if self.preservative_ph_mismatch:
            notes.append(
                "Preservative system may not be operating at optimal effectiveness. "
                "The preservative type used works best in acidic conditions, but the rest "
                "of the formula suggests a near-neutral pH. This can mean the preservative "
                "is less effective than expected - relevant for long-term product safety."
            )
        if self.no_chelator_with_weak_acid_preservatives:
            notes.append(
                "The preservative system may not cover all microbial risks. "
                "Without a chelating agent, some bacteria may be harder to control. "
                "This does not mean the product is unsafe, but it is a formulation gap "
                "that skilled formulators typically address."
            )
        if self.avobenzone_without_photostabilizer:
            notes.append(
                "The UVA filter in this sunscreen (avobenzone) breaks down in sunlight without "
                "a stabiliser. Unprotected avobenzone can degrade 50-90% within an hour of "
                "sun exposure, meaning the UVA protection claimed on the label may not hold "
                "for the full wear period. Reapplication every 90 minutes is essential."
            )
        if self.oxidation_sensitive_in_inadequate_packaging:
            notes.append(
                "This product contains an active ingredient (such as retinol or vitamin C) "
                "that degrades when exposed to light and air. The packaging does not provide "
                "adequate protection - expect meaningful loss of potency before the product "
                "is finished, especially in warm or humid climates."
            )
        # Add INCI-hierarchy consumer notes
        for cvr in self.inci_claim_validations:
            if cvr.consumer_note and cvr.validity == ClaimValidity.DOUBTFUL:
                notes.append(cvr.consumer_note)
        return notes


# ---------------------------------------------------------------------------
# Pillar 3: Claims & Transparency (max 20 points)
# ---------------------------------------------------------------------------

@dataclass
class Pillar3Scores:
    """
    Pillar 3 - Claims & Transparency (20 pts)

    Sub-category weighting:
        A. INCI Disclosure Completeness  10 pts
        B. Labelling Clarity              6 pts
        C. Marketing Claims Accuracy      4 pts

    INCI hierarchy feeds into Section C: claims_match_ingredient_profile
    is automatically reduced when hero active appears below the 1% anchor
    without supporting concentration disclosure.

    Note: "Niacinamide + Vitamin C" combination is NOT a flaggable concern.
    The niacin flush is clinically irrelevant at cosmetic concentrations.
    Do not include it in any scorecard note as a concern.
    """

    # --- A. INCI Disclosure Completeness (10 pts) ---
    inci_format_complete: float = 5.0
    active_concentration_ranges: float = 3.0
    fragrance_allergens_disclosed: float = 2.0

    # --- B. Labelling Clarity (6 pts) ---
    correct_inci_names_used: float = 2.0
    language_accessibility: float = 2.0
    allergen_highlighting: float = 2.0

    # --- C. Marketing Claims Accuracy (4 pts) ---
    no_prohibited_terms: float = 2.0
    claims_match_ingredient_profile: float = 2.0
    # Automatically reduced by INCIHierarchyAnalyzer claim validation outputs:
    #   -1.0 for each confirmed mismatch (brand claims >1% but INCI below anchor)
    #   -0.5 for hero active below anchor without concentration disclosure
    #   -0.5 for retinyl palmitate marketed equivalently to retinol
    #   -0.5 for SAP marketed equivalently to L-Ascorbic Acid without qualification

    # --- Auto-fail flags ---
    drug_claims_without_approval: bool = False
    chemical_free_claim: bool = False
    spf_claim_without_test_data: bool = False
    organic_natural_vegan_without_evidence: bool = False

    # INCI hierarchy validation results (carry across from Pillar 2)
    inci_claim_validations: list[ClaimValidationResult] = field(default_factory=list)

    def section_a_score(self) -> float:
        return (
            self.inci_format_complete
            + self.active_concentration_ranges
            + self.fragrance_allergens_disclosed
        )

    def section_b_score(self) -> float:
        return (
            self.correct_inci_names_used
            + self.language_accessibility
            + self.allergen_highlighting
        )

    def section_c_score(self) -> float:
        return self.no_prohibited_terms + self.claims_match_ingredient_profile

    def has_auto_fail(self) -> bool:
        return any([
            self.drug_claims_without_approval,
            self.chemical_free_claim,
            self.spf_claim_without_test_data,
            self.organic_natural_vegan_without_evidence,
        ])

    def auto_fail_reasons(self) -> list[str]:
        reasons = []
        if self.drug_claims_without_approval:
            reasons.append("Drug claims without regulatory drug approval")
        if self.chemical_free_claim:
            reasons.append('"Chemical-free" or equivalent scientifically incoherent claim')
        if self.spf_claim_without_test_data:
            reasons.append("SPF claim without validated test data (ISO 24444 or equivalent)")
        if self.organic_natural_vegan_without_evidence:
            reasons.append("Organic/natural/vegan claim without supporting certification or evidence")
        return reasons

    def total(self) -> float:
        if self.has_auto_fail():
            return 0.0
        return max(0.0, min(20.0,
            self.section_a_score() + self.section_b_score() + self.section_c_score()
        ))


# ---------------------------------------------------------------------------
# Pillar 4: Ethics & Sustainability (max 10 points)
# ---------------------------------------------------------------------------

@dataclass
class Pillar4Scores:
    """
    Pillar 4 - Ethics & Sustainability (10 pts)

    Sections:
        A. Cruelty-Free Status       3 pts
        B. Ingredient Ethics         3 pts
        C. Ethical Sourcing          2 pts
        D. Packaging Sustainability  2 pts
    """

    # --- A. Cruelty-Free Status (3 pts) ---
    no_finished_product_animal_testing: float = 1.5
    no_ingredient_animal_testing: float = 1.0
    not_sold_in_mandatory_testing_market: float = 0.5

    # --- B. Ingredient Ethics (3 pts) ---
    natural_origin_index: float = 0.0
    not_on_cosmos_prohibited: float = 1.0
    no_synthetic_fragrance_peg_silicone_leave_on: float = 0.0

    # --- C. Ethical Sourcing (2 pts) ---
    rspo_palm_oil: float = 1.0
    mica_sourcing_verified: float = 0.5
    no_conflict_minerals: float = 0.5

    # --- D. Packaging Sustainability (2 pts) ---
    recyclable_or_refillable_primary: float = 1.0
    pcr_content_30pct: float = 0.5
    minimal_plastic_secondary: float = 0.5

    def section_a_score(self) -> float:
        return (
            self.no_finished_product_animal_testing
            + self.no_ingredient_animal_testing
            + self.not_sold_in_mandatory_testing_market
        )

    def section_b_score(self) -> float:
        return (
            self.natural_origin_index
            + self.not_on_cosmos_prohibited
            + self.no_synthetic_fragrance_peg_silicone_leave_on
        )

    def section_c_score(self) -> float:
        return self.rspo_palm_oil + self.mica_sourcing_verified + self.no_conflict_minerals

    def section_d_score(self) -> float:
        return (
            self.recyclable_or_refillable_primary
            + self.pcr_content_30pct
            + self.minimal_plastic_secondary
        )

    def total(self) -> float:
        return max(0.0, min(10.0,
            self.section_a_score() + self.section_b_score()
            + self.section_c_score() + self.section_d_score()
        ))


# ---------------------------------------------------------------------------
# Evaluation input
# ---------------------------------------------------------------------------

@dataclass
class EvaluationData:
    product_name: str
    brand_name: str
    evaluator_name: str
    evaluation_date: str                            # ISO 8601: "2026-05-27"
    product_type: str = ""
    target_markets: list[str] = field(default_factory=list)

    layer1_result: Layer1Result = Layer1Result.PASS
    layer1_fail_reason: str = ""

    # Full INCI ingredient list for hierarchy analysis.
    # Populate this to enable automatic claim validation.
    # Use INCIIngredient(position=N, name="...", claimed_pct=0.XX) for actives
    # where brand has disclosed a concentration.
    inci_ingredients: list[INCIIngredient] = field(default_factory=list)

    # Hero active names to validate via INCI hierarchy.
    # These are the ingredients whose claims should be validated against INCI position.
    hero_actives_to_validate: list[str] = field(default_factory=list)

    pillar1: Pillar1Scores = field(default_factory=Pillar1Scores)
    pillar2: Pillar2Scores = field(default_factory=Pillar2Scores)
    pillar3: Pillar3Scores = field(default_factory=Pillar3Scores)
    pillar4: Pillar4Scores = field(default_factory=Pillar4Scores)

    notes: str = ""


# ---------------------------------------------------------------------------
# Score result
# ---------------------------------------------------------------------------

@dataclass
class ScoreResult:
    product_name: str
    brand_name: str
    evaluator_name: str
    evaluation_date: str
    product_type: str

    layer1_result: Layer1Result
    layer1_fail_reason: str

    pillar1_score: float
    pillar1_auto_fail: bool
    pillar1_auto_fail_reasons: list[str]
    pillar1_advisory_notes: list[str]
    pillar1_sed_calculations: list[SEDCalculation]

    pillar2_score: float
    pillar2_stability_notes: list[str]

    pillar3_score: float
    pillar3_auto_fail: bool
    pillar3_auto_fail_reasons: list[str]

    pillar4_score: float

    total_score: float
    tier: CertificationTier
    certified: bool

    inci_claim_validations: list[ClaimValidationResult]

    notes: str

    @property
    def consumer_tier_label(self) -> str:
        mapping = {
            CertificationTier.GOLD:      "Excellent",
            CertificationTier.SILVER:    "Good",
            CertificationTier.CERTIFIED: "Fair",
            CertificationTier.FAIL:      "Concern",
        }
        return mapping[self.tier]


# ---------------------------------------------------------------------------
# Scorer
# ---------------------------------------------------------------------------

class CleanSheetScorer:
    """
    Calculates The Clean Sheet certification score.

    Tier thresholds (total out of 100):
        90-100: Clean Sheet Gold      (Excellent)
        75-89:  Clean Sheet Silver    (Good)
        60-74:  Clean Sheet Certified (Fair)
        <60:    Not Certified         (Concern)

    INCI hierarchy validation runs automatically if inci_ingredients and
    hero_actives_to_validate are populated in EvaluationData.
    Validation results are applied as deductions to Pillar 2 and Pillar 3
    before final score calculation.
    """

    TIER_THRESHOLDS = [
        (90, CertificationTier.GOLD),
        (75, CertificationTier.SILVER),
        (60, CertificationTier.CERTIFIED),
        (0,  CertificationTier.FAIL),
    ]

    def __init__(self):
        self.analyzer = INCIHierarchyAnalyzer()

    def calculate(self, data: EvaluationData) -> ScoreResult:
        # Layer 1: hard regulatory gate - fail zeroes all pillars
        if data.layer1_result == Layer1Result.FAIL:
            return ScoreResult(
                product_name=data.product_name,
                brand_name=data.brand_name,
                evaluator_name=data.evaluator_name,
                evaluation_date=data.evaluation_date,
                product_type=data.product_type,
                layer1_result=Layer1Result.FAIL,
                layer1_fail_reason=data.layer1_fail_reason,
                pillar1_score=0.0, pillar1_auto_fail=False,
                pillar1_auto_fail_reasons=[], pillar1_advisory_notes=[],
                pillar1_sed_calculations=[],
                pillar2_score=0.0, pillar2_stability_notes=[],
                pillar3_score=0.0, pillar3_auto_fail=False,
                pillar3_auto_fail_reasons=[],
                pillar4_score=0.0,
                total_score=0.0,
                tier=CertificationTier.FAIL,
                certified=False,
                inci_claim_validations=[],
                notes=f"Layer 1 FAIL: {data.layer1_fail_reason}",
            )

        # Run INCI hierarchy claim validation if data is provided
        claim_validations: list[ClaimValidationResult] = []
        if data.inci_ingredients and data.hero_actives_to_validate:
            claim_validations = self.analyzer.bulk_validate(
                data.hero_actives_to_validate,
                data.inci_ingredients,
            )
            # Apply recommended deductions to Pillar 2 and Pillar 3
            total_p2_deduct = sum(cvr.pillar2_deduction for cvr in claim_validations)
            total_p3_deduct = sum(cvr.pillar3_deduction for cvr in claim_validations)
            data.pillar2.formulation_logic_supports_claims = max(
                0.0, data.pillar2.formulation_logic_supports_claims - total_p2_deduct
            )
            data.pillar3.claims_match_ingredient_profile = max(
                0.0, data.pillar3.claims_match_ingredient_profile - total_p3_deduct
            )
            data.pillar2.inci_claim_validations = claim_validations
            data.pillar3.inci_claim_validations = claim_validations

        p1 = data.pillar1
        p2 = data.pillar2
        p3 = data.pillar3
        p4 = data.pillar4

        p1_score = p1.total()
        p2_score = p2.total()
        p3_score = p3.total()
        p4_score = p4.total()
        total    = p1_score + p2_score + p3_score + p4_score

        tier      = self._determine_tier(total)
        certified = tier != CertificationTier.FAIL

        return ScoreResult(
            product_name=data.product_name,
            brand_name=data.brand_name,
            evaluator_name=data.evaluator_name,
            evaluation_date=data.evaluation_date,
            product_type=data.product_type,
            layer1_result=data.layer1_result,
            layer1_fail_reason=data.layer1_fail_reason,
            pillar1_score=p1_score,
            pillar1_auto_fail=p1.has_auto_fail(),
            pillar1_auto_fail_reasons=p1.auto_fail_reasons(),
            pillar1_advisory_notes=p1.advisory_notes(),
            pillar1_sed_calculations=p1.sed_calculations,
            pillar2_score=p2_score,
            pillar2_stability_notes=p2.stability_advisory_notes(),
            pillar3_score=p3_score,
            pillar3_auto_fail=p3.has_auto_fail(),
            pillar3_auto_fail_reasons=p3.auto_fail_reasons(),
            pillar4_score=p4_score,
            total_score=round(total, 2),
            tier=tier,
            certified=certified,
            inci_claim_validations=claim_validations,
            notes=data.notes,
        )

    def _determine_tier(self, score: float) -> CertificationTier:
        for threshold, tier in self.TIER_THRESHOLDS:
            if score >= threshold:
                return tier
        return CertificationTier.FAIL

    def format_report(self, result: ScoreResult) -> str:
        W = 72
        lines = [
            "=" * W,
            "THE CLEAN SHEET - CERTIFICATION SCORE REPORT",
            "=" * W,
            f"Product:      {result.product_name}",
            f"Brand:        {result.brand_name}",
            f"Product type: {result.product_type}",
            f"Evaluator:    {result.evaluator_name}",
            f"Date:         {result.evaluation_date}",
            "",
            f"Layer 1 (Legal Compliance Gate):  {result.layer1_result.value}",
        ]

        if result.layer1_result == Layer1Result.FAIL:
            lines.append(f"  Reason: {result.layer1_fail_reason}")
            lines += ["", "CERTIFICATION RESULT: NOT CERTIFIED (Layer 1 Fail)", "=" * W]
            return "\n".join(lines)

        lines += [
            "",
            f"Pillar 1  Safety & Toxicity          {result.pillar1_score:5.1f} / 50",
        ]
        if result.pillar1_auto_fail:
            for r in result.pillar1_auto_fail_reasons:
                lines.append(f"  [AUTO-FAIL] {r}")
        for n in result.pillar1_advisory_notes:
            lines.append(f"  [ADVISORY]  {n[:W-14]}")

        lines.append(
            f"Pillar 2  Formulation Quality        {result.pillar2_score:5.1f} / 20"
        )
        for n in result.pillar2_stability_notes:
            lines.append(f"  [QUALITY]   {n[:W-14]}")

        lines.append(
            f"Pillar 3  Claims & Transparency      {result.pillar3_score:5.1f} / 20"
        )
        if result.pillar3_auto_fail:
            for r in result.pillar3_auto_fail_reasons:
                lines.append(f"  [AUTO-FAIL] {r}")

        lines.append(
            f"Pillar 4  Ethics & Sustainability    {result.pillar4_score:5.1f} / 10"
        )

        lines += [
            "                                     " + "-" * 9,
            f"TOTAL SCORE:                         {result.total_score:5.1f} / 100",
            f"CONSUMER LABEL:                      {result.consumer_tier_label}",
            "",
            f"CERTIFICATION TIER:  {result.tier.value}",
            f"CERTIFIED:           {'YES' if result.certified else 'NO'}",
        ]

        if result.inci_claim_validations:
            lines += ["", "INCI HIERARCHY CLAIM VALIDATION:"]
            for cvr in result.inci_claim_validations:
                validity_str = cvr.validity.value.upper()
                lines.append(
                    f"  {cvr.ingredient_name}: {validity_str} "
                    f"(pos={cvr.ingredient_position}, anchor={cvr.anchor_position}, "
                    f"above_anchor={cvr.above_anchor})"
                )
                if cvr.note:
                    lines.append(f"    Note: {cvr.note[:W-10]}")

        if result.pillar1_sed_calculations:
            lines += ["", "SED / MoS CALCULATIONS:"]
            for calc in result.pillar1_sed_calculations:
                lines.append(f"  {calc.summary()}")

        if result.notes:
            lines += ["", f"Evaluator notes: {result.notes}"]

        lines.append("=" * W)
        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Consumer label mapping
# (Use these when writing TypeScript brand data files)
#
# Pillar weights for TypeScript ScorePillar max values:
#   { name: "Safety & Toxicity",       max: 50 }
#   { name: "Formulation Quality",     max: 20 }
#   { name: "Claims & Transparency",   max: 20 }
#   { name: "Ethics & Sustainability", max: 10 }
#
# Product scoreLabel mapping (for TypeScript scoreLabel field):
#   score >= 90 → "Excellent"
#   score >= 75 → "Good"
#   score >= 60 → "Fair"
#   score <  60 → "Concern"
#
# Brand verdict mapping (for TypeScript Brand.verdict field):
#   avgScore >= 90 → "Excellent"
#   avgScore >= 75 → "Good"
#   avgScore >= 60 → "Fair"
#   avgScore <  60 → "Concern"
#
# CONSUMER LANGUAGE RULES for pillar note fields in TypeScript brand data:
#   - Write for a curious, non-scientific reader. No jargon.
#   - DO NOT mention: SCCS, MoS, DAp, SED, EU Regulation numbers, INCI,
#     "INCI position", "anchor", "1% threshold", "Henderson-Hasselbalch",
#     "undissociated form", "CAS number", "SVHC", "Annex II/III/V".
#   - DO explain: what the concern means for their skin/health,
#     what to watch out for, what good things the formula does.
#   - DO flag clearly: fragrance (say "contains fragrance"), penetration
#     enhancers (say "this formula contains ingredients that increase how
#     deeply other actives absorb"), sub-functional actives ("present in
#     a very small amount - likely too little for visible results").
#   - DO credit clearly: good stability choices, penetration transparency,
#     effective active concentrations, cruelty-free status.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Example usage with INCI hierarchy
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    from datetime import date

    # Example: Mamaearth Vitamin C Daily Glow Serum
    example_inci = [
        INCIIngredient(position=1,  name="Aqua",                         category="solvent"),
        INCIIngredient(position=2,  name="Sodium Ascorbyl Phosphate",    category="active",      claimed_pct=0.10),
        INCIIngredient(position=3,  name="Curcuma Longa Root Extract",   category="active"),
        INCIIngredient(position=4,  name="Niacinamide",                  category="active"),
        INCIIngredient(position=5,  name="Glycerin",                     category="humectant"),
        INCIIngredient(position=6,  name="Sodium Hyaluronate",           category="active"),
        INCIIngredient(position=7,  name="Aloe Barbadensis Leaf Extract",category="active"),
        INCIIngredient(position=8,  name="Panthenol",                    category="active"),
        INCIIngredient(position=9,  name="Allantoin",                    category="soothing"),
        INCIIngredient(position=10, name="Carbomer",                     category="thickener"),
        INCIIngredient(position=11, name="Xanthan Gum",                  category="thickener"),
        INCIIngredient(position=12, name="Phenoxyethanol",               category="preservative"),  # <-- 1% anchor
        INCIIngredient(position=13, name="Ethylhexylglycerin",           category="preservative"),
        INCIIngredient(position=14, name="Parfum",                       category="fragrance"),
        INCIIngredient(position=15, name="Sodium Hydroxide",             category="ph_adjuster"),
        INCIIngredient(position=16, name="Citric Acid",                  category="ph_adjuster"),
    ]

    example = EvaluationData(
        product_name="Vitamin C Daily Glow Serum",
        brand_name="Mamaearth",
        evaluator_name="The Clean Sheet",
        evaluation_date=str(date.today()),
        product_type=ProductType.LEAVE_ON,
        target_markets=["India"],
        layer1_result=Layer1Result.PASS,

        inci_ingredients=example_inci,
        hero_actives_to_validate=[
            "Sodium Ascorbyl Phosphate",
            "Niacinamide",
            "Sodium Hyaluronate",
        ],

        pillar1=Pillar1Scores(
            carcinogenicity=5.0,
            mutagenicity_genotoxicity=5.0,
            reproductive_developmental=5.0,
            endocrine_disruption=4.0,      # Parfum without named allergens - deduction
            organ_systemic_toxicity=5.0,
            product_type_factor=4.0,       # leave-on, but mild actives
            concentration_limit_compliance=5.0,
            aggregate_daily_exposure=4.0,  # fragrance exposure unknown
            skin_sensitisation=3.0,        # Parfum without allergen declaration
            eye_irritation=3.0,
            respiratory_irritation=2.0,
            parfum_without_named_allergens_leave_on=True,
        ),

        pillar2=Pillar2Scores(
            evidence_exists_for_claims=2.5,     # SAP less potent than EAA; lower evidence threshold
            evidence_from_credible_source=2.0,
            formulation_logic_supports_claims=1.0,  # will be auto-adjusted by INCI validation
            microbiological_stability=2.0,
            chemical_physical_stability=2.0,
            packaging_compatibility=1.5,        # SAP more stable than L-AA, but not optimal
            gmp_compliance_evidence=2.0,
            stability_testing_transparency=1.0,
            batch_traceability_evidence=1.0,
        ),

        pillar3=Pillar3Scores(
            inci_format_complete=4.0,
            active_concentration_ranges=1.0,    # only SAP concentration claimed (10%)
            fragrance_allergens_disclosed=0.0,  # Parfum without named allergens
            correct_inci_names_used=2.0,
            language_accessibility=2.0,
            allergen_highlighting=1.0,          # fragrance warning absent
            no_prohibited_terms=0.5,            # "toxin-free" is a prohibited term
            claims_match_ingredient_profile=1.5,  # will be auto-adjusted; SAP < L-AA potency
        ),

        pillar4=Pillar4Scores(
            no_finished_product_animal_testing=1.5,
            no_ingredient_animal_testing=0.5,   # MADE SAFE certified but not full ingredient AT-free
            not_sold_in_mandatory_testing_market=0.5,
            natural_origin_index=0.5,
            not_on_cosmos_prohibited=0.5,       # synthetic fragrance present
            no_synthetic_fragrance_peg_silicone_leave_on=0.0,
            rspo_palm_oil=0.0,                  # no RSPO disclosure
            mica_sourcing_verified=0.0,
            no_conflict_minerals=0.5,
            recyclable_or_refillable_primary=0.5,
            pcr_content_30pct=0.0,
            minimal_plastic_secondary=0.5,
        ),
    )

    scorer = CleanSheetScorer()
    result = scorer.calculate(example)
    print(scorer.format_report(result))

    print("\n\nINCIHierarchyAnalyzer standalone example:")
    analyzer = INCIHierarchyAnalyzer()
    summary  = analyzer.inci_summary(example_inci)
    print(f"Anchor position (1% threshold): {summary['one_percent_anchor_position']}")
    print(f"CPEs found: {summary['penetration_enhancers_identified']}")
