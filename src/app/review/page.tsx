"use client";

/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Review
   Search + disambiguation + approved tiles. Results render in the
   brand-product page format via <ReviewResult /> (tier badge, no
   numeric scores).
──────────────────────────────────────────────────────────────── */

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProductScorecardView } from "@/components/scorecards/ProductScorecardView";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { runAnalysis } from "@/lib/analysis-engine";
import type { ProductReview, DerivedVerdict } from "@/lib/product-review-types";
import type { VerifiedProduct } from "@/lib/types";
import { track } from "@/lib/analytics";
import { useAuth } from "@/components/auth/AuthProvider";

const GATE_TITLE = "Sign in to analyse a product";
const GATE_SUBTITLE = "Create a free account to run a Clean Sheet analysis on any product.";

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* ─── Palette ─── */
const INK = "#282828";
const CREAM = "#fcf9f8";
const TEAL = "#248179";
const CORAL = "#fd6158";
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

/* ─── Branded monogram fallback (no image found, or the image fails to load) ───
   Retailer CDNs often block hotlinking or expire URLs, so a src that resolved at
   review time can still 404 in the browser. Fall back rather than show a broken
   image icon. */
function ProductImage({ src, brand }: { src?: string | null; brand: string }) {
  const [failed, setFailed] = useState(false);
  const initial = (brand || "?").trim().charAt(0).toUpperCase();
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={brand}
        referrerPolicy="no-referrer"
        loading="lazy"
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: INK }}>
      <span className="font-display" style={{ color: CREAM, fontSize: "3rem" }}>{initial}</span>
    </div>
  );
}

