"use client";

import { useState } from "react";
import { Sun, Moon, AlertTriangle, CheckCircle, ChevronRight, ChevronDown, Layers } from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────
type SkinType    = "Dry" | "Oily" | "Combination" | "Normal" | "Sensitive";
type Concern     = "Acne" | "Pigmentation" | "Aging" | "Dryness" | "Oiliness" | "Sensitivity" | "Redness";
type BudgetRange = "Under ₹500" | "₹500–₹1500" | "₹1500–₹3000" | "₹3000+";

interface Profile {
  skinType:   SkinType | null;
  concerns:   Concern[];
  sensitivity: boolean;
  pregnancy:  boolean;
  babyCare:   boolean;
  budget:     BudgetRange | null;
}

interface RoutineStep {
  slot:    string;
  label:   string;
  product: string | null;
  score:   number | null;
  note:    string | null;
  warn:    string | null;
}

// ── Routine generation logic ──────────────────────────────────────────────────
function generateRoutine(profile: Profile): { morning: RoutineStep[]; night: RoutineStep[]; warnings: string[] } {
  const warnings: string[] = [];

  if (profile.pregnancy) {
    warnings.push("Retinol and retinoids are not recommended during pregnancy or if trying to conceive. Swap for bakuchiol.");
    warnings.push("Avoid salicylic acid above 2% and chemical sunscreen filters like Oxybenzone during pregnancy. Opt for mineral SPF.");
  }
  if (profile.sensitivity) {
    warnings.push("Fragrance is a leading cause of contact sensitisation. Prioritise fragrance-free products across your routine.");
  }

  const morning: RoutineStep[] = [
    {
      slot: "Cleanser",
      label: "Morning Cleanser",
      product: profile.skinType === "Oily" ? "Gentle foam cleanser" :
               profile.skinType === "Dry"  ? "Cream or micellar cleanser" :
               "Gentle gel cleanser",
      score: null,
      note:  profile.skinType === "Dry" ? "Avoid surfactants that disrupt your barrier in the morning." : null,
      warn:  null,
    },
    {
      slot: "Toner / Essence",
      label: "Toner",
      product: profile.concerns.includes("Acne") ? "BHA toner (Salicylic 0.5–1%)" :
               profile.concerns.includes("Pigmentation") ? "Niacinamide toner" :
               "Hydrating essence",
      score: null,
      note:  null,
      warn:  profile.sensitivity ? "Skip acids if skin is actively inflamed." : null,
    },
    {
      slot: "Serum",
      label: "AM Serum",
      product: profile.concerns.includes("Pigmentation") ? "Vitamin C serum" :
               profile.concerns.includes("Acne")         ? "Niacinamide serum" :
               profile.concerns.includes("Aging")        ? "Peptide serum" :
               "Hydrating serum (Hyaluronic Acid)",
      score: null,
      note:  profile.concerns.includes("Pigmentation") ? "Pair with SPF 50 - Vitamin C is photosensitising." : null,
      warn:  null,
    },
    {
      slot: "Moisturiser",
      label: "Moisturiser",
      product: profile.skinType === "Oily"      ? "Lightweight gel moisturiser" :
               profile.skinType === "Dry"       ? "Rich barrier cream (Ceramide + Shea)" :
               profile.skinType === "Sensitive" ? "Minimal-ingredient barrier moisturiser" :
               "Balanced moisturiser",
      score: null,
      note:  null,
      warn:  null,
    },
    {
      slot: "Sunscreen",
      label: "Sunscreen SPF 50",
      product: profile.pregnancy ? "Mineral SPF (Zinc Oxide / Titanium Dioxide)" : "SPF 50+ PA++++",
      score: null,
      note:  "Sunscreen is non-negotiable - reapply every 2 hours outdoors.",
      warn:  profile.pregnancy ? "Avoid chemical UV filters (Oxybenzone, Octinoxate) during pregnancy." : null,
    },
  ];

  const night: RoutineStep[] = [
    {
      slot: "Cleanser",
      label: "PM Cleanser",
      product: "Low-pH gentle cleanser",
      score: null,
      note: "Double cleanse if you wear SPF or makeup.",
      warn: null,
    },
    {
      slot: "Treatment",
      label: "Treatment / Active",
      product: profile.pregnancy           ? "Bakuchiol serum (retinol alternative)" :
               profile.concerns.includes("Aging")        ? "Retinol 0.025–0.1%" :
               profile.concerns.includes("Acne")         ? "BHA / Salicylic 2%" :
               profile.concerns.includes("Pigmentation") ? "Alpha Arbutin + AHA" :
               "Peptide repair serum",
      score: null,
      note:  profile.concerns.includes("Aging") && !profile.pregnancy
              ? "Start retinol 2–3 nights/week and build slowly." : null,
      warn:  profile.pregnancy ? "Retinol replaced with bakuchiol for pregnancy safety." : null,
    },
    {
      slot: "Eye Cream",
      label: "Eye Cream",
      product: profile.concerns.includes("Aging") ? "Peptide eye cream" : null,
      score: null,
      note: profile.concerns.includes("Aging") ? "Apply with ring finger - gentle pressure only." : null,
      warn: null,
    },
    {
      slot: "Moisturiser",
      label: "Night Moisturiser",
      product: profile.skinType === "Dry"  ? "Rich ceramide barrier cream" :
               profile.skinType === "Oily" ? "Oil-free gel moisturiser" :
               "Balanced night moisturiser",
      score: null,
      note:  null,
      warn:  null,
    },
  ];

  // filter out null product steps
  const finalNight = night.filter(s => s.product !== null);

  // stacking warnings
  const hasRetinol  = finalNight.some(s => s.product?.toLowerCase().includes("retinol"));
  const hasAHA      = [...morning, ...finalNight].some(s => s.product?.toLowerCase().includes("aha"));
  const hasVitaminC = morning.some(s => s.product?.toLowerCase().includes("vitamin c"));

  if (hasRetinol && hasAHA) {
    warnings.push("Avoid using AHA exfoliants on the same night as retinol - this can cause irritation. Alternate nights instead.");
  }
  if (hasVitaminC && !morning.some(s => s.slot === "Sunscreen")) {
    warnings.push("Vitamin C increases photosensitivity. Always follow with SPF 50 in the morning.");
  }

  return { morning, night: finalNight, warnings };
}

