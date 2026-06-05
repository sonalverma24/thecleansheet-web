"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  display_name: string;
  date: string;
  created_at: string;
}

interface UserReview {
  id: string;
  rating: number;
  review_text: string;
  display_anonymously: boolean;
}

interface ReviewsData {
  reviews: Review[];
  average_rating: number | null;
  review_count: number;
  user_review: UserReview | null;
}

interface Props {
  productId: string; // e.g. "minimalist/niacinamide-10-face-serum"
}

const FONT_DISPLAY = "'Cooper BT', Georgia, serif";
const FONT = "Helvetica, 'Helvetica Neue', Arial, sans-serif";

export function ReviewsSection({ productId }: Props) {
  const { user, openLoginModal } = useAuth();
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Listen for "openReviewForm" event dispatched by HeroActions
  useEffect(() => {
    function handleOpen() {
      if (!user) {
        const returnPath = window.location.pathname + window.location.search;
        openLoginModal({ returnPath, openReviewOnReturn: true });
        return;
      }
      setFormOpen(true);
      setTimeout(() => {
        document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
    window.addEventListener("openReviewForm", handleOpen);
    return () => window.removeEventListener("openReviewForm", handleOpen);
  }, [user, openLoginModal]);

  // Auto-open form when redirected back after login with ?openReview=true
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("openReview") === "true") {
      setFormOpen(true);
      // Clean the URL so refreshing doesn't re-open the form
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
      setTimeout(() => {
        document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [user]);

  function handleAddReviewClick() {
    if (!user) {
      const returnPath = window.location.pathname;
      openLoginModal({ returnPath, openReviewOnReturn: true });
      return;
    }
    setFormOpen(true);
    setTimeout(() => {
      document.getElementById("reviews-form")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }

  function handleFormSuccess(updated: { average_rating: number; review_count: number }) {
    setFormOpen(false);
    setSuccessMessage(data?.user_review ? "Your review has been updated." : "Your review has been posted.");
    fetchReviews();
    // Notify HeroActions to refresh its rating display
    window.dispatchEvent(
      new CustomEvent("reviewsUpdated", {
        detail: { average_rating: updated.average_rating, review_count: updated.review_count },
      })
    );
    setTimeout(() => setSuccessMessage(""), 4000);
  }

  const hasReviews = (data?.review_count ?? 0) > 0;
  const userReview = data?.user_review ?? null;

  return (
    <section id="reviews" style={{ fontFamily: FONT }}>
      {/* Section heading */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
          <h2 className="text-sm text-[#282828]" style={{ fontFamily: FONT_DISPLAY }}>
            Consumer reviews
          </h2>
        </div>
        {hasReviews && !formOpen && (
          <button
            onClick={handleAddReviewClick}
            className="text-xs text-[#248179] border border-[#248179]/30 px-3 py-1.5 rounded-lg hover:bg-[#e3f1ef] transition-colors"
          >
            {userReview ? "Edit your review" : "Write a review"}
          </button>
        )}
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 text-sm text-[#248179] bg-[#e3f1ef] px-4 py-3 rounded-xl border border-[#248179]/20">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#b0a8a4]/25 p-8 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-[#248179]/30 border-t-[#248179] animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Aggregate rating block */}
          {hasReviews && (
            <div className="bg-white rounded-2xl border border-[#b0a8a4]/25 p-5 flex items-center gap-5">
              <div className="flex-shrink-0 text-center">
                <div
                  className="text-4xl text-[#282828] leading-none"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {data?.average_rating?.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mt-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="12" height="12" viewBox="0 0 18 18" fill="none" className="mx-px">
                      <path
                        d="M9 1.5l2.09 4.24 4.67.68-3.38 3.29.8 4.65L9 11.9l-4.18 2.46.8-4.65L2.24 6.42l4.67-.68z"
                        fill={(data?.average_rating ?? 0) >= s ? "#fd6158" : "#d1cac7"}
                      />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="h-10 w-px bg-[#b0a8a4]/20" />
              <div>
                <p className="text-sm text-[#282828]">
                  Based on {data?.review_count} {data?.review_count === 1 ? "review" : "reviews"}
                </p>
                {!formOpen && (
                  <button
                    onClick={handleAddReviewClick}
                    className="text-xs text-[#248179] mt-1 hover:underline"
                  >
                    {userReview ? "Edit your review" : "Write a review"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Review form */}
          {formOpen && (
            <div id="reviews-form">
              <ReviewForm
                productId={productId}
                existingReview={userReview}
                onSuccess={handleFormSuccess}
                onCancel={() => setFormOpen(false)}
              />
            </div>
          )}

          {/* Empty state */}
          {!hasReviews && !formOpen && (
            <div className="bg-white rounded-2xl border border-[#b0a8a4]/25 p-6 sm:p-8 text-center">
              <p className="text-sm text-[#282828] mb-1" style={{ fontFamily: FONT_DISPLAY }}>
                No reviews yet.
              </p>
              <p className="text-xs text-[#b0a8a4] mb-5">
                Be the first to review this product.
              </p>
              <button
                onClick={handleAddReviewClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#248179] text-white text-xs font-medium rounded-lg hover:bg-[#1d6e67] transition-colors"
              >
                Write a review
              </button>
            </div>
          )}

          {/* Review cards */}
          {hasReviews && (
            <div className="space-y-3">
              {data?.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  rating={review.rating}
                  review_text={review.review_text}
                  display_name={review.display_name}
                  date={review.date}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
