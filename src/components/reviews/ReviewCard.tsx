import { StarRating } from "./StarRating";

interface Props {
  rating: number;
  review_text: string;
  display_name: string;
  date: string;
}

export function ReviewCard({ rating, review_text, display_name, date }: Props) {
  return (
    <div
      className="bg-white rounded-xl border border-[#b0a8a4]/25 p-4 sm:p-5"
      style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <StarRating value={rating} size="sm" readonly />
        <span className="text-[11px] text-[#b0a8a4] flex-shrink-0">{date}</span>
      </div>
      <p className="text-sm text-[#282828] leading-relaxed mb-3">{review_text}</p>
      <p className="text-xs text-[#b0a8a4]">{display_name}</p>
    </div>
  );
}
