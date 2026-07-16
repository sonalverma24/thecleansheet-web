/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Live review result
   Renders a live ProductReview + DerivedVerdict in the brand-product
   page format: compact white cards, pillar dots, expandable rows.
   Tier badge everywhere a score used to be. No numerics shown.
──────────────────────────────────────────────────────────────── */

import { ChevronDown } from "lucide-react";
import OpenFormButton from "@/components/OpenFormButton";
import { PillarDots, pillarNameColor, pillarColor, pillarRatingLabel, TierBadge } from "@/components/scorecards/pillar-ui";
import type { ProductReview, DerivedVerdict, ClaimAnalysis } from "@/lib/product-review-types";

const COOPER = { fontFamily: "'Cooper BT', sans-serif" } as const;

/* ─── Section shell (brand-page language) ─── */
function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2.5 mb-1">
        <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
        <h2 className="text-sm text-[#282828]" style={COOPER}>{title}</h2>
      </div>
      {sub && <p className="text-xs text-[#b0a8a4] pl-[19px]">{sub}</p>}
    </div>
  );
}

/* ─── Claim card styling by residual risk ─── */
function claimStyles(c: ClaimAnalysis) {
  if (c.riskLevel === "red-flag" || c.drugBoundaryRisk)
    return { accent: "#fd6158", label: "Red flag", labelCls: "text-[#fd6158]" };
  if (c.riskLevel === "very-high" || c.riskLevel === "high")
    return { accent: "#f59e0b", label: "Claims outrun proof", labelCls: "text-amber-600" };
  if (c.riskLevel === "medium")
    return { accent: "#3b82f6", label: "Partly supported", labelCls: "text-blue-600" };
  return { accent: "#248179", label: "Well supported", labelCls: "text-[#248179]" };
}

function evidenceShort(level: number): string {
  const map: Record<number, string> = {
    1: "No proof publicly visible", 2: "Ingredient research only", 3: "Ingredient % disclosed",
    4: "Finished-product tested", 5: "Third-party lab tested", 6: "Clinical study", 7: "Published study",
  };
  return map[level] ?? "";
}

/** Highlights: every hard flag, the best-proven wins, the biggest gaps. */
function selectHighlights(claims: ClaimAnalysis[]): ClaimAnalysis[] {
  const flags = claims.filter((c) => c.riskLevel === "red-flag" || c.drugBoundaryRisk);
  const wins = claims
    .filter((c) => !flags.includes(c) && c.evidenceLevel >= 5)
    .sort((a, b) => b.evidenceLevel - a.evidenceLevel)
    .slice(0, 3);
  const gaps = claims
    .filter((c) => !flags.includes(c) && !wins.includes(c) && (c.riskLevel === "high" || c.riskLevel === "very-high"))
    .slice(0, 3);
  const picked = [...flags, ...wins, ...gaps];
  // Pad with the first remaining claims if very few were selected
  for (const c of claims) {
    if (picked.length >= 6) break;
    if (!picked.includes(c)) picked.push(c);
  }
  return picked.slice(0, 8);
}

function ClaimCard({ c }: { c: ClaimAnalysis }) {
  const s = claimStyles(c);
  return (
    <div className="relative rounded-xl border border-[#efe9e0] bg-white p-4 pl-5 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ backgroundColor: s.accent }} />
      <div className="flex items-start justify-between mb-2 gap-3">
        <span className="text-xs text-[#282828] leading-relaxed">&ldquo;{c.text}&rdquo;</span>
        <span className={`text-[10px] flex-shrink-0 ${s.labelCls}`}>{s.label}</span>
      </div>
      {c.evidenceNote && <p className="text-xs text-[#282828]/70 leading-relaxed mb-2">{c.evidenceNote}</p>}
      {c.asciConcern && c.asciNote && <p className="text-[10px] text-[#fd6158] mb-1.5">ASCI: {c.asciNote}</p>}
      {c.drugBoundaryRisk && c.drugBoundaryNote && <p className="text-[10px] text-[#fd6158] mb-1.5">Drug boundary: {c.drugBoundaryNote}</p>}
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.accent }} />
        <span className="text-[10px] text-[#b0a8a4]">{evidenceShort(c.evidenceLevel)} · {c.source}</span>
      </div>
    </div>
  );
}

