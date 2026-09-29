import type { EvidenceStatusTone } from "@/data/sunscreens/types";

export const STATUS_TONE_STYLES: Record<EvidenceStatusTone, { bg: string; text: string; dot: string }> = {
  partial: { bg: "#FFF7E8", text: "#8A5A00", dot: "#D69A1F" },
  available: { bg: "var(--color-teal-50)", text: "var(--color-teal-700)", dot: "var(--color-teal-500)" },
  unavailable: { bg: "var(--color-coral-50)", text: "var(--color-coral-700)", dot: "var(--color-coral-500)" },
};
