'use client';

import React, { useState } from 'react';
import { mockProducts, Product } from '@/data/mockProducts';

interface MobileAdminProps {
  onNavigate: (screen: any, productId?: string) => void;
}

export function MobileAdmin({ onNavigate }: MobileAdminProps) {
  const [activeSubTab, setActiveSubTab] = useState<'manual' | 'bulk' | 'reviews'>('manual');
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Serums');
  const [mrp, setMrp] = useState('');
  const [size, setSize] = useState('30ml');
  const [ingredients, setIngredients] = useState('');
  const [claims, setClaims] = useState('');
  const [status, setStatus] = useState<any>('Public Data Review');
  const [csvText, setCsvText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !name || !ingredients) {
      setError('Missing required fields: Brand, Name, and Ingredient List.');
      return;
    }

    // Run scoring calculation simulation
    const ingCount = ingredients.split(',').length;
    let score = 90; // Default base
    if (ingredients.toLowerCase().includes('oxybenzone')) score -= 30;
    if (ingredients.toLowerCase().includes('laureth sulfate')) score -= 20;
    if (ingredients.toLowerCase().includes('dmdm')) score -= 25;
    if (ingredients.toLowerCase().includes('fragrance') && category === 'Baby Care') score -= 15;
    score = Math.max(10, Math.min(100, score));

    // Construct new product
    const newProduct: Product = {
      id: String(mockProducts.length + 101),
      brand,
      name,
      slug: `${brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      category,
      size,
      mrp: Number(mrp) || 500,
      price_min: Number(mrp) * 0.9 || 450,
      price_max: Number(mrp) || 500,
      price_per_ml: Math.round(((Number(mrp) || 500) / (Number(size.replace(/[^\d]/g, '')) || 30)) * 10) / 10,
      imageUrl: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400&q=80",
      ingredient_list: ingredients,
      claims: claims.split(',').map(c => c.trim()),
      status,
      analysis_confidence: "High",
      scores: {
        total: score,
        safety: Math.round(score * 0.5),
        formulation: Math.round(score * 0.2),
        claims: Math.round(score * 0.2),
        ethics: Math.round(score * 0.1)
      },
      verdict: "Newly created user manual analysis scorecard draft. Awaiting final publisher validation.",
      best_for: ["Sensitive skin barriers"],
      avoid_if: ["Clogged skin pores"],
      expert_summary: "Manual admin scorecard generated securely. Formulation contains clean humectant components.",
      ingredients_breakdown: [
        { name: "Aqua", function: "Solvent", concern: "low", why: "Vehicle", matters: "Safe carrier" }
      ],
      claims_audit: [
        { claim: "Dermatologist Tested", status: "Plausible but not verified", reason: "Standard clinical documentation review is pending.", evidence_needed: "RIPT Report" }
      ],
      retailer_links: [
        { retailer: "Amazon", url: "https://amazon.com" }
      ],
      pills: ["User Submitted", "Awaiting Evidence"]
    };

    // Add to shared products catalog
    mockProducts.push(newProduct);

    setMessage(`Product "${name}" added successfully with simulated score: ${score}!`);
    setError('');
    
    // Clear form
    setBrand('');
    setName('');
    setMrp('');
    setIngredients('');
    setClaims('');
  };

  const handleBulkCsvIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      setError('Please paste CSV content.');
      return;
    }

    try {
      const rows = csvText.split('\n').filter(r => r.trim() !== '');
      if (rows.length < 2) {
        setError('CSV must contain a header row and at least one data row.');
        return;
      }

      // Quick parser
      const headers = rows[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      const dataRows = rows.slice(1);

      let count = 0;
      dataRows.forEach((row, index) => {
        const cols = row.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length === headers.length) {
          const rowData: any = {};
          headers.forEach((h, i) => {
            rowData[h] = cols[i];
          });

          // Create new product
          const newProduct: Product = {
            id: String(mockProducts.length + 201 + index),
            brand: rowData.brand_name || 'Brand',
            name: rowData.product_name || 'Product',
            slug: `${(rowData.brand_name || 'brand').toLowerCase()}-${(rowData.product_name || 'product').toLowerCase().replace(/\s+/g, '-')}`,
            category: rowData.category || 'Serums',
            size: rowData.size || '30ml',
            mrp: Number(rowData.mrp) || 500,
            price_min: Number(rowData.price_min) || 450,
            price_max: Number(rowData.price_max) || 500,
            price_per_ml: Number(rowData.price_per_ml) || 15.0,
            imageUrl: rowData.product_image_url || "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400&q=80",
            ingredient_list: rowData.ingredient_list || 'Aqua',
            claims: rowData.claims ? rowData.claims.split(';') : [],
            status: rowData.status || 'Public Data Review',
            analysis_confidence: rowData.analysis_confidence || 'High',
            scores: {
              total: 85,
              safety: 42,
              formulation: 17,
              claims: 18,
              ethics: 8
            },
            verdict: "Bulk ingested product analysis. Scorecard generated.",
            best_for: ["Dehydrated skin"],
            avoid_if: ["Pregnancy caution"],
            expert_summary: "Bulk ingested formulation.",
            ingredients_breakdown: [{ name: "Aqua", function: "Solvent", concern: "low", why: "Vehicle", matters: "Safe carrier" }],
            claims_audit: [{ claim: "Hypoallergenic", status: "Supported by available data", reason: "Standard tests", evidence_needed: "RIPT report" }],
            retailer_links: [{ retailer: "Amazon", url: rowData.amazon_url || "https://amazon.com" }],
            pills: ["Bulk Uploaded"]
          };

          mockProducts.push(newProduct);
          count++;
        }
      });

      setMessage(`Successfully bulk-ingested ${count} products into the catalog database!`);
      setError('');
      setCsvText('');
    } catch (err: any) {
      setError(`Failed to parse CSV: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fcf9f8] text-[#282828] select-none">
      {/* Header bar */}
      <header className="bg-white px-4 py-4 border-b border-[#b0a8a4]/20 flex justify-between items-center sticky top-0 z-20">
        <button onClick={() => onNavigate('HOME')} className="text-[#248179] flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-sans text-[12px] uppercase tracking-wider">Home</span>
        </button>
        <span className="font-display text-[15px] tracking-tight text-[#248179] uppercase">Admin Dashboard</span>
        <div className="w-8" />
      </header>

      {/* Admin sub-navigation tabs */}
      <div className="bg-[#f9f8f7] border-b border-[#b0a8a4]/15 p-2 flex text-[11px] font-sans">
        <button 
          onClick={() => { setActiveSubTab('manual'); setMessage(''); setError(''); }}
          className={`flex-1 py-1.5 rounded text-center transition-colors uppercase tracking-wider ${
            activeSubTab === 'manual' ? 'bg-[#282828] text-white' : 'text-[#b0a8a4]'
          }`}
        >
          Add Product
        </button>
        <button 
          onClick={() => { setActiveSubTab('bulk'); setMessage(''); setError(''); }}
          className={`flex-1 py-1.5 rounded text-center transition-colors uppercase tracking-wider ${
            activeSubTab === 'bulk' ? 'bg-[#282828] text-white' : 'text-[#b0a8a4]'
          }`}
        >
          CSV Ingest
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-24 space-y-6">
        
        {message && (
          <div className="text-[12px] text-[#248179] bg-[#248179]/5 border border-[#248179]/20 rounded p-3 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="text-[12px] text-[#fd6158] bg-[#fd6158]/5 border border-[#fd6158]/20 rounded p-3 text-center">
            {error}
          </div>
        )}

        {/* Manual Product entry form */}
        {activeSubTab === 'manual' && (
          <form onSubmit={handleAddProduct} className="bg-white border border-[#b0a8a4]/30 rounded p-4 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-[12px]">
            <h4 className="font-display text-[15px] text-[#248179] border-b border-[#b0a8a4]/10 pb-1">Manual Product Ingestion</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">Brand Name*</label>
                <input 
                  type="text" 
                  value={brand} 
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Minimalist"
                  className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-2 focus:outline-none focus:border-[#248179]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">Product Name*</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Niacinamide 10%"
                  className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-2 focus:outline-none focus:border-[#248179]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-2 focus:outline-none"
                >
                  <option value="Serums">Serums</option>
                  <option value="Moisturisers">Moisturisers</option>
                  <option value="Sunscreens">Sunscreens</option>
                  <option value="Face Wash">Face Wash</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">Size</label>
                <input 
                  type="text" 
                  value={size} 
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="30ml"
                  className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-2 focus:outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">MRP*</label>
                <input 
                  type="number" 
                  value={mrp} 
                  onChange={(e) => setMrp(e.target.value)}
                  placeholder="599"
                  className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-2 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">INCI Ingredients list*</label>
              <textarea 
                value={ingredients} 
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Aqua, Niacinamide, Glycerin, Phenoxyethanol..."
                className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-2 focus:outline-none h-16 focus:border-[#248179]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">Product Claims (comma separated)</label>
              <input 
                type="text" 
                value={claims} 
                onChange={(e) => setClaims(e.target.value)}
                placeholder="Fragrance Free, Pregnancy Safe, Hypoallergenic"
                className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-2 focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">Marketplace Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-2 focus:outline-none"
              >
                <option value="Public Data Review">Public Data Review</option>
                <option value="Verified Scorecard">Verified Scorecard</option>
                <option value="Certified Product">Certified Product</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[#248179] text-white font-sans text-[11px] tracking-widest uppercase py-3.5 rounded-full hover:bg-[#248179]/90 transition-colors shadow-[0_8px_16px_rgba(0,103,96,0.08)]"
            >
              Analyze & Publish PDP
            </button>
          </form>
        )}

        {/* CSV Ingestion Form */}
        {activeSubTab === 'bulk' && (
          <form onSubmit={handleBulkCsvIngest} className="bg-white border border-[#b0a8a4]/30 rounded p-4 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-[12px]">
            <h4 className="font-display text-[15px] text-[#248179] border-b border-[#b0a8a4]/10 pb-1">Bulk Ingestion via CSV</h4>
            
            <p className="font-sans text-[11px] leading-relaxed text-[#b0a8a4]">
              Paste product database records. Columns: `brand_name, product_name, category, size, mrp, price_per_ml, ingredient_list, claims, status`.
            </p>

            {/* Quick Helper Button to paste template */}
            <button
              type="button"
              onClick={() => setCsvText(
                `brand_name,product_name,category,size,mrp,price_per_ml,ingredient_list,claims,status\n"PureSkin","B5 Soothing Serum","Serums","30ml",650,21.6,"Aqua, Panthenol, Glycerin, Phenoxyethanol","Fragrance Free; Barrier Support","Public Data Review"`
              )}
              className="text-[#248179] border border-[#248179]/30 px-3 py-1 rounded font-sans text-[11px] hover:bg-[#248179]/5 uppercase tracking-wider"
            >
              Insert CSV Sample Template
            </button>

            <div className="flex flex-col">
              <label className="text-[10px] text-[#b0a8a4] uppercase mb-1">CSV Content</label>
              <textarea 
                value={csvText} 
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="brand_name,product_name,category,..."
                className="bg-[#f9f8f7] border border-[#b0a8a4]/30 rounded p-2 focus:outline-none h-32 focus:border-[#248179] font-mono text-[10.5px]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#248179] text-white font-sans text-[11px] tracking-widest uppercase py-3.5 rounded-full hover:bg-[#248179]/90 transition-colors shadow-[0_8px_16px_rgba(0,103,96,0.08)]"
            >
              Execute Ingestion Database Import
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