export default function ReviewPage() {
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [review, setReview] = useState<ProductReview | null>(null);
  const [verdict, setVerdict] = useState<DerivedVerdict | null>(null);
  const [error, setError] = useState<null | "scope" | "busy" | "fail">(null);
  const [disambig, setDisambig] = useState<{ query: string; options: { name: string }[] } | null>(null);
  const [approvedProducts, setApprovedProducts] = useState<VerifiedProduct[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  // Synchronous in-flight guard. `loading` state is set asynchronously, so two
  // fast triggers (a suggestion chip plus the button, or a double-click) could
  // both pass a `loading` check and fire duplicate POST /api/review calls.
  const inFlight = useRef(false);

  // Load the approved registry (reloads after a review, in case one just joined).
  useEffect(() => {
    fetch("/api/verified-products")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d?.products)) setApprovedProducts(d.products); })
      .catch(() => { /* section stays hidden */ });
  }, []); // static list - fetch once on mount, not on every review

  // Deep link: /review?q=<product> runs the review on arrival (repository hits return instantly).
  const autoRan = useRef(false);
  useEffect(() => {
    // Wait for auth to resolve before auto-running: a user returning from the
    // Google/email sign-in redirect must be recognised so their analysis fires,
    // rather than being bounced straight back to the login modal.
    if (authLoading || autoRan.current) return;
    autoRan.current = true;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q?.trim()) { setQuery(q); analyze(q); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const analyze = useCallback(async (q?: string) => {
    const text = (q ?? query).trim();
    if (!text || inFlight.current) return;
    // Analysing a product is a signed-in action. Bounce anonymous users to the
    // login modal, preserving the query so the analysis auto-runs on return.
    if (!user) {
      openLoginModal({
        returnPath: `/review?q=${encodeURIComponent(text)}`,
        title: GATE_TITLE,
        subtitle: GATE_SUBTITLE,
      });
      return;
    }
    inFlight.current = true;
    // Single capture point for every review-engine search: the hero bar on
    // /brands, direct /review searches, and the suggestion chips all land here.
    track("review_search_submitted", { query: text });
    setLoading(true); setError(null); setDisambig(null); setReview(null); setVerdict(null); setStepIdx(0);
    // Reset the address bar while a fresh search runs; success restores it to
    // the permanent /reviews/[slug] URL below.
    if (window.location.pathname.startsWith("/reviews/")) {
      window.history.replaceState(null, "", "/review");
    }

    const ticker = setInterval(() => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1)), 6000);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      // Session expired between page load and submit: re-prompt sign-in.
      if (res.status === 401) {
        openLoginModal({
          returnPath: `/review?q=${encodeURIComponent(text)}`,
          title: GATE_TITLE,
          subtitle: GATE_SUBTITLE,
        });
        return;
      }
      const data = await res.json();
      if (res.status === 503 || data?.error === "busy") { setError("busy"); return; }
      if (data?.type === "product-review" && data.review) {
        const reviewData = data.review as ProductReview;
        setReview(reviewData);
        setVerdict((data.verdict as DerivedVerdict) ?? null);
        // Point the address bar at the permanent, server-rendered page for this
        // review so it can be shared, bookmarked and reloaded. The route
        // (/reviews/[slug]) reads the same stored review this request persisted.
        if (reviewData.productSlug) {
          window.history.replaceState(null, "", `/reviews/${reviewData.productSlug}`);
        }
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      } else if (data?.type === "disambiguation" && Array.isArray(data.options) && data.options.length) {
        setDisambig({ query: data.query ?? text, options: data.options });
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
      inFlight.current = false;
    }
  }, [query, user, openLoginModal]);

  const approved = verdict?.status === "approved";

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      {/* ═══ Hero + input ═══ */}
      <section className="relative overflow-hidden">
        {/* Creative: slow skincare loop melting seamlessly into the cream canvas */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[40%] overflow-hidden" aria-hidden>
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/creatives/dropper-drop.jpg"
            className="w-full h-full object-cover"
            style={{ animation: "hero-video-in 1.8s ease-out both, hero-drift 26s ease-in-out infinite alternate" }}
          >
            <source src="/Videos/review-hero-web.mp4" type="video/mp4" />
          </video>
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
              actual ingredient list, then the formula itself. One clear <em>Clean Sheet</em> standing.
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
            <Link href="/brands" className="mt-6 inline-flex items-center gap-2 text-[15px]" style={{ color: TEAL }}>
              Or browse every product we&apos;ve reviewed <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Approved products showcase removed per request. */}

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

      {/* ═══ Did you mean? (ambiguous query) ═══ */}
      {disambig && !loading && (
        <div className="max-w-[1100px] mx-auto px-4 md:px-16 py-10">
          <p className="text-[13px] uppercase" style={{ letterSpacing: "0.12em", color: TEAL }}>Which one did you mean?</p>
          <p className="mt-2 text-[17px]" style={{ color: INK }}>
            &ldquo;{disambig.query}&rdquo; matches a few different products. Pick the exact one so the review uses the right ingredient list.
          </p>
          <div className="mt-6 flex flex-col gap-2 max-w-2xl">
            {disambig.options.map((o) => (
              <button key={o.name} onClick={() => { setQuery(o.name); analyze(o.name); }}
                className="text-left rounded-xl px-5 py-4 text-[16px] transition-colors hover:bg-black/[0.03]"
                style={{ border: `1px solid ${HAIR_LIGHT}`, color: INK }}>
                {o.name} <span aria-hidden style={{ color: TEAL }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Errors ═══ */}
      {error && !loading && (
        <div className="max-w-[1100px] mx-auto px-4 md:px-16 py-10">
          <p className="text-[16px]" style={{ color: INK }}>
            {error === "busy" ? "The engine is at capacity. Please try again in a minute."
              : error === "scope" ? "That doesn't look like a beauty or personal-care product."
              : "Couldn't complete the review. Please try again, or paste the product page link for a more reliable read."}
          </p>
        </div>
      )}

      {/* ═══ Results - THE one product-page format ═══ */}
      {review && verdict && !loading && (() => {
        const mapped = reviewToScorecard(review, verdict);
        return (
          <div ref={resultsRef}>
            <ProductScorecardView product={mapped.product} brand={mapped.brand} brandSlug={mapped.brandSlug} analysis={runAnalysis(review)} />
          </div>
        );
      })()}
    </div>
  );
}
