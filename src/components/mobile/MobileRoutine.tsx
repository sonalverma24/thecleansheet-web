'use client';

import React, { useState } from 'react';
import { mockProducts, Product } from '@/data/mockProducts';

interface MobileRoutineProps {
  profile: any;
  setProfile: (profile: any) => void;
  onNavigate: (screen: any, productId?: string) => void;
}

export function MobileRoutine({ profile, setProfile, onNavigate }: MobileRoutineProps) {
  const [skinType, setSkinType] = useState('Dry');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [sensitivity, setSensitivity] = useState(false);
  const [pregnancy, setPregnancy] = useState(false);
  const [baby, setBaby] = useState(false);
  const [currentActives, setCurrentActives] = useState<string[]>([]);
  const [isGenerated, setIsGenerated] = useState(profile !== null);

  const toggleConcern = (concern: string) => {
    setConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern) 
        : [...prev, concern]
    );
  };

  const toggleActive = (act: string) => {
    setCurrentActives(prev =>
      prev.includes(act)
        ? prev.filter(a => a !== act)
        : [...prev, act]
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile = {
      skinType,
      concerns,
      sensitivity,
      pregnancy,
      baby,
      currentActives
    };
    setProfile(newProfile);
    setIsGenerated(true);
  };

  const handleReset = () => {
    setIsGenerated(false);
    setProfile(null);
    setConcerns([]);
    setCurrentActives([]);
  };

  // Routine Logic & Recommendations
  // Standard products
  const cleanser = mockProducts.find(p => p.id === "4") || mockProducts[0]; // Charcoal cleanser
  const safeCleanser = mockProducts.find(p => p.id === "6") || mockProducts[0]; // Mild baby wash (safe)
  const serum = mockProducts.find(p => p.id === "1") || mockProducts[0]; // Aura serum
  const cream = mockProducts.find(p => p.id === "2") || mockProducts[0]; // Cera-barrier
  const sunscreen = mockProducts.find(p => p.id === "3") || mockProducts[0]; // Chemical sunscreen

  // Warnings list
  const warnings: string[] = [];
  if (pregnancy && currentActives.includes('Retinol')) {
    warnings.push("Retinol usage is strongly cautioned during pregnancy due to systemic vitamin A risks. Avoid Retinol-based treatments.");
  }
  if (currentActives.includes('Retinol') || currentActives.includes('Salicylic Acid')) {
    warnings.push("Using cell-turnover actives (Retinol/Exfoliating acids) without daily sunscreen increases UV vulnerability. Add SPF 50 daily.");
  }
  if (currentActives.length >= 3) {
    warnings.push("High active ingredient stacking detected. Avoid layering too many active serums in a single window to prevent barrier micro-tears.");
  }
  if (sensitivity && cleanser.id === "4") {
    warnings.push("Stripping Cleanser warning: Charcoal wash contains harsh Sodium Laureth Sulfate (SLS), which can aggregate sensitive skin layers.");
  }

  return (
    <div className="flex flex-col h-full bg-[#fcf9f8] text-[#282828]">
      {/* Header bar */}
      <header className="bg-white px-4 py-4 border-b border-[#b0a8a4]/20 flex justify-between items-center sticky top-0 z-20 select-none">
        <button onClick={() => onNavigate('HOME')} className="text-[#248179] flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-sans text-[12px] uppercase tracking-wider">Back</span>
        </button>
        <span className="font-display text-[15px] tracking-tight text-[#248179] uppercase">Routine Personaliser</span>
        <div className="w-8" />
      </header>

      {/* Scrollable Container */}
      <div className="flex-grow overflow-y-auto px-4 py-5 pb-24 space-y-6">
        
        {!isGenerated ? (
          // Questionnaire Form
          <form onSubmit={handleGenerate} className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="text-center pb-2 border-b border-[#b0a8a4]/10 select-none">
              <h4 className="font-display text-lg text-[#248179]">Skincare Profile Analysis</h4>
              <p className="font-sans text-[12px] text-[#b0a8a4] mt-0.5">Help us scan routine ingredient matches.</p>
            </div>

            {/* Skin Type */}
            <div className="space-y-2 select-none">
              <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase block">Skin Type</span>
              <div className="grid grid-cols-2 gap-2 text-[12px] font-sans">
                {['Dry', 'Oily', 'Combination', 'Normal'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSkinType(type)}
                    className={`py-2 px-3 border rounded text-center transition-colors ${
                      skinType === type 
                        ? 'bg-[#248179]/15 text-[#248179] border-[#248179]' 
                        : 'border-[#b0a8a4]/35 bg-white text-[#282828]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Concerns */}
            <div className="space-y-2 select-none">
              <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase block">Skin Concerns</span>
              <div className="flex flex-wrap gap-2 text-[12px] font-sans">
                {['Acne', 'Aging', 'Redness', 'Dehydration', 'Barrier Damage'].map(concern => {
                  const active = concerns.includes(concern);
                  return (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => toggleConcern(concern)}
                      className={`py-1.5 px-3.5 border rounded-full transition-colors ${
                        active 
                          ? 'bg-[#248179] text-white border-[#248179]' 
                          : 'border-[#b0a8a4]/35 bg-white text-[#282828]'
                      }`}
                    >
                      {concern}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pregnancy, Baby, Sensitive */}
            <div className="space-y-3.5 pt-2 border-t border-[#b0a8a4]/10 select-none">
              <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase block">Profile Conditions</span>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sensitivity}
                  onChange={(e) => setSensitivity(e.target.checked)}
                  className="rounded border-[#b0a8a4] text-[#248179] focus:ring-0"
                />
                <span className="font-sans text-[13px] text-[#282828]">Extremely Sensitive Skin</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={pregnancy}
                  onChange={(e) => setPregnancy(e.target.checked)}
                  className="rounded border-[#b0a8a4] text-[#248179] focus:ring-0"
                />
                <span className="font-sans text-[13px] text-[#282828]">Pregnant or Conceiving</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={baby}
                  onChange={(e) => setBaby(e.target.checked)}
                  className="rounded border-[#b0a8a4] text-[#248179] focus:ring-0"
                />
                <span className="font-sans text-[13px] text-[#282828]">Interested in Baby Care</span>
              </label>
            </div>

            {/* Current Actives */}
            <div className="space-y-2 select-none">
              <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase block">Current Active Ingredients in use</span>
              <div className="flex flex-wrap gap-2 text-[12px] font-sans">
                {['Niacinamide', 'Retinol', 'Salicylic Acid', 'Vitamin C'].map(act => {
                  const active = currentActives.includes(act);
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => toggleActive(act)}
                      className={`py-1.5 px-3.5 border rounded-full transition-colors ${
                        active 
                          ? 'bg-[#248179] text-white border-[#248179]' 
                          : 'border-[#b0a8a4]/35 bg-white text-[#282828]'
                      }`}
                    >
                      {act}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#248179] text-white font-sans text-[12px] tracking-[0.08em] uppercase py-3.5 rounded-full hover:bg-[#248179]/90 transition-colors shadow-[0_8px_16px_rgba(0,103,96,0.08)]"
            >
              Analyze & Build Routine
            </button>
          </form>
        ) : (
          // Routine Result View
          <div className="space-y-6">
            <div className="flex justify-between items-baseline select-none">
              <div className="font-sans text-[10px] text-[#b0a8a4] tracking-widest uppercase">My Custom Routine</div>
              <button 
                onClick={handleReset}
                className="font-sans text-[11px] text-[#248179] hover:text-[#fd6158] uppercase tracking-wider"
              >
                Reset Profile
              </button>
            </div>

            {/* Warnings Alert Panel */}
            {warnings.length > 0 && (
              <div className="bg-[#fd6158]/5 border border-[#fd6158]/20 rounded p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#fd6158] font-sans text-[12px] font-bold uppercase select-none">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  Routine Cautions ({warnings.length})
                </div>
                <ul className="list-disc pl-4 space-y-2 text-[11.5px] leading-[17px] text-[#282828]">
                  {warnings.map((warn, i) => <li key={i}>{warn}</li>)}
                </ul>
              </div>
            )}

            {/* Morning Routine Section */}
            <div className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <h4 className="font-display text-[16px] text-[#248179] border-b border-[#b0a8a4]/10 pb-1.5 select-none">☀️ Morning Routine</h4>
              
              <div className="space-y-4">
                {/* Cleanse */}
                <div className="flex gap-3 items-center">
                  <span className="font-sans text-[11px] text-[#b0a8a4] uppercase w-16 select-none">1. Cleanse</span>
                  <div className="flex-1 min-w-0 border border-[#b0a8a4]/20 p-2.5 rounded flex items-center justify-between">
                    <span className="font-sans text-[12px] text-[#282828] truncate">{sensitivity ? safeCleanser.name : 'Standard Wash'}</span>
                    <button onClick={() => onNavigate('PDP', sensitivity ? safeCleanser.id : '4')} className="text-[#248179] text-[11px] font-sans uppercase">Verify</button>
                  </div>
                </div>

                {/* Treat */}
                <div className="flex gap-3 items-center">
                  <span className="font-sans text-[11px] text-[#b0a8a4] uppercase w-16 select-none">2. Treat</span>
                  <div className="flex-1 min-w-0 border border-[#b0a8a4]/20 p-2.5 rounded flex items-center justify-between">
                    <span className="font-sans text-[12px] text-[#282828] truncate">{serum.name}</span>
                    <button onClick={() => onNavigate('PDP', serum.id)} className="text-[#248179] text-[11px] font-sans uppercase">Verify</button>
                  </div>
                </div>

                {/* Hydrate */}
                <div className="flex gap-3 items-center">
                  <span className="font-sans text-[11px] text-[#b0a8a4] uppercase w-16 select-none">3. Hydrate</span>
                  <div className="flex-1 min-w-0 border border-[#b0a8a4]/20 p-2.5 rounded flex items-center justify-between">
                    <span className="font-sans text-[12px] text-[#282828] truncate">{cream.name}</span>
                    <button onClick={() => onNavigate('PDP', cream.id)} className="text-[#248179] text-[11px] font-sans uppercase">Verify</button>
                  </div>
                </div>

                {/* Protect */}
                <div className="flex gap-3 items-center">
                  <span className="font-sans text-[11px] text-[#b0a8a4] uppercase w-16 select-none">4. Protect</span>
                  <div className="flex-1 min-w-0 border border-[#b0a8a4]/20 p-2.5 rounded flex items-center justify-between">
                    <span className="font-sans text-[12px] text-[#282828] truncate">{sunscreen.name}</span>
                    <button onClick={() => onNavigate('PDP', sunscreen.id)} className="text-[#248179] text-[11px] font-sans uppercase">Verify</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Night Routine Section */}
            <div className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <h4 className="font-display text-[16px] text-[#248179] border-b border-[#b0a8a4]/10 pb-1.5 select-none">🌙 Night Routine</h4>
              
              <div className="space-y-4">
                {/* Cleanse */}
                <div className="flex gap-3 items-center">
                  <span className="font-sans text-[11px] text-[#b0a8a4] uppercase w-16 select-none">1. Cleanse</span>
                  <div className="flex-1 min-w-0 border border-[#b0a8a4]/20 p-2.5 rounded flex items-center justify-between">
                    <span className="font-sans text-[12px] text-[#282828] truncate">{sensitivity ? safeCleanser.name : 'Standard Wash'}</span>
                    <button onClick={() => onNavigate('PDP', sensitivity ? safeCleanser.id : '4')} className="text-[#248179] text-[11px] font-sans uppercase">Verify</button>
                  </div>
                </div>

                {/* Hydrate */}
                <div className="flex gap-3 items-center">
                  <span className="font-sans text-[11px] text-[#b0a8a4] uppercase w-16 select-none">2. Hydrate</span>
                  <div className="flex-1 min-w-0 border border-[#b0a8a4]/20 p-2.5 rounded flex items-center justify-between">
                    <span className="font-sans text-[12px] text-[#282828] truncate">{cream.name}</span>
                    <button onClick={() => onNavigate('PDP', cream.id)} className="text-[#248179] text-[11px] font-sans uppercase">Verify</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggest barrier support alternate */}
            {warnings.length > 0 && (
              <div className="bg-[#248179]/5 border border-[#248179]/20 rounded p-4 flex flex-col gap-2.5 select-none">
                <span className="font-display text-[14px] text-[#248179]">Safer Alternative Recommendations</span>
                <p className="font-sans text-[12px] text-[#b0a8a4] leading-[17px]">
                  Consider switching to Certified baby-safe hydrators to support your skin barrier recovery.
                </p>
                <button 
                  onClick={() => onNavigate('PDP', '6')}
                  className="bg-[#248179] text-white text-[11px] font-sans uppercase tracking-wider py-2 rounded"
                >
                  View Baby Pure Hydrator
                </button>
              </div>
            )}
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
          className="flex flex-col items-center justify-center flex-1 text-[#248179] gap-0.5"
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