export default function ReviewResult({ review, verdict }: { review: ProductReview; verdict: DerivedVerdict }) {
  const claims = review.claimMap ?? [];
  const highlights = selectHighlights(claims);
  const rest = claims.filter((c) => !highlights.includes(c));

  /* Breakdown rows from the 7 scoring sections (dots + label only, no numbers) */
  const s = review.scores;
  const breakdown = [
    { name: "Claims Evidence", score: s.claimEvidence, max: 20, note: `Strongest evidence found: ${evidenceShort(review.claimSummary?.highestEvidenceLevel ?? 1)}. ${review.verdict?.bestThing ?? ""}` },
    { name: "Claim Responsibility", score: s.claimClarity, max: 15, note: `${review.claimSummary?.total ?? claims.length} claims checked · ${review.claimSummary?.asciConcernCount ?? 0} ASCI concern(s) · ${review.claimSummary?.drugBoundaryCount ?? 0} drug-boundary flag(s).` },
    { name: "Ingredient Transparency", score: s.ingredientTransparency, max: 20, note: `${review.ingredientTransparency?.label ?? ""}. ${review.ingredientTransparency?.issues?.[0] ?? ""}` },
    { name: "Formula Logic", score: s.formulaLogic, max: 15, note: review.formulaLogic?.note ?? "" },
    { name: "Consumer Suitability", score: s.consumerSuitability, max: 10, note: review.consumerSuitability?.sensitivityRisk ?? "" },
    { name: "Price Fairness", score: s.priceFairness, max: 10, note: review.priceInsight ?? "" },
    { name: "Platform Consistency", score: s.platformConsistency, max: 10, note: review.platformParity?.amplificationPattern ?? (review.platformParity?.consistent ? "Claims are consistent across platforms." : review.platformParity?.issues?.[0] ?? "") },
  ];

  const regulatoryRows = claims.filter((c) => c.asciConcern || c.drugBoundaryRisk);
  const improve = claims.filter((c) => c.evidenceLevel <= 2 && (c.riskLevel === "high" || c.riskLevel === "very-high" || c.riskLevel === "red-flag")).slice(0, 5);
  const suit = review.consumerSuitability;

  return (
    <div className="bg-[#fcf9f8]">
      {/* ── Hero ── */}
      <div className="bg-white border-b border-[#efe9e0]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-[#efe9e0] flex-shrink-0 bg-[#faf7f2]">
              {review.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={review.imageUrl} alt={review.productName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl text-[#282828]" style={COOPER}>{(review.brand || "?").charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#248179]">{review.brand}{review.category ? ` · ${review.category}` : ""}</p>
              <h1 className="text-[22px] sm:text-[26px] leading-tight text-[#282828] mt-1" style={COOPER}>{review.productName}</h1>
              {review.heroPromise && <p className="text-xs text-[#b0a8a4] mt-1.5 max-w-xl">&ldquo;{review.heroPromise}&rdquo;</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <TierBadge tier={verdict.tier} size="lg" />
                <span className="text-[10px] text-[#b0a8a4]">{verdict.headline}</span>
              </div>
            </div>
          </div>
          {/* Gates */}
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5">
            {verdict.gates.map((g) => (
              <span key={g.id} className="flex items-center gap-1.5 text-[10px] text-[#b0a8a4]">
                <span className="text-xs" style={{ color: g.passed ? "#248179" : "#fd6158" }}>{g.passed ? "✓" : "✗"}</span>
                {g.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 space-y-8">
        {/* 1. At a glance */}
        <section>
          <SectionHead title="At a glance" />
          <div className="bg-white rounded-2xl border border-[#efe9e0] p-4 sm:p-5">
            {review.verdict?.cleanSheetTakeaway && (
              <p className="text-xs text-[#282828]/80 leading-relaxed mb-4">{review.verdict.cleanSheetTakeaway}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              {review.verdict?.bestThing && (
                <div className="rounded-xl bg-[#248179]/[0.06] border border-[#248179]/15 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#248179] mb-1">Best thing</p>
                  <p className="text-xs text-[#282828]/75 leading-relaxed">{review.verdict.bestThing}</p>
                </div>
              )}
              {review.verdict?.biggestConcern && (
                <div className="rounded-xl bg-[#fd6158]/[0.05] border border-[#fd6158]/15 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#fd6158] mb-1">Biggest concern</p>
                  <p className="text-xs text-[#282828]/75 leading-relaxed">{review.verdict.biggestConcern}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2. What was checked */}
        {(review.dataSource?.reviewPlatforms?.length > 0 || review.dataSource?.inciSource) && (
          <section>
            <SectionHead title="What was checked" sub="Claims graded against publicly available evidence: listings, published test data, the ingredient list, and regulatory rules." />
            <div className="bg-white rounded-2xl border border-[#efe9e0] p-4 sm:p-5 flex flex-wrap gap-2">
              {[...(review.dataSource?.reviewPlatforms ?? []), review.dataSource?.inciSource ? `INCI: ${review.dataSource.inciSource}` : null]
                .filter(Boolean)
                .map((p) => (
                  <span key={String(p)} className="text-[10px] px-2.5 py-1 rounded-full bg-[#faf7f2] border border-[#efe9e0] text-[#282828]/70">{p}</span>
                ))}
            </div>
          </section>
        )}

        {/* 3. The breakdown */}
        <section>
          <SectionHead title="The breakdown" sub="How this product was assessed across seven areas. Open any row for the rationale." />
          <div className="bg-white rounded-2xl border border-[#efe9e0] overflow-hidden divide-y divide-[#efe9e0]">
            {breakdown.map((row) => {
              const pct = Math.round((row.score / row.max) * 100);
              return (
                <details key={row.name} className="group">
                  <summary className="px-4 py-3.5 cursor-pointer list-none select-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <PillarDots score={row.score} max={row.max} />
                        <span className="text-sm" style={{ color: pillarNameColor(pct), ...COOPER }}>{row.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0 ml-4">
                        <span className="text-xs" style={{ color: pillarColor(pct) }}>{pillarRatingLabel(pct)}</span>
                        <ChevronDown size={12} className="text-[#b0a8a4] transition-transform group-open:rotate-180 flex-shrink-0" />
                      </div>
                    </div>
                  </summary>
                  <div className="px-4 pb-4 pt-0 bg-[#f7f7f5] border-t border-[#efe9e0]">
                    <p className="text-xs text-[#282828]/65 leading-relaxed pt-4 pl-[46px]">{row.note || "No specific issues noted."}</p>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        {/* 4. Claims check */}
        {claims.length > 0 && (
          <section>
            <SectionHead title="Claims check" sub={`${claims.length} marketing claims found. The ones that matter most, first.`} />
            <div className="grid sm:grid-cols-2 gap-3">
              {highlights.map((c, i) => <ClaimCard key={i} c={c} />)}
            </div>
            {rest.length > 0 && (
              <details className="group mt-3">
                <summary className="flex items-center justify-center gap-1.5 px-4 py-2.5 cursor-pointer list-none text-xs font-medium text-[#248179] bg-white hover:bg-[#faf7f2] border border-[#efe9e0] rounded-xl transition-colors select-none">
                  <span className="group-open:hidden">Show all {claims.length} claims</span>
                  <span className="hidden group-open:inline">Show fewer</span>
                  <ChevronDown size={12} className="transition-transform group-open:rotate-180 flex-shrink-0" />
                </summary>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {rest.map((c, i) => <ClaimCard key={i} c={c} />)}
                </div>
              </details>
            )}
          </section>
        )}

        {/* 5. Ingredient list */}
        {review.inciIngredients && review.inciIngredients.length > 0 && (
          <section>
            <SectionHead title="Ingredient list" sub={`${review.inciIngredients.length} ingredients · INCI order · position reflects approximate concentration`} />
            <div className="bg-white rounded-2xl border border-[#efe9e0] overflow-hidden">
              <div className="p-4 sm:p-5 flex flex-wrap gap-1.5">
                {review.inciIngredients.slice(0, 12).map((ing) => (
                  <span key={ing} className="text-[10px] px-2 py-1 rounded-full bg-[#faf7f2] border border-[#efe9e0] text-[#282828]/75">{ing}</span>
                ))}
              </div>
              {review.inciIngredients.length > 12 && (
                <details className="group">
                  <summary className="flex items-center justify-center gap-1.5 px-4 py-2.5 cursor-pointer list-none text-xs font-medium text-[#248179] hover:bg-[#faf7f2] border-t border-[#efe9e0] transition-colors select-none">
                    <span className="group-open:hidden">Show all {review.inciIngredients.length} ingredients</span>
                    <span className="hidden group-open:inline">Show fewer</span>
                    <ChevronDown size={12} className="transition-transform group-open:rotate-180 flex-shrink-0" />
                  </summary>
                  <div className="p-4 sm:p-5 pt-2 flex flex-wrap gap-1.5 border-t border-[#efe9e0]">
                    {review.inciIngredients.slice(12).map((ing) => (
                      <span key={ing} className="text-[10px] px-2 py-1 rounded-full bg-[#faf7f2] border border-[#efe9e0] text-[#282828]/75">{ing}</span>
                    ))}
                  </div>
                </details>
              )}
            </div>
            {review.inciSourceUrl && (
              <p className="text-[10px] text-[#b0a8a4] mt-2">Source: {review.inciSourceUrl}</p>
            )}
          </section>
        )}

        {/* 6. Regulatory screen */}
        {regulatoryRows.length > 0 && (
          <section>
            <SectionHead title="Regulatory screen" sub="ASCI advertising code and the India drug-cosmetic boundary." />
            <div className="bg-white rounded-2xl border border-[#efe9e0] overflow-hidden divide-y divide-[#efe9e0]">
              {regulatoryRows.map((c, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-[#fd6158] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#282828]">&ldquo;{c.text}&rdquo;</p>
                    <p className="text-[10px] text-[#282828]/60 mt-0.5">{c.drugBoundaryNote || c.asciNote}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Price & platform parity */}
        {review.priceAcrossPlatforms?.length > 0 && (
          <section>
            <SectionHead title="Price & platform parity" sub={review.lowestPrice ? `Lowest found: ${review.lowestPrice}` : undefined} />
            <div className="bg-white rounded-2xl border border-[#efe9e0] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#faf7f2] border-b border-[#efe9e0]">
                    <th className="py-2 px-4 text-[10px] font-medium text-[#b0a8a4] uppercase tracking-wider">Platform</th>
                    <th className="py-2 px-4 text-[10px] font-medium text-[#b0a8a4] uppercase tracking-wider">Price</th>
                    <th className="py-2 px-4 text-[10px] font-medium text-[#b0a8a4] uppercase tracking-wider hidden sm:table-cell">Per ml</th>
                  </tr>
                </thead>
                <tbody>
                  {review.priceAcrossPlatforms.map((p, i) => (
                    <tr key={i} className="border-b border-[#efe9e0] last:border-0">
                      <td className="py-2 px-4 text-xs text-[#282828]">{p.platform}</td>
                      <td className="py-2 px-4 text-xs text-[#282828]">{p.price ?? "n/a"}</td>
                      <td className="py-2 px-4 text-xs text-[#b0a8a4] hidden sm:table-cell">{p.pricePerMl ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(review.platformParity?.issues?.length ?? 0) > 0 && (
                <div className="px-4 py-3 bg-[#faf7f2] border-t border-[#efe9e0] space-y-1">
                  {review.platformParity.issues.map((x, i) => (
                    <p key={i} className="text-[10px] text-[#282828]/60">· {x}</p>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 8. Who it's for */}
        {suit && (
          <section>
            <SectionHead title="Who it's for" />
            <div className="bg-white rounded-2xl border border-[#efe9e0] p-4 sm:p-5">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-4">
                <div className="space-y-1.5">
                  {suit.bestFor?.map((x, i) => (
                    <p key={i} className="flex gap-2 text-xs text-[#282828]/75"><span className="text-[#248179] flex-shrink-0">✓</span>{x}</p>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {suit.avoidIf?.map((x, i) => (
                    <p key={i} className="flex gap-2 text-xs text-[#282828]/75"><span className="text-[#fd6158] flex-shrink-0">!</span>{x}</p>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 pt-3 border-t border-[#efe9e0]">
                {[
                  ["Routine", suit.routineFit],
                  ["Sensitivity", suit.sensitivityRisk],
                  ["Right away", suit.immediateExpectation],
                  ["Over time", suit.longTermExpectation],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] uppercase tracking-wider text-[#b0a8a4]">{k}</p>
                    <p className="text-xs text-[#282828]/70 leading-relaxed mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 9. What would improve this */}
        {improve.length > 0 && (
          <section>
            <SectionHead title="What would strengthen this review" sub="Claims where finished-product proof isn't publicly visible yet." />
            <div className="bg-[#faf7f2] rounded-2xl border border-[#efe9e0] p-4 sm:p-5 space-y-1.5">
              {improve.map((c, i) => (
                <p key={i} className="text-xs text-[#282828]/70">· Publish finished-product evidence for &ldquo;{c.text.slice(0, 90)}{c.text.length > 90 ? "…" : ""}&rdquo;</p>
              ))}
            </div>
          </section>
        )}

        {/* 10. Brand CTA */}
        <section>
          <div className="bg-[#282828] rounded-2xl p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#80d5cc]">For the brand behind this product</p>
            <h3 className="text-lg text-[#fcf9f8] mt-2" style={COOPER}>Whether this review is what you hoped for or not, we are on your side.</h3>
            <p className="text-xs text-[#b0a8a4] leading-relaxed mt-2 max-w-2xl">
              The Clean Sheet helps brands stand behind every claim with the right testing, evidence and validation,
              so what you promise is exactly what you can prove. If you would like to strengthen this product&apos;s
              claims, or get your next launch verified from day one, we would love to help.
            </p>
            <OpenFormButton className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs text-white bg-[#fd6158] hover:opacity-90 transition-opacity">
              Work with The Clean Sheet <span aria-hidden>→</span>
            </OpenFormButton>
          </div>
        </section>

        {/* Methodology note */}
        {review.cleanSheetNote && (
          <p className="text-[10px] text-[#b0a8a4] leading-relaxed">{review.cleanSheetNote}</p>
        )}
      </div>
    </div>
  );
}