// ── Step component ────────────────────────────────────────────────────────────
function RoutineStepCard({ step }: { step: RoutineStep }) {
  if (!step.product) return null;
  return (
    <div className="flex gap-3 py-3 border-b border-[#b0a8a4]/10 last:border-0">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f7f6f6] flex items-center justify-center mt-0.5">
        <span className="text-[10px] text-[#b0a8a4]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          {step.slot.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] tracking-widest uppercase text-[#b0a8a4]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            {step.label}
          </span>
        </div>
        <p className="text-[14px] text-[#282828] mt-0.5"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          {step.product}
        </p>
        {step.note && (
          <p className="text-[12px] text-[#248179] mt-1 flex items-start gap-1.5"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            <CheckCircle size={12} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
            {step.note}
          </p>
        )}
        {step.warn && (
          <p className="text-[12px] text-[#fd6158] mt-1 flex items-start gap-1.5"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            <AlertTriangle size={12} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
            {step.warn}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Selector helpers ──────────────────────────────────────────────────────────
function Chip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[13px] px-3.5 py-2 rounded-full border transition-all duration-150 select-none"
      style={{
        fontFamily: "Helvetica, Arial, sans-serif",
        minHeight: 36,
        background:    active ? "#248179"             : "white",
        color:         active ? "white"               : "#282828",
        borderColor:   active ? "#248179"             : "rgba(176,168,164,0.3)",
      }}
    >
      {label}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RoutinePage() {
  const [profile, setProfile] = useState<Profile>({
    skinType: null, concerns: [], sensitivity: false,
    pregnancy: false, babyCare: false, budget: null,
  });
  const [built, setBuilt] = useState(false);
  const [routine, setRoutine] = useState<ReturnType<typeof generateRoutine> | null>(null);
  const [tab, setTab] = useState<"morning" | "night">("morning");

  const toggleConcern = (c: Concern) =>
    setProfile(p => ({
      ...p,
      concerns: p.concerns.includes(c) ? p.concerns.filter(x => x !== c) : [...p.concerns, c],
    }));

  const handleBuild = () => {
    if (!profile.skinType) return;
    setRoutine(generateRoutine(profile));
    setBuilt(true);
  };

  const SKIN_TYPES:   SkinType[]   = ["Dry", "Oily", "Combination", "Normal", "Sensitive"];
  const CONCERNS:     Concern[]    = ["Acne", "Pigmentation", "Aging", "Dryness", "Oiliness", "Sensitivity", "Redness"];
  const BUDGETS:      BudgetRange[] = ["Under ₹500", "₹500–₹1500", "₹1500–₹3000", "₹3000+"];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#b0a8a4]/15 px-4 sm:px-6 lg:px-8 py-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Layers size={16} strokeWidth={1.5} className="text-[#248179]" />
          <span className="text-[11px] tracking-widest uppercase text-[#b0a8a4]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Routine Builder
          </span>
        </div>
        <h1 className="text-[22px] text-[#282828]"
          style={{ fontFamily: "Cooper BT, Georgia, serif", fontWeight: 300 }}>
          Build your routine
        </h1>
        <p className="text-[14px] text-[#b0a8a4] mt-1"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          Answer a few questions. Get a personalised AM and PM routine with ingredient conflict checks.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {!built ? (
          <>
            {/* Skin type */}
            <div>
              <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4] mb-3"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                Skin Type
              </p>
              <div className="flex flex-wrap gap-2">
                {SKIN_TYPES.map(t => (
                  <Chip key={t} label={t} active={profile.skinType === t}
                    onClick={() => setProfile(p => ({ ...p, skinType: t }))} />
                ))}
              </div>
            </div>

            {/* Concerns */}
            <div>
              <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4] mb-3"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                Main Concerns (select all that apply)
              </p>
              <div className="flex flex-wrap gap-2">
                {CONCERNS.map(c => (
                  <Chip key={c} label={c} active={profile.concerns.includes(c)}
                    onClick={() => toggleConcern(c)} />
                ))}
              </div>
            </div>

            {/* Special considerations */}
            <div>
              <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4] mb-3"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                Special Considerations
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "sensitivity", label: "Sensitive / reactive skin" },
                  { key: "pregnancy",   label: "Pregnant / trying to conceive" },
                  { key: "babyCare",    label: "Baby or child care" },
                ].map(({ key, label }) => (
                  <Chip key={key} label={label}
                    active={profile[key as keyof Profile] as boolean}
                    onClick={() => setProfile(p => ({ ...p, [key]: !p[key as keyof Profile] }))} />
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4] mb-3"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                Budget per product
              </p>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map(b => (
                  <Chip key={b} label={b} active={profile.budget === b}
                    onClick={() => setProfile(p => ({ ...p, budget: b }))} />
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleBuild}
              disabled={!profile.skinType}
              className="w-full py-4 rounded-full text-[14px] transition-all duration-200"
              style={{
                fontFamily: "Helvetica, Arial, sans-serif",
                background:   profile.skinType ? "#248179" : "#f7f6f6",
                color:        profile.skinType ? "white"   : "#b0a8a4",
                cursor:       profile.skinType ? "pointer" : "not-allowed",
              }}
            >
              Build my routine
              <ChevronRight size={16} strokeWidth={1.5} className="inline ml-1.5" />
            </button>
          </>
        ) : routine ? (
          <>
            {/* Warnings */}
            {routine.warnings.length > 0 && (
              <div className="rounded-2xl p-4 space-y-2"
                style={{ background: "rgba(253,97,88,0.04)", border: "1px solid rgba(253,97,88,0.15)" }}>
                <p className="text-[11px] tracking-widest uppercase text-[#fd6158] mb-2"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                  Routine flags
                </p>
                {routine.warnings.map((w, i) => (
                  <p key={i} className="text-[13px] text-[#282828] flex items-start gap-2"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    <AlertTriangle size={13} strokeWidth={1.5} className="text-[#fd6158] flex-shrink-0 mt-0.5" />
                    {w}
                  </p>
                ))}
              </div>
            )}

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-[#f7f6f6] rounded-full">
              {(["morning", "night"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] transition-all"
                  style={{
                    fontFamily: "Helvetica, Arial, sans-serif",
                    background:  tab === t ? "white" : "transparent",
                    color:       tab === t ? "#282828" : "#b0a8a4",
                    boxShadow:   tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {t === "morning"
                    ? <><Sun size={14} strokeWidth={1.5} /> Morning</>
                    : <><Moon size={14} strokeWidth={1.5} /> Night</>}
                </button>
              ))}
            </div>

            {/* Steps */}
            <div className="bg-white rounded-2xl border border-[#b0a8a4]/15 px-4 divide-y-0">
              {(tab === "morning" ? routine.morning : routine.night).map((step, i) => (
                <RoutineStepCard key={i} step={step} />
              ))}
            </div>

            {/* Find products CTA */}
            <div className="rounded-2xl p-5 text-center"
              style={{ background: "rgba(36,129,121,0.04)", border: "1px solid rgba(36,129,121,0.15)" }}>
              <p className="text-[14px] text-[#282828] mb-1"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                Ready to find the right products?
              </p>
              <p className="text-[12px] text-[#b0a8a4] mb-4"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                Browse scored products filtered for your skin type and concerns.
              </p>
              <Link
                href={`/shop?skinType=${profile.skinType ?? ""}&concerns=${profile.concerns.join(",")}`}
                className="inline-block px-6 py-3 rounded-full text-white text-[13px] transition-colors"
                style={{ background: "#248179", fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Shop for my routine
              </Link>
            </div>

            {/* Restart */}
            <button
              onClick={() => { setBuilt(false); setRoutine(null); }}
              className="w-full py-3 text-[13px] text-[#b0a8a4] hover:text-[#282828] transition-colors"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Start over
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
