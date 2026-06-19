'use client';

import React, { useState, useEffect } from 'react';
import { Product, mockProducts } from '@/data/mockProducts';

interface MobileAnalyserProps {
  onNavigate: (screen: any, productId?: string) => void;
}

interface Preset {
  id: string;
  title: string;
  score: number;
  category: string;
  purpose: string;
  expected: string;
  mockProductId: string;
  isCaution: boolean;
}

const presets: Preset[] = [
  {
    id: "baby",
    title: "Authentic Mild Baby Hydrator",
    score: 96,
    category: "Moisturisers",
    purpose: "Previews an excellent, baby safe squalane and lipid composition.",
    expected: "Excellent profile. Low irritation risk. Strong barrier support. Baby safety logic triggered.",
    mockProductId: "6",
    isCaution: false
  },
  {
    id: "vitc",
    title: "Questionable '15% Vitamin C' Serum",
    score: 58,
    category: "Serums",
    purpose: "Demonstrates the Phenoxyethanol Rule.",
    expected: "Flag active ingredients positioned after the preservative threshold (Phenoxyethanol max 1%) as likely below meaningful concentration. Deceptive active claim.",
    mockProductId: "5",
    isCaution: true
  },
  {
    id: "wash",
    title: "Stripping 'Gentle' Charcoal Wash",
    score: 42,
    category: "Face Wash",
    purpose: "Triggers severe safety and claim mismatch flags.",
    expected: "Flag Sodium Laureth Sulfate (SLS) and DMDM Hydantoin (formaldehyde releaser). Contradiction with 'gentle' claim.",
    mockProductId: "4",
    isCaution: true
  },
  {
    id: "spf",
    title: "Standard SPF 50 Chemical Sunscreen",
    score: 54,
    category: "Sunscreens",
    purpose: "Explains systemic absorption concerns and reef threat linked to Oxybenzone.",
    expected: "Trigger sunscreen module. Flag Oxybenzone. Flag reef related concern carefully.",
    mockProductId: "3",
    isCaution: true
  }
];

const analysisSteps = [
  "Reading product data...",
  "Extracting ingredient list...",
  "Matching INCI names...",
  "Checking regulatory flags...",
  "Applying product category logic...",
  "Reviewing claims...",
  "Calculating Clean Sheet Score...",
  "Creating consumer summary..."
];

