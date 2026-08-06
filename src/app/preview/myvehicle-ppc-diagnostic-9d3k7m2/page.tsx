'use client';

import React, { useState } from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ComposedChart, Area, Bar,
} from 'recharts';
import {
  TrendingDown, TrendingUp, AlertTriangle, UploadCloud, BarChart2,
  Target, Activity, DollarSign, MousePointer, Filter, AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ────────────────────────────────────────────────────────────────
   CLIENT SAMPLE PREVIEW · MyVehicle.ie PPC Diagnostic Dashboard

   Hidden, unlisted preview shared privately with a client. This route
   is noindex (see layout.tsx) and is not linked from the site or the
   sitemap. All figures below are illustrative mock data.
──────────────────────────────────────────────────────────────── */

type TrendPoint = {
  month: string;
  cost: number;
  conversions: number;
  clicks: number;
  impressions: number;
  imprShare: number;
  cpc: number;
  cvr: number;
  ctr: number;
};

type KeywordDrop = {
  keyword: string;
  matchType: 'Exact' | 'Phrase' | 'Broad';
  q1Convs: number;
  q2Convs: number;
  diff: number;
  q1Cvr: string;
  q2Cvr: string;
  reason: string;
};

type Insight = {
  type: 'critical' | 'warning' | 'info';
  title: string;
  desc: string;
};

// Simulated data representing the 6-month bleed scenario for Myvehicle.ie
const mockTrendData: TrendPoint[] = [
  { month: 'Jan 2026', cost: 12500, conversions: 850, clicks: 8500, impressions: 120000, imprShare: 82, cpc: 1.47, cvr: 10.0, ctr: 7.08 },
  { month: 'Feb 2026', cost: 12800, conversions: 820, clicks: 8600, impressions: 125000, imprShare: 79, cpc: 1.49, cvr: 9.53, ctr: 6.88 },
  { month: 'Mar 2026', cost: 13100, conversions: 780, clicks: 8400, impressions: 130000, imprShare: 75, cpc: 1.56, cvr: 9.28, ctr: 6.46 },
  { month: 'Apr 2026', cost: 12900, conversions: 650, clicks: 8000, impressions: 145000, imprShare: 68, cpc: 1.61, cvr: 8.12, ctr: 5.51 },
  { month: 'May 2026', cost: 13500, conversions: 580, clicks: 7800, impressions: 155000, imprShare: 62, cpc: 1.73, cvr: 7.43, ctr: 5.03 },
  { month: 'Jun 2026', cost: 13200, conversions: 490, clicks: 7500, impressions: 165000, imprShare: 55, cpc: 1.76, cvr: 6.53, ctr: 4.54 },
  { month: 'Jul 2026', cost: 13800, conversions: 410, clicks: 7200, impressions: 180000, imprShare: 48, cpc: 1.91, cvr: 5.69, ctr: 4.00 },
];

const mockKeywordDropData: KeywordDrop[] = [
  { keyword: 'car history check', matchType: 'Exact', q1Convs: 450, q2Convs: 210, diff: -240, q1Cvr: '12.5%', q2Cvr: '6.2%', reason: 'Competitor Bidding / Lost IS' },
  { keyword: 'vehicle check ireland', matchType: 'Phrase', q1Convs: 320, q2Convs: 180, diff: -140, q1Cvr: '9.8%', q2Cvr: '7.1%', reason: 'Traffic Quality (CTR Drop)' },
  { keyword: 'myvehicle', matchType: 'Exact', q1Convs: 600, q2Convs: 510, diff: -90, q1Cvr: '25.0%', q2Cvr: '22.5%', reason: 'Brand Demand Drop' },
  { keyword: 'reg check', matchType: 'Broad', q1Convs: 180, q2Convs: 85, diff: -95, q1Cvr: '4.5%', q2Cvr: '2.1%', reason: 'Broad Match Expansion Bloat' },
  { keyword: 'motorcheck alternative', matchType: 'Phrase', q1Convs: 90, q2Convs: 40, diff: -50, q1Cvr: '7.2%', q2Cvr: '3.5%', reason: 'Aggressive Competitor Offers' },
];

const campaigns = ['All Campaigns', 'Search - Brand - Exact', 'Search - Generic - Car History', 'Search - Competitors', 'Performance Max - Main'];

type MetricCardProps = {
  title: string;
  value: number | string;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  inverseGood?: boolean;
  icon: LucideIcon;
};

const MetricCard = ({ title, value, previousValue, prefix = '', suffix = '', inverseGood = false, icon: Icon }: MetricCardProps) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const percentChange = previousValue ? ((numericValue - previousValue) / previousValue) * 100 : 0;
  const isPositive = percentChange > 0;
  // If inverseGood is true (like CPA or CPC), an increase is bad (red)
  const isGood = inverseGood ? !isPositive : isPositive;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-slate-800">
          {prefix}{typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}{suffix}
        </h3>
      </div>
      <div className="mt-2 flex items-center text-sm">
        {percentChange !== 0 ? (
          <span className={`flex items-center font-medium ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {Math.abs(percentChange).toFixed(1)}%
          </span>
        ) : (
          <span className="text-slate-400">No change</span>
        )}
        <span className="text-slate-400 ml-2">vs Jan 2026</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState('All Campaigns');
  const [data] = useState<TrendPoint[]>(mockTrendData);
  const [keywordData] = useState<KeywordDrop[]>(mockKeywordDropData);
  const [isUploading, setIsUploading] = useState(false);

  // Derive top level stats comparing Jan to Jul
  const initialData = data[0];
  const currentData = data[data.length - 1];

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // Check Conversion Drop
    const convDrop = ((initialData.conversions - currentData.conversions) / initialData.conversions) * 100;
    if (convDrop > 20) {
      insights.push({
        type: 'critical',
        title: 'Severe Conversion Hemorrhage',
        desc: `Conversions have dropped by ${convDrop.toFixed(1)}% since January, despite cost remaining relatively stable. This indicates a severe efficiency issue rather than a budget scaling issue.`,
      });
    }

    // Check Auction Pressure
    const isDrop = initialData.imprShare - currentData.imprShare;
    if (isDrop > 10) {
      insights.push({
        type: 'warning',
        title: 'Auction Squeeze / Lost Impression Share',
        desc: `Search Impression Share has plummeted from ${initialData.imprShare}% to ${currentData.imprShare}%. Competitors are likely bidding more aggressively or your Ad Rank has degraded.`,
      });
    }

    // Check CVR
    const cvrDrop = ((initialData.cvr - currentData.cvr) / initialData.cvr) * 100;
    if (cvrDrop > 15) {
      insights.push({
        type: 'warning',
        title: 'Post-Click Friction (CVR Drop)',
        desc: `Conversion Rate dropped by ${cvrDrop.toFixed(1)}%. Users are still clicking, but not buying. Investigate landing page changes, out-of-stock reports, or competitor pricing (e.g., Cartell or Motorcheck running promos).`,
      });
    }

    // Check CPC
    const cpcRise = ((currentData.cpc - initialData.cpc) / initialData.cpc) * 100;
    if (cpcRise > 10) {
      insights.push({
        type: 'info',
        title: 'Rising CPCs',
        desc: `Avg CPC is up ${cpcRise.toFixed(1)}%. You are paying more for the same traffic, compounding the CPA inflation. Review your target ROAS/CPA bid caps.`,
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="text-blue-600" />
            MyVehicle.ie Diagnostic Dashboard
          </h1>
          <p className="text-slate-500 mt-1">6-Month Trend Analysis (Jan - Jul 2026)</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-slate-400" />
            </div>
            <select
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
            >
              {campaigns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            onClick={() => setIsUploading(!isUploading)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <UploadCloud size={16} />
            Upload CSVs
          </button>
        </div>
      </div>

      {/* Upload panel */}
      {isUploading && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4">Update with Your Data</h2>
          <p className="text-sm text-slate-500 mb-4">Upload the specific files you exported. The dashboard will automatically parse standard Google Ads column headers.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <UploadCloud className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium">Campaign report-2.csv</p>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <UploadCloud className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium">Ad group report-2.csv</p>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <UploadCloud className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium">Search keyword report-4.csv</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => setIsUploading(false)} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
        </div>
      )}

      {/* Automated diagnosis */}
      <div className="bg-blue-900 rounded-xl shadow-sm mb-8 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="text-blue-400" />
            Automated Expert Diagnosis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-white/10 rounded-lg p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${insight.type === 'critical' ? 'text-rose-400' : insight.type === 'warning' ? 'text-amber-400' : 'text-blue-300'}`}>
                    {insight.type === 'critical' ? <AlertTriangle size={20} /> : <AlertCircle size={20} />}
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">{insight.title}</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">{insight.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Conversions (Jul)"
          value={currentData.conversions}
          previousValue={initialData.conversions}
          icon={Target}
        />
        <MetricCard
          title="CPA (Cost per Acq.)"
          value={currentData.cost / currentData.conversions}
          previousValue={initialData.cost / initialData.conversions}
          prefix="€"
          inverseGood={true}
          icon={DollarSign}
        />
        <MetricCard
          title="Conversion Rate"
          value={currentData.cvr}
          previousValue={initialData.cvr}
          suffix="%"
          icon={MousePointer}
        />
        <MetricCard
          title="Search Impr. Share"
          value={currentData.imprShare}
          previousValue={initialData.imprShare}
          suffix="%"
          icon={BarChart2}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Chart 1: The Bleed (Conversions vs Cost) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Efficiency Trend: Conversions vs Cost</h3>
          <p className="text-sm text-slate-500 mb-6">Visualizing the drop in output relative to spend.</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `€${v / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="cost" name="Cost (€)" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="conversions" name="Conversions" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Auction Pressure */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Auction Pressure &amp; Visibility</h3>
          <p className="text-sm text-slate-500 mb-6">Impression Share vs CPC (Are competitors pushing you out?)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area yAxisId="left" type="monotone" dataKey="imprShare" name="Impression Share (%)" fill="#dbeafe" stroke="#3b82f6" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="cpc" name="Avg. CPC (€)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Keyword losers table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Top Conversion Losers (Keyword Level)</h3>
          <p className="text-sm text-slate-500 mt-1">Keywords with the highest drop in conversions comparing H1 to H2.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">Search Keyword</th>
                <th className="px-6 py-4 font-medium">Match Type</th>
                <th className="px-6 py-4 font-medium">Q1 Convs</th>
                <th className="px-6 py-4 font-medium">Q2 Convs</th>
                <th className="px-6 py-4 font-medium">Difference</th>
                <th className="px-6 py-4 font-medium">CVR Shift</th>
                <th className="px-6 py-4 font-medium">Expert Hypothesis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keywordData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.keyword}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      row.matchType === 'Exact' ? 'bg-slate-100 text-slate-700' :
                      row.matchType === 'Phrase' ? 'bg-blue-50 text-blue-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {row.matchType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.q1Convs}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.q2Convs}</td>
                  <td className="px-6 py-4 text-sm font-bold text-rose-600">{row.diff}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-slate-500">{row.q1Cvr}</span>
                    <span className="mx-2 text-slate-300">→</span>
                    <span className="text-rose-600 font-medium">{row.q2Cvr}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 italic">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
