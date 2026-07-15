"use client";

/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Review
   Product Review engine (TCS v3.0) rendered Evidence-First Editorial:
   light canvas, dark verdict sheet. Approved / Not-approved verdict,
   full claim map, price parity, formula logic, consumer suitability.
──────────────────────────────────────────────────────────────── */

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, Stagger, Item } from "@/components/motion/Motion";
import type {
  ProductReview, DerivedVerdict, ClaimAnalysis, EvidenceLevel,
} from "@/lib/product-review-types";
import type { VerifiedProduct } from "@/lib/types";

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* ─── Palette ─── */
const INK = "#282828";
const CREAM = "#fcf9f8";
const TEAL = "#248179";
const TEAL_SOFT = "#80d5cc";
const CORAL = "#fd6158";
const LIME = "#d2ff34";
const WARM = "#b0a8a4";
const HAIR_DARK = "rgba(252,249,248,0.14)";
const HAIR_LIGHT = "rgba(40,40,40,0.15)";

const SUGGESTIONS = [
  "La Roche-Posay Mela B3 Serum",
  "Minimalist 10% Niacinamide Serum",
  "Mamaearth Vitamin C Face Wash",
  "WOW Skin Science Onion Shampoo",
];

const STEPS = [
  "Pulling the real ingredient list",
  "Mapping price across Nykaa, Amazon, Flipkart",
  "Extracting every marketing claim",
  "Grading each claim on the 1–7 evidence ladder",
  "Checking ASCI + India drug-boundary rules",
  "Reading the formula logic",
  "Writing your verdict",
];

/* ─── Claim risk styling ─── */
const RISK_META: Record<ClaimAnalysis["riskLevel"], { label: string; color: string }> = {
  "low":       { label: "Low risk",       color: TEAL },
  "medium":    { label: "Medium risk",    color: "#c9a227" },
  "high":      { label: "High risk",      color: CORAL },
  "very-high": { label: "Very high risk", color: CORAL },
  "red-flag":  { label: "Red flag",       color: CORAL },
};

function evidenceLabel(l: EvidenceLevel): string {
  const map: Record<number, string> = {
    1: "No proof found", 2: "Ingredient research only", 3: "Ingredient % disclosed",
    4: "Finished-product tested", 5: "Third-party lab tested", 6: "Clinical study", 7: "Published study",
  };
  return `L${l} · ${map[l] ?? ""}`;
}

/* ─── Branded monogram fallback (no image key / not found) ─── */
function ProductImage({ src, brand }: { src?: string | null; brand: string }) {
  const initial = (brand || "?").trim().charAt(0).toUpperCase();
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={brand} className="w-full h-full object-cover" />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: INK }}>
      <span className="font-display" style={{ color: CREAM, fontSize: "3rem" }}>{initial}</span>
    </div>
  );
}

