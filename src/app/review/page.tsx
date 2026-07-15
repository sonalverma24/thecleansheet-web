"use client";

/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ — Review
   Evidence-First Editorial. Light canvas, dark verdict sheet.
   Hierarchy through scale, colour and space — never weight.
──────────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GuidanceBlock, VerifiedList } from "@/components/VerifiedList";
import type { Scorecard, ChatMessage, ComparisonResult, ExpertAnswer, ClaimCheckResult, CheckedClaim, VerifiedProduct, FinalVerdict } from "@/lib/types";

/* ─── Palette (brand tokens) ─── */
const INK = "#282828";          // charcoal — dark canvas
const CREAM = "#fcf9f8";        // light text on dark
const TEAL = "#248179";
const TEAL_SOFT = "#80d5cc";    // teal for dark backgrounds
const CORAL = "#fd6158";
const LIME = "#d2ff34";
const WARM = "#b0a8a4";
const HAIR_DARK = "rgba(252,249,248,0.14)";  // hairline on dark
const HAIR_LIGHT = "rgba(40,40,40,0.15)";    // hairline on light

/* ─── Helpers ─── */
function uid() { return Math.random().toString(36).slice(2); }

function looksLikeComparison(t: string): boolean {
  const q = t.toLowerCase();
  return q.includes(" vs ") || q.includes(" versus ") || q.includes("compare")
    || q.includes("better than") || q.includes("which is better") || q.includes("which one is")
    || /better.{1,80}\bor\b/i.test(t) || /\bor\b.{1,80}better/i.test(t);
}
function looksLikeQuestion(t: string): boolean {
  const q = t.toLowerCase().trim();
  if (/^https?:\/\//.test(q)) return false;
  const starters = ["is ", "are ", "does ", "do ", "can ", "should ", "what ", "why ", "how ", "tell me about", "explain", "which "];
  return starters.some((s) => q.startsWith(s)) || q.endsWith("?");
}

const CLAIM_STEPS = [
  "Reading the label and product page",
  "Extracting every marketing claim",
  "Searching for evidence: studies, certificates, registries",
  "Grading each claim against TCS evidence standards",
];
const SCAN_STEPS = [
  "Finding the full ingredient list",
  "Reading the science, not the marketing",
  "Checking EU, India and global regulations",
  "Running the six-pillar framework",
  "Writing your verdict",
];

const SUGGESTIONS = [
  "Minimalist 10% Niacinamide Serum",
  "Cetaphil vs CeraVe for oily skin",
  "Is DMDM Hydantoin safe?",
  "Mamaearth Vitamin C Face Wash",
];

/* ─── Verdict styling — brand colours only ─── */
const VERDICT_META: Record<CheckedClaim["verdict"], { label: string; color: string; solid?: boolean }> = {
  verified:      { label: "Verified",          color: LIME },
  qualified:     { label: "Partial evidence",  color: TEAL_SOFT },
  unverified:    { label: "No evidence found", color: CORAL },
  not_permitted: { label: "Not permitted",     color: CORAL, solid: true },
};

function scoreColorDark(s: number) {
  if (s >= 70) return LIME;
  if (s >= 45) return TEAL_SOFT;
  return CORAL;
}

/* ─── The Verdict Panel — one standard, three gates, shown working ─── */
const VERDICT_STATUS_META: Record<FinalVerdict["status"], { word: string; color: string; note: string }> = {
  verified:     { word: "Verified",     color: LIME,  note: "Meets The Clean Sheet Standard. Listed under Verified Products." },
  not_verified: { word: "Not Verified", color: CORAL, note: "Does not meet The Clean Sheet Standard. The failed gate below explains why." },
  provisional:  { word: "Pending",      color: WARM,  note: "The claim layer could not run — nothing is Verified without its claims checked. Run the review again for the full verdict." },
};

function VerdictPanel({ verdict }: { verdict: FinalVerdict }) {
  const meta = VERDICT_STATUS_META[verdict.status];
  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10">
        <div>
          <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: TEAL_SOFT }}>
            The Clean Sheet Verdict
          </p>
          <p className="font-display mt-4 leading-none text-[56px] md:text-[80px] flex items-center gap-5" style={{ color: meta.color }}>
            <span className="inline-block w-[14px] h-[14px] rounded-full flex-shrink-0" style={{ background: meta.color }} />
            {meta.word}
          </p>
        </div>
        <p className="max-w-sm text-[14px] leading-[1.7] md:text-right md:pb-2" style={{ color: WARM }}>
          {meta.note}
        </p>
      </div>

      {/* The three gates — the standard, applied in the open */}
      <div>
        {verdict.gates.map((g, i) => {
          const gcol = g.passed === null ? WARM : g.passed ? LIME : CORAL;
          const glabel = g.passed === null ? "Not assessed" : g.passed ? "Passed" : "Failed";
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
              className="py-4 grid md:grid-cols-[60px_220px_140px_1fr] gap-2 md:gap-8 items-baseline"
              style={{ borderTop: `1px solid ${HAIR_DARK}` }}
            >
              <p className="text-[13px]" style={{ color: TEAL_SOFT }}>{String(i + 1).padStart(2, "0")}</p>
              <p className="text-[16px]" style={{ color: CREAM }}>{g.label}</p>
              <p className="text-[12px] uppercase flex items-center gap-2.5" style={{ letterSpacing: "0.1em", color: gcol }}>
                <StatusDot color={gcol} solid={g.passed !== null} />{glabel}
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: WARM }}>{g.detail}</p>
            </motion.div>
          );
        })}
        <div style={{ borderTop: `1px solid ${HAIR_DARK}` }} />
        <p className="pt-4 text-[12px] uppercase" style={{ letterSpacing: "0.1em", color: WARM }}>
          {verdict.standard}
        </p>
      </div>
    </div>
  );
}

