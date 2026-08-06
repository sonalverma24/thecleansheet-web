// AUTO-GENERATED from the client's Google Ads exports (Jan 5 - Jul 31, 2026, EUR):
//   Campaign report-2.csv, Ad group report-2.csv, Search keyword report-4.csv
// Per-campaign monthly trends + top keyword conversion losers (H1 Jan-Mar vs H2 Apr-Jul).
// Aggregation across a selected set of campaigns happens at runtime in page.tsx.

export type TrendPoint = {
  month: string; cost: number; conversions: number; clicks: number;
  impressions: number; imprShare: number; cpc: number; cvr: number; ctr: number;
};

export type KeywordDrop = {
  keyword: string; matchType: 'Exact' | 'Phrase' | 'Broad';
  q1Convs: number; q2Convs: number; diff: number;
  q1Cvr: string; q2Cvr: string; reason: string;
};

export type CampaignBundle = { trend: TrendPoint[]; keywords: KeywordDrop[] };

export const campaignData: Record<string, CampaignBundle> = {
  'Generic': {
    trend: [
      { month: 'Jan 2026', cost: 6148, conversions: 309, clicks: 10749, impressions: 71691, imprShare: 14.4, cpc: 0.57, cvr: 2.88, ctr: 14.99 },
      { month: 'Feb 2026', cost: 5687, conversions: 314, clicks: 9484, impressions: 66106, imprShare: 15.3, cpc: 0.6, cvr: 3.32, ctr: 14.35 },
      { month: 'Mar 2026', cost: 6081, conversions: 275, clicks: 10072, impressions: 98807, imprShare: 15.8, cpc: 0.6, cvr: 2.73, ctr: 10.19 },
      { month: 'Apr 2026', cost: 6951, conversions: 339, clicks: 11746, impressions: 77337, imprShare: 17.5, cpc: 0.59, cvr: 2.88, ctr: 15.19 },
      { month: 'May 2026', cost: 7602, conversions: 362, clicks: 12517, impressions: 78574, imprShare: 27.9, cpc: 0.61, cvr: 2.89, ctr: 15.93 },
      { month: 'Jun 2026', cost: 7522, conversions: 341, clicks: 10957, impressions: 71846, imprShare: 35.5, cpc: 0.69, cvr: 3.11, ctr: 15.25 },
      { month: 'Jul 2026', cost: 7375, conversions: 298, clicks: 10743, impressions: 72704, imprShare: 35.3, cpc: 0.69, cvr: 2.78, ctr: 14.78 },
    ],
    keywords: [
      { keyword: 'car history check ireland', matchType: 'Exact', q1Convs: 53, q2Convs: 8, diff: -45, q1Cvr: '6.5%', q2Cvr: '2.6%', reason: 'Lost clicks / impression share' },
      { keyword: 'reg check', matchType: 'Exact', q1Convs: 34, q2Convs: 10, diff: -23, q1Cvr: '3.6%', q2Cvr: '0.9%', reason: 'Post-click friction (CVR drop)' },
      { keyword: 'check reg', matchType: 'Broad', q1Convs: 11, q2Convs: 1, diff: -10, q1Cvr: '2.0%', q2Cvr: '0.3%', reason: 'Post-click friction (CVR drop)' },
      { keyword: 'hpi check free', matchType: 'Broad', q1Convs: 14, q2Convs: 3, diff: -10, q1Cvr: '3.3%', q2Cvr: '2.6%', reason: 'Lost clicks / impression share' },
      { keyword: 'check my reg', matchType: 'Broad', q1Convs: 10, q2Convs: 2, diff: -8, q1Cvr: '2.6%', q2Cvr: '0.8%', reason: 'Post-click friction (CVR drop)' },
      { keyword: 'reg check ie', matchType: 'Broad', q1Convs: 15, q2Convs: 7, diff: -8, q1Cvr: '2.5%', q2Cvr: '2.0%', reason: 'Gradual conversion decline' },
      { keyword: 'car history check', matchType: 'Exact', q1Convs: 8, q2Convs: 1, diff: -7, q1Cvr: '4.1%', q2Cvr: '4.0%', reason: 'Lost clicks / impression share' },
      { keyword: 'car finance check', matchType: 'Broad', q1Convs: 33, q2Convs: 26, diff: -7, q1Cvr: '3.7%', q2Cvr: '6.9%', reason: 'Lost clicks / impression share' },
    ],
  },
  'PerfMax - Mar \'22': {
    trend: [
      { month: 'Jan 2026', cost: 3890, conversions: 194, clicks: 8246, impressions: 173704, imprShare: 14.5, cpc: 0.47, cvr: 2.35, ctr: 4.75 },
      { month: 'Feb 2026', cost: 4257, conversions: 251, clicks: 8316, impressions: 74519, imprShare: 13.9, cpc: 0.51, cvr: 3.02, ctr: 11.16 },
      { month: 'Mar 2026', cost: 4258, conversions: 224, clicks: 8368, impressions: 74598, imprShare: 12.8, cpc: 0.51, cvr: 2.68, ctr: 11.22 },
      { month: 'Apr 2026', cost: 4258, conversions: 214, clicks: 8058, impressions: 75999, imprShare: 12.2, cpc: 0.53, cvr: 2.66, ctr: 10.6 },
      { month: 'May 2026', cost: 3246, conversions: 169, clicks: 6821, impressions: 81687, imprShare: 18.6, cpc: 0.48, cvr: 2.47, ctr: 8.35 },
      { month: 'Jun 2026', cost: 3344, conversions: 188, clicks: 6180, impressions: 72731, imprShare: 21.2, cpc: 0.54, cvr: 3.05, ctr: 8.5 },
      { month: 'Jul 2026', cost: 3056, conversions: 139, clicks: 6246, impressions: 90856, imprShare: 23.0, cpc: 0.49, cvr: 2.23, ctr: 6.87 },
    ],
    keywords: [], // Performance Max / no search-keyword report
  },
  'My Vehicle Second Campaign': {
    trend: [
      { month: 'Jan 2026', cost: 3630, conversions: 261, clicks: 6301, impressions: 46214, imprShare: 17.1, cpc: 0.58, cvr: 4.14, ctr: 13.63 },
      { month: 'Feb 2026', cost: 3810, conversions: 209, clicks: 6179, impressions: 51798, imprShare: 14.7, cpc: 0.62, cvr: 3.38, ctr: 11.93 },
      { month: 'Mar 2026', cost: 2721, conversions: 204, clicks: 4812, impressions: 47886, imprShare: 15.4, cpc: 0.57, cvr: 4.24, ctr: 10.05 },
      { month: 'Apr 2026', cost: 2352, conversions: 106, clicks: 3372, impressions: 79254, imprShare: 11.0, cpc: 0.7, cvr: 3.14, ctr: 4.25 },
      { month: 'May 2026', cost: 2432, conversions: 110, clicks: 3685, impressions: 42972, imprShare: 12.8, cpc: 0.66, cvr: 2.99, ctr: 8.58 },
      { month: 'Jun 2026', cost: 2432, conversions: 146, clicks: 4077, impressions: 35444, imprShare: 17.3, cpc: 0.6, cvr: 3.57, ctr: 11.5 },
      { month: 'Jul 2026', cost: 2432, conversions: 115, clicks: 3690, impressions: 31807, imprShare: 14.7, cpc: 0.66, cvr: 3.12, ctr: 11.6 },
    ],
    keywords: [
      { keyword: 'car check ireland', matchType: 'Broad', q1Convs: 138, q2Convs: 12, diff: -127, q1Cvr: '4.4%', q2Cvr: '4.4%', reason: 'Lost clicks / impression share' },
      { keyword: 'check my car history', matchType: 'Phrase', q1Convs: 69, q2Convs: 1, diff: -68, q1Cvr: '6.5%', q2Cvr: '1.7%', reason: 'Lost clicks / impression share' },
      { keyword: 'check a car history', matchType: 'Phrase', q1Convs: 41, q2Convs: 2, diff: -39, q1Cvr: '4.7%', q2Cvr: '15.4%', reason: 'Lost clicks / impression share' },
      { keyword: 'check my car', matchType: 'Phrase', q1Convs: 29, q2Convs: 2, diff: -28, q1Cvr: '5.7%', q2Cvr: '8.3%', reason: 'Lost clicks / impression share' },
      { keyword: 'history check on car', matchType: 'Phrase', q1Convs: 26, q2Convs: 7, diff: -19, q1Cvr: '3.0%', q2Cvr: '4.4%', reason: 'Lost clicks / impression share' },
      { keyword: 'free check car history', matchType: 'Phrase', q1Convs: 21, q2Convs: 3, diff: -18, q1Cvr: '3.8%', q2Cvr: '4.6%', reason: 'Lost clicks / impression share' },
      { keyword: 'check car history', matchType: 'Phrase', q1Convs: 23, q2Convs: 5, diff: -18, q1Cvr: '6.5%', q2Cvr: '4.0%', reason: 'Lost clicks / impression share' },
      { keyword: 'check a car history', matchType: 'Broad', q1Convs: 15, q2Convs: 0, diff: -15, q1Cvr: '4.9%', q2Cvr: '0.6%', reason: 'Lost clicks / impression share' },
    ],
  },
  'Competitor': {
    trend: [
      { month: 'Jan 2026', cost: 2752, conversions: 166, clicks: 4251, impressions: 26162, imprShare: 46.6, cpc: 0.65, cvr: 3.91, ctr: 16.25 },
      { month: 'Feb 2026', cost: 2750, conversions: 159, clicks: 3605, impressions: 27133, imprShare: 39.3, cpc: 0.76, cvr: 4.4, ctr: 13.29 },
      { month: 'Mar 2026', cost: 3008, conversions: 159, clicks: 3685, impressions: 33352, imprShare: 38.8, cpc: 0.82, cvr: 4.33, ctr: 11.05 },
      { month: 'Apr 2026', cost: 3040, conversions: 164, clicks: 3628, impressions: 44022, imprShare: 40.3, cpc: 0.84, cvr: 4.51, ctr: 8.24 },
      { month: 'May 2026', cost: 2798, conversions: 133, clicks: 3402, impressions: 24322, imprShare: 52.0, cpc: 0.82, cvr: 3.9, ctr: 13.99 },
      { month: 'Jun 2026', cost: 2838, conversions: 142, clicks: 3340, impressions: 26260, imprShare: 52.9, cpc: 0.85, cvr: 4.24, ctr: 12.72 },
      { month: 'Jul 2026', cost: 2283, conversions: 105, clicks: 2779, impressions: 28124, imprShare: 53.1, cpc: 0.82, cvr: 3.77, ctr: 9.88 },
    ],
    keywords: [
      { keyword: 'cartell', matchType: 'Exact', q1Convs: 102, q2Convs: 80, diff: -21, q1Cvr: '3.0%', q2Cvr: '3.0%', reason: 'Gradual conversion decline' },
      { keyword: 'car tell', matchType: 'Broad', q1Convs: 34, q2Convs: 25, diff: -9, q1Cvr: '4.5%', q2Cvr: '3.2%', reason: 'Gradual conversion decline' },
      { keyword: 'cartell uk', matchType: 'Broad', q1Convs: 13, q2Convs: 7, diff: -6, q1Cvr: '12.4%', q2Cvr: '3.2%', reason: 'Post-click friction (CVR drop)' },
      { keyword: 'cartell report', matchType: 'Broad', q1Convs: 11, q2Convs: 10, diff: -1, q1Cvr: '9.9%', q2Cvr: '9.6%', reason: 'Gradual conversion decline' },
      { keyword: 'cartell', matchType: 'Broad', q1Convs: 49, q2Convs: 48, diff: -1, q1Cvr: '3.7%', q2Cvr: '2.9%', reason: 'Gradual conversion decline' },
    ],
  },
  'VRT & Nox Calculator': {
    trend: [
      { month: 'Jan 2026', cost: 1404, conversions: 112, clicks: 1873, impressions: 20299, imprShare: 11.2, cpc: 0.75, cvr: 5.96, ctr: 9.23 },
      { month: 'Feb 2026', cost: 1207, conversions: 100, clicks: 1569, impressions: 18675, imprShare: 0, cpc: 0.77, cvr: 6.34, ctr: 8.4 },
      { month: 'Mar 2026', cost: 1307, conversions: 93, clicks: 1639, impressions: 47812, imprShare: 0, cpc: 0.8, cvr: 5.7, ctr: 3.43 },
      { month: 'Apr 2026', cost: 1069, conversions: 78, clicks: 1266, impressions: 18492, imprShare: 0, cpc: 0.84, cvr: 6.15, ctr: 6.85 },
      { month: 'May 2026', cost: 991, conversions: 75, clicks: 1109, impressions: 12577, imprShare: 13.7, cpc: 0.89, cvr: 6.73, ctr: 8.82 },
      { month: 'Jun 2026', cost: 1550, conversions: 100, clicks: 1648, impressions: 15512, imprShare: 21.5, cpc: 0.94, cvr: 6.09, ctr: 10.62 },
      { month: 'Jul 2026', cost: 701, conversions: 38, clicks: 845, impressions: 7720, imprShare: 14.6, cpc: 0.83, cvr: 4.51, ctr: 10.95 },
    ],
    keywords: [
      { keyword: 'vrt calculator', matchType: 'Exact', q1Convs: 104, q2Convs: 74, diff: -29, q1Cvr: '6.7%', q2Cvr: '6.6%', reason: 'Gradual conversion decline' },
      { keyword: 'vrt ie', matchType: 'Broad', q1Convs: 6, q2Convs: 1, diff: -5, q1Cvr: '5.0%', q2Cvr: '5.9%', reason: 'Lost clicks / impression share' },
      { keyword: 'how to vrt a car', matchType: 'Broad', q1Convs: 4, q2Convs: 0, diff: -4, q1Cvr: '5.3%', q2Cvr: '3.1%', reason: 'Lost clicks / impression share' },
    ],
  },
  'Brand - Mar \'22': {
    trend: [
      { month: 'Jan 2026', cost: 929, conversions: 71, clicks: 1043, impressions: 2554, imprShare: 84.5, cpc: 0.89, cvr: 6.84, ctr: 40.84 },
      { month: 'Feb 2026', cost: 350, conversions: 50, clicks: 684, impressions: 1499, imprShare: 98.3, cpc: 0.51, cvr: 7.37, ctr: 45.63 },
      { month: 'Mar 2026', cost: 352, conversions: 53, clicks: 666, impressions: 1517, imprShare: 97.2, cpc: 0.53, cvr: 7.94, ctr: 43.9 },
      { month: 'Apr 2026', cost: 869, conversions: 40, clicks: 985, impressions: 2731, imprShare: 69.5, cpc: 0.88, cvr: 4.05, ctr: 36.07 },
      { month: 'May 2026', cost: 500, conversions: 55, clicks: 859, impressions: 2236, imprShare: 96.2, cpc: 0.58, cvr: 6.38, ctr: 38.42 },
      { month: 'Jun 2026', cost: 1319, conversions: 47, clicks: 1117, impressions: 3494, imprShare: 45.9, cpc: 1.18, cvr: 4.23, ctr: 31.97 },
      { month: 'Jul 2026', cost: 670, conversions: 57, clicks: 655, impressions: 1779, imprShare: 95.4, cpc: 1.02, cvr: 8.69, ctr: 36.82 },
    ],
    keywords: [
      { keyword: 'myvehicle', matchType: 'Exact', q1Convs: 58, q2Convs: 42, diff: -16, q1Cvr: '8.5%', q2Cvr: '4.8%', reason: 'Post-click friction (CVR drop)' },
      { keyword: 'myvehicle', matchType: 'Phrase', q1Convs: 21, q2Convs: 14, diff: -7, q1Cvr: '6.6%', q2Cvr: '2.8%', reason: 'Post-click friction (CVR drop)' },
      { keyword: 'myvehicle ie', matchType: 'Phrase', q1Convs: 3, q2Convs: 0, diff: -3, q1Cvr: '23.1%', q2Cvr: '0.0%', reason: 'Paused or dropped out of auction' },
    ],
  },
  'Competitor- Motorcheck': {
    trend: [
      { month: 'Jan 2026', cost: 1247, conversions: 46, clicks: 1685, impressions: 19087, imprShare: 35.6, cpc: 0.74, cvr: 2.74, ctr: 8.83 },
      { month: 'Feb 2026', cost: 147, conversions: 8, clicks: 148, impressions: 2113, imprShare: 23.3, cpc: 0.99, cvr: 5.4, ctr: 7.0 },
      { month: 'Mar 2026', cost: 0, conversions: 0, clicks: 0, impressions: 0, imprShare: 0, cpc: 0, cvr: 0, ctr: 0 },
      { month: 'Apr 2026', cost: 0, conversions: 0, clicks: 0, impressions: 0, imprShare: 0, cpc: 0, cvr: 0, ctr: 0 },
      { month: 'May 2026', cost: 0, conversions: 0, clicks: 0, impressions: 0, imprShare: 0, cpc: 0, cvr: 0, ctr: 0 },
      { month: 'Jun 2026', cost: 0, conversions: 0, clicks: 0, impressions: 0, imprShare: 0, cpc: 0, cvr: 0, ctr: 0 },
      { month: 'Jul 2026', cost: 0, conversions: 0, clicks: 0, impressions: 0, imprShare: 0, cpc: 0, cvr: 0, ctr: 0 },
    ],
    keywords: [
      { keyword: 'motorcheck ie', matchType: 'Exact', q1Convs: 13, q2Convs: 0, diff: -13, q1Cvr: '3.6%', q2Cvr: '0.0%', reason: 'Paused or dropped out of auction' },
      { keyword: 'motorcheck ireland', matchType: 'Broad', q1Convs: 10, q2Convs: 0, diff: -10, q1Cvr: '5.6%', q2Cvr: '0.0%', reason: 'Paused or dropped out of auction' },
      { keyword: 'motor check', matchType: 'Exact', q1Convs: 5, q2Convs: 0, diff: -5, q1Cvr: '1.8%', q2Cvr: '0.0%', reason: 'Paused or dropped out of auction' },
      { keyword: 'motor check uk', matchType: 'Broad', q1Convs: 4, q2Convs: 0, diff: -4, q1Cvr: '6.0%', q2Cvr: '0.0%', reason: 'Paused or dropped out of auction' },
      { keyword: 'motorcheck', matchType: 'Exact', q1Convs: 3, q2Convs: 0, diff: -3, q1Cvr: '1.8%', q2Cvr: '0.0%', reason: 'Paused or dropped out of auction' },
    ],
  },
  'Vat & Custom Duty': {
    trend: [
      { month: 'Jan 2026', cost: 63, conversions: 6, clicks: 147, impressions: 1980, imprShare: 0, cpc: 0.43, cvr: 4.1, ctr: 7.42 },
      { month: 'Feb 2026', cost: 66, conversions: 7, clicks: 137, impressions: 1717, imprShare: 0, cpc: 0.48, cvr: 5.46, ctr: 7.98 },
      { month: 'Mar 2026', cost: 65, conversions: 6, clicks: 136, impressions: 1749, imprShare: 0, cpc: 0.48, cvr: 4.41, ctr: 7.78 },
      { month: 'Apr 2026', cost: 98, conversions: 16, clicks: 202, impressions: 2658, imprShare: 0, cpc: 0.49, cvr: 8.04, ctr: 7.6 },
      { month: 'May 2026', cost: 71, conversions: 8, clicks: 128, impressions: 1559, imprShare: 11.1, cpc: 0.55, cvr: 6.25, ctr: 8.21 },
      { month: 'Jun 2026', cost: 79, conversions: 6, clicks: 146, impressions: 1650, imprShare: 14.5, cpc: 0.54, cvr: 4.1, ctr: 8.85 },
      { month: 'Jul 2026', cost: 68, conversions: 4, clicks: 128, impressions: 1289, imprShare: 13.6, cpc: 0.53, cvr: 3.32, ctr: 9.93 },
    ],
    keywords: [], // Performance Max / no search-keyword report
  },
};

export const campaigns = Object.keys(campaignData);