export function MobileAnalyser({ onNavigate }: MobileAnalyserProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'text' | 'image'>('preset');
  const [inputText, setInputText] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<Product | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalysing) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < analysisSteps.length - 1) {
            return prev + 1;
          } else {
            setIsAnalysing(false);
            return 0;
          }
        });
      }, 450); // Speed up transition through steps
    }
    return () => clearInterval(interval);
  }, [isAnalysing]);

  const handleRunPreset = (preset: Preset) => {
    setIsAnalysing(true);
    setCurrentStepIndex(0);
    const prod = mockProducts.find(p => p.id === preset.mockProductId) || mockProducts[0];
    
    // Once analysis is done, we set the result
    setTimeout(() => {
      setAnalysisResult(prod);
    }, 450 * analysisSteps.length);
  };

  const handleRunTextAnalysis = () => {
    if (!inputText.trim()) return;
    setIsAnalysing(true);
    setCurrentStepIndex(0);
    
    // Choose a random product from catalog to represent the scanned result
    const prod = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    
    setTimeout(() => {
      setAnalysisResult(prod);
    }, 450 * analysisSteps.length);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsAnalysing(true);
      setCurrentStepIndex(0);
      const prod = mockProducts[0]; // Aura hydration
      setTimeout(() => {
        setAnalysisResult(prod);
      }, 450 * analysisSteps.length);
    }
  };

  const handleDismissResult = () => {
    setAnalysisResult(null);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-[#fcf9f8] text-[#282828]">
      {/* Header bar */}
      <header className="bg-white px-4 py-4 border-b border-[#b0a8a4]/20 flex justify-between items-center sticky top-0 z-20 select-none">
        <button onClick={() => onNavigate('HOME')} className="text-[#248179] flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-sans text-[12px] uppercase tracking-wider">Back</span>
        </button>
        <span className="font-display text-[15px] tracking-tight text-[#248179] uppercase">Product Analyser</span>
        <div className="w-8" />
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-24 space-y-6">
        
        {/* Loading overlay when scanning */}
        {isAnalysing && (
          <div className="absolute inset-0 bg-white/95 z-40 flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="w-16 h-16 rounded-full border-2 border-t-[#248179] border-r-transparent border-b-[#248179] border-l-transparent animate-spin mb-8" />
            <div className="space-y-2 max-w-xs">
              <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase block">Analysing Formulation</span>
              <h4 className="font-display text-xl text-[#248179]">{analysisSteps[currentStepIndex]}</h4>
              <p className="font-sans text-[12px] text-[#b0a8a4]">Running proprietary rules engine securely on the server...</p>
            </div>
          </div>
        )}

        {/* Results view if analysis completed */}
        {analysisResult && (
          <div className="bg-white border border-[#b0a8a4]/30 rounded p-5 space-y-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start border-b border-[#b0a8a4]/15 pb-4">
              <div>
                <span className="font-sans text-[9px] text-[#b0a8a4] uppercase tracking-widest block">{analysisResult.brand}</span>
                <h4 className="font-display text-[18px] leading-[22px] text-[#282828] mt-1">{analysisResult.name}</h4>
                <span className="inline-block mt-2 font-sans text-[10px] bg-[#f9f8f7] border border-[#b0a8a4]/20 px-2 py-0.5 rounded-full text-[#b0a8a4] uppercase tracking-widest">
                  {analysisResult.category}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-12 h-12 rounded-full bg-[#248179] text-white flex items-center justify-center font-display text-[16px]">
                  {analysisResult.scores.total}
                </span>
                <span className="font-sans text-[8px] text-[#b0a8a4] uppercase tracking-wider mt-1">Score</span>
              </div>
            </div>

            {/* Verdict */}
            <div className="space-y-1.5">
              <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase block">Analysis Verdict</span>
              <p className="font-sans text-[13px] leading-[19px] text-[#282828]">{analysisResult.verdict}</p>
            </div>

            {/* Pillar breakdowns */}
            <div className="space-y-2.5">
              <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase block">Pillar Breakdown</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                <div className="bg-[#f9f8f7] p-2.5 border border-[#b0a8a4]/15 rounded flex justify-between items-center">
                  <span>Safety & Toxicity</span>
                  <span className="text-[#248179]">{analysisResult.scores.safety}/50</span>
                </div>
                <div className="bg-[#f9f8f7] p-2.5 border border-[#b0a8a4]/15 rounded flex justify-between items-center">
                  <span>Formulation</span>
                  <span className="text-[#248179]">{analysisResult.scores.formulation}/20</span>
                </div>
                <div className="bg-[#f9f8f7] p-2.5 border border-[#b0a8a4]/15 rounded flex justify-between items-center">
                  <span>Claims Audit</span>
                  <span className="text-[#248179]">{analysisResult.scores.claims}/20</span>
                </div>
                <div className="bg-[#f9f8f7] p-2.5 border border-[#b0a8a4]/15 rounded flex justify-between items-center">
                  <span>Ethics & Eco</span>
                  <span className="text-[#248179]">{analysisResult.scores.ethics}/10</span>
                </div>
              </div>
            </div>

            {/* Key flags list */}
            {analysisResult.ingredients_breakdown.some(i => i.concern === 'high' || i.concern === 'restricted') && (
              <div className="space-y-2">
                <span className="font-sans text-[10px] tracking-widest text-[#fd6158] uppercase block">Safety Warnings</span>
                <div className="bg-[#fd6158]/5 border border-[#fd6158]/20 rounded p-3 space-y-2 text-[12px] font-sans">
                  {analysisResult.ingredients_breakdown
                    .filter(i => i.concern === 'high' || i.concern === 'restricted')
                    .map((i, idx) => (
                      <div key={idx} className="flex justify-between items-baseline">
                        <span className="text-[#282828] font-bold">{i.name}</span>
                        <span className="text-[#fd6158] text-[9px] uppercase tracking-wider">{i.concern} risk</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-[#b0a8a4]/15">
              <button 
                onClick={handleDismissResult}
                className="flex-1 border border-[#b0a8a4] text-[#b0a8a4] font-sans text-[11px] tracking-wider uppercase py-3 rounded-full hover:bg-[#f9f8f7] transition-all"
              >
                Dismiss
              </button>
              <button 
                onClick={() => {
                  const id = analysisResult.id;
                  handleDismissResult();
                  onNavigate('PDP', id);
                }}
                className="flex-1 bg-[#248179] text-white font-sans text-[11px] tracking-wider uppercase py-3 rounded-full hover:bg-[#248179]/90 transition-all text-center"
              >
                Full Scorecard
              </button>
            </div>

            {/* Disclaimer */}
            <div className="font-sans text-[9px] leading-[13px] text-[#b0a8a4] text-center italic mt-2">
              This analysis is based on ingredient lists, product claims, and publicly available information. It is not medical advice and it is not official Clean Sheet certification.
            </div>
          </div>
        )}

        {!analysisResult && (
          <>
            {/* Nav Tabs */}
            <div className="bg-white border border-[#b0a8a4]/30 rounded-lg p-1.5 flex select-none">
              <button
                onClick={() => setActiveTab('preset')}
                className={`flex-1 font-sans text-[11px] tracking-wider uppercase py-2.5 rounded transition-colors ${
                  activeTab === 'preset' ? 'bg-[#248179] text-white' : 'text-[#b0a8a4] hover:text-[#282828]'
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 font-sans text-[11px] tracking-wider uppercase py-2.5 rounded transition-colors ${
                  activeTab === 'text' ? 'bg-[#248179] text-white' : 'text-[#b0a8a4] hover:text-[#282828]'
                }`}
              >
                Text INCI
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex-1 font-sans text-[11px] tracking-wider uppercase py-2.5 rounded transition-colors ${
                  activeTab === 'image' ? 'bg-[#248179] text-white' : 'text-[#b0a8a4] hover:text-[#282828]'
                }`}
              >
                Label OCR
              </button>
            </div>

            {/* Presets Panel */}
            {activeTab === 'preset' && (
              <div className="space-y-4">
                <div className="select-none">
                  <h4 className="font-display text-[16px] text-[#248179] mb-1">Test the analyser logic</h4>
                  <p className="font-sans text-[12px] text-[#b0a8a4]">
                    Use preloaded examples to see how The Clean Sheet evaluates different formulations.
                  </p>
                </div>

                <div className="space-y-4">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="bg-white border border-[#b0a8a4]/35 rounded p-4 relative flex flex-col justify-between min-h-[170px]"
                    >
                      {/* Top Row: Title & Score */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          {/* Marker type */}
                          <div className="flex">
                            <span className={`px-2 py-0.5 text-[9px] tracking-wider uppercase ${
                              preset.isCaution 
                                ? 'bg-[#fd6158]/10 text-[#fd6158]' 
                                : 'bg-[#d2ff34] text-[#282828]'
                            }`}>
                              {preset.isCaution ? 'Caution case' : 'Educational preset'}
                            </span>
                          </div>
                          <h4 className="font-display text-[15px] text-[#282828] leading-[19px] pr-12">{preset.title}</h4>
                        </div>
                        <span className={`absolute top-4 right-4 text-[11px] w-7 h-7 rounded-full flex items-center justify-center font-sans text-white ${
                          preset.score >= 90 ? 'bg-[#248179]' : preset.score >= 75 ? 'bg-[#248179]/80' : 'bg-[#fd6158]'
                        }`}>
                          {preset.score}
                        </span>
                      </div>

                      {/* Info & CTA */}
                      <div className="mt-4 space-y-3">
                        <p className="font-sans text-[12px] text-[#b0a8a4] leading-[17px]">{preset.purpose}</p>
                        <div className="bg-[#f9f8f7] border border-[#b0a8a4]/15 rounded p-2.5 text-[11px] font-sans leading-[16px]">
                          <span className="text-[#b0a8a4] uppercase text-[9px] block mb-0.5 tracking-wider">Expected outcome</span>
                          {preset.expected}
                        </div>
                        
                        <button
                          onClick={() => handleRunPreset(preset)}
                          className="w-full bg-[#282828] text-white font-sans text-[11px] tracking-widest uppercase py-2 rounded"
                        >
                          Run Analysis Simulation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text Input Panel */}
            {activeTab === 'text' && (
              <div className="bg-white border border-[#b0a8a4]/30 rounded p-4 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <div className="flex flex-col">
                  <label className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase mb-1">Paste Ingredient List</label>
                  <textarea
                    rows={6}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Aqua, Niacinamide, Glycerin, Phenoxyethanol..."
                    className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-2 text-[13px] font-sans focus:ring-0 focus:outline-none focus:border-[#248179] h-32"
                  />
                </div>
                <button
                  onClick={handleRunTextAnalysis}
                  disabled={!inputText.trim()}
                  className="w-full bg-[#248179] text-white font-sans text-[12px] tracking-[0.08em] uppercase py-3 rounded-full disabled:opacity-40 transition-opacity"
                >
                  Analyse Ingredients
                </button>
              </div>
            )}

            {/* Image OCR Panel */}
            {activeTab === 'image' && (
              <div className="bg-white border border-[#b0a8a4]/30 rounded p-6 text-center space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <span className="material-symbols-outlined text-[48px] text-[#b0a8a4]/50">photo_camera</span>
                <div className="space-y-1 select-none">
                  <h4 className="font-display text-[15px] text-[#282828]">Upload Label Photo</h4>
                  <p className="font-sans text-[12px] text-[#b0a8a4] max-w-[220px] mx-auto leading-relaxed">
                    Take a photo of the product ingredient list. OCR will extract text instantly.
                  </p>
                </div>
                
                <div className="relative inline-block w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="w-full block bg-[#248179] text-white font-sans text-[12px] tracking-[0.08em] uppercase py-3 rounded-full hover:bg-[#248179]/90 transition-colors">
                    Choose Photo
                  </span>
                </div>
              </div>
            )}
          </>
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
          className="flex flex-col items-center justify-center flex-1 text-[#248179] gap-0.5"
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
