'use client';

import React, { useState } from 'react';
import { mockProducts, Product } from '@/data/mockProducts';

interface MobileShopProps {
  onNavigate: (screen: any, productId?: string) => void;
  savedProducts: string[];
  compareList: string[];
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

type SortType = 
  | 'BEST_MATCH'
  | 'SCORE_HIGH'
  | 'PRICE_PER_ML_LOW'
  | 'NEWEST';

export function MobileShop({ 
  onNavigate, 
  savedProducts, 
  compareList, 
  onToggleSave, 
  onToggleCompare 
}: MobileShopProps) {
  // Filter states
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [minScore, setMinScore] = useState<number>(0);
  const [isFragranceFree, setIsFragranceFree] = useState(false);
  const [isBabySafe, setIsBabySafe] = useState(false);
  const [isPregnancySafe, setIsPregnancySafe] = useState(false);
  const [sortOption, setSortOption] = useState<SortType>('SCORE_HIGH');

  // Available filters categories
  const categories = ['All', 'Serums', 'Moisturisers', 'Sunscreens', 'Face Wash'];
  const brands = ['All', 'Aura Skincare', 'CeraLab', 'Glow & Guard', 'Purify Co.', 'Youth Booster', 'Baby Pure'];

  // Apply filters
  let filtered = mockProducts.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
    if (p.scores.total < minScore) return false;
    if (isFragranceFree && !p.ingredient_list.toLowerCase().includes('fragrance')) {
      // Fragrance Free is true if INCI does not contain fragrance
      if (p.ingredient_list.toLowerCase().includes('fragrance') || p.ingredient_list.toLowerCase().includes('linalool')) {
        return false;
      }
    }
    if (isBabySafe && !p.pills.includes('Baby Safe')) return false;
    if (isPregnancySafe && p.ingredient_list.toLowerCase().includes('oxybenzone')) return false;
    return true;
  });

  // Apply sorting
  filtered.sort((a, b) => {
    if (sortOption === 'SCORE_HIGH') {
      return b.scores.total - a.scores.total;
    }
    if (sortOption === 'PRICE_PER_ML_LOW') {
      return a.price_per_ml - b.price_per_ml;
    }
    if (sortOption === 'NEWEST') {
      return b.id.localeCompare(a.id); // Mock newer based on ID
    }
    return 0; // Default
  });

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setMinScore(0);
    setIsFragranceFree(false);
    setIsBabySafe(false);
    setIsPregnancySafe(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#fcf9f8] text-[#282828] select-none">
      {/* Header bar */}
      <header className="bg-white px-4 py-4 border-b border-[#b0a8a4]/20 flex justify-between items-center sticky top-0 z-20">
        <button onClick={() => onNavigate('HOME')} className="text-[#248179] flex items-center gap-1">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-sans text-[12px] uppercase tracking-wider">Back</span>
        </button>
        <h2 className="font-display text-[15px] tracking-tight text-[#248179] uppercase">Shop Safe Marketplace</h2>
        <button 
          onClick={() => setShowFilterSheet(true)}
          className="text-[#248179] flex items-center gap-1.5 border border-[#b0a8a4]/30 px-2.5 py-1 rounded"
        >
          <span className="material-symbols-outlined text-[16px]">filter_alt</span>
          <span className="font-sans text-[11px] uppercase tracking-widest">Filters</span>
        </button>
      </header>

      {/* Sorting bar */}
      <div className="bg-[#f9f8f7] border-b border-[#b0a8a4]/15 px-4 py-2 flex justify-between items-center text-[12px]">
        <span className="font-sans text-[#b0a8a4]">Products ({filtered.length})</span>
        <div className="flex items-center gap-1">
          <span className="font-sans text-[#b0a8a4]">Sort by:</span>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value as SortType)}
            className="bg-transparent border-0 text-[#248179] font-sans p-0 text-[12px] focus:ring-0 focus:outline-none"
          >
            <option value="SCORE_HIGH">TCS Score (High)</option>
            <option value="PRICE_PER_ML_LOW">Price / ml (Low)</option>
            <option value="NEWEST">Newest Analysed</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-grow overflow-y-auto px-3.5 py-4 pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-[#b0a8a4]/40">search_off</span>
            <div className="font-display text-lg text-[#b0a8a4]">No Safest matches</div>
            <button 
              onClick={resetFilters}
              className="border border-[#248179] text-[#248179] px-6 py-2 rounded-full font-sans text-[12px] uppercase tracking-widest"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {filtered.map((product) => {
              const score = product.scores.total;
              let scoreColor = "bg-[#248179]"; // 90+
              if (score < 90 && score >= 75) scoreColor = "bg-[#248179]/85";
              if (score < 75 && score >= 60) scoreColor = "bg-[#d2ff34] text-[#282828]";
              if (score < 60) scoreColor = "bg-[#fd6158]";

              return (
                <div 
                  key={product.id}
                  className="bg-white border border-[#b0a8a4]/30 rounded p-3 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] relative"
                >
                  {/* Image & Header */}
                  <div className="space-y-2.5">
                    {/* Image Area */}
                    <div 
                      onClick={() => onNavigate('PDP', product.id)}
                      className="w-full aspect-square bg-[#f9f8f7] border border-[#b0a8a4]/15 rounded overflow-hidden relative cursor-pointer"
                    >
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      
                      {/* Score Badge */}
                      <span className={`absolute top-2 left-2 text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-sans text-white z-10 ${scoreColor}`}>
                        {score}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <span className="font-sans text-[9px] text-[#b0a8a4] uppercase tracking-widest block">{product.brand}</span>
                        <h4 
                          onClick={() => onNavigate('PDP', product.id)}
                          className="font-display text-[13px] text-[#282828] truncate mt-0.5 cursor-pointer hover:text-[#248179] transition-colors"
                        >
                          {product.name}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="mt-3.5 space-y-2">
                    {/* Price and ml details */}
                    <div className="flex justify-between items-baseline text-[11px] font-sans text-[#282828]">
                      <span>₹{product.mrp}</span>
                      <span className="text-[#b0a8a4]">₹{product.price_per_ml}/ml</span>
                    </div>

                    {/* Pills (Max 2) */}
                    <div className="flex flex-wrap gap-1">
                      {product.pills.slice(0, 2).map((pill, i) => (
                        <span key={i} className="font-sans text-[9px] bg-[#f9f8f7] border border-[#b0a8a4]/20 px-1.5 py-0.5 rounded text-[#282828] truncate max-w-[80px]">
                          {pill}
                        </span>
                      ))}
                    </div>

                    {/* Utility Controls */}
                    <div className="flex justify-between items-center border-t border-[#b0a8a4]/10 pt-2 text-[11px]">
                      {/* Compare action */}
                      <button 
                        onClick={() => onToggleCompare(product.id)}
                        className={`flex items-center gap-0.5 transition-colors ${
                          compareList.includes(product.id) ? 'text-[#248179]' : 'text-[#b0a8a4] hover:text-[#248179]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">compare_arrows</span>
                        <span className="font-sans text-[10px] uppercase">Compare</span>
                      </button>

                      {/* Save action */}
                      <button 
                        onClick={() => onToggleSave(product.id)}
                        className={`transition-colors ${
                          savedProducts.includes(product.id) ? 'text-[#fd6158]' : 'text-[#b0a8a4] hover:text-[#fd6158]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: savedProducts.includes(product.id) ? "'FILL' 1" : "'FILL' 0" }}>
                          bookmark
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FILTER BOTTOM SHEET SLIDE OVER */}
      {showFilterSheet && (
        <div className="absolute inset-0 bg-black/40 z-50 flex flex-col justify-end">
          {/* Backdrop Click Dismiss */}
          <div className="flex-1" onClick={() => setShowFilterSheet(false)} />
          
          {/* Filter Container */}
          <div className="bg-white rounded-t-2xl border-t border-[#b0a8a4]/30 max-h-[85%] flex flex-col justify-between">
            <div className="px-4 py-4 border-b border-[#b0a8a4]/20 flex justify-between items-center">
              <h3 className="font-display text-lg text-[#248179]">Filters</h3>
              <button 
                onClick={resetFilters}
                className="font-sans text-[11px] text-[#b0a8a4] hover:text-[#fd6158] uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>

            {/* Scrollable Filters form */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {/* Category */}
              <div className="space-y-2">
                <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase">Category</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`font-sans text-[12px] px-3.5 py-1.5 rounded-full border transition-colors ${
                        selectedCategory === cat 
                          ? 'bg-[#248179] text-white border-[#248179]' 
                          : 'bg-white border-[#b0a8a4]/40 text-[#282828]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase">Brand</span>
                <div className="flex flex-wrap gap-2">
                  {brands.map(br => (
                    <button
                      key={br}
                      onClick={() => setSelectedBrand(br)}
                      className={`font-sans text-[12px] px-3.5 py-1.5 rounded-full border transition-colors ${
                        selectedBrand === br 
                          ? 'bg-[#248179] text-white border-[#248179]' 
                          : 'bg-white border-[#b0a8a4]/40 text-[#282828]'
                      }`}
                    >
                      {br}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase">Minimum Score</span>
                  <span className="font-sans text-[13px] text-[#248179]">{minScore}+</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="90" 
                  step="10"
                  value={minScore} 
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full accent-[#248179]"
                />
              </div>

              {/* Safety Flags */}
              <div className="space-y-3 pt-2">
                <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase block">Purity & Safety</span>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isFragranceFree}
                    onChange={(e) => setIsFragranceFree(e.target.checked)}
                    className="rounded border-[#b0a8a4] text-[#248179] focus:ring-0"
                  />
                  <span className="font-sans text-[13px] text-[#282828]">Fragrance Free</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isBabySafe}
                    onChange={(e) => setIsBabySafe(e.target.checked)}
                    className="rounded border-[#b0a8a4] text-[#248179] focus:ring-0"
                  />
                  <span className="font-sans text-[13px] text-[#282828]">Baby Safe</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isPregnancySafe}
                    onChange={(e) => setIsPregnancySafe(e.target.checked)}
                    className="rounded border-[#b0a8a4] text-[#248179] focus:ring-0"
                  />
                  <span className="font-sans text-[13px] text-[#282828]">Pregnancy Safe (No Oxybenzone)</span>
                </label>
              </div>
            </div>

            {/* Apply Button */}
            <div className="px-4 py-4 border-t border-[#b0a8a4]/10 bg-[#fcf9f8]">
              <button 
                onClick={() => setShowFilterSheet(false)}
                className="w-full bg-[#248179] text-white font-sans text-[12px] tracking-[0.08em] uppercase py-3.5 rounded-full hover:bg-[#248179]/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar (reused) */}
      <nav className="bg-white border-t border-[#b0a8a4]/20 fixed bottom-0 left-0 right-0 z-30 flex justify-around items-center py-2 h-[64px] max-w-[390px] mx-auto select-none">
        <button 
          onClick={() => onNavigate('HOME')}
          className="flex flex-col items-center justify-center flex-1 text-[#b0a8a4] hover:text-[#248179] transition-colors gap-0.5"
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="font-sans text-[9px] uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => onNavigate('SHOP')}
          className="flex flex-col items-center justify-center flex-1 text-[#248179] gap-0.5"
        >
          <span className="material-symbols-outlined text-[22px]">verified_user</span>
          <span className="font-sans text-[9px] uppercase tracking-wider">Shop Safe</span>
        </button>
        <button 
          onClick={() => onNavigate('ANALYSER')}
          className="flex flex-col items-center justify-center flex-1 text-[#b0a8a4] hover:text-[#248179] transition-colors gap-0.5"
        >
          <span className="material-symbols-outlined text-[22px]">biotech</span>
          <span className="font-sans text-[9px] uppercase tracking-wider">Analyse</span>
        </button>
        <button 
          onClick={() => onNavigate('ROUTINE')}
          className="flex flex-col items-center justify-center flex-1 text-[#b0a8a4] hover:text-[#248179] transition-colors gap-0.5"
        >
          <span className="material-symbols-outlined text-[22px]">calendar_today</span>
          <span className="font-sans text-[9px] uppercase tracking-wider">Routine</span>
        </button>
        <button 
          onClick={() => onNavigate('LEARN')}
          className="flex flex-col items-center justify-center flex-1 text-[#b0a8a4] hover:text-[#248179] transition-colors gap-0.5"
        >
          <span className="material-symbols-outlined text-[22px]">menu_book</span>
          <span className="font-sans text-[9px] uppercase tracking-wider">Learn</span>
        </button>
      </nav>
    </div>
  );
}
