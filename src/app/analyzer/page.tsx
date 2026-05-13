"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles, Send, Search, RotateCcw, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, Info, MessageSquare,
  Shield, FlaskConical, FileText, Globe, Zap, Eye,
  Star, Loader2, ExternalLink, Award
} from "lucide-react";
import type { Scorecard, ChatMessage, ComparisonResult, ExpertAnswer } from "@/lib/types";

/* ─── Helpers ─── */
function uid() { return Math.random().toString(36).slice(2); }

function scoreColor(s: number) {
  if (s >= 90) return "#16A34A";
  if (s >= 70) return "#2D9E72";
  if (s >= 50) return "#D97706";
  return "#DC2626";
}

function scoreLabel(s: number) {
  if (s >= 90) return { label: "Excellent", color: "text-safe-600", bg: "bg-safe-100", border: "border-safe-500/30" };
  if (s >= 70) return { label: "Good", color: "text-teal-700", bg: "bg-teal-100", border: "border-teal-300" };
  if (s >= 50) return { label: "Fair", color: "text-caution-600", bg: "bg-caution-100", border: "border-caution-500/40" };
  return { label: "Concern", color: "text-danger-600", bg: "bg-danger-100", border: "border-danger-500/30" };
}

function pillarIcon(name: string) {
  if (name.includes("Safety")) return Shield;
  if (name.includes("Irritation")) return AlertTriangle;
  if (name.includes("Disclosure")) return FileText;
  if (name.includes("Regulatory")) return Globe;
  if (name.includes("Efficacy")) return FlaskConical;
  if (name.includes("Transparency")) return Eye;
  return Zap;
}

function pillarBarColor(pct: number) {
  if (pct >= 80) return "bg-safe-500";
  if (pct >= 60) return "bg-teal-500";
  if (pct >= 40) return "bg-caution-500";
  return "bg-danger-500";
}

/* ─── Score Gauge ─── */
function ScoreGauge({ score }: { score: number }) {
  const r = 52, sw = 9;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const col = scoreColor(score);
  const tier = scoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="136" height="136" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={r} fill="none" stroke="#E8EDE9" strokeWidth={sw} />
        <circle
          cx="68" cy="68" r={r}
          fill="none"
          stroke={col}
          strokeWidth={sw}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 68 68)"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        <text x="68" y="62" textAnchor="middle" fontSize="30" fontWeight="800" fill="#0A1F16" fontFamily="var(--font-geist-sans)">{score}</text>
        <text x="68" y="79" textAnchor="middle" fontSize="11" fill="#5C7A66" fontFamily="var(--font-geist-sans)">/100</text>
      </svg>
      <span className={`inline-flex items-center text-sm font-medium px-4 py-1.5 rounded-full border ${tier.bg} ${tier.color} ${tier.border}`}>
        {tier.label}
      </span>
    </div>
  );
}

/* ─── Badge Row ─── */
function BadgeRow({
  items, icon: Icon, color, bg, border
}: {
  items: string[];
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((b, i) => (
        <span key={i} className={`inline-flex items-center gap-1.5 text-xs font-normal px-3 py-1.5 rounded-full border ${bg} ${color} ${border}`}>
          <Icon size={11} />
          {b}
        </span>
      ))}
    </div>
  );
}

/* ─── Ingredient Pill ─── */
function IngredientRow({ name, note, flag }: { name: string; note: string; flag: "ok" | "warn" | "info" }) {
  const [open, setOpen] = useState(false);
  const styles = {
    ok:   { dot: "bg-safe-500",    text: "text-safe-700",    bg: "bg-safe-50" },
    warn: { dot: "bg-caution-500", text: "text-caution-600", bg: "bg-caution-100/60" },
    info: { dot: "bg-teal-400",    text: "text-teal-600",    bg: "bg-teal-50" },
  }[flag];

  return (
    <button
      onClick={() => setOpen(!open)}
      className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors ${open ? styles.bg : "hover:" + styles.bg}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />
        <span className="text-sm font-medium text-ink-800 flex-1">{name}</span>
        {flag === "warn" && <AlertTriangle size={13} className="text-caution-500 flex-shrink-0" />}
        {open ? <ChevronUp size={13} className="text-ink-400 flex-shrink-0" /> : <ChevronDown size={13} className="text-ink-400 flex-shrink-0" />}
      </div>
      {open && <p className={`mt-1.5 pl-5 text-xs leading-relaxed ${styles.text}`}>{note}</p>}
    </button>
  );
}

