'use client';
import { useState } from 'react';
import { ChevronDown, ArrowUpRight, Eye, FileText, Shield, Beaker, Scale, FlaskConical, Leaf } from 'lucide-react';
import Link from 'next/link';

// SEO: prevent indexing — this is a private preview page
// metadata is handled in layout.tsx or via a robots meta tag in the head

export default function BrandPreviewPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#fbf9f7" }}>

      {/* ─── Dark Header Strip ────────────────────────────────── */}
      <div style={{ background: "#282828" }} className="px-4 sm:px-5 py-3 fixed top-0 left-0 w-full z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
            Brand Preview · The Clean Sheet
          </span>
          <Link
            href="mailto:hello@thecleansheet.in"
            className="text-[10px] sm:text-[11px] tracking-wider uppercase px-3 sm:px-4 py-1.5 rounded-md transition-colors"
            style={{ background: "#248179", color: "#ffffff" }}
          >
            Get in Touch
          </Link>
        </div>
      </div>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="pt-16 sm:pt-20 pb-8 sm:pb-10 px-4 sm:px-5" style={{ background: "#ffffff" }}>
        <div className="max-w-3xl mx-auto">
          <div className="pt-6 sm:pt-10 pb-4">
            <span
              className="inline-block text-[9px] sm:text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 rounded-md mb-5 sm:mb-6"
              style={{ background: "#248179", color: "#ffffff" }}
            >
              Brand Preview
            </span>
            <h1
              className="tracking-tight mb-4 sm:mb-5"
              style={{ fontSize: "clamp(1.6rem, 4.5vw, 2.6rem)", lineHeight: 1.08, color: "#282828", fontWeight: 400 }}
            >
              This is what your customers<br className="hidden sm:block" /> will see when you certify.
            </h1>
            <p className="text-[13px] sm:text-[15px] leading-relaxed mb-6" style={{ color: "#6b6868", maxWidth: "32rem" }}>
              Every brand that certifies with The Clean Sheet gets a live, public proof page for each product — a single link that shows consumers exactly what makes your product safe, effective, and trustworthy.
            </p>
            <p className="text-[13px] sm:text-[15px] leading-relaxed" style={{ color: "#6b6868", maxWidth: "32rem" }}>
              Below are two live examples from our sample product, CodeSkin UltraLite SPF 50. This is exactly what your certification pages will look like.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-5 space-y-8 sm:space-y-10 pb-10">

        {/* ─── Live Page Previews ─────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#282828" }}
            >
              01
            </span>
            <h2 className="text-base sm:text-lg tracking-tight" style={{ color: "#248179" }}>
              Your Certification Pages
            </h2>
          </div>
          <p className="text-[12px] sm:text-[13px] leading-relaxed mb-4 sm:mb-5 ml-9" style={{ color: "#6b6868", maxWidth: "30rem" }}>
            Tap either card to see the full live page. These are real, working pages — not mockups.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Consumer page card */}
            <Link
              href="/verify/codeskin-ultralite-full-v2-p5r7k2"
              target="_blank"
              className="group bg-white rounded-lg overflow-hidden transition-shadow hover:shadow-md"
              style={{ borderLeft: "4px solid #248179", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="px-4 sm:px-5 py-4 sm:py-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(36,129,121,0.1)", color: "#248179" }}
                    >
                      <Eye size={15} />
                    </div>
                    <div>
                      <p className="text-[13px] sm:text-[14px] font-medium tracking-tight" style={{ color: "#282828" }}>Consumer Page</p>
                      <p className="text-[10px] sm:text-[11px]" style={{ color: "#b0a8a4" }}>What your customers see</p>
                    </div>
                  </div>
                  <span
                    className="text-[9px] sm:text-[10px] font-medium tracking-wider uppercase px-2 sm:px-2.5 py-1 rounded flex-shrink-0"
                    style={{ background: "#248179", color: "#ffffff" }}
                  >
                    VERIFIED
                  </span>
                </div>
                <p className="text-[12px] sm:text-[12.5px] leading-relaxed mb-3" style={{ color: "#6b6868" }}>
                  Clean, scannable product page with verified credentials, PRISM pillar breakdown, and every claim backed by evidence.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] group-hover:gap-2 transition-all" style={{ color: "#248179" }}>
                  View live page <ArrowUpRight size={11} />
                </div>
              </div>
            </Link>

            {/* Technical page card */}
            <Link
              href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
              target="_blank"
              className="group bg-white rounded-lg overflow-hidden transition-shadow hover:shadow-md"
              style={{ borderLeft: "4px solid #fd6158", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="px-4 sm:px-5 py-4 sm:py-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(253,97,88,0.1)", color: "#fd6158" }}
                    >
                      <FileText size={15} />
                    </div>
                    <div>
                      <p className="text-[13px] sm:text-[14px] font-medium tracking-tight" style={{ color: "#282828" }}>Technical Record</p>
                      <p className="text-[10px] sm:text-[11px]" style={{ color: "#b0a8a4" }}>Full certification data</p>
                    </div>
                  </div>
                  <span
                    className="text-[9px] sm:text-[10px] font-medium tracking-wider uppercase px-2 sm:px-2.5 py-1 rounded flex-shrink-0"
                    style={{ background: "#248179", color: "#ffffff" }}
                  >
                    VERIFIED
                  </span>
                </div>
                <p className="text-[12px] sm:text-[12.5px] leading-relaxed mb-3" style={{ color: "#6b6868" }}>
                  Complete technical proof — ingredient-level assessment, regulatory compliance, test data references, and full scoring across all 5 pillars.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] group-hover:gap-2 transition-all" style={{ color: "#fd6158" }}>
                  View live page <ArrowUpRight size={11} />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ─── What You Get ──────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#282828" }}
            >
              02
            </span>
            <h2 className="text-base sm:text-lg tracking-tight" style={{ color: "#248179" }}>
              What Certification Includes
            </h2>
          </div>
          <div className="grid gap-2.5">
            {[
              { title: 'Live Consumer Proof Page', desc: 'A public, scannable page linked via QR code on your packaging. Customers see exactly what passed and why.', color: '#248179' },
              { title: 'Detailed Technical Record', desc: 'Full ingredient-level assessment, regulatory compliance matrix, and scoring breakdown — for retail buyers, regulators, and your internal team.', color: '#248179' },
              { title: 'Certification Badge & QR Code', desc: 'Print-ready badge files (3 formats) and a unique QR code that links directly to your product\'s proof page.', color: '#248179' },
              { title: 'Comprehensive Evaluation Report', desc: 'Whether you pass or not, you receive a detailed technical report with specific, actionable feedback on your formulation, testing, and documentation.', color: '#fd6158' },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-lg px-4 sm:px-5 py-3.5 sm:py-4"
                style={{ borderLeft: `4px solid ${item.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <p className="text-[13px] sm:text-[14px] font-medium tracking-tight mb-1.5" style={{ color: "#282828" }}>{item.title}</p>
                <p className="text-[12px] sm:text-[12.5px] leading-relaxed" style={{ color: "#6b6868" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 5 Pillars ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#282828" }}
            >
              03
            </span>
            <h2 className="text-base sm:text-lg tracking-tight" style={{ color: "#248179" }}>
              What We Evaluate
            </h2>
          </div>
          <p className="text-[12px] sm:text-[13px] leading-relaxed mb-4 sm:mb-5 ml-9" style={{ color: "#6b6868" }}>
            Every product is evaluated across five rigorous, independent pillars.
          </p>
          <div className="space-y-2">
            {[
              { num: '01', title: 'Legal Compliance', desc: 'All ingredients checked against CDSCO, EU, US FDA, and global regulatory databases.', color: '#fd6158', Icon: Scale },
              { num: '02', title: 'Ingredient Safety', desc: 'Full safety assessment at your exact concentrations, for your target consumers.', color: '#e8963a', Icon: Shield },
              { num: '03', title: 'Manufacturing Quality', desc: 'GMP compliance, batch testing, stability data, and quality records.', color: '#248179', Icon: Beaker },
              { num: '04', title: 'Claims & Evidence', desc: 'Every marketing claim verified against product-specific evidence.', color: '#fd6158', Icon: FlaskConical },
              { num: '05', title: 'Ethics & Sustainability', desc: 'Cruelty-free, natural, organic, and sustainability claims assessed.', color: '#6b9e3a', Icon: Leaf },
            ].map((layer) => (
              <div
                key={layer.num}
                className="bg-white rounded-lg px-4 sm:px-5 py-3.5 sm:py-4 flex gap-3 sm:gap-5 items-center"
                style={{ borderLeft: `4px solid ${layer.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="text-xl sm:text-2xl flex-shrink-0" style={{ color: `${layer.color}30`, fontWeight: 300 }}>{layer.num}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] sm:text-[14px] font-medium tracking-tight mb-0.5" style={{ color: "#282828" }}>{layer.title}</p>
                  <p className="text-[11px] sm:text-[12.5px] leading-relaxed" style={{ color: "#6b6868" }}>{layer.desc}</p>
                </div>
                <span
                  className="text-[9px] sm:text-[10px] font-medium tracking-wider uppercase px-2 sm:px-2.5 py-1 rounded flex-shrink-0"
                  style={{ background: "#248179", color: "#ffffff" }}
                >
                  VERIFIED
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Lime Callout ──────────────────────────────────── */}
        <div
          className="rounded-xl px-5 sm:px-6 py-5"
          style={{ background: "linear-gradient(135deg, #e8ff8a 0%, #d2ff34 100%)" }}
        >
          <p className="text-[13px] sm:text-[15px] leading-relaxed text-center" style={{ color: "#282828", maxWidth: "32rem", margin: "0 auto" }}>
            &ldquo;We don&apos;t just look at an ingredient list. We evaluate the entire product — formulation, safety, manufacturing, claims, and ethics.&rdquo;
          </p>
        </div>

        {/* ─── How It Works ──────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#282828" }}
            >
              04
            </span>
            <h2 className="text-base sm:text-lg tracking-tight" style={{ color: "#248179" }}>
              How It Works
            </h2>
          </div>
          <p className="text-[12px] sm:text-[13px] leading-relaxed mb-4 sm:mb-5 ml-9" style={{ color: "#6b6868" }}>
            From first conversation to live proof page.
          </p>
          <div className="space-y-2.5">
            {[
              { title: 'Pre-Assessment Call', badge: 'Free', color: '#b0a8a4', desc: 'We review your product and identify any gaps before you commit to a full evaluation. No obligation.' },
              { title: 'Dossier Submission', color: '#248179', desc: 'Submit your formula, safety data, and claims evidence via our secure, encrypted portal. Everything is held under strict NDA.' },
              { title: 'Independent Evaluation', badge: '6-10 Weeks', color: '#248179', desc: 'Our panel of cosmetic chemists, toxicologists, and claims specialists rigorously evaluates your product across all 5 pillars.' },
              { title: 'Certification & Live Page', badge: 'Valid 1 Year', color: '#fd6158', desc: 'Score 60 or above and you\'re certified. Your public proof page goes live, and you receive your badge and QR code.' },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white rounded-lg px-4 sm:px-5 py-3.5 sm:py-4"
                style={{ borderLeft: `4px solid ${step.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="flex justify-between items-start sm:items-center mb-1.5 sm:mb-2 gap-2">
                  <p className="text-[13px] sm:text-[14px] font-medium tracking-tight" style={{ color: "#282828" }}>{step.title}</p>
                  {step.badge && (
                    <span
                      className="text-[9px] sm:text-[10px] tracking-wider uppercase px-2 sm:px-2.5 py-1 rounded whitespace-nowrap flex-shrink-0"
                      style={{ background: "#fbf9f7", color: "#6b6868", border: "1px solid #eee" }}
                    >
                      {step.badge}
                    </span>
                  )}
                </div>
                <p className="text-[12px] sm:text-[12.5px] leading-relaxed" style={{ color: "#6b6868" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Pricing Snapshot ───────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#282828" }}
            >
              05
            </span>
            <h2 className="text-base sm:text-lg tracking-tight" style={{ color: "#248179" }}>
              Pricing Snapshot
            </h2>
          </div>
          <div
            className="bg-white rounded-lg overflow-hidden"
            style={{ borderLeft: "4px solid #248179", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="px-4 sm:px-5 py-4">
              <p className="text-[12px] sm:text-[12.5px] leading-relaxed mb-4" style={{ color: "#6b6868" }}>
                Core certification covers all 5 evaluation pillars, your live proof pages, badge, and QR code. Pricing is per SKU, based on product category.
              </p>

              {/* Category pricing */}
              <div className="space-y-1.5 mb-4">
                {[
                  { cat: 'Face Cleansers / Body Care', price: 'from ₹65,000' },
                  { cat: 'Moisturisers / Hair Care', price: 'from ₹75,000' },
                  { cat: 'Serums & Actives', price: 'from ₹90,000' },
                  { cat: 'Sunscreens', price: 'from ₹1,10,000' },
                  { cat: 'Baby Care', price: 'from ₹1,20,000' },
                ].map((row) => (
                  <div
                    key={row.cat}
                    className="flex justify-between items-center py-2 px-3 rounded"
                    style={{ background: "#fbf9f7" }}
                  >
                    <span className="text-[12px] sm:text-[13px]" style={{ color: "#4a4747" }}>{row.cat}</span>
                    <span className="text-[12px] sm:text-[13px] font-medium whitespace-nowrap ml-3" style={{ color: "#282828" }}>{row.price}</span>
                  </div>
                ))}
              </div>

              {/* Discount note */}
              <div className="py-3 px-3 rounded mb-4" style={{ background: "rgba(36,129,121,0.04)", border: "1px solid rgba(36,129,121,0.1)" }}>
                <p className="text-[11px] sm:text-[12px] leading-relaxed" style={{ color: "#248179" }}>
                  Portfolio discounts: 10% off for 3-5 SKUs, 15% for 6-10 SKUs, 20% for 11-20 SKUs, 25% for 21+ SKUs.
                </p>
              </div>

              <p className="text-[10px] sm:text-[11px]" style={{ color: "#b0a8a4" }}>
                All prices in INR exclusive of 18% GST. PRISM add-on modules, expedited timelines, and international market add-ons available. Full pricing schedule shared on request.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FAQ ────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#282828" }}
            >
              06
            </span>
            <h2 className="text-base sm:text-lg tracking-tight" style={{ color: "#248179" }}>
              Common Questions
            </h2>
          </div>
          <div className="space-y-2">
            {[
              { q: 'Do I have to share my exact formula?', a: 'Yes, we need exact concentrations to calculate safety margins. However, your formula is strictly confidential, protected by a robust NDA, and never published. Consumers only see the standard INCI list and verified active ranges.' },
              { q: 'What if my product doesn\'t pass?', a: 'You still receive a comprehensive evaluation report with specific, actionable feedback. Most brands use this to improve their formulation, testing, or documentation and re-apply successfully.' },
              { q: 'What if I don\'t have all the required tests yet?', a: 'Our pre-assessment identifies exactly what testing is missing. You can then commission these tests from accredited labs before submitting for full evaluation.' },
              { q: 'How is this different from "dermatologist tested"?', a: 'Dermatologist-tested typically means one doctor reviewed the product. We run a comprehensive 5-pillar evaluation with independent cosmetic chemists, toxicologists, and claims specialists. Every claim is verified against real evidence.' },
              { q: 'Is my data secure?', a: 'All data is submitted via an encrypted portal, held under strict NDA, and never shared with third parties. Your exact formula is never published — consumers only see the standardised INCI list.' },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden"
                style={{ borderLeft: "4px solid #b0a8a4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 flex justify-between items-center text-left gap-3"
                >
                  <span className="text-[13px] sm:text-[14px] font-medium tracking-tight" style={{ color: "#282828" }}>{faq.q}</span>
                  <ChevronDown
                    className="transition-transform duration-300 flex-shrink-0"
                    size={14}
                    style={{ color: activeFaq === i ? "#248179" : "#d4d2d2", transform: activeFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                <div
                  className="grid"
                  style={{ gridTemplateRows: activeFaq === i ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 sm:px-5 pb-3 sm:pb-4">
                      <p className="text-[12px] sm:text-[12.5px] leading-relaxed" style={{ color: "#6b6868" }}>{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ────────────────────────────────────────────── */}
        <section>
          <div
            className="rounded-xl overflow-hidden"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
          >
            <div className="px-5 sm:px-6 py-6 sm:py-8 text-center" style={{ background: "#282828" }}>
              <h2 className="text-lg sm:text-xl tracking-tight mb-2" style={{ color: "#ffffff", fontWeight: 400 }}>
                Ready to certify?
              </h2>
              <p className="text-[12px] sm:text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                Start with a free pre-assessment call — no obligation.
              </p>
            </div>

            <div className="grid sm:grid-cols-3" style={{ background: "#ffffff" }}>
              {[
                { num: '1', text: 'Reply to this email or reach out to schedule a call.', color: '#248179' },
                { num: '2', text: 'We\'ll review your product and identify any gaps.', color: '#fd6158' },
                { num: '3', text: 'If it\'s a fit, you submit your dossier and we begin.', color: '#d2ff34' },
              ].map((step, i) => (
                <div
                  key={i}
                  className="px-4 sm:px-5 py-4 sm:py-5"
                  style={{ borderBottom: "3px solid " + step.color, borderRight: i < 2 ? "1px solid #f0f0ee" : "none" }}
                >
                  <div className="text-base sm:text-lg mb-1.5 sm:mb-2" style={{ color: step.color, fontWeight: 300 }}>{step.num}</div>
                  <p className="text-[11px] sm:text-[12.5px] leading-relaxed" style={{ color: "#6b6868" }}>{step.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 px-5 sm:px-6 py-4 sm:py-5" style={{ background: "#248179" }}>
                <p className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                  thecleansheet.in
                </p>
                <p className="text-white text-[13px] sm:text-[14px] leading-snug">
                  India&apos;s first independent beauty<br />& personal care certification.
                </p>
              </div>
              <div className="flex-1 px-5 sm:px-6 py-4 sm:py-5 flex flex-col justify-center" style={{ background: "#282828" }}>
                <p className="text-[12px] sm:text-[13px] mb-2 sm:mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Get started today
                </p>
                <Link
                  href="mailto:hello@thecleansheet.in"
                  className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg w-fit transition-all hover:gap-2.5"
                  style={{ background: "#fd6158", color: "#ffffff" }}
                >
                  Email hello@thecleansheet.in <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Trust / Confidentiality Note ───────────────────── */}
        <div className="px-4 sm:px-5 py-4 rounded-lg" style={{ background: "#ffffff", border: "1px solid #eee" }}>
          <p className="text-[11px] sm:text-[12px] leading-relaxed text-center" style={{ color: "#b0a8a4" }}>
            This is a private preview page shared directly with you by The Clean Sheet. Your confidentiality is important to us — this link is not indexed by search engines and is not linked from our public website.
          </p>
        </div>

        {/* ─── Copyright ─────────────────────────────────────── */}
        <div className="flex items-center justify-center px-1 pt-1">
          <p className="text-[10px]" style={{ color: "#b0a8a4" }}>
            &copy; The Clean Sheet 2026 · thecleansheet.in
          </p>
        </div>

      </main>
    </div>
  );
}
