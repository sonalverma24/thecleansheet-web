import Link from "next/link";
import { ArrowRight, CheckCircle2, QrCode, Shield, Star, Leaf, Award } from "lucide-react";

export const metadata = {
  title: "Know What's In Your Skincare | The Clean Sheet™",
  description: "Scan the QR code on any Clean Sheet certified product to see exactly what was evaluated, what score it received, and which claims are backed by evidence.",
};

function ProofPageMock() {
  return (
    <div className="bg-white rounded-3xl border border-ink-100 shadow-2xl shadow-ink-900/8 overflow-hidden max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-teal-600 px-6 py-5">
        <div className="flex items-center justify-between mb-1">
          <div className="text-teal-200 text-xs font-normal uppercase tracking-widest">Clean Sheet Certified</div>
          <div className="bg-yellow-400 text-ink-950 text-xs font-semibold px-2.5 py-1 rounded-full">GOLD ✦</div>
        </div>
        <div className="text-white font-medium text-lg leading-tight">Daily Sunscreen SPF 50+</div>
        <div className="text-teal-300/70 text-xs mt-0.5">Example Brand · TCS-2025-00089</div>
      </div>

      {/* Score */}
      <div className="px-6 py-5 border-b border-ink-100">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-5xl font-semibold text-teal-600 leading-none">91</div>
            <div className="text-xs text-ink-400 mt-1">out of 100</div>
          </div>
          <div className="flex-1">
            <div className="h-2 bg-ink-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: "91%" }} />
            </div>
            <div className="text-xs text-ink-500">Certified: 12 Jan 2025 · Valid until: 12 Jan 2027</div>
          </div>
        </div>
      </div>

      {/* Layer scores */}
      <div className="px-6 py-4 border-b border-ink-100">
        <div className="text-xs font-medium text-ink-400 uppercase tracking-widest mb-3">Score Breakdown</div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-ink-50">
            {[
              ["Ingredient Safety", "46/50"],
              ["Manufacturing & Quality", "18/20"],
              ["Claims", "17/20"],
              ["Ethics & Sustainability", "10/10"],
            ].map(([layer, score]) => (
              <tr key={layer}>
                <td className="py-2 text-ink-600">{layer}</td>
                <td className="py-2 text-ink-900 font-medium text-right">{score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verified claims */}
      <div className="px-6 py-4 border-b border-ink-100">
        <div className="text-xs font-medium text-ink-400 uppercase tracking-widest mb-3">Verified Claims</div>
        <div className="flex flex-wrap gap-2">
          {["SPF 50 verified", "UVA verified", "Fragrance-free", "Cruelty-free", "Non-comedogenic"].map(c => (
            <span key={c} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 size={10} /> {c}
            </span>
          ))}
        </div>
      </div>

      {/* PRISM */}
      <div className="px-6 py-4">
        <div className="text-xs font-medium text-ink-400 uppercase tracking-widest mb-3">PRISM Modules</div>
        <div className="flex gap-2">
          <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full">Sun Verified</span>
          <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full">Sensitive Skin</span>
        </div>
      </div>
    </div>
  );
}

export default function ConsumersPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden bg-ink-950">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(#5eead4 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-teal-400 text-sm font-normal mb-6 uppercase tracking-wide">
                <QrCode size={14} /> For Consumers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-tight mb-6 text-white">
                The QR code tells you what
                <br />
                <span className="text-teal-400">the label doesn&apos;t.</span>
              </h1>
              <p className="text-teal-200 text-lg leading-relaxed mb-8 max-w-xl">
                When a product carries the Clean Sheet badge, scan it. You&apos;ll see exactly what was evaluated, what score it received, and which claims are backed by evidence.
              </p>
              <Link
                href="/certified"
                className="inline-flex items-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-normal px-7 py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.98]"
              >
                Verify a product <ArrowRight size={16} />
              </Link>
            </div>
            <ProofPageMock />
          </div>
        </div>
      </section>

      {/* ── What the QR tells you ─────────────────────────── */}
      <section className="py-16 sm:py-24 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-4">
              What the QR code tells you.
            </h2>
            <p className="text-ink-600 text-lg max-w-xl mx-auto">
              Every certified product has a public proof page. Scan the badge, see the evidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                title: "Score and tier",
                desc: "A score from 0 to 100. Gold means exceptional. Silver means strong. Certified means it meets our standard. Not on our registry means it hasn't been independently evaluated by us.",
                color: "bg-yellow-50 border-yellow-200",
                iconColor: "text-yellow-600 bg-yellow-100",
              },
              {
                icon: Shield,
                title: "Ingredient safety summary",
                desc: "An overview of how the product's ingredients were assessed, including any ingredients with noted concerns, what those concerns are, and why they're or aren't a problem in this product at this concentration.",
                color: "bg-teal-50 border-teal-200",
                iconColor: "text-teal-600 bg-teal-100",
              },
              {
                icon: CheckCircle2,
                title: "Verified claims",
                desc: "The claims that were independently substantiated during evaluation. If the label says 'clinically proven to reduce dark spots' and it's in the verified claims list, there's a clinical study behind it.",
                color: "bg-safe-50 border-safe-200",
                iconColor: "text-safe-600 bg-safe-100",
              },
              {
                icon: Star,
                title: "Manufacturing quality",
                desc: "Whether the manufacturer holds GMP certification and what level of quality documentation was reviewed. A safe formula in a poorly manufactured product is still a problem.",
                color: "bg-blue-50 border-blue-200",
                iconColor: "text-blue-600 bg-blue-100",
              },
              {
                icon: Leaf,
                title: "Ethics and sustainability",
                desc: "Cruelty-free status, vegan status, and any sustainability commitments that were independently assessed, not self-declared.",
                color: "bg-green-50 border-green-200",
                iconColor: "text-green-600 bg-green-100",
              },
              {
                icon: QrCode,
                title: "Certificate details",
                desc: "The certificate number, the date it was issued, and when it expires. Every two years, certified products are re-evaluated. The proof stays current.",
                color: "bg-ink-50 border-ink-200",
                iconColor: "text-ink-600 bg-ink-100",
              },
            ].map(({ icon: Icon, title, desc, color, iconColor }) => (
              <div key={title} className={`rounded-3xl p-7 border ${color}`}>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 ${iconColor}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-medium text-ink-950 mb-3">{title}</h3>
                <p className="text-ink-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we don't do ──────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-ink-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-white tracking-tight mb-8">
            What we don&apos;t do.
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-left">
            <p className="text-teal-200 text-lg leading-relaxed mb-6">
              We don&apos;t rank products against each other. We don&apos;t create &ldquo;best of&rdquo; lists. We don&apos;t accept sponsorship from brands.
            </p>
            <p className="text-teal-200 text-lg leading-relaxed">
              Every certified product is evaluated on its own merits against a consistent standard. A Silver score means the same thing regardless of which brand earned it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Verify CTA ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-medium text-ink-950 tracking-tight mb-4">
            Check if a product is certified.
          </h2>
          <p className="text-ink-600 text-lg mb-10 max-w-xl mx-auto">
            Search by brand or product name, or scan the QR code on the packaging.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/certified"
              className="inline-flex items-center justify-center gap-2.5 bg-teal-600 hover:bg-teal-700 text-white font-normal px-8 py-4 rounded-2xl transition-all hover:shadow-xl active:scale-[0.98] text-lg"
            >
              <QrCode size={18} /> Search the Registry
            </Link>
          </div>
          <p className="text-ink-400 text-sm mt-8 max-w-lg mx-auto">
            If a product doesn&apos;t appear in our registry, it hasn&apos;t been certified by The Clean Sheet. That doesn&apos;t mean it&apos;s unsafe, it means it hasn&apos;t been independently evaluated by us.
          </p>
        </div>
      </section>

    </div>
  );
}
