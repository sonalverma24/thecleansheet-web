import Link from "next/link";
import { ArrowRight, Shield, Heart, FlaskConical, CheckCircle2, Sparkles } from "lucide-react";

export const metadata = {
  title: "About The Clean Sheet™, India's Clean Beauty Standard",
  description:
    "The Clean Sheet is India's first independent, science-backed clean beauty platform. We analyse ingredients, certify products, and give consumers honest information, with zero brand bias.",
  alternates: { canonical: "https://thecleansheet.in/about" },
  openGraph: {
    title: "About The Clean Sheet™, India's Clean Beauty Standard",
    description:
      "Science before marketing. The Clean Sheet is India's only independent clean beauty certification body, built on open scorecards and zero brand conflicts.",
    url: "https://thecleansheet.in/about",
    type: "website",
  },
};

/* ─────────────────────────────────────────────
   MANIFESTO GRAPHIC, terminal-style
───────────────────────────────────────────── */
function ManifestoGraphic() {
  const believe = [
    { text: "Ingredient transparency is non-negotiable",  tag: "Core",     good: true  },
    { text: "Science over marketing. Always.",             tag: "Core",     good: true  },
    { text: "Panel experts have no brand conflicts",        tag: "Core",     good: true  },
    { text: "Public scorecards. Free. Forever.",           tag: "Open",     good: true  },
    { text: "Evidence before every claim",                 tag: "Verified", good: true  },
    { text: '"Chemical-free" claims',                      tag: "Banned",   good: false },
    { text: "Undisclosed INCI ingredients",                tag: "Banned",   good: false },
    { text: "Paid placements or brand bias",               tag: "Banned",   good: false },
  ];

  return (
    <div
      className="w-full max-w-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/50 select-none"
      style={{
        background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        fontFamily: "'Geist Mono',monospace",
        animation: "tcs-slideUp 0.55s 0.25s cubic-bezier(0.4,0,0.2,1) both",
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <span className="text-[11px] mx-auto" style={{ color: "rgba(255,255,255,0.22)" }}>
          TCS Manifesto · v1.0
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse block" />
          <span className="text-[10px]" style={{ color: "rgba(74,222,128,0.7)" }}>live</span>
        </div>
      </div>

      {/* Header row */}
      <div className="px-4 pt-4 pb-2 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="text-[9px] uppercase tracking-[0.25em] mb-1" style={{ color: "rgba(255,255,255,0.22)" }}>
          What we stand for
        </div>
        <div className="text-sm font-normal" style={{ color: "#5eead4" }}>
          The Clean Sheet™ · Belief System
        </div>
      </div>

      {/* Rows */}
      <div>
        {believe.map(({ text, tag, good }, i) => (
          <div
            key={text}
            className="flex items-center gap-3 px-4 py-2.5 border-b"
            style={{
              borderColor: "rgba(255,255,255,0.03)",
              background: !good ? "rgba(248,113,113,0.04)" : "transparent",
              animation: "tcs-rowIn 0.4s ease both",
              animationDelay: `${0.1 + i * 0.07}s`,
            }}
          >
            <span className="text-[13px] flex-shrink-0 font-mono" style={{ color: good ? "#4ade80" : "#f87171" }}>
              {good ? "✓" : "✗"}
            </span>
            <span className="text-[11px] flex-1 truncate" style={{ color: good ? "rgba(255,255,255,0.72)" : "rgba(248,113,113,0.7)" }}>
              {text}
            </span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
              style={{
                color: good
                  ? tag === "Open" ? "rgba(94,234,212,0.9)" : tag === "Verified" ? "rgba(74,222,128,0.7)" : "rgba(94,234,212,0.6)"
                  : "rgba(248,113,113,0.7)",
                background: good
                  ? tag === "Open" ? "rgba(94,234,212,0.1)" : tag === "Verified" ? "rgba(74,222,128,0.08)" : "rgba(94,234,212,0.07)"
                  : "rgba(248,113,113,0.08)",
                border: `1px solid ${good
                  ? tag === "Open" ? "rgba(94,234,212,0.2)" : tag === "Verified" ? "rgba(74,222,128,0.15)" : "rgba(94,234,212,0.12)"
                  : "rgba(248,113,113,0.15)"}`,
              }}
            >
              {tag}
            </span>
          </div>
        ))}
      </div>

      {/* Status footer */}
      <div className="px-4 py-3.5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)" }}>
        <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.18)" }}>STATUS</span>
        <span className="text-[11px] font-mono" style={{ color: "#5eead4" }}>Building the standard. Est. 2025</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ABOUT PAGE
───────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="bg-white">
      <style>{`
        @keyframes tcs-rowIn   { from { opacity:0; transform:translateX(-8px) } to { opacity:1; transform:translateX(0) } }
        @keyframes tcs-fadeUp  { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes tcs-slideUp { from { opacity:0; transform:translateY(28px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes tcs-badgeIn { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)" }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, #5eead4 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(20,184,166,0.12) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-14 lg:py-20">

            {/* Left copy */}
            <div style={{ animation: "tcs-fadeUp 0.5s ease both" }}>
              <div
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(94,234,212,0.1)", border: "1px solid rgba(94,234,212,0.2)", color: "#5eead4" }}
              >
                <Heart size={13} />
                Our Mission
              </div>

              <h1
                className="text-[clamp(2rem,5.5vw,3.75rem)] font-medium tracking-tight leading-[1.06] mb-6"
                style={{ color: "#f0fdfa" }}
              >
                Evidence over
                <br />
                <span style={{ color: "#5eead4" }}>marketing.</span>
              </h1>

              <p className="text-lg leading-relaxed mb-4 max-w-xl" style={{ color: "rgba(153,246,228,0.7)" }}>
                The Indian beauty industry is worth $28 billion and growing. But clean beauty
                has no legal definition. Brands use &ldquo;natural&rdquo;, &ldquo;pure&rdquo;, &ldquo;chemical-free&rdquo; freely,
                with no accountability.
              </p>
              <p className="text-lg leading-relaxed mb-8 max-w-xl" style={{ color: "rgba(153,246,228,0.45)" }}>
                The Clean Sheet™ was built to change that. India&apos;s first ingredient-level,
                science-backed certification that means something real.
              </p>

              <div className="flex flex-col sm:flex-row gap-3" style={{ animation: "tcs-fadeUp 0.5s 0.2s ease both" }}>
                <a
                  href="#get-certified"
                  className="inline-flex items-center justify-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-normal px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.97]"
                >
                  Certify Your Brand
                  <ArrowRight size={15} />
                </a>
                <Link
                  href="/analyzer"
                  className="inline-flex items-center justify-center gap-2 font-normal px-6 py-3.5 rounded-2xl transition-all"
                  style={{ color: "#5eead4", border: "1px solid rgba(94,234,212,0.2)", background: "rgba(94,234,212,0.06)" }}
                >
                  <Sparkles size={14} /> Try the Analyser
                </Link>
              </div>
            </div>

            {/* Right graphic */}
            <div className="flex items-center justify-center mt-4 lg:mt-0">
              <ManifestoGraphic />
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { v: "$28B", l: "Indian beauty market" },
                { v: "0",    l: "Legal clean beauty definitions in India" },
                { v: "5",    l: "Evaluation layers" },
                { v: "0",    l: "Paid placements. Ever." },
              ].map(({ v, l }) => (
                <div key={l}>
                  <div className="text-2xl sm:text-3xl font-medium mb-1" style={{ color: "#5eead4" }}>{v}</div>
                  <div className="text-xs sm:text-sm" style={{ color: "rgba(153,246,228,0.45)" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE STAND FOR ─────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <div className="text-coral-500 text-sm font-normal uppercase tracking-wider mb-3">What we stand for</div>
            <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight leading-tight">
              Three things we&apos;ll
              <br />
              <span className="text-teal-600">never compromise on.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                color: "#ef4444",
                bg: "rgba(239,68,68,0.05)",
                border: "rgba(239,68,68,0.12)",
                tag: "50% of our score",
                title: "Safety is non-negotiable.",
                body: "50% of our score is safety. Because no amount of great packaging or clever marketing justifies a product that contains carcinogens or endocrine disruptors.",
              },
              {
                icon: FlaskConical,
                color: "#0d9488",
                bg: "rgba(13,148,136,0.05)",
                border: "rgba(13,148,136,0.12)",
                tag: "Documents on file",
                title: "Proof is the product.",
                body: "We don't accept brand declarations. We verify documents. Technical data sheets, lab results, safety tests, all on file before a single badge is issued.",
              },
              {
                icon: Heart,
                color: "#f97066",
                bg: "rgba(249,112,102,0.05)",
                border: "rgba(249,112,102,0.12)",
                tag: "Public forever",
                title: "Consumers deserve the truth.",
                body: "Our public scorecards are free, permanent, and linked via QR on packaging. Any consumer can verify any certified product, any time.",
              },
            ].map(({ icon: Icon, color, bg, border, tag, title, body }) => (
              <div
                key={title}
                className="rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <span
                    className="text-[11px] font-mono px-2.5 py-1 rounded-full"
                    style={{ color, background: `${color}12`, border: `1px solid ${color}25` }}
                  >
                    {tag}
                  </span>
                </div>
                <h3 className="text-xl font-medium text-ink-950 mb-3">{title}</h3>
                <p className="text-ink-500 leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE GAP ───────────────────────────────────────── */}
      <section
        className="py-20 sm:py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle, #5eead4 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-teal-400 text-sm font-normal uppercase tracking-wider mb-4">The market gap</div>
              <h2
                className="text-4xl lg:text-5xl font-medium tracking-tight leading-tight mb-6"
                style={{ color: "#f0fdfa" }}
              >
                The gap in India&apos;s
                <br />
                <span style={{ color: "#5eead4" }}>beauty market.</span>
              </h2>
              <div className="space-y-4 text-lg leading-relaxed" style={{ color: "rgba(153,246,228,0.65)" }}>
                <p>
                  India follows the Drugs and Cosmetics Act, which has no specific provision
                  for &ldquo;clean&rdquo; or &ldquo;natural&rdquo; claims. A brand can print &ldquo;chemical-free&rdquo; on any
                  bottle and face no legal consequence.
                </p>
                <p>
                  Meanwhile, consumers are paying premium prices for products marketed as
                  &ldquo;safe&rdquo; and &ldquo;clean&rdquo; that contain parabens, formaldehyde releasers, and
                  endocrine disruptors.
                </p>
                <p style={{ color: "rgba(153,246,228,0.38)" }}>
                  The Clean Sheet fills this gap with a voluntary, science-driven certification
                  inspired by the EU&apos;s SCCS guidelines, IFRA standards, and EWG rigour,
                  built for India&apos;s market.
                </p>
              </div>
            </div>

            {/* Stats panel */}
            <div
              className="rounded-3xl p-8"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(94,234,212,0.12)" }}
            >
              <div className="text-sm font-medium mb-6" style={{ color: "#5eead4" }}>The numbers don&apos;t lie.</div>
              <div className="space-y-6">
                {[
                  { label: "Products with misleading 'clean' claims", pct: 73, color: "#f87171" },
                  { label: "Consumers who check ingredients",          pct: 74, color: "#4ade80" },
                  { label: "Brands that disclose full INCI lists",     pct: 41, color: "#fbbf24" },
                  { label: "Growth in clean beauty demand (2024-25)",  pct: 68, color: "#5eead4" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: "rgba(153,246,228,0.65)" }}>{label}</span>
                      <span className="font-medium" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, opacity: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-6 pt-4" style={{ color: "rgba(153,246,228,0.25)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                Source: Vogue India Beauty Report 2024, internal research
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── INDEPENDENT PANEL ─────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-ink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-5xl">
            <div>
              <div className="text-coral-500 text-sm font-normal uppercase tracking-wider mb-4">Credibility</div>
              <h2 className="text-3xl lg:text-4xl font-medium text-ink-950 tracking-tight mb-6">
                Our independent panel.
              </h2>
              <div className="space-y-4 text-lg leading-relaxed text-ink-600">
                <p>
                  The Clean Sheet evaluations are reviewed by an independent panel of experts,
                  including cosmetic scientists, toxicologists, and dermatologists.
                </p>
                <p>
                  Panel members are named here because transparency about who evaluates is
                  part of what makes the standard credible. No commercial relationships
                  with certified brands. Conflicts of interest are declared and managed.
                </p>
                <p className="text-ink-400">
                  Panel member profiles will be published as the panel is confirmed.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-ink-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                  <Shield size={18} className="text-teal-600" />
                </div>
                <div>
                  <div className="font-medium text-sm text-ink-950">Want to be on the panel?</div>
                  <div className="text-xs text-ink-400">Independent expertise only</div>
                </div>
              </div>
              <p className="text-base leading-relaxed text-ink-600 mb-6">
                If you are a cosmetic scientist, toxicologist, or dermatologist who wants to
                make a difference, we&apos;d love to hear from you. The composition of our panel
                is taken seriously.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  "No brand affiliation required",
                  "Conflict of interest protocols in place",
                  "Named publicly on the platform",
                ].map(t => (
                  <div key={t} className="flex items-center gap-2 text-sm text-ink-500">
                    <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0" /> {t}
                  </div>
                ))}
              </div>
              <a
                href="mailto:hello@thecleansheet.in?subject=Panel%20Application%20%7C%20The%20Clean%20Sheet"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-normal px-6 py-3 rounded-2xl text-sm transition-all"
              >
                Reach out at hello@thecleansheet.in
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDING QUOTE ────────────────────────────────── */}
      <section
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle, #5eead4 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(20,184,166,0.08) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-sm font-medium tracking-widest uppercase mb-8" style={{ color: "rgba(94,234,212,0.35)" }}>
            Est. 2025 · India
          </div>

          <blockquote className="text-3xl lg:text-4xl font-medium leading-snug mb-8 tracking-tight" style={{ color: "#f0fdfa" }}>
            &ldquo;Clean beauty isn&apos;t a legal category in India.
            It&apos;s a marketing term. We&apos;re building the standard
            <span style={{ color: "#5eead4" }}> that changes that.</span>&rdquo;
          </blockquote>

          <p className="mb-10" style={{ color: "rgba(153,246,228,0.4)" }}>The Clean Sheet™</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/analyzer"
              className="inline-flex items-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-normal px-7 py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.98]"
            >
              <Sparkles size={16} />
              Try the Analyser
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/certification"
              className="inline-flex items-center gap-2 font-normal px-7 py-4 rounded-2xl transition-all text-sm"
              style={{ color: "#5eead4", border: "1px solid rgba(94,234,212,0.2)", background: "rgba(94,234,212,0.05)" }}
            >
              View Certification
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
