"use client";

import { useState } from "react";
import { ChevronDown, Scale, FlaskConical, Building2, ShieldCheck, Leaf } from "lucide-react";
import type { ReactNode } from "react";

/* ── Graphic tick SVG ───────────────────────────────────── */

function TickOutline({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <defs>
        <linearGradient id="tg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2E9E96" />
          <stop offset="100%" stopColor="#248179" />
        </linearGradient>
      </defs>
      <circle cx="8" cy="8" r="7" fill="rgba(36,129,121,0.08)" stroke="url(#tg2)" strokeWidth="1.2" />
      <path
        d="M5 8.2l2.1 2.1L11 6"
        stroke="#248179"
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
  checks: Check[];
};

const pillars: Pillar[] = [
  {
    id: "legal",
    name: "Legal Compliance",
    sublabel: "Permitted in every assessed market",
    icon: <Scale size={15} />,
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
    icon: <FlaskConical size={15} />,
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
    icon: <Building2 size={15} />,
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
    icon: <ShieldCheck size={15} />,
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
    name: "Ethics and Sourcing",
    sublabel: "Formula and ingredient origins reviewed",
    icon: <Leaf size={15} />,
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
    <section className="bg-white px-5 pt-3 pb-10">
      <div className="max-w-5xl mx-auto space-y-1.5">
        {pillars.map((pillar) => {
          const isOpen = openPillars.has(pillar.id);
          return (
            <div
              key={pillar.id}
              className="rounded-2xl overflow-hidden transition-shadow duration-300"
              style={{
                border: isOpen ? "1px solid #c2e8e4" : "1px solid #EEEDED",
                boxShadow: isOpen ? "0 2px 16px -4px rgba(36,129,121,0.1)" : "none",
              }}
            >
              {/* Pillar header */}
              <button
                onClick={() => togglePillar(pillar.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-300"
                style={{
                  background: isOpen
                    ? "linear-gradient(135deg, #edf8f7 0%, #f5fafa 60%, #f8fafa 100%)"
                    : "#ffffff",
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isOpen ? "rgba(36,129,121,0.1)" : "rgba(0,0,0,0.04)",
                    color: isOpen ? "#248179" : "#A7A5A5",
                  }}
                >
                  {pillar.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-base font-medium tracking-tight transition-colors duration-200"
                    style={{ color: isOpen ? "#262525" : "#343232" }}
                  >
                    {pillar.name}
                  </p>
                  <p
                    className="text-xs mt-0.5 transition-colors duration-200"
                    style={{ color: isOpen ? "#8E8B8B" : "#A7A5A5" }}
                  >
                    {pillar.sublabel}
                  </p>
                </div>

                {/* Check count pill */}
                <span
                  className="hidden sm:inline-flex items-center justify-center rounded-full text-[10px] px-2 py-0.5 mr-2 flex-shrink-0 transition-all duration-300"
                  style={{
                    background: isOpen ? "rgba(36,129,121,0.1)" : "rgba(0,0,0,0.04)",
                    color: isOpen ? "#248179" : "#A7A5A5",
                  }}
                >
                  {pillar.checks.length}
                </span>

                <ChevronDown
                  size={14}
                  className="flex-shrink-0 transition-all duration-300"
                  style={{
                    color: isOpen ? "#248179" : "#C2C0C0",
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
                  <div style={{ borderTop: "1px solid #e8f5f3" }}>
                    {pillar.checks.map((check, idx) => {
                      const isCheckOpen = openChecks.has(check.id);
                      return (
                        <div
                          key={check.id}
                          style={{
                            borderBottom: idx < pillar.checks.length - 1 ? "1px solid #f0f9f8" : "none",
                          }}
                        >
                          {/* Check row */}
                          <button
                            onClick={() => toggleCheck(check.id)}
                            className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors"
                            style={{
                              background: isCheckOpen ? "rgba(36,129,121,0.03)" : "transparent",
                            }}
                          >
                            <TickOutline size={14} />
                            <span className="flex-1 text-sm text-ink-700 leading-snug">
                              {check.label}
                            </span>
                            <ChevronDown
                              size={11}
                              className="flex-shrink-0 transition-transform duration-200"
                              style={{
                                color: isCheckOpen ? "#248179" : "#C2C0C0",
                                transform: isCheckOpen ? "rotate(180deg)" : "rotate(0deg)",
                              }}
                            />
                          </button>

                          {/* Animated detail reveal */}
                          <div
                            className="grid"
                            style={{
                              gridTemplateRows: isCheckOpen ? "1fr" : "0fr",
                              transition: "grid-template-rows 0.24s cubic-bezier(0.4,0,0.2,1)",
                            }}
                          >
                            <div className="overflow-hidden">
                              <div className="pb-4" style={{ paddingLeft: "2.85rem", paddingRight: "1.25rem" }}>
                                {/* Gradient left border via pseudo-wrapper */}
                                <div
                                  className="pl-4 py-1"
                                  style={{
                                    borderLeft: "2px solid transparent",
                                    backgroundImage: "linear-gradient(white, white), linear-gradient(to bottom, #2E9E96, #A8E4DF)",
                                    backgroundOrigin: "border-box",
                                    backgroundClip: "padding-box, border-box",
                                  }}
                                >
                                  <p className="text-sm text-ink-600 leading-relaxed">
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

        <div className="mt-8 pt-5 border-t border-ink-100">
          <div className="flex items-start gap-3 max-w-xl mx-auto">
            <div className="flex gap-1 pt-1 flex-shrink-0">
              {["#2E9E96","#45B8B0","#A8E4DF"].map((c) => (
                <span key={c} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
              ))}
            </div>
            <p className="text-ink-400 text-xs leading-relaxed">
              Reviewed by an independent panel of cosmetic scientists, toxicologists,
              regulatory specialists, and dermatologists.
              Every check above was assessed against submitted laboratory evidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
