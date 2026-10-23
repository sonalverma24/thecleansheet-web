"use client";
import { useState } from "react";
import { FlaskConical, ArrowRight } from "lucide-react";
import { ProductRequestForm } from "./ProductRequestForm";
import ReviewRunStatus from "./ReviewRunStatus";
import { useReviewRunner } from "./useReviewRunner";

interface NoResultsCardProps {
  query: string;
}

export function NoResultsCard({ query }: NoResultsCardProps) {
  const [showForm, setShowForm] = useState(false);
  const { state, run, busy } = useReviewRunner({ autoRun: false });

  return (
    <div className="col-span-full py-12 flex flex-col items-center text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-5">
        <FlaskConical size={24} className="text-teal-400" />
      </div>
      <h3 className="text-lg font-medium text-ink-900 mb-2">
        No scorecard for this yet
      </h3>
      <p className="text-sm text-ink-500 leading-relaxed mb-8">
        We don&apos;t have a scorecard for{" "}
        {query ? <strong className="text-ink-700">&ldquo;{query}&rdquo;</strong> : "this search"} yet.
        You can analyse it instantly with our free Product Analyser, or request a full evidence-based scorecard analysis.
      </p>

      {/* Primary CTA: runs the review here, then opens its page */}
      {query && (
        <button
          type="button"
          onClick={() => void run(query)}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-sm font-medium px-5 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-teal-900/20 mb-4"
        >
          <FlaskConical size={15} />
          {busy ? "Analysing…" : "Analyse this product for free"}
          <ArrowRight size={13} />
        </button>
      )}
      <ReviewRunStatus state={state} onPick={(name) => void run(name)} />

      {/* Secondary CTA */}
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-ink-500 hover:text-ink-700 underline underline-offset-2 transition-colors"
      >
        Request a full scorecard analysis instead
      </button>

      {showForm && (
        <ProductRequestForm
          defaultProductName={query}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
