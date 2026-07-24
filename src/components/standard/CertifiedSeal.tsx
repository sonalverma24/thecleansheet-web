import Image from "next/image";

/* ────────────────────────────────────────────────────────────────
   CERTIFIED SEAL · the live certification badge, presented with the
   three things it stands for as floating glass chips. Pure CSS float,
   so it renders in a server component.
──────────────────────────────────────────────────────────────── */

const CHIPS = [
  { label: "Claims checked", cls: "top-[3%] left-0 sm:-left-3", delay: "0s" },
  { label: "INCI read", cls: "top-[42%] right-0 sm:-right-4", delay: "1.1s" },
  { label: "Evidence graded", cls: "bottom-[5%] left-[3%]", delay: "2.2s" },
];

export function CertifiedSeal({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mx-auto w-full max-w-[400px] aspect-square select-none ${className}`}>
      {/* ambient glow behind the seal */}
      <div
        className="absolute inset-[6%] rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle at 50% 45%, rgba(128,213,204,0.55), transparent 70%)" }}
        aria-hidden
      />
      {/* the seal */}
      <div className="absolute inset-[9%]" style={{ animation: "tcsSealFloat 6s ease-in-out infinite" }}>
        <Image
          src="/images/certified-badge.png"
          alt="The Clean Sheet Certified seal"
          fill
          priority
          sizes="(max-width: 640px) 80vw, 400px"
          className="object-contain"
          style={{ filter: "drop-shadow(0 18px 42px rgba(36,129,121,0.30))" }}
        />
      </div>
      {/* floating proof chips */}
      {CHIPS.map((c) => (
        <div
          key={c.label}
          className={`absolute ${c.cls} flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/[0.06] shadow-lg px-3.5 py-2`}
          style={{ animation: `tcsSealFloat 6s ease-in-out ${c.delay} infinite` }}
        >
          <span className="text-[var(--color-primary)] text-[13px] leading-none" aria-hidden>✓</span>
          <span className="text-[12.5px] text-[var(--color-charcoal)] whitespace-nowrap">{c.label}</span>
        </div>
      ))}
      <style>{`@keyframes tcsSealFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  );
}