/* ─── Editorial primitives ─── */
function Eyebrow({ children, color = WARM }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="text-[12px] uppercase" style={{ color, letterSpacing: "0.14em" }}>
      {children}
    </p>
  );
}

function StatusDot({ color, solid = true }: { color: string; solid?: boolean }) {
  return (
    <span
      className="inline-block w-[6px] h-[6px] rounded-full flex-shrink-0"
      style={solid ? { background: color } : { border: `1px solid ${color}` }}
    />
  );
}

const rise = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
};

/* ─── Claim row (dark sheet) ─── */
function ClaimRow({ claim, index }: { claim: CheckedClaim; index: number }) {
  const [open, setOpen] = useState(false);
  const meta = VERDICT_META[claim.verdict] ?? VERDICT_META.unverified;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4), ease: [0.25, 0.1, 0.25, 1] }}
      style={{ borderTop: `1px solid ${HAIR_DARK}` }}
    >
      <button onClick={() => setOpen(!open)} className="w-full text-left py-5 group">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-3 min-w-0">
            <span className="mt-[9px]"><StatusDot color={meta.color} solid={claim.verdict !== "unverified"} /></span>
            <p className="text-[17px] leading-relaxed" style={{ color: CREAM }}>
              &ldquo;{claim.claim}&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0 pt-1">
            {meta.solid ? (
              <span className="text-[11px] uppercase px-3 py-1 rounded-full" style={{ letterSpacing: "0.1em", background: meta.color, color: INK }}>
                {meta.label}
              </span>
            ) : (
              <span className="text-[11px] uppercase" style={{ letterSpacing: "0.1em", color: meta.color }}>
                {meta.label}
              </span>
            )}
            <span className="text-[18px] leading-none transition-transform duration-300" style={{ color: WARM, transform: open ? "rotate(45deg)" : "none", display: "inline-block" }}>+</span>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="pl-[18px] pt-3 pb-1 flex flex-col gap-3 max-w-2xl">
                <p className="text-[15px] leading-relaxed" style={{ color: WARM }}>{claim.explanation}</p>
                <div className="text-[13px] leading-relaxed" style={{ color: WARM }}>
                  <span className="uppercase text-[11px]" style={{ letterSpacing: "0.1em", color: meta.color }}>What we found · </span>
                  {claim.evidence}
                  {claim.source && claim.source !== "none" && <span> · {claim.source}</span>}
                </div>
                {claim.verdict !== "not_permitted" && (
                  <p className="text-[12px] uppercase" style={{ letterSpacing: "0.1em", color: WARM }}>
                    Evidence level {claim.evidenceLevel === "D" || claim.evidenceLevel === "none" ? "none" : claim.evidenceLevel} · required {claim.requiredLevel}
                  </p>
                )}
                {claim.regulatoryNote && (
                  <p className="text-[14px] leading-relaxed" style={{ color: CORAL }}>{claim.regulatoryNote}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

/* ─── Claim Sheet (dark) ─── */
function ClaimSheet({ result }: { result: ClaimCheckResult }) {
  const counts = result.verdictCounts;
  const col = scoreColorDark(result.integrityScore);
  const checkedDate = new Date(result.checkedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      {/* Masthead */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12">
        <div className="max-w-xl">
          <Eyebrow color={TEAL_SOFT}>Layer 1 · The Claim Sheet</Eyebrow>
          <div className="mt-6 flex items-start gap-6">
            {result.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.imageUrl}
                alt={result.productName}
                className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-2xl flex-shrink-0"
                style={{ border: `1px solid ${HAIR_DARK}`, background: "rgba(252,249,248,0.04)" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex-shrink-0 flex items-center justify-center"
                style={{ border: `1px solid ${HAIR_DARK}`, background: "rgba(252,249,248,0.04)" }}
                aria-hidden
              >
                <span className="font-display text-[40px] md:text-[48px] leading-none" style={{ color: TEAL_SOFT }}>
                  {(result.brand || result.productName || "?").trim().charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              {result.brand && <p className="text-[14px] uppercase" style={{ letterSpacing: "0.1em", color: WARM }}>{result.brand}</p>}
              <h2 className="font-display mt-2 text-[32px] md:text-[40px] leading-[1.15]" style={{ color: CREAM }}>
                {result.productName}
              </h2>
            </div>
          </div>
        </div>
        <div className="pb-1">
          <p className="text-[12px] uppercase pb-3" style={{ letterSpacing: "0.14em", color: WARM }}>Claim integrity · feeds the marketing gates</p>
          <p className="font-display leading-none text-[36px] md:text-[44px]" style={{ color: col }}>
            {result.integrityLabel}
          </p>
        </div>
      </div>

      {/* Verdict tally */}
      <div className="flex flex-wrap gap-x-8 gap-y-3 pb-10">
        {([
          ["verified", counts.verified],
          ["qualified", counts.qualified],
          ["unverified", counts.unverified],
          ["not_permitted", counts.not_permitted],
        ] as const).filter(([, n]) => n > 0).map(([k, n]) => {
          const m = VERDICT_META[k];
          return (
            <span key={k} className="flex items-center gap-2.5 text-[13px] uppercase" style={{ letterSpacing: "0.1em", color: WARM }}>
              <StatusDot color={m.color} solid={k !== "unverified"} />
              {n} {m.label}
            </span>
          );
        })}
      </div>

      {/* Summary */}
      <p className="max-w-2xl text-[18px] leading-[1.7] pb-12" style={{ color: CREAM }}>
        {result.summary}
      </p>

      {/* Red flags */}
      {result.redFlags?.length > 0 && (
        <div className="pb-12">
          <Eyebrow color={CORAL}>Red flags</Eyebrow>
          <div className="mt-4 flex flex-col gap-2">
            {result.redFlags.map((f, i) => (
              <p key={i} className="text-[16px] leading-relaxed flex items-baseline gap-3" style={{ color: CREAM }}>
                <StatusDot color={CORAL} /> {f}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Claims */}
      {result.claims.length > 0 ? (
        <div>
          <div className="flex items-baseline justify-between pb-4">
            <Eyebrow>Every claim this product makes</Eyebrow>
            <span className="text-[13px]" style={{ color: WARM }}>{result.claims.length} found</span>
          </div>
          {result.claims.map((c, i) => <ClaimRow key={i} claim={c} index={i} />)}
          <div style={{ borderTop: `1px solid ${HAIR_DARK}` }} />
        </div>
      ) : (
        <p className="text-[16px]" style={{ color: WARM }}>No discernible marketing claims found for this product.</p>
      )}

      <p className="pt-8 text-[12px] leading-relaxed" style={{ color: WARM }}>
        Checked {checkedDate} · {result.methodologyVersion} · Verdicts are computed from public evidence.
        A claim without locatable proof is marked accordingly, never assumed true.
      </p>
    </div>
  );
}

/* ─── Pillar row (dark) — qualitative, no numerals ─── */
function pillarStatus(pct: number): { word: string; col: string } {
  if (pct >= 80) return { word: "Strong", col: LIME };
  if (pct >= 50) return { word: "Adequate", col: TEAL_SOFT };
  return { word: "Weak", col: CORAL };
}

function PillarRow({ name, score, max, note, index }: { name: string; score: number; max: number; note?: string; index: number }) {
  const pct = Math.round((score / max) * 100);
  const { word, col } = pillarStatus(pct);
  return (
    <motion.div {...rise} transition={{ ...rise.transition, delay: Math.min(index * 0.05, 0.3) }} className="py-5" style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
      <div className="flex items-baseline justify-between gap-6 pb-3">
        <p className="text-[16px]" style={{ color: CREAM }}>{name}</p>
        <p className="text-[12px] uppercase flex items-center gap-2.5 flex-shrink-0" style={{ letterSpacing: "0.1em", color: col }}>
          <StatusDot color={col} />{word}
        </p>
      </div>
      <div className="h-px w-full" style={{ background: HAIR_DARK }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="h-[3px] -translate-y-[1px]"
          style={{ background: col }}
        />
      </div>
      {note && <p className="pt-3 text-[13px] leading-relaxed max-w-2xl" style={{ color: WARM }}>{note}</p>}
    </motion.div>
  );
}

/* ─── Deep scan (dark) — layer 2, feeds the formula gate ─── */
function DeepScan({ card, verdictStatus }: { card: Scorecard; verdictStatus?: FinalVerdict["status"] }) {
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [openIngredient, setOpenIngredient] = useState<number | null>(null);
  const ingredients = card.ingredients || [];
  const visible = showAllIngredients ? ingredients : ingredients.slice(0, 8);
  const formulaPass = card.score >= 75;
  const flagColor = (f: string) => f === "warn" ? CORAL : f === "info" ? TEAL_SOFT : LIME;

  return (
    <div className="pt-24">
      {/* Masthead — layer status, the verdict lives in the panel above */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-6">
        <div className="max-w-xl">
          <Eyebrow color={TEAL_SOFT}>Layer 2 · The deep scan · six pillars</Eyebrow>
          <h3 className="font-display mt-4 text-[28px] md:text-[34px] leading-[1.2]" style={{ color: CREAM }}>
            Inside the formula
          </h3>
        </div>
        <div className="pb-1">
          <p className="text-[12px] uppercase pb-3" style={{ letterSpacing: "0.14em", color: WARM }}>Formula safety gate</p>
          <p className="text-[16px] uppercase flex items-center gap-3" style={{ letterSpacing: "0.1em", color: formulaPass ? LIME : CORAL }}>
            <StatusDot color={formulaPass ? LIME : CORAL} />{formulaPass ? "Passed" : "Failed"}
          </p>
        </div>
      </div>

      <p className="max-w-2xl text-[17px] leading-[1.7] pb-6" style={{ color: CREAM }}>{card.summary}</p>

      {/* Usage guidance — only for products passing the full standard */}
      {verdictStatus === "verified" && card.usageGuidance && (
        <div className="mb-12 pt-6" style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
          <Eyebrow color={LIME}>How to use it right</Eyebrow>
          <div className="mt-6">
            <GuidanceBlock guidance={card.usageGuidance} />
          </div>
        </div>
      )}

      {/* Badges */}
      {(card.pass_badges?.length > 0 || card.warn_badges?.length > 0 || card.info_badges?.length > 0) && (
        <div className="flex flex-wrap gap-2.5 pb-12">
          {(card.pass_badges || []).map((b) => (
            <span key={b} className="flex items-center gap-2 text-[12px] uppercase px-4 py-2 rounded-full" style={{ letterSpacing: "0.08em", border: `1px solid ${HAIR_DARK}`, color: LIME }}>
              <StatusDot color={LIME} />{b}
            </span>
          ))}
          {(card.warn_badges || []).map((b) => (
            <span key={b} className="flex items-center gap-2 text-[12px] uppercase px-4 py-2 rounded-full" style={{ letterSpacing: "0.08em", border: `1px solid ${HAIR_DARK}`, color: CORAL }}>
              <StatusDot color={CORAL} />{b}
            </span>
          ))}
          {(card.info_badges || []).map((b) => (
            <span key={b} className="flex items-center gap-2 text-[12px] uppercase px-4 py-2 rounded-full" style={{ letterSpacing: "0.08em", border: `1px solid ${HAIR_DARK}`, color: TEAL_SOFT }}>
              <StatusDot color={TEAL_SOFT} />{b}
            </span>
          ))}
        </div>
      )}

      {/* Pillars */}
      {card.pillars?.length > 0 && (
        <div className="pb-14">
          {card.pillars.map((p, i) => (
            <PillarRow key={p.name} name={p.name} score={p.score} max={p.max} note={p.note} index={i} />
          ))}
          <div style={{ borderTop: `1px solid ${HAIR_DARK}` }} />
        </div>
      )}

      {/* Key actives */}
      {card.keyActives?.length > 0 && (
        <div className="pb-14">
          <Eyebrow>Key actives</Eyebrow>
          <div className="mt-6 grid md:grid-cols-2 gap-x-12 gap-y-8">
            {card.keyActives.map((a, i) => (
              <div key={i}>
                <p className="text-[16px] pb-1.5" style={{ color: LIME }}>{a.name}</p>
                <p className="text-[14px] leading-relaxed" style={{ color: WARM }}>{a.function}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <div className="pb-14">
          <div className="flex items-baseline justify-between pb-2">
            <Eyebrow>Full ingredient list</Eyebrow>
            <span className="text-[13px]" style={{ color: WARM }}>{ingredients.length} ingredients</span>
          </div>
          {visible.map((ing, i) => (
            <div key={i} style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
              <button onClick={() => setOpenIngredient(openIngredient === i ? null : i)} className="w-full text-left py-3.5 flex items-center justify-between gap-6">
                <span className="flex items-center gap-3 text-[15px]" style={{ color: CREAM }}>
                  <StatusDot color={flagColor(ing.flag)} />{ing.name}
                </span>
                <span className="text-[16px] leading-none transition-transform duration-300" style={{ color: WARM, transform: openIngredient === i ? "rotate(45deg)" : "none", display: "inline-block" }}>+</span>
              </button>
              <AnimatePresence initial={false}>
                {openIngredient === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <p className="pb-4 pl-[18px] text-[14px] leading-relaxed max-w-2xl" style={{ color: WARM }}>{ing.note}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${HAIR_DARK}` }} />
          {ingredients.length > 8 && (
            <button
              onClick={() => setShowAllIngredients(!showAllIngredients)}
              className="mt-6 text-[13px] uppercase px-5 py-2.5 rounded-full transition-colors"
              style={{ letterSpacing: "0.1em", border: `1px solid ${HAIR_DARK}`, color: CREAM }}
            >
              {showAllIngredients ? "Show fewer" : `Show all ${ingredients.length}`}
            </button>
          )}
        </div>
      )}

      {/* India context */}
      {card.indiaContext && (
        <div className="pb-14">
          <Eyebrow>India context</Eyebrow>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.7]" style={{ color: CREAM }}>{card.indiaContext}</p>
        </div>
      )}

      {/* Sources */}
      {card.dataSource && (
        <div className="flex flex-wrap gap-x-12 gap-y-4 pt-2 pb-2 text-[13px]" style={{ color: WARM }}>
          <span>
            <span className="uppercase text-[11px]" style={{ letterSpacing: "0.1em" }}>INCI · </span>
            <span style={{ color: card.dataSource.inciFound ? LIME : CORAL }}>{card.dataSource.inciFound ? "Found" : "Partial"}</span>
            {card.dataSource.inciSource && ` · ${card.dataSource.inciSource}`}
          </span>
          {card.dataSource.rating != null && (
            <span><span className="uppercase text-[11px]" style={{ letterSpacing: "0.1em" }}>Rating · </span>{card.dataSource.rating}/5 · {card.dataSource.reviewCount}</span>
          )}
          {card.priceRange && (
            <span><span className="uppercase text-[11px]" style={{ letterSpacing: "0.1em" }}>Price · </span>{card.priceRange}</span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Comparison (dark) ─── */
function ComparisonSheet({ result }: { result: ComparisonResult }) {
  const isTie = result.winner === "tie";
  const products = [
    { key: "productA" as const, product: result.productA },
    { key: "productB" as const, product: result.productB },
  ];
  return (
    <div>
      <Eyebrow color={TEAL_SOFT}>Head to head{result.skinConcern ? ` · ${result.skinConcern}` : ""}</Eyebrow>
      <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 pt-10 pb-12">
        {products.map(({ key, product }) => {
          const isWinner = result.winner === key;
          const pVerified = product.score >= 75;
          return (
            <div key={key} className="min-w-0">
              <div className="flex items-center gap-4 pb-4 flex-wrap">
                <p className="font-display leading-none text-[32px] md:text-[40px] flex items-center gap-3" style={{ color: pVerified ? LIME : CORAL }}>
                  <span className="inline-block w-[10px] h-[10px] rounded-full flex-shrink-0" style={{ background: pVerified ? LIME : CORAL }} />
                  {pVerified ? "Verified" : "Not Verified"}
                </p>
                {isWinner && !isTie && (
                  <span className="text-[11px] uppercase px-3 py-1 rounded-full" style={{ letterSpacing: "0.1em", background: LIME, color: INK }}>Our pick</span>
                )}
              </div>
              <h3 className="font-display text-[24px] leading-tight pb-3" style={{ color: CREAM }}>{product.productName}</h3>
              <p className="text-[14px] leading-relaxed pb-5" style={{ color: WARM }}>{product.summary}</p>
              {product.pillars?.map((p) => {
                const pct = Math.round((p.score / p.max) * 100);
                const { word, col: pcol } = pillarStatus(pct);
                return (
                  <div key={p.name} className="py-2.5" style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
                    <div className="flex justify-between items-baseline text-[13px] pb-2">
                      <span style={{ color: CREAM }}>{p.name}</span>
                      <span className="uppercase text-[11px]" style={{ letterSpacing: "0.1em", color: pcol }}>{word}</span>
                    </div>
                    <div className="h-px w-full" style={{ background: HAIR_DARK }}>
                      <div className="h-[2px] -translate-y-[0.5px]" style={{ background: pcol, width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="max-w-2xl text-[18px] leading-[1.7]" style={{ color: CREAM }}>{result.verdict}</p>
    </div>
  );
}

/* ─── Expert answer (dark) ─── */
function AnswerSheet({ answer }: { answer: ExpertAnswer }) {
  const col = answer.verdict === "safe" ? LIME : answer.verdict === "avoid" ? CORAL : answer.verdict === "caution" ? CORAL : TEAL_SOFT;
  return (
    <div>
      <Eyebrow color={TEAL_SOFT}>The expert answer</Eyebrow>
      <h2 className="font-display mt-6 max-w-2xl text-[30px] md:text-[38px] leading-[1.2]" style={{ color: CREAM }}>{answer.question}</h2>
      <p className="mt-5 flex items-center gap-2.5 text-[13px] uppercase" style={{ letterSpacing: "0.1em", color: col }}>
        <StatusDot color={col} />{answer.verdictLabel}
      </p>
      <p className="mt-8 max-w-2xl text-[18px] leading-[1.7]" style={{ color: CREAM }}>{answer.text}</p>
      {answer.keyPoints?.length > 0 && (
        <div className="mt-10 max-w-2xl">
          {answer.keyPoints.map((point, i) => (
            <p key={i} className="py-4 text-[16px] leading-relaxed flex items-baseline gap-3" style={{ color: CREAM, borderTop: `1px solid ${HAIR_DARK}` }}>
              <StatusDot color={TEAL_SOFT} />{point}
            </p>
          ))}
          <div style={{ borderTop: `1px solid ${HAIR_DARK}` }} />
        </div>
      )}
      {answer.indiaContext && (
        <div className="mt-10">
          <Eyebrow>India context</Eyebrow>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.7]" style={{ color: CREAM }}>{answer.indiaContext}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ─── */
export default function ReviewPage() {
  const [query, setQuery] = useState("");
  const [claimCheck, setClaimCheck] = useState<ClaimCheckResult | null>(null);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [verdict, setVerdict] = useState<FinalVerdict | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [expertAnswer, setExpertAnswer] = useState<ExpertAnswer | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [phase, setPhase] = useState<"claims" | "scan" | null>(null);
  const [outOfScope, setOutOfScope] = useState(false);
  const [engineBusy, setEngineBusy] = useState(false);
  const [claimLayerDown, setClaimLayerDown] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  const [verifiedList, setVerifiedList] = useState<VerifiedProduct[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chatMessages, isChatting]);

  const loadVerified = useCallback(() => {
    fetch("/api/verified-products")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d?.products)) setVerifiedList(d.products); })
      .catch(() => { /* section simply stays hidden */ });
  }, []);

  useEffect(() => { loadVerified(); }, [loadVerified]);

  /* ── Analyze: Claim Check first, then deep scan ── */
  const analyze = useCallback(async (q?: string) => {
    const text = (q || query).trim();
    if (!text || isAnalyzing) return;

    setQuery(text);
    setIsAnalyzing(true);
    setOutOfScope(false);
    setEngineBusy(false);
    setClaimLayerDown(false);
    setClaimCheck(null);
    setScorecard(null);
    setVerdict(null);
    setComparison(null);
    setExpertAnswer(null);
    setChatMessages([]);

    // Progress ticker is cosmetic — the server runs ONE pipeline for the whole review
    const runClaims = !looksLikeComparison(text) && !looksLikeQuestion(text);
    const steps = runClaims ? [...CLAIM_STEPS, ...SCAN_STEPS] : SCAN_STEPS;
    setPhase(runClaims ? "claims" : "scan");
    let idx = 0;
    setStepIdx(0);
    const ticker = setInterval(() => {
      idx = Math.min(idx + 1, steps.length - 1);
      setStepIdx(idx);
      if (runClaims && idx >= CLAIM_STEPS.length) setPhase("scan");
    }, 5000);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      clearInterval(ticker);

      const openers: string[] = [];

      if (res.status === 503 || data?.error === "busy") {
        setEngineBusy(true);
        return;
      }
      if (data?.error || !data?.kind || data.kind === "out_of_scope") {
        setOutOfScope(true);
        return;
      }

      if (data.kind === "comparison" && data.comparison) {
        setComparison(data.comparison);
        const winnerCard = data.comparison.winner === "productB" ? data.comparison.productB : data.comparison.productA;
        openers.push(`${data.comparison.verdict}${winnerCard.chatOpener ? `\n\n${winnerCard.chatOpener}` : ""}`);
      } else if (data.kind === "answer" && data.answer) {
        setExpertAnswer(data.answer);
        if (data.answer.chatOpener) openers.push(data.answer.chatOpener);
      } else if (data.kind === "product") {
        if (data.claimCheck) {
          setClaimCheck(data.claimCheck as ClaimCheckResult);
          if (data.claimCheck.chatOpener) openers.push(data.claimCheck.chatOpener);
        }
        setClaimLayerDown(!!data.claimLayerDown);
        if (data.scorecard) {
          setScorecard(data.scorecard);
          if (data.scorecard.chatOpener) openers.push(data.scorecard.chatOpener);
        }
        if (data.verdict?.status && Array.isArray(data.verdict?.gates)) setVerdict(data.verdict as FinalVerdict);
        if (!data.claimCheck && !data.scorecard) { setOutOfScope(true); return; }
      }

      if (openers.length > 0) {
        setChatMessages([{ id: uid(), role: "assistant", content: openers.join("\n\n"), timestamp: new Date() }]);
      }
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } catch {
      clearInterval(ticker);
      setOutOfScope(true);
    } finally {
      clearInterval(ticker);
      setIsAnalyzing(false);
      setPhase(null);
      setQuery("");
      loadVerified(); // a Verified result may have just joined the registry
    }
  }, [query, isAnalyzing, loadVerified]);

  /* ── Chat ── */
  const sendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || isChatting) return;

    setChatInput("");
    const userMsg: ChatMessage = { id: uid(), role: "user", content: text, timestamp: new Date() };
    const aiId = uid();
    const aiMsg: ChatMessage = { id: aiId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true };
    setChatMessages((prev) => [...prev, userMsg, aiMsg]);
    setIsChatting(true);

    const history = chatMessages.filter((m) => !m.isStreaming).map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          scorecardContext: (claimCheck || scorecard)
            ? {
                ...(claimCheck ? { claimCheck: { productName: claimCheck.productName, brand: claimCheck.brand, integrityScore: claimCheck.integrityScore, integrityLabel: claimCheck.integrityLabel, claims: claimCheck.claims, redFlags: claimCheck.redFlags } } : {}),
                ...(scorecard ? { scorecard } : {}),
              }
            : (comparison ? { productA: comparison.productA, productB: comparison.productB, verdict: comparison.verdict, skinConcern: comparison.skinConcern } : null)
            ?? (expertAnswer ? { question: expertAnswer.question, answer: expertAnswer.text, verdict: expertAnswer.verdict } : null),
        }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setChatMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: acc, isStreaming: false } : m));
      }
    } catch {
      setChatMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: "Something went wrong. Try again.", isStreaming: false } : m));
    } finally {
      setIsChatting(false);
      setTimeout(() => chatInputRef.current?.focus(), 50);
    }
  }, [chatInput, isChatting, chatMessages, claimCheck, scorecard, comparison, expertAnswer]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); analyze(); }
  };
  const handleChatKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); }
  };

  const hasResult = claimCheck || scorecard || comparison || expertAnswer;
  const displayStep = phase === "claims"
    ? CLAIM_STEPS[Math.min(stepIdx, CLAIM_STEPS.length - 1)]
    : stepIdx >= CLAIM_STEPS.length
      ? SCAN_STEPS[Math.min(stepIdx - CLAIM_STEPS.length, SCAN_STEPS.length - 1)]
      : SCAN_STEPS[Math.min(stepIdx, SCAN_STEPS.length - 1)];

  return (
    <div style={{ background: "var(--color-white)" }}>

      {/* ═══ Hero — light, one idea ═══ */}
      <section className="relative overflow-hidden">
        {/* Creative — dropper, fading into the canvas */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[40%]" aria-hidden>
          <img src="/images/creatives/dropper-drop.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0.78) 32%, rgba(255,255,255,0.15) 78%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0) 20%)" }} />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 md:px-16 pt-10 md:pt-14 pb-14 md:pb-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
          <Eyebrow color={TEAL}>The Clean Sheet · Product review</Eyebrow>
          <h1 className="font-display mt-8 text-[44px] md:text-[64px] leading-[1.08] tracking-[-0.02em] text-[var(--color-charcoal)] max-w-3xl">
            Does it prove<br />what it promises?
          </h1>
          <p className="mt-6 text-[18px] leading-[28px] text-[var(--color-warm-gray)] max-w-xl">
            Paste a product link or type its name. Every marketing claim is checked
            against actual evidence, then the formula itself.
          </p>
        </motion.div>

        {/* Input — underline editorial style */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-10 max-w-2xl"
        >
          <div className="flex items-end gap-6" style={{ borderBottom: `1px solid ${isAnalyzing ? TEAL : INK}` }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Product link, name, or a question"
              disabled={isAnalyzing}
              className="flex-1 bg-transparent py-4 text-[18px] md:text-[20px] outline-none placeholder:text-[var(--color-warm-gray)] text-[var(--color-charcoal)]"
              style={{ caretColor: TEAL }}
            />
            <button
              onClick={() => analyze()}
              disabled={!query.trim() || isAnalyzing}
              className="pb-4 text-[14px] uppercase transition-colors disabled:opacity-30 flex-shrink-0"
              style={{ letterSpacing: "0.1em", color: TEAL }}
            >
              Review →
            </button>
          </div>

          {/* Suggestions — clean pills */}
          {!hasResult && !isAnalyzing && (
            <div className="flex flex-wrap gap-2.5 mt-8">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); analyze(s); }}
                  className="text-[13px] px-4 py-2 rounded-full transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  style={{ border: `1px solid ${HAIR_LIGHT}`, color: "var(--color-charcoal)" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Loading — calm single line */}
        <AnimatePresence>
          {isAnalyzing && !claimCheck && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-14 max-w-2xl"
            >
              <div className="h-px w-full overflow-hidden" style={{ background: HAIR_LIGHT }}>
                <motion.div
                  className="h-full w-1/3"
                  style={{ background: TEAL }}
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="flex items-baseline justify-between mt-5">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${phase}-${stepIdx}`}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="text-[15px]" style={{ color: "var(--color-charcoal)" }}
                  >
                    {displayStep}
                  </motion.p>
                </AnimatePresence>
                <p className="text-[12px] uppercase flex-shrink-0 pl-6" style={{ letterSpacing: "0.12em", color: WARM }}>
                  {phase === "claims" ? "Layer 1 · Claims" : "Layer 2 · Formula"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Engine busy */}
        {engineBusy && !isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-14 max-w-2xl">
            <p className="text-[18px] text-[var(--color-charcoal)] pb-2">The engine is at capacity right now.</p>
            <p className="text-[15px] leading-relaxed pb-6" style={{ color: WARM }}>
              Nothing wrong with your product. Our research layer is briefly rate-limited. Give it a minute and run the same review again.
            </p>
            <button
              onClick={() => { setEngineBusy(false); inputRef.current?.focus(); }}
              className="text-[13px] uppercase px-5 py-2.5 rounded-full transition-colors"
              style={{ letterSpacing: "0.1em", border: `1px solid ${INK}`, color: INK }}
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Out of scope */}
        {outOfScope && !isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-14 max-w-2xl">
            <p className="text-[18px] text-[var(--color-charcoal)] pb-2">That one is outside our lane.</p>
            <p className="text-[15px] leading-relaxed pb-6" style={{ color: WARM }}>
              The Clean Sheet reviews beauty and personal care only. Try a skincare product, a cosmetic ingredient, or a haircare brand.
            </p>
            <button
              onClick={() => { setOutOfScope(false); setQuery(""); inputRef.current?.focus(); }}
              className="text-[13px] uppercase px-5 py-2.5 rounded-full transition-colors"
              style={{ letterSpacing: "0.1em", border: `1px solid ${INK}`, color: INK }}
            >
              Try again
            </button>
          </motion.div>
        )}
        </div>
      </section>

      {/* ═══ Results — the dark sheet ═══ */}
      <div ref={resultsRef}>
        <AnimatePresence>
          {hasResult && (
            <motion.section
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ background: INK }}
            >
              <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-20 md:py-28">
                {claimLayerDown && !claimCheck && scorecard && (
                  <div className="mb-14 pb-6" style={{ borderBottom: `1px solid ${HAIR_DARK}` }}>
                    <p className="text-[14px] leading-relaxed max-w-2xl" style={{ color: WARM }}>
                      <span style={{ color: CORAL }}>Claim Check could not complete for this run</span> — the
                      evidence-research layer was briefly unavailable, so only the formula deep scan is shown.
                      Run the same review again in a minute, or paste the product URL, for the full claim sheet.
                    </p>
                  </div>
                )}
                {verdict && scorecard && !isAnalyzing && <VerdictPanel verdict={verdict} />}
                {claimCheck && <ClaimSheet result={claimCheck} />}
                {comparison && <ComparisonSheet result={comparison} />}
                {expertAnswer && <AnswerSheet answer={expertAnswer} />}

                {isAnalyzing && claimCheck && (
                  <div className="pt-20">
                    <div className="h-px w-full overflow-hidden" style={{ background: HAIR_DARK }}>
                      <motion.div className="h-full w-1/3" style={{ background: TEAL_SOFT }}
                        animate={{ x: ["-100%", "300%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
                    </div>
                    <p className="mt-5 text-[13px] uppercase" style={{ letterSpacing: "0.12em", color: WARM }}>
                      Layer 2 · Deep scan running
                    </p>
                  </div>
                )}

                {scorecard && <DeepScan card={scorecard} verdictStatus={verdict?.status} />}

                {claimCheck && !scorecard && !comparison && !expertAnswer && !isAnalyzing && (
                  <p className="pt-16 text-[13px]" style={{ color: WARM }}>
                    Deep-scan scorecard unavailable for this product — the claim verdicts above are complete.
                  </p>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Chat — back to light ═══ */}
      {hasResult && !isAnalyzing && (
        <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-20 md:py-28">
          <div className="max-w-2xl">
            <Eyebrow color={TEAL}>Ask the ingredient expert</Eyebrow>
            <h3 className="font-display mt-4 text-[28px] leading-[1.2] text-[var(--color-charcoal)] pb-10">
              Questions about this result?
            </h3>

            <div className="flex flex-col gap-6 pb-10">
              {chatMessages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "self-end max-w-[85%]" : "max-w-[92%]"}>
                  {m.role === "user" ? (
                    <p className="text-[15px] leading-relaxed px-5 py-3 rounded-2xl" style={{ background: "var(--color-surface-subtle)", color: INK, border: `1px solid ${HAIR_LIGHT}` }}>
                      {m.content}
                    </p>
                  ) : (
                    <div className="flex gap-4">
                      <span className="mt-2.5 flex-shrink-0"><StatusDot color={TEAL} /></span>
                      <p className="text-[15px] leading-[1.7] whitespace-pre-wrap" style={{ color: INK }}>
                        {m.isStreaming && !m.content ? "…" : m.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <div className="flex items-end gap-6" style={{ borderBottom: `1px solid ${INK}` }}>
              <input
                ref={chatInputRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKey}
                placeholder="Ask about ingredients, safety, your skin type"
                disabled={isChatting}
                className="flex-1 bg-transparent py-3.5 text-[16px] outline-none placeholder:text-[var(--color-warm-gray)] text-[var(--color-charcoal)]"
                style={{ caretColor: TEAL }}
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim() || isChatting}
                className="pb-3.5 text-[13px] uppercase transition-colors disabled:opacity-30 flex-shrink-0"
                style={{ letterSpacing: "0.1em", color: TEAL }}
              >
                Send →
              </button>
            </div>

            <button
              onClick={() => { setClaimCheck(null); setScorecard(null); setVerdict(null); setComparison(null); setExpertAnswer(null); setChatMessages([]); setQuery(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="mt-12 text-[13px] uppercase transition-colors hover:text-[var(--color-primary)]"
              style={{ letterSpacing: "0.1em", color: WARM }}
            >
              ← Review another product
            </button>
          </div>
        </section>
      )}

      {/* ═══ Verified products — the registry ═══ */}
      {!hasResult && !isAnalyzing && verifiedList.length > 0 && (
        <section style={{ background: INK }}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-20 md:py-24">
            <Eyebrow color={LIME}>Verified products</Eyebrow>
            <h2 className="font-display mt-4 text-[28px] md:text-[36px] leading-[1.15] max-w-2xl" style={{ color: CREAM }}>
              Reviewed. Passed the bar.<br />Recommended by The Clean Sheet.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] max-w-xl" style={{ color: WARM }}>
              Every product here cleared the claim check and the six-pillar scan.
              Open one for exact usage guidance: how long, how often, what to pair it with.
            </p>
            <div className="mt-12">
              <VerifiedList products={verifiedList} />
            </div>
            <Link
              href="/verified"
              className="mt-10 inline-block text-[13px] uppercase transition-colors hover:opacity-80"
              style={{ letterSpacing: "0.1em", color: LIME }}
            >
              View the full public registry →
            </Link>
          </div>
        </section>
      )}

      {/* ═══ Empty-state explainer ═══ */}
      {!hasResult && !isAnalyzing && !outOfScope && !engineBusy && (
        <section className="max-w-[1200px] mx-auto px-4 md:px-16 pb-24 md:pb-32">
          <div className="grid md:grid-cols-3 gap-x-12 gap-y-10 max-w-4xl">
            {[
              { n: "01", title: "Claims, checked", desc: "Every marketing claim is graded against real evidence: studies, certificates, registries. Nothing is assumed true." },
              { n: "02", title: "Formula, scanned", desc: "A six-pillar safety score built on the full INCI list, EU and India regulations, and formulation logic." },
              { n: "03", title: "Compare and ask", desc: "“X vs Y for oily skin?” or “Is this ingredient safe?” Answered with published science." },
            ].map(({ n, title, desc }) => (
              <motion.div key={n} {...rise} className="pt-6" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
                <p className="text-[13px] pb-4" style={{ color: TEAL }}>{n}</p>
                <h3 className="font-display text-[22px] text-[var(--color-charcoal)] pb-3">{title}</h3>
                <p className="text-[14px] leading-[1.7]" style={{ color: WARM }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
