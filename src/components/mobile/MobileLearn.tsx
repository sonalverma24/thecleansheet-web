'use client';

import React, { useState } from 'react';

interface MobileLearnProps {
  onNavigate: (screen: any, productId?: string) => void;
}

interface Article {
  id: string;
  category: string;
  title: string;
  preview: string;
  content: string;
  accent: 'lime' | 'coral' | 'teal';
}

const articles: Article[] = [
  {
    id: "sunscreen",
    category: "Sunscreen Education",
    title: "The Truth About Chemical UV Filters",
    preview: "Understanding systemic absorption and why Oxybenzone is flagged in pregnancy.",
    content: "Chemical UV filters absorb ultraviolet radiation and convert it to heat. While highly effective at preventing sunburn, ingredients like Oxybenzone (Benzophenone-3) and Octinoxate have been shown in clinical studies to absorb systemically into the bloodstream at levels exceeding safety thresholds. Additionally, these molecules contribute to coral bleaching. The Clean Sheet flags these filters, recommending mineral alternatives (Zinc Oxide, Titanium Dioxide) during pregnancy and for marine swimming.",
    accent: "coral"
  },
  {
    id: "tested",
    category: "Claim Decoder",
    title: "'Dermatologist Tested' Means Nothing",
    preview: "Why common clinical claims lack regulatory standards and how to spot them.",
    content: "The claim 'Dermatologist Tested' is one of the most common marketing terms on cosmetic packaging, yet it has no legal definition under FDA or EU regulations. A brand can claim a product is dermatologist-tested even if a single dermatologist tested it on one person for one day and the subject experienced irritation. True transparency requires clinical reports, repeat insult patch tests (RIPT), and third-party certified verification.",
    accent: "lime"
  },
  {
    id: "baby",
    category: "Baby Care Safety",
    title: "Preservative Risks in Infant Lotions",
    preview: "Formaldehyde-releasing agents and paraben compounds under the microscope.",
    content: "Baby skin is thinner and has a weaker barrier than adult skin, making it highly susceptible to chemical penetration. Preservatives like DMDM Hydantoin release trace amounts of formaldehyde to prevent bacterial growth. While deemed safe in low levels for adults, they are strong sensitizers that can trigger childhood eczema. The Clean Sheet scoring engine strictly penalizes formaldehyde-releasing agents and parabens in baby products.",
    accent: "teal"
  }
];

export function MobileLearn({ onNavigate }: MobileLearnProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#fcf9f8] text-[#282828]">
      {/* Header bar */}
      <header className="bg-white px-4 py-4 border-b border-[#b0a8a4]/20 flex justify-between items-center sticky top-0 z-20 select-none">
        <button onClick={() => onNavigate('HOME')} className="text-[#248179] flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-sans text-[12px] uppercase tracking-wider">Back</span>
        </button>
        <span className="font-display text-[15px] tracking-tight text-[#248179] uppercase">Ingredient Education</span>
        <div className="w-8" />
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-24 space-y-6">
        
        {selectedArticle ? (
          // Article Detail View
          <div className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <button 
              onClick={() => setSelectedArticle(null)}
              className="text-[#248179] font-sans text-[11px] uppercase tracking-widest flex items-center gap-1 mb-2 select-none"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              Back to library
            </button>
            <div className="flex select-none">
              <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest text-[#282828] ${
                selectedArticle.accent === 'lime' ? 'bg-[#d2ff34]' : selectedArticle.accent === 'coral' ? 'bg-[#fd6158]/20 text-[#fd6158]' : 'bg-[#248179]/15 text-[#248179]'
              }`}>
                {selectedArticle.category}
              </span>
            </div>
            <h3 className="font-display text-xl text-[#282828] leading-[26px]">{selectedArticle.title}</h3>
            <div className="h-px w-full bg-[#b0a8a4]/20 my-2" />
            <p className="font-sans text-[13px] leading-[22px] text-[#b0a8a4]">
              {selectedArticle.content}
            </p>
          </div>
        ) : (
          // Article List
          <div className="space-y-4">
            <div className="font-sans text-[10px] text-[#b0a8a4] tracking-widest uppercase select-none">
              Featured Education Guides ({articles.length})
            </div>

            <div className="space-y-4">
              {articles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="bg-white border border-[#b0a8a4]/35 rounded p-5 flex flex-col gap-2 hover:border-[#248179] transition-colors cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                >
                  <div className="flex select-none">
                    <span className={`px-2.5 py-0.5 text-[9px] uppercase tracking-widest text-[#282828] ${
                      art.accent === 'lime' ? 'bg-[#d2ff34]' : art.accent === 'coral' ? 'bg-[#fd6158]/20 text-[#fd6158]' : 'bg-[#248179]/15 text-[#248179]'
                    }`}>
                      {art.category}
                    </span>
                  </div>
                  <h4 className="font-display text-[16px] text-[#282828] leading-[20px]">{art.title}</h4>
                  <p className="font-sans text-[12.5px] text-[#b0a8a4] leading-[18px]">{art.preview}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
          className="flex flex-col items-center justify-center flex-1 text-[#248179] gap-0.5"
        >
          <span className="material-symbols-outlined text-[22px]">menu_book</span>
          <span className="font-sans text-[9px] uppercase tracking-wider">Learn</span>
        </button>
      </nav>
    </div>
  );
}
