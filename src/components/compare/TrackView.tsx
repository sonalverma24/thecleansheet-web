"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Records that a comparison was shown. Draws nothing. (The old overlay sent this when it closed; the page sends it when it opens.) */
export default function TrackView({ slugs }: { slugs: string[] }) {
  const key = slugs.join(",");
  useEffect(() => {
    track("comparison_viewed", { slugs: key.split(",") });
  }, [key]);
  return null;
}
