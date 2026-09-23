'use client';

import React, { useState } from 'react';
import { mockProducts, Product } from '@/data/mockProducts';

interface MobilePDPProps {
  productId: string | null;
  onNavigate: (screen: any, productId?: string) => void;
  savedProducts: string[];
  compareList: string[];
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

export function MobilePDP({
  productId,
  onNavigate,
  savedProducts,
  compareList,
  onToggleSave,
  onToggleCompare
}: MobilePDPProps) {
  const product = mockProducts.find(p => p.id === productId) || mockProducts[0];

  const [reviews, setReviews] = useState<any[]>([
    {
      id: 1,
      rating: 5,
      skin_type: "Sensitive",
      duration_used: "2 weeks",
      bought_from: "Nykaa",
      review_text: "Absolutely wonderful. Repaired my barrier flaring up in just 3 days! Zero stinging.",
      would_repurchase: true,
      is_anonymous: false,
      user_name: "Sneha S."
    }
  ]);

  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newSkinType, setNewSkinType] = useState('Sensitive');
  const [newDuration, setNewDuration] = useState('1 week');
  const [newBoughtFrom, setNewBoughtFrom] = useState('Nykaa');
  const [newRepurchase, setNewRepurchase] = useState(true);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setReviews([
      ...reviews,
      {
        id: Date.now(),
        rating: newRating,
        skin_type: newSkinType,
        duration_used: newDuration,
        bought_from: newBoughtFrom,
        review_text: newReviewText,
        would_repurchase: newRepurchase,
        is_anonymous: false,
        user_name: "You"
      }
    ]);
    setNewReviewText('');
  };

  const getScoreBand = (score: number) => {
    if (score >= 90) return 'Excellent profile';
    if (score >= 75) return 'Good profile';
    if (score >= 60) return 'Fair profile';
    return 'Use with caution';
  };

  const renderDots = (score: number, max: number) => {
    const ratio = score / max;
    let dotColor = "bg-[#248179]"; // Strong
    let ariaLabel = "Strong quality";
    if (ratio < 0.8 && ratio >= 0.6) {
      dotColor = "bg-[#d2ff34]"; // Moderate
      ariaLabel = "Moderate quality";
    } else if (ratio < 0.6) {
      dotColor = "bg-[#fd6158]"; // Concern
      ariaLabel = "Concern level detected";
    }

    // Determine filled dot count (out of 4)
    const filledCount = Math.round(ratio * 4);
    
    return (
      <div className="flex items-center gap-1" aria-label={`Score: ${score}/${max} - ${ariaLabel}`}>
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${
              i < filledCount ? dotColor : 'bg-[#b0a8a4]/30'
            }`} 
          />
        ))}
      </div>
    );
  };

  const getConcernPillColor = (concern: string) => {
    switch(concern) {
      case 'low': return 'bg-[#248179]/10 text-[#248179] border-[#248179]/20';
      case 'medium': return 'bg-[#d2ff34]/20 text-[#282828] border-[#d2ff34]/40';
      case 'high': return 'bg-[#fd6158]/10 text-[#fd6158] border-[#fd6158]/20';
      case 'restricted': return 'bg-[#fd6158]/15 text-[#fd6158] border-[#fd6158]/35';
      case 'beneficial': return 'bg-[#248179]/15 text-[#248179] border-[#248179]/30';
      default: return 'bg-[#b0a8a4]/10 text-[#282828] border-[#b0a8a4]/20';
    }
  };

  const getClaimStatusColor = (status: string) => {
    if (status === 'Supported by available data') return 'text-[#248179]';
    if (status.includes('misleading') || status.includes('Contradicted')) return 'text-[#fd6158]';
    return 'text-[#b0a8a4]';
  };

  // Similar Products
  const similarProducts = mockProducts.filter(p => p.category === product.category && p.id !== product.id);

  return (
    <div className="flex flex-col h-full bg-[#fcf9f8] text-[#282828]">
      {/* Header bar */}
      <header className="bg-white px-4 py-4 border-b border-[#b0a8a4]/20 flex justify-between items-center sticky top-0 z-20 select-none">
        <button onClick={() => onNavigate('SHOP')} className="text-[#248179] flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-sans text-[12px] uppercase tracking-wider">Market</span>
        </button>
        <span className="font-display text-[15px] tracking-tight text-[#248179] uppercase">Product Scorecard</span>
        <button 
          onClick={() => onToggleSave(product.id)}
          className={`transition-colors ${
            savedProducts.includes(product.id) ? 'text-[#fd6158]' : 'text-[#b0a8a4]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: savedProducts.includes(product.id) ? "'FILL' 1" : "'FILL' 0" }}>
            bookmark
          </span>
        </button>
      </header>

      {/* Main PDP Body scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-24 space-y-8">
        
        {/* Top Product Meta Section */}
        <section className="bg-white border border-[#b0a8a4]/30 rounded p-4 flex flex-col gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <span className="font-sans text-[10px] text-[#b0a8a4] uppercase tracking-widest block">{product.brand}</span>
              <h3 className="font-display text-[22px] leading-[26px] text-[#282828] mt-1">{product.name}</h3>
              <span className="inline-block mt-2 font-sans text-[11px] bg-[#f9f8f7] border border-[#b0a8a4]/20 px-2 py-0.5 rounded-full text-[#b0a8a4] uppercase tracking-widest">
                {product.category}
              </span>
            </div>
            
            {/* Massive Circular Score Badge */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-full border border-[#248179]/20 bg-[#248179]/5 flex flex-col items-center justify-center">
                <span className="font-display text-[22px] leading-none text-[#248179]">{product.scores.total}</span>
                <span className="text-[8px] font-sans text-[#248179]/80 uppercase tracking-tighter">Score</span>
              </div>
              <span className="font-sans text-[9px] text-[#248179] uppercase tracking-wider text-center">{getScoreBand(product.scores.total)}</span>
            </div>
          </div>

          {/* Product Image */}
          <div className="w-full h-[220px] bg-[#f9f8f7] border border-[#b0a8a4]/15 rounded overflow-hidden relative">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            
            {/* Status Indicator Pill */}
            <span className="absolute bottom-3 left-3 bg-[#282828] text-white font-sans text-[10px] tracking-wider uppercase px-2.5 py-1 rounded shadow">
              {product.status}
            </span>
          </div>

          {/* Pricing & Analysis Info */}
          <div className="grid grid-cols-2 gap-4 border-t border-b border-[#b0a8a4]/15 py-3 text-[12px] font-sans">
            <div>
              <span className="text-[#b0a8a4] block text-[10px] uppercase tracking-wider">Retail MRP</span>
              <span className="text-[#282828] font-sans">₹{product.mrp} ({product.size})</span>
            </div>
            <div>
              <span className="text-[#b0a8a4] block text-[10px] uppercase tracking-wider">Price per ml</span>
              <span className="text-[#282828]">₹{product.price_per_ml}/ml</span>
            </div>
            <div>
              <span className="text-[#b0a8a4] block text-[10px] uppercase tracking-wider">Confidence</span>
              <span className="text-[#248179]">{product.analysis_confidence} Confidence</span>
            </div>
            <div>
              <span className="text-[#b0a8a4] block text-[10px] uppercase tracking-wider">Analysed Date</span>
              <span className="text-[#282828]">2026-06-09</span>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex gap-2 select-none">
            <button 
              onClick={() => onToggleCompare(product.id)}
              className="flex-1 bg-white border border-[#282828] text-[#282828] font-sans text-[11px] tracking-wider uppercase py-3 rounded-full hover:bg-[#f9f8f7] transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">compare_arrows</span>
              {compareList.includes(product.id) ? 'Selected' : 'Compare'}
            </button>
            
            <a 
              href="#buy-now-retailers"
              className="flex-1 bg-[#248179] text-white font-sans text-[11px] tracking-wider uppercase py-3 rounded-full hover:bg-[#248179]/90 transition-colors text-center block"
            >
              Buy Now
            </a>
          </div>
        </section>

        {/* Product Verdict Card */}
        <section className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <h4 className="font-display text-[16px] text-[#248179] border-b border-[#b0a8a4]/10 pb-1.5">Product Verdict</h4>
          <p className="font-sans text-[13px] leading-[20px] text-[#282828]">{product.verdict}</p>
        </section>

        {/* Best For & Avoid If Bento Grid */}
        <section className="grid grid-cols-1 gap-3.5">
          {/* Best For */}
          <div className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2 border-b border-[#b0a8a4]/10 pb-1.5">
              <span className="material-symbols-outlined text-[#248179] text-lg">check_circle</span>
              <h4 className="font-display text-[16px] text-[#248179]">Best For</h4>
            </div>
            <ul className="space-y-2 text-[12px] font-sans text-[#282828]">
              {product.best_for.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-[#248179] text-[14px]">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Avoid If */}
          <div className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2 border-b border-[#b0a8a4]/10 pb-1.5">
              <span className="material-symbols-outlined text-[#fd6158] text-lg">warning</span>
              <h4 className="font-display text-[16px] text-[#fd6158]">Avoid If</h4>
            </div>
            <ul className="space-y-2 text-[12px] font-sans text-[#282828]">
              {product.avoid_if.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-[#fd6158] text-[14px]">⚠</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Expert Summary */}
        <section className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <h4 className="font-display text-[16px] text-[#248179] border-b border-[#b0a8a4]/10 pb-1.5">Expert Summary</h4>
          <p className="font-sans text-[13px] leading-[20px] text-[#b0a8a4]">{product.expert_summary}</p>
        </section>

        {/* Score Breakdown (4 Pillars) */}
        <section className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] select-none">
          <h4 className="font-display text-[16px] text-[#248179] border-b border-[#b0a8a4]/10 pb-1.5">Score Breakdown</h4>
          
          <div className="space-y-4">
            {/* Safety & Toxicity (50) */}
            <div className="flex justify-between items-center text-[12px] font-sans">
              <div className="space-y-0.5">
                <div className="text-[#282828]">Safety and Toxicity</div>
                <div className="text-[#b0a8a4] text-[10px] uppercase">Max 50 points</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[#282828]">{product.scores.safety} pts</span>
                {renderDots(product.scores.safety, 50)}
              </div>
            </div>

            {/* Formulation Quality (20) */}
            <div className="flex justify-between items-center text-[12px] font-sans border-t border-[#b0a8a4]/10 pt-3.5">
              <div className="space-y-0.5">
                <div className="text-[#282828]">Formulation Quality</div>
                <div className="text-[#b0a8a4] text-[10px] uppercase">Max 20 points</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[#282828]">{product.scores.formulation} pts</span>
                {renderDots(product.scores.formulation, 20)}
              </div>
            </div>

            {/* Claims and Transparency (20) */}
            <div className="flex justify-between items-center text-[12px] font-sans border-t border-[#b0a8a4]/10 pt-3.5">
              <div className="space-y-0.5">
                <div className="text-[#282828]">Claims and Transparency</div>
                <div className="text-[#b0a8a4] text-[10px] uppercase">Max 20 points</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[#282828]">{product.scores.claims} pts</span>
                {renderDots(product.scores.claims, 20)}
              </div>
            </div>

            {/* Ethics and Sustainability (10) */}
            <div className="flex justify-between items-center text-[12px] font-sans border-t border-[#b0a8a4]/10 pt-3.5">
              <div className="space-y-0.5">
                <div className="text-[#282828]">Ethics & Sustainability</div>
                <div className="text-[#b0a8a4] text-[10px] uppercase">Max 10 points</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[#282828]">{product.scores.ethics} pts</span>
                {renderDots(product.scores.ethics, 10)}
              </div>
            </div>
          </div>
        </section>

        {/* Ingredient Breakdown Section */}
        <section className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <h4 className="font-display text-[16px] text-[#248179] border-b border-[#b0a8a4]/10 pb-1.5">Ingredients & Safety</h4>
          
          <div className="space-y-3.5">
            <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase block">INCI Ingredients Analysed ({product.ingredients_breakdown.length})</span>
            
            <div className="space-y-3 divide-y divide-[#b0a8a4]/10">
              {product.ingredients_breakdown.map((ing, i) => (
                <div key={i} className={`pt-3 ${i === 0 ? 'pt-0' : ''} space-y-1.5`}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-sans text-[13px] text-[#282828]">{ing.name}</span>
                    <span className={`font-sans text-[9px] uppercase border px-2 py-0.5 rounded ${getConcernPillColor(ing.concern)}`}>
                      {ing.concern} concern
                    </span>
                  </div>
                  <div className="font-sans text-[11px] text-[#b0a8a4]">
                    <span className="text-[#282828]">Role: </span>{ing.function}
                  </div>
                  <p className="font-sans text-[12px] leading-[17px] text-[#b0a8a4]">{ing.why}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#b0a8a4]/10">
              <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase block mb-1">Full Ingredients list</span>
              <p className="font-sans text-[12px] leading-[18px] text-[#b0a8a4] italic bg-[#f9f8f7] p-3 border border-[#b0a8a4]/20 rounded">
                {product.ingredient_list}
              </p>
            </div>
          </div>
        </section>

        {/* Claims Audit Section */}
        <section className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <h4 className="font-display text-[16px] text-[#248179] border-b border-[#b0a8a4]/10 pb-1.5">Claims Audit</h4>
          
          <div className="space-y-4 divide-y divide-[#b0a8a4]/10">
            {product.claims_audit.map((cl, i) => (
              <div key={i} className={`pt-3.5 ${i === 0 ? 'pt-0' : ''} space-y-1.5`}>
                <h5 className="font-sans text-[13px] text-[#282828]">{cl.claim}</h5>
                <div className={`font-sans text-[11px] ${getClaimStatusColor(cl.status)}`}>
                  {cl.status}
                </div>
                <p className="font-sans text-[12px] leading-[17px] text-[#b0a8a4]">{cl.reason}</p>
                {cl.evidence_needed && (
                  <div className="font-sans text-[10px] text-[#b0a8a4] uppercase tracking-wider">
                    Required Evidence: {cl.evidence_needed}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Buy Now Section */}
        <section id="buy-now-retailers" className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <h4 className="font-display text-[16px] text-[#248179] border-b border-[#b0a8a4]/10 pb-1.5">Buy Now</h4>
          
          <div className="flex flex-col gap-2.5 select-none">
            {product.retailer_links.map((link, i) => (
              <a 
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#f9f8f7] border border-[#b0a8a4]/45 text-[#282828] font-sans text-[12px] tracking-wider uppercase py-3.5 rounded-full hover:bg-[#b0a8a4]/15 transition-colors flex items-center justify-center gap-2"
              >
                Purchase on {link.retailer}
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </a>
            ))}
          </div>

          <p className="font-sans text-[10px] leading-[14px] text-[#b0a8a4] text-center italic">
            Retailer prices and availability may change. The Clean Sheet helps you decide. Checkout happens on the retailer website.
          </p>
        </section>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="space-y-4 select-none">
            <div className="border-b border-[#b0a8a4]/20 pb-2">
              <h4 className="font-display text-[17px] text-[#248179]">Similar products</h4>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {similarProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => onNavigate('PDP', p.id)}
                  className="bg-white border border-[#b0a8a4]/30 rounded p-3 flex flex-col justify-between cursor-pointer hover:border-[#248179] transition-colors"
                >
                  <div className="w-full aspect-square bg-[#f9f8f7] border border-[#b0a8a4]/15 rounded overflow-hidden relative mb-2">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-[10px] bg-[#248179] text-white w-6 h-6 rounded-full flex items-center justify-center font-sans">
                      {p.scores.total}
                    </span>
                  </div>
                  <div>
                    <span className="font-sans text-[9px] text-[#b0a8a4] uppercase tracking-widest">{p.brand}</span>
                    <h5 className="font-display text-[12px] text-[#282828] truncate">{p.name}</h5>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* User Reviews Section */}
        <section className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <h4 className="font-display text-[16px] text-[#248179] border-b border-[#b0a8a4]/10 pb-1.5">Consumer Reviews</h4>
          
          <div className="space-y-4 divide-y divide-[#b0a8a4]/10">
            {reviews.map(rev => (
              <div key={rev.id} className="pt-3.5 first:pt-0 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-sans text-[13px] text-[#282828]">{rev.user_name}</span>
                  <div className="flex text-[#d2ff34]">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[14px]">
                        {i < rev.rating ? 'star' : 'star_border'}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] text-[#b0a8a4] font-sans uppercase tracking-wider">
                  <span>Skin: {rev.skin_type}</span>
                  <span>•</span>
                  <span>Used: {rev.duration_used}</span>
                  <span>•</span>
                  <span>From: {rev.bought_from}</span>
                </div>
                <p className="font-sans text-[12px] leading-[17px] text-[#b0a8a4]">{rev.review_text}</p>
                {rev.would_repurchase && (
                  <div className="font-sans text-[10px] text-[#248179] uppercase">Would Repurchase: Yes</div>
                )}
              </div>
            ))}
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleAddReview} className="pt-4 border-t border-[#b0a8a4]/15 space-y-3.5">
            <h5 className="font-sans text-[12px] text-[#282828] uppercase tracking-wider">Add Your Experience</h5>
            
            <div className="flex items-center gap-2">
              <span className="font-sans text-[12px] text-[#b0a8a4]">Rating:</span>
              <div className="flex text-[#d2ff34] cursor-pointer">
                {[...Array(5)].map((_, i) => (
                  <button 
                    key={i} 
                    type="button"
                    onClick={() => setNewRating(i + 1)}
                    className="material-symbols-outlined text-[18px] focus:outline-none"
                  >
                    {i < newRating ? 'star' : 'star_border'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="flex flex-col">
                <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">Skin Type</label>
                <select 
                  value={newSkinType} 
                  onChange={(e) => setNewSkinType(e.target.value)}
                  className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-1.5 font-sans"
                >
                  <option value="Dry">Dry</option>
                  <option value="Oily">Oily</option>
                  <option value="Combination">Combination</option>
                  <option value="Sensitive">Sensitive</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">Bought From</label>
                <select 
                  value={newBoughtFrom} 
                  onChange={(e) => setNewBoughtFrom(e.target.value)}
                  className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-1.5 font-sans"
                >
                  <option value="Nykaa">Nykaa</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Tira">Tira</option>
                  <option value="Brand Store">Brand Store</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">Review Text</label>
              <textarea 
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your experience with the formulation..."
                className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-2 text-[13px] font-sans h-20 focus:ring-0 focus:outline-none focus:border-[#248179]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#282828] text-white font-sans text-[11px] tracking-[0.08em] uppercase py-2.5 rounded hover:bg-[#282828]/90 transition-colors"
            >
              Post Review
            </button>
          </form>

          <div className="text-[10px] text-[#b0a8a4] text-center italic mt-2">
            Consumer reviews reflect user experience. The Clean Sheet Score is based on product analysis and evidence review.
          </div>
        </section>

        {/* Disclaimer */}
        <section className="font-sans text-[10px] leading-[15px] text-[#b0a8a4] text-center pb-8 border-t border-[#b0a8a4]/10 pt-4">
          Product scores shown as Public Data Review are based on available information at the time of analysis. Certified Product status is shown only when The Clean Sheet has reviewed submitted evidence and issued certification.
        </section>
      </div>
    </div>
  );
}
