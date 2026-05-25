'use client';
import { useState } from 'react';
import { CheckCircle2, ChevronDown, ArrowUpRight, Shield, Eye, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ForBrandsPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#fbf9f7" }}>

      {/* ─── Dark Header Strip ────────────────────────────────── */}
      <div style={{ background: "#282828" }} className="px-5 py-3 fixed top-0 left-0 w-full z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-[10px] tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
            Certification Prospectus · The Clean Sheet
          </span>
          <Link
            href="#start"
            className="text-[11px] tracking-wider uppercase px-4 py-1.5 rounded-md transition-colors"
            style={{ background: "#248179", color: "#ffffff" }}
          >
            Apply Now
          </Link>
        </div>
      </div>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="pt-20 pb-10 px-5" style={{ background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto">
          <div className="pt-8 sm:pt-12 pb-4">
            <span
              className="inline-block text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 rounded-md mb-6"
              style={{ background: "#248179", color: "#ffffff" }}
            >
              For Brands
            </span>
            <h1
              className="tracking-tight mb-5"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", lineHeight: 1.06, color: "#282828", fontWeight: 400 }}
            >
              Elevate Your Brand with<br />Science-Backed Proof
            </h1>
            <p className="text-[15px] leading-relaxed mb-8" style={{ color: "#6b6868", maxWidth: "34rem" }}>
              The beauty and personal care market has a trust problem. Consumers are increasingly skeptical of &ldquo;dermatologist tested&rdquo;, &ldquo;clinically proven&rdquo;, and &ldquo;clean&rdquo; claims that lack real evidence. The Clean Sheet exists to solve this.
            </p>

            <div
              className="rounded-lg px-6 py-5"
              style={{ background: "#fbf9f7", border: "1px solid #eee" }}
            >
              <p className="text-[14px] leading-relaxed mb-5" style={{ color: "#4a4747" }}>
                India&apos;s first independent, science-backed beauty and personal care certification system. Verify your formulation, safety data, and claims through rigorous independent review.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#process"
                  className="text-[12px] tracking-wider uppercase px-5 py-2 rounded-md transition-colors"
                  style={{ background: "#248179", color: "#ffffff" }}
                >
                  View the Process
                </Link>
                <Link
                  href="#pricing"
                  className="text-[12px] tracking-wider uppercase px-5 py-2 rounded-md transition-colors"
                  style={{ background: "#ffffff", color: "#282828", border: "1px solid #ddd" }}
                >
                  View Pricing
                </Link>
                <Link
                  href="#live-demo"
                  className="text-[12px] tracking-wider uppercase px-5 py-2 rounded-md transition-colors"
                  style={{ background: "#282828", color: "#ffffff" }}
                >
                  See it Live
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-5 space-y-10 pb-10">

        {/* ─── See It Live — certification page previews ──────── */}
        <section id="live-demo" className="pt-6">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#282828" }}
            >
              01
            </span>
            <h2 className="text-lg tracking-tight" style={{ color: "#248179" }}>
              See It Live
            </h2>
          </div>
          <p className="text-[13px] leading-relaxed mb-5 ml-9" style={{ color: "#6b6868", maxWidth: "32rem" }}>
            Every certified product gets two live pages — one for consumers and one for technical reviewers. Here&apos;s what they look like.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Consumer page card */}
            <Link
              href="/verify/codeskin-ultralite-full-v2-p5r7k2"
              className="group bg-white rounded-lg overflow-hidden transition-shadow hover:shadow-md"
              style={{ borderLeft: "4px solid #248179", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="px-5 py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(36,129,121,0.1)", color: "#248179" }}
                    >
                      <Eye size={15} />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium tracking-tight" style={{ color: "#282828" }}>Consumer Certification Page</p>
                      <p className="text-[11px]" style={{ color: "#b0a8a4" }}>What your customers see</p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded"
                    style={{ background: "#248179", color: "#ffffff" }}
                  >
                    VERIFIED
                  </span>
                </div>
                <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: "#6b6868" }}>
                  Clean, scannable product page with verified credentials, PRISM pillar breakdown, and every claim backed by evidence. Designed for trust at first glance.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] group-hover:gap-2 transition-all" style={{ color: "#248179" }}>
                  View live page <ArrowUpRight size={11} />
                </div>
              </div>
            </Link>

            {/* Technical page card */}
            <Link
              href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
              className="group bg-white rounded-lg overflow-hidden transition-shadow hover:shadow-md"
              style={{ borderLeft: "4px solid #fd6158", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="px-5 py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(253,97,88,0.1)", color: "#fd6158" }}
                    >
                      <FileText size={15} />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium tracking-tight" style={{ color: "#282828" }}>Detailed Technical Record</p>
                      <p className="text-[11px]" style={{ color: "#b0a8a4" }}>Full certification data</p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded"
                    style={{ background: "#248179", color: "#ffffff" }}
                  >
                    VERIFIED
                  </span>
                </div>
                <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: "#6b6868" }}>
                  Complete technical proof — ingredient-level assessment, regulatory compliance matrix, test data references, and full scoring breakdown across all 5 PRISM pillars.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] group-hover:gap-2 transition-all" style={{ color: "#fd6158" }}>
                  View live page <ArrowUpRight size={11} />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ─── Why Certify ────────────────────────────────────── */}
        <section id="why-certify">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#282828" }}
            >
              02
            </span>
            <h2 className="text-lg tracking-tight" style={{ color: "#248179" }}>
              Why Certify with The Clean Sheet?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: 'Unshakeable Consumer Trust', desc: 'Move from marketing claims to verifiable proof. Consumers scan your QR code and see exactly what makes your product safe and effective.', color: '#248179' },
              { title: 'Global Readiness', desc: 'Our standard is built on major global regulatory frameworks (CDSCO, EU SCCS, US FDA, ISO). Certification prepares your product dossier for international markets.', color: '#248179' },
              { title: 'Stand Out in the Market', desc: 'A Clean Sheet badge differentiates your product as one that has passed rigorous, independent, scientific scrutiny.', color: '#248179' },
              { title: 'Actionable Feedback', desc: "Even if a product doesn't pass immediately, you receive a detailed technical assessment to help you improve your formulation, testing, or documentation.", color: '#fd6158' },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-lg px-5 py-4"
                style={{ borderLeft: `4px solid ${item.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <p className="text-[14px] font-medium tracking-tight mb-2" style={{ color: "#282828" }}>{item.title}</p>
                <p className="text-[12.5px] leading-relaxed" style={{ color: "#6b6868" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── What We Evaluate ───────────────────────────────── */}
        <section id="layers">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#282828" }}
            >
              03
            </span>
            <h2 className="text-lg tracking-tight" style={{ color: "#248179" }}>
              What We Evaluate
            </h2>
          </div>
          <p className="text-[13px] leading-relaxed mb-5 ml-9" style={{ color: "#6b6868" }}>
            We evaluate the entire product across five rigorous dimensions.
          </p>
          <div className="space-y-2.5">
            {[
              { num: '01', title: 'Legal Compliance', desc: 'Are all ingredients legally permitted in your target markets? This is a pass/fail prerequisite.', color: '#fd6158' },
              { num: '02', title: 'Ingredient Safety', desc: 'Are your ingredients safe at their exact concentrations, for your target consumers?', color: '#e8963a' },
              { num: '03', title: 'Manufacturing Quality', desc: 'Are your GMP compliance, batch testing, and manufacturing records up to international standards?', color: '#248179' },
              { num: '04', title: 'Claims & Evidence', desc: 'Is every marketing claim backed by product-specific, robust evidence?', color: '#fd6158' },
              { num: '05', title: 'Ethics & Sustainability', desc: 'Do you have the evidence for your cruelty-free, natural, organic, or sustainability claims?', color: '#6b9e3a' },
            ].map((layer) => (
              <div
                key={layer.num}
                className="bg-white rounded-lg px-5 py-4 flex gap-5 items-center"
                style={{ borderLeft: `4px solid ${layer.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="text-2xl" style={{ color: `${layer.color}30`, fontWeight: 300 }}>{layer.num}</div>
                <div>
                  <p className="text-[14px] font-medium tracking-tight mb-0.5" style={{ color: "#282828" }}>{layer.title}</p>
                  <p className="text-[12.5px]" style={{ color: "#6b6868" }}>{layer.desc}</p>
                </div>
                <span
                  className="text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded flex-shrink-0 ml-auto"
                  style={{ background: "#248179", color: "#ffffff" }}
                >
                  VERIFIED
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Lime callout ───────────────────────────────────── */}
        <div
          className="rounded-xl px-6 py-5"
          style={{ background: "linear-gradient(135deg, #e8ff8a 0%, #d2ff34 100%)" }}
        >
          <p className="text-[15px] leading-relaxed text-center" style={{ color: "#282828", maxWidth: "36rem", margin: "0 auto" }}>
            &ldquo;We don&apos;t just look at an ingredient list. We evaluate the entire product — formulation, safety, manufacturing, claims, and ethics.&rdquo;
          </p>
        </div>

        {/* ─── The PRISM System ───────────────────────────────── */}
        <section id="prism">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#282828" }}
            >
              04
            </span>
            <h2 className="text-lg tracking-tight" style={{ color: "#248179" }}>
              The PRISM System
            </h2>
          </div>
          <div
            className="bg-white rounded-lg overflow-hidden"
            style={{ borderLeft: "4px solid #248179", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #f0f0ee" }}>
              <p className="text-[14px] font-medium tracking-tight" style={{ color: "#282828" }}>Certification Modules</p>
              <span
                className="text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded"
                style={{ background: "#248179", color: "#ffffff" }}
              >
                STANDARD
              </span>
            </div>
            <div className="px-5 py-4">
              <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: "#6b6868" }}>
                Every product starts with PRISM Core (our mandatory base standard). Depending on your product&apos;s category and claims, additional modules are integrated.
              </p>
              <div className="flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center text-[11px] px-3 py-1.5 rounded-md"
                  style={{ background: "#248179", color: "#ffffff" }}
                >
                  PRISM Core (Mandatory)
                </span>
                {['Sun Verified', 'Baby Safe', 'Pregnancy Safe', 'Sensitive Skin', 'Active Verified', 'Eye Safe', 'Natural & Organic'].map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-[11px] px-3 py-1.5 rounded-md"
                    style={{ background: "#fbf9f7", color: "#4a4747", border: "1px solid #eee" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Certification Process ──────────────────────────── */}
        <section id="process">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#282828" }}
            >
              05
            </span>
            <h2 className="text-lg tracking-tight" style={{ color: "#248179" }}>
              The Certification Process
            </h2>
          </div>
          <p className="text-[13px] leading-relaxed mb-5 ml-9" style={{ color: "#6b6868" }}>
            Thorough yet transparent. From dossier submission to your live proof page.
          </p>
          <div className="space-y-2.5">
            {[
              { title: 'Pre-Assessment', badge: 'Optional', color: '#b0a8a4', desc: "Submit our Pre-Assessment Questionnaire. We'll review it and schedule a call to identify any early gaps in your formulation or testing before you pay for a full evaluation." },
              { title: 'Application & Dossier Submission', color: '#248179', desc: 'You submit your full product dossier via our secure, encrypted portal — your complete formula (held under strict NDA), raw material documentation, safety and stability test data, and claims evidence.' },
              { title: 'Completeness Review', badge: 'Within 5 Days', color: '#248179', desc: 'We check if any documents are missing. If so, you have 20 days to provide them.' },
              { title: 'Technical Evaluation & Panel Review', badge: '6-10 Weeks', color: '#248179', desc: 'Our independent panel of cosmetic chemists, toxicologists, and claims specialists rigorously evaluates your product across all 5 pillars.' },
              { title: 'Certification & Live Proof Page', badge: 'Valid 1 Year', color: '#fd6158', desc: 'If you score 60 or above, you are certified. Your public proof page goes live, and you receive your certification badge and QR code.' },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white rounded-lg px-5 py-4"
                style={{ borderLeft: `4px solid ${step.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[14px] font-medium tracking-tight" style={{ color: "#282828" }}>{step.title}</p>
                  {step.badge && (
                    <span
                      className="text-[10px] tracking-wider uppercase px-2.5 py-1 rounded"
                      style={{ background: "#fbf9f7", color: "#6b6868", border: "1px solid #eee" }}
                    >
                      {step.badge}
                    </span>
                  )}
                </div>
                <p className="text-[12.5px] leading-relaxed" style={{ color: "#6b6868" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Pricing ────────────────────────────────────────── */}
        <section id="pricing">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#282828" }}
            >
              06
            </span>
            <h2 className="text-lg tracking-tight" style={{ color: "#248179" }}>
              Pricing & Packages
            </h2>
          </div>
          <div
            className="bg-white rounded-lg overflow-hidden"
            style={{ borderLeft: "4px solid #248179", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="px-5 py-4">
              <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: "#6b6868" }}>
                Pricing is product and category-specific, tailored to the complexity of your formulation and the claims being verified. We offer customized pricing to accommodate businesses of all sizes.
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {['Small Indie Brands', 'Mid-Market Brands', 'Large Organisations', 'Multi-Product Bundles'].map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-[11px] px-3 py-1.5 rounded-md"
                    style={{ background: "rgba(36,129,121,0.06)", color: "#248179", border: "1px solid rgba(36,129,121,0.15)" }}
                  >
                    <CheckCircle2 size={11} className="mr-1.5" style={{ color: "#248179" }} />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4" style={{ borderTop: "1px solid #f0f0ee" }}>
                <p className="text-[12px]" style={{ color: "#b0a8a4" }}>Contact us directly for a customized quote.</p>
                <Link
                  href="mailto:hello@thecleansheet.in"
                  className="text-[12px] tracking-wider uppercase px-5 py-2 rounded-md transition-colors whitespace-nowrap"
                  style={{ background: "#248179", color: "#ffffff" }}
                >
                  Request a Quote
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ────────────────────────────────────────────── */}
        <section id="faq">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#282828" }}
            >
              07
            </span>
            <h2 className="text-lg tracking-tight" style={{ color: "#248179" }}>
              Common Questions
            </h2>
          </div>
          <div className="space-y-2.5">
            {[
              { q: 'Do I have to share my exact formula?', a: 'Yes, we need exact concentrations to calculate safety margins. However, your formula is strictly confidential, protected by a robust NDA, and never published. Consumers only see the standard INCI list and verified active ranges.' },
              { q: "What if I don't have all the required tests yet?", a: 'Our pre-assessment will identify exactly what testing is missing. You can then commission these tests from our network of accredited labs.' },
              { q: "What if some of my claims aren't verified?", a: 'Your proof page will honestly state which claims were verified and which were not. This transparency is exactly what builds long-term consumer trust.' }
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden"
                style={{ borderLeft: "4px solid #b0a8a4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-5 py-3.5 flex justify-between items-center text-left"
                >
                  <span className="text-[14px] font-medium tracking-tight" style={{ color: "#282828" }}>{faq.q}</span>
                  <ChevronDown
                    className="transition-transform duration-300 flex-shrink-0 ml-4"
                    size={14}
                    style={{ color: activeFaq === i ? "#248179" : "#d4d2d2", transform: activeFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                <div
                  className="grid"
                  style={{ gridTemplateRows: activeFaq === i ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-4">
                      <p className="text-[12.5px] leading-relaxed" style={{ color: "#6b6868" }}>{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA — Ready to Start ──────────────────────────── */}
        <section id="start">
          <div
            className="rounded-xl overflow-hidden"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
          >
            {/* Top — dark section */}
            <div className="px-6 py-8 text-center" style={{ background: "#282828" }}>
              <h2 className="text-xl tracking-tight mb-2" style={{ color: "#ffffff", fontWeight: 400 }}>
                Ready to Start?
              </h2>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>Three steps to your certification</p>
            </div>

            {/* Steps */}
            <div className="grid sm:grid-cols-3" style={{ background: "#ffffff" }}>
              {[
                { num: '1', text: 'Request our Pre-Assessment Questionnaire & Brand Dossier Checklist.', color: '#248179' },
                { num: '2', text: 'Contact us to arrange a pre-assessment call.', color: '#fd6158' },
                { num: '3', text: 'Sign your NDA and access the secure brand portal.', color: '#d2ff34' },
              ].map((step, i) => (
                <div
                  key={i}
                  className="px-5 py-5"
                  style={{ borderBottom: "3px solid " + step.color, borderRight: i < 2 ? "1px solid #f0f0ee" : "none" }}
                >
                  <div className="text-lg mb-2" style={{ color: step.color, fontWeight: 300 }}>{step.num}</div>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: "#6b6868" }}>{step.text}</p>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="flex flex-col sm:flex-row" >
              <div className="flex-1 px-6 py-5" style={{ background: "#248179" }}>
                <p className="text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                  thecleansheet.in
                </p>
                <p className="text-white text-[14px] leading-snug">
                  India&apos;s first independent beauty<br />& personal care certification.
                </p>
              </div>
              <div className="flex-1 px-6 py-5 flex flex-col justify-center" style={{ background: "#282828" }}>
                <p className="text-[13px] mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Get started today
                </p>
                <Link
                  href="mailto:hello@thecleansheet.in"
                  className="inline-flex items-center gap-2 text-[12px] px-5 py-2.5 rounded-lg w-fit transition-all hover:gap-2.5"
                  style={{ background: "#fd6158", color: "#ffffff" }}
                >
                  Email hello@thecleansheet.in <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Copyright ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-1 pt-2">
          <p className="text-[10px]" style={{ color: "#b0a8a4" }}>
            &copy; The Clean Sheet 2026 · thecleansheet.in
          </p>
        </div>

      </main>
    </div>
  );
}
