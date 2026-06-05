"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";

interface ExistingReview {
  id: string;
  rating: number;
  review_text: string;
  display_anonymously: boolean;
}

interface Props {
  productId: string;
  existingReview: ExistingReview | null;
  onSuccess: (data: { average_rating: number; review_count: number }) => void;
  onCancel: () => void;
}

const FONT = "Helvetica, 'Helvetica Neue', Arial, sans-serif";

export function ReviewForm({ productId, existingReview, onSuccess, onCancel }: Props) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [text, setText] = useState(existingReview?.review_text ?? "");
  const [anonymous, setAnonymous] = useState(existingReview?.display_anonymously ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!existingReview;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) { setError("Please select a star rating."); return; }
    if (text.trim().length < 10) { setError("Review must be at least 10 characters."); return; }

    setSubmitting(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        rating,
        review_text: text.trim(),
        display_anonymously: anonymous,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    onSuccess({ average_rating: data.average_rating, review_count: data.review_count });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#faf7f2] rounded-xl border border-[#b0a8a4]/25 p-5 sm:p-6 space-y-5"
      style={{ fontFamily: FONT }}
    >
      <div>
        <p
          className="text-sm text-[#282828] mb-1"
          style={{ fontFamily: "'Cooper BT', Georgia, serif" }}
        >
          {isEdit ? "Edit your review" : "Write a review"}
        </p>
        <p className="text-xs text-[#b0a8a4]">
          {isEdit ? "Update your rating or review text below." : "Your experience helps others make better decisions."}
        </p>
      </div>

      {/* Star rating */}
      <div>
        <label className="block text-xs text-[#282828] font-medium mb-2">
          Your rating <span className="text-[#fd6158]">*</span>
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-[11px] text-[#b0a8a4] mt-1.5">
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
          </p>
        )}
      </div>

      {/* Review text */}
      <div>
        <label htmlFor="review-text" className="block text-xs text-[#282828] font-medium mb-2">
          Your review <span className="text-[#fd6158]">*</span>
        </label>
        <textarea
          id="review-text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What was your experience with this product? Mention texture, irritation, finish, repurchase intent, or anything that helped you decide."
          className="w-full px-4 py-3 rounded-xl border border-[#b0a8a4]/40 text-sm text-[#282828] placeholder-[#b0a8a4] focus:outline-none focus:border-[#248179] focus:ring-1 focus:ring-[#248179] transition-colors resize-none bg-white"
        />
        <p className="text-[11px] text-[#b0a8a4] mt-1">
          {text.trim().length}/10 minimum characters
        </p>
      </div>

      {/* Display option */}
      <div>
        <label className="block text-xs text-[#282828] font-medium mb-2.5">
          Post as
        </label>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-4">
          {[
            { label: "Post with my name", value: false },
            { label: "Post anonymously", value: true },
          ].map(({ label, value }) => (
            <label
              key={label}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  borderColor: anonymous === value ? "#248179" : "#b0a8a4",
                  backgroundColor: anonymous === value ? "#248179" : "transparent",
                }}
              >
                {anonymous === value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <input
                type="radio"
                name="display_option"
                className="sr-only"
                checked={anonymous === value}
                onChange={() => setAnonymous(value)}
              />
              <span className="text-xs text-[#282828]">{label}</span>
            </label>
          ))}
        </div>
        {anonymous && (
          <p className="text-[11px] text-[#b0a8a4] mt-2">
            Your name will appear as "Verified user". Your login is still recorded privately.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-[#fd6158] bg-[#ffe6e4] px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 sm:flex-none sm:min-w-[140px] px-5 py-2.5 rounded-xl bg-[#248179] text-white text-sm font-medium hover:bg-[#1d6e67] transition-colors disabled:opacity-50"
        >
          {submitting ? "Submitting..." : isEdit ? "Update review" : "Submit review"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl border border-[#b0a8a4]/40 text-[#282828] text-sm hover:bg-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
