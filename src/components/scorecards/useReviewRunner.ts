"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { track } from "@/lib/analytics";
import {
  interpretReviewResponse,
  REVIEW_GATE_SUBTITLE,
  REVIEW_GATE_TITLE,
  REVIEW_RUN_PARAM,
  REVIEW_STEPS,
  type ReviewRunError,
} from "@/lib/review-run";

/* Runs a product review in place, then opens the product's permanent page
   (/reviews/[slug]). Existing reviews come back instantly; a new product takes
   about a minute, during which `phase` is "running" and `stepIdx` advances.
   Running a NEW analysis needs an account, so signed-out people get the sign-in
   modal and come back with ?review=<query>, which this hook runs on arrival. */

export type ReviewRunnerState =
  | { phase: "idle" }
  | { phase: "running"; query: string; stepIdx: number }
  | { phase: "disambig"; query: string; options: { name: string }[] }
  | { phase: "error"; error: ReviewRunError };

export function useReviewRunner({ autoRun = true }: { autoRun?: boolean } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const [state, setState] = useState<ReviewRunnerState>({ phase: "idle" });
  // Synchronous guard: two fast triggers (a chip plus the button) must not fire two analyses.
  const inFlight = useRef(false);

  const askToSignIn = useCallback(
    (text: string) => {
      openLoginModal({
        returnPath: `${pathname}?${REVIEW_RUN_PARAM}=${encodeURIComponent(text)}`,
        title: REVIEW_GATE_TITLE,
        subtitle: REVIEW_GATE_SUBTITLE,
      });
    },
    [openLoginModal, pathname],
  );

  const run = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || inFlight.current) return;
      if (!user) {
        askToSignIn(text);
        return;
      }
      inFlight.current = true;
      track("review_search_submitted", { query: text });
      setState({ phase: "running", query: text, stepIdx: 0 });
      const ticker = window.setInterval(() => {
        setState((s) => (s.phase === "running" ? { ...s, stepIdx: Math.min(s.stepIdx + 1, REVIEW_STEPS.length - 1) } : s));
      }, 6000);
      let navigating = false;
      try {
        const res = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text }),
        });
        const data = await res.json().catch(() => null);
        const outcome = interpretReviewResponse(res.status, data, text);
        if (outcome.kind === "done") {
          navigating = true;
          router.push(`/reviews/${outcome.slug}`);
        } else if (outcome.kind === "auth") {
          setState({ phase: "idle" });
          askToSignIn(text);
        } else if (outcome.kind === "disambig") {
          setState({ phase: "disambig", query: outcome.query, options: outcome.options });
        } else {
          setState({ phase: "error", error: outcome.error });
        }
      } catch {
        setState({ phase: "error", error: "fail" });
      } finally {
        window.clearInterval(ticker);
        // Keep the progress showing while the review page loads.
        if (!navigating) inFlight.current = false;
      }
    },
    [user, router, askToSignIn],
  );

  // Arriving with ?review=<query> (the sign-in round trip, or an old /review?q= link): run it once auth is known.
  const autoRan = useRef(false);
  useEffect(() => {
    if (!autoRun || authLoading || autoRan.current) return;
    autoRan.current = true;
    const url = new URL(window.location.href);
    const q = url.searchParams.get(REVIEW_RUN_PARAM);
    if (!q?.trim()) return;
    const id = window.setTimeout(() => {
      url.searchParams.delete(REVIEW_RUN_PARAM);
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      void run(q);
    }, 0);
    return () => {
      window.clearTimeout(id);
      autoRan.current = false;
    };
  }, [autoRun, authLoading, run]);

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  return { state, run, reset, busy: state.phase === "running" };
}