/* ─── Full Scorecard ─── */
function ScorecardView({ card }: { card: Scorecard }) {
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const ingredients = card.ingredients || [];
  const visibleIngredients = showAllIngredients ? ingredients : ingredients.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* ── Hero card ── */}
      <div className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-lg shadow-teal-900/5">
        {/* Top gradient band */}
        <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-600 to-teal-800" />

        <div className="p-6 sm:p-8">
          {/* Product info + gauge */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
            <ScoreGauge score={card.score} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-normal text-teal-500 uppercase tracking-widest mb-1">{card.brand}</p>
              <h2 className="text-xl sm:text-2xl font-medium text-ink-950 leading-tight mb-2">{card.productName}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-ink-500">
                {card.priceRange && (
                  <span className="font-normal text-ink-700">{card.priceRange}</span>
                )}
                {card.productType && (
                  <span className="bg-teal-50 text-teal-600 border border-teal-200 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                    {card.productType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-ink-600 leading-relaxed text-sm sm:text-base mb-6 p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
            {card.summary}
          </p>

          {/* Badges */}
          {(card.pass_badges?.length > 0 || card.warn_badges?.length > 0 || card.info_badges?.length > 0) && (
            <div className="space-y-3">
              <BadgeRow items={card.pass_badges} icon={CheckCircle2} color="text-safe-700" bg="bg-safe-100" border="border-safe-500/30" />
              <BadgeRow items={card.warn_badges} icon={AlertTriangle} color="text-caution-600" bg="bg-caution-100" border="border-caution-500/40" />
              <BadgeRow items={card.info_badges} icon={Info} color="text-teal-600" bg="bg-teal-50" border="border-teal-200" />
            </div>
          )}

          {/* Disclaimer */}
          <p className="mt-5 text-[11px] text-ink-400 leading-relaxed">
Gives a clean sheet score based on publicly available data · Suggests science-backed safer alternatives
          </p>
        </div>
      </div>

      {/* ── Pillars ── */}
      {card.pillars?.length > 0 && (
        <div className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-teal-50">
            <h3 className="text-xs font-medium text-teal-600 uppercase tracking-widest">Score Breakdown</h3>
          </div>
          <div className="p-6 space-y-5">
            {card.pillars.map((p) => {
              const PIcon = pillarIcon(p.name);
              const pct = Math.round((p.score / p.max) * 100);
              const barCol = pillarBarColor(pct);
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-sm font-normal text-ink-700">
                      <PIcon size={14} className="text-teal-500" />
                      {p.name}
                    </span>
                    <span className="text-sm font-medium text-ink-900 tabular-nums">
                      {p.score}<span className="text-ink-400 font-normal text-xs">/{p.max}</span>
                    </span>
                  </div>
                  <div className="h-2 bg-teal-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barCol}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {p.note && (
                    <p className="mt-1 text-xs text-ink-500 leading-relaxed">{p.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Key Actives ── */}
      {card.keyActives?.length > 0 && (
        <div className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-teal-50">
            <h3 className="text-xs font-medium text-teal-600 uppercase tracking-widest">Key Actives</h3>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-3">
              {card.keyActives.map((a, i) => (
                <div key={i} className="bg-teal-50/70 rounded-2xl p-4 border border-teal-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Star size={13} className="text-teal-500 flex-shrink-0" />
                    <span className="text-sm font-normal text-ink-800">{a.name}</span>
                  </div>
                  <p className="text-xs text-ink-500 leading-relaxed">{a.function}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Ingredients ── */}
      {ingredients.length > 0 && (
        <div className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-teal-50 flex items-center justify-between">
            <h3 className="text-xs font-medium text-teal-600 uppercase tracking-widest">Full Ingredient List</h3>
            <div className="flex items-center gap-3 text-xs text-ink-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-safe-500" />Safe</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-caution-500" />Flag</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400" />Info</span>
            </div>
          </div>
          <div className="p-4 space-y-1">
            {visibleIngredients.map((ing, i) => (
              <IngredientRow key={i} name={ing.name} note={ing.note} flag={ing.flag} />
            ))}
          </div>
          {ingredients.length > 10 && (
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowAllIngredients(!showAllIngredients)}
                className="w-full flex items-center justify-center gap-2 text-teal-600 hover:text-teal-800 text-sm font-normal py-2.5 rounded-xl border border-teal-100 hover:bg-teal-50 transition-colors"
              >
                {showAllIngredients ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                {showAllIngredients ? "Show less" : `Show all ${ingredients.length} ingredients`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── India Context ── */}
      {card.indiaContext && (
        <div className="bg-gradient-to-br from-teal-800 to-teal-900 rounded-3xl p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🇮🇳</span>
            <h3 className="text-xs font-medium text-white uppercase tracking-widest">India Context</h3>
          </div>
          <p className="text-teal-100 text-sm leading-relaxed">{card.indiaContext}</p>
        </div>
      )}

      {/* ── Data Source ── */}
      {card.dataSource && (
        <div className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-teal-50">
            <h3 className="text-xs font-medium text-teal-600 uppercase tracking-widest">Research Sources</h3>
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-ink-400 mb-1">INCI Source</div>
              <div className={`font-medium ${card.dataSource.inciFound ? "text-safe-600" : "text-caution-600"}`}>
                {card.dataSource.inciFound ? "✓ Found" : "✗ Not found"} · {card.dataSource.inciSource}
              </div>
            </div>
            {card.dataSource.rating && (
              <div>
                <div className="text-xs text-ink-400 mb-1">User Rating</div>
                <div className="font-medium text-ink-800">
                  ⭐ {card.dataSource.rating}/5 · {card.dataSource.reviewCount}
                </div>
              </div>
            )}
            {card.dataSource.userSentiment && (
              <div className="sm:col-span-2">
                <div className="text-xs text-ink-400 mb-1">User Sentiment</div>
                <p className="text-ink-600 leading-relaxed">{card.dataSource.userSentiment}</p>
              </div>
            )}
            {card.dataSource.reviewPlatforms?.length > 0 && (
              <div className="sm:col-span-2">
                <div className="text-xs text-ink-400 mb-1">Reviewed on</div>
                <div className="flex flex-wrap gap-2">
                  {card.dataSource.reviewPlatforms.map((p, i) => (
                    <span key={i} className="bg-teal-50 text-teal-600 border border-teal-100 px-2.5 py-0.5 rounded-full text-xs font-medium">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Chat bubble ─── */
function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-teal-600 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] text-sm leading-relaxed">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-xl bg-teal-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles size={13} className="text-teal-200" />
      </div>
      <div className="bg-teal-50 border border-teal-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
        {msg.isStreaming && !msg.content ? (
          <div className="flex gap-1.5 items-center py-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        ) : msg.content}
      </div>
    </div>
  );
}

/* ─── Expert Answer View ─── */
function AnswerView({ answer }: { answer: ExpertAnswer }) {
  const verdictStyles = {
    safe:    { bg: "bg-safe-100",    border: "border-safe-500/30",    text: "text-safe-700",    icon: CheckCircle2 },
    caution: { bg: "bg-caution-100", border: "border-caution-500/40", text: "text-caution-600", icon: AlertTriangle },
    avoid:   { bg: "bg-danger-100",  border: "border-danger-500/30",  text: "text-danger-700",  icon: AlertTriangle },
    info:    { bg: "bg-teal-50",     border: "border-teal-200",       text: "text-teal-700",    icon: Info },
  }[answer.verdict];
  const VIcon = verdictStyles.icon;

  return (
    <div className="space-y-4">
      {/* Verdict card */}
      <div className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-lg shadow-teal-900/5">
        <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-600 to-teal-800" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center border ${verdictStyles.bg} ${verdictStyles.border}`}>
              <VIcon size={20} className={verdictStyles.text} />
            </div>
            <div>
              <p className="text-xs font-medium text-teal-500 uppercase tracking-widest mb-1">The Clean Sheet™ Verdict</p>
              <h2 className="text-lg font-medium text-ink-950 leading-tight">{answer.question}</h2>
              <span className={`inline-flex items-center mt-2 text-xs font-medium px-3 py-1 rounded-full border ${verdictStyles.bg} ${verdictStyles.text} ${verdictStyles.border}`}>
                {answer.verdictLabel}
              </span>
            </div>
          </div>

          <p className="text-ink-600 leading-relaxed text-sm mb-5 p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
            {answer.text}
          </p>

          {answer.keyPoints?.length > 0 && (
            <div className="space-y-2 mb-5">
              {answer.keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-ink-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0 mt-2" />
                  {point}
                </div>
              ))}
            </div>
          )}

          {answer.indiaContext && (
            <div className="bg-gradient-to-br from-teal-800 to-teal-900 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🇮🇳</span>
                <span className="text-xs font-medium text-white uppercase tracking-widest">India Context</span>
              </div>
              <p className="text-teal-100 text-sm leading-relaxed">{answer.indiaContext}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Comparison View ─── */
function ComparisonView({ result }: { result: ComparisonResult }) {
  const [expandA, setExpandA] = useState(false);
  const [expandB, setExpandB] = useState(false);

  const products = [
    { key: "productA" as const, product: result.productA, expanded: expandA, toggle: () => setExpandA((v) => !v) },
    { key: "productB" as const, product: result.productB, expanded: expandB, toggle: () => setExpandB((v) => !v) },
  ];

  const isTie = result.winner === "tie";

  return (
    <div className="space-y-4">
      {/* ── Winner card ── */}
      <div className="bg-gradient-to-br from-teal-800 to-teal-900 rounded-3xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={14} className="text-teal-300" />
            <span className="text-xs font-medium text-teal-300 uppercase tracking-widest">
              {isTie ? "It's a tie" : `Our pick for ${result.skinConcern}`}
            </span>
          </div>

          {/* Score comparison */}
          <div className="flex items-center gap-3 mb-5">
            {products.map(({ key, product }) => {
              const isWinner = result.winner === key;
              return (
                <div
                  key={key}
                  className={`flex-1 text-center p-3 rounded-2xl transition-all ${isWinner ? "bg-white/20" : "bg-white/5"}`}
                >
                  <div className={`text-4xl font-semibold ${isWinner ? "text-white" : "text-teal-300"}`}>
                    {product.score}
                  </div>
                  <div className="text-[10px] text-teal-200 font-normal mt-1 leading-tight">{product.brand}</div>
                  <div className="text-[10px] text-teal-300 leading-tight">{product.productName}</div>
                  {isWinner && !isTie && (
                    <div className="mt-1.5 text-[10px] font-medium text-teal-100 uppercase tracking-wide">✓ Winner</div>
                  )}
                </div>
              );
            })}
            <div className="text-teal-400 font-medium text-sm flex-shrink-0">vs</div>
          </div>

          <p className="text-teal-100 text-sm leading-relaxed">{result.verdict}</p>
        </div>
      </div>

      {/* ── Individual product cards ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        {products.map(({ key, product, expanded, toggle }) => {
          const isWinner = result.winner === key;
          const tier = scoreLabel(product.score);
          return (
            <div
              key={key}
              className={`bg-white rounded-3xl border overflow-hidden shadow-sm ${isWinner ? "border-teal-400" : "border-teal-100"}`}
            >
              {isWinner && <div className="h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600" />}
              <div className="p-5">
                {isWinner && !isTie && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Award size={11} className="text-teal-500" />
                    <span className="text-[10px] font-medium text-teal-500 uppercase tracking-wider">Winner</span>
                  </div>
                )}

                <p className="text-xs font-normal text-teal-500 mb-0.5">{product.brand}</p>
                <h3 className="font-medium text-ink-900 text-sm leading-tight mb-0.5">{product.productName}</h3>
                <p className="text-xs text-ink-400 mb-3">{product.priceRange}</p>

                {/* Score bar */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-semibold tabular-nums" style={{ color: scoreColor(product.score) }}>
                    {product.score}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 bg-teal-50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${product.score}%`, backgroundColor: scoreColor(product.score) }}
                      />
                    </div>
                    <div className={`text-[10px] mt-0.5 font-normal ${tier.color}`}>{tier.label}</div>
                  </div>
                </div>

                <p className="text-xs text-ink-600 leading-relaxed mb-3 line-clamp-2">{product.summary}</p>

                {/* Top badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {product.pass_badges.slice(0, 3).map((b, i) => (
                    <span key={i} className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-safe-100 text-safe-700 border border-safe-500/30">{b}</span>
                  ))}
                  {product.warn_badges.slice(0, 1).map((b, i) => (
                    <span key={i} className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-caution-100 text-caution-600 border border-caution-500/40">{b}</span>
                  ))}
                </div>

                <button
                  onClick={toggle}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-normal text-teal-600 hover:text-teal-800 py-2.5 rounded-xl border border-teal-100 hover:bg-teal-50 transition-colors"
                >
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {expanded ? "Hide full analysis" : "See full analysis"}
                </button>
              </div>

              {expanded && (
                <div className="border-t border-teal-50 p-4">
                  <ScorecardView card={product} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Suggestions ─── */
const SUGGESTIONS = [
  "Minimalist 10% Niacinamide Serum",
  "Cetaphil vs CeraVe for oily skin",
  "Is DMDM Hydantoin safe?",
  "Mamaearth Vitamin C Face Wash",
];

/* ─── Main Page ─── */
export default function AnalyzerPage() {
  const [query, setQuery] = useState("");
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [expertAnswer, setExpertAnswer] = useState<ExpertAnswer | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [outOfScope, setOutOfScope] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatting]);

  /* ─── Analyze ─── */
  const analyze = useCallback(async (q?: string) => {
    const text = (q || query).trim();
    if (!text || isAnalyzing) return;

    setQuery(text);
    setIsAnalyzing(true);
    setAnalyzeError(null);
    setOutOfScope(false);
    setScorecard(null);
    setComparison(null);
    setExpertAnswer(null);
    setChatMessages([]);

    const steps = [
      "Searching INCI database…",
      "Checking EU Cosmetics Regulation…",
      "Pulling pricing from Nykaa & Amazon…",
      "Reviewing user ratings…",
      "Applying Clean Sheet™ scoring framework…",
    ];
    let stepIdx = 0;
    setStatusMsg(steps[0]);
    const ticker = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setStatusMsg(steps[stepIdx]);
    }, 4000);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      clearInterval(ticker);

      if (data.type === "out_of_scope" || (!res.ok && !data.type)) {
        setOutOfScope(true);
        return;
      }
      if (data.error) {
        setOutOfScope(true);
        return;
      }
      if (data.type === "comparison" && data.comparison) {
        setComparison(data.comparison);
        const winnerCard = data.comparison.winner === "productB"
          ? data.comparison.productB
          : data.comparison.productA;
        const opener = `${data.comparison.verdict}${winnerCard.chatOpener ? `\n\n${winnerCard.chatOpener}` : ""}`;
        setChatMessages([{ id: uid(), role: "assistant", content: opener, timestamp: new Date() }]);
      } else if (data.type === "answer" && data.answer) {
        setExpertAnswer(data.answer);
        if (data.answer.chatOpener) {
          setChatMessages([{ id: uid(), role: "assistant", content: data.answer.chatOpener, timestamp: new Date() }]);
        }
      } else {
        const card = data.scorecard;
        // Guard: only accept a scorecard that has the minimum required fields
        if (card && typeof card.score === "number" && card.productName && Array.isArray(card.pillars) && card.pillars.length > 0) {
          setScorecard(card);
          if (card.chatOpener) {
            setChatMessages([{ id: uid(), role: "assistant", content: card.chatOpener, timestamp: new Date() }]);
          }
        } else {
          setOutOfScope(true);
        }
      }
    } catch {
      clearInterval(ticker);
      setOutOfScope(true);
    } finally {
      setIsAnalyzing(false);
      setStatusMsg(null);
    }
  }, [query, isAnalyzing]);

  /* ─── Chat ─── */
  const sendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || isChatting) return;

    setChatInput("");
    const userMsg: ChatMessage = { id: uid(), role: "user", content: text, timestamp: new Date() };
    const aiId = uid();
    const aiMsg: ChatMessage = { id: aiId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true };
    setChatMessages((prev) => [...prev, userMsg, aiMsg]);
    setIsChatting(true);

    const history = chatMessages
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          scorecardContext: scorecard
            ?? (comparison ? { productA: comparison.productA, productB: comparison.productB, verdict: comparison.verdict, skinConcern: comparison.skinConcern } : null)
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
        setChatMessages((prev) =>
          prev.map((m) => m.id === aiId ? { ...m, content: acc, isStreaming: false } : m)
        );
      }
    } catch {
      setChatMessages((prev) =>
        prev.map((m) => m.id === aiId ? { ...m, content: "Sorry, couldn't connect. Please try again.", isStreaming: false } : m)
      );
    } finally {
      setIsChatting(false);
    }
  }, [chatInput, isChatting, chatMessages, scorecard]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      analyze();
    }
  };

  const handleChatKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 to-white">

      {/* ── Header ── */}
      <section className="pt-14 pb-8 px-4">
        <div className="max-w-2xl mx-auto text-center relative">

          {/* Decorative molecule graphic */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-full pointer-events-none select-none" aria-hidden>
            <svg width="100%" height="72" viewBox="0 0 480 72" fill="none" xmlns="http://www.w3.org/2000/svg"
              className="opacity-30">
              {/* Bond lines */}
              {[
                [60,36,120,20],[120,20,180,40],[180,40,240,18],[240,18,300,36],
                [300,36,360,16],[360,16,420,34],[180,40,180,60],[300,36,300,58],
                [120,20,100,4],[360,16,375,4],
              ].map(([x1,y1,x2,y2],i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0d9488" strokeWidth="1.2" strokeDasharray="3 3"/>
              ))}
              {/* Nodes */}
              {[
                {cx:60,cy:36,r:4,fill:"#0d9488"},
                {cx:120,cy:20,r:5,fill:"#14b8a6"},
                {cx:180,cy:40,r:3.5,fill:"#0d9488"},
                {cx:180,cy:60,r:3,fill:"#5eead4"},
                {cx:240,cy:18,r:5,fill:"#0d9488"},
                {cx:300,cy:36,r:4,fill:"#14b8a6"},
                {cx:300,cy:58,r:3,fill:"#5eead4"},
                {cx:360,cy:16,r:5,fill:"#0d9488"},
                {cx:420,cy:34,r:3.5,fill:"#14b8a6"},
                {cx:100,cy:4,r:3,fill:"#5eead4"},
                {cx:375,cy:4,r:3,fill:"#5eead4"},
              ].map(({cx,cy,r,fill},i) => (
                <circle key={i} cx={cx} cy={cy} r={r} fill={fill} fillOpacity="0.6"/>
              ))}
              {/* Labels on key nodes */}
              {[
                {x:120,y:13,label:"C₁₂"},
                {x:240,y:11,label:"OH"},
                {x:360,y:9,label:"NH₂"},
              ].map(({x,y,label},i)=>(
                <text key={i} x={x} y={y} textAnchor="middle" fontSize="7" fill="#0d9488" fontFamily="monospace" fontWeight="600">{label}</text>
              ))}
            </svg>
          </div>

          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-600 text-xs font-normal px-4 py-1.5 rounded-full mb-5 relative z-10">
            <Sparkles size={12} />
            The Clean Sheet™ · Ask Clean
          </div>
          <h1 className="text-3xl sm:text-5xl font-medium text-ink-950 tracking-tight mb-3 relative z-10">
            What&apos;s really<br />in your product?
          </h1>
          <p className="text-ink-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed relative z-10">
            Analyse a product, compare two, or ask about any ingredient.
            India&apos;s most rigorous beauty science engine.
          </p>
        </div>
      </section>

      {/* ── Search ── */}
      <section className="px-4 pb-5">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none sm:left-5 sm:size-[18px]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Product name, ingredient, or a question…"
              className="w-full bg-white border-2 border-teal-100 focus:border-teal-400 rounded-2xl pl-10 pr-13 py-3.5 sm:pl-12 sm:pr-14 sm:py-4 text-ink-900 placeholder-ink-300 text-sm sm:text-base outline-none transition-colors shadow-sm shadow-teal-900/5"
              disabled={isAnalyzing}
            />
            <button
              onClick={() => analyze()}
              disabled={!query.trim() || isAnalyzing}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-200 text-white rounded-xl p-2 sm:p-2.5 transition-colors"
            >
              {isAnalyzing ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
            </button>
          </div>

          {/* Suggestions */}
          {!scorecard && !comparison && !expertAnswer && !isAnalyzing && (
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); analyze(s); }}
                  className="text-xs text-teal-600 bg-white border border-teal-200 hover:border-teal-400 hover:bg-teal-50 px-3 py-1.5 rounded-full transition-colors font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Analyzing State ── */}
      {isAnalyzing && (
        <section className="px-4 pb-10">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-teal-100 p-8 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-5">
                <Loader2 size={24} className="text-teal-600 animate-spin" />
              </div>
              <h3 className="font-medium text-ink-900 mb-2">Working on it…</h3>
              <p className="text-sm text-teal-600 font-medium animate-pulse">{statusMsg}</p>
              <p className="text-xs text-ink-400 mt-3">Searching INCI databases, scientific literature, and reviews</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Out of scope / error ── */}
      {(outOfScope || analyzeError) && !isAnalyzing && (
        <section className="px-4 pb-10">
          <div className="max-w-2xl mx-auto">
            <div className="bg-teal-50 border border-teal-200 rounded-3xl p-7 text-center">
              <p className="text-2xl mb-3">🧴</p>
              <p className="text-ink-900 font-normal text-base mb-2">
                This one&apos;s outside my lane
              </p>
              <p className="text-ink-500 text-sm leading-relaxed max-w-sm mx-auto">
                The Clean Sheet™ is built exclusively for beauty and personal care.
                Try asking about a skincare product, a cosmetic ingredient, or a haircare brand
                and I&apos;ll give you the full science.
              </p>
              <button
                onClick={() => { setOutOfScope(false); setAnalyzeError(null); setQuery(""); inputRef.current?.focus(); }}
                className="mt-5 inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-normal px-5 py-2.5 rounded-full transition-colors"
              >
                Try a beauty product →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Scorecard / Comparison / Expert Answer ── */}
      {(scorecard || comparison || expertAnswer) && !isAnalyzing && (
        <section className="px-4 pb-6">
          <div className="max-w-2xl mx-auto">

            {/* Reset button */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-ink-400">
                {comparison ? "Clean Sheet™ Comparison" : expertAnswer ? "Clean Sheet™ Expert Answer" : "Clean Sheet™ Transparency Scorecard"}
              </p>
              <button
                onClick={() => { setScorecard(null); setComparison(null); setExpertAnswer(null); setQuery(""); setChatMessages([]); }}
                className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 font-medium"
              >
                <RotateCcw size={12} />
                New search
              </button>
            </div>

            {comparison && <ComparisonView result={comparison} />}
            {expertAnswer && <AnswerView answer={expertAnswer} />}
            {scorecard && <ScorecardView card={scorecard} />}
          </div>
        </section>
      )}

      {/* ── Chat ── */}
      {(scorecard || comparison || expertAnswer) && !isAnalyzing && (
        <section className="px-4 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-sm">
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-teal-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-800 flex items-center justify-center">
                  <MessageSquare size={14} className="text-teal-200" />
                </div>
                <div>
                  <div className="text-sm font-medium text-ink-900">Ask the Ingredient Expert</div>
                  <div className="text-xs text-ink-400">Powered by The Clean Sheet™ Science Engine</div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-4 max-h-72 sm:max-h-96 overflow-y-auto">
                {chatMessages.map((m) => (
                  <ChatBubble key={m.id} msg={m} />
                ))}
                {isChatting && chatMessages[chatMessages.length - 1]?.role !== "assistant" && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-teal-800 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={13} className="text-teal-200" />
                    </div>
                    <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat input */}
              <div className="px-4 pb-4 border-t border-teal-50 pt-3">
                <div className="flex gap-2">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKey}
                    placeholder="Ask about ingredients, safety, skin type…"
                    className="flex-1 bg-teal-50 border border-teal-100 focus:border-teal-300 rounded-xl px-4 py-2.5 text-sm text-ink-800 placeholder-ink-400 outline-none transition-colors"
                    disabled={isChatting}
                  />
                  <button
                    onClick={sendChat}
                    disabled={!chatInput.trim() || isChatting}
                    className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-200 text-white rounded-xl px-4 py-2.5 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            {process.env.NEXT_PUBLIC_WHATSAPP_URL && process.env.NEXT_PUBLIC_WHATSAPP_URL !== "https://chat.whatsapp.com/YOUR_LINK_HERE" && (
              <div className="mt-4 bg-gradient-to-r from-teal-800 to-teal-900 rounded-3xl p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-white text-sm mb-0.5">Join the Clean Sheet™ Community</div>
                  <div className="text-teal-200 text-xs">1000+ members discussing ingredient safety, product reviews, and clean beauty in India.</div>
                </div>
                <a
                  href={process.env.NEXT_PUBLIC_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 bg-white text-teal-800 font-medium text-sm px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors flex items-center gap-1.5"
                >
                  Join <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Empty state footer ── */}
      {!scorecard && !comparison && !expertAnswer && !isAnalyzing && (
        <section className="px-4 pb-20 pt-3">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Shield, title: "Product Analysis", desc: "Score any beauty product across 6 safety pillars with real INCI data" },
                { icon: Globe, title: "Comparisons", desc: "Ask 'X or Y for my skin type?' and get a head-to-head verdict" },
                { icon: FlaskConical, title: "Ingredient Questions", desc: "Is this ingredient safe? Answered with EU, India & CIR science" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl border border-teal-100 p-4 sm:p-5 flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-3">
                    <Icon size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <div className="font-medium text-ink-900 text-sm mb-1">{title}</div>
                    <p className="text-xs text-ink-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
