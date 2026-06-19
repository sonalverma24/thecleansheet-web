'use client';

import React from 'react';
import { mockProducts, Product } from '@/data/mockProducts';

interface MobileCompareProps {
  compareList: string[];
  onNavigate: (screen: any, productId?: string) => void;
  onToggleCompare: (id: string) => void;
}

export function MobileCompare({ compareList, onNavigate, onToggleCompare }: MobileCompareProps) {
  const products = mockProducts.filter(p => compareList.includes(p.id));

  // Determine top recommendation labels
  const getRecommendationLabel = (p: Product, index: number) => {
    if (p.scores.total >= 96 && p.price_per_ml < 10) return "Best Value Mild Option";
    if (p.scores.total === 98) return "Best Overall Pick";
    if (p.pills.includes("Hypoallergenic")) return "Best for Sensitive Skin";
    if (p.scores.total < 60) return "Use with Caution";
    return "";
  };

  return (
    <div className="flex flex-col h-full bg-[#fcf9f8] text-[#282828]">
      {/* Header bar */}
      <header className="bg-white px-4 py-4 border-b border-[#b0a8a4]/20 flex justify-between items-center sticky top-0 z-20 select-none">
        <button onClick={() => onNavigate('SHOP')} className="text-[#248179] flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-sans text-[12px] uppercase tracking-wider">Back</span>
        </button>
        <span className="font-display text-[15px] tracking-tight text-[#248179] uppercase">Product Comparison</span>
        <div className="w-8" />
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-24 space-y-6">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3 select-none">
            <span className="material-symbols-outlined text-[48px] text-[#b0a8a4]/40">compare_arrows</span>
            <div className="font-display text-lg text-[#b0a8a4]">Compare list is empty</div>
            <p className="font-sans text-[12px] text-[#b0a8a4] max-w-xs leading-relaxed">
              Go to Shop Safe and click "Compare" on up to 4 products to compare them side-by-side.
            </p>
            <button 
              onClick={() => onNavigate('SHOP')}
              className="mt-2 bg-[#248179] text-white px-6 py-2.5 rounded-full font-sans text-[12px] uppercase tracking-widest"
            >
              Go to Shop
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="font-sans text-[10px] text-[#b0a8a4] tracking-widest uppercase select-none">
              Comparing {products.length} of 4 Products
            </div>

            {/* Horizontal Scroll comparison matrix */}
            <div className="overflow-x-auto border border-[#b0a8a4]/30 rounded bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <table className="w-full min-w-[500px] border-collapse text-left text-[12px] font-sans">
                <thead>
                  <tr className="border-b border-[#b0a8a4]/25 bg-[#f9f8f7]">
                    <th className="p-3 w-1/4 font-sans text-[#b0a8a4] uppercase text-[10px] tracking-wider">Metric</th>
                    {products.map(p => (
                      <th key={p.id} className="p-3 w-1/4 border-l border-[#b0a8a4]/15">
                        <div className="flex justify-between items-start">
                          <span className="font-sans text-[9px] text-[#b0a8a4] uppercase tracking-widest block">{p.brand}</span>
                          <button 
                            onClick={() => onToggleCompare(p.id)}
                            className="text-[#fd6158] hover:text-[#fd6158]/80"
                          >
                            <span className="material-symbols-outlined text-[15px]">close</span>
                          </button>
                        </div>
                        <h4 
                          onClick={() => onNavigate('PDP', p.id)}
                          className="font-display text-[13px] text-[#282828] line-clamp-1 mt-0.5 cursor-pointer hover:underline"
                        >
                          {p.name}
                        </h4>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#b0a8a4]/15">
                  {/* Image & Score */}
                  <tr>
                    <td className="p-3 font-sans text-[#b0a8a4] uppercase text-[9px] tracking-wider">TCS Score</td>
                    {products.map(p => {
                      const recLabel = getRecommendationLabel(p, 0);
                      return (
                        <td key={p.id} className="p-3 border-l border-[#b0a8a4]/15 text-center">
                          <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover mx-auto rounded border border-[#b0a8a4]/10 mb-2" />
                          <span className={`inline-block font-sans text-[14px] text-white px-3 py-0.5 rounded-full ${
                            p.scores.total >= 90 ? 'bg-[#248179]' : p.scores.total >= 75 ? 'bg-[#248179]/80' : p.scores.total >= 60 ? 'bg-[#d2ff34] text-[#282828]' : 'bg-[#fd6158]'
                          }`}>
                            {p.scores.total}
                          </span>
                          {recLabel && (
                            <span className="block mt-2 text-[9px] text-[#248179] uppercase font-sans font-bold tracking-tight bg-[#248179]/5 py-0.5 rounded">
                              {recLabel}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Price per ml */}
                  <tr>
                    <td className="p-3 font-sans text-[#b0a8a4] uppercase text-[9px] tracking-wider">Price / ml</td>
                    {products.map(p => (
                      <td key={p.id} className="p-3 border-l border-[#b0a8a4]/15">
                        ₹{p.price_per_ml}/ml
                        <div className="text-[10px] text-[#b0a8a4]">MRP: ₹{p.mrp} ({p.size})</div>
                      </td>
                    ))}
                  </tr>

                  {/* Best for */}
                  <tr>
                    <td className="p-3 font-sans text-[#b0a8a4] uppercase text-[9px] tracking-wider">Best For</td>
                    {products.map(p => (
                      <td key={p.id} className="p-3 border-l border-[#b0a8a4]/15 leading-relaxed text-[11px] text-[#b0a8a4]">
                        <ul className="list-disc pl-3.5 space-y-1">
                          {p.best_for.slice(0, 2).map((bf, idx) => <li key={idx}>{bf}</li>)}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Avoid if */}
                  <tr>
                    <td className="p-3 font-sans text-[#b0a8a4] uppercase text-[9px] tracking-wider">Avoid If</td>
                    {products.map(p => (
                      <td key={p.id} className="p-3 border-l border-[#b0a8a4]/15 leading-relaxed text-[11px] text-[#b0a8a4]">
                        <ul className="list-disc pl-3.5 space-y-1">
                          {p.avoid_if.slice(0, 2).map((av, idx) => <li key={idx} className="text-[#fd6158]/85">{av}</li>)}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Top concern */}
                  <tr>
                    <td className="p-3 font-sans text-[#b0a8a4] uppercase text-[9px] tracking-wider">Top Flag</td>
                    {products.map(p => {
                      const concerns = p.ingredients_breakdown.filter(i => i.concern === 'high' || i.concern === 'restricted');
                      return (
                        <td key={p.id} className="p-3 border-l border-[#b0a8a4]/15 font-sans">
                          {concerns.length > 0 ? (
                            <span className="text-[#fd6158]">
                              {concerns[0].name} ({concerns[0].concern})
                            </span>
                          ) : (
                            <span className="text-[#248179]">None (Clean Profile)</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Claims audit */}
                  <tr>
                    <td className="p-3 font-sans text-[#b0a8a4] uppercase text-[9px] tracking-wider">Claims status</td>
                    {products.map(p => (
                      <td key={p.id} className="p-3 border-l border-[#b0a8a4]/15 text-[11px]">
                        <div className="font-sans font-bold">{p.claims_audit[0]?.claim}</div>
                        <div className={`text-[10px] ${
                          p.claims_audit[0]?.status === 'Supported by available data' ? 'text-[#248179]' : 'text-[#fd6158]'
                        }`}>
                          {p.claims_audit[0]?.status}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Action link */}
                  <tr>
                    <td className="p-3 font-sans text-[#b0a8a4] uppercase text-[9px] tracking-wider">Buy Link</td>
                    {products.map(p => (
                      <td key={p.id} className="p-3 border-l border-[#b0a8a4]/15 text-center">
                        <button 
                          onClick={() => onNavigate('PDP', p.id)}
                          className="bg-[#248179] text-white text-[10px] tracking-wider uppercase px-4 py-2 rounded-full w-full max-w-[100px] hover:bg-[#248179]/90"
                        >
                          View App
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
