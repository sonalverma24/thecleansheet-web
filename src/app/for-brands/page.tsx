'use client';
import { useState } from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function ForBrandsPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-24">
      <main className="max-w-4xl mx-auto px-6 pt-16 space-y-16">
        
        {/* Header Section */}
        <section className="space-y-6">
          <div className="inline-block bg-teal-600 text-white text-[11px] uppercase tracking-widest px-3 py-1 rounded">
            Certification Prospectus
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-ink-950 leading-tight">
            Elevate Your Brand with Science-Backed Proof
          </h1>
          <p className="text-lg text-ink-600 max-w-2xl leading-relaxed">
            The beauty and personal care market has a trust problem. Today&apos;s consumers are increasingly skeptical of &ldquo;dermatologist tested&rdquo;, &ldquo;clinically proven&rdquo;, and &ldquo;clean&rdquo; claims that lack real evidence.
          </p>

          <div className="bg-white border border-[#eee] rounded-lg p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] mt-8">
            <p className="text-ink-950 text-base mb-6 leading-relaxed">
              The Clean Sheet exists to solve this. We are India&apos;s first independent, science-backed beauty and personal care certification system. Verify your formulation, safety data, and claims through rigorous independent review.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#process" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded font-medium transition-colors">
                View the Process
              </Link>
              <Link href="#pricing" className="bg-white border border-[#eee] hover:bg-gray-50 text-ink-950 px-6 py-2.5 rounded font-medium transition-colors">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Why Certify */}
        <section id="why-certify">
          <h2 className="font-display text-2xl text-ink-950 mb-6">Why Certify with The Clean Sheet?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#eee] border-l-4 border-l-teal-600 rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="font-display text-lg text-ink-950 mb-2">Unshakeable Consumer Trust</h3>
              <p className="text-ink-600 text-sm leading-relaxed">Move from marketing claims to verifiable proof. Consumers can scan your QR code and see exactly what makes your product safe and effective.</p>
            </div>
            <div className="bg-white border border-[#eee] border-l-4 border-l-teal-600 rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="font-display text-lg text-ink-950 mb-2">Global Readiness</h3>
              <p className="text-ink-600 text-sm leading-relaxed">Our standard is built on major global regulatory frameworks (CDSCO, EU SCCS, US FDA, ISO). Certification prepares your product dossier for international markets.</p>
            </div>
            <div className="bg-white border border-[#eee] border-l-4 border-l-teal-600 rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="font-display text-lg text-ink-950 mb-2">Stand Out in the Market</h3>
              <p className="text-ink-600 text-sm leading-relaxed">A Clean Sheet badge differentiates your product as one that has passed rigorous, independent, scientific scrutiny.</p>
            </div>
            <div className="bg-white border border-[#eee] border-l-4 border-l-danger-500 rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="font-display text-lg text-ink-950 mb-2">Actionable Feedback</h3>
              <p className="text-ink-600 text-sm leading-relaxed">Even if a product doesn&apos;t pass immediately, you receive a detailed technical assessment to help you improve your formulation, testing, or documentation.</p>
            </div>
          </div>
        </section>

        {/* What We Evaluate */}
        <section id="layers">
          <div className="mb-6">
            <h2 className="font-display text-2xl text-ink-950 mb-2">What We Evaluate</h2>
            <p className="text-ink-600">We don&apos;t just look at an ingredient list. We evaluate the entire product across five rigorous dimensions.</p>
          </div>
          <div className="space-y-3">
            {[
              { num: '01', title: 'Legal Compliance', desc: 'Are all ingredients legally permitted in your target markets? (This is a pass/fail prerequisite).' },
              { num: '02', title: 'Ingredient Safety', desc: 'Are your ingredients safe at their exact concentrations, for your target consumers (e.g., babies, pregnant women, general adults)?' },
              { num: '03', title: 'Manufacturing Quality', desc: 'Are your GMP compliance, batch testing, and manufacturing records up to international standards?' },
              { num: '04', title: 'Claims & Evidence', desc: 'Is every marketing claim backed by product-specific, robust evidence?' },
              { num: '05', title: 'Ethics & Sustainability', desc: 'Do you have the evidence for your cruelty-free, natural, organic, or sustainability claims?' }
            ].map((layer) => (
              <div key={layer.num} className="bg-white border border-[#eee] border-l-4 border-l-teal-600 rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex gap-6 items-center">
                <div className="font-display text-3xl text-teal-600/30 font-light">{layer.num}</div>
                <div>
                  <h3 className="text-ink-950 font-medium text-base mb-1">{layer.title}</h3>
                  <p className="text-ink-600 text-sm">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The PRISM System */}
        <section id="prism">
          <div className="bg-white border border-[#eee] border-l-4 border-l-teal-600 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#eee] flex justify-between items-center bg-white">
              <h2 className="font-display text-xl text-ink-950">The PRISM System</h2>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded bg-teal-600 text-white">STANDARD</span>
            </div>
            <div className="p-6">
              <p className="text-ink-600 text-sm mb-6 leading-relaxed">
                Every product starts with PRISM Core (our mandatory base standard). Depending on your product&apos;s category and claims, additional modules are seamlessly integrated tailored to your product.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center text-[12px] px-3 py-1.5 rounded bg-teal-600 text-white border border-teal-600">PRISM Core (Mandatory)</span>
                {['PRISM Sun Verified', 'PRISM Baby Safe', 'PRISM Pregnancy Safe', 'PRISM Sensitive Skin', 'PRISM Active Verified', 'PRISM Eye Safe', 'PRISM Natural & Organic'].map(tag => (
                  <span key={tag} className="inline-flex items-center text-[12px] px-3 py-1.5 rounded bg-[#fbf9f7] text-[#4a4747] border border-[#eee]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Certification Process */}
        <section id="process">
          <div className="mb-6">
            <h2 className="font-display text-2xl text-ink-950 mb-2">The Certification Process</h2>
            <p className="text-ink-600">Our process is designed to be thorough yet transparent. From complete dossier submission to your live proof page.</p>
          </div>
          <div className="space-y-3">
            {[
              { 
                title: 'Pre-Assessment', 
                badge: 'Optional but Recommended', 
                border: 'border-l-[#B0A8A4]', 
                badgeStyle: 'bg-white border border-[#eee] text-ink-600',
                desc: "Submit our Pre-Assessment Questionnaire. We'll review it and schedule a call to identify any early gaps in your formulation or testing before you pay for a full evaluation."
              },
              { 
                title: 'Application & Dossier Submission', 
                border: 'border-l-teal-600', 
                desc: 'You submit your full product dossier via our secure, encrypted portal. This includes:',
                list: ['Your complete formula (held under strict NDA)', 'Raw material documentation (COAs, SDS)', 'Safety and stability test data', 'Claims evidence & Manufacturing docs']
              },
              { 
                title: 'Completeness Review', 
                badge: 'Within 5 Business Days', 
                border: 'border-l-teal-600', 
                badgeStyle: 'bg-white border border-[#eee] text-ink-600',
                desc: 'We check if any documents are missing. If so, you have 20 days to provide them.'
              },
              { 
                title: 'Technical Evaluation & Panel Review', 
                border: 'border-l-teal-600', 
                desc: 'Our independent panel of cosmetic chemists, toxicologists, and claims specialists rigorously evaluates your product.'
              },
              { 
                title: 'Certification & Public Proof Page', 
                badge: 'Valid for 1 Year', 
                border: 'border-l-teal-600', 
                badgeStyle: 'bg-teal-600 text-white',
                desc: 'If you score 60 or above, you are certified! Your public proof page goes live, and you receive your certification badge and QR code. (Certification is valid for exactly 1 year and requires annual renewal).'
              }
            ].map((step, i) => (
              <div key={i} className={`bg-white border border-[#eee] border-l-4 ${step.border} rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-ink-950">{step.title}</h3>
                  {step.badge && (
                    <span className={`text-[10px] tracking-wider uppercase px-2.5 py-1 rounded ${step.badgeStyle}`}>
                      {step.badge}
                    </span>
                  )}
                </div>
                <p className="text-ink-600 text-sm leading-relaxed">{step.desc}</p>
                {step.list && (
                  <ul className="mt-3 space-y-1.5">
                    {step.list.map((item, j) => (
                      <li key={j} className="text-sm text-ink-600 flex items-start gap-2">
                        <span className="text-teal-600 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing">
          <div className="bg-white border border-[#eee] border-l-4 border-l-teal-600 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#eee] bg-white">
              <h2 className="font-display text-xl text-ink-950">Pricing & Packages</h2>
            </div>
            <div className="p-6">
              <p className="text-ink-600 text-sm mb-6 leading-relaxed">
                Pricing is product and category-specific, tailored to the complexity of your formulation and the claims being verified. We offer customized pricing to accommodate businesses of all sizes:
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Small Indie Brands', 'Mid-Market Brands', 'Large Organisations', 'Multi-Product Bundles'].map(tag => (
                  <span key={tag} className="inline-flex items-center text-[12px] px-3 py-1.5 rounded bg-teal-600/10 text-teal-700 border border-teal-600/20">
                    <CheckCircle2 size={12} className="mr-1.5 text-teal-600" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="border-t border-[#eee] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-ink-600">Please contact us directly for a customized quote.</p>
                <Link href="mailto:hello@thecleansheet.in" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded font-medium transition-colors text-sm whitespace-nowrap">
                  Request a Quote
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <h2 className="font-display text-2xl text-ink-950 mb-6">Common Questions</h2>
          <div className="space-y-3">
            {[
              { q: 'Do I have to share my exact formula?', a: 'Yes, we need exact concentrations to calculate safety margins. However, your formula is strictly confidential, protected by a robust NDA, and never published. Consumers only see the standard INCI list and verified active ranges.' },
              { q: "What if I don't have all the required tests yet?", a: 'Our pre-assessment will identify exactly what testing is missing. You can then commission these tests from our network of accredited labs.' },
              { q: "What if some of my claims aren't verified?", a: 'Your proof page will honestly state which claims were verified and which were not. This transparency is exactly what builds long-term consumer trust.' }
            ].map((faq, i) => (
              <div key={i} className="bg-white border border-[#eee] border-l-4 border-l-[#B0A8A4] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left"
                >
                  <span className="font-medium text-ink-950">{faq.q}</span>
                  <ChevronDown className={`text-ink-400 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} size={20} />
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-48 pb-5' : 'max-h-0'}`}>
                  <p className="text-ink-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="start">
          <div className="bg-white border border-[#eee] border-l-4 border-l-danger-500 rounded-lg p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
            <h2 className="font-display text-3xl text-ink-950 mb-8">Ready to Start?</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-10 text-left">
              <div className="bg-[#fbf9f7] p-6 rounded border border-[#eee]">
                <div className="font-display text-2xl text-danger-500 mb-2">1</div>
                <p className="text-sm text-ink-600">Request our Pre-Assessment Questionnaire & Brand Dossier Checklist.</p>
              </div>
              <div className="bg-[#fbf9f7] p-6 rounded border border-[#eee]">
                <div className="font-display text-2xl text-danger-500 mb-2">2</div>
                <p className="text-sm text-ink-600">Contact us to arrange a pre-assessment call.</p>
              </div>
              <div className="bg-[#fbf9f7] p-6 rounded border border-[#eee]">
                <div className="font-display text-2xl text-danger-500 mb-2">3</div>
                <p className="text-sm text-ink-600">Sign your NDA and access the secure brand portal.</p>
              </div>
            </div>
            
            <Link href="mailto:hello@thecleansheet.in" className="inline-block bg-danger-500 hover:bg-danger-600 text-white px-8 py-3 rounded font-medium transition-colors text-base">
              Email hello@thecleansheet.in
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
