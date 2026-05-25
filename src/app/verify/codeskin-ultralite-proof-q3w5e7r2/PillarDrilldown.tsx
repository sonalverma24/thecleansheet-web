"use client";

import { useState } from "react";
import { ChevronDown, Scale, FlaskConical, Building2, ShieldCheck, Leaf } from "lucide-react";
import type { ReactNode } from "react";

/* ── Graphic tick SVG ───────────────────────────────────── */

function TickOutline({ size = 14, color = "#248179" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <circle cx="8" cy="8" r="7" fill={`${color}12`} stroke={color} strokeWidth="1.2" />
      <path
        d="M5 8.2l2.1 2.1L11 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Check = {
  id: string;
  label: string;
  detail: string;
};

type Pillar = {
  id: string;
  name: string;
  sublabel: string;
  icon: ReactNode;
  color: string;
  badge: string;
  checks: Check[];
};

const pillars: Pillar[] = [
  {
    id: "legal",
    name: "Legal Compliance",
    sublabel: "Permitted in every assessed market",
    icon: <Scale size={16} />,
    color: "#fd6158",
    badge: "VERIFIED",
    checks: [
      {
        id: "india",
        label: "Permitted in India",
        detail: "Reviewed against India's Cosmetics Rules 2020 (CDSCO). All three UV filters are on the permitted list for sunscreens. No prohibited or restricted substances identified.",
      },
      {
        id: "eu",
        label: "Permitted in the European Union",
        detail: "Reviewed against EU Cosmetics Regulation EC 1223/2009. All three UV filters are listed in Annex VI (permitted UV filters) and are within the maximum permitted concentrations.",
      },
      {
        id: "no-prohibited",
        label: "No prohibited substances",
        detail: "Formula screened against the TCS prohibited ingredient list and the EU Annex II prohibited substances list. No prohibited substances identified.",
      },
      {
        id: "no-formaldehyde",
        label: "No formaldehyde releasers",
        detail: "Preservative system reviewed: Benzyl Alcohol, Sodium Benzoate, Potassium Sorbate, 1,2-Hexanediol. None of these are formaldehyde-releasing preservatives.",
      },
      {
        id: "no-banned-filters",
        label: "No globally banned UV filters",
        detail: "No 4-MBC, no oxybenzone, no octinoxate. These are restricted or banned in multiple markets due to safety concerns. None are present in this formula.",
      },
      {
        id: "inci-disclosed",
        label: "Full ingredient list on label",
        detail: "Complete INCI list present on the product label, in descending order of concentration, as required by India's Cosmetics Rules 2020 and EU Regulation EC 1223/2009.",
      },
      {
        id: "claims-legal",
        label: "No prohibited marketing claims",
        detail: "Label and marketing material reviewed. No 'waterproof' or '100% protection' claims found. Both are prohibited under Indian and EU cosmetic regulations for sunscreen products.",
      },
    ],
  },
  {
    id: "safety",
    name: "Ingredient Safety",
    sublabel: "Every ingredient reviewed for known hazards",
    icon: <FlaskConical size={16} />,
    color: "#e8963a",
    badge: "VERIFIED",
    checks: [
      {
        id: "hazard",
        label: "Hazard profile completed",
        detail: "Each ingredient assessed for carcinogenicity, reproductive toxicity, endocrine disruption, and skin sensitisation potential. No high-hazard substances identified at the concentrations used in this formula.",
      },
      {
        id: "exposure",
        label: "Exposure and absorption assessed",
        detail: "Leave-on product with full-face application. Daily skin exposure modelled. Margin of safety calculations completed for all substances with toxicological significance.",
      },
      {
        id: "sensitisation",
        label: "Sensitisation review completed",
        detail: "Formula reviewed for known skin sensitisers. Benzyl Alcohol is present as part of the preservative system at preservative-level concentration. No safety concern identified at assessed levels.",
      },
      {
        id: "phototoxic",
        label: "Phototoxic botanical screen: clear",
        detail: "Three botanical extracts reviewed: Aloe Barbadensis Leaf Juice, Chondrus Crispus (Red Algae) Extract, Olea Europaea Leaf Extract. No furanocoumarins, hypericin, or psoralens identified. No phototoxicity risk.",
      },
      {
        id: "svhc",
        label: "No substances of very high concern",
        detail: "Formula screened against the European Chemicals Agency SVHC candidate list. No substances of very high concern (carcinogens, mutagens, or endocrine disruptors on the ECHA list) identified.",
      },
      {
        id: "no-formaldehyde-2",
        label: "Preservative system confirmed clean",
        detail: "Benzyl Alcohol + Sodium Benzoate + Potassium Sorbate + 1,2-Hexanediol. This combination is an established, formaldehyde-free preservative system. No parabens, phenoxyethanol, or formaldehyde releasers.",
      },
    ],
  },
  {
    id: "manufacturing",
    name: "Manufacturing Quality",
    sublabel: "Facility, process, and batch documentation reviewed",
    icon: <Building2 size={16} />,
    color: "#248179",
    badge: "VERIFIED",
    checks: [
      {
        id: "gmp",
        label: "GMP-certified manufacturing facility",
        detail: "Manufactured by Effeza Science Pvt Ltd. Facility is GMP-certified and holds an FDA India-approved manufacturing licence for cosmetics.",
      },
      {
        id: "iso-22716",
        label: "ISO 22716 Good Manufacturing Practices",
        detail: "Manufacturing process confirmed to operate under ISO 22716 GMP for cosmetics. Standard covers personnel hygiene, premises, equipment, raw materials, production, and finished product controls.",
      },
      {
        id: "stability",
        label: "Stability testing completed",
        detail: "Accelerated stability data reviewed: 40 degrees Celsius at 75% relative humidity. Product maintained physical integrity (appearance, consistency, pH, viscosity) under test conditions.",
      },
      {
        id: "preservative",
        label: "Preservative efficacy confirmed",
        detail: "Preservative system tested to ISO 11930 (antimicrobial protection evaluation). Passed. The product is adequately protected against microbial contamination under normal use.",
      },
      {
        id: "suppliers",
        label: "UV filter supplier documentation reviewed",
        detail: "All three UV filters (Tinosorb M, Uvinul A Plus, Uvinul T 150) are sourced from BASF. Certificate of analysis reviewed. Filter identities and purity confirmed.",
      },
    ],
  },
  {
    id: "claims",
    name: "Claims Verified",
    sublabel: "Every claim reviewed against submitted test evidence",
    icon: <ShieldCheck size={16} />,
    color: "#fd6158",
    badge: "VERIFIED",
    checks: [
      {
        id: "spf",
        label: "SPF 50+",
        detail: "Independent lab result: SPF 59.92, tested to ISO 24444. Label claims SPF 50+. The tested result exceeds the label claim - the product delivers more protection than stated.",
      },
      {
        id: "pa",
        label: "PA++++ UVA protection",
        detail: "UVAPF tested at 22.07 using the JCIA in-vitro method. PA++++ certification requires a UVAPF of 16 or above. This result of 22.07 qualifies comfortably.",
      },
      {
        id: "water",
        label: "Water resistant for 80 minutes",
        detail: "After 80 minutes of water immersion, 94% of the original SPF was retained. Tested to ISO 16217 water resistance protocol. Label specifies 80-minute duration - compliant.",
      },
      {
        id: "nc",
        label: "Non-comedogenic",
        detail: "28-day clinical study. 33 adults with oily and mixed-oily skin. Zero new comedones observed. 61.5% reduction in inflammatory acne lesions over the study period. Dermatologist supervised.",
      },
      {
        id: "derma",
        label: "Dermatologist-tested",
        detail: "Primary irritation patch test conducted under dermatologist supervision. Zero irritation reported across all participants.",
      },
      {
        id: "ophthal",
        label: "Ophthalmologist-tested",
        detail: "3-day ocular safety study. Twice-daily periocular application under ophthalmologist supervision. No eye irritation reported.",
      },
      {
        id: "reef",
        label: "Reef-safe",
        detail: "No oxybenzone, octinoxate, or octisalate in the formula. These are the UV filters banned under Hawaii's Reef Safe Sunscreen Act and Palau's reef protection legislation. Claim substantiated by confirmed ingredient absence.",
      },
      {
        id: "vegan",
        label: "Vegan and cruelty-free",
        detail: "Full INCI reviewed. No animal-derived ingredients identified. Saccharomyces Ferment Lysate Filtrate is yeast fermentation origin, not animal-derived. Brand cruelty-free declaration reviewed.",
      },
      {
        id: "fragrance",
        label: "Fragrance-free",
        detail: "No parfum, fragrance, or masking fragrance in the INCI. No EU 26 fragrance allergens detected above the leave-on product threshold of 0.001%.",
      },
      {
        id: "hydration",
        label: "Hydration clinically measured",
        detail: "Corneometer-based skin surface hydration measurement on dry skin panel. Result: 65% increase at 8 hours. 38% increase sustained at 24 hours.",
      },
    ],
  },
  {
    id: "ethics",
    name: "Ethics & Sourcing",
    sublabel: "Formula and ingredient origins reviewed",
    icon: <Leaf size={16} />,
    color: "#6b9e3a",
    badge: "VERIFIED",
    checks: [
      {
        id: "no-animal",
        label: "No animal-derived ingredients",
        detail: "Complete INCI reviewed for animal-origin ingredients. None identified. Saccharomyces Ferment Lysate Filtrate is confirmed yeast fermentation origin.",
      },
      {
        id: "cruelty-free",
        label: "Cruelty-free",
        detail: "Brand declaration reviewed. No animal testing conducted on this product or its ingredient components.",
      },
      {
        id: "no-palm-mica",
        label: "No palm-derived or mica ingredients",
        detail: "Formula reviewed for palm-derived ingredients and mica (commonly associated with child labour concerns). Neither was identified in the INCI for this product.",
      },
      {
        id: "no-reef-toxic",
        label: "No reef-toxic UV filters",
        detail: "No oxybenzone, octinoxate, or octisalate. These filters are associated with coral bleaching. None are present in this formula.",
      },
    ],
  },
];

export default function PillarDrilldown() {
  const [openPillars, setOpenPillars] = useState<Set<string>>(new Set());
  const [openChecks, setOpenChecks] = useState<Set<string>>(new Set());

  function togglePillar(id: string) {
    setOpenPillars((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setOpenChecks(new Set());
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleCheck(id: string) {
    setOpenChecks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <section className="px-5 pt-4 pb-10">
      <div className="max-w-5xl mx-auto space-y-3">
        {pillars.map((pillar) => {
          const isOpen = openPillars.has(pillar.id);
          return (
            <div
              key={pillar.id}
              className="bg-white rounded-lg overflow-hidden transition-shadow duration-300"
              style={{
                borderLeft: `4px solid ${pillar.color}`,
                boxShadow: isOpen
                  ? "0 4px 16px -4px rgba(0,0,0,0.08)"
                  : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* Pillar header */}
              <button
                onClick={() => togglePillar(pillar.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-200"
                style={{
                  background: isOpen ? `${pillar.color}06` : "#ffffff",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: `${pillar.color}14`,
                    color: pillar.color,
                  }}
                >
                  {pillar.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[15px] font-medium tracking-tight"
                    style={{ color: "#282828" }}
                  >
                    {pillar.name}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#b0a8a4" }}>
                    {pillar.sublabel}
                  </p>
                </div>

                {/* Badge pill */}
                <span
                  className="text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded flex-shrink-0"
                  style={{
                    background: "#248179",
                    color: "#ffffff",
                  }}
                >
                  {pillar.badge}
                </span>

                <ChevronDown
                  size={13}
                  className="flex-shrink-0 transition-all duration-300 ml-1"
                  style={{
                    color: isOpen ? pillar.color : "#C2C0C0",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Animated check list */}
              <div
                className="grid"
                style={{
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <div className="overflow-hidden">
                  <div style={{ borderTop: `1px solid ${pillar.color}18` }}>
                    {pillar.checks.map((check, idx) => {
                      const isCheckOpen = openChecks.has(check.id);
                      return (
                        <div
                          key={check.id}
                          style={{
                            borderBottom:
                              idx < pillar.checks.length - 1
                                ? "1px solid #f5f3f3"
                                : "none",
                          }}
                        >
                          {/* Check row */}
                          <button
                            onClick={() => toggleCheck(check.id)}
                            className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors"
                            style={{
                              background: isCheckOpen ? `${pillar.color}06` : "transparent",
                            }}
                          >
                            <TickOutline size={14} color={pillar.color} />
                            <span className="flex-1 text-[13px] leading-snug" style={{ color: "#4a4747" }}>
                              {check.label}
                            </span>
                            <ChevronDown
                              size={11}
                              className="flex-shrink-0 transition-transform duration-200"
                              style={{
                                color: isCheckOpen ? pillar.color : "#d4d2d2",
                                transform: isCheckOpen ? "rotate(180deg)" : "rotate(0deg)",
                              }}
                            />
                          </button>

                          {/* Detail reveal */}
                          <div
                            className="grid"
                            style={{
                              gridTemplateRows: isCheckOpen ? "1fr" : "0fr",
                              transition: "grid-template-rows 0.24s cubic-bezier(0.4,0,0.2,1)",
                            }}
                          >
                            <div className="overflow-hidden">
                              <div className="pb-3.5" style={{ paddingLeft: "2.75rem", paddingRight: "1.25rem" }}>
                                <div
                                  className="pl-4 py-1 max-w-prose"
                                  style={{
                                    borderLeft: `2px solid ${pillar.color}40`,
                                  }}
                                >
                                  <p className="text-[13px] leading-relaxed" style={{ color: "#6b6868" }}>
                                    {check.detail}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Methodology note — compact */}
        <div
          className="rounded-lg px-5 py-4 mt-6"
          style={{
            background: "rgba(210,255,52,0.12)",
            border: "1px solid rgba(210,255,52,0.3)",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex gap-1 pt-1 flex-shrink-0">
              {["#248179","#fd6158","#e8963a"].map((c) => (
                <span key={c} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
              ))}
            </div>
            <div>
              <p className="text-[10px] tracking-[0.15em] uppercase mb-1" style={{ color: "#b0a8a4" }}>
                Review methodology
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: "#6b6868" }}>
                Reviewed by an independent panel of cosmetic scientists, toxicologists,
                regulatory specialists, and dermatologists.
                Every check above was assessed against submitted laboratory evidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
