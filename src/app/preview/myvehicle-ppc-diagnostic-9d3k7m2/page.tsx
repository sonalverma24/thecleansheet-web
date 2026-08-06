'use client';

import React, { useMemo, useState } from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ComposedChart, Area, Bar,
} from 'recharts';
import {
  TrendingDown, TrendingUp, AlertTriangle, BarChart2, Check,
  Target, Activity, DollarSign, MousePointer, MousePointerClick, Percent, AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { campaignData, campaigns, type TrendPoint, type KeywordDrop } from './data';

/* ────────────────────────────────────────────────────────────────
   CLIENT DIAGNOSTIC DASHBOARD · MyVehicle.ie PPC

   Hidden, unlisted preview shared privately with the client. This route
   is noindex (see layout.tsx) and is not linked from the site or the
   sitemap.

   Pick any set of campaigns; every chart, metric card, the diagnosis
   and the keyword table re-aggregate at runtime from the client's real
   Google Ads exports (Jan 5 - Jul 31, 2026). See data.ts.
──────────────────────────────────────────────────────────────── */

type Insight = {
  type: 'critical' | 'warning' | 'info' | 'good';
  title: string;
  desc: string;
};

const EMPTY_POINT = (month: string): TrendPoint => ({
  month, cost: 0, conversions: 0, clicks: 0, impressions: 0, imprShare: 0, cpc: 0, cvr: 0, ctr: 0,
});

// Aggregate the monthly trend across an arbitrary set of campaigns.
// Sums the additive metrics; impression-weights Search Impr. Share
// (a share can't be summed); derives CPC / CVR / CTR from the totals.
function aggregateTrend(selected: string[]): TrendPoint[] {
  const months = campaignData[campaigns[0]].trend.map((p) => p.month);
  return months.map((month, i) => {
    let cost = 0, conversions = 0, clicks = 0, impressions = 0, isWeighted = 0, isImpr = 0;
    for (const c of selected) {
      const p = campaignData[c]?.trend[i];
      if (!p) continue;
      cost += p.cost;
      conversions += p.conversions;
      clicks += p.clicks;
      impressions += p.impressions;
      if (p.imprShare > 0) { isWeighted += p.imprShare * p.impressions; isImpr += p.impressions; }
    }
    if (selected.length === 0) return EMPTY_POINT(month);
    return {
      month,
      cost: Math.round(cost),
      conversions: Math.round(conversions),
      clicks: Math.round(clicks),
      impressions: Math.round(impressions),
      imprShare: isImpr ? +(isWeighted / isImpr).toFixed(1) : 0,
      cpc: clicks ? +(cost / clicks).toFixed(2) : 0,
      cvr: clicks ? +(conversions / clicks * 100).toFixed(2) : 0,
      ctr: impressions ? +(clicks / impressions * 100).toFixed(2) : 0,
    };
  });
}

// Merge the top keyword losers across the selected campaigns.
function aggregateKeywords(selected: string[]): KeywordDrop[] {
  const rows: KeywordDrop[] = [];
  for (const c of selected) rows.push(...(campaignData[c]?.keywords ?? []));
  return rows.sort((a, b) => a.diff - b.diff).slice(0, 10);
}

type MetricCardProps = {
  title: string;
  value: number | string;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  inverseGood?: boolean;
  icon: LucideIcon;
};

const MetricCard = ({ title, value, previousValue, prefix = '', suffix = '', decimals, inverseGood = false, icon: Icon }: MetricCardProps) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const percentChange = previousValue ? ((numericValue - previousValue) / previousValue) * 100 : 0;
  const isPositive = percentChange > 0;
  const isGood = inverseGood ? !isPositive : isPositive;
  const display = typeof value === 'number'
    ? value.toLocaleString('en-IE', { minimumFractionDigits: decimals ?? 0, maximumFractionDigits: decimals ?? 0 })
    : value;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-slate-800">{prefix}{display}{suffix}</h3>
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
        <span className="text-slate-400 ml-2">Jul vs Jan</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [selected, setSelected] = useState<string[]>(campaigns);

  const toggle = (c: string) =>
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const selectAll = () => setSelected(campaigns);
  const clearAll = () => setSelected([]);

  const data = useMemo(() => aggregateTrend(selected), [selected]);
  const keywordData = useMemo(() => aggregateKeywords(selected), [selected]);

  const first = data[0];
  const last = data[data.length - 1];
  const hasData = selected.length > 0 && last.conversions > 0;

  const pct = (from: number, to: number) => (from ? ((to - from) / from) * 100 : 0);

  const insights = useMemo<Insight[]>(() => {
    if (!hasData) return [];
    const out: Insight[] = [];
    const convChg = pct(first.conversions, last.conversions);
    const clicksChg = pct(first.clicks, last.clicks);
    const cvrChg = pct(first.cvr, last.cvr);
    const cpcChg = pct(first.cpc, last.cpc);
    const isChg = last.imprShare - first.imprShare;

    // 1. Headline: what happened to conversions
    if (convChg <= -20) {
      out.push({ type: 'critical', title: 'Sustained Conversion Decline',
        desc: `Conversions fell ${Math.abs(convChg).toFixed(0)}% from Jan (${first.conversions.toLocaleString()}) to Jul (${last.conversions.toLocaleString()}) across the selected campaigns.` });
    } else if (convChg <= -5) {
      out.push({ type: 'warning', title: 'Conversions Trending Down',
        desc: `Conversions are down ${Math.abs(convChg).toFixed(0)}% since January (${first.conversions.toLocaleString()} → ${last.conversions.toLocaleString()}) for the selected campaigns.` });
    } else if (convChg >= 5) {
      out.push({ type: 'good', title: 'Conversions Holding / Growing',
        desc: `Conversions are up ${convChg.toFixed(0)}% since January for the selected campaigns.` });
    } else {
      out.push({ type: 'info', title: 'Conversions Broadly Flat',
        desc: `Conversions moved ${convChg.toFixed(0)}% since January for the selected campaigns.` });
    }

    // 2. Is it traffic (clicks) or efficiency (CVR) driving the loss?
    if (convChg < -3) {
      if (clicksChg <= cvrChg && clicksChg < -5) {
        out.push({ type: 'warning', title: 'Driven by Falling Traffic',
          desc: `Clicks dropped ${Math.abs(clicksChg).toFixed(0)}% vs a ${Math.abs(cvrChg).toFixed(0)}% change in conversion rate. The loss is mostly fewer people clicking, not the landing pages. Look at budget pacing, paused ad groups and keyword coverage.` });
      } else if (cvrChg < -5) {
        out.push({ type: 'warning', title: 'Driven by Post-Click Friction',
          desc: `Conversion rate fell ${Math.abs(cvrChg).toFixed(0)}% while clicks changed ${clicksChg.toFixed(0)}%. Traffic is still arriving but converting worse. Investigate landing pages, offers and competitor pricing.` });
      }
    }

    // 3. Auction pressure — is visibility the problem, or not?
    if (isChg <= -5) {
      out.push({ type: 'warning', title: 'Losing Auction Visibility',
        desc: `Search Impression Share fell ${Math.abs(isChg).toFixed(0)} points (${first.imprShare}% → ${last.imprShare}%). Competitors or Ad Rank are pushing you out; combined with CPC ${cpcChg >= 0 ? 'up' : 'down'} ${Math.abs(cpcChg).toFixed(0)}%, the auction is getting harder.` });
    } else if (isChg >= 5) {
      out.push({ type: 'info', title: 'Visibility Is Not the Bottleneck',
        desc: `Search Impression Share actually rose ${isChg.toFixed(0)} points (${first.imprShare}% → ${last.imprShare}%). You are winning more of the auction, so the conversion loss is a demand / efficiency issue, not an auction squeeze.` });
    }

    // 4. Which campaign is bleeding most?
    let worst: { name: string; drop: number } | null = null;
    for (const c of selected) {
      const t = campaignData[c]?.trend;
      if (!t) continue;
      const drop = t[t.length - 1].conversions - t[0].conversions;
      if (worst === null || drop < worst.drop) worst = { name: c, drop };
    }
    if (worst && worst.drop < 0 && selected.length > 1) {
      out.push({ type: 'info', title: 'Biggest Single Contributor',
        desc: `"${worst.name}" lost the most conversions in absolute terms (${worst.drop} since January). Start the drill-down here.` });
    }

    return out;
  }, [selected, first, last, hasData]);

  const cpa = last.conversions ? last.cost / last.conversions : 0;
  const cpaPrev = first.conversions ? first.cost / first.conversions : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="text-blue-600" />
            MyVehicle.ie Diagnostic Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Campaign performance &amp; auction pressure, Jan - Jul 2026</p>
        </div>
        <div className="text-sm text-slate-400">
          Source: Google Ads exports · {selected.length}/{campaigns.length} campaigns selected
        </div>
      </div>

      {/* Campaign picker */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Pick campaigns to analyse</h2>
          <div className="flex gap-3 text-sm">
            <button onClick={selectAll} className="text-blue-600 hover:text-blue-700 font-medium">Select all</button>
            <span className="text-slate-300">|</span>
            <button onClick={clearAll} className="text-slate-500 hover:text-slate-700 font-medium">Clear</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {campaigns.map((c) => {
            const on = selected.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  on
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {on && <Check size={14} />}
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500">
          Select one or more campaigns above to see the analysis.
        </div>
      ) : (
        <>
          {/* Automated diagnosis */}
          <div className="bg-blue-900 rounded-xl shadow-sm mb-8 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="text-blue-400" />
                Automated Diagnosis · Why Conversions Are Moving
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className="bg-white/10 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${
                        insight.type === 'critical' ? 'text-rose-400'
                          : insight.type === 'warning' ? 'text-amber-400'
                          : insight.type === 'good' ? 'text-emerald-400'
                          : 'text-blue-300'}`}>
                        {insight.type === 'critical' ? <AlertTriangle size={20} /> : insight.type === 'good' ? <TrendingUp size={20} /> : <AlertCircle size={20} />}
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
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <MetricCard title="Cost (Jul)" value={last.cost} previousValue={first.cost} prefix="€" inverseGood icon={DollarSign} />
            <MetricCard title="Conversions (Jul)" value={last.conversions} previousValue={first.conversions} icon={Target} />
            <MetricCard title="Conv. Rate" value={last.cvr} previousValue={first.cvr} suffix="%" decimals={2} icon={MousePointer} />
            <MetricCard title="CTR" value={last.ctr} previousValue={first.ctr} suffix="%" decimals={2} icon={MousePointerClick} />
            <MetricCard title="Avg. CPC" value={last.cpc} previousValue={first.cpc} prefix="€" decimals={2} inverseGood icon={Percent} />
            <MetricCard title="Search Impr. Share" value={last.imprShare} previousValue={first.imprShare} suffix="%" decimals={1} icon={BarChart2} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Efficiency Trend: Conversions vs Cost</h3>
              <p className="text-sm text-slate-500 mb-6">Output relative to spend across the selected campaigns.</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar yAxisId="left" dataKey="cost" name="Cost (€)" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                    <Line yAxisId="right" type="monotone" dataKey="conversions" name="Conversions" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Auction Pressure &amp; Visibility</h3>
              <p className="text-sm text-slate-500 mb-6">Search Impression Share vs Avg. CPC.</p>
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

          {/* CPA callout strip */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8 p-6 flex flex-wrap items-center gap-x-10 gap-y-3">
            <div>
              <p className="text-sm text-slate-500">Cost / Conversion (Jul)</p>
              <p className="text-xl font-bold text-slate-800">
                €{cpa.toFixed(2)}
                <span className={`ml-2 text-sm font-medium ${cpa > cpaPrev ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {cpaPrev ? `${cpa > cpaPrev ? '+' : ''}${(pct(cpaPrev, cpa)).toFixed(0)}% vs Jan` : ''}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Clicks (Jul)</p>
              <p className="text-xl font-bold text-slate-800">{last.clicks.toLocaleString()}
                <span className={`ml-2 text-sm font-medium ${last.clicks < first.clicks ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {pct(first.clicks, last.clicks).toFixed(0)}% vs Jan
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Impressions (Jul)</p>
              <p className="text-xl font-bold text-slate-800">{last.impressions.toLocaleString()}</p>
            </div>
          </div>

          {/* Keyword losers table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Top Conversion Losers (Keyword Level)</h3>
              <p className="text-sm text-slate-500 mt-1">Biggest drops in conversions, first half (Jan-Mar) vs second half (Apr-Jul), across the selected campaigns.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="px-6 py-4 font-medium">Search Keyword</th>
                    <th className="px-6 py-4 font-medium">Match Type</th>
                    <th className="px-6 py-4 font-medium">H1 Convs</th>
                    <th className="px-6 py-4 font-medium">H2 Convs</th>
                    <th className="px-6 py-4 font-medium">Difference</th>
                    <th className="px-6 py-4 font-medium">CVR Shift</th>
                    <th className="px-6 py-4 font-medium">Likely Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {keywordData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                        No search-keyword data for the selected campaigns (e.g. Performance Max has no keyword report).
                      </td>
                    </tr>
                  ) : keywordData.map((row, idx) => (
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
        </>
      )}
    </div>
  );
}