export default function ReviewPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [review, setReview] = useState<ProductReview | null>(null);
  const [verdict, setVerdict] = useState<DerivedVerdict | null>(null);
  const [error, setError] = useState<null | "scope" | "busy" | "fail">(null);
  const [approvedProducts, setApprovedProducts] = useState<VerifiedProduct[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load the approved registry (reloads after a review, in case one just joined).
  useEffect(() => {
    fetch("/api/verified-products")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d?.products)) setApprovedProducts(d.products); })
      .catch(() => { /* section stays hidden */ });
  }, [review]);

  const analyze = useCallback(async (q?: string) => {
    const text = (q ?? query).trim();
    if (!text || loading) return;
    setLoading(true); setError(null); setReview(null); setVerdict(null); setStepIdx(0);

    const ticker = setInterval(() => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1)), 6000);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (res.status === 503 || data?.error === "busy") { setError("busy"); return; }
      if (data?.type === "product-review" && data.review) {
        setReview(data.review as ProductReview);
        setVerdict((data.verdict as DerivedVerdict) ?? null);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      } else if (data?.type === "out_of_scope") {
        setError("scope");
      } else {
        setError("fail");
      }
    } catch {
      setError("fail");
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  }, [query, loading]);

  const approved = verdict?.status === "approved";

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      {/* ═══ Hero + input ═══ */}
      <section className="relative overflow-hidden">
        {/* Creative, dropper fading seamlessly into the canvas (static, no scale) */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[40%]" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/creatives/dropper-drop.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${CREAM} 0%, rgba(252,249,248,0.78) 34%, rgba(252,249,248,0.12) 80%)` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${CREAM} 0%, rgba(252,249,248,0) 22%)` }} />
        </div>

        <div className="relative max-w-[1100px] mx-auto px-4 md:px-16 pt-16 md:pt-24 pb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: TEAL }}>
              The Clean Sheet · Product Review
            </p>
            <h1 className="font-display mt-6 text-[40px] md:text-[58px] leading-[1.05] tracking-[-0.02em]" style={{ color: INK }}>
              Does it prove<br />what it promises?
            </h1>
            <p className="mt-6 text-[17px] leading-[1.6] max-w-xl" style={{ color: "#6b6764" }}>
              Paste a product name or link. Every marketing claim is checked against real evidence and the
              actual ingredient list, then the formula itself. One clear <em>Approved / Not Approved</em> verdict.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
          >
            <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") analyze(); }}
                placeholder="e.g. La Roche-Posay Mela B3 Serum"
                disabled={loading}
                className="flex-1 rounded-full px-6 py-4 text-[16px] outline-none"
                style={{ background: "#fff", border: `1px solid ${HAIR_LIGHT}`, color: INK }}
              />
              <button
                onClick={() => analyze()}
                disabled={loading || !query.trim()}
                className="rounded-full px-8 py-4 text-[16px] text-white transition-opacity disabled:opacity-50"
                style={{ background: CORAL }}
              >
                {loading ? "Reviewing…" : "Review"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => { setQuery(s); analyze(s); }} disabled={loading}
                  className="text-[13px] px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
                  style={{ border: `1px solid ${HAIR_LIGHT}`, color: "#6b6764" }}>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Approved products showcase ═══ */}
      {approvedProducts.length > 0 && !review && !loading && (
        <section className="max-w-[1100px] mx-auto px-4 md:px-16 pb-14">
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <h2 className="font-display text-[26px] md:text-[34px]" style={{ color: INK }}>Clean Sheet Approved</h2>
            <Link href="/verified" className="text-[13px] uppercase flex-shrink-0" style={{ letterSpacing: "0.08em", color: TEAL }}>
              View all approved →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {approvedProducts.slice(0, 8).map((p) => (
              <Link key={p.slug} href="/verified" className="group rounded-2xl overflow-hidden block" style={{ border: `1px solid ${HAIR_LIGHT}` }}>
                <div className="aspect-square overflow-hidden">
                  <ProductImage src={p.imageUrl} brand={p.brand} />
                </div>
                <div className="p-3">
                  <p className="text-[13px] leading-tight line-clamp-2" style={{ color: INK }}>{p.productName}</p>
                  <p className="mt-1 text-[11px] uppercase" style={{ letterSpacing: "0.06em", color: TEAL }}>Approved · {p.score}/100</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ Loading ═══ */}
      {loading && (
        <div className="max-w-[1100px] mx-auto px-4 md:px-16 py-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: TEAL }} />
            <p className="text-[15px]" style={{ color: INK }}>{STEPS[stepIdx]}…</p>
          </div>
          <div className="mt-4 h-[2px] w-full overflow-hidden" style={{ background: HAIR_LIGHT }}>
            <div className="h-full transition-all duration-700" style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%`, background: TEAL }} />
          </div>
        </div>
      )}

      {/* ═══ Errors ═══ */}
      {error && !loading && (
        <div className="max-w-[1100px] mx-auto px-4 md:px-16 py-10">
          <p className="text-[16px]" style={{ color: INK }}>
            {error === "busy" ? "The engine is at capacity. Please try again in a minute."
              : error === "scope" ? "That doesn't look like a beauty or personal-care product."
              : "Couldn't complete the review. Please try again."}
          </p>
        </div>
      )}

      {/* ═══ Results ═══ */}
      {review && !loading && (
        <div ref={resultsRef}>
          {/* Verdict sheet (dark) */}
          <section style={{ background: INK }}>
            <div className="max-w-[1100px] mx-auto px-4 md:px-16 py-16 md:py-20">
              <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden flex-shrink-0" style={{ border: `1px solid ${HAIR_DARK}` }}>
                  <ProductImage src={review.imageUrl} brand={review.brand} />
                </div>
                <div>
                  <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: TEAL_SOFT }}>{review.brand}{review.category ? ` · ${review.category}` : ""}</p>
                  <h2 className="font-display mt-3 text-[30px] md:text-[42px] leading-[1.08]" style={{ color: CREAM }}>{review.productName}</h2>
                  {review.heroPromise && <p className="mt-3 text-[16px]" style={{ color: WARM }}>“{review.heroPromise}”</p>}

                  <div className="mt-8 inline-flex items-center gap-4 rounded-full pl-5 pr-6 py-3" style={{ background: approved ? "rgba(210,255,52,0.12)" : "rgba(253,97,88,0.12)", border: `1px solid ${approved ? LIME : CORAL}` }}>
                    <span className="text-[22px]">{approved ? "✓" : "✗"}</span>
                    <div>
                      <p className="font-display text-[22px] leading-none" style={{ color: approved ? LIME : CORAL }}>{approved ? "Clean Sheet Approved" : "Not Approved"}</p>
                      <p className="text-[13px] mt-1" style={{ color: WARM }}>{verdict?.headline}</p>
                    </div>
                  </div>

                  {/* Gates */}
                  <Stagger className="mt-8 grid sm:grid-cols-3 gap-4" gap={0.1}>
                    {(verdict?.gates ?? []).map((g) => (
                      <Item key={g.id} className="pt-4" style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
                        <p className="text-[13px] flex items-center gap-2" style={{ color: g.passed ? LIME : CORAL }}>
                          <span>{g.passed ? "✓" : "✗"}</span>{g.label}
                        </p>
                        <p className="mt-1.5 text-[13px] leading-[1.5]" style={{ color: WARM }}>{g.detail}</p>
                      </Item>
                    ))}
                  </Stagger>

                  {/* Score + methodology */}
                  <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-display text-[40px]" style={{ color: CREAM }}>{review.scores.total}</span>
                    <span className="text-[14px]" style={{ color: WARM }}>/ 100 · {review.scores.label}</span>
                    <span className="text-[12px] ml-auto" style={{ color: "rgba(176,168,164,0.6)" }}>{review.methodologyVersion ?? "TCS v3.0"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Body sections (light) */}
          <div className="max-w-[1100px] mx-auto px-4 md:px-16 py-16 md:py-20 space-y-20">

            {/* Consumer suitability — surfaced first, right after the verdict */}
            {review.consumerSuitability && (
              <Section title="Who it's for">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[13px] uppercase mb-2" style={{ letterSpacing: "0.08em", color: TEAL }}>Best for</p>
                    <ul className="space-y-1.5">{review.consumerSuitability.bestFor?.map((x, i) => <li key={i} className="text-[15px]" style={{ color: "#4a4644" }}>{x}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-[13px] uppercase mb-2" style={{ letterSpacing: "0.08em", color: CORAL }}>Approach with care</p>
                    <ul className="space-y-1.5">{review.consumerSuitability.avoidIf?.map((x, i) => <li key={i} className="text-[15px]" style={{ color: "#4a4644" }}>{x}</li>)}</ul>
                  </div>
                </div>
                <div className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[14px]" style={{ color: "#6b6764" }}>
                  {review.consumerSuitability.routineFit && <p><span style={{ color: "#8b8683" }}>Routine · </span>{review.consumerSuitability.routineFit}</p>}
                  {review.consumerSuitability.sensitivityRisk && <p><span style={{ color: "#8b8683" }}>Sensitivity · </span>{review.consumerSuitability.sensitivityRisk}</p>}
                  {review.consumerSuitability.immediateExpectation && <p><span style={{ color: "#8b8683" }}>Right away · </span>{review.consumerSuitability.immediateExpectation}</p>}
                  {review.consumerSuitability.longTermExpectation && <p><span style={{ color: "#8b8683" }}>Over time · </span>{review.consumerSuitability.longTermExpectation}</p>}
                </div>
              </Section>
            )}

            {/* Claim map */}
            <Section title="The claim sheet" kicker={`${review.claimMap.length} claims checked`}>
              <Stagger className="space-y-0" gap={0.06}>
                {review.claimMap.map((c, i) => (
                  <Item key={i} className="py-6 grid md:grid-cols-[1fr_auto] gap-4 md:gap-8" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
                    <div>
                      <p className="text-[17px] leading-[1.4]" style={{ color: INK }}>“{c.text}”</p>
                      <p className="mt-1.5 text-[13px]" style={{ color: "#8b8683" }}>{c.source}{c.primaryType ? ` · ${c.primaryType}` : ""}</p>
                      {c.evidenceNote && <p className="mt-2.5 text-[14px] leading-[1.6]" style={{ color: "#6b6764" }}>{c.evidenceNote}</p>}
                      {c.asciConcern && c.asciNote && <p className="mt-2 text-[13px]" style={{ color: CORAL }}>ASCI: {c.asciNote}</p>}
                      {c.drugBoundaryRisk && c.drugBoundaryNote && <p className="mt-2 text-[13px]" style={{ color: CORAL }}>Drug boundary: {c.drugBoundaryNote}</p>}
                    </div>
                    <div className="md:text-right flex-shrink-0">
                      <span className="text-[12px] uppercase" style={{ letterSpacing: "0.08em", color: RISK_META[c.riskLevel]?.color ?? INK }}>{RISK_META[c.riskLevel]?.label ?? c.riskLevel}</span>
                      <p className="mt-1 text-[12px]" style={{ color: "#8b8683" }}>{evidenceLabel(c.evidenceLevel)}</p>
                    </div>
                  </Item>
                ))}
              </Stagger>
            </Section>

            {/* Price across platforms */}
            {review.priceAcrossPlatforms?.length > 0 && (
              <Section title="Price across platforms" kicker={review.lowestPrice ? `Lowest: ${review.lowestPrice}` : undefined}>
                <div className="overflow-x-auto">
                  <table className="w-full text-[15px]" style={{ color: INK }}>
                    <tbody>
                      {review.priceAcrossPlatforms.map((p, i) => (
                        <tr key={i} style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
                          <td className="py-3 pr-4">{p.platform}</td>
                          <td className="py-3 pr-4 whitespace-nowrap">{p.price ?? "n/a"}</td>
                          <td className="py-3 pr-4 whitespace-nowrap" style={{ color: "#8b8683" }}>{p.pricePerMl ?? ""}</td>
                          <td className="py-3 text-[13px]" style={{ color: "#8b8683" }}>{p.note ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {review.priceInsight && <p className="mt-4 text-[15px] leading-[1.6]" style={{ color: "#6b6764" }}>{review.priceInsight}</p>}
              </Section>
            )}

            {/* Ingredient transparency */}
            {review.ingredientTransparency && (
              <Section title="Ingredient transparency" kicker={`${review.ingredientTransparency.score}/5 · ${review.ingredientTransparency.label}`}>
                {review.ingredientTransparency.issues?.length > 0 && (
                  <ul className="space-y-2">
                    {review.ingredientTransparency.issues.map((x, i) => (
                      <li key={i} className="text-[15px] flex gap-2" style={{ color: "#6b6764" }}><span style={{ color: CORAL }}>·</span>{x}</li>
                    ))}
                  </ul>
                )}
              </Section>
            )}

            {/* Formula logic */}
            {review.formulaLogic && (
              <Section title="Formula logic">
                {review.formulaLogic.claimOverreach && review.formulaLogic.claimOverreachNote && (
                  <p className="text-[15px] mb-3" style={{ color: CORAL }}>Claim overreach: {review.formulaLogic.claimOverreachNote}</p>
                )}
                <p className="text-[16px] leading-[1.7]" style={{ color: "#4a4644" }}>{review.formulaLogic.note}</p>
                {review.formulaLogic.irritancyConcerns?.length > 0 && (
                  <p className="mt-3 text-[14px]" style={{ color: "#8b8683" }}>Watch: {review.formulaLogic.irritancyConcerns.join(", ")}</p>
                )}
              </Section>
            )}

            {/* Platform parity */}
            {review.platformParity && (review.platformParity.issues?.length > 0 || review.platformParity.amplificationPattern) && (
              <Section title="Platform parity" kicker={review.platformParity.consistent ? "Consistent" : "Inconsistent"}>
                {review.platformParity.amplificationPattern && <p className="text-[15px] leading-[1.6] mb-3" style={{ color: CORAL }}>{review.platformParity.amplificationPattern}</p>}
                {review.platformParity.issues?.length > 0 && (
                  <ul className="space-y-2">
                    {review.platformParity.issues.map((x, i) => <li key={i} className="text-[15px] flex gap-2" style={{ color: "#6b6764" }}><span style={{ color: "#8b8683" }}>·</span>{x}</li>)}
                  </ul>
                )}
              </Section>
            )}

            {/* Disclaimer */}
            {review.cleanSheetNote && (
              <p className="text-[13px] leading-[1.7] pt-8" style={{ color: "#8b8683", borderTop: `1px solid ${HAIR_LIGHT}` }}>{review.cleanSheetNote}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Section shell ─── */
function Section({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <section>
      <Reveal>
        <div className="flex items-baseline justify-between gap-4 mb-6">
          <h3 className="font-display text-[26px] md:text-[32px]" style={{ color: INK }}>{title}</h3>
          {kicker && <span className="text-[13px] uppercase flex-shrink-0" style={{ letterSpacing: "0.08em", color: TEAL }}>{kicker}</span>}
        </div>
      </Reveal>
      {children}
    </section>
  );
}
