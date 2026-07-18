/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Hero art
   Reusable decorative graphics in the house style: dark lab-grid
   panels, floating ingredient pills, the approved stamp. Pure
   CSS/SVG — no assets beyond the logo, animates on its own.
──────────────────────────────────────────────────────────────── */

const PILLS: { label: string; color: string }[] = [
  { label: "Niacinamide", color: "#10b981" },
  { label: "Parabens", color: "#ef4444" },
  { label: "Squalane", color: "#10b981" },
  { label: "Oxybenzone", color: "#ef4444" },
  { label: "Ceramides", color: "#10b981" },
  { label: "BHA", color: "#f59e0b" },
  { label: "Hyaluronic Acid", color: "#10b981" },
  { label: "MIT", color: "#ef4444" },
  { label: "Phenoxyethanol", color: "#f59e0b" },
  { label: "Retinol", color: "#10b981" },
];

/** Dark lab-grid panel with floating ingredient pills (the "25k+" card language). */
export function IngredientLattice({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${className}`}
      style={{ background: "linear-gradient(135deg, #0a2420 0%, #0f3d38 55%, #0e2d2a 100%)" }}
      aria-hidden
    >
      {/* grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "26px 26px" }}
      />
      {/* soft glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(210,255,52,0.14) 0%, transparent 70%)" }} />
      {/* pills */}
      <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-2.5 p-8">
        {PILLS.map((p, i) => (
          <span
            key={p.label}
            className="text-[11px] px-3 py-1.5 rounded-full border select-none"
            style={{
              color: p.color,
              borderColor: `${p.color}55`,
              background: `${p.color}14`,
              animation: `heroart-float ${5 + (i % 4)}s ease-in-out ${i * 0.35}s infinite alternate`,
            }}
          >
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** The certified-seal proof motif (the "REAL PROOF" card language) — the
    official Clean Sheet Certified stamp, not a mock. */
export function ProofSealArt({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} aria-hidden>
      {/* halo */}
      <div className="absolute w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(36,129,121,0.12) 0%, transparent 70%)" }} />
      {/* the real certified seal, oversized */}
      <span className="relative inline-block" style={{ width: 210, height: 210, animation: "heroart-float 7s ease-in-out infinite alternate" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/certified-seal.png"
          alt="The Clean Sheet Certified"
          width={210}
          height={210}
          className="w-full h-full object-contain drop-shadow-xl"
        />
      </span>
      {/* orbiting check chips */}
      {["Claims checked", "INCI read", "Evidence graded"].map((t, i) => (
        <span
          key={t}
          className="absolute text-[11px] px-3 py-1.5 rounded-full bg-white shadow-md border border-[#efe9e0] text-[#248179] select-none"
          style={{
            top: `${14 + i * 30}%`,
            [i % 2 === 0 ? "left" : "right"]: "2%",
            animation: `heroart-float ${5.5 + i}s ease-in-out ${i * 0.6}s infinite alternate`,
          } as React.CSSProperties}
        >
          ✓ {t}
        </span>
      ))}
    </div>
  );
}
