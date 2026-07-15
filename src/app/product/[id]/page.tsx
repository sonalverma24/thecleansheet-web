import React from 'react';
import { StatusLabel } from '@/components/ui/StatusLabel';
import { ScoreDots } from '@/components/ui/ScoreDots';

export default function ProductDetailPage() {
  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-16">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row gap-8 md:gap-16">
        <div className="flex-1 bg-[var(--color-surface-subtle)] p-8 flex flex-col items-center justify-center border border-[var(--color-warm-gray)] relative min-h-[400px]">
          <div className="absolute top-4 left-4">
            <StatusLabel label="Public Data Review" status="neutral" />
          </div>
          <img src="https://via.placeholder.com/600x600/F7F7F5/282828?text=Product+Bottle" alt="Product" className="w-full max-w-sm mix-blend-multiply" />
        </div>
        
        <div className="flex-1 flex flex-col gap-6 pt-4">
          <div>
            <div className="text-[12px] tracking-widest uppercase text-[var(--color-warm-gray)] mb-2">Minimalist</div>
            <h1 className="font-display text-4xl md:text-5xl leading-tight mb-4">Oat Extract 06% Gentle Cleanser</h1>
            <p className="text-[16px] text-[var(--color-charcoal)]">A gentle, non-drying cleanser that supports the skin barrier.</p>
          </div>

          <div className="flex items-center gap-6 py-6 border-y border-[var(--color-surface-subtle)]">
            <div className="w-24 h-24 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-display text-4xl shrink-0">
              94
            </div>
            <div className="flex flex-col gap-1 mb-2">
              <span className="font-display text-2xl text-[var(--color-charcoal)]">Excellent Profile</span>
              <span className="text-[12px] tracking-widest uppercase text-[var(--color-warm-gray)]">Clean Sheet Score</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[12px] tracking-widest uppercase text-[var(--color-charcoal)]">Product Verdict</h3>
            <p className="text-[16px]">Strong barrier support and low concern ingredient profile. Formulated thoughtfully without common irritants.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button className="flex-1 bg-[var(--color-charcoal)] text-white py-4 text-[12px] tracking-widest uppercase rounded-full hover:bg-[var(--color-primary)] transition-colors text-center">
              Buy via Nykaa
            </button>
            <button className="flex-1 border border-[var(--color-charcoal)] text-[var(--color-charcoal)] py-4 text-[12px] tracking-widest uppercase rounded-full hover:bg-[var(--color-surface-subtle)] transition-colors text-center">
              Buy via Amazon
            </button>
          </div>
          <p className="text-[10px] text-[var(--color-warm-gray)] text-center tracking-wide">Retailer prices and availability may change. Checkout happens on the retailer website.</p>
        </div>
      </section>

      {/* Score Breakdown */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-3xl border-b border-[var(--color-surface-subtle)] pb-4">Score Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[var(--color-warm-gray)] p-8 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[var(--color-surface-subtle)] pb-4">
              <span className="text-[12px] tracking-widest uppercase text-[var(--color-charcoal)]">Safety & Toxicity</span>
              <div className="flex gap-4 items-center">
                <span className="font-display text-2xl">48/50</span>
                <ScoreDots score={4} />
              </div>
            </div>
            <p className="text-[14px]">No high-concern ingredients detected. Preservative system is well-established and safe.</p>
          </div>
          <div className="border border-[var(--color-warm-gray)] p-8 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[var(--color-surface-subtle)] pb-4">
              <span className="text-[12px] tracking-widest uppercase text-[var(--color-charcoal)]">Formulation Quality</span>
              <div className="flex gap-4 items-center">
                <span className="font-display text-2xl">18/20</span>
                <ScoreDots score={4} />
              </div>
            </div>
            <p className="text-[14px]">Active ingredients are present at meaningful concentrations according to INCI order.</p>
          </div>
          <div className="border border-[var(--color-warm-gray)] p-8 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[var(--color-surface-subtle)] pb-4">
              <span className="text-[12px] tracking-widest uppercase text-[var(--color-charcoal)]">Claims & Transparency</span>
              <div className="flex gap-4 items-center">
                <span className="font-display text-2xl">19/20</span>
                <ScoreDots score={4} />
              </div>
            </div>
            <p className="text-[14px]">All product claims are supported by the provided ingredient list and concentrations.</p>
          </div>
          <div className="border border-[var(--color-warm-gray)] p-8 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[var(--color-surface-subtle)] pb-4">
              <span className="text-[12px] tracking-widest uppercase text-[var(--color-charcoal)]">Ethics & Sustainability</span>
              <div className="flex gap-4 items-center">
                <span className="font-display text-2xl">9/10</span>
                <ScoreDots score={4} />
              </div>
            </div>
            <p className="text-[14px]">Cruelty-free certification verified. Recyclable packaging components used.</p>
          </div>
        </div>
      </section>
      
      {/* Mocking claims audit briefly */}
      <section className="flex flex-col gap-6 pb-12">
        <h2 className="font-display text-3xl border-b border-[var(--color-surface-subtle)] pb-4">Claims Audit</h2>
        <div className="flex flex-col border border-[var(--color-warm-gray)]">
          <div className="grid grid-cols-3 p-4 border-b border-[var(--color-warm-gray)] bg-[var(--color-surface-subtle)] text-[12px] tracking-widest uppercase">
            <div>Claim</div>
            <div>Status</div>
            <div>Reason</div>
          </div>
          <div className="grid grid-cols-3 p-4 border-b border-[var(--color-surface-subtle)] text-[14px] items-center">
            <div>"Soothes sensitive skin"</div>
            <div><span className="text-[var(--color-primary)] uppercase tracking-widest text-[10px]">Supported</span></div>
            <div className="text-[12px]">Oat extract present at 6%, an active level for soothing.</div>
          </div>
          <div className="grid grid-cols-3 p-4 text-[14px] items-center">
            <div>"Dermatologist Tested"</div>
            <div><span className="text-[#F59E0B] uppercase tracking-widest text-[10px]">Not Verifiable</span></div>
            <div className="text-[12px]">Requires lab or clinical evidence. Not verifiable from label alone.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
