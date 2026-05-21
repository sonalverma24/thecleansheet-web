"use client";

import { useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";

/* ── Small utilities ─────────────────────────────────── */

function ExpandBtn({
  open,
  onClick,
  light,
}: {
  open: boolean;
  onClick: () => void;
  light?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Show less" : "Show test detail"}
      className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
      style={{
        background: light ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        border: `1px solid ${light ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
        transition: "background 0.15s",
      }}
    >
      <Plus
        size={11}
        style={{
          color: light ? "rgba(255,255,255,0.55)" : "#8E8B8B",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.22s ease",
        }}
      />
    </button>
  );
}

/* Grid rows expand — smooth CSS height animation without fixed values */
function DetailPanel({
  open,
  light,
  children,
}: {
  open: boolean;
  light?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows 0.3s ease",
      }}
    >
      <div className="overflow-hidden">
        <div
          className="pt-3.5 mt-3.5 space-y-1.5"
          style={{
            borderTop: `1px solid ${light ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  light,
}: {
  label: string;
  value: string;
  light?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span
        className="text-[10px]"
        style={{ color: light ? "rgba(255,255,255,0.35)" : "#A7A5A5" }}
      >
        {label}
      </span>
      <span
        className="text-[10px] text-right"
        style={{ color: light ? "rgba(255,255,255,0.7)" : "#5F5D5D" }}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Main bento grid ─────────────────────────────────── */

export default function CertBento() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (key: string) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="px-5 py-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">

          {/* SPF */}
          <div
            className="lg:col-span-2 rounded-xl p-5 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #1D5550 0%, #248179 65%, #2E9E96 100%)",
            }}
          >
            <ExpandBtn open={!!open.spf} onClick={() => toggle("spf")} light />
            <p className="text-teal-200 text-[9px] tracking-[0.2em] uppercase mb-3">
              SPF Performance
            </p>
            <p
              className="font-medium text-white tracking-tight leading-none"
              style={{ fontSize: "clamp(2.4rem, 5vw, 3.5rem)" }}
            >
              59<span className="text-teal-300/50">.92</span>
            </p>
            <p className="text-teal-200 text-xs mt-1 mb-2">
              Tested SPF · label claims 50+
            </p>
            <p className="text-white/40 text-xs leading-relaxed max-w-xs">
              Independent lab test. The product delivers more protection than labelled.
            </p>
            <DetailPanel open={!!open.spf} light>
              <Row label="Test method"        value="ISO 24444 in-vitro"               light />
              <Row label="Sample selection"   value="Randomised, no brand involvement"  light />
              <Row label="Label claim"        value="SPF 50+"                           light />
              <Row label="Tested result"      value="SPF 59.92"                         light />
              <Row label="Exceeds label by"   value="19.8%"                             light />
            </DetailPanel>
          </div>

          {/* PA++++ */}
          <div
            className="lg:col-span-2 rounded-xl p-5 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #B83028 0%, #E84940 65%, #FD6158 100%)",
            }}
          >
            <ExpandBtn open={!!open.pa} onClick={() => toggle("pa")} light />
            <p className="text-red-200 text-[9px] tracking-[0.2em] uppercase mb-3">
              UVA Protection
            </p>
            <p className="text-4xl font-medium text-white tracking-tight leading-none mb-1">
              PA++++
            </p>
            <p className="text-red-200 text-xs mb-2">UVAPF tested at 22.07</p>
            <p className="text-white/40 text-xs leading-relaxed">
              Highest UVA protection tier. UVAPF 16+ required. Tested at 22.07.
            </p>
            <DetailPanel open={!!open.pa} light>
              <Row label="Method"            value="JCIA in-vitro UVAPF"  light />
              <Row label="PA++++ threshold"  value="UVAPF 16 or above"    light />
              <Row label="Tested result"     value="22.07"                light />
              <Row label="Above threshold"   value="38%"                  light />
            </DetailPanel>
          </div>

          {/* Water resistance */}
          <div
            className="lg:col-span-2 rounded-xl p-4 relative"
            style={{ background: "#081918" }}
          >
            <ExpandBtn
              open={!!open.water}
              onClick={() => toggle("water")}
              light
            />
            <div className="flex items-start justify-between pr-8">
              <div>
                <p className="text-teal-700 text-[9px] tracking-[0.2em] uppercase mb-2">
                  Water Resistance
                </p>
                <h3 className="text-sm font-medium text-white tracking-tight">
                  80-Minute Water Resistant
                </h3>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p
                  className="text-2xl font-medium leading-none"
                  style={{ color: "#D6FF3E" }}
                >
                  94%
                </p>
                <p className="text-teal-700 text-[9px] mt-0.5">SPF retained</p>
              </div>
            </div>
            <p className="text-teal-600 text-xs leading-relaxed mt-3">
              After 80 minutes of water immersion. Tested to ISO 16217.
            </p>
            <DetailPanel open={!!open.water} light>
              <Row label="Standard"    value="ISO 16217"             light />
              <Row label="Duration"    value="80 minutes immersion"  light />
              <Row label="SPF after"   value="94% retained"          light />
            </DetailPanel>
          </div>

          {/* Non-comedogenic */}
          <div className="lg:col-span-1 rounded-xl p-4 bg-ink-50 border border-ink-100 relative">
            <ExpandBtn open={!!open.nc} onClick={() => toggle("nc")} />
            <p className="text-ink-400 text-[9px] tracking-[0.2em] uppercase mb-2.5 pr-8">
              Skin safety
            </p>
            <h3 className="text-sm font-medium text-ink-950 tracking-tight mb-2">
              Non-Comedogenic
            </h3>
            <p className="text-ink-500 text-xs leading-relaxed">
              28-day study. 33 adults. Zero new comedones.
            </p>
            <DetailPanel open={!!open.nc}>
              <Row label="Study design"    value="28-day randomised clinical"         />
              <Row label="Participants"    value="33 adults, oily and mixed-oily skin" />
              <Row label="New comedones"   value="0"                                  />
              <Row label="Acne lesions"    value="61.5% reduction"                    />
            </DetailPanel>
          </div>

          {/* Clinical testing */}
          <div className="lg:col-span-1 rounded-xl p-4 bg-ink-50 border border-ink-100 relative">
            <ExpandBtn
              open={!!open.clinical}
              onClick={() => toggle("clinical")}
            />
            <p className="text-ink-400 text-[9px] tracking-[0.2em] uppercase mb-3 pr-8">
              Clinical testing
            </p>
            <div className="space-y-3">
              {[
                {
                  title: "Dermatologist-Tested",
                  body: "Patch test. Zero irritation across all participants.",
                },
                {
                  title: "Ophthalmologist-Tested",
                  body: "3-day ocular safety study. No eye irritation.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="flex items-start gap-2">
                  <CheckCircle2
                    size={11}
                    className="text-teal-600 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs font-medium text-ink-900 tracking-tight">
                      {title}
                    </p>
                    <p className="text-ink-500 text-[11px] leading-relaxed">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <DetailPanel open={!!open.clinical}>
              <Row label="Derma test"    value="Primary irritation patch test"    />
              <Row label="Duration"      value="48h occlusive + 48h reading"      />
              <Row label="Ocular test"   value="Twice-daily, 3 days periocular"   />
              <Row label="Both outcomes" value="Zero irritation"                  />
            </DetailPanel>
          </div>

          {/* Hydration */}
          <div className="lg:col-span-2 rounded-xl p-4 bg-teal-50 border border-teal-100 relative">
            <ExpandBtn
              open={!!open.hydration}
              onClick={() => toggle("hydration")}
            />
            <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-3 pr-8">
              Hydration
            </p>
            <h3 className="text-sm font-medium text-ink-950 tracking-tight mb-4">
              Clinically Measured Hydration Increase
            </h3>
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-medium text-teal-600 tracking-tight leading-none">
                  65%
                </p>
                <p className="text-ink-400 text-[10px] mt-1">at 8 hours</p>
              </div>
              <div>
                <p className="text-2xl font-medium text-teal-600 tracking-tight leading-none">
                  38%
                </p>
                <p className="text-ink-400 text-[10px] mt-1">at 24 hours</p>
              </div>
            </div>
            <p className="text-ink-400 text-[10px] mt-3">
              Measured on dry skin panel.
            </p>
            <DetailPanel open={!!open.hydration}>
              <Row label="Method"       value="Corneometer measurement"   />
              <Row label="Panel"        value="Dry skin participants"      />
              <Row label="At 8 hours"   value="+65% increase"             />
              <Row label="At 24 hours"  value="+38% sustained"            />
            </DetailPanel>
          </div>

          {/* Formula verification — no expand, content is self-evident */}
          <div
            className="lg:col-span-4 rounded-xl p-5"
            style={{ background: "#0F2C2A" }}
          >
            <p className="text-teal-700 text-[9px] tracking-[0.2em] uppercase mb-4">
              Formula verification
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  title: "Reef-Safe",
                  body: "No oxybenzone, octinoxate, or octisalate. UV filters banned under Hawaii and Palau reef protection laws.",
                },
                {
                  title: "Vegan and Cruelty-Free",
                  body: "Full ingredient list reviewed. No animal-derived ingredients. No animal testing.",
                },
                {
                  title: "Fragrance-Free",
                  body: "No fragrance, parfum, or masking fragrance. No EU fragrance allergens above threshold.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="flex items-start gap-3">
                  <CheckCircle2
                    size={12}
                    className="text-teal-600 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-white tracking-tight mb-1">
                      {title}
                    </p>
                    <p className="text-teal-600 text-xs leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
