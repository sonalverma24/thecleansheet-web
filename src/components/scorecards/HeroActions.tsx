"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

interface Props {
  productId: string; // "brandSlug/productSlug"
}

export function HeroActions({ productId }: Props) {
  const { user, openLoginModal } = useAuth();
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  // Fetch initial rating
  useEffect(() => {
    fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((data) => {
        setAverageRating(data.average_rating ?? null);
        setReviewCount(data.review_count ?? 0);
      })
      .catch(() => {});
  }, [productId]);

  // Listen for rating updates from ReviewsSection after a submission
  useEffect(() => {
    function onUpdate(e: Event) {
      const { average_rating, review_count } = (e as CustomEvent).detail;
      setAverageRating(average_rating);
      setReviewCount(review_count);
    }
    window.addEventListener("reviewsUpdated", onUpdate);
    return () => window.removeEventListener("reviewsUpdated", onUpdate);
  }, []);

  function handleAddReview() {
    if (user) {
      // Scroll to reviews section and open the form
      window.dispatchEvent(new Event("openReviewForm"));
      document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const returnPath = window.location.pathname;
      openLoginModal({ returnPath, openReviewOnReturn: true });
    }
  }

  function scrollToReviews(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleAddReview}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#248179] hover:bg-[#1e6b62] text-white text-xs py-2.5 rounded-xl transition-colors"
          style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
        >
          {user ? (reviewCount > 0 && /* user's own review check handled server-side */ false ? "Edit your review" : "Add Review") : "Add Review"}
        </button>
        <Link
          href="/brands"
          className="flex items-center justify-center gap-1.5 border border-[#efe9e0] bg-white hover:border-[#248179]/30 text-[#282828] text-xs py-2.5 px-4 rounded-xl transition-colors"
          style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
        >
          Compare
        </Link>
      </div>

      {/* Live star rating — clickable to scroll to reviews */}
      <button
        onClick={scrollToReviews}
        className="flex items-center gap-2 group text-left"
        aria-label="Scroll to reviews"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
          <path
            d="M9 1.5l2.09 4.24 4.67.68-3.38 3.29.8 4.65L9 11.9l-4.18 2.46.8-4.65L2.24 6.42l4.67-.68z"
            fill="#fd6158"
          />
        </svg>

        {reviewCount > 0 && averageRating !== null ? (
          <>
            <span
              className="text-sm text-[#282828]"
              style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
            >
              {averageRating.toFixed(1)}
            </span>
            <span
              className="text-xs text-[#b0a8a4] group-hover:text-[#248179] transition-colors"
              style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
            >
              from {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </>
        ) : (
          <span
            className="text-xs text-[#b0a8a4] group-hover:text-[#248179] transition-colors"
            style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
          >
            No reviews yet
          </span>
        )}
      </button>
    </div>
  );
}
