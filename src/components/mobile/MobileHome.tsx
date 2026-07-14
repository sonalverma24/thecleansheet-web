'use client';

import React, { useState } from 'react';
import { mockProducts, Product } from '@/data/mockProducts';

interface MobileHomeProps {
  user: { name: string; email: string; isGuest: boolean } | null;
  onNavigate: (screen: any, productId?: string) => void;
  savedProducts: string[];
  compareList: string[];
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

export function MobileHome({ 
  user, 
  onNavigate, 
  savedProducts, 
  compareList, 
  onToggleSave, 
  onToggleCompare 
}: MobileHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Search filter
  const filteredProducts = mockProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Home Screen Bento featured product (Aura Hydration Serum)
  const featuredProduct = mockProducts.find(p => p.id === "1") || mockProducts[0];

  // Recently analysed
  const recentlyAnalysed = mockProducts.filter(p => p.id !== "1");

  return (
    <div className="flex flex-col h-full bg-[#fcf9f8] text-[#282828]">
      {/* Top Header Bar */}
      <header className="bg-white px-4 py-4 border-b border-[#b0a8a4]/20 flex justify-between items-center sticky top-0 z-15 select-none">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="The Clean Sheet Logo" className="w-8 h-8 rounded-full object-contain" />
          <span className="font-display text-[15px] tracking-tight text-[#248179] uppercase">The Clean Sheet</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Admin shortcut */}
          <button 
            onClick={() => onNavigate('ADMIN')} 
            className="text-[11px] tracking-widest text-[#b0a8a4] uppercase hover:text-[#248179] transition-colors border border-[#b0a8a4]/30 px-2 py-0.5 rounded"
          >
            Admin
          </button>
          <button 
            onClick={() => onNavigate('COMPARE')} 
            className="text-[#b0a8a4] hover:text-[#248179] relative p-1.5"
          >
            <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
            {compareList.length > 0 && (
              <span className="absolute top-0 right-0 bg-[#fd6158] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-sans">
                {compareList.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main content scroll container */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-24 space-y-7">
        
        {/* Welcome Section */}
        <div className="select-none">
          <h4 className="font-sans text-[13px] text-[#b0a8a4] uppercase tracking-wider mb-1">
            Good day, {user?.name || 'Guest'}
          </h4>
          <h3 className="font-display text-xl text-[#248179]">Decode. Decide. Do Better.</h3>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search product, ingredient, or brand"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-0 border-b border-[#b0a8a4] bg-transparent py-3 pl-0 pr-10 text-[14px] text-[#282828] focus:ring-0 focus:outline-none focus:border-[#248179] transition-colors placeholder:text-[#b0a8a4]/60 font-sans"
          />
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#b0a8a4] text-lg">
            search
          </span>
        </div>

        {/* Search Results if user is typing */}
        {searchQuery.trim() !== '' && (
          <div className="bg-white border border-[#b0a8a4]/30 rounded-lg p-3 space-y-2.5">
            <div className="font-sans text-[10px] text-[#b0a8a4] tracking-widest uppercase mb-1">Search Results ({filteredProducts.length})</div>
            {filteredProducts.length === 0 ? (
              <div className="font-sans text-[13px] text-[#b0a8a4] text-center py-2">No products match your search.</div>
            ) : (
              filteredProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => onNavigate('PDP', p.id)}
                  className="flex items-center gap-3 py-1.5 hover:bg-[#f9f8f7] cursor-pointer rounded px-1 transition-colors"
                >
                  <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded bg-[#f9f8f7] border border-[#b0a8a4]/10" />
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-[11px] text-[#b0a8a4] uppercase tracking-wider">{p.brand}</div>
                    <div className="font-sans text-[13px] text-[#282828] truncate">{p.name}</div>
                  </div>
                  <span className={`text-[12px] font-sans px-2 py-0.5 rounded-full text-white ${
                    p.scores.total >= 90 ? 'bg-[#248179]' : p.scores.total >= 75 ? 'bg-[#248179]/80' : p.scores.total >= 60 ? 'bg-[#d2ff34] text-[#282828]' : 'bg-[#fd6158]'
                  }`}>
                    {p.scores.total}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-2 gap-3.5 select-none">
          <button 
            onClick={() => onNavigate('ANALYSER')} 
            className="bg-white border border-[#b0a8a4]/40 hover:border-[#248179] transition-colors rounded p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
          >
            <span className="material-symbols-outlined text-[#248179] text-2xl">barcode_scanner</span>
            <span className="font-sans text-[12px] text-[#282828]">Scan / Analyse</span>
          </button>
          <button 
            onClick={() => onNavigate('SHOP')} 
            className="bg-white border border-[#b0a8a4]/40 hover:border-[#248179] transition-colors rounded p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
          >
            <span className="material-symbols-outlined text-[#248179] text-2xl">verified_user</span>
            <span className="font-sans text-[12px] text-[#282828]">Shop Safest</span>
          </button>
          <button 
            onClick={() => onNavigate('ROUTINE')} 
            className="bg-white border border-[#b0a8a4]/40 hover:border-[#248179] transition-colors rounded p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
          >
            <span className="material-symbols-outlined text-[#248179] text-2xl">auto_awesome</span>
            <span className="font-sans text-[12px] text-[#282828]">Build Routine</span>
          </button>
          <button 
            onClick={() => onNavigate('LEARN')} 
            className="bg-white border border-[#b0a8a4]/40 hover:border-[#248179] transition-colors rounded p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
          >
            <span className="material-symbols-outlined text-[#248179] text-2xl">science</span>
            <span className="font-sans text-[12px] text-[#282828]">Decode Ingredient</span>
          </button>
        </section>

        {/* Bento Recommended Feature Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-baseline border-b border-[#b0a8a4]/20 pb-2 select-none">
            <h4 className="font-display text-[17px] text-[#248179]">Recommended for you</h4>
            <button 
              onClick={() => onNavigate('SHOP')} 
              className="font-sans text-[10px] tracking-wider text-[#248179] uppercase hover:underline"
            >
              View All
            </button>
          </div>

          {/* Featured Product Bento Layout */}
          <div className="bg-white border border-[#b0a8a4]/30 rounded p-4 space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center select-none">
              <span className="bg-[#248179]/10 text-[#248179] font-sans text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full">98% Profile Match</span>
              <button 
                onClick={() => onToggleSave(featuredProduct.id)}
                className="text-[#b0a8a4] hover:text-[#fd6158] transition-colors"
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: savedProducts.includes(featuredProduct.id) ? "'FILL' 1" : "'FILL' 0" }}>
                  bookmark
                </span>
              </button>
            </div>

            <div 
              onClick={() => onNavigate('PDP', featuredProduct.id)}
              className="flex gap-4 cursor-pointer"
            >
              <img src={featuredProduct.imageUrl} alt={featuredProduct.name} className="w-24 h-24 object-cover rounded bg-[#f9f8f7] border border-[#b0a8a4]/10" />
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="font-sans text-[11px] text-[#b0a8a4] uppercase tracking-wider">{featuredProduct.brand}</span>
                <h4 className="font-display text-[16px] text-[#282828] truncate mb-1">{featuredProduct.name}</h4>
                <p className="font-sans text-[12px] text-[#b0a8a4] line-clamp-2 leading-[16px]">{featuredProduct.verdict}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#b0a8a4]/10 select-none">
              {/* Score Indicator */}
              <div className="flex items-center gap-2">
                <span className="font-sans text-[13px] text-[#282828]">TCS Score:</span>
                <span className="font-sans text-[14px] text-white bg-[#248179] px-2 py-0.5 rounded-full">{featuredProduct.scores.total}</span>
              </div>
              <button 
                onClick={() => onNavigate('PDP', featuredProduct.id)}
                className="font-sans text-[12px] text-[#248179] hover:text-[#248179]/80 transition-colors uppercase tracking-wider"
              >
                Analyse Sheet
              </button>
            </div>
          </div>

          {/* Routine Tip Bento Card */}
          <div className="bg-white border border-[#b0a8a4]/30 rounded p-4 flex flex-col gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.02)] select-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d2ff34]"></span>
              <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase">Routine Tip</span>
            </div>
            <h4 className="font-display text-[15px] text-[#282828]">Layering Actives Warning</h4>
            <p className="font-sans text-[12px] leading-[17px] text-[#b0a8a4]">
              Based on clinical evaluations, do not combine high-dose Vitamin C with Retinol in the same skincare window. Expose ingredients details to learn why.
            </p>
          </div>
        </section>

        {/* Recently Analysed List */}
        <section className="space-y-4">
          <div className="border-b border-[#b0a8a4]/20 pb-2 select-none">
            <h4 className="font-display text-[17px] text-[#248179]">Recently analysed</h4>
          </div>

          <div className="bg-white border border-[#b0a8a4]/30 rounded divide-y divide-[#b0a8a4]/15 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            {recentlyAnalysed.slice(0, 3).map((p) => (
              <div 
                key={p.id}
                className="flex items-center justify-between p-4 hover:bg-[#f9f8f7] transition-colors cursor-pointer"
                onClick={() => onNavigate('PDP', p.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={p.imageUrl} alt={p.name} className="w-11 h-11 object-cover rounded bg-[#f9f8f7] border border-[#b0a8a4]/10" />
                  <div className="min-w-0">
                    <div className="font-sans text-[13px] text-[#282828] truncate">{p.name}</div>
                    <div className="font-sans text-[11px] text-[#b0a8a4] uppercase tracking-wider">{p.brand}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[12px] font-sans px-2.5 py-0.5 rounded-full text-white ${
                    p.scores.total >= 90 ? 'bg-[#248179]' : p.scores.total >= 75 ? 'bg-[#248179]/80' : p.scores.total >= 60 ? 'bg-[#d2ff34] text-[#282828]' : 'bg-[#fd6158]'
                  }`}>
                    {p.scores.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learn Cards */}
        <section className="space-y-4">
          <div className="border-b border-[#b0a8a4]/20 pb-2 select-none">
            <h4 className="font-display text-[17px] text-[#248179]">Learn</h4>
          </div>

          <div className="grid grid-cols-1 gap-3.5 select-none">
            <div 
              onClick={() => onNavigate('LEARN')}
              className="border border-[#b0a8a4]/35 bg-white p-5 rounded flex flex-col gap-2 hover:border-[#248179] transition-colors cursor-pointer"
            >
              <div className="flex">
                <span className="bg-[#d2ff34] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#282828]">Claim Decoder</span>
              </div>
              <h4 className="font-display text-[15px] text-[#282828]">'Dermatologist Tested' Means Nothing</h4>
              <p className="font-sans text-[12px] text-[#b0a8a4] leading-[17px]">Why standard claims lack clinical substance and how you can decode the INCI list yourself.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <nav className="bg-white border-t border-[#b0a8a4]/20 fixed bottom-0 left-0 right-0 z-30 flex justify-around items-center py-2 h-[64px] max-w-[390px] mx-auto select-none">
        <button 
          onClick={() => onNavigate('HOME')}
          className="flex flex-col items-center justify-center flex-1 text-[#248179] gap-0.5"
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="font-sans text-[9px] uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => onNavigate('SHOP')}
          className="flex flex-col items-center justify-center flex-1 text-[#b0a8a4] hover:text-[#248179] transition-colors gap-0.5"
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
